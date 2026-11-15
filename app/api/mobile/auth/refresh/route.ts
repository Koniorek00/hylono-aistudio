import { z } from 'zod';
import {
  createRateLimitResponse,
  consumeRateLimit,
} from '@/app/api/_shared/rate-limit';
import {
  readJsonBody,
  validationErrorResponse,
} from '@/app/api/_shared/validation';
import {
  isMobileAuthConfigured,
  issueMobileAuthSession,
  verifyMobileAuthToken,
  type MobileAuthSessionResponse,
} from '@/lib/mobile-auth';

interface MobileAuthRefreshResponse {
  success: boolean;
  message: string;
  session?: MobileAuthSessionResponse;
  fieldErrors?: Record<string, string[]>;
}

const mobileAuthRefreshSchema = z.object({
  refreshToken: z.string().trim().min(20, 'Missing refresh token.'),
});

const MOBILE_AUTH_REFRESH_RATE_LIMIT = {
  bucket: 'mobile-auth-refresh',
  limit: 10,
  windowMs: 10 * 60 * 1000,
} as const;

const MOBILE_AUTH_UNAVAILABLE_MESSAGE =
  'Mobile sign-in is temporarily unavailable. Please try again later.';

export async function POST(request: Request): Promise<Response> {
  const rateLimitState = consumeRateLimit(
    request,
    MOBILE_AUTH_REFRESH_RATE_LIMIT
  );
  if (!rateLimitState.allowed) {
    return createRateLimitResponse(
      rateLimitState,
      'Too many refresh attempts. Please wait a few minutes and try again.'
    );
  }

  if (!isMobileAuthConfigured()) {
    return Response.json(
      {
        success: false,
        message: MOBILE_AUTH_UNAVAILABLE_MESSAGE,
      } satisfies MobileAuthRefreshResponse,
      { status: 503 }
    );
  }

  const rawBody = await readJsonBody(request);
  const parsed = mobileAuthRefreshSchema.safeParse(rawBody);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const claims = verifyMobileAuthToken(parsed.data.refreshToken, 'refresh');

  if (!claims) {
    return Response.json(
      {
        success: false,
        message: 'Refresh token is invalid or expired.',
      } satisfies MobileAuthRefreshResponse,
      { status: 401 }
    );
  }

  const session = issueMobileAuthSession({
    email: claims.email,
    name: claims.name,
    scopes: claims.scope,
    // Taken from the presented refresh token, never from the request body, so a
    // refresh cannot move a session from one store app to the other.
    platform: claims.platform,
    // The refresh token already carries the derived id, so identity survives a
    // refresh unchanged even if the customer's email has since changed.
    identity: {
      provider: claims.identityProvider,
      userId: claims.sub,
    },
  });

  if (!session) {
    return Response.json(
      {
        success: false,
        message: MOBILE_AUTH_UNAVAILABLE_MESSAGE,
      } satisfies MobileAuthRefreshResponse,
      { status: 503 }
    );
  }

  return Response.json(
    {
      success: true,
      message: 'Mobile session refreshed.',
      session,
    } satisfies MobileAuthRefreshResponse,
    { status: 200 }
  );
}
