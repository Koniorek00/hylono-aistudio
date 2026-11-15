export type SocialAuthProviderId = 'google' | 'facebook' | 'apple';

export interface SocialAuthProviderOption {
  id: SocialAuthProviderId;
  name: string;
  enabled: boolean;
}
