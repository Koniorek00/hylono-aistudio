import type { Metadata } from 'next';
import { Suspense } from 'react';
import { HELP_FAQ_DATA } from '@/content/help-faq';
import { createPageMetadata } from '@/lib/seo-metadata';
import { env } from '@/lib/env';
import {
  ORGANIZATION_ID,
  createBreadcrumbSchema,
  createFaqSchema,
  createWebPageSchema,
  SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
import StructuredData from '@/src/components/StructuredData';
import { FaqClient } from './FaqClient';
import { FaqEditorial } from './FaqEditorial';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono FAQ | Device, Rental, Safety, and Support Answers',
  description:
    'Find answers to common Hylono questions about devices, safety, rental options, delivery planning, and customer support.',
  path: '/faq',
});

// [DECISION: SSG because FAQ content is curated static educational material.]
// Rendering strategy: server-rendered FAQ route with visible FAQ schema and searchable FAQ interaction isolated in a client leaf.
export default function FaqPageRoute() {
  const faqItems = HELP_FAQ_DATA.flatMap((category) =>
    category.items.map((item) => ({
      question: item.q,
      answer: item.a,
    }))
  );

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-faq-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono FAQ',
              description:
                'Find answers to common Hylono questions about devices, safety, rental options, delivery planning, and customer support.',
              path: '/faq',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': `${SITE_URL}/faq#faq` },
            relatedLink: [
              `${SITE_URL}/help`,
              `${SITE_URL}/contact`,
              `${SITE_URL}/rental`,
              `${SITE_URL}/shipping`,
              `${SITE_URL}/warranty`,
            ],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#faq-hero-headline', '#faq-hero-description'],
            },
          }}
        />
        <StructuredData id="jsonld-faq" data={createFaqSchema(faqItems, '/faq', 'Hylono FAQ')} />
        <StructuredData
          id="jsonld-faq-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'FAQ', path: '/faq' },
          ])}
        />
      </Suspense>
      <div data-testid="faq-route-surface" className="bg-[#f7f4ee] text-[#101820]">
        <FaqEditorial />
        <Suspense fallback={null}>
          <FaqClient hideIntro />
        </Suspense>
      </div>
    </>
  );
}
