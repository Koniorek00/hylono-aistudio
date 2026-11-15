import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createPageMetadata } from '@/lib/seo-metadata';
import { env } from '@/lib/env';
import { ORGANIZATION_ID, createBreadcrumbSchema, createWebPageSchema, SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { PrivacyPolicyPage } from '@/components/legal/PolicyPages';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

// Metadata is a PUBLISHED claim — search engines index this title, and it must not promise a
// topic the page omits. Both fields previously named GDPR ("GDPR Data Use, Storage, and Rights"
// and "in line with GDPR principles") while the policy body never names GDPR or RODO at all
// (measured 2026-08-28, proof 1009867). The body DOES cover data use, storage, deletion,
// rectification and a support contact, so those claims stay.
//
// Narrowed rather than expanded on purpose: adding a GDPR section would be writing a regulatory
// claim this lane cannot verify, whereas removing an unsupported term only stops over-promising.
// Hylono is EU-facing, so the OWNER may well want the GDPR term back — that is the better
// outcome, and it needs a GDPR section in the content, which is theirs to approve.
// tests/app/legal-metadata-promise-parity.test.ts holds the two in agreement either way.
export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Privacy Policy | Data Use, Storage, and Your Rights',
  description:
    'Review how Hylono processes and protects your data across the public site, contact, newsletter, checkout, and rental flows.',
  path: '/privacy',
});

// [DECISION: SSG because privacy policy is static legal content tied to deploy revisions.]
// Rendering strategy: server-rendered legal policy route with route-local schema and static policy content.
export default function PrivacyPageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-privacy-page"
          data={{
            ...createWebPageSchema({
              name: 'Hylono Privacy Policy',
              description:
                'Review how Hylono processes, protects, and governs your data in line with GDPR principles.',
              path: '/privacy',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: { '@id': ORGANIZATION_ID() },
            mainEntity: { '@id': ORGANIZATION_ID() },
            relatedLink: [`${SITE_URL}/cookie-policy`, `${SITE_URL}/terms`, `${SITE_URL}/contact`],
          }}
        />
        <StructuredData
          id="jsonld-privacy-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Privacy Policy', path: '/privacy' },
          ])}
        />
      </Suspense>
      <PrivacyPolicyPage />
    </>
  );
}
