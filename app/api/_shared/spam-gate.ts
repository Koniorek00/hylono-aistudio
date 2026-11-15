/**
 * Shared spam gate for the public intake routes.
 *
 * Two independent signals, applied in order of cost:
 *   1. Honeypot field - a decoy input a real visitor never sees or fills. No network
 *      call, no configuration, always active.
 *   2. Cloudflare Turnstile - enforced **only** when the secret is configured. Once
 *      `TURNSTILE_SECRET_KEY` is set the gate is fail-closed on all three outcomes: a
 *      wrong token, a provider outage, and a submission that carries no token at all.
 *
 * ## Operational consequence of the absent-token rule
 *
 * `TURNSTILE_SECRET_KEY` is a promise that every submission carries a
 * `cf-turnstile-response` token. Setting the secret while `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
 * is unset (or while any intake form fails to render `TurnstileWidget`) makes every
 * genuine lead on that form fail with the "could not confirm this form was submitted by a
 * person" message. That is a deliberate trade: with the secret configured, omitting the
 * token must be treated as the attack it is, otherwise the captcha is decorative and
 * `TURNSTILE_SECRET_KEY` buys no protection at all. The refusal always names a verified
 * phone number and contact email so a blocked person reaches a human instead of a void.
 *
 * Reachability, verified by grep over this tree: `TurnstileWidget` is rendered by
 * `components/ContactPage.tsx:823`, `components/CheckoutPage.tsx:739`,
 * `components/HelpCenterPage.tsx:529`, `components/Newsletter.tsx:78,161,278`,
 * `components/RentalCheckoutPage.tsx:470` and `app/pl/contact/PolishContactForm.tsx:124`
 * — the same six components that render `HoneypotField`.
 * `src/actions/formActions.ts:276-311` reads `cf-turnstile-response` and forwards it as
 * `captchaToken`, which `lib/spam-gate-fields.ts:18-20` lists. So the token does reach the
 * gate from those forms. The gap is `/api/booking`: no component calls
 * `submitBookingFormAction`, so that route has no widget and would be refused wholesale
 * while the secret is set.
 *
 * The widget renders nothing when the site key is absent, so the site key and the secret
 * must be deployed together.
 *
 * Blocking never dead-ends a person. The rejection carries the verified phone number
 * and contact email, so a false positive still reaches a human.
 */

import { siteEntity } from '@/content/site-entity';
import { readRuntimeEnv } from '@/lib/env';
import {
  SPAM_CAPTCHA_TOKEN_FIELDS,
  SPAM_HONEYPOT_FIELD,
} from '@/lib/spam-gate-fields';
import { fetchWithTimeout } from './http';
import {
  summarizeErrorForOperationalLog,
  summarizeProviderResponseBody,
} from './log-safety';
import { resolveRateLimitClientId } from './rate-limit';

/**
 * Re-exported so route and test code can keep importing the field names from the gate
 * itself, while form components import them from the dependency-free module.
 */
export { SPAM_CAPTCHA_TOKEN_FIELDS, SPAM_HONEYPOT_FIELD };

/** Why a submission was refused. */
export type SpamGateBlockReason = 'honeypot' | 'captcha';

/**
 * Outcome of the captcha step.
 *
 * `not_evaluated` - honeypot already refused, captcha never ran.
 * `not_configured` - no `TURNSTILE_SECRET_KEY`, so captcha is not part of the gate.
 * `absent_token` - the secret IS configured but the body carried no token. This blocks,
 * consistently with `failed`: once the secret is set, a tokenless submission is the
 * cheapest way to bypass the captcha, and `spam-gate.ts` must not treat it as a pass.
 */
export type TurnstileVerificationStatus =
  | 'not_configured'
  | 'not_evaluated'
  | 'absent_token'
  | 'passed'
  | 'failed';

export const SPAM_GATE_BLOCKED_LOG = '[intake] Submission blocked by spam gate';

export const SPAM_GATE_CAPTCHA_TOKEN_ABSENT_LOG =
  '[intake] Captcha configured but submission carried no token';

export const SPAM_GATE_CAPTCHA_UNAVAILABLE_LOG =
  '[intake] Captcha verification could not be completed';

const TURNSTILE_VERIFY_ENDPOINT =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const readBodyField = (rawBody: unknown, field: string): unknown => {
  if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
    return undefined;
  }

  return (rawBody as Record<string, unknown>)[field];
};

/**
 * True when the decoy field carries anything at all. An absent field, an empty string,
 * `null` and `false` are all treated as untouched, which is what a real form sends.
 */
export const isHoneypotTriggered = (rawBody: unknown): boolean => {
  const value = readBodyField(rawBody, SPAM_HONEYPOT_FIELD);

  if (typeof value === 'string') {
    return value.trim().length > 0;
  }

  return typeof value !== 'undefined' && value !== null && value !== false;
};

