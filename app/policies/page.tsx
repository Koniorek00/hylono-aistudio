import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PoliciesHubPage } from '@/components/legal/PolicyPages';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const policyLinks = [
  `${SITE_URL}/privacy`,
  `${SITE_URL}/terms`,
  `${SITE_URL}/cookie-policy`,
  `${SITE_URL}/shipping`,
  `${SITE_URL}/returns`,
  `${SITE_URL}/warranty`,
];

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Policies | Privacy, Terms, Shipping, Returns, and Warranty',
  description:
    'Review Hylono privacy, terms, cookie, shipping, returns, and warranty policies from one connected policy center.',
  path: '/policies',
});

// [DECISION: SSG because the policy center is static public navigation for existing policy pages.]
// Rendering strategy: server-rendered policy directory with route-local schema and static links to canonical legal/support pages.

export default function PoliciesPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-policies-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Policies',
              description:
                'Review Hylono privacy, terms, cookie, shipping, returns, and warranty policies from one connected policy center.',
              path: '/policies',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            keywords:
              'Hylono policies, privacy policy, terms of service, shipping policy, returns policy, warranty, cookie policy',
            relatedLink: policyLinks,
          }}
        />
        <StructuredData
          id="jsonld-policies-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Policies', path: '/policies' },
          ])}
        />
      </Suspense>
      <PoliciesHubPage />
    </>
  );
}
