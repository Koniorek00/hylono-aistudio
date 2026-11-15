import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import StructuredData from '@/src/components/StructuredData';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import { PressClient } from './PressClient';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Press | Verified Company Background and Media Requests',
  description:
    'Review verified Hylono company background and use the main contact channel for media requests, interviews, or background materials.',
  path: '/press',
  forceNoIndex: true,
});

// [DECISION: SSG because /press is temporarily a noindex trust utility page that should publish only repo-verified company facts until approved press materials exist.]
// Rendering strategy: server-rendered noindex trust utility with route-local schema and a client presentation leaf for contact handoffs.
export default function PressPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-press-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Press',
              description:
                'Review verified Hylono company background and use the main contact channel for media requests, interviews, or background materials.',
              path: '/press',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            '@type': 'WebPage',
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': ORGANIZATION_ID() },
            keywords:
              'Hylono press, Hylono company background, media requests, wellness technology company facts',
            relatedLink: [
              `${SITE_URL}/about`,
              `${SITE_URL}/research`,
              `${SITE_URL}/help`,
              `${SITE_URL}/contact`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#press-hero-headline', '#press-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-press-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Press', path: '/press' },
          ])}
        />
      </Suspense>
      <PressClient />
    </>
  );
}
