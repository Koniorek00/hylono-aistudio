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
import { HhoCarKitClient } from './HhoCarKitClient';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const hhoCarKitSchemaDestinations = [
  { href: '/help', title: 'Help and policy pages' },
  { href: '/contact', title: 'Contact Hylono' },
  { href: '/store', title: 'Store and product pages' },
  { href: '/faq', title: 'FAQ' },
  { href: '/about', title: 'About Hylono' },
] as const;

export const metadata: Metadata = createPageMetadata({
  title: 'HHO car kit guide | Hylono support and next steps',
  description:
    'Use this secondary Hylono guide to move HHO car kit questions into support, store context, company background, and direct contact without unsupported performance claims.',
  path: '/hho-car-kit',
  forceNoIndex: true,
});

// [DECISION: SSG because /hho-car-kit is a noindex orientation route that should move visitors into stronger support, store, about, FAQ, and contact pages without thin promotional or calculator-driven claims.]
// Rendering strategy: server-rendered noindex overview page with direct HTML links into canonical support, store, FAQ, about, and contact destinations.
export default function HhoCarKitPageRoute() {
  const hhoCarKitPageSchema = {
    ...createCollectionPageSchema({
      name: 'Hylono HHO Car Kit Guide',
      description:
        'A Hylono orientation page that sends visitors to support, contact, store, FAQ, and company background pages without unsupported automotive claims.',
      path: '/hho-car-kit',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    about: { '@id': ORGANIZATION_ID() },
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      numberOfItems: hhoCarKitSchemaDestinations.length,
      itemListElement: hhoCarKitSchemaDestinations.map((destination, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: destination.title,
        url: `${SITE_URL}${destination.href}`,
      })),
    },
    hasPart: hhoCarKitSchemaDestinations.map((destination) => ({
      '@type': 'WebPage',
      name: destination.title,
      url: `${SITE_URL}${destination.href}`,
    })),
    relatedLink: [
      `${SITE_URL}/help`,
      `${SITE_URL}/contact`,
      `${SITE_URL}/store`,
      `${SITE_URL}/faq`,
      `${SITE_URL}/about`,
    ],
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#hho-car-kit-hero-headline', '#hho-car-kit-hero-description'],
    },
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-hho-car-kit-page" data={hhoCarKitPageSchema} />
        <StructuredData
          id="jsonld-hho-car-kit-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'HHO car kit guide', path: '/hho-car-kit' },
          ])}
        />
      </Suspense>
      <HhoCarKitClient />
    </>
  );
}
