import type { Metadata } from 'next';
import { EliteHome } from '@/components/hylono-elite/EliteHome';
import { createPageMetadata } from '@/lib/seo-metadata';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Elite - Front Page Redesign Prototype | Hylono',
  description:
    'Internal Hylono front page prototype for an image-led wellness-technology homepage: technology atlas, routine guidance, access paths and evidence context.',
  path: '/hylono-elite',
  ogImagePath: '/images/landing-2026/social.webp',
  ogImageAlt: 'Hylono — make room for a better routine. Concept wellness interior.',
  forceNoIndex: true,
});

// [DECISION: SSG noindex because /hylono-elite is an internal front-page redesign prototype and must not compete with the canonical homepage.]
// Rendering strategy: static server-rendered sections on the standard site chrome; client leaves only drive the hero technology preview, atlas focus and consent-aware analytics.
export default function HylonoElitePage() {
  return <EliteHome />;
}
