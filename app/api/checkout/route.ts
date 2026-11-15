/**
 * POST /api/checkout
 * Creates an order intake record and, when enabled, prepares Stripe payment intent state.
 */

import { and, eq, gte } from 'drizzle-orm';
import { z } from 'zod';
import {
  getTrustedUnitPriceCents,
  resolveStripePaymentConfigurationMessage,
  resolveStripePaymentIntentFailureMessage,
} from '@/app/api/checkout/checkout-pricing';
import {
  buildRequestFingerprint,
  recentSubmissionThreshold,
} from '@/app/api/_shared/fingerprints';
import { ensureDatabaseReady, getDb, isDatabaseConfigured } from '@/lib/db/client';
import { productById } from '@/content/products';
import {
  checkoutOrdersTable,
  type CheckoutOrderItemRecord,
  type CheckoutShippingRecord,
} from '@/lib/db/schema';
import { env } from '@/lib/env';
import {
  dispatchIntakeEventToN8n,
  type IntakeDispatchResult,
} from '@/lib/integrations/n8n';
import { syncAndNotifySubscriberViaNovu } from '@/lib/integrations/novu';
import { syncPersonAndFollowUpToTwenty } from '@/lib/integrations/twenty';
import { fetchWithTimeout } from '../_shared/http';
import { appendIntakeWorkflowSyncDelayNotice } from '../_shared/intake-handoff';
import {
  buildDirectContactFallbackMessage,
  logIntakeDurabilityAlarm,
  resolveIntakeDurability,
  sendIntakeNotificationEmail,
} from '../_shared/intake-durability';
import {
  formatMissingDatabaseConfigurationLogMessage,
  summarizeErrorForOperationalLog,
} from '../_shared/log-safety';
import { consumeRateLimit, createRateLimitResponse } from '../_shared/rate-limit';
import { createSpamGateResponse, resolveSpamGate } from '../_shared/spam-gate';
import {
  createDistributedRateLimitResponse,
  consumeDistributedRateLimit,
} from '../_shared/distributed-rate-limit';
import { readJsonBody, sanitizeText, validationErrorResponse } from '../_shared/validation';

interface OrderItem {
  id: string;
  quantity: number;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

interface CheckoutRequest {
  items: OrderItem[];
  shipping: ShippingAddress;
  paymentMethod: 'card' | 'bank_transfer' | 'financing';
  intendedUseAttested: true;
  supportOnlyAcknowledged: true;
  privacyAcknowledged: true;
}

interface CheckoutResponse {
  success: boolean;
  message: string;
  orderId?: string;
  clientSecret?: string;
}

type CheckoutOrderStatus =
  | 'pending_card_configuration'
  | 'pending_payment_intent'
  | 'payment_intent_failed'
  | 'payment_intent_created'
  | 'payment_succeeded'
  | 'payment_canceled'
  | 'awaiting_offline_payment'
  | 'awaiting_availability_confirmation';


const CHECKOUT_AREA = 'checkout';

const COMMON_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'googlemail.com',
  'hotmail.com',
  'icloud.com',
  'interia.pl',
  'o2.pl',
  'outlook.com',
  'proton.me',
  'protonmail.com',
  'wp.pl',
  'yahoo.com',
]);


