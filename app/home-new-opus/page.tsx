import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { HomeNewOpus } from './_components/HomeNewOpus';

export const metadata: Metadata = createPageMetadata({
  title: 'Home New Opus - Homepage Redesign Prototype | Hylono',
  description:
    'Internal Hylono homepage redesign prototype: a technology atlas, a three-question pathfinder, an evidence ledger and rental or purchase access paths.',
  path: '/home-new-opus',
  ogImagePath: '/images/landing-2026/social.webp',
  forceNoIndex: true,
});

// [DECISION: SSG noindex because /home-new-opus is an internal homepage redesign prototype and must not compete with the canonical homepage.]
// Rendering strategy: static server-rendered sections with two small client islands (technology tabs, pathfinder); route-owned header and footer via RouteChrome.
export default function HomeNewOpusPage() {
  return <HomeNewOpus />;
}
