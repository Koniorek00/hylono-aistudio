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
  MOBILE_AUTH_PLATFORMS,
  isMobileAuthConfigured,
  issueMobileAuthSession,
  type MobileAuthSessionResponse,
} from '@/lib/mobile-auth';
import {
  SOCIAL_ID_TOKEN_PROVIDERS,
  isSocialIdTokenProviderConfigured,
  verifySocialIdToken,
} from '@/lib/social-id-token';

interface MobileSocialAuthResponse {
  success: boolean;
  message: string;
  session?: MobileAuthSessionResponse;
  fieldErrors?: Record<string, string[]>;
}

const mobileSocialAuthSchema = z.object({
  provider: z.enum(SOCIAL_ID_TOKEN_PROVIDERS, {
    message: 'Specify a supported sign-in provider.',
  }),
  idToken: z.string().trim().min(20, 'Missing provider sign-in token.'),
  platform: z.enum(MOBILE_AUTH_PLATFORMS, {
    message: 'Specify the app platform.',
  }),
  // The app generates a nonce, passes it to the platform sign-in call, and sends it
  // here so a token captured from another session cannot be replayed.
  nonce: z.string().trim().min(8).optional(),
});

const MOBILE_SOCIAL_AUTH_RATE_LIMIT = {
  bucket: 'mobile-auth-social',
  limit: 10,
  windowMs: 10 * 60 * 1000,
} as const;

const UNAVAILABLE_MESSAGE =
  'Mobile sign-in is temporarily unavailable. Please try again later.';

/**
 * One message for every verification refusal. The caller learns that sign-in failed
 * and nothing about which check rejected it — a per-reason message would let someone
 * probe our audience and issuer configuration one request at a time.
 */
const REJECTED_MESSAGE = 'That sign-in could not be verified. Please try again.';

const unavailable = (): Response =>
  Response.json(
    {
      success: false,
      message: UNAVAILABLE_MESSAGE,
    } satisfies MobileSocialAuthResponse,
    { status: 503 }
  );

export async function POST(request: Request): Promise<Response> {
  const rateLimitState = consumeRateLimit(
    request,
    MOBILE_SOCIAL_AUTH_RATE_LIMIT
  );
  if (!rateLimitState.allowed) {
    return createRateLimitResponse(
      rateLimitState,
      'Too many sign-in attempts. Please wait a few minutes and try again.'
    );
  }

  if (!isMobileAuthConfigured()) {
    return unavailable();
  }

  const rawBody = await readJsonBody(request);
  const parsed = mobileSocialAuthSchema.safeParse(rawBody);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { provider, idToken, platform, nonce } = parsed.data;

  if (!isSocialIdTokenProviderConfigured(provider)) {
    return unavailable();
  }

  // App Store Guideline 4.8: an iOS build offering any other social sign-in must also
  // offer Apple. Refusing here turns a store rejection discovered at submission into
  // a configuration error visible on the first request.
  if (
    platform === 'ios' &&
    provider !== 'apple' &&
    !isSocialIdTokenProviderConfigured('apple')
  ) {
    console.error(
      `[mobile-auth] Refused ${provider} sign-in on iOS because Apple sign-in is not configured. App Store Guideline 4.8 requires Apple sign-in alongside any other social provider on iOS.`
    );

    return unavailable();
  }

  const verification = await verifySocialIdToken({
    provider,
    idToken,
    ...(nonce ? { expectedNonce: nonce } : {}),
  });

  if (verification.status !== 'verified') {
    // A provider outage or a missing client id is our problem, not the customer's
    // credential being wrong, so it is reported as retryable rather than as a
    // rejected sign-in.
    if (
      verification.reason === 'jwks_unavailable' ||
      verification.reason === 'not_configured'
    ) {
      return unavailable();
    }

    return Response.json(
      {
        success: false,
        message: REJECTED_MESSAGE,
      } satisfies MobileSocialAuthResponse,
      { status: 401 }
    );
  }

  const session = issueMobileAuthSession({
    email: verification.identity.email,
    ...(verification.identity.name ? { name: verification.identity.name } : {}),
    platform,
    // The provider's own subject, so a customer changing their email keeps their
    // identity, and two providers sharing an address stay separate customers.
    identity: {
      provider,
      providerSubject: verification.identity.subject,
    },
  });

  if (!session) {
    return unavailable();
  }

  return Response.json(
    {
      success: true,
      message: 'Mobile session ready.',
      session,
    } satisfies MobileSocialAuthResponse,
    { status: 200 }
  );
}
