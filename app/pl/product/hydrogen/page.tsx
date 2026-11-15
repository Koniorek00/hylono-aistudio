import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { PolishProductPage, polishProductPages } from '../../_components/PolishMiniSite';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const product = polishProductPages.hydrogen;

export const metadata: Metadata = createPageMetadata({
  title: 'H2 i wodor molekularny po polsku | Hylono',
  description: product.description,
  path: '/pl/product/hydrogen',
  forceNoIndex: true,
  locale: 'pl_PL',
  ogImagePath: product.image,
  ogImageAlt: product.imageAlt,
});

// [DECISION: SSG noindex because this is a Polish duplicate summary of the canonical hydrogen product route, limited to the four-page Polish mini-site.]
// Rendering strategy: server-rendered Polish product summary with visible conservative limitations, local CTAs, WebPage schema, and no client-only product body.
export default function PolishHydrogenProductPage() {
  const webPageSchema = {
    ...createWebPageSchema({
      name: product.title,
      description: product.description,
      path: '/pl/product/hydrogen',
      dateModified: SCHEMA_DATE_MODIFIED,
      imageUrl: `${SITE_URL}${product.image}`,
    }),
    '@type': 'ItemPage',
    inLanguage: 'pl-PL',
    about: {
      '@type': 'Product',
      '@id': `${SITE_URL}/pl/product/hydrogen#product-summary`,
      name: product.name,
      url: `${SITE_URL}/pl/product/hydrogen`,
    },
    relatedLink: [`${SITE_URL}/pl`, `${SITE_URL}/pl/product/hbot`, `${SITE_URL}/pl/contact`],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#pl-product-hydrogen-headline', '#pl-product-hydrogen-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-pl-hydrogen-page" data={webPageSchema} />
        <StructuredData
          id="jsonld-pl-hydrogen-breadcrumb"
          data={{
            ...createBreadcrumbSchema([
              { name: 'Hylono po polsku', path: '/pl' },
              { name: 'Wodor molekularny', path: '/pl/product/hydrogen' },
            ]),
            inLanguage: 'pl-PL',
          }}
        />
      </Suspense>
      <PolishProductPage product={product} />
    </>
  );
}
