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
const product = polishProductPages.hbot;

export const metadata: Metadata = createPageMetadata({
  title: 'Komory HBOT po polsku | Hylono',
  description: product.description,
  path: '/pl/product/hbot',
  forceNoIndex: true,
  locale: 'pl_PL',
  ogImagePath: product.image,
  ogImageAlt: product.imageAlt,
});

// [DECISION: SSG noindex because this is a Polish duplicate summary of the canonical HBOT product route, limited to the four-page Polish mini-site.]
// Rendering strategy: server-rendered Polish product summary with visible conservative limitations, local CTAs, WebPage schema, and no client-only product body.
export default function PolishHbotProductPage() {
  const webPageSchema = {
    ...createWebPageSchema({
      name: product.title,
      description: product.description,
      path: '/pl/product/hbot',
      dateModified: SCHEMA_DATE_MODIFIED,
      imageUrl: `${SITE_URL}${product.image}`,
    }),
    '@type': 'ItemPage',
    inLanguage: 'pl-PL',
    about: {
      '@type': 'Product',
      '@id': `${SITE_URL}/pl/product/hbot#product-summary`,
      name: product.name,
      url: `${SITE_URL}/pl/product/hbot`,
    },
    relatedLink: [`${SITE_URL}/pl`, `${SITE_URL}/pl/product/hydrogen`, `${SITE_URL}/pl/contact`],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#pl-product-hbot-headline', '#pl-product-hbot-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-pl-hbot-page" data={webPageSchema} />
        <StructuredData
          id="jsonld-pl-hbot-breadcrumb"
          data={{
            ...createBreadcrumbSchema([
              { name: 'Hylono po polsku', path: '/pl' },
              { name: 'Komory HBOT', path: '/pl/product/hbot' },
            ]),
            inLanguage: 'pl-PL',
          }}
        />
      </Suspense>
      <PolishProductPage product={product} />
    </>
  );
}
