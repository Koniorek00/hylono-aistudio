import type { Metadata } from 'next';
import { auth } from '@/lib/auth';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { PartnersClient } from './PartnersClient';

export const metadata: Metadata = createPageMetadata({
  title: 'Partner Access | Hylono',
  description:
    'Use Hylono partner access to sign in to account tools, request a manual clinic or distributor review, and avoid unsupported public program promises.',
  path: '/partners',
  forceNoIndex: true,
});

// [DECISION: keep the partner route request-time because auth() makes the primary CTA user-state aware while the public shell stays noindex, truthful, and useful without claiming public partner-program terms.]
// Rendering strategy: request-time server route that checks session state, then renders a public partner-access handoff with authenticated follow-through handled in the client leaf.
export default async function PartnersPageRoute() {
  const session = await auth();

  return (
    <>
      <StructuredData
        id="jsonld-partners-page"
        data={createWebPageSchema({
          name: 'Hylono Partner Access',
          description:
            'A Hylono partner-access handoff for account tool sign-in, manual commercial review, contact, and help routes.',
          path: '/partners',
          dateModified: SCHEMA_DATE_MODIFIED,
        })}
      />
      <StructuredData
        id="jsonld-partners-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Partner access', path: '/partners' },
        ])}
      />
      <PartnersClient isAuthenticated={Boolean(session?.user?.email)} />
    </>
  );
}
