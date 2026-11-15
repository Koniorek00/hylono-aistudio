import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import { ORGANIZATION_ID, WEBSITE_ID, createBreadcrumbSchema, createWebPageSchema, SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { ShippingPolicyPage } from '@/components/legal/PolicyPages';
import { PRICE_BOOK_CURRENCY } from '@/lib/money';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Shipping Policy | EU Delivery Timelines and Coverage',
  description:
    'View Hylono shipping coverage, EU delivery timelines, and the public support channels tied to delivery, returns, and warranty questions.',
  path: '/shipping',
});

// [DECISION: SSG because shipping policy and timelines are static informational content.]
// Rendering strategy: server-rendered commerce policy route with route-local schema and static shipping-policy content.

// Entity schema – @id referenced by Product offers shippingDetails
const shippingPolicySchema = {
  '@context': 'https://schema.org',
  '@type': 'OfferShippingDetails',
  '@id': `${SITE_URL}/shipping#shipping-policy`,
  url: `${SITE_URL}/shipping`,
  shippingRate: {
    '@type': 'MonetaryAmount',
    value: 0,
    // Was 'EUR'. The amount is zero either way, so no price was misstated — but this
    // @id is referenced by Product offers' shippingDetails, and those offers declare
    // PRICE_BOOK_CURRENCY. A PLN offer carrying EUR shipping is an inconsistent offer
    // graph. Note for when per-market pricing lands: shippingDestination here is the
    // whole EU while this currency is the price book's, which is a tension to resolve
    // with a per-market rate rather than by inventing one now.
    currency: PRICE_BOOK_CURRENCY,
  },
  shippingDestination: {
    '@type': 'DefinedRegion',
    addressCountry: 'EU',
    name: 'European Union',
  },
  deliveryTime: {
    '@type': 'ShippingDeliveryTime',
    handlingTime: {
      '@type': 'QuantitativeValue',
      minValue: 0,
      maxValue: 1,
      unitCode: 'DAY',
    },
    transitTime: {
      '@type': 'QuantitativeValue',
      minValue: 5,
      maxValue: 10,
      unitCode: 'DAY',
    },
    cutoffTime: '16:00:00',
    businessDays: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
  },
  doesNotShip: false,
  isPartOf: { '@id': WEBSITE_ID() },
  publisher: { '@id': ORGANIZATION_ID() },
};

export default function ShippingPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-shipping-policy" data={shippingPolicySchema} />
        <StructuredData
          id="jsonld-shipping-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Shipping Policy',
              description:
                'View Hylono shipping coverage, EU delivery timelines, and the public support channels tied to delivery, returns, and warranty questions.',
              path: '/shipping',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': `${SITE_URL}/shipping#shipping-policy` },
            keywords: 'Hylono shipping, delivery timelines, free shipping EU, wellness device delivery, European logistics',
            relatedLink: [`${SITE_URL}/warranty`, `${SITE_URL}/returns`, `${SITE_URL}/help`],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#shipping-hero-headline'],
            },
          }}
        />
        <StructuredData
          id="jsonld-shipping-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Shipping Policy', path: '/shipping' },
          ])}
        />
      </Suspense>
      <ShippingPolicyPage />
    </>
  );
}
