/**
 * Field names shared by the client intake forms and the server spam gate.
 *
 * Deliberately dependency-free. The gate itself lives in
 * `app/api/_shared/spam-gate.ts` and reaches for the network, environment and site
 * entity; importing that module from a form component would pull all of it into the
 * browser bundle. Only the names are shared here.
 */

/**
 * Decoy input rendered hidden in every public intake form. Deliberately not a name
 * browser autofill targets (no "website", "url", "company", "address"), because an
 * autofilled decoy would reject genuine visitors.
 */
export const SPAM_HONEYPOT_FIELD = 'contactReferenceCode';

/** Field names a client may use to carry a Cloudflare Turnstile token. */
export const SPAM_CAPTCHA_TOKEN_FIELDS = [
  'captchaToken',
  'cf-turnstile-response',
] as const;
