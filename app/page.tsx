import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import { ORGANIZATION_ID, createBreadcrumbSchema, createWebPageSchema } from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { LandingContent } from '@/components/landing-2026/LandingContent';

const updated = '2026-10-02';
const url = env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono | Wellness technology, considered for your life',
  description:
    'Explore wellness technology for your home or professional space. Compare equipment, read the research, and find your rental or purchase path with Hylono.',
  path: '/',
  ogImagePath: '/images/landing-2026/social.webp',
  ogImageAlt: 'Hylono — make room for a better routine. Concept wellness interior.',
});

// [DECISION: PPR because orientation content is static and schema preserves the request CSP nonce.]
// Rendering strategy: static content, native CSS and request-nonced schema in a separate boundary.

export default function HomePage() {
  const schema = {
    ...createWebPageSchema({
      name: 'Hylono — guided wellness technology',
      description:
        'Guided access to wellness equipment, research, routines, rental and purchase options for homes and professional spaces.',
      path: '/',
      dateModified: updated,
    }),
    mainEntity: { '@id': ORGANIZATION_ID() },
    mentions: ['/product/hbot', '/product/hydrogen', '/protocols', '/contact'].map((path) => ({
      '@type': 'WebPage',
      '@id': `${url}${path}`,
      url: `${url}${path}`,
    })),
    significantLink: [
      '/product/hbot',
      '/product/hydrogen',
      '/protocols',
      '/contact',
      '/store',
      '/rental',
      '/conditions',
      '/research',
    ].map((path) => `${url}${path}`),
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['#hero-title', '#hero-copy'] },
  };
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-homepage" data={schema} />
        <StructuredData
          id="jsonld-homepage-breadcrumb"
          data={createBreadcrumbSchema([{ name: 'Home', path: '/' }])}
        />
      </Suspense>
      <LandingContent />
    </>
  );
}
