import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import HeroOpusPage from '../hylono-opus-new/page';

export const metadata: Metadata = createPageMetadata({
  title: 'Hero Opus - Elite Front Page Prototype | Hylono',
  description:
    'Internal Hylono front page prototype for comparing wellness-technology navigation, evidence review, protocol planning, and rental access paths.',
  path: '/hero-opus',
  forceNoIndex: true,
});

// [DECISION: SSG noindex because /hero-opus is an internal front-page prototype and must not compete with the canonical homepage.]
// Rendering strategy: server-routed prototype shell with noindex metadata and an isolated client presentation experiment.
export default HeroOpusPage;
