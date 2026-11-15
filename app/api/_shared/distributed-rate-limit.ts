/**
 * Distributed rate limiting for the public intake routes.
 *
 * This is the layer that holds across serverless instances. The in-process limiter in
 * `./rate-limit.ts` counts per instance and resets on a cold start, so its stated limits
 * are multiplied by the number of warm instances. This one asks Arcjet, which keeps a
 * single counter per client.
 *
 * Two decisions worth knowing before changing anything here:
 *
 * 1. **The bucket key is `resolveRateLimitClientId`, not the source address.** The public
 *    forms submit through server actions that `fetch` these routes from the server, so
 *    those requests arrive carrying the *server's* address. Keying on the address would
 *    pool every visitor into one bucket and start refusing legitimate submissions.
 *    `resolveRateLimitClientId` returns the HMAC-verified forwarded client id for that
 *    path and the trusted edge address for direct callers, so it identifies the real
 *    caller either way and cannot be forged.
 *
 * 2. **It fails open.** When `ARCJET_KEY` is absent, or the provider errors, or the call
 *    times out, the submission proceeds and an operator alarm is logged. Refusing a lead
 *    because the rate limiter's provider is unreachable costs more than letting a burst
 *    through - and the in-process limiter is still in front of this one.
 */

import arcjet, { slidingWindow } from '@arcjet/next';
import { readRuntimeEnv } from '@/lib/env';
import {
  INTAKE_RATE_LIMIT_MAX_REQUESTS,
  INTAKE_RATE_LIMIT_WINDOW_SECONDS,
} from '@/lib/intake-rate-limit-policy';
import { summarizeErrorForOperationalLog } from './log-safety';
import { resolveRateLimitClientId } from './rate-limit';

export const DISTRIBUTED_RATE_LIMIT_NOT_CONFIGURED_LOG =
  '[intake] Distributed rate limiting not configured';

export const DISTRIBUTED_RATE_LIMIT_UNAVAILABLE_LOG =
  '[intake] Distributed rate limit check failed, allowing the submission';

export const DISTRIBUTED_RATE_LIMIT_BLOCKED_LOG =
  '[intake] Submission blocked by the distributed rate limit';

/**
 * `not_configured` - no `ARCJET_KEY`; only the in-process limiter applies.
 * `allowed` - the provider answered and the caller is within budget.
 * `limited` - the provider answered and the caller is over budget.
 * `unavailable` - the provider could not be reached; the submission is allowed.
 */
export type DistributedRateLimitStatus =
  | 'not_configured'
  | 'allowed'
  | 'limited'
  | 'unavailable';

export interface DistributedRateLimitDecision {
  /** False only for `limited`. Every other status lets the submission through. */
  allowed: boolean;
  status: DistributedRateLimitStatus;
  retryAfterSeconds: number;
}

type IntakeArcjetClient = {
  protect: (
    request: Request,
    props: { intakeClientId: string }
  ) => Promise<{
    isDenied: () => boolean;
    reason: { isRateLimit: () => boolean };
  }>;
};

declare global {
  // eslint-disable-next-line no-var
  var __hylonoIntakeArcjetClient: IntakeArcjetClient | null | undefined;
}

/**
 * Built once per process. Arcjet holds connection state, so re-creating the client on
 * every request would add latency to the submission path.
 */
const getIntakeArcjetClient = (): IntakeArcjetClient | null => {
  if (typeof globalThis.__hylonoIntakeArcjetClient !== 'undefined') {
    return globalThis.__hylonoIntakeArcjetClient;
  }

  const key = readRuntimeEnv('ARCJET_KEY')?.trim();

  if (!key) {
    globalThis.__hylonoIntakeArcjetClient = null;
    return null;
  }

  globalThis.__hylonoIntakeArcjetClient = arcjet({
    key,
    characteristics: ['intakeClientId'],
    rules: [
      slidingWindow({
        mode: 'LIVE',
        interval: INTAKE_RATE_LIMIT_WINDOW_SECONDS,
        max: INTAKE_RATE_LIMIT_MAX_REQUESTS,
      }),
    ],
  }) as unknown as IntakeArcjetClient;

  return globalThis.__hylonoIntakeArcjetClient;
};

/** Test seam: drops the cached client so a test can change `ARCJET_KEY`. */
export const resetDistributedRateLimitClientForTests = (): void => {
  globalThis.__hylonoIntakeArcjetClient = undefined;
};

/**
 * Asks the distributed limiter whether this caller may submit.
 *
 * Never throws. A caller can treat `allowed === false` as the only reason to refuse.
 */
export const consumeDistributedRateLimit = async (
  request: Request,
  area: string
): Promise<DistributedRateLimitDecision> => {
  const client = getIntakeArcjetClient();

  if (!client) {
    // Expected in local development. Error level in production is the operator's signal
    // that the public endpoints are running on the per-instance limiter alone.
    console.warn(DISTRIBUTED_RATE_LIMIT_NOT_CONFIGURED_LOG, { area });

    return {
      allowed: true,
      status: 'not_configured',
      retryAfterSeconds: INTAKE_RATE_LIMIT_WINDOW_SECONDS,
    };
  }

  try {
    const decision = await client.protect(request, {
      intakeClientId: resolveRateLimitClientId(request),
    });

    if (decision.isDenied() && decision.reason.isRateLimit()) {
      console.warn(DISTRIBUTED_RATE_LIMIT_BLOCKED_LOG, { area });

      return {
        allowed: false,
        status: 'limited',
        retryAfterSeconds: INTAKE_RATE_LIMIT_WINDOW_SECONDS,
      };
    }

    return {
      allowed: true,
      status: 'allowed',
      retryAfterSeconds: INTAKE_RATE_LIMIT_WINDOW_SECONDS,
    };
  } catch (error) {
    console.error(DISTRIBUTED_RATE_LIMIT_UNAVAILABLE_LOG, {
      area,
      error: summarizeErrorForOperationalLog(error),
    });

    return {
      allowed: true,
      status: 'unavailable',
      retryAfterSeconds: INTAKE_RATE_LIMIT_WINDOW_SECONDS,
    };
  }
};

/** 429 carrying `Retry-After`, matching the shape the in-process limiter returns. */
export const createDistributedRateLimitResponse = (
  decision: DistributedRateLimitDecision,
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
        'Retry-After': String(decision.retryAfterSeconds),
      },
    }
  );
