/**
 * Shared lead-durability primitives for the public intake routes.
 *
 * Durability contract: a public submission must never be accepted silently and then
 * lost. Persistence is attempted in order of durability -
 *   1. database row (authoritative, queryable)
 *   2. notification email carrying the full submission (recoverable by a human)
 *   3. nothing - in which case the customer is told to contact us directly instead of
 *      receiving a success message we cannot honour.
 */

import { siteEntity } from '@/content/site-entity';
import { env } from '@/lib/env';
import { fetchWithTimeout } from './http';
import {
  summarizeErrorForOperationalLog,
  summarizeProviderResponseBody,
} from './log-safety';

/** Outcome of the outbound operator notification. */
export type IntakeNotificationStatus = 'sent' | 'not_configured' | 'failed';

/** Where the submission actually ended up. */
export type IntakePersistenceMode = 'database' | 'email_fallback' | 'none';

export const INTAKE_NOTIFICATION_NOT_CONFIGURED_LOG =
  '[intake] Outbound notification configuration missing';

export const INTAKE_LEAD_AT_RISK_LOG = '[intake] Lead durability failure';

export const INTAKE_LEAD_EMAIL_FALLBACK_LOG =
  '[intake] Database unavailable, lead recorded by notification email only';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export interface IntakeNotificationInput {
  /** Route area used for log prefixes, e.g. "contact". */
  area: string;
  /** Customer-visible reference so operators can correlate logs and replies. */
  reference: string;
  subject: string;
  text: string;
  replyTo?: string;
  /**
   * True when the database was unavailable and this email is the only surviving
   * record of the submission. Marks the subject so it cannot be triaged as routine.
   */
  isDatabaseFallback?: boolean;
}

/**
 * Customer-facing message used when neither the database nor email accepted the
 * submission. Always carries a real, verified channel so the lead is not stranded.
 *
 * This one string is the ENTIRE lead-recovery path: all five intake routes (booking,
 * checkout, contact, newsletter, rental) fall back to it, and with no DATABASE_URL and no
 * RESEND_API_KEY every submission is rejected - so this is what a customer reads instead of
 * a confirmation. It matters more than its size suggests.
 *
 * It states the support hours rather than promising to "pick it up straight away". The site
 * declares siteEntity.supportHours in 49 other places; this message - the one that matters
 * most - was the only customer-facing commitment that ignored them, and immediacy is not a
 * promise the company can keep on a Saturday night (proof 1009954).
 *
 * Do NOT add "try again later" or similar: the submission was REJECTED, not queued, and
 * tests/api/intake-durability.test.ts asserts that phrasing stays out.
 */
export const buildDirectContactFallbackMessage = (): string =>
  `We could not record your request automatically. Please contact us directly at ${siteEntity.phone} or ${siteEntity.contactEmail}. We reply ${siteEntity.supportHours}.`;

/**
 * Sends the operator notification for an intake submission.
 * Single implementation shared by every public intake route.
 */
export const sendIntakeNotificationEmail = async ({
  area,
  reference,
  subject,
  text,
  replyTo,
  isDatabaseFallback = false,
}: IntakeNotificationInput): Promise<IntakeNotificationStatus> => {
  const resendApiKey = env.RESEND_API_KEY;

  if (!resendApiKey) {
    // Escalated to error: without this key nobody is notified of new business.
    console.error(INTAKE_NOTIFICATION_NOT_CONFIGURED_LOG, { area, reference });
    return 'not_configured';
  }

  const subjectLine = isDatabaseFallback
    ? `[FALLBACK][${reference}] ${subject}`
    : `[${reference}] ${subject}`;
  const body = isDatabaseFallback
    ? [
        'DATABASE UNAVAILABLE - this email is the only record of the submission below.',
        'Copy it into the CRM manually before replying.',
        '',
        text,
      ].join('\n')
    : text;

  try {
    const response = await fetchWithTimeout(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Hylono Intake <${siteEntity.contactEmail}>`,
        to: [siteEntity.contactEmail],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject: subjectLine,
        text: body,
      }),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(`[${area}] Resend send failed`, {
        reference,
        responseBody: summarizeProviderResponseBody(responseText),
        status: response.status,
      });
      return 'failed';
    }
  } catch (error) {
    console.error(`[${area}] Resend send failed`, {
      error: summarizeErrorForOperationalLog(error),
      reference,
    });
    return 'failed';
  }

  return 'sent';
};

export interface IntakeDurabilityOutcome {
  /** True when the submission is recoverable by at least one channel. */
  accepted: boolean;
  /** HTTP status the route should return. */
  status: number;
  persistence: IntakePersistenceMode;
  notification: IntakeNotificationStatus;
}

/**
 * Maps persistence + notification results onto the response contract.
 *
 * - database row present: accept regardless of notification result, because the lead
 *   is queryable. A failed notification is an operator alarm, not a customer error.
 * - email fallback only: accept with 202 so monitoring can distinguish it.
 * - neither: reject with 503 so the customer is redirected to a real channel.
 */
export const resolveIntakeDurability = ({
  persistence,
  notification,
}: {
  persistence: IntakePersistenceMode;
  notification: IntakeNotificationStatus;
}): IntakeDurabilityOutcome => {
  if (persistence === 'database') {
    return {
      accepted: true,
      status: notification === 'sent' ? 200 : 202,
      persistence,
      notification,
    };
  }

  if (persistence === 'email_fallback' && notification === 'sent') {
    return { accepted: true, status: 202, persistence, notification };
  }

  return { accepted: false, status: 503, persistence: 'none', notification };
};

/**
 * Emits the durability alarm for a submission that survived only by email, or not at
 * all. Never logs submission content - only routing facts.
 */
export const logIntakeDurabilityAlarm = ({
  area,
  reference,
  persistence,
  notification,
}: {
  area: string;
  reference: string;
  persistence: IntakePersistenceMode;
  notification: IntakeNotificationStatus;
}): void => {
  if (persistence === 'email_fallback') {
    console.error(INTAKE_LEAD_EMAIL_FALLBACK_LOG, { area, reference, notification });
    return;
  }

  if (persistence === 'none') {
    console.error(INTAKE_LEAD_AT_RISK_LOG, { area, reference, notification });
  }
};
