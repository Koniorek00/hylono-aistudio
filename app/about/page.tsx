import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
import { AboutPage } from '@/components/AboutPage';
import StructuredData from '@/src/components/StructuredData';

export const metadata: Metadata = createPageMetadata({
  title: 'About Hylono | Trust, Support, and Wellness Technology Guidance',
  description:
    'Learn how Hylono explains its European wellness technology platform, support model, trust roles, and conservative evidence-informed guidance.',
  path: '/about',
});

// [DECISION: SSG because this is static informational brand content with no per-request personalization.]
// Rendering strategy: server-rendered indexable about route with route-local schema and static brand/support content.
export default function AboutPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-about-page"
          data={{
            ...createWebPageSchema({
              name: 'About Hylono',
              description:
                'Learn how Hylono explains its European wellness technology platform, support model, trust roles, and conservative evidence-informed guidance.',
              path: '/about',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            '@type': 'AboutPage',
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': ORGANIZATION_ID() },
            keywords: 'Hylono, wellness technology company, European wellness platform, guided device access, protocol planning, support model, evidence-informed wellness',
            mentions: [
              { '@type': 'Organization', '@id': ORGANIZATION_ID() },
              { '@type': 'Brand', '@id': `${SITE_URL}/#brand` },
              { '@type': 'ContactPage', '@id': `${SITE_URL}/contact`, url: `${SITE_URL}/contact` },
              { '@type': 'FAQPage', '@id': `${SITE_URL}/faq`, url: `${SITE_URL}/faq` },
              // Reference only: the `/research` node is declared by the research route, so a
              // `@type` here would compete with the node that route publishes under this id.
              { '@id': `${SITE_URL}/research`, url: `${SITE_URL}/research` },
            ],
            relatedLink: [
              `${SITE_URL}/help`,
              `${SITE_URL}/faq`,
              `${SITE_URL}/research`,
              `${SITE_URL}/press`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/policies`,
              `${SITE_URL}/privacy`,
              `${SITE_URL}/cookie-policy`,
              `${SITE_URL}/terms`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#about-hero-headline', '#about-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-about-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'About', path: '/about' },
          ])}
        />
      </Suspense>
      <AboutPage />
    </>
  );
}
