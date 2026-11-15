import type { Metadata } from 'next';
import { createPageMetadata } from '@/lib/seo-metadata';
import { createBreadcrumbSchema, createCollectionPageSchema } from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { partnerDirectoryMeta } from '@/content/partners';
import { Locator2Experience } from './Locator2Experience';

export const metadata: Metadata = createPageMetadata({
  title: 'Request a Hylono Partner Introduction | Manual Support Handoff',
  description:
    'Tell Hylono your city, technology interest, and access goals to request a manual support handoff while public partner records are under review.',
  path: '/locator2',
  forceNoIndex: true,
});

// [DECISION: SSG because the locator is a noindex utility page that routes visitors into a manual Hylono contact flow while partner records are under review.]
// Rendering strategy: server-rendered static HTML so the request path stays understandable without client-side maps, filters, or hydration.
export default function Locator2PageRoute() {
  const locatorCollectionSchema = createCollectionPageSchema({
    name: 'Hylono partner introduction page',
    description:
      'A Hylono support page that directs visitors into the contact flow for a manual partner-introduction request.',
    path: '/locator2',
    dateModified: partnerDirectoryMeta.lastReviewed,
  });

  return (
    <>
      <StructuredData id="jsonld-locator2-page" data={locatorCollectionSchema} />
      <StructuredData
        id="jsonld-locator2-breadcrumb"
        data={createBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Partner Locator', path: '/locator2' },
        ])}
      />
      <Locator2Experience />
    </>
  );
}