function inferCompanyNameFromEmail(email: string): string | undefined {
  const domain = email.trim().toLowerCase().split('@')[1];

  if (!domain || COMMON_EMAIL_DOMAINS.has(domain)) {
    return undefined;
  }

  return domain;
}

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string().trim().min(1, 'Invalid item in cart.'),
        name: z.string().trim().optional(),
        price: z.number().optional(),
        quantity: z
          .number()
          .int()
          .min(1, 'Invalid item quantity.')
          .max(100, 'Invalid item quantity.'),
      })
    )
    .min(1, 'Cart is empty.'),
  shipping: z.object({
    firstName: z.string().trim().min(1, 'Full name is required.'),
    lastName: z.string().trim().min(1, 'Full name is required.'),
    email: z.string().trim().email('Valid email is required.'),
    phone: z.string().trim().max(30).optional(),
    address: z.string().trim().min(1, 'Street address is required.').max(200),
    city: z.string().trim().min(1, 'City is required.').max(100),
    postalCode: z.string().trim().min(1, 'Postal code is required.').max(20),
    country: z.string().trim().min(1).max(50),
  }),
  paymentMethod: z.enum(['card', 'bank_transfer', 'financing']),
  // EU MDR Article 7 support-only boundary. The client has always rendered an
  // intended-use checkbox and shipped it to analytics, but this route accepted the
  // order without it, so the gate existed at no layer a caller could not skip by
  // posting JSON directly. All three are literal `true`: a boolean, a string, a
  // truthy number and an absent key are all rejected.
  intendedUseAttested: z.literal(true, {
    error: 'Intended-use confirmation is required.',
  }),
  supportOnlyAcknowledged: z.literal(true, {
    error: 'Wellness-support, not medical care, must be acknowledged before ordering.',
  }),
  // Checkout collects a full postal address and forwards it to n8n, Twenty and
  // Novu, so it needs the same explicit privacy acknowledgement that
  // /api/contact and /api/newsletter already require.
  privacyAcknowledged: z.literal(true, {
    error: 'Privacy acknowledgement is required.',
  }),
}) satisfies z.ZodType<CheckoutRequest>;

/**
 * The catalogue product behind each trusted cart id.
 *
 * The payment path already joins cart ids to catalogue products through this exact
 * hand-written map in `app/api/checkout/checkout-pricing.ts:82`, because the two id
 * namespaces do not line up by shape. It is repeated here rather than shared so this
 * route keeps its own join auditable, and an unmapped id resolves to `undefined`
 * below, which the gate reads as NOT confirmed.
 */
const CHECKOUT_CART_ID_TO_CATALOGUE_PRODUCT_ID: Record<string, string> = {
  'tech-hbot': 'hbot-st1700',
  'tech-hydrogen': 'h2-hop450',
};

/**
 * Whether every line in the cart may be ordered without a human confirming
 * availability first.
 *
 * `content/products.ts` publishes both purchasable products as
 * `availabilityStatus: 'available_on_request'` with the note "Availability is
 * confirmed by Hylono support before quote, checkout, rental dispatch, or
 * installation planning." That promise was never honoured: this route created a live
 * Stripe PaymentIntent and returned a `clientSecret` guarded by nothing but
 * `paymentMethod === 'card'` and the presence of the Stripe key.
 *
 * Fail-closed on purpose. `in_stock` is the only status that means the site itself
 * vouches for stock; `available_on_request`, `out_of_stock`, `discontinued` and an
 * unmapped id all require a human. See the column reported in the handoff for
 * letting support record that confirmation.
 */
const isCheckoutAvailabilityConfirmed = (cartItemIds: string[]): boolean =>
  cartItemIds.every((cartItemId) => {
    const productId =
      CHECKOUT_CART_ID_TO_CATALOGUE_PRODUCT_ID[cartItemId.trim().toLowerCase()];

    return productId ? productById[productId]?.availabilityStatus === 'in_stock' : false;
  });

/**
 * Customer-facing copy for the availability gate.
 *
 * Deliberately free of the customer email: `resolveForwardedActionMessage` in
 * `src/actions/formActions.ts` replaces any forwarded message containing an address
 * with a generic failure string, so an email here would reach the browser as
 * "Checkout could not be submitted".
 */
const buildAwaitingAvailabilityMessage = (orderId: string): string =>
  `Order ${orderId} is recorded and awaiting availability confirmation from Hylono support. No payment has been taken. Hylono support will confirm availability and local conditions with you before any payment is collected.`;

const AVAILABILITY_CONFIRMATION_PENDING_MESSAGE =
  'Availability must be confirmed by Hylono support before payment is collected.';

const CHECKOUT_RATE_LIMIT = {
  bucket: 'checkout',
  limit: 10,
  windowMs: 10 * 60 * 1000,
} as const;

const buildCheckoutRequestFingerprint = (
  items: CheckoutOrderItemRecord[],
  shipping: CheckoutShippingRecord,
  paymentMethod: CheckoutRequest['paymentMethod']
): string =>
  buildRequestFingerprint({
    items: items
      .slice()
      .sort((left, right) => left.id.localeCompare(right.id)),
    paymentMethod,
    shipping,
  });

const buildStripeIdempotencyKey = (orderId: string): string => `checkout:${orderId}`;


