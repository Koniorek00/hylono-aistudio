/**
 * In-process rate limiting for the API routes.
 *
 * Scope, stated plainly: counters live in a `Map` on `globalThis`, so they are **per
 * serverless instance** and reset on a cold start. A caller spread across instances
 * multiplies every limit set here.
 *
 * As of 2026-08-20 this is the ONLY rate limiting on the public intake endpoints. The
 * Arcjet client in `proxy.ts` does not cover them: its `config.matcher` excludes `api`,
 * so no `/api/*` request reaches the proxy. The distributed limit that would fix this is
 * specified in `lib/intake-rate-limit-policy.ts` and has to be enforced here, in the
 * route handlers, keyed on `resolveRateLimitClientId` - the forwarded client id is
 * HMAC-verified and the server-action path would otherwise pool every visitor under the
 * server's own address.
 *
 * `resolveRateLimitClientId` only believes a proxy-supplied client address when the
 * operator has declared a trusted edge via `TRUSTED_EDGE_PROXY=1`; see the note on that
 * constant below for why the default is not to trust, and what it costs.
 */

import { verifyServerActionForwardedClientId } from './server-action-forwarding';
import { readRuntimeEnv } from '@/lib/env';

/**
 * Explicit opt-in for trusting the reverse-proxy client-IP headers.
 *
 * `cf-connecting-ip`, `x-real-ip` and `x-forwarded-for` are only meaningful when the
 * origin is reachable *exclusively* through a proxy that overwrites them. That is a
 * property of the deployment, not something a request header can prove: if the origin
 * also answers direct requests, a caller sets the header and receives a fresh
 * rate-limit bucket per request, which defeats this limiter **and**
 * `./distributed-rate-limit.ts`, because both key on `resolveRateLimitClientId`.
 *
 * So the trust decision is made here, once, from an operator-set flag - never from a
 * heuristic about which header happens to be present.
 *
 * ## Operational consequence of leaving the flag unset
 *
 * Both limiter layers degrade to **per-instance bucketing on a single `unknown` key** for
 * every caller that does not arrive through the HMAC-signed server-action path. In-process
 * counters already reset on cold start, so an unset flag means the in-process limits
 * (`contact`: 5 per 10 min) effectively apply to the whole internet rather than to one
 * caller. That is the safe direction to fail - it throttles an attacker instead of
 * ignoring one - but it is a real availability limit, not a no-op.
 *
 * ## Owner action required
 *
 * If production really is fronted by Cloudflare (or an equivalent edge that overwrites
 * these headers, with the origin unreachable directly), set:
 *
 *     TRUSTED_EDGE_PROXY=1
 *
 * in the production environment. The default is deliberately the safe one: absent, not trusted.
 */
export const TRUSTED_EDGE_PROXY_ENV_FLAG = 'TRUSTED_EDGE_PROXY';

const TRUSTED_EDGE_PROXY_ENABLED_VALUES = new Set(['1', 'true', 'yes', 'on']);

const isTrustedEdgeProxyEnabled = (): boolean =>
  TRUSTED_EDGE_PROXY_ENABLED_VALUES.has(
    readRuntimeEnv(TRUSTED_EDGE_PROXY_ENV_FLAG)?.trim().toLowerCase() ?? ''
  );

interface RateLimitOptions {
  bucket: string;
  limit: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitState {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __hylonoRateLimitStore: Map<string, RateLimitEntry> | undefined;
}

const getRateLimitStore = (): Map<string, RateLimitEntry> => {
  if (!globalThis.__hylonoRateLimitStore) {
    globalThis.__hylonoRateLimitStore = new Map<string, RateLimitEntry>();
  }

  return globalThis.__hylonoRateLimitStore;
};

export const resolveRateLimitClientId = (request: Request): string => {
  // Unforgeable: the value is HMAC-signed with INTAKE_FORWARDING_SECRET by the server
  // action that forwards the browser submission. This is the only branch that identifies
  // the real caller without depending on deployment topology.
  const forwardedServerActionClientId = verifyServerActionForwardedClientId(request.headers);
  if (forwardedServerActionClientId) {
    return forwardedServerActionClientId;
  }

  if (!isTrustedEdgeProxyEnabled()) {
    // Without the operator flag we have no evidence that any proxy overwrote these
    // headers, so we do not believe them. Falling through to `x-forwarded-for` here would
    // be the same hole wearing a different header name. Pooling every unattributable
    // caller into `unknown` is strictly more restrictive than honouring a client-set
    // header, and it is what keeps a single spoofed request from minting a fresh bucket.
    return 'unknown';
  }

  const trustedEdgeIp =
    request.headers.get('cf-connecting-ip')?.trim() ??
    request.headers.get('x-real-ip')?.trim();
  if (trustedEdgeIp) {
    return trustedEdgeIp;
  }

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return 'unknown';
};

export const consumeRateLimit = (
  request: Request,
  { bucket, limit, windowMs }: RateLimitOptions
): RateLimitState => {
  const store = getRateLimitStore();
  const now = Date.now();
  const key = `${bucket}:${resolveRateLimitClientId(request)}`;
  const existingEntry = store.get(key);

  const entry =
    existingEntry && existingEntry.resetAt > now
      ? existingEntry
      : { count: 0, resetAt: now + windowMs };

  entry.count += 1;
  store.set(key, entry);

  const remaining = Math.max(0, limit - entry.count);
  const retryAfterSeconds = Math.max(
    1,
    Math.ceil((entry.resetAt - now) / 1000)
  );

  return {
    allowed: entry.count <= limit,
    limit,
    remaining,
    retryAfterSeconds,
    resetAt: entry.resetAt,
  };
};

export const createRateLimitResponse = (
  state: RateLimitState,
  message: string
): Response =>
  Response.json(
    {
      success: false,
      message,
    },
    {
      status: 429,
      headers: {
        'Retry-After': String(state.retryAfterSeconds),
        'X-RateLimit-Limit': String(state.limit),
        'X-RateLimit-Remaining': String(state.remaining),
        'X-RateLimit-Reset': String(state.resetAt),
      },
    }
  );

export const resetRateLimitStoreForTests = (): void => {
  getRateLimitStore().clear();
};
