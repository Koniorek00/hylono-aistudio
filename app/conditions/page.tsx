import type { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  Calendar,
  FileText,
  Leaf,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { conditionGoals } from '@/content/conditions';
import { siteOwnership } from '@/content/site-entity';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import { ORGANIZATION_ID, WEBSITE_ID, createBreadcrumbSchema, createCollectionPageSchema, SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import { StaticStructuredData } from '@/src/components/StaticStructuredData';
import { ConditionsClient } from './ConditionsClient';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

const MODALITY_SLUG_TO_PRODUCT_ROUTE: Record<string, string> = {
  HBOT: 'hbot',
  H2: 'hydrogen',
  RLT: 'rlt',
  PEMF: 'pemf',
};

export const metadata: Metadata = createPageMetadata({
  title: 'Hylono Condition Guides | Recovery, Sleep, Stress, Comfort, and Vitality',
  description:
    'Explore Hylono condition-focused wellness guides with protocol pathways, modality relevance, and research references.',
  path: '/conditions',
});

// [DECISION: SSG because this educational overview is static informational content.]
// Rendering strategy: server-rendered indexable condition hub with route-local schema and interactive browsing isolated in a client leaf.
export default function ConditionsPageRoute() {
  const conditionListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${SITE_URL}/conditions#condition-list`,
    name: 'Hylono condition wellness guides',
    description:
      'Condition-focused wellness guides covering recovery, sleep, stress, comfort, and vitality with protocol pathways and modality comparisons.',
    url: `${SITE_URL}/conditions`,
    inLanguage: 'en',
    dateModified: SCHEMA_DATE_MODIFIED,
    isPartOf: { '@id': WEBSITE_ID() },
    publisher: { '@id': ORGANIZATION_ID() },
    numberOfItems: conditionGoals.length,
    itemListOrder: 'https://schema.org/ItemListUnordered',
    itemListElement: conditionGoals.map((goal, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/conditions/${goal.slug}`,
      item: {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/conditions/${goal.slug}`,
        name: `${goal.title} wellness guide`,
        description: goal.subtitle,
        url: `${SITE_URL}/conditions/${goal.slug}`,
        inLanguage: 'en',
        about: {
          '@type': 'DefinedTerm',
          '@id': `${SITE_URL}/conditions/${goal.slug}#term`,
          name: goal.title,
          url: `${SITE_URL}/conditions/${goal.slug}`,
          inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
        },
        isPartOf: { '@type': 'CollectionPage', '@id': `${SITE_URL}/conditions` },
        publisher: { '@id': ORGANIZATION_ID() },
        keywords: [goal.title, ...goal.modalities.map((m) => m.shortName)].join(', '),
        mentions: goal.modalities
          .filter((m) => Boolean(MODALITY_SLUG_TO_PRODUCT_ROUTE[m.slug]))
          .map((m) => ({
            '@type': 'Product',
            '@id': `${SITE_URL}/product/${MODALITY_SLUG_TO_PRODUCT_ROUTE[m.slug]}#product`,
            url: `${SITE_URL}/product/${MODALITY_SLUG_TO_PRODUCT_ROUTE[m.slug]}`,
          })),
        potentialAction: { '@type': 'ReadAction', target: [`${SITE_URL}/conditions/${goal.slug}`] },
      },
    })),
  };

  const conditionTermSetSchema = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE_URL}/conditions#term-set`,
    name: 'Hylono Wellness Goal Taxonomy',
    description: 'Formal set of wellness goals and conditions addressed by Hylono technology protocols.',
    url: `${SITE_URL}/conditions`,
    inLanguage: 'en',
    dateModified: SCHEMA_DATE_MODIFIED,
    publisher: { '@id': ORGANIZATION_ID() },
    isPartOf: { '@id': WEBSITE_ID() },
    hasDefinedTerm: conditionGoals.map((goal) => ({
      '@type': 'DefinedTerm',
      '@id': `${SITE_URL}/conditions/${goal.slug}#term`,
      name: goal.title,
      url: `${SITE_URL}/conditions/${goal.slug}`,
      description: goal.subtitle,
      inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
    })),
  };

  return (
    <>
      <StaticStructuredData id="jsonld-conditions-term-set" data={conditionTermSetSchema} />
      <StaticStructuredData id="jsonld-conditions-list" data={conditionListSchema} />
      <Suspense fallback={null}>
        <StructuredData
          id="jsonld-conditions-page"
          data={{
            ...createCollectionPageSchema({
              name: 'Condition Wellness Guides',
              description:
                'Explore Hylono condition-focused wellness guides with protocol pathways, modality relevance, and research references.',
              path: '/conditions',
              dateModified: SCHEMA_DATE_MODIFIED,
            }),
            about: conditionGoals.map((goal) => ({
              '@type': 'DefinedTerm',
              '@id': `${SITE_URL}/conditions/${goal.slug}#term`,
              name: goal.title,
              url: `${SITE_URL}/conditions/${goal.slug}`,
              inDefinedTermSet: `${SITE_URL}/conditions#term-set`,
            })),
            keywords: 'wellness condition guides, recovery wellness, sleep wellness, stress relief, pain comfort, vitality wellness, hyperbaric oxygen, hydrogen therapy, PEMF, red light therapy',
            mainEntity: { '@id': `${SITE_URL}/conditions#condition-list` },
            relatedLink: [`${SITE_URL}/protocols`, `${SITE_URL}/research`, `${SITE_URL}/store`],
            speakable: {
              '@type': 'SpeakableSpecification',
              cssSelector: ['#conditions-hero-headline', '#conditions-hero-description'],
            },
          }}
        />
        <StructuredData
          id="jsonld-conditions-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Conditions', path: '/conditions' },
          ])}
        />
      </Suspense>
      <ConditionsClient />

      {/* This hub is the entry node of the canonical graph
          Condition -> Research -> Product -> Protocol -> Rental/Contact, and it had no
          ownership, review or freshness metadata, which AGENTS.md requires on
          health-adjacent pages. The detail pages already do this correctly via
          components/ConditionDetailShell.tsx; this brings the hub in line.

          Rendered in the SERVER shell rather than inside ConditionsClient so it is in
          the initial HTML. No disclaimer is added here: the hub already renders
          disclaimers.general, and repeating it a third time would be noise. */}
      {/*
        This block is rendered in the SERVER shell, which puts it OUTSIDE
        ConditionsClient's `min-h-screen bg-[var(--surface-page)]` wrapper -- so it had no
        painted ancestor at all and fell through to the browser's default white. Measured in
        the live DOM: every other PageOwnership host has a painted ancestor, this one had
        NONE. The wrapper below restores the page surface full-bleed; the layout classes stay
        on the inner section so the background is not clipped to max-w-7xl.
      */}
      <div className="bg-[var(--surface-page)] pb-12">
        <section
          id="conditions-accountability"
          aria-labelledby="conditions-accountability-heading"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
        >
          <h2 id="conditions-accountability-heading" className="sr-only">
            Who maintains these condition guides
          </h2>

          <div className="rounded-[20px] border border-[#E8E2D5] bg-[#FAF8F5] p-6 sm:p-8 lg:p-10 shadow-xs">
            <div className="grid gap-8 lg:grid-cols-[1fr_2fr] items-start">
              {/* Left Column: Heading and Context */}
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8C6D46]">
                    Ownership and freshness
                  </span>
                  <span className="h-px w-8 bg-[#C8BFB0]" aria-hidden="true" />
                </div>
                <h3
                  className="mt-2 text-2xl sm:text-3xl font-normal tracking-tight text-slate-950"
                  style={{ fontFamily: 'var(--font-cormorant)' }}
                >
                  Who maintains these guides
                </h3>
                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 font-normal">
                  These are educational wellness guides that compare options and name their own limits. They are for planning a routine, not for identifying a medical condition, and they do not replace advice from a qualified professional.
                </p>
              </div>

              {/* Right Column: 3 Metric/Verification Columns with vertical dividers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#E2DACB] border-t sm:border-t-0 border-[#E2DACB]">
                {/* Evidence Review */}
                <div className="px-0 sm:px-5 first:pl-0 last:pr-0 py-4 sm:py-0 flex flex-col justify-between">
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-[9999px] bg-[#EFECE4] border border-[#DDD6C8] text-[#8C6D46] mb-3 shadow-xs">
                      <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="block text-xs font-bold text-slate-950">
                      {siteOwnership.research.label}
                    </span>
                    <span className="block text-xs font-medium text-[#8C6D46] mt-0.5">
                      {siteOwnership.research.team}
                    </span>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                      Checks which claims the cited evidence supports, and keeps the limits visible.
                    </p>
                  </div>
                </div>

                {/* Editorial Oversight */}
                <div className="px-0 sm:px-5 first:pl-0 last:pr-0 py-4 sm:py-0 flex flex-col justify-between">
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-[9999px] bg-[#EFECE4] border border-[#DDD6C8] text-[#8C6D46] mb-3 shadow-xs">
                      <FileText className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="block text-xs font-bold text-slate-950">
                      {siteOwnership.editorial.label}
                    </span>
                    <span className="block text-xs font-medium text-[#8C6D46] mt-0.5">
                      {siteOwnership.editorial.team}
                    </span>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                      Keeps each guide connected onward to research, products, protocols, and support.
                    </p>
                  </div>
                </div>

                {/* Last Reviewed */}
                <div className="px-0 sm:px-5 first:pl-0 last:pr-0 py-4 sm:py-0 flex flex-col justify-between">
                  <div>
                    <div className="flex h-9 w-9 items-center justify-center rounded-[9999px] bg-[#EFECE4] border border-[#DDD6C8] text-[#8C6D46] mb-3 shadow-xs">
                      <Calendar className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <span className="block text-xs font-bold text-slate-950">
                      Last reviewed
                    </span>
                    <span className="block text-xs font-medium text-[#8C6D46] mt-0.5">
                      {SCHEMA_DATE_MODIFIED}
                    </span>
                    <p className="mt-2 text-[11px] leading-relaxed text-slate-600">
                      The same review date this page reports in its structured data, so both agree.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Row at Bottom */}
            <div className="mt-8 pt-6 border-t border-[#E8E2D5] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="inline-flex items-center gap-2 rounded-[9999px] border border-[#DDD6C8] bg-[#F2EFE8] px-3.5 py-1.5 text-xs text-slate-700">
                <Leaf className="h-3.5 w-3.5 text-[#8C6D46]" aria-hidden="true" />
                <span>Ownership action links are ready.</span>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/research"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[9999px] border border-[#DDD6C8] bg-white hover:bg-[#F2EFE8] text-slate-900 px-4 py-2 text-xs font-semibold transition-all shadow-xs"
                >
                  <BookOpen className="h-3.5 w-3.5 text-[#8C6D46]" aria-hidden="true" />
                  <span>Research hub</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </Link>
                <Link
                  href="/protocols"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[9999px] border border-[#DDD6C8] bg-white hover:bg-[#F2EFE8] text-slate-900 px-4 py-2 text-xs font-semibold transition-all shadow-xs"
                >
                  <FileText className="h-3.5 w-3.5 text-[#8C6D46]" aria-hidden="true" />
                  <span>Protocols</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-[9999px] border border-[#DDD6C8] bg-white hover:bg-[#F2EFE8] text-slate-900 px-4 py-2 text-xs font-semibold transition-all shadow-xs"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-[#8C6D46]" aria-hidden="true" />
                  <span>Ask a question</span>
                  <ArrowRight className="h-3 w-3 text-slate-400" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