async function createStripePaymentIntent(input: {
  orderId: string;
  totalCents: number;
  customerEmail: string;
  stripeSecretKey: string;
}): Promise<{
  clientSecret: string;
  paymentIntentId: string;
}> {
  const stripeResponse = await fetchWithTimeout(
    'https://api.stripe.com/v1/payment_intents',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${input.stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': buildStripeIdempotencyKey(input.orderId),
      },
      body: new URLSearchParams({
        amount: String(input.totalCents),
        currency: 'pln',
        'metadata[orderId]': input.orderId,
        'metadata[customerEmail]': input.customerEmail,
        receipt_email: input.customerEmail,
        description: `Hylono Order ${input.orderId}`,
      }),
    }
  );

  if (!stripeResponse.ok) {
    await stripeResponse.text();
    throw new Error(`stripe_status=${stripeResponse.status}`);
  }

  const paymentIntent = (await stripeResponse.json()) as {
    client_secret?: string;
    id?: string;
  };

  if (!paymentIntent.id || !paymentIntent.client_secret) {
    throw new Error('Stripe returned an incomplete PaymentIntent payload.');
  }

  return {
    paymentIntentId: paymentIntent.id,
    clientSecret: paymentIntent.client_secret,
  };
}

export async function POST(request: Request): Promise<Response> {
  try {
    const rateLimitState = consumeRateLimit(request, CHECKOUT_RATE_LIMIT);
    if (!rateLimitState.allowed) {
      return createRateLimitResponse(
        rateLimitState,
        'Too many checkout attempts. Please wait a few minutes and try again.'
      );
    }

    // Second layer: the limit that holds across serverless instances. Fails open.
    const distributedRateLimit = await consumeDistributedRateLimit(
      request,
      CHECKOUT_AREA
    );
    if (!distributedRateLimit.allowed) {
      return createDistributedRateLimitResponse(
        distributedRateLimit,
        'Too many checkout attempts. Please wait a few minutes and try again.'
      );
    }

    const rawBody = await readJsonBody(request);

    // Evaluated on the raw body: the schema strips unknown keys and would discard the
    // honeypot decoy before it could be read.
    const spamGate = await resolveSpamGate({
      request,
      rawBody,
      area: CHECKOUT_AREA,
    });
    if (spamGate.blocked) {
      return createSpamGateResponse();
    }

    const parsed = checkoutSchema.safeParse(rawBody);

    if (!parsed.success) {
      return validationErrorResponse(parsed.error);
    }

    const {
      items,
      shipping,
      paymentMethod,
      intendedUseAttested,
      supportOnlyAcknowledged,
      privacyAcknowledged,
    } = parsed.data;

    const sanitizedShipping: CheckoutShippingRecord = {
      firstName: sanitizeText(shipping.firstName, 50),
      lastName: sanitizeText(shipping.lastName, 50),
      email: sanitizeText(shipping.email, {
        maxLength: 254,
        context: 'email',
      }),
      phone: shipping.phone
        ? sanitizeText(shipping.phone, {
            maxLength: 30,
            context: 'phone',
          })
        : undefined,
      address: sanitizeText(shipping.address, 200),
      city: sanitizeText(shipping.city, 100),
      postalCode: sanitizeText(shipping.postalCode, 20),
      country: sanitizeText(shipping.country ?? 'Poland', 50),
    };
    const inferredCompanyName = inferCompanyNameFromEmail(sanitizedShipping.email);

    const trustedItems = items.map((item) => {
      const unitPriceCents = getTrustedUnitPriceCents(item.id);

      if (!unitPriceCents) {
        return null;
      }

      return {
        id: item.id,
        quantity: item.quantity,
        unitPriceCents,
      } satisfies CheckoutOrderItemRecord;
    });

    if (trustedItems.some((item) => item === null)) {
      return Response.json(
        {
          success: false,
          message:
            'One or more cart items are invalid. Please refresh your cart and try again.',
        } satisfies CheckoutResponse,
        { status: 400 }
      );
    }

    const resolvedItems = trustedItems.filter(
      (item): item is CheckoutOrderItemRecord => Boolean(item)
    );

    const totalCents = resolvedItems.reduce(
      (sum, item) => sum + item.unitPriceCents * item.quantity,
      0
    );

    const availabilityConfirmed = isCheckoutAvailabilityConfirmed(
      resolvedItems.map((item) => item.id)
    );

    if (!isDatabaseConfigured()) {
      console.error(formatMissingDatabaseConfigurationLogMessage(CHECKOUT_AREA));

      // The availability gate runs ahead of every payment route, including this
      // database-less branch, so no order can be opened for a product the site has
      // not itself vouched for. There is no order row to write here, so the
      // notification email is the record - the same durability contract the offline
      // path below already uses.
      if (!availabilityConfirmed) {
        const pendingOrderId = `HYL-${Date.now().toString(36).toUpperCase()}`;
        const pendingNotification = await sendIntakeNotificationEmail({
          area: CHECKOUT_AREA,
          reference: pendingOrderId,
          subject: 'order request (awaiting availability confirmation)',
          text: [
            `Order: ${pendingOrderId}`,
            `Payment method: ${paymentMethod}`,
            `State: awaiting availability confirmation by support`,
            `Reason: ${AVAILABILITY_CONFIRMATION_PENDING_MESSAGE}`,
            `Customer: ${sanitizedShipping.firstName} ${sanitizedShipping.lastName} <${sanitizedShipping.email}>`,
            `Phone: ${sanitizedShipping.phone ?? 'N/A'}`,
            `Address: ${sanitizedShipping.address}, ${sanitizedShipping.postalCode} ${sanitizedShipping.city}, ${sanitizedShipping.country}`,
            `Total (minor units): ${totalCents}`,
            '',
            `Items: ${resolvedItems.map((item) => `${item.id} x${item.quantity} @ ${item.unitPriceCents}`).join(', ')}`,
          ].join('\n'),
          replyTo: sanitizedShipping.email,
          isDatabaseFallback: true,
        });
        const pendingOutcome = resolveIntakeDurability({
          persistence:
            pendingNotification === 'sent' ? 'email_fallback' : 'none',
          notification: pendingNotification,
        });

        logIntakeDurabilityAlarm({
          area: CHECKOUT_AREA,
          reference: pendingOrderId,
          persistence: pendingOutcome.persistence,
          notification: pendingOutcome.notification,
        });

        if (!pendingOutcome.accepted) {
          return Response.json(
            {
              success: false,
              message: buildDirectContactFallbackMessage(),
            } satisfies CheckoutResponse,
            { status: pendingOutcome.status }
          );
        }

        return Response.json(
          {
            success: true,
            message: buildAwaitingAvailabilityMessage(pendingOrderId),
            orderId: pendingOrderId,
          } satisfies CheckoutResponse,
          { status: 202 }
        );
      }

      // Card payments are refused outright without a database row: a PaymentIntent that
      // cannot be reconciled to an order risks charging a customer with no record of it.
      if (paymentMethod === 'card') {
        logIntakeDurabilityAlarm({
          area: CHECKOUT_AREA,
          reference: 'unassigned',
          persistence: 'none',
          notification: 'not_configured',
        });

        return Response.json(
          {
            success: false,
            message: buildDirectContactFallbackMessage(),
          } satisfies CheckoutResponse,
          { status: 503 }
        );
      }

      // Offline payment methods move no money online, so the order request is treated
      // like any other lead and preserved through the notification email.
      const fallbackOrderId = `HYL-${Date.now().toString(36).toUpperCase()}`;
      const fallbackNotification = await sendIntakeNotificationEmail({
        area: CHECKOUT_AREA,
        reference: fallbackOrderId,
        subject: `order request (${paymentMethod})`,
        text: [
          `Order: ${fallbackOrderId}`,
          `Payment method: ${paymentMethod}`,
          `Customer: ${sanitizedShipping.firstName} ${sanitizedShipping.lastName} <${sanitizedShipping.email}>`,
          `Phone: ${sanitizedShipping.phone ?? 'N/A'}`,
          `Address: ${sanitizedShipping.address}, ${sanitizedShipping.postalCode} ${sanitizedShipping.city}, ${sanitizedShipping.country}`,
          `Total (minor units): ${totalCents}`,
          '',
          `Items: ${resolvedItems.map((item) => `${item.id} x${item.quantity} @ ${item.unitPriceCents}`).join(', ')}`,
        ].join('\n'),
        replyTo: sanitizedShipping.email,
        isDatabaseFallback: true,
      });
      const outcome = resolveIntakeDurability({
        persistence: fallbackNotification === 'sent' ? 'email_fallback' : 'none',
        notification: fallbackNotification,
      });

      logIntakeDurabilityAlarm({
        area: CHECKOUT_AREA,
        reference: fallbackOrderId,
        persistence: outcome.persistence,
        notification: outcome.notification,
      });

      if (!outcome.accepted) {
        return Response.json(
          {
            success: false,
            message: buildDirectContactFallbackMessage(),
          } satisfies CheckoutResponse,
          { status: outcome.status }
        );
      }

      return Response.json(
        {
          success: true,
          message: `Order ${fallbackOrderId} received. We will contact you at ${sanitizedShipping.email} with payment instructions.`,
          orderId: fallbackOrderId,
        } satisfies CheckoutResponse,
        { status: outcome.status }
      );
    }

    await ensureDatabaseReady();
    const db = getDb();

    const requestFingerprint = buildCheckoutRequestFingerprint(
      resolvedItems,
      sanitizedShipping,
      paymentMethod
    );
    const duplicateAfter = recentSubmissionThreshold();
    const existingOrder = (
      await db
        .select()
        .from(checkoutOrdersTable)
        .where(
          and(
            eq(checkoutOrdersTable.requestFingerprint, requestFingerprint),
            gte(checkoutOrdersTable.createdAt, duplicateAfter)
          )
        )
    ).sort((left, right) => right.createdAt.getTime() - left.createdAt.getTime())[0];

    const dispatchOrderState = async (input: {
      orderId: string;
      status: CheckoutOrderStatus;
      stripePaymentIntentId?: string;
    }): Promise<IntakeDispatchResult | undefined> => {
      const [n8nDispatchResult] = await Promise.allSettled([
        dispatchIntakeEventToN8n({
          target: 'order',
          eventType: 'order.created',
          payload: {
            orderId: input.orderId,
            paymentMethod,
            email: sanitizedShipping.email,
            shipping: sanitizedShipping,
            items: resolvedItems,
            totalCents,
            status: input.status,
            stripePaymentIntentId: input.stripePaymentIntentId,
            // Carried on the operator event rather than the order row: the
            // `checkout_orders` table has no attestation column, and every value
            // here is already a required literal `true` from the schema above.
            attestations: {
              intendedUseAttested,
              supportOnlyAcknowledged,
              privacyAcknowledged,
            },
          },
        }),
        syncPersonAndFollowUpToTwenty({
          email: sanitizedShipping.email,
          firstName: sanitizedShipping.firstName,
          lastName: sanitizedShipping.lastName,
          phone: sanitizedShipping.phone,
          city: sanitizedShipping.city,
          companyName: inferredCompanyName,
          source: `checkout:${paymentMethod}`,
          taskTitle: `Checkout follow-up ${input.orderId}`,
          taskBodyText: [
            `Order: ${input.orderId}`,
            `Status: ${input.status}`,
            `Payment method: ${paymentMethod}`,
            `Customer: ${sanitizedShipping.firstName} ${sanitizedShipping.lastName}`,
            `Email: ${sanitizedShipping.email}`,
            `Phone: ${sanitizedShipping.phone ?? 'N/A'}`,
            `City: ${sanitizedShipping.city}`,
            `Company: ${inferredCompanyName ?? 'N/A'}`,
            `Country: ${sanitizedShipping.country}`,
            `Total cents: ${totalCents}`,
            '',
            `Items: ${resolvedItems
              .map((item) => `${item.id} x${item.quantity}`)
              .join(', ')}`,
          ].join('\n'),
          opportunity: {
            name: `Checkout order ${input.orderId}`,
            amountMicros: totalCents * 10000,
            currencyCode: 'PLN',
            stage: 'NEW',
          },
        }),
        syncAndNotifySubscriberViaNovu({
          email: sanitizedShipping.email,
          firstName: sanitizedShipping.firstName,
          lastName: sanitizedShipping.lastName,
          phone: sanitizedShipping.phone,
          source: `checkout:${paymentMethod}`,
          title: 'Checkout intake captured',
          message: `Your Hylono order ${input.orderId} is recorded with status ${input.status}. We will keep you updated as payment and fulfillment progress.`,
          data: {
            orderId: input.orderId,
            paymentMethod,
            status: input.status,
            totalCents,
            items: resolvedItems,
            city: sanitizedShipping.city,
            country: sanitizedShipping.country,
            stripePaymentIntentId: input.stripePaymentIntentId ?? null,
          },
          payload: {
            orderId: input.orderId,
            paymentMethod,
            status: input.status,
            totalCents,
            city: sanitizedShipping.city,
            country: sanitizedShipping.country,
            stripePaymentIntentId: input.stripePaymentIntentId ?? null,
          },
        }),
      ]);

      return n8nDispatchResult.status === 'fulfilled'
        ? n8nDispatchResult.value
        : undefined;
    };

    const insertOrder = async (input: {
      lastErrorMessage?: string;
      orderId: string;
      status: CheckoutOrderStatus;
      stripeClientSecret?: string;
      stripePaymentIntentId?: string;
    }): Promise<void> => {
      const now = new Date();

      await db.insert(checkoutOrdersTable).values({
        id: crypto.randomUUID(),
        orderId: input.orderId,
        paymentMethod,
        email: sanitizedShipping.email,
        requestFingerprint,
        shipping: sanitizedShipping,
        items: resolvedItems,
        totalCents,
        status: input.status,
        stripePaymentIntentId: input.stripePaymentIntentId,
        stripeClientSecret: input.stripeClientSecret,
        lastErrorMessage: input.lastErrorMessage,
        createdAt: now,
        updatedAt: now,
      });
    };

    const updateOrder = async (
      orderId: string,
      input: {
        lastErrorMessage?: string | null;
        paidAt?: Date | null;
        status: CheckoutOrderStatus;
        stripeClientSecret?: string | null;
        stripePaymentIntentId?: string | null;
      }
    ): Promise<void> => {
      await db
        .update(checkoutOrdersTable)
        .set({
          status: input.status,
          stripePaymentIntentId: input.stripePaymentIntentId ?? null,
          stripeClientSecret: input.stripeClientSecret ?? null,
          lastErrorMessage: input.lastErrorMessage ?? null,
          paidAt: input.paidAt ?? null,
          updatedAt: new Date(),
        })
        .where(eq(checkoutOrdersTable.orderId, orderId));
    };

    const returnExistingOfflineOrder = (
      orderId: string
    ): Response =>
      Response.json(
        {
          success: true,
          message: `Order ${orderId} was already received. We will continue with your payment instructions.`,
          orderId,
        } satisfies CheckoutResponse,
        { status: 200 }
      );

    /**
     * Records the order as awaiting a human availability confirmation and returns 202.
     *
     * 202, not 200: the order request was accepted, but nothing about it is payable
     * yet, and no PaymentIntent exists. The order is written in
     * `awaiting_availability_confirmation` so it is visible to support as an open
     * item rather than a paid or abandoned cart.
     */
    const recordAwaitingAvailabilityConfirmation = async (
      orderId: string
    ): Promise<Response> => {
      if (!existingOrder) {
        await insertOrder({
          orderId,
          status: 'awaiting_availability_confirmation',
          lastErrorMessage: AVAILABILITY_CONFIRMATION_PENDING_MESSAGE,
        });
      } else if (existingOrder.status !== 'awaiting_availability_confirmation') {
        await updateOrder(orderId, {
          status: 'awaiting_availability_confirmation',
          lastErrorMessage: AVAILABILITY_CONFIRMATION_PENDING_MESSAGE,
        });
      }

      const n8nDispatchResult = await dispatchOrderState({
        orderId,
        status: 'awaiting_availability_confirmation',
      });

      return Response.json(
        {
          success: true,
          message: appendIntakeWorkflowSyncDelayNotice(
            buildAwaitingAvailabilityMessage(orderId),
            n8nDispatchResult
          ),
          orderId,
        } satisfies CheckoutResponse,
        { status: 202 }
      );
    };

    // The gate. Sits ahead of `if (existingOrder)` and ahead of both
    // `createStripePaymentIntent` call sites, so a card order can never open a live
    // PaymentIntent - and never hand back a `clientSecret` - while the cart holds a
    // product the catalogue publishes as support-confirmed-on-request.
    if (!availabilityConfirmed) {
      return await recordAwaitingAvailabilityConfirmation(
        existingOrder?.orderId ??
          `HYL-${Date.now().toString(36).toUpperCase()}`
      );
    }

    if (existingOrder) {
      if (paymentMethod !== 'card') {
        return returnExistingOfflineOrder(existingOrder.orderId);
      }

      // An order sitting in `awaiting_availability_confirmation` matches none of the
      // status checks below, so once support confirmation makes the gate pass it falls
      // through to the PaymentIntent branch at the end of this block, reuses this same
      // order id, and `updateOrder` moves it out of the pending state. A customer
      // therefore keeps one reference across the whole confirmation handshake.

      if (
        existingOrder.status === 'payment_intent_created' &&
        existingOrder.stripeClientSecret
      ) {
        return Response.json(
          {
            success: true,
            message: 'Payment intent already created. Continue payment with Stripe Elements.',
            orderId: existingOrder.orderId,
            clientSecret: existingOrder.stripeClientSecret,
          } satisfies CheckoutResponse,
          { status: 200 }
        );
      }

      if (existingOrder.status === 'payment_succeeded') {
        return Response.json(
          {
            success: true,
            message: `Order ${existingOrder.orderId} has already been paid and recorded.`,
            orderId: existingOrder.orderId,
          } satisfies CheckoutResponse,
          { status: 200 }
        );
      }

      if (existingOrder.status === 'pending_card_configuration') {
        return Response.json(
          {
            success: false,
            message:
              'Card payments are temporarily unavailable. Please choose bank transfer or financing.',
            orderId: existingOrder.orderId,
          } satisfies CheckoutResponse,
          { status: 503 }
        );
      }

      if (existingOrder.status === 'payment_intent_failed') {
        return Response.json(
          {
            success: false,
            message:
              'Card authorization failed. Please wait a moment before retrying or use another payment method.',
            orderId: existingOrder.orderId,
          } satisfies CheckoutResponse,
          { status: 502 }
        );
      }

      if (existingOrder.status === 'payment_canceled') {
        return Response.json(
          {
            success: false,
            message:
              'This card payment attempt was canceled. Please start a new checkout attempt.',
            orderId: existingOrder.orderId,
          } satisfies CheckoutResponse,
          { status: 409 }
        );
      }

      const stripeSecretKey = env.STRIPE_SECRET_KEY;
      if (!stripeSecretKey) {
        await updateOrder(existingOrder.orderId, {
          status: 'pending_card_configuration',
          lastErrorMessage: resolveStripePaymentConfigurationMessage(),
        });
        const n8nDispatchResult = await dispatchOrderState({
          orderId: existingOrder.orderId,
          status: 'pending_card_configuration',
        });

        return Response.json(
          {
            success: false,
            message: appendIntakeWorkflowSyncDelayNotice(
              'Card payments are temporarily unavailable. Please choose bank transfer or financing.',
              n8nDispatchResult
            ),
            orderId: existingOrder.orderId,
          } satisfies CheckoutResponse,
          { status: 503 }
        );
      }

      try {
        const paymentIntent = await createStripePaymentIntent({
          orderId: existingOrder.orderId,
          totalCents,
          customerEmail: sanitizedShipping.email,
          stripeSecretKey,
        });

        await updateOrder(existingOrder.orderId, {
          status: 'payment_intent_created',
          stripePaymentIntentId: paymentIntent.paymentIntentId,
          stripeClientSecret: paymentIntent.clientSecret,
          lastErrorMessage: null,
        });
        const n8nDispatchResult = await dispatchOrderState({
          orderId: existingOrder.orderId,
          status: 'payment_intent_created',
          stripePaymentIntentId: paymentIntent.paymentIntentId,
        });

        return Response.json(
          {
            success: true,
            message: appendIntakeWorkflowSyncDelayNotice(
              'Payment intent created. Complete payment with Stripe Elements.',
              n8nDispatchResult
            ),
            orderId: existingOrder.orderId,
            clientSecret: paymentIntent.clientSecret,
          } satisfies CheckoutResponse,
          { status: 200 }
        );
      } catch (error) {
        console.error('[checkout] Stripe PaymentIntent resume failed', {
          orderId: existingOrder.orderId,
          error: summarizeErrorForOperationalLog(error),
        });

        await updateOrder(existingOrder.orderId, {
          status: 'payment_intent_failed',
          lastErrorMessage: resolveStripePaymentIntentFailureMessage(),
        });
        const n8nDispatchResult = await dispatchOrderState({
          orderId: existingOrder.orderId,
          status: 'payment_intent_failed',
        });

        return Response.json(
          {
            success: false,
            message: appendIntakeWorkflowSyncDelayNotice(
              'Card authorization is temporarily unavailable. Please try again or use another payment method.',
              n8nDispatchResult
            ),
            orderId: existingOrder.orderId,
          } satisfies CheckoutResponse,
          { status: 502 }
        );
      }
    }

    const orderId = `HYL-${Date.now().toString(36).toUpperCase()}`;

    // Past the availability gate: everything below is allowed to move money.
    if (paymentMethod === 'card') {
      const stripeSecretKey = env.STRIPE_SECRET_KEY;

      if (!stripeSecretKey) {
        await insertOrder({
          orderId,
          status: 'pending_card_configuration',
          lastErrorMessage: resolveStripePaymentConfigurationMessage(),
        });
        const n8nDispatchResult = await dispatchOrderState({
          orderId,
          status: 'pending_card_configuration',
        });

        return Response.json(
          {
            success: false,
            message: appendIntakeWorkflowSyncDelayNotice(
              'Card payments are temporarily unavailable. Please choose bank transfer or financing.',
              n8nDispatchResult
            ),
            orderId,
          } satisfies CheckoutResponse,
          { status: 503 }
        );
      }

      await insertOrder({
        orderId,
        status: 'pending_payment_intent',
      });

      try {
        const paymentIntent = await createStripePaymentIntent({
          orderId,
          totalCents,
          customerEmail: sanitizedShipping.email,
          stripeSecretKey,
        });

        await updateOrder(orderId, {
          status: 'payment_intent_created',
          stripePaymentIntentId: paymentIntent.paymentIntentId,
          stripeClientSecret: paymentIntent.clientSecret,
          lastErrorMessage: null,
        });
        const n8nDispatchResult = await dispatchOrderState({
          orderId,
          status: 'payment_intent_created',
          stripePaymentIntentId: paymentIntent.paymentIntentId,
        });

        return Response.json(
          {
            success: true,
            message: appendIntakeWorkflowSyncDelayNotice(
              'Payment intent created. Complete payment with Stripe Elements.',
              n8nDispatchResult
            ),
            orderId,
            clientSecret: paymentIntent.clientSecret,
          } satisfies CheckoutResponse,
          { status: 200 }
        );
      } catch (error) {
        console.error('[checkout] Stripe PaymentIntent request failed', {
          orderId,
          error: summarizeErrorForOperationalLog(error),
        });

        await updateOrder(orderId, {
          status: 'payment_intent_failed',
          lastErrorMessage: resolveStripePaymentIntentFailureMessage(),
        });
        const n8nDispatchResult = await dispatchOrderState({
          orderId,
          status: 'payment_intent_failed',
        });

        return Response.json(
          {
            success: false,
            message: appendIntakeWorkflowSyncDelayNotice(
              'Card authorization is temporarily unavailable. Please try again or use another payment method.',
              n8nDispatchResult
            ),
            orderId,
          } satisfies CheckoutResponse,
          { status: 502 }
        );
      }
    }

    await insertOrder({
      orderId,
      status: 'awaiting_offline_payment',
    });
    const n8nDispatchResult = await dispatchOrderState({
      orderId,
      status: 'awaiting_offline_payment',
    });

    return Response.json(
      {
        success: true,
        message: appendIntakeWorkflowSyncDelayNotice(
          `Order ${orderId} received. We will contact you at ${sanitizedShipping.email} with payment instructions.`,
          n8nDispatchResult
        ),
        orderId,
      } satisfies CheckoutResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error('[checkout] Error processing order', {
      error: summarizeErrorForOperationalLog(error),
    });
    return Response.json(
      {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
      } satisfies CheckoutResponse,
      { status: 500 }
    );
  }
}

export function GET(): Response {
  return new Response('Method Not Allowed', {
    status: 405,
    headers: { Allow: 'POST' },
  });
}
