import type { Metadata } from 'next';
import { Suspense } from 'react';
import { SitemapPage } from '@/components/SitemapPage';
import { getCanonicalSitemapEntries } from '@/lib/canonical-sitemap';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Sitemap | Public Page Directory',
  description:
    'Browse the canonical public Hylono page directory, including product hubs, research, protocols, support pages, company information, and policies.',
  path: '/sitemap',
});

// [DECISION: SSG because the HTML sitemap is generated from the canonical static sitemap inventory and has no per-request personalization.]
// Rendering strategy: server-rendered HTML sitemap generated from the canonical sitemap inventory with route-local schema.
export default function HtmlSitemapPageRoute() {
  const entries = getCanonicalSitemapEntries();
  const relatedLink = entries.map((entry) => entry.url);

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-html-sitemap-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Sitemap',
              description:
                'Browse the canonical public Hylono page directory, including product hubs, research, protocols, support pages, company information, and policies.',
              path: '/sitemap',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            relatedLink,
          }}
        />
        <StructuredData
          id="jsonld-html-sitemap-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Sitemap', path: '/sitemap' },
          ])}
        />
      </Suspense>
      <SitemapPage entries={entries} />
    </>
  );
}
