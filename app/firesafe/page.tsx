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
import { FiresafeClient } from './FiresafeClient';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const firesafeSchemaDestinations = [
  { href: '/store', title: 'Store and product pages' },
  { href: '/rental', title: 'Rental planning' },
  { href: '/help', title: 'Help and policy pages' },
  { href: '/contact', title: 'Contact Hylono' },
  { href: '/about', title: 'About Hylono' },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: 'Firesafe guide | Hylono support and next steps',
  description:
    'Use this secondary Hylono guide to move Firesafe-related questions into support, store context, rental planning, and direct contact.',
  path: '/firesafe',
  forceNoIndex: true,
});

// [DECISION: SSG because /firesafe is a noindex orientation route that should route visitors into stronger support, store, rental, and contact pages without thin promotional copy.]
// Rendering strategy: server-rendered noindex overview page with direct HTML links into canonical help, store, rental, about, and contact destinations.
export default function FiresafePageRoute() {
  const firesafePageSchema = {
    ...createCollectionPageSchema({
      name: 'Hylono Firesafe Guide',
      description:
        'A Hylono orientation page that sends visitors to store, rental, help, contact, and company background pages without unsupported distributor or proof claims.',
      path: '/firesafe',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: { '@id': ORGANIZATION_ID() },
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: firesafeSchemaDestinations.length,
      itemListElement: firesafeSchemaDestinations.map((destination, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: destination.title,
        url: `${SITE_URL}${destination.href}`,
      })),
    },
    hasPart: firesafeSchemaDestinations.map((destination) => ({
      '@type': 'WebPage',
      name: destination.title,
      url: `${SITE_URL}${destination.href}`,
    })),
    relatedLink: [
      `${SITE_URL}/store`,
      `${SITE_URL}/rental`,
      `${SITE_URL}/help`,
      `${SITE_URL}/contact`,
      `${SITE_URL}/about`,
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#firesafe-hero-headline', '#firesafe-hero-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-firesafe-page" data={firesafePageSchema} />
        <StructuredData
          id="jsonld-firesafe-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Firesafe guide', path: '/firesafe' },
          ])}
        />
      </Suspense>
      <FiresafeClient />
    </>
  );
}
