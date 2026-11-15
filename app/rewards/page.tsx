import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { RewardsClient } from './RewardsClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Rewards Support Preview | Hylono manual review routes',
  description:
    'Find store, help, or contact routes for manual rewards questions without relying on public program promises.',
  path: '/rewards',
  forceNoIndex: true,
});

// [DECISION: keep the rewards route request-time because auth() makes the page user-state aware under Next.js 16 cache components without an explicit dynamic export, while the public preview should remain visible for unauthenticated visitors.]
// Rendering strategy: request-time server route that checks session state and serves a noindex rewards preview with authenticated navigation handled in the client leaf.
export default async function RewardsPageRoute() {
  const session = await auth();

  return (
    <>
      <StructuredData
        id="jsonld-rewards-page"
        data={createWebPageSchema({
          name: 'Hylono Rewards Preview',
          description:
            'A Hylono rewards preview that directs visitors to store, help, and contact routes for manual rewards questions.',
          path: '/rewards',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-rewards-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Rewards preview', path: '/rewards' },
        ])}
      />
      <RewardsClient isAuthenticated={Boolean(session?.user?.email)} />
    </>
  );
}