/** First captcha token present on the body, if any. */
export const readSubmittedCaptchaToken = (rawBody: unknown): string | undefined => {
  for (const field of SPAM_CAPTCHA_TOKEN_FIELDS) {
    const value = readBodyField(rawBody, field);

    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
};

/**
 * Verifies a Turnstile token against Cloudflare.
 *
 * Fails closed once the secret is configured: a token means the widget rendered, so the
 * visitor can retry, and treating a provider outage as a pass would make the check
 * decorative. An absent token returns `absent_token`, which `resolveSpamGate` also handles
 * as a refusal - see the module header for the operational consequence.
 */
export const verifyTurnstileToken = async ({
  token,
  remoteIp,
}: {
  token?: string;
  remoteIp?: string;
}): Promise<TurnstileVerificationStatus> => {
  // Read through readRuntimeEnv rather than the typed `env` proxy: this module runs on
  // the request path of routes whose tests execute in a DOM-like environment, where the
  // proxy refuses server-only keys.
  const secret = readRuntimeEnv('TURNSTILE_SECRET_KEY')?.trim();

  if (!secret) {
    return 'not_configured';
  }

  if (!token) {
    return 'absent_token';
  }

  const form = new URLSearchParams({ secret, response: token });

  if (remoteIp && remoteIp !== 'unknown') {
    form.set('remoteip', remoteIp);
  }

  try {
    const response = await fetchWithTimeout(TURNSTILE_VERIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });

    if (!response.ok) {
      const responseText = await response.text();
      console.error(SPAM_GATE_CAPTCHA_UNAVAILABLE_LOG, {
        responseBody: summarizeProviderResponseBody(responseText),
        status: response.status,
      });
      return 'failed';
    }

    const payload = (await response.json()) as { success?: unknown };

    return payload?.success === true ? 'passed' : 'failed';
  } catch (error) {
    console.error(SPAM_GATE_CAPTCHA_UNAVAILABLE_LOG, {
      error: summarizeErrorForOperationalLog(error),
    });
    return 'failed';
  }
};

export interface SpamGateDecision {
  /** True when the route must refuse the submission. */
  blocked: boolean;
  reason?: SpamGateBlockReason;
  captcha: TurnstileVerificationStatus;
}

/**
 * Single decision point shared by every public intake route. Runs on the raw body,
 * before schema parsing, because the schemas strip unknown keys and would discard the
 * decoy field before it could be read.
 */
export const resolveSpamGate = async ({
  request,
  rawBody,
  area,
}: {
  request: Request;
  rawBody: unknown;
  area: string;
}): Promise<SpamGateDecision> => {
  if (isHoneypotTriggered(rawBody)) {
    console.warn(SPAM_GATE_BLOCKED_LOG, { area, reason: 'honeypot' });
    return { blocked: true, reason: 'honeypot', captcha: 'not_evaluated' };
  }

  const captcha = await verifyTurnstileToken({
    token: readSubmittedCaptchaToken(rawBody),
    remoteIp: resolveRateLimitClientId(request),
  });

  if (captcha === 'failed') {
    console.warn(SPAM_GATE_BLOCKED_LOG, { area, reason: 'captcha' });
    return { blocked: true, reason: 'captcha', captcha };
  }

  if (captcha === 'absent_token') {
    // Fail closed. `TURNSTILE_SECRET_KEY` set + no token in the body is the one bypass
    // that needs no forged token at all, so honouring it would leave the captcha
    // decorative while operators believe it is enforcing. Operational consequence: the
    // secret and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` must be deployed together, because the
    // widget renders nothing without the site key and every genuine lead on such a form
    // would then be refused here. See the module header and
    // SPAM_GATE_CAPTCHA_TOKEN_ABSENT_LOG.
    console.warn(SPAM_GATE_CAPTCHA_TOKEN_ABSENT_LOG, { area });
    console.warn(SPAM_GATE_BLOCKED_LOG, { area, reason: 'captcha' });
    return { blocked: true, reason: 'captcha', captcha };
  }

  return { blocked: false, captcha };
};

/**
 * Customer-facing refusal. Always names a real channel so a wrongly blocked person is
 * redirected rather than stranded.
 */
export const buildSpamGateRejectionMessage = (): string =>
  `We could not confirm this form was submitted by a person. If this was you, please contact us directly at ${siteEntity.phone} or ${siteEntity.contactEmail} and we will pick it up straight away.`;

export const createSpamGateResponse = (): Response =>
  Response.json(
    {
      success: false,
      message: buildSpamGateRejectionMessage(),
    },
    { status: 400 }
  );
