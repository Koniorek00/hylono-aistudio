import { createHmac, timingSafeEqual } from 'node:crypto';
import { resolveAuthSecret } from '@/lib/auth-secret';
import {
  type MobileIdentityInput,
  type MobileIdentityProvider,
  deriveMobileUserId,
  isMobileIdentityProvider,
  isMobileUserId,
  resolveMobileUserId,
} from '@/lib/mobile-identity';

const MOBILE_AUTH_ISSUER = 'hylono-mobile-auth';
/**
 * One audience serves both store apps. This deliberately does not name a single
 * platform: an iOS build must never have to present itself as Android to be
 * accepted. The holding platform is carried in the `platform` claim instead.
 * See docs/decisions/ADR-2026-08-22-mobile-apps-and-shared-core.md section 6.
 */
const MOBILE_AUTH_AUDIENCE = 'hylono-mobile';
const MOBILE_ACCESS_TOKEN_TTL_SECONDS = 15 * 60;
const MOBILE_REFRESH_TOKEN_TTL_SECONDS = 30 * 24 * 60 * 60;

export const MOBILE_AUTH_SCOPE_RENTALS_READ = 'rentals:read';

export const MOBILE_AUTH_PLATFORMS = ['android', 'ios'] as const;

export type MobileAuthPlatform = (typeof MOBILE_AUTH_PLATFORMS)[number];

const isMobileAuthPlatform = (value: unknown): value is MobileAuthPlatform =>
  typeof value === 'string' &&
  (MOBILE_AUTH_PLATFORMS as readonly string[]).includes(value);

type MobileTokenType = 'access' | 'refresh';

interface MobileTokenClaims {
  iss: string;
  aud: string;
  /** A stable opaque user id from lib/mobile-identity.ts — never the email. */
  sub: string;
  identityProvider: MobileIdentityProvider;
  email: string;
  name: string;
  platform: MobileAuthPlatform;
  scope: string[];
  type: MobileTokenType;
  iat: number;
  exp: number;
}

export interface MobileAuthSessionResponse {
  tokenType: 'Bearer';
  accessToken: string;
  accessTokenExpiresAtEpochSeconds: number;
  refreshToken: string;
  refreshTokenExpiresAtEpochSeconds: number;
  platform: MobileAuthPlatform;
  scopes: string[];
  user: {
    /** Stable opaque id. Safe to persist as the customer's identity. */
    id: string;
    identityProvider: MobileIdentityProvider;
    email: string;
    name: string;
  };
}

interface IssueMobileSessionOptions {
  email: string;
  platform: MobileAuthPlatform;
  identity: MobileIdentityInput;
  name?: string;
  scopes?: string[];
  now?: Date;
}

const base64UrlEncode = (value: string): string =>
  Buffer.from(value, 'utf8').toString('base64url');

const base64UrlDecode = (value: string): string =>
  Buffer.from(value, 'base64url').toString('utf8');

const safeNodeEnv = (): 'development' | 'test' | 'production' => {
  const nodeEnv = process.env.NODE_ENV;

  if (
    nodeEnv === 'development' ||
    nodeEnv === 'test' ||
    nodeEnv === 'production'
  ) {
    return nodeEnv;
  }

  return 'development';
};

/**
 * Resolves the HMAC key for mobile access and refresh tokens.
 *
 * ## A missing secret in production is a hard configuration error
 *
 * `allowProductionFallback` is deliberately false when `NODE_ENV=production`, so
 * production returns `undefined` unless `MOBILE_AUTH_TOKEN_SECRET` (or `AUTH_SECRET` /
 * `NEXTAUTH_SECRET`) is set. That is the whole point: the development fallback is a plain
 * SHA-256 of a hardcoded namespace plus `process.cwd()`, so its value is derivable by
 * anyone with a copy of the source. The previous gate was `process.env.VERCEL !== '1'`,
 * which meant every production host that was *not* Vercel signed its tokens with that
 * derivable key - anyone could mint a valid access token and read rentals.
 *
 * `resolveAuthSecret` returning `undefined` is handled by `isMobileAuthConfigured()`,
 * which makes both mobile auth routes answer 503 with a message that names no
 * deployment detail. Fail closed, loudly, rather than sign with a guessable key.
 *
 * The token verification itself is unchanged and remains the strict path: HMAC compared
 * with `timingSafeEqual`, then `alg`/`typ`/`iss`/`aud`/`sub`/`identityProvider`/`platform`
 * /`type` checks and an `exp` check before any claim is used.
 */
const resolveMobileAuthSecret = (): string | undefined =>
  resolveAuthSecret({
    explicitSecret:
      process.env.MOBILE_AUTH_TOKEN_SECRET ??
      process.env.AUTH_SECRET ??
      process.env.NEXTAUTH_SECRET,
    nodeEnv: safeNodeEnv(),
    seed: `${process.cwd()}:mobile-auth`,
    // Non-production only. Never derive a key where NODE_ENV says production.
    allowProductionFallback: safeNodeEnv() !== 'production',
  });

const signToken = (unsignedToken: string, secret: string): string =>
  createHmac('sha256', secret).update(unsignedToken).digest('base64url');

const buildUnsignedToken = (claims: MobileTokenClaims): string => {
  const headerSegment = base64UrlEncode(
    JSON.stringify({
      alg: 'HS256',
      typ: 'JWT',
    })
  );
  const payloadSegment = base64UrlEncode(JSON.stringify(claims));

  return `${headerSegment}.${payloadSegment}`;
};

