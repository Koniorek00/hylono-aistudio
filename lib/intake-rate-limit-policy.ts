/**
 * Distributed rate-limit policy for the public intake endpoints.
 *
 * ## Why a second policy exists
 *
 * `app/api/_shared/rate-limit.ts` keeps its counters in an in-process `Map` on
 * `globalThis`. It is fast and needs no configuration, but it counts **per serverless
 * instance** and resets on a cold start, so a caller spread across instances multiplies
 * the stated limit. This module holds the numbers for the distributed limit that fixes
 * that.
 *
 * ## Status: decided, NOT yet enforced
 *
 * The numbers below are not applied anywhere yet. Two findings from 2026-08-20 decide
 * where enforcement has to live:
 *
 * 1. **The proxy cannot host it.** `proxy.ts` has an Arcjet client with `shield` and
 *    `detectBot`, but its `config.matcher` excludes `api`, so no request to
 *    `/api/*` ever reaches it. A rule added there would be dead code - and the same
 *    exclusion means the public intake APIs currently have no boundary protection at
 *    all, only the in-process limiter.
 * 2. **Keying on the source IP alone would be wrong.** The public forms submit through
 *    server actions in `src/actions/formActions.ts`, which `fetch` the intake API from
 *    the server. Those requests carry the *server's* address, so an IP-keyed window
 *    would pool every visitor into one bucket and start refusing legitimate
 *    submissions once the pool was exhausted.
 *
 * The enforcement point therefore has to be the route handlers, where
 * `resolveRateLimitClientId` already returns the HMAC-verified forwarded client id for
 * server-action traffic and the trusted edge address otherwise. That value is the
 * correct bucket key, and it cannot be forged.
 *
 * ## The two layers, once enforcement lands
 *
 * - in-process: tight, per-route (for example 5 contact submissions per 10 minutes),
 *   the limit a normal visitor would ever notice.
 * - distributed: looser, across all intake endpoints combined, and impossible to reset
 *   by moving to another instance. The abuse ceiling, not the UX limit.
 */

/** Public endpoints that accept a submission and therefore cost us money to process. */
export const RATE_LIMITED_INTAKE_PATHS = [
  '/api/contact',
  '/api/booking',
  '/api/newsletter',
  '/api/rental',
  '/api/checkout',
] as const;

/** Window length in seconds. Also used as the `Retry-After` value on a 429. */
export const INTAKE_RATE_LIMIT_WINDOW_SECONDS = 600;

/**
 * Requests allowed per client per window, across all intake endpoints combined.
 * A genuine visitor submits one to three forms in a session, so 20 leaves generous
 * headroom for retries and corrections while still capping automated floods.
 */
export const INTAKE_RATE_LIMIT_MAX_REQUESTS = 20;

const INTAKE_PATH_SET: ReadonlySet<string> = new Set(RATE_LIMITED_INTAKE_PATHS);

/**
 * True for a submission to a public intake endpoint. Only POST counts: a GET to these
 * paths is either a 405 or, for rental, an authenticated read, and neither should
 * consume a submission budget.
 */
export const isRateLimitedIntakeRequest = (
  method: string,
  pathname: string
): boolean => method.toUpperCase() === 'POST' && INTAKE_PATH_SET.has(pathname);
