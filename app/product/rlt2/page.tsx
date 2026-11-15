import type { Metadata } from 'next';
import { Suspense } from 'react';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import { TECH_DETAILS } from '@/constants';
import { TechType } from '@/types';
import StructuredData from '@/src/components/StructuredData';
import { RltReferenceHero, RltReferencePlanning } from '../[tech]/RltReferenceContent';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
const TARGET_PATH = '/product/rlt2';
const RLT_TECH = TECH_DETAILS[TechType.RLT];
const PRODUCT_NAME = `Hylono ${RLT_TECH.name}`;

export const metadata: Metadata = createPageMetadata({
  title: `${RLT_TECH.name} | Pricing, Rental Plans, Specs and Evidence`,
  description: `Review ${PRODUCT_NAME} wavelength, timing, and safety-screening context, rental access, and policy-linked planning guidance.`,
  path: TARGET_PATH,
  forceNoIndex: true,
});

// [DECISION: static noindex clone route so the RLT visual redesign can be verified in isolation while the canonical /product/rlt route stays untouched.]
// Rendering strategy: server-rendered reference redesign — the hero and planning sections reuse the server-first RLT reference components with clone-route tracking metadata.
export default function ProductRlt2PageRoute() {
  return (
    <>
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-rlt2-breadcrumb"
          data={{
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
              { '@type': 'ListItem', position: 2, name: 'Store', item: `${SITE_URL}/store` },
              {
                '@type': 'ListItem',
                position: 3,
                name: 'PBM / Red Light',
                item: `${SITE_URL}/product/rlt`,
              },
              { '@type': 'ListItem', position: 4, name: 'Reference view' },
            ],
          }}
        />
      </Suspense>
      <RltReferenceHero productName={PRODUCT_NAME} />
      <RltReferencePlanning />
    </>
  );
}
