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
import { isFeatureEnabled } from '@/utils/featureFlags';
import PreviewHomeClient from './PreviewHomeClient';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = createPageMetadata({
  title: 'Preview Route | Hylono UX preview',
  description:
    'Use this Hylono preview route to review a homepage-style experience before continuing to canonical product, protocol, research, or contact pages.',
  path: '/preview',
  forceNoIndex: true,
});

// [DECISION: SSG because preview is a static, additive clone of the homepage kept out of the index for UX iteration.]
// Rendering strategy: server-rendered preview route with crawlable HTML, noindex metadata, schema, and a client presentation layer for interaction experiments.
export default function PreviewPage() {
  const homepageAbsoluteLinks = homepagePrimaryLinks.map((link) => `${SITE_URL}${link.href}`);
  const homepageEnhancementsEnabled = isFeatureEnabled('feature_homepage_enhancements');
  const webPageSchema = {
    ...createWebPageSchema({
      name: 'Hylono Preview Route',
      description:
        'A Hylono preview route for reviewing a homepage-style experience before continuing to canonical product, protocol, research, or contact pages.',
      path: '/preview',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: [
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/product/hbot#product`,
        name: 'Hylono mHBOT',
        url: `${SITE_URL}/product/hbot`,
      },
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/product/hydrogen#product`,
        name: 'Hylono Hydrogen',
        url: `${SITE_URL}/product/hydrogen`,
      },
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/protocols`,
        name: 'Hylono Wellness Protocols',
        url: `${SITE_URL}/protocols`,
      },
    ],
    keywords: 'hylono preview route, ux preview, wellness technology navigation',
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#preview-hero-headline', '#preview-hero-description'],
    },
    mainEntity: { '@id': ORGANIZATION_ID() },
    mentions: [
      { '@type': 'Product', '@id': `${SITE_URL}/product/hbot#product`, url: `${SITE_URL}/product/hbot` },
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/product/hydrogen#product`,
        url: `${SITE_URL}/product/hydrogen`,
      },
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
          aria-label="Preview page no-script summary"
          className="mx-auto max-w-3xl border border-white/10 bg-slate-950 px-6 py-8 text-slate-200"
        >
          <p className="text-2xl font-semibold text-white">Hylono wellness technology platform</p>
          <p className="mt-3 text-base leading-7">
            Hylono provides access to oxygen, hydrogen, light, and signal-based systems through
            rental-first plans and guided protocols designed to support wellbeing.
          </p>
          <p className="mt-2 text-base leading-7">
            Enable JavaScript for the full interactive experience, or continue browsing key pages
            including protocols, product details, research, and contact.
          </p>
        </section>
      </noscript>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-preview-page" data={webPageSchema} />
        <StructuredData
          id="jsonld-preview-breadcrumb"
          data={createBreadcrumbSchema([{ name: 'Preview', path: '/preview' }])}
        />
      </Suspense>
      <PreviewHomeClient
        initialHomepageEnhancementsEnabled={homepageEnhancementsEnabled}
      />
    </>
  );
}
