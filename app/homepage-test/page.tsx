import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { homepagePrimaryLinks } from '@/content/topical-graph';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import HomeClient from './HomeClient';
import { isFeatureEnabled } from '@/utils/featureFlags';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono | Guided Access to Wellness Technologies',
  description:
    'Hylono is a European wellness-technology platform for guided device access, protocol planning, and conservative evidence-informed support across rental and ownership paths.',
  path: '/homepage-test',
  forceNoIndex: true,
});

// [DECISION: SSG because /homepage-test is a static homepage experiment kept noindex so it cannot compete with the canonical homepage.]
// Rendering strategy: server-rendered noindex experiment with crawlable hub references, route-local schema, and a client presentation layer for premium motion.
export default function HomePageTest() {
  const homepageEnhancementsEnabled = isFeatureEnabled('feature_homepage_enhancements');
  const homepageAbsoluteLinks = homepagePrimaryLinks.map((link) => `${SITE_URL}${link.href}`);
  const webPageSchema = {
    ...createWebPageSchema({
      name: 'Hylono',
      description:
        'Hylono is a European wellness-technology platform for guided device access, protocol planning, and conservative evidence-informed support across rental and ownership paths.',
      path: '/homepage-test',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: [
      { '@type': 'Product', '@id': `${SITE_URL}/product/hbot#product`, name: 'Hylono mHBOT', url: `${SITE_URL}/product/hbot` },
      { '@type': 'Product', '@id': `${SITE_URL}/product/hydrogen#product`, name: 'Hylono Hydrogen', url: `${SITE_URL}/product/hydrogen` },
      { '@type': 'Product', '@id': `${SITE_URL}/product/rlt#product`, name: 'Hylono PBM / Red Light', url: `${SITE_URL}/product/rlt` },
      { '@type': 'Product', '@id': `${SITE_URL}/product/pemf#product`, name: 'Hylono PEMF + VNS', url: `${SITE_URL}/product/pemf` },
      { '@type': 'CollectionPage', '@id': `${SITE_URL}/protocols`, name: 'Hylono Wellness Protocols', url: `${SITE_URL}/protocols` },
    ],
    keywords: 'hyperbaric oxygen therapy, hydrogen support, red light therapy, PEMF, guided wellness technology, device access planning, evidence-informed wellness',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#home-hero-headline', '#home-hero-description'],
    },
    mainEntity: { '@id': ORGANIZATION_ID() },
    mentions: [
      { '@type': 'Product', '@id': `${SITE_URL}/product/hbot#product`, url: `${SITE_URL}/product/hbot` },
      { '@type': 'Product', '@id': `${SITE_URL}/product/hydrogen#product`, url: `${SITE_URL}/product/hydrogen` },
      { '@type': 'Product', '@id': `${SITE_URL}/product/rlt#product`, url: `${SITE_URL}/product/rlt` },
      { '@type': 'Product', '@id': `${SITE_URL}/product/pemf#product`, url: `${SITE_URL}/product/pemf` },
      { '@type': 'CollectionPage', '@id': `${SITE_URL}/protocols`, url: `${SITE_URL}/protocols` },
      { '@type': 'CollectionPage', '@id': `${SITE_URL}/conditions`, url: `${SITE_URL}/conditions` },
    ],
    significantLink: homepageAbsoluteLinks,
    relatedLink: [...homepageAbsoluteLinks, `${SITE_URL}/contact`],
  };

  return (
    <>
      <noscript>
        <section
          aria-label="Homepage no-script summary"
          className="mx-auto max-w-3xl px-6 py-8 text-slate-900"
        >
          <p className="text-2xl font-semibold">Guided access to wellness technologies</p>
          <p className="mt-3 text-base leading-7">
            Hylono is a European wellness-technology platform focused on guided device access,
            protocol planning, and conservative evidence-informed support for home users and
            professionals.
          </p>
          <p className="mt-2 text-base leading-7">
            Continue browsing the core hubs for technologies, research, protocols, rentals, and
            consultation support if JavaScript is unavailable.
          </p>
        </section>
      </noscript>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-homepage-test" data={webPageSchema} />
        <StructuredData
          id="jsonld-homepage-test-breadcrumb"
          data={createBreadcrumbSchema([{ name: 'Homepage test', path: '/homepage-test' }])}
        />
      </Suspense>
      <HomeClient initialHomepageEnhancementsEnabled={homepageEnhancementsEnabled} />
    </>
  );
}
