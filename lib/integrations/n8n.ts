import { createHmac, randomUUID } from 'node:crypto';
import {
  summarizeErrorForOperationalLog,
  summarizeProviderResponseBody,
} from '@/app/api/_shared/log-safety';
import { env } from '@/lib/env';

type IntakeWebhookTarget =
  | 'booking'
  | 'contact'
  | 'newsletter'
  | 'order'
  | 'rental';

type IntakeEventName =
  | 'booking.requested'
  | 'contact.created'
  | 'newsletter.subscribed'
  | 'order.created'
  | 'rental.requested';

interface WorkflowEnvelope<TPayload> {
  correlationId: string;
  eventId: string;
  eventType: IntakeEventName;
  environment: typeof env.NODE_ENV;
  occurredAt: string;
  source: 'hylono-web';
  payload: TPayload;
}

interface DispatchOptions<TPayload> {
  correlationId?: string;
  eventType: IntakeEventName;
  payload: TPayload;
  target: IntakeWebhookTarget;
}

export type IntakeDispatchResult =
  | {
      ok: true;
      status: 'delivered';
      eventId: string;
      eventType: IntakeEventName;
      statusCode: number;
      target: IntakeWebhookTarget;
    }
  | {
      ok: true;
      status: 'skipped';
      eventType: IntakeEventName;
      reason: 'not_configured';
      target: IntakeWebhookTarget;
    }
  | {
      ok: false;
      status: 'failed';
      eventId?: string;
      eventType: IntakeEventName;
      reason: 'non_2xx' | 'network' | 'unsigned_production_webhook';
      statusCode?: number;
      target: IntakeWebhookTarget;
    };

const DEFAULT_TIMEOUT_MS = 5000;
const N8N_WEBHOOK_SIGNATURE_CONFIGURATION_LOG_MESSAGE =
  '[n8n] Production webhook signature configuration missing';

const resolveWebhookUrl = (
  target: IntakeWebhookTarget
): string | undefined => {
  if (target === 'contact') {
    return env.N8N_CONTACT_WEBHOOK_URL;
  }

  if (target === 'booking') {
    return env.N8N_BOOKING_WEBHOOK_URL;
  }

  if (target === 'order') {
    return env.N8N_ORDER_WEBHOOK_URL;
  }

  if (target === 'rental') {
    return env.N8N_RENTAL_WEBHOOK_URL;
  }

  return env.N8N_NEWSLETTER_WEBHOOK_URL;
};

const resolveTimeoutMs = (): number => {
  const configured = Number.parseInt(env.N8N_WEBHOOK_TIMEOUT_MS ?? '', 10);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return DEFAULT_TIMEOUT_MS;
};

const buildHeaders = (
  body: string,
  correlationId: string,
  eventId: string,
  eventType: IntakeEventName
): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'x-hylono-correlation-id': correlationId,
    'x-hylono-event-id': eventId,
    'x-hylono-event-type': eventType,
  };

  if (env.N8N_WEBHOOK_SIGNING_KEY) {
    headers['x-hylono-signature'] = createHmac(
      'sha256',
      env.N8N_WEBHOOK_SIGNING_KEY
    )
      .update(body)
      .digest('hex');
  }

  return headers;
};

export const N8N_WEBHOOK_NOT_CONFIGURED_LOG_MESSAGE =
  '[n8n] Intake dispatch skipped: no webhook is configured for this target';

/**
 * Targets already reported as unconfigured in this process, so the alarm above fires
 * once rather than on every submission. Deliberately process-scoped and never reset at
 * runtime: on serverless each cold start is a new process and re-reports.
 */
const reportedUnconfiguredTargets = new Set<string>();

export async function dispatchIntakeEventToN8n<TPayload>({
  correlationId,
  eventType,
  payload,
  target,
}: DispatchOptions<TPayload>): Promise<IntakeDispatchResult> {
  const webhookUrl = resolveWebhookUrl(target);

  if (!webhookUrl) {
    // A missing webhook URL is NOT a delivery failure: nothing was configured to
    // happen, and the lead is still held by the database row or the fallback email.
    // So `ok` stays true and the route must keep accepting the submission - changing
    // that would reject leads over an optional integration.
    //
    // It IS, however, a silent loss of the automation leg. This repository's own
    // readiness report (lib/intake-config-readiness.ts) classifies all five
    // N8N_*_WEBHOOK_URL variables as `silent-loss` with the words "no operator log",
    // because this branch used to return without a word. An operator whose webhook was
    // never set - or was deleted - had no runtime signal at all, only
    // `pnpm intake:status`, which nobody runs once the site is live.
    //
    // Reported once per target per process, not per submission: an operator who
    // deliberately runs without n8n should not collect an error line for every lead,
    // and on serverless a cold start re-reports it anyway. Production-gated to match
    // how the missing signing key below is already treated.
    if (env.NODE_ENV === 'production' && !reportedUnconfiguredTargets.has(target)) {
      reportedUnconfiguredTargets.add(target);
      console.error(N8N_WEBHOOK_NOT_CONFIGURED_LOG_MESSAGE, { eventType, target });
    }

    return {
      ok: true,
      status: 'skipped',
      eventType,
      reason: 'not_configured',
      target,
    };
  }

  if (env.NODE_ENV === 'production' && !env.N8N_WEBHOOK_SIGNING_KEY) {
    console.error(N8N_WEBHOOK_SIGNATURE_CONFIGURATION_LOG_MESSAGE, {
      eventType,
      target,
    });
    return {
      ok: false,
      status: 'failed',
      eventType,
      reason: 'unsigned_production_webhook',
      target,
    };
  }

  const eventId = randomUUID();
  const envelope: WorkflowEnvelope<TPayload> = {
    correlationId: correlationId ?? eventId,
    eventId,
    eventType,
    environment: env.NODE_ENV,
    occurredAt: new Date().toISOString(),
    source: 'hylono-web',
    payload,
  };

  const body = JSON.stringify(envelope);

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: buildHeaders(body, envelope.correlationId, envelope.eventId, eventType),
      body,
      cache: 'no-store',
      signal: AbortSignal.timeout(resolveTimeoutMs()),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      console.warn('[n8n] Workflow dispatch returned non-2xx', {
        eventId: envelope.eventId,
        eventType,
        responseBody: summarizeProviderResponseBody(responseBody),
        status: response.status,
        target,
      });

      return {
        ok: false,
        status: 'failed',
        eventId: envelope.eventId,
        eventType,
        reason: 'non_2xx',
        statusCode: response.status,
        target,
      };
    }

    return {
      ok: true,
      status: 'delivered',
      eventId: envelope.eventId,
      eventType,
      statusCode: response.status,
      target,
    };
  } catch (error) {
    console.error('[n8n] Workflow dispatch failed', {
      eventId: envelope.eventId,
      eventType,
      target,
      error: summarizeErrorForOperationalLog(error),
    });

    return {
      ok: false,
      status: 'failed',
      eventId: envelope.eventId,
      eventType,
      reason: 'network',
      target,
    };
  }
}
