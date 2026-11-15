// [DECISION: SSG noindex because /hero2 is an internal hero experiment and must not compete with the canonical homepage.]
// Rendering strategy: server-rendered noindex hero experiment with crawlable HTML and an isolated client presentation layer.
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import Hero2Section from './Hero2Section';

export const metadata: Metadata = createPageMetadata({
  title: 'Hero2 Observatory - Internal Prototype | Hylono',
  description:
    'Internal Hylono hero experiment: a dark bio-telemetry observatory concept for comparing modality navigation, research review, and rental access paths.',
  path: '/hero2',
  forceNoIndex: true,
});

const HERO2_DESCRIPTION =
  'Internal Hylono hero experiment: a dark bio-telemetry observatory concept for comparing modality navigation, research review, and rental access paths.';

export default function Hero2Page() {
  const webPageSchema = {
    ...createWebPageSchema({
      name: 'Hero2 Observatory - Internal Prototype',
      description: HERO2_DESCRIPTION,
      path: '/hero2',
      dateModified: SCHEMA_DATE_MODIFIED,
    }),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#hero-title', '#hero-copy'],
    },
    mainEntity: { '@id': ORGANIZATION_ID() },
  };

  return (
    <>
      <noscript>
        <section
          aria-label="Hero2 prototype no-script summary"
          className="bg-[#05080d] px-6 py-12 text-slate-100"
        >
          <div className="mx-auto max-w-3xl">
            <p className="text-2xl font-semibold">Mission control for wellness technology</p>
            <p className="mt-3 text-base leading-7 text-slate-300">
              Compare oxygen, light, hydrogen, and signal platforms with evidence context,
              protocol planning, and rental or ownership paths. Enable JavaScript for the full
              observatory presentation.
            </p>
          </div>
        </section>
      </noscript>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-hero2" data={webPageSchema} />
        <StructuredData
          id="jsonld-hero2-breadcrumb"
          data={createBreadcrumbSchema([{ name: 'Hero2', path: '/hero2' }])}
        />
      </Suspense>
      <Hero2Section />
    </>
  );
}
