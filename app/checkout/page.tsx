import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { CheckoutClient } from './CheckoutClient';

// [DECISION: checkout route is transaction-sensitive and remains request-time rendered under Next.js 16 Cache Components defaults; explicit `dynamic` segment config is removed because it is incompatible when cacheComponents is enabled. Reverse only if checkout is redesigned to static-safe behavior.]
// Rendering strategy: server-routed noindex checkout shell with private order interaction isolated in the client leaf and robots disallow coverage.

export const metadata: Metadata = createPageMetadata({
  title: 'Checkout',
  description: 'Complete your Hylono checkout details with shipping review, support context, and confirmation steps.',
  path: '/checkout',
  forceNoIndex: true,
});

export default function CheckoutPageRoute() {
  return <CheckoutClient />;
}
