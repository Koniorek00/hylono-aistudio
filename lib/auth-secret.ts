import { createHash } from 'node:crypto';

const DEVELOPMENT_AUTH_SECRET_NAMESPACE = 'hylono-auth-dev-fallback';

type AuthNodeEnv = 'development' | 'test' | 'production';

interface ResolveAuthSecretOptions {
  explicitSecret?: string;
  nodeEnv: AuthNodeEnv;
  seed?: string;
  allowProductionFallback?: boolean;
}

/**
 * Derives the **development** signing secret.
 *
 * This is `SHA-256("<hardcoded namespace>:<seed>")`. It is stable across processes and
 * identical in every checkout of this repository, so it must never protect production
 * traffic: anyone with a copy of the source can compute it and sign a valid token. It
 * exists so local development and test runs work without any configuration.
 */
export const deriveDevelopmentAuthSecret = (seed: string): string =>
  createHash('sha256')
    .update(`${DEVELOPMENT_AUTH_SECRET_NAMESPACE}:${seed}`)
    .digest('hex');

/**
 * Resolves a signing secret, preferring the explicitly configured one.
 *
 * Returns `undefined` in production when no explicit secret is set and the caller has not
 * opted into the derived fallback - callers must then fail closed rather than sign with a
 * guessable key.
 *
 * Note on `allowProductionFallback`: it is an escape hatch for local production-style
 * previews (`NODE_ENV=production`, no secret), and it is the reason the *value* of this
 * module must stay in non-production. Any caller that passes `true` in a real production
 * environment reintroduces a publicly derivable key. Gate it on the environment, never on
 * the host vendor: `allowProductionFallback: nodeEnv !== 'production'`.
 */
export const resolveAuthSecret = ({
  explicitSecret,
  nodeEnv,
  seed = process.cwd(),
  allowProductionFallback = false,
}: ResolveAuthSecretOptions): string | undefined => {
  const normalizedSecret = explicitSecret?.trim();

  if (normalizedSecret) {
    return normalizedSecret;
  }

  if (nodeEnv === 'production' && !allowProductionFallback) {
    return undefined;
  }

  return deriveDevelopmentAuthSecret(seed);
};
