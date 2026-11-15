import { and, eq, ne } from 'drizzle-orm';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import {
  checkoutOrdersTable,
  stripeWebhookEventsTable,
} from '@/lib/db/schema';
import { env } from '@/lib/env';
import {
  parseStripeWebhookEvent,
  type StripePaymentIntentLike,
  verifyStripeWebhookSignature,
} from '@/lib/stripe-webhooks';
import { formatMissingDatabaseConfigurationLogMessage } from '../../_shared/log-safety';

type WebhookOrderStatus =
  | 'payment_intent_failed'
  | 'payment_succeeded'
  | 'payment_canceled';

const isSupportedStripeEvent = (
  eventType: string
): eventType is
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled' =>
  eventType === 'payment_intent.succeeded' ||
  eventType === 'payment_intent.payment_failed' ||
  eventType === 'payment_intent.canceled';

const resolveWebhookStatus = (
  eventType: 'payment_intent.succeeded' | 'payment_intent.payment_failed' | 'payment_intent.canceled'
): WebhookOrderStatus => {
  if (eventType === 'payment_intent.succeeded') {
    return 'payment_succeeded';
  }

  if (eventType === 'payment_intent.canceled') {
    return 'payment_canceled';
  }

  return 'payment_intent_failed';
};

const resolveStripeErrorMessage = (
  paymentIntent: StripePaymentIntentLike,
  eventType: 'payment_intent.succeeded' | 'payment_intent.payment_failed' | 'payment_intent.canceled'
): string | null => {
  if (eventType === 'payment_intent.succeeded') {
    return null;
  }

  if (eventType === 'payment_intent.canceled') {
    return paymentIntent.cancellation_reason
      ? `Stripe cancellation: ${paymentIntent.cancellation_reason}`
      : 'Stripe canceled the payment intent.';
  }

  return paymentIntent.last_payment_error?.code
    ? `Stripe failure: ${paymentIntent.last_payment_error.code}`
    : 'Stripe reported a payment intent failure.';
};

const STRIPE_WEBHOOK_CONFIGURATION_MESSAGE =
  'Stripe webhook endpoint is not configured.';

const STRIPE_WEBHOOK_CONFIGURATION_LOG_MESSAGE =
  '[stripe-webhook] Webhook endpoint configuration missing';

/** The only order status a later event must never undo. Money has been captured. */
const STRIPE_TERMINAL_PAID_STATUS = 'payment_succeeded';

const STRIPE_STALE_TRANSITION_REJECTED_LOG =
  '[stripe-webhook] Refused to move a paid order back out of success';

const isTerminalPaidStatus = (status: unknown): boolean =>
  status === STRIPE_TERMINAL_PAID_STATUS;

