import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createCollectionPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { MeridianClient } from './MeridianClient';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const meridianSchemaDestinations = [
  { href: '/about', title: 'About Hylono' },
  { href: '/research', title: 'Research summaries' },
  { href: '/protocols', title: 'Protocol guides' },
  { href: '/store', title: 'Product hubs' },
  { href: '/rental', title: 'Rental planning' },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: 'Meridian Guide | Company context, research, and support',
  description:
    'Use this secondary Hylono guide to choose the next page for company context, research, protocol guides, product comparison, rental planning, or a prefilled support follow-up.',
  path: '/meridian',
  forceNoIndex: true,
});

// [DECISION: SSG because /meridian is a noindex orientation route that should briefly orient visitors and route them into stronger public pages without client-only gating.]
// Rendering strategy: server-rendered noindex overview page with direct HTML links into canonical about, research, protocol, store, rental, and contact destinations.
export default function MeridianPageRoute() {
  const meridianPageSchema = {
    ...createCollectionPageSchema({
      name: 'Hylono Meridian Guide',
      description:
        'A Hylono orientation page that sends visitors to company context, research summaries, protocol guides, product hubs, rental planning, and direct support.',
      path: '/meridian',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: { '@id': ORGANIZATION_ID() },
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: meridianSchemaDestinations.length,
      itemListElement: meridianSchemaDestinations.map((destination, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: destination.title,
        url: `${SITE_URL}${destination.href}`,
      })),
    },
    hasPart: meridianSchemaDestinations.map((destination) => ({
      '@type': 'WebPage',
      name: destination.title,
      url: `${SITE_URL}${destination.href}`,
    })),
    relatedLink: [
      `${SITE_URL}/about`,
      `${SITE_URL}/research`,
      `${SITE_URL}/protocols`,
      `${SITE_URL}/store`,
      `${SITE_URL}/rental`,
      `${SITE_URL}/contact`,
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#meridian-hero-headline', '#meridian-hero-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-meridian-page" data={meridianPageSchema} />
        <StructuredData
          id="jsonld-meridian-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Meridian guide', path: '/meridian' },
          ])}
        />
      </Suspense>
      <MeridianClient />
    </>
  );
}
