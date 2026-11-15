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
import StructuredData from '@/src/components/StructuredData';
import { PolishHome } from './_components/PolishMiniSite';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const description =
  'Polska sekcja Hylono obejmuje strone startowa, HBOT, H2 oraz kontakt dla osob porownujacych technologie wellness.';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono po polsku | HBOT, H2 i kontakt',
  description,
  path: '/pl',
  forceNoIndex: true,
  locale: 'pl_PL',
});

// [DECISION: SSG noindex because /pl is an additive Polish duplicate mini-site, not the full canonical localized SEO graph.]
// Rendering strategy: server-rendered Polish answer block, visible local route graph, conservative schema, and no client-only dependency.
export default function PolishHomePage() {
  const webPageSchema = {
    ...createWebPageSchema({
      name: 'Hylono po polsku',
      description,
      path: '/pl',
      dateModified: SCHEMA_DATE_MODIFIED,
      imageUrl: `${SITE_URL}/images/chambers/oxyhelp-chambers-hero.jpg`,
    }),
    inLanguage: 'pl-PL',
    about: [
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/pl/product/hbot#product-summary`,
        name: 'Hylono HBOT',
        url: `${SITE_URL}/pl/product/hbot`,
      },
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/pl/product/hydrogen#product-summary`,
        name: 'Hylono H2',
        url: `${SITE_URL}/pl/product/hydrogen`,
      },
    ],
    mainEntity: { '@id': ORGANIZATION_ID() },
    relatedLink: [
      `${SITE_URL}/pl/product/hbot`,
      `${SITE_URL}/pl/product/hydrogen`,
      `${SITE_URL}/pl/contact`,
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#pl-home-hero-headline', '#pl-home-hero-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-pl-page" data={webPageSchema} />
        <StructuredData
          id="jsonld-pl-breadcrumb"
          data={{
            ...createBreadcrumbSchema([{ name: 'Hylono po polsku', path: '/pl' }]),
            inLanguage: 'pl-PL',
          }}
        />
      </Suspense>
      <PolishHome />
    </>
  );
}