export async function POST(request: Request): Promise<Response> {
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error(STRIPE_WEBHOOK_CONFIGURATION_LOG_MESSAGE);
    return Response.json(
      {
        received: false,
        message: STRIPE_WEBHOOK_CONFIGURATION_MESSAGE,
      },
      { status: 503 }
    );
  }

  const payload = await request.text();
  const signatureHeader = request.headers.get('stripe-signature');

  if (
    !verifyStripeWebhookSignature({
      payload,
      secret: webhookSecret,
      signatureHeader,
    })
  ) {
    return Response.json(
      {
        received: false,
        message: 'Invalid Stripe webhook signature.',
      },
      { status: 400 }
    );
  }

  const event = parseStripeWebhookEvent(payload);
  if (!event) {
    return Response.json(
      {
        received: false,
        message: 'Invalid Stripe webhook payload.',
      },
      { status: 400 }
    );
  }

  if (!isDatabaseConfigured()) {
    console.error(formatMissingDatabaseConfigurationLogMessage('stripe-webhook'), {
      eventId: event.id,
      eventType: event.type,
    });
    return Response.json(
      {
        received: false,
        message: 'Persistence is unavailable for Stripe reconciliation.',
      },
      { status: 503 }
    );
  }

  await ensureDatabaseReady();
  const db = getDb();

  const existingEvent = (
    await db
      .select()
      .from(stripeWebhookEventsTable)
      .where(eq(stripeWebhookEventsTable.id, event.id))
  )[0];

  if (existingEvent) {
    return Response.json(
      {
        received: true,
        duplicate: true,
      },
      { status: 200 }
    );
  }

  if (!isSupportedStripeEvent(event.type)) {
    return Response.json(
      {
        received: true,
        ignored: true,
      },
      { status: 200 }
    );
  }

  const paymentIntent = event.data.object as unknown as StripePaymentIntentLike;
  if (!paymentIntent || paymentIntent.object !== 'payment_intent' || !paymentIntent.id) {
    return Response.json(
      {
        received: false,
        message: 'Unsupported Stripe object payload.',
      },
      { status: 400 }
    );
  }

  let order = (
    await db
      .select()
      .from(checkoutOrdersTable)
      .where(eq(checkoutOrdersTable.stripePaymentIntentId, paymentIntent.id))
  )[0];

  if (!order && paymentIntent.metadata?.orderId) {
    order = (
      await db
        .select()
        .from(checkoutOrdersTable)
        .where(eq(checkoutOrdersTable.orderId, paymentIntent.metadata.orderId))
    )[0];
  }

  if (!order) {
    console.error('[stripe-webhook] No matching checkout order found', {
      eventId: event.id,
      eventType: event.type,
      paymentIntentId: paymentIntent.id,
      orderId: paymentIntent.metadata?.orderId,
    });

    return Response.json(
      {
        received: false,
        message: 'No matching checkout order found for Stripe event.',
      },
      { status: 500 }
    );
  }

  const nextStatus = resolveWebhookStatus(event.type);
  const lastErrorMessage = resolveStripeErrorMessage(paymentIntent, event.type);
  const paidAt = nextStatus === 'payment_succeeded' ? new Date() : null;

  // Monotonic guard. Stripe delivers out of order and at-least-once: a
  // `payment_intent.payment_failed` or `.canceled` can arrive seconds after the
  // `.succeeded` for the same intent. The `stripe_webhook_events` dedupe above does not
  // help, because a late event has a different event id. Without this the late event
  // would overwrite a captured order back to `payment_intent_failed` and null `paidAt`,
  // i.e. a paid order that the ledger and fulfilment pipeline both treat as unpaid.
  //
  // Two layers, because one is not enough:
  //   1. Read guard - `order` is the row read above, so the refusal is decided from the
  //      status actually stored, and the rejection is logged with the operator context.
  //   2. Write guard - the UPDATE also carries `status <> 'payment_succeeded'`, so a
  //      success event landing between the read and the write still cannot be undone.
  //
  // The event is still recorded in `stripe_webhook_events` on the refusal path: Stripe is
  // answered 200 and will not retry, and recording the decision means a later manual
  // replay is deduplicated instead of re-evaluated.
  if (isTerminalPaidStatus(order.status) && nextStatus !== STRIPE_TERMINAL_PAID_STATUS) {
    console.warn(STRIPE_STALE_TRANSITION_REJECTED_LOG, {
      eventId: event.id,
      eventType: event.type,
      orderId: order.orderId,
      paymentIntentId: paymentIntent.id,
      storedStatus: order.status,
      rejectedStatus: nextStatus,
    });

    await db
      .insert(stripeWebhookEventsTable)
      .values({
        id: event.id,
        eventType: event.type,
        stripePaymentIntentId: paymentIntent.id,
        orderId: order.orderId,
      })
      .onConflictDoNothing();

    return Response.json(
      {
        received: true,
        orderId: order.orderId,
        // The status the order actually keeps, not the one this event asked for.
        status: order.status,
        ignoredStaleTransition: true,
      },
      { status: 200 }
    );
  }

  await db
    .update(checkoutOrdersTable)
    .set({
      status: nextStatus,
      stripePaymentIntentId: paymentIntent.id,
      lastErrorMessage,
      paidAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(checkoutOrdersTable.orderId, order.orderId),
        nextStatus !== STRIPE_TERMINAL_PAID_STATUS
          ? ne(checkoutOrdersTable.status, STRIPE_TERMINAL_PAID_STATUS)
          : undefined
      )
    );

  await db
    .insert(stripeWebhookEventsTable)
    .values({
      id: event.id,
      eventType: event.type,
      stripePaymentIntentId: paymentIntent.id,
      orderId: order.orderId,
    })
    .onConflictDoNothing();

  console.info('[stripe-webhook] Reconciled checkout order', {
    eventId: event.id,
    eventType: event.type,
    orderId: order.orderId,
    paymentIntentId: paymentIntent.id,
    status: nextStatus,
  });

  return Response.json(
    {
      received: true,
      orderId: order.orderId,
      status: nextStatus,
    },
    { status: 200 }
  );
}
