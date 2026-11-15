import {
  type JsonWebKey as CryptoJsonWebKey,
  createPublicKey,
  createVerify,
} from 'node:crypto';
import { readRuntimeEnv } from './env';

/**
 * Verifies an OpenID Connect ID token issued by Google, Apple or Facebook, so a
 * native app can exchange a platform sign-in for a Hylono mobile session.
 *
 * Deliberately dependency-free: Node's crypto can build a public key straight from
 * a JWK, so no JWT library is added to the tree.
 *
 * See docs/decisions/ADR-2026-08-22-mobile-apps-and-shared-core.md section 5.
 */

export const SOCIAL_ID_TOKEN_PROVIDERS = ['google', 'apple', 'facebook'] as const;

export type SocialIdTokenProvider = (typeof SOCIAL_ID_TOKEN_PROVIDERS)[number];

export type SocialIdTokenFailureReason =
  | 'not_configured'
  | 'malformed'
  | 'unsupported_algorithm'
  | 'unknown_key'
  | 'bad_signature'
  | 'wrong_issuer'
  | 'wrong_audience'
  | 'expired'
  | 'email_missing'
  | 'email_unverified'
  | 'nonce_mismatch'
  | 'jwks_unavailable';

export interface SocialIdTokenIdentity {
  provider: SocialIdTokenProvider;
  /** The provider's own stable user id. Never the email. */
  subject: string;
  email: string;
  name?: string;
}

export type SocialIdTokenResult =
  | { status: 'verified'; identity: SocialIdTokenIdentity }
  | { status: 'rejected'; reason: SocialIdTokenFailureReason };

interface ProviderDefinition {
  /** Every issuer string the provider is known to mint tokens under. */
  issuers: readonly string[];
  jwksUri: string;
  /**
   * Environment variables holding the audiences this deployment accepts. A native
   * app usually has a different client id per platform than the website does, so
   * several are allowed and at least one must be set.
   */
  audienceEnvVars: readonly string[];
}

const PROVIDER_DEFINITIONS: Record<SocialIdTokenProvider, ProviderDefinition> = {
  google: {
    issuers: ['https://accounts.google.com', 'accounts.google.com'],
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
    audienceEnvVars: [
      'AUTH_GOOGLE_IOS_CLIENT_ID',
      'AUTH_GOOGLE_ANDROID_CLIENT_ID',
      'AUTH_GOOGLE_ID',
    ],
  },
  apple: {
    issuers: ['https://appleid.apple.com'],
    jwksUri: 'https://appleid.apple.com/auth/keys',
    // Native Apple sign-in sets `aud` to the app's bundle id, not the web service id.
    audienceEnvVars: ['AUTH_APPLE_BUNDLE_ID', 'AUTH_APPLE_ID'],
  },
  facebook: {
    // Facebook's OIDC "Limited Login" tokens. Classic access tokens are NOT accepted
    // here — they are not ID tokens and carry no verifiable signature.
    issuers: ['https://www.facebook.com', 'https://facebook.com'],
    jwksUri: 'https://www.facebook.com/.well-known/oauth/openid/jwks/',
    audienceEnvVars: ['AUTH_FACEBOOK_MOBILE_ID', 'AUTH_FACEBOOK_ID'],
  },
};

/** RSA and ECDSA only. `none` and the HMAC family are refused outright. */
const SUPPORTED_ALGORITHMS: Record<string, string> = {
  RS256: 'RSA-SHA256',
  RS384: 'RSA-SHA384',
  RS512: 'RSA-SHA512',
  ES256: 'sha256',
};

const JWKS_CACHE_TTL_MS = 10 * 60 * 1000;

interface JsonWebKey {
  kid?: string;
  kty?: string;
  alg?: string;
  use?: string;
  n?: string;
  e?: string;
  crv?: string;
  x?: string;
  y?: string;
}

interface CachedJwks {
  keys: JsonWebKey[];
  fetchedAtMs: number;
}

const jwksCache = new Map<SocialIdTokenProvider, CachedJwks>();

export const resetSocialIdTokenCacheForTests = (): void => {
  jwksCache.clear();
};

const decodeSegment = (segment: string): unknown => {
  try {
    return JSON.parse(Buffer.from(segment, 'base64url').toString('utf8'));
  } catch {
    return undefined;
  }
};

const readConfiguredAudiences = (
  provider: SocialIdTokenProvider
): string[] => {
  const { audienceEnvVars } = PROVIDER_DEFINITIONS[provider];

  return audienceEnvVars
    .map((name) => readRuntimeEnv(name)?.trim())
    .filter((value): value is string => Boolean(value));
};

export const isSocialIdTokenProviderConfigured = (
  provider: SocialIdTokenProvider
): boolean => readConfiguredAudiences(provider).length > 0;

export const getConfiguredSocialIdTokenProviders =
  (): SocialIdTokenProvider[] =>
    SOCIAL_ID_TOKEN_PROVIDERS.filter(isSocialIdTokenProviderConfigured);

