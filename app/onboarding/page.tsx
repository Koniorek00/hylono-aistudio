import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { OnboardingClient } from './OnboardingClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Onboarding',
  description: 'Follow your Hylono onboarding checklist to complete setup and begin your first protocol sessions.',
  path: '/onboarding',
  forceNoIndex: true,
});

// [DECISION: SSR because onboarding flow can depend on user/session context.]
// Rendering strategy: server-routed noindex onboarding shell with setup interaction isolated in the client leaf and robots disallow coverage.
export default function OnboardingPageRoute() {
  return <OnboardingClient />;
}
