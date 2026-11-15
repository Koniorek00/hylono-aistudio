import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CareersClient } from './CareersClient';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const careersRelatedLinks = ['/about', '/contact', '/help'] as const;

export const metadata: Metadata = createPageMetadata({
  title: 'Careers and Hiring | Hylono',
  description:
    'Review Hylono hiring status and use contact for manual follow-up about current or future opportunities.',
  path: '/careers',
  forceNoIndex: true,
});

// [DECISION: SSG because the careers route renders a static informational shell and remains noindex while not part of the canonical public SEO graph.]
// Rendering strategy: server-rendered wrapper around the existing client page so the route resolves without promoting it as indexable content.
export default function CareersPageRoute() {
  const careersPageSchema = {
    ...createWebPageSchema({
      name: 'Careers and Hiring | Hylono',
      description:
        'Secondary hiring guidance that directs careers inquiries into Hylono contact, company, and help pages without publishing speculative openings.',
      path: '/careers',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    relatedLink: careersRelatedLinks.map((href) => `${SITE_URL}${href}`),
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-careers-page" data={careersPageSchema} />
        <StructuredData
          id="jsonld-careers-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Careers and hiring', path: '/careers' },
          ])}
        />
      </Suspense>
      <CareersClient />
    </>
  );
}
