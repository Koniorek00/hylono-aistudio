import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { RentalCheckoutClient } from './RentalCheckoutClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Rental Checkout',
  description: 'Finalize your Hylono rental plan details with delivery review, support context, and confirmation steps.',
  path: '/rental/checkout',
  forceNoIndex: true,
});

// [DECISION: SSR because rental checkout is personalized, transaction-sensitive, and must render per-request state.]
// Rendering strategy: server-routed noindex rental checkout shell with private rental interaction isolated in the client leaf and robots disallow coverage.
export default function RentalCheckoutPageRoute() {
  return <RentalCheckoutClient />;
}