const createSignedToken = (
  claims: MobileTokenClaims,
  secret: string
): string => {
  const unsignedToken = buildUnsignedToken(claims);
  const signature = signToken(unsignedToken, secret);

  return `${unsignedToken}.${signature}`;
};

const createTokenClaims = ({
  userId,
  identityProvider,
  email,
  name,
  platform,
  scopes,
  now,
  ttlSeconds,
  type,
}: {
  userId: string;
  identityProvider: MobileIdentityProvider;
  email: string;
  name: string;
  platform: MobileAuthPlatform;
  scopes: string[];
  now: Date;
  ttlSeconds: number;
  type: MobileTokenType;
}): MobileTokenClaims => {
  const issuedAtSeconds = Math.floor(now.getTime() / 1000);

  return {
    iss: MOBILE_AUTH_ISSUER,
    aud: MOBILE_AUTH_AUDIENCE,
    sub: userId,
    identityProvider,
    email,
    name,
    platform,
    scope: scopes,
    type,
    iat: issuedAtSeconds,
    exp: issuedAtSeconds + ttlSeconds,
  };
};

const parseTokenClaims = (token: string): MobileTokenClaims | null => {
  const tokenParts = token.split('.');

  if (tokenParts.length !== 3) {
    return null;
  }

  const encodedHeader = tokenParts[0];
  const encodedPayload = tokenParts[1];
  const encodedSignature = tokenParts[2];
  const secret = resolveMobileAuthSecret();

  if (!secret || !encodedHeader || !encodedPayload || !encodedSignature) {
    return null;
  }

  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = signToken(unsignedToken, secret);
  const providedSignature = encodedSignature.trim();

  if (!providedSignature) {
    return null;
  }

  const expectedBuffer = Buffer.from(expectedSignature);
  const providedBuffer = Buffer.from(providedSignature);

  if (
    expectedBuffer.length !== providedBuffer.length ||
    !timingSafeEqual(expectedBuffer, providedBuffer)
  ) {
    return null;
  }

  try {
    const header = JSON.parse(base64UrlDecode(encodedHeader)) as {
      alg?: string;
      typ?: string;
    };
    const claims = JSON.parse(base64UrlDecode(encodedPayload)) as
      | MobileTokenClaims
      | undefined;

    if (
      header?.alg !== 'HS256' ||
      header?.typ !== 'JWT' ||
      !claims ||
      claims.iss !== MOBILE_AUTH_ISSUER ||
      claims.aud !== MOBILE_AUTH_AUDIENCE ||
      // Was `claims.sub !== claims.email`, which is exactly the defect this
      // replaces: it REQUIRED identity to be the mutable email.
      !isMobileUserId(claims.sub) ||
      !isMobileIdentityProvider(claims.identityProvider) ||
      !isMobileAuthPlatform(claims.platform) ||
      !Array.isArray(claims.scope) ||
      typeof claims.exp !== 'number' ||
      typeof claims.iat !== 'number' ||
      typeof claims.email !== 'string' ||
      typeof claims.name !== 'string' ||
      (claims.type !== 'access' && claims.type !== 'refresh')
    ) {
      return null;
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (claims.exp <= nowSeconds) {
      return null;
    }

    return claims;
  } catch {
    return null;
  }
};

export const isMobileAuthConfigured = (): boolean =>
  Boolean(resolveMobileAuthSecret());

export const issueMobileAuthSession = ({
  email,
  platform,
  identity,
  name = 'Hylono User',
  scopes = [MOBILE_AUTH_SCOPE_RENTALS_READ],
  now = new Date(),
}: IssueMobileSessionOptions): MobileAuthSessionResponse | null => {
  const secret = resolveMobileAuthSecret();

  if (!secret) {
    return null;
  }

  const userId = resolveMobileUserId(identity);

  if (!userId) {
    return null;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim() || 'Hylono User';
  const normalizedScopes = scopes
    .map((scope) => scope.trim())
    .filter(Boolean);

  const sharedClaims = {
    userId,
    identityProvider: identity.provider,
    email: normalizedEmail,
    name: normalizedName,
    platform,
    scopes: normalizedScopes,
    now,
  };

  const accessClaims = createTokenClaims({
    ...sharedClaims,
    ttlSeconds: MOBILE_ACCESS_TOKEN_TTL_SECONDS,
    type: 'access',
  });
  const refreshClaims = createTokenClaims({
    ...sharedClaims,
    ttlSeconds: MOBILE_REFRESH_TOKEN_TTL_SECONDS,
    type: 'refresh',
  });

  return {
    tokenType: 'Bearer',
    accessToken: createSignedToken(accessClaims, secret),
    accessTokenExpiresAtEpochSeconds: accessClaims.exp,
    refreshToken: createSignedToken(refreshClaims, secret),
    refreshTokenExpiresAtEpochSeconds: refreshClaims.exp,
    platform,
    scopes: normalizedScopes,
    user: {
      id: userId,
      identityProvider: identity.provider,
      email: normalizedEmail,
      name: normalizedName,
    },
  };
};

export const verifyMobileAuthToken = (
  token: string,
  expectedType?: MobileTokenType
): MobileTokenClaims | null => {
  const claims = parseTokenClaims(token);

  if (!claims) {
    return null;
  }

  if (expectedType && claims.type !== expectedType) {
    return null;
  }

  return claims;
};

export const readBearerToken = (request: Request): string | null => {
  const authorization = request.headers.get('authorization')?.trim();

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(/\s+/, 2);

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token.trim() || null;
};
