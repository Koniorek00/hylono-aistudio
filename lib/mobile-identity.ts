import { createHash } from 'node:crypto';

/**
 * A stable identity for a mobile customer.
 *
 * The mobile token used to set `sub` to the email address, which made identity
 * mutable: changing an email silently produced a different customer, and two
 * providers returning the same address collapsed into one. `sub` is now derived
 * from the thing that does not change — the provider plus that provider's own
 * subject — while the email stays a mutable profile field.
 *
 * See docs/decisions/ADR-2026-08-22-mobile-apps-and-shared-core.md section 5.
 */

export const MOBILE_IDENTITY_PROVIDERS = [
  'email',
  'google',
  'apple',
  'facebook',
] as const;

export type MobileIdentityProvider =
  (typeof MOBILE_IDENTITY_PROVIDERS)[number];

export interface MobileIdentityRef {
  provider: MobileIdentityProvider;
  /**
   * The provider's own stable subject. For `email` sign-in there is no external
   * provider, so the normalised email address is the subject — email sign-in is
   * therefore the one case where changing the address does change the identity,
   * which is inherent to using the address as the credential.
   */
  providerSubject: string;
}

export const isMobileIdentityProvider = (
  value: unknown
): value is MobileIdentityProvider =>
  typeof value === 'string' &&
  (MOBILE_IDENTITY_PROVIDERS as readonly string[]).includes(value);

const USER_ID_PREFIX = 'usr_';

/**
 * Domain separation, so a hash produced here can never collide with a hash
 * produced elsewhere in the system over the same input.
 */
const DERIVATION_DOMAIN = 'hylono:mobile-identity:v1';

/**
 * Deliberately NOT keyed with a secret. A keyed derivation would tie every
 * customer id to `MOBILE_AUTH_TOKEN_SECRET`, so rotating that secret — ordinary
 * security hygiene — would silently reassign every customer a new identity and
 * detach them from their orders. The id is an identifier, not a credential:
 * holding one grants nothing, because a verified token is still required. So a
 * plain digest is correct and rotation-safe.
 */
export const deriveMobileUserId = ({
  provider,
  providerSubject,
}: MobileIdentityRef): string | null => {
  const normalizedSubject = providerSubject.trim().toLowerCase();

  if (!normalizedSubject) {
    return null;
  }

  const digest = createHash('sha256')
    .update(`${DERIVATION_DOMAIN}:${provider}:${normalizedSubject}`, 'utf8')
    .digest('base64url')
    .slice(0, 32);

  return `${USER_ID_PREFIX}${digest}`;
};

export const isMobileUserId = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.startsWith(USER_ID_PREFIX) &&
  value.length === USER_ID_PREFIX.length + 32;

/**
 * A refresh already holds a derived id in the presented token and does NOT hold the
 * provider's subject — the subject is deliberately kept out of our tokens. So a
 * reissue passes the id it already has, rather than the material to derive it.
 */
export type MobileIdentityInput =
  | MobileIdentityRef
  | { provider: MobileIdentityProvider; userId: string };

export const resolveMobileUserId = (
  input: MobileIdentityInput
): string | null => {
  if ('userId' in input) {
    return isMobileUserId(input.userId) ? input.userId : null;
  }

  return deriveMobileUserId(input);
};
