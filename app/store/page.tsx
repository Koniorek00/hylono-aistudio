import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PageOwnership } from '@/components/content/PageOwnership';
import { MedicalDisclaimer } from '@/components/shared/MedicalDisclaimer';
import { TECH_DETAILS } from '@/constants';
import { getProductForRouteSlug, getSchemaAvailabilityForProduct } from '@/content/products';
import { siteOwnership } from '@/content/site-entity';
import { storePlanningLinks } from '@/content/topical-graph';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import { ORGANIZATION_ID, WARRANTY_PROMISE_ID, WEBSITE_ID, createBreadcrumbSchema, createCollectionPageSchema, SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import {
  getAllTechRouteSlugs,
  getPublicProductRouteDescription,
  getTechTypeFromRouteSlug,
} from '@/lib/product-routes';
import StructuredData from '@/src/components/StructuredData';
import { StaticStructuredData } from '@/src/components/StaticStructuredData';
import { StoreClient } from './StoreClient';
import { PRICE_BOOK_CURRENCY } from '@/lib/money';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

// [DECISION: store route is semi-dynamic catalog content and should use cache components/runtime cache behavior; reverse if inventory/pricing moves to strict per-request rendering.]
// Rendering strategy: server-rendered catalog metadata and schema, with crawlable links preserved in HTML while interactive comparison stays in the client layer.

export const metadata: Metadata = createPageMetadata({
  title: 'Wellness Technology Store | Compare Rentals, Prices and Device Specs',
  description:
    'Browse Hylono wellness technology devices with rental pricing, purchase paths, setup guidance, protocol context, and support links.',
  path: '/store',
});

export default function StorePage() {
  const storePlanningAbsoluteLinks = storePlanningLinks.map((link) => `${SITE_URL}${link.href}`);
  const techSlugs = getAllTechRouteSlugs();
  const techTermSetSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/store#tech-term-set`,
    name: 'Hylono Wellness Technology Taxonomy',
    description: 'Formal set of wellness technology modalities offered by Hylono, including oxygen, hydrogen, light, and signal-based systems.',
    url: `${SITE_URL}/store`,
    inLanguage: 'en',
    dateModified: SCHEMA_DATE_MODIFIED,
    publisher: { '@id': ORGANIZATION_ID() },
    isPartOf: { '@id': WEBSITE_ID() },
    hasDefinedTerm: techSlugs.map((slug) => {
      const techType = getTechTypeFromRouteSlug(slug);
      const tech = techType ? TECH_DETAILS[techType] : null;
      const description = getPublicProductRouteDescription({
        fallbackDescription: tech?.plainDescription ?? '',
        productName: tech?.name ?? slug.toUpperCase(),
        slug,
      });
      return {
        '@type': 'DefinedTerm',
        '@id': `${SITE_URL}/product/${slug}#term`,
        name: tech?.name ?? slug.toUpperCase(),
        url: `${SITE_URL}/product/${slug}`,
        description,
        inDefinedTermSet: `${SITE_URL}/store#tech-term-set`,
      };
    }),
  };
  const productListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/store#product-list`,
    name: 'Hylono wellness technology devices',
    description:
      'Browse Hylono oxygen, hydrogen, red-light, and signal-based wellness systems with rental pricing and protocol support.',
    url: `${SITE_URL}/store`,
    inLanguage: 'en',
    dateModified: SCHEMA_DATE_MODIFIED,
    isPartOf: { '@id': WEBSITE_ID() },
    publisher: { '@id': ORGANIZATION_ID() },
    numberOfItems: techSlugs.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: techSlugs.map((slug, index) => {
      const techType = getTechTypeFromRouteSlug(slug);
      const tech = techType ? TECH_DETAILS[techType] : null;
      const canonicalProduct = getProductForRouteSlug(slug);
      const schemaAvailability = getSchemaAvailabilityForProduct(canonicalProduct);
      const canonicalRentalPrice = canonicalProduct?.rentalPlans?.length
        ? Math.min(...canonicalProduct.rentalPlans.map((plan) => plan.monthlyPrice))
        : undefined;
      const description = getPublicProductRouteDescription({
        fallbackDescription: tech?.plainDescription ?? '',
        productName: tech?.name ?? slug.toUpperCase(),
        slug,
      });
      return {
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/product/${slug}`,
        item: {
          '@type': 'Product',
          '@id': `${SITE_URL}/product/${slug}#product`,
          name: `Hylono ${tech?.name ?? slug}`,
          description,
          url: `${SITE_URL}/product/${slug}`,
          brand: { '@type': 'Brand', '@id': `${SITE_URL}/#brand`, name: 'Hylono', url: SITE_URL },
          hasWarranty: { '@id': WARRANTY_PROMISE_ID() },
          potentialAction: { '@type': 'ViewAction', target: `${SITE_URL}/product/${slug}` },
          ...(canonicalProduct && canonicalRentalPrice !== undefined
            ? {
                offers: {
                  '@type': 'Offer',
                  url: `${SITE_URL}/product/${slug}`,
                  name: 'Monthly rental plan',
                  priceCurrency: PRICE_BOOK_CURRENCY,
                  price: canonicalRentalPrice,
                  validFrom: SCHEMA_DATE_MODIFIED,
                  itemCondition: 'https://schema.org/NewCondition',
                  ...(schemaAvailability ? { availability: schemaAvailability } : {}),
                  eligibleRegion: { '@type': 'Place', name: 'European Union' },
                  businessFunction: 'https://purl.org/goodrelations/v1#LeaseOut',
                  seller: { '@id': ORGANIZATION_ID() },
                  shippingDetails: { '@id': `${SITE_URL}/shipping#shipping-policy` },
                  hasMerchantReturnPolicy: { '@id': `${SITE_URL}/returns#return-policy` },
                  priceSpecification: {
                    '@type': 'UnitPriceSpecification',
                    priceCurrency: PRICE_BOOK_CURRENCY,
                    price: canonicalRentalPrice,
                    billingDuration: 1,
                    unitText: 'month',
                    referenceQuantity: {
                      '@type': 'QuantitativeValue',
                      value: 1,
                      unitCode: 'MON',
                    },
                  },
                },
              }
            : {}),
        },
      };
    }),
  };

  return (
    <>
      <StaticStructuredData id="jsonld-store-tech-term-set" data={techTermSetSchema} />
      <StaticStructuredData id="jsonld-store-product-list" data={productListSchema} />
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-store-page"
          data={{
            ...createCollectionPageSchema({
              name: 'Hylono Store',
              description:
                'Browse Hylono wellness technology devices with rental pricing, purchase paths, setup guidance, protocol context, and support links.',
              path: '/store',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: techSlugs.map((slug) => {
              const techType = getTechTypeFromRouteSlug(slug);
              const tech = techType ? TECH_DETAILS[techType] : null;
              return {
                '@type': 'Product',
                '@id': `${SITE_URL}/product/${slug}#product`,
                name: `Hylono ${tech?.name ?? slug.toUpperCase()}`,
                url: `${SITE_URL}/product/${slug}`,
              };
            }),
            mentions: techSlugs.map((slug) => ({
              '@type': 'Product',
              '@id': `${SITE_URL}/product/${slug}#product`,
              url: `${SITE_URL}/product/${slug}`,
            })),
            keywords: 'wellness technology store, hyperbaric oxygen chamber rental, hydrogen therapy device, red light therapy device, PEMF device rental, HBOT, wellness equipment purchase',
            mainEntity: { '@id': `${SITE_URL}/store#product-list` },
            relatedLink: [...storePlanningAbsoluteLinks, `${SITE_URL}/warranty`],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#store-hero-headline', '#store-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-store-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Store', path: '/store' },
          ])}
        />
      </Suspense>
      <Suspense fallback={null}>
        <StoreClient />
      </Suspense>

      {/* The highest purchase-intent route published price ranges with no visible
          accountability metadata and no disclaimer. Rendered here in the SERVER shell
          rather than inside StoreClient so it is present in the initial HTML for
          crawlers, per the server-first rule in AGENTS.md.

          The policy links also close a second gap: app/store/page.tsx emits Offer
          schema carrying shippingDetails, hasMerchantReturnPolicy and hasWarranty,
          and the guide requires those paths to be visibly reachable from the page
          that claims them. */}
      <section
        id="store-accountability"
        aria-labelledby="store-accountability-heading"
        className="mx-auto max-w-7xl px-6 py-14 lg:px-8"
      >
        <h2 id="store-accountability-heading" className="sr-only">
          Pricing context, policies, and who maintains this page
        </h2>

        <MedicalDisclaimer type="pdp" className="mb-8" />

        <PageOwnership
          eyebrow="Ownership and freshness"
          title="Who stands behind these prices"
          description="Prices and rental ranges on this page are published by Hylono and reviewed manually before an order is confirmed. Nothing here completes a purchase on its own."
          items={[
            {
              label: siteOwnership.commerce.label,
              value: siteOwnership.commerce.team,
              detail: 'Confirms availability, delivery context, and payment terms before an order is accepted.',
            },
            {
              label: siteOwnership.editorial.label,
              value: siteOwnership.editorial.team,
              detail: 'Keeps device descriptions, price presentation, and policy links consistent across the catalog.',
            },
            {
              label: 'Last reviewed',
              value: SCHEMA_DATE_MODIFIED,
              detail: 'The same review date this page reports in its structured data, so both agree.',
            },
          ]}
          actions={[
            { href: '/shipping', label: 'Shipping' },
            { href: '/returns', label: 'Returns' },
            { href: '/warranty', label: 'Warranty' },
            { href: '/contact', label: 'Ask before ordering' },
          ]}
        />
      </section>
    </>
  );
}
