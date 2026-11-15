import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { createPageMetadata } from '@/lib/seo-metadata';

// [DECISION: /compare redirects permanently to the canonical comparison hub /compare/rent-vs-buy.]
// Rendering strategy: permanent server redirect to canonical path.
export const metadata: Metadata = createPageMetadata({
  title: 'Compare Recovery & Longevity Systems | Hylono',
  description: 'Compare Hylono rental access versus direct ownership before choosing a path.',
  path: '/compare',
  forceNoIndex: true,
});

export default function CompareIndexPage() {
  permanentRedirect('/compare/rent-vs-buy');
}
