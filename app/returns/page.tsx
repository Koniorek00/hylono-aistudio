import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createPageMetadata } from '@/lib/seo-metadata';
import { ORGANIZATION_ID, createBreadcrumbSchema, createMerchantReturnPolicySchema, createWebPageSchema, SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import { env } from '@/lib/env';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
import StructuredData from '@/src/components/StructuredData';
import { ReturnsPolicyPage } from '@/components/legal/PolicyPages';

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Returns Policy | 30-Day Window and Refunds',
  description:
    'Read Hylono direct-purchase return eligibility, the public 30-day window, refund handling, and the buyer support path before sending hardware back.',
  path: '/returns',
});

// [DECISION: SSG because returns policy content is static legal-operational guidance.]
// Rendering strategy: server-rendered commerce policy route with route-local schema and static return-policy content.
const returnPolicySchema = createMerchantReturnPolicySchema({
  includeContext: true,
  includeName: true,
  includePublisher: true,
});

export default function ReturnsPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-returns-policy" data={returnPolicySchema} />
        <StructuredData
          id="jsonld-returns-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Returns Policy',
              description:
                'Read Hylono direct-purchase return eligibility, the public 30-day window, refund handling, and the buyer support path before sending hardware back.',
              path: '/returns',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': `${SITE_URL}/returns#return-policy` },
            keywords: 'Hylono returns, refund policy, 30-day return window, eligible returns, wellness device refund',
            relatedLink: [`${SITE_URL}/warranty`, `${SITE_URL}/shipping`, `${SITE_URL}/help`],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#returns-hero-headline'],
            },
          }}
        />
        <StructuredData
          id="jsonld-returns-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Returns Policy', path: '/returns' },
          ])}
        />
      </Suspense>
      <ReturnsPolicyPage />
    </>
  );
}
