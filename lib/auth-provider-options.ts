import {
  type SocialAuthProviderId,
  type SocialAuthProviderOption,
} from './auth-provider-types';
import { readRuntimeEnv } from './env';

const SOCIAL_AUTH_PROVIDER_DEFINITIONS = [
  { id: 'google', name: 'Google' },
  { id: 'facebook', name: 'Facebook' },
  { id: 'apple', name: 'Apple' },
] as const satisfies ReadonlyArray<{
  id: SocialAuthProviderId;
  name: string;
}>;

const readSocialProviderCredential = (
  providerId: SocialAuthProviderId,
  suffix: 'ID' | 'SECRET'
): string | undefined =>
  readRuntimeEnv(`AUTH_${providerId.toUpperCase()}_${suffix}`)?.trim();

export const isSocialAuthProviderEnabled = (
  providerId: SocialAuthProviderId
): boolean =>
  Boolean(
    readSocialProviderCredential(providerId, 'ID') &&
      readSocialProviderCredential(providerId, 'SECRET')
  );

export const getSocialAuthProviderOptions = (): SocialAuthProviderOption[] =>
  SOCIAL_AUTH_PROVIDER_DEFINITIONS.map((provider) => ({
    ...provider,
    enabled: isSocialAuthProviderEnabled(provider.id),
  }));
