import { z } from 'zod';
import {
  createRateLimitResponse,
  consumeRateLimit,
} from '@/app/api/_shared/rate-limit';
import {
  readJsonBody,
  validationErrorResponse,
} from '@/app/api/_shared/validation';
import { verifyConfiguredCredentials } from '@/lib/auth-credentials';
import {
  MOBILE_AUTH_PLATFORMS,
  isMobileAuthConfigured,
  issueMobileAuthSession,
  type MobileAuthSessionResponse,
} from '@/lib/mobile-auth';

interface MobileAuthRouteResponse {
  success: boolean;
  message: string;
  session?: MobileAuthSessionResponse;
  fieldErrors?: Record<string, string[]>;
}

const mobileAuthSchema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter a password.'),
  // Required, never defaulted: a token must state which store app holds it, and a
  // silent default would let one platform be issued a token labelled as the other.
  platform: z.enum(MOBILE_AUTH_PLATFORMS, {
    message: 'Specify the app platform.',
  }),
});

const MOBILE_AUTH_RATE_LIMIT = {
  bucket: 'mobile-auth',
  limit: 5,
  windowMs: 10 * 60 * 1000,
} as const;

const MOBILE_AUTH_UNAVAILABLE_MESSAGE =
  'Mobile sign-in is temporarily unavailable. Please try again later.';

export async function POST(request: Request): Promise<Response> {
  const rateLimitState = consumeRateLimit(request, MOBILE_AUTH_RATE_LIMIT);
  if (!rateLimitState.allowed) {
    return createRateLimitResponse(
      rateLimitState,
      'Too many sign-in attempts. Please wait a few minutes and try again.'
    );
  }

  if (!isMobileAuthConfigured()) {
    return Response.json(
      {
        success: false,
        message: MOBILE_AUTH_UNAVAILABLE_MESSAGE,
      } satisfies MobileAuthRouteResponse,
      { status: 503 }
    );
  }

  const rawBody = await readJsonBody(request);
  const parsed = mobileAuthSchema.safeParse(rawBody);

  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const verification = verifyConfiguredCredentials(parsed.data);

  if (verification.status === 'not_configured') {
    return Response.json(
      {
        success: false,
        message: MOBILE_AUTH_UNAVAILABLE_MESSAGE,
      } satisfies MobileAuthRouteResponse,
      { status: 503 }
    );
  }

  if (verification.status !== 'success') {
    return Response.json(
      {
        success: false,
        message: 'Invalid email or password.',
      } satisfies MobileAuthRouteResponse,
      { status: 401 }
    );
  }

  const session = issueMobileAuthSession({
    email: verification.email,
    name: verification.name,
    platform: parsed.data.platform,
    // Email sign-in has no external provider, so the address is the subject.
    identity: { provider: 'email', providerSubject: verification.email },
  });

  if (!session) {
    return Response.json(
      {
        success: false,
        message: MOBILE_AUTH_UNAVAILABLE_MESSAGE,
      } satisfies MobileAuthRouteResponse,
      { status: 503 }
    );
  }

  return Response.json(
    {
      success: true,
      message: 'Mobile session ready.',
      session,
    } satisfies MobileAuthRouteResponse,
    { status: 200 }
  );
}
