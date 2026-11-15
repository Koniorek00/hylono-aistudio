import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createCollectionPageSchema,
  createFaqSchema,
  createRentalProductSchema,
  createRentalServiceSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { Rental2Client } from './Rental2Client';
import { rentalLandingContent, rentalProducts } from './rental-content';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const TARGET_PATH = '/product/rental2';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Rentals | Monthly Wellness Technology Plans, Pricing, and Support',
  description:
    'Explore monthly Hylono rental request paths for wellness technologies with manual availability review, delivery-fit checks, and purchase-path context.',
  path: TARGET_PATH,
  forceNoIndex: true,
});

// [DECISION: server-rendered noindex clone of the rental hub for design iteration while the canonical source route remains unchanged.]
// Rendering strategy: server-render metadata and JSON-LD, keep interactivity in the client leaf.
export default function ProductRental2PageRoute() {
  const faqItems = rentalLandingContent.faq.map((item) => ({
    question: item.q,
    answer: item.a,
  }));
  const rentalProductMentions = [
    ...new Set(rentalProducts.map((product) => product.productPath)),
  ].map((path) => ({
    '@type': 'Product',
    '@id': `${SITE_URL}${path}#product`,
    url: `${SITE_URL}${path}`,
  }));
  const lowestRentalPrice = rentalProducts.length
    ? Math.min(...rentalProducts.map((product) => product.rentalMonthly))
    : 0;
  const rentalHowToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}${TARGET_PATH}#howto`,
    name: 'How to start a Hylono device rental',
    description:
      'Start a monthly wellness device rental request with delivery-fit review, support-scope confirmation, and policy-linked return or purchase-credit questions.',
    url: `${SITE_URL}${TARGET_PATH}`,
    inLanguage: 'en',
    totalTime: 'PT10M',
    isPartOf: { '@type': 'CollectionPage', '@id': `${SITE_URL}${TARGET_PATH}` },
    publisher: { '@id': ORGANIZATION_ID() },
    about: { '@id': `${SITE_URL}${TARGET_PATH}#service` },
    yield: { '@type': 'DefinedTerm', name: 'Reviewed wellness device rental request' },
    step: rentalLandingContent.howItWorks.map((step) => ({
      '@type': 'HowToStep',
      position: step.number,
      name: step.title,
      text: step.text,
    })),
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-rental2-page"
          data={{
            ...createCollectionPageSchema({
              name: 'Hylono Rentals',
              description:
                'Explore monthly Hylono rental request paths for wellness technologies with manual availability review, delivery-fit checks, and purchase-path context.',
              path: TARGET_PATH,
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: rentalProducts.map((product) => ({
              '@type': 'Product',
              '@id': `${SITE_URL}${product.productPath}#product`,
              name: product.title,
              url: `${SITE_URL}${product.productPath}`,
            })),
            ...(rentalProductMentions.length > 0 ? { mentions: rentalProductMentions } : {}),
            mainEntity:
              lowestRentalPrice > 0
                ? { '@id': `${SITE_URL}${TARGET_PATH}#service` }
                : { '@id': `${SITE_URL}${TARGET_PATH}#faq` },
            relatedLink: [
              `${SITE_URL}/conditions`,
              `${SITE_URL}/research`,
              `${SITE_URL}/store`,
              `${SITE_URL}/protocols`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/shipping`,
              `${SITE_URL}/returns`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#rental-hero-headline', '#rental-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-rental2-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Rental', path: TARGET_PATH },
          ])}
        />
        <StructuredData
          id="jsonld-rental2-faq"
          data={createFaqSchema(faqItems, TARGET_PATH, 'Hylono Rental FAQ')}
        />
        <StructuredData id="jsonld-rental2-howto" data={rentalHowToSchema} />
        {lowestRentalPrice > 0 ? (
          <>
            <StructuredData
              id="jsonld-rental2-offer"
              data={createRentalProductSchema({
                name: 'Hylono wellness technology rentals',
                description:
                  'Monthly rental request paths for Hylono wellness technologies with onboarding scope, support coverage, and purchase-credit options confirmed before start.',
                path: TARGET_PATH,
                monthlyPrice: lowestRentalPrice,
              })}
            />
            <StructuredData
              id="jsonld-rental2-service"
              data={createRentalServiceSchema({
                name: 'Hylono Wellness Technology Rental Service',
                description:
                  'Monthly rental request support for wellness technology devices with delivery-fit review, onboarding scope, and return or purchase-credit questions confirmed before start.',
                path: TARGET_PATH,
                monthlyPrice: lowestRentalPrice,
              })}
            />
          </>
        ) : null}
      </Suspense>
      <Rental2Client />
    </>
  );
}
