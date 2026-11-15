import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ReviewsHubPage } from '@/components/ReviewsHubPage';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';

// [DECISION: SSG with noindex,follow because this support route explains process-note boundaries and should not compete with canonical Hylono product, research, rental, or contact pages.]
// Rendering strategy: server component route renders the process-note boundary HTML directly; analytics remain in client leaf links only.

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Feedback Notes | Process and Support Boundaries',
  description:
    'Review Hylono process-note boundaries for onboarding, delivery, setup, rental logistics, manuals, maintenance, and support. No ratings or testimonials are published here.',
  path: '/reviews',
  forceNoIndex: true,
});

export default function ReviewsPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-reviews-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Feedback Notes | Process and Support Boundaries',
              description:
                'Review Hylono process-note boundaries for onboarding, delivery, setup, rental logistics, manuals, maintenance, and support. No ratings or testimonials are published here.',
              path: '/reviews',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            '@type': 'WebPage',
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': ORGANIZATION_ID() },
            keywords: 'Hylono process notes, Hylono feedback boundaries, setup support, rental onboarding, delivery logistics, support process',
          }}
        />
        <StructuredData
          id="jsonld-reviews-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Reviews', path: '/reviews' },
          ])}
        />
      </Suspense>
      <ReviewsHubPage />
    </>
  );
}