const fetchJwks = async (
  provider: SocialIdTokenProvider
): Promise<JsonWebKey[] | null> => {
  const cached = jwksCache.get(provider);

  if (cached && Date.now() - cached.fetchedAtMs < JWKS_CACHE_TTL_MS) {
    return cached.keys;
  }

  try {
    const response = await fetch(PROVIDER_DEFINITIONS[provider].jwksUri, {
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      return cached?.keys ?? null;
    }

    const body = (await response.json()) as { keys?: JsonWebKey[] } | undefined;
    const keys = Array.isArray(body?.keys) ? body.keys : null;

    if (!keys) {
      return cached?.keys ?? null;
    }

    jwksCache.set(provider, { keys, fetchedAtMs: Date.now() });

    return keys;
  } catch {
    // A provider outage must not silently downgrade to "accept anything": fall back
    // to a warm cache if we have one, otherwise refuse.
    return cached?.keys ?? null;
  }
};

const verifySignature = (
  signingInput: string,
  signature: Buffer,
  jwk: JsonWebKey,
  algorithm: string
): boolean => {
  try {
    const publicKey = createPublicKey({
      key: jwk as CryptoJsonWebKey,
      format: 'jwk',
    });
    const nodeAlgorithm = SUPPORTED_ALGORITHMS[algorithm];

    if (!nodeAlgorithm) {
      return false;
    }

    const verifier = createVerify(nodeAlgorithm);
    verifier.update(signingInput);
    verifier.end();

    if (algorithm === 'ES256') {
      return verifier.verify(
        { key: publicKey, dsaEncoding: 'ieee-p1363' },
        signature
      );
    }

    return verifier.verify(publicKey, signature);
  } catch {
    return false;
  }
};

const isEmailVerified = (claim: unknown): boolean =>
  claim === true || claim === 'true';

const audienceMatches = (
  audienceClaim: unknown,
  configured: string[]
): boolean => {
  if (typeof audienceClaim === 'string') {
    return configured.includes(audienceClaim);
  }

  if (Array.isArray(audienceClaim)) {
    return audienceClaim.some(
      (entry) => typeof entry === 'string' && configured.includes(entry)
    );
  }

  return false;
};

export const verifySocialIdToken = async ({
  provider,
  idToken,
  expectedNonce,
  now = new Date(),
}: {
  provider: SocialIdTokenProvider;
  idToken: string;
  expectedNonce?: string;
  now?: Date;
}): Promise<SocialIdTokenResult> => {
  const configuredAudiences = readConfiguredAudiences(provider);

  if (configuredAudiences.length === 0) {
    return { status: 'rejected', reason: 'not_configured' };
  }

  const segments = idToken.trim().split('.');

  if (segments.length !== 3) {
    return { status: 'rejected', reason: 'malformed' };
  }

  const [encodedHeader, encodedPayload, encodedSignature] = segments as [
    string,
    string,
    string,
  ];
  const header = decodeSegment(encodedHeader) as
    | { alg?: string; kid?: string }
    | undefined;
  const claims = decodeSegment(encodedPayload) as
    | Record<string, unknown>
    | undefined;

  if (!header || !claims || !encodedSignature) {
    return { status: 'rejected', reason: 'malformed' };
  }

  if (!header.alg || !SUPPORTED_ALGORITHMS[header.alg]) {
    return { status: 'rejected', reason: 'unsupported_algorithm' };
  }

  const keys = await fetchJwks(provider);

  if (!keys) {
    return { status: 'rejected', reason: 'jwks_unavailable' };
  }

  const signingKey = keys.find(
    (key) => key.kid === header.kid && (!key.alg || key.alg === header.alg)
  );

  if (!signingKey) {
    return { status: 'rejected', reason: 'unknown_key' };
  }

  const signatureIsValid = verifySignature(
    `${encodedHeader}.${encodedPayload}`,
    Buffer.from(encodedSignature, 'base64url'),
    signingKey,
    header.alg
  );

  if (!signatureIsValid) {
    return { status: 'rejected', reason: 'bad_signature' };
  }

  if (
    typeof claims.iss !== 'string' ||
    !PROVIDER_DEFINITIONS[provider].issuers.includes(claims.iss)
  ) {
    return { status: 'rejected', reason: 'wrong_issuer' };
  }

  if (!audienceMatches(claims.aud, configuredAudiences)) {
    return { status: 'rejected', reason: 'wrong_audience' };
  }

  const nowSeconds = Math.floor(now.getTime() / 1000);

  if (typeof claims.exp !== 'number' || claims.exp <= nowSeconds) {
    return { status: 'rejected', reason: 'expired' };
  }

  if (expectedNonce && claims.nonce !== expectedNonce) {
    return { status: 'rejected', reason: 'nonce_mismatch' };
  }

  const email =
    typeof claims.email === 'string' ? claims.email.trim().toLowerCase() : '';

  if (!email) {
    // Apple only returns the email on the first authorization, and a user may hide
    // it. Say so plainly rather than inventing an address.
    return { status: 'rejected', reason: 'email_missing' };
  }

  if (!isEmailVerified(claims.email_verified)) {
    return { status: 'rejected', reason: 'email_unverified' };
  }

  const subject = typeof claims.sub === 'string' ? claims.sub.trim() : '';

  if (!subject) {
    return { status: 'rejected', reason: 'malformed' };
  }

  const name = typeof claims.name === 'string' ? claims.name.trim() : '';

  return {
    status: 'verified',
    identity: {
      provider,
      subject,
      email,
      ...(name ? { name } : {}),
    },
  };
};
