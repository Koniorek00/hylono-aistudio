import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { PageOwnership } from '@/components/content/PageOwnership';
import { researchContent } from '@/content/research';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { env } from '@/lib/env';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  WEBSITE_ID,
  SCHEMA_DATE_MODIFIED,
  createBreadcrumbSchema,
  createMedicalWebPageSchema,
} from '@/lib/seo-schema';
import StructuredData from '@/src/components/StructuredData';
import {
  ResearchRouteActionStatus,
  ResearchTrackedExternalLink,
  ResearchTrackedLink,
  RESEARCH_ROUTE_ACTION_STATUS_ID,
} from './ResearchTrackedLink';

const RESEARCH_MODALITIES = ['HBOT', 'H2'] as const;
type ResearchModality = (typeof RESEARCH_MODALITIES)[number];

const RESEARCH_MODALITY_PRODUCT_ROUTE: Record<ResearchModality, string> = {
  HBOT: 'hbot',
  H2: 'hydrogen',
};

const RESEARCH_MODALITY_PRODUCT_NAME: Record<ResearchModality, string> = {
  HBOT: 'Hylono HBOT',
  H2: 'Hylono Hydrogen',
};

const RESEARCH_MODALITY_PROTOCOL_ROUTE: Record<ResearchModality, string> = {
  HBOT: '/protocols/recovery-oxygen-foundation',
  H2: '/protocols/stress-balance-h2-foundation',
};

const RESEARCH_MODALITY_CONDITION_ROUTE: Record<
  ResearchModality,
  {
    href: string;
    label: string;
  }
> = {
  HBOT: {
    href: '/conditions/recovery',
    label: 'recovery guide',
  },
  H2: {
    href: '/conditions/stress',
    label: 'stress guide',
  },
};

const RESEARCH_MODALITY_INTROS: Record<
  ResearchModality,
  {
    eyebrow: string;
    heading: string;
    description: string;
    limitation: string;
  }
> = {
  HBOT: {
    eyebrow: 'HBOT snapshot',
    heading: 'Performance and soreness are the clearest HBOT themes here.',
    description:
      'The current HBOT entries in this library focus on exercise performance, mitochondrial markers, and post-exercise soreness.',
    limitation:
      'These findings come from narrow study populations and protocol-specific designs, so they should not be treated as universal wellness outcomes.',
  },
  H2: {
    eyebrow: 'Hydrogen snapshot',
    heading: 'Fatigue and aerobic capacity lead the hydrogen coverage.',
    description:
      'The current hydrogen entries focus on fatigue-related outcomes and aerobic capacity in healthy-adult or early-stage review settings.',
    limitation:
      'The evidence base is still small, protocols vary, and broader claims need stronger study designs before they are reliable.',
  },
};

interface CitationGuardrail {
  title: string;
  query: string;
  supportedScope: string;
  notSupported: string;
  links: Array<{
    href: string;
    label: string;
    modality: ResearchModality;
  }>;
}

const RESEARCH_CITATION_GUARDRAILS: readonly [CitationGuardrail, CitationGuardrail] = [
  {
    title: 'Hydrogen evidence cited here',
    query: 'What research does Hylono cite for hydrogen wellness technology?',
    supportedScope:
      'The current hydrogen records cover fatigue-related outcomes, aerobic-capacity context, and early or review-level hydrogen literature.',
    notSupported:
      'Do not read this as proof of broad wellness outcomes, general sleep support, condition management, or a certain response to hydrogen devices.',
    links: [
      { href: '/product/hydrogen', label: 'Review hydrogen hub', modality: 'H2' },
      { href: '/conditions/stress', label: 'Open stress guide', modality: 'H2' },
      {
        href: '/protocols/stress-balance-h2-foundation',
        label: 'Review hydrogen protocol',
        modality: 'H2',
      },
    ],
  },
  {
    title: 'HBOT evidence cited here',
    query: 'What research does Hylono cite for HBOT wellness routines?',
    supportedScope:
      'The current HBOT records cover exercise-performance context, post-exercise soreness, mitochondrial markers, and one chronic post-mTBI sleep-assessment record.',
    notSupported:
      'Do not read this as universal recovery proof, general sleep support, condition management, or personal performance certainty.',
    links: [
      { href: '/product/hbot', label: 'Review HBOT hub', modality: 'HBOT' },
      { href: '/conditions/recovery', label: 'Open recovery guide', modality: 'HBOT' },
      {
        href: '/protocols/recovery-oxygen-foundation',
        label: 'Review HBOT protocol',
        modality: 'HBOT',
      },
    ],
  },
];

const displayReviewDateIso = `${SCHEMA_DATE_MODIFIED}T00:00:00Z`;
const displayReviewDate = new Date(displayReviewDateIso).toLocaleDateString('en-US', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const researchStudies = researchContent.studies;
const curatedStudyCount = researchStudies.length;
const canonicalStudyCount = researchContent.canonicalStudyCount;
const latestStudyYear =
  curatedStudyCount > 0 ? Math.max(...researchStudies.map((study) => study.year)) : null;
const modalityCount = new Set(researchStudies.map((study) => study.modality)).size;
const activeResearchModalities = RESEARCH_MODALITIES.filter((modality) =>
  researchStudies.some((study) => study.modality === modality)
);
const researchStudyTypes = [...new Set(researchStudies.map((study) => study.studyType))].sort();
const researchFilterGroups = [
  {
    title: 'By modality',
    items: [
      {
        label: 'HBOT',
        count: researchStudies.filter((study) => study.modality === 'HBOT').length,
      },
      {
        label: 'H2',
        count: researchStudies.filter((study) => study.modality === 'H2').length,
      },
    ],
  },
  {
    title: 'By study type',
    items: researchStudyTypes.map((studyType) => ({
      label: studyType,
      count: researchStudies.filter((study) => study.studyType === studyType).length,
    })),
  },
];

const evidenceReadingPrinciples = [
  {
    title: 'Study design first',
    description:
      'Look for RCT, meta-analysis, or review status before treating a wellness observation as repeatable.',
  },
  {
    title: 'Population fit second',
    description:
      'Healthy athlete data, clinical cohorts, and animal findings should not be swapped interchangeably.',
  },
  {
    title: 'Endpoint specificity',
    description:
      'Soreness, lactate clearance, or subjective fatigue are narrow signals, not universal wellness proof.',
  },
  {
    title: 'Limitations stay visible',
    description:
      'Sample size, lack of blinding, short observation windows, and dose differences must remain readable.',
  },
] as const;

const researchIntentNextSteps = [
  {
    title: 'Learn the evidence scope',
    description:
      'Start with citation guardrails and study cards when the question is what the current records actually support.',
    href: '#study-library',
    action: 'Read the study cards',
  },
  {
    title: 'Compare a modality',
    description:
      'Use product hubs when the question is whether HBOT or hydrogen is the right technology family to inspect next.',
    href: '/store',
    action: 'Compare technology hubs',
  },
  {
    title: 'Plan a routine',
    description:
      'Use protocols when the question is how evidence, time burden, devices, and safety notes fit into a routine.',
    href: '/protocols',
    action: 'Open protocols',
  },
  {
    title: 'Ask before acting',
    description:
      'Use contact when evidence fit, symptoms, contraindications, or setup details need human review first.',
    href: '/contact',
    action: 'Ask a research question',
  },
] as const;

const researchSynthesisBrief = [
  {
    title: 'Cite the current scope',
    description:
      'Use the reviewed HBOT and hydrogen records, study type labels, sample context, and latest review date before carrying a claim into another page.',
  },
  {
    title: 'Preserve the limits',
    description:
      'Keep population fit, endpoint specificity, and unsupported inference notes visible when summarizing evidence for product or protocol decisions.',
  },
  {
    title: 'Hand off uncertainty',
    description:
      'Move to contact or a protocol page when a visitor needs practical narrowing beyond the static cited records.',
  },
] as const;

const evidenceExportPrep = [
  {
    title: 'Selected evidence lane',
    description:
      'Name whether the question uses HBOT, hydrogen, or uncertain-fit evidence before copying notes elsewhere.',
  },
  {
    title: 'Study and endpoint notes',
    description:
      'Carry study type, population fit, measured endpoint, and limitations into any manual brief.',
  },
  {
    title: 'Next-step destination',
    description:
      'Record whether the evidence should go to a product page, protocol, condition guide, rental review, or contact question.',
  },
] as const;

const evidenceComparisonRows = [
  {
    label: 'HBOT performance/recovery',
    studyMix: 'RCT and meta-analysis records',
    useFor: 'Recovery guide, HBOT hub, and recovery protocol context.',
    boundary: 'Do not turn protocol-specific endpoints into universal recovery certainty.',
    href: '/protocols/recovery-oxygen-foundation',
    action: 'Compare recovery protocol',
    modality: 'HBOT',
  },
  {
    label: 'Hydrogen stress/fatigue',
    studyMix: 'RCT, review, and meta-analysis records',
    useFor: 'Hydrogen hub, stress guide, and daily-routine protocol context.',
    boundary: 'Do not treat early or varied hydrogen literature as broad wellness proof.',
    href: '/protocols/stress-balance-h2-foundation',
    action: 'Compare hydrogen protocol',
    modality: 'H2',
  },
  {
    label: 'Uncertain fit',
    studyMix: 'Population or endpoint mismatch',
    useFor: 'Questions where symptoms, contraindications, or setup context need narrowing.',
    boundary: 'Do not generate a personalized recommendation from the static library.',
    href: '/contact',
    action: 'Ask for evidence fit review',
    modality: undefined,
  },
] as const;

const primaryLinkClass =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white shadow-md transition hover:bg-cyan-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900';
const lightTextLinkClass =
  'inline-flex min-h-11 items-center text-sm font-semibold text-slate-800 underline decoration-cyan-600/50 underline-offset-4 transition hover:text-cyan-800 focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700';
const darkTextLinkClass =
  'inline-flex min-h-11 items-center text-sm font-semibold underline decoration-cyan-600/50 underline-offset-4 transition hover:decoration-cyan-700 focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700';
const strongTextLinkClass =
  'inline-flex min-h-11 items-center text-sm font-bold text-slate-950 underline decoration-cyan-600/50 underline-offset-4 transition hover:text-cyan-900 hover:decoration-cyan-800 focus-visible:rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700';

// [DECISION: research route is an indexable, content-heavy evidence hub and should render the answer block, review context, and study links on the server; keep runtime caching behavior and avoid client-side filters so the page stays crawlable and faster to parse.]
// Rendering strategy: server-rendered research hub with schema emitted from the route and static study cards sourced from canonical content modules.

export const metadata: Metadata = createPageMetadata({
  title: 'HBOT & Hydrogen Research | Hylono',
  description:
    'Read the current HBOT and hydrogen evidence set, see the limits of the evidence, and move to the relevant product hub or protocol page.',
  path: '/research',
});

export default function ResearchPageRoute() {
  const researchStudyList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    '@id': `${env.NEXT_PUBLIC_SITE_URL}/research#study-list`,
    name: 'Hylono HBOT and hydrogen research studies',
    description: researchContent.subtitle,
    url: `${env.NEXT_PUBLIC_SITE_URL}/research`,
    inLanguage: 'en',
    dateModified: SCHEMA_DATE_MODIFIED,
    keywords: [
      'hyperbaric oxygen therapy research',
      'molecular hydrogen research',
      'HBOT evidence',
      'hydrogen wellness evidence',
      'wellness technology studies',
    ],
    isPartOf: { '@id': WEBSITE_ID() },
    publisher: { '@id': ORGANIZATION_ID() },
    itemListOrder: 'https://schema.org/ItemListUnordered',
    numberOfItems: researchStudies.length,
    itemListElement: researchStudies.map((study, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: study.url,
      item: {
        '@type': 'ScholarlyArticle',
        '@id': study.doi ? `https://doi.org/${study.doi}` : study.url,
        headline: study.title,
        description: study.summary,
        abstract: study.summary,
        url: study.url,
        inLanguage: 'en',
        datePublished: study.year.toString(),
        genre: study.studyType,
        about: {
          '@type': 'MedicalTherapy',
          name: study.modality === 'HBOT' ? 'Hyperbaric Oxygen Therapy' : 'Molecular Hydrogen',
        },
        author: {
          '@type': 'Person',
          name: study.authors,
        },
        isPartOf: {
          '@type': 'Periodical',
          name: study.publication,
        },
        ...(study.doi
          ? {
              identifier: {
                '@type': 'PropertyValue',
                propertyID: 'doi',
                value: study.doi,
              },
              sameAs: [`https://doi.org/${study.doi}`, study.url],
            }
          : {}),
        potentialAction: { '@type': 'ReadAction', target: [study.url] },
      },
    })),
  };

  const researchProductMentions = [...new Set(researchStudies.map((study) => study.modality))]
    .map((modality) => RESEARCH_MODALITY_PRODUCT_ROUTE[modality])
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({
      '@type': 'Product',
      '@id': `${env.NEXT_PUBLIC_SITE_URL}/product/${slug}#product`,
      url: `${env.NEXT_PUBLIC_SITE_URL}/product/${slug}`,
    }));

  const researchPageSchemaBase = createMedicalWebPageSchema({
    name: 'Hylono Research Hub',
    description:
      'Read the current HBOT and hydrogen research summaries, visible limitations, and next-step links to product hubs and protocols.',
    abstract:
      'Server-rendered evidence hub for HBOT and hydrogen studies with plain-language summaries, limitations, and links into the Hylono topical graph.',
    path: '/research',
    about: ['Mild Hyperbaric Oxygen Therapy', 'Hydrogen wellness technology', 'Protocol planning'],
    citations: researchStudies.map((study) => ({
      title: study.title,
      url: study.url,
      doi: study.doi,
      year: study.year,
      authors: study.authors,
    })),
    mainEntity: { '@id': `${env.NEXT_PUBLIC_SITE_URL}/research#study-list` },
    reviewedByName: siteOwnership.research.team,
    speakableSelectors: ['#research-answer-summary', '#research-library-disclaimer'],
    dateModified: SCHEMA_DATE_MODIFIED,
    lastReviewed: SCHEMA_DATE_MODIFIED,
  });

  const researchPageSchema = {
    ...researchPageSchemaBase,
    about: [
      {
        '@type': 'Product',
        '@id': `${env.NEXT_PUBLIC_SITE_URL}/product/hbot#product`,
        name: 'Hylono HBOT',
        url: `${env.NEXT_PUBLIC_SITE_URL}/product/hbot`,
      },
      {
        '@type': 'Product',
        '@id': `${env.NEXT_PUBLIC_SITE_URL}/product/hydrogen#product`,
        name: 'Hylono Hydrogen',
        url: `${env.NEXT_PUBLIC_SITE_URL}/product/hydrogen`,
      },
    ],
    keywords:
      'HBOT research, hydrogen research, hyperbaric oxygen therapy studies, molecular hydrogen evidence, wellness technology evidence',
    ...(researchProductMentions.length > 0 ? { mentions: researchProductMentions } : {}),
    relatedLink: [
      `${env.NEXT_PUBLIC_SITE_URL}/store`,
      `${env.NEXT_PUBLIC_SITE_URL}/conditions/recovery`,
      `${env.NEXT_PUBLIC_SITE_URL}/conditions/stress`,
      `${env.NEXT_PUBLIC_SITE_URL}/protocols`,
      `${env.NEXT_PUBLIC_SITE_URL}/rental`,
      `${env.NEXT_PUBLIC_SITE_URL}/conditions`,
      `${env.NEXT_PUBLIC_SITE_URL}/contact`,
    ],
  };

  return (
    <>
      <Suspense fallback={null}>
        <StructuredData id="jsonld-research-page" data={researchPageSchema} />
        <StructuredData id="jsonld-research-study-list" data={researchStudyList} />
        <StructuredData
          id="jsonld-research-breadcrumb"
          data={createBreadcrumbSchema([
            { name: 'Home', path: '/' },
            { name: 'Research', path: '/research' },
          ])}
        />
      </Suspense>

      <div className="research-page-shell bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
        <ResearchRouteActionStatus />

        {/* SECTION 1: ART-DIRECTED ALPINE HERO SECTION (FULL-BLEED PHOTOGRAPHIC SANCTUARY) */}
        <section className="relative w-full overflow-hidden border-b border-slate-200 bg-slate-100 min-h-[580px] lg:min-h-[660px] flex flex-col justify-center">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/about/hero-alpine-spa.jpg"
              alt="Hylono Research Alpine Wellness Sanctuary"
              fill
              priority
              className="object-cover object-[center_35%]"
              sizes="100vw"
              quality={90}
            />
            {/* Directional scrims: deep white fade on left for maximum contrast, revealing majestic alpine vista on right */}
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-white via-white/95 via-45% to-white/20 sm:to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-white/40"
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-6xl px-6 pt-28 pb-20 md:py-20 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-cyan-950 mb-3">
                Evidence hub
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-light tracking-tight text-slate-950 leading-[1.08] font-editorial">
                Science that supports real wellness decisions.
                <span className="sr-only">: HBOT and hydrogen research</span>
              </h1>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-800">
                HBOT & Hydrogen Research Hub
              </p>
              <p
                id="research-answer-summary"
                className="mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-slate-700"
              >
                Read the current HBOT and hydrogen evidence set, see measured outcomes, and move
                to the relevant technology or protocol page without guessing what the evidence
                does and does not support.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ResearchTrackedLink
                  href="/store"
                  className={primaryLinkClass}
                  ctaRole="primary"
                  eventName="research_route_cta_clicked"
                  source="hero"
                >
                  <span>Compare the technology hubs</span>
                  <span aria-hidden="true" className="ml-1.5 font-bold">→</span>
                </ResearchTrackedLink>
                <ResearchTrackedLink
                  href="/protocols"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300/90 bg-white/85 px-5 text-sm font-semibold text-slate-800 backdrop-blur-sm transition hover:bg-white hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                  ctaRole="supporting"
                  source="hero"
                >
                  Browse protocols
                </ResearchTrackedLink>
                <ResearchTrackedLink
                  href="/contact"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300/90 bg-white/85 px-5 text-sm font-semibold text-slate-800 backdrop-blur-sm transition hover:bg-white hover:border-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                  ctaRole="supporting"
                  source="hero"
                >
                  Ask a research question
                </ResearchTrackedLink>
              </div>

              {/* 3 Core takeaways - structured in a compact hairline card row */}
              <ul className="mt-8 grid gap-2.5 sm:grid-cols-3 text-xs leading-relaxed text-slate-600">
                <li className="rounded-lg border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-sm shadow-md">
                  The public hub now surfaces the full current reviewed HBOT and hydrogen evidence
                  set tied to live condition, product, and protocol pages.
                </li>
                <li className="rounded-lg border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-sm shadow-md">
                  Coverage is {curatedStudyCount} published records from {canonicalStudyCount}{' '}
                  reviewed evidence entries.
                </li>
                <li className="rounded-lg border border-slate-200/80 bg-white/80 p-3.5 backdrop-blur-sm shadow-md">
                  Modality coverage follows verified evidence availability, so unsupported
                  categories are intentionally not represented here yet.
                </li>
              </ul>
            </div>

            {/* Right side floating badge - reflects the signature circular badge in reference mockup */}
            <div className="hidden lg:flex flex-col items-end gap-6 text-right max-w-xs self-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full border border-slate-300/80 bg-white/70 backdrop-blur-md flex items-center justify-center shadow-md">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyan-600 animate-pulse" />
                </div>
                <div className="text-left">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-900">
                    HBOT & Hydrogen
                  </p>
                  <p className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
                    Research Hub
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200/70 bg-white/70 p-4 backdrop-blur-md shadow-md text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-800">
                  Real studies. Verified sources.
                </p>
                <p className="mt-1 text-xs text-slate-600 leading-normal">
                  Clearer next steps for evidence-informed protocols.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: FLOATING TRUST DOCK & CURRENT COVERAGE STRIP */}
        <section className="relative z-20 mx-auto max-w-6xl px-6 -mt-8 sm:-mt-10 mb-14">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-md">
            {/* Top Tier: Review Context */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-900">
                    Review context
                  </p>
                  <p className="mt-1 text-xs text-slate-500 max-w-xs">
                    Evidence cockpit for source scope, limitations, and next-step decisions.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Crawlable
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Source-first
                  </span>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    No scoring
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div className="border-l border-slate-200 pl-4">
                  <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Reviewed by</p>
                  <p className="mt-0.5 font-bold text-slate-900">{siteOwnership.research.team}</p>
                </div>
                <div className="border-l border-slate-200 pl-4">
                  <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">Last reviewed</p>
                  <p className="mt-0.5 font-bold text-slate-900">{displayReviewDate}</p>
                </div>
                <div className="col-span-2 sm:col-span-1 border-l border-slate-200 pl-4">
                  <p className="text-slate-400 font-medium uppercase tracking-wider text-[10px]">How to use this page</p>
                  <p className="mt-0.5 text-slate-600 text-[11px] leading-tight">
                    Use it to review evidence scope, limits, and related next steps. Do not treat it as personalized medical guidance.
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Tier: Current Coverage */}
            <div className="pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-8">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Current coverage</p>
                  <div className="mt-1 flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{curatedStudyCount}/{canonicalStudyCount}</span>
                    <span className="text-xs text-slate-500 font-medium">published / canonical</span>
                  </div>
                </div>

                <div className="border-l border-slate-200 pl-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Modalities</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{modalityCount}</p>
                </div>

                <div className="border-l border-slate-200 pl-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Latest year</p>
                  <p className="mt-1 text-2xl font-black text-slate-900">{latestStudyYear ?? 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 max-w-md">
                <span className="h-4 w-4 shrink-0 rounded-full border border-cyan-300 bg-cyan-100 text-cyan-800 text-[10px] font-bold flex items-center justify-center mt-0.5">✓</span>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong className="text-slate-900 font-semibold uppercase tracking-wider text-[10px] block mb-0.5">Citation guardrails</strong>
                  Structured data helps describe this page, but visible evidence scope and source quality remain the basis for any public research claim.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: CITATION GUARDRAILS (ASYMMETRIC ORGANIC HIGHLIGHT WITH HYDROGEN BUBBLE ARTWORK) */}
        <section className="mx-auto max-w-6xl px-6 py-12">
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-900">
              — How Hylono research currently supports
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl font-light tracking-tight text-slate-950 font-editorial">
              What Hylono research currently supports.
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              Use these answer frames for AI/search-style research questions. They summarize the
              current cited scope and the unsupported inferences that should not be attached to
              Hylono product, condition, protocol, or rental pages.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Hydrogen Guardrail - 7 cols with photographic water bubble texture */}
            <article className="lg:col-span-7 relative overflow-hidden rounded-lg border border-slate-200 bg-white p-7 sm:p-9 shadow-md flex flex-col justify-between">
              <div className="absolute right-0 top-0 bottom-0 w-2/5 pointer-events-none opacity-40 mix-blend-multiply overflow-hidden">
                <Image
                  src="/images/chambers/hbot-redesign/water-bubble-texture.png"
                  alt="Hydrogen micro-bubbles water refraction"
                  fill
                  className="object-cover object-right"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-white via-white/50 to-transparent" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-cyan-200 bg-cyan-50 flex items-center justify-center text-cyan-900 font-bold text-sm">
                    H₂
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {RESEARCH_CITATION_GUARDRAILS[0].query}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-light text-slate-950 font-editorial">
                      {RESEARCH_CITATION_GUARDRAILS[0].title}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700 max-w-lg">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                    <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      Current scope:
                    </p>
                    <p>{RESEARCH_CITATION_GUARDRAILS[0].supportedScope}</p>
                  </div>

                  <div className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-4">
                    <p className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span>⚠</span> Do not infer:
                    </p>
                    <p className="text-amber-950/80">{RESEARCH_CITATION_GUARDRAILS[0].notSupported}</p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-8 flex flex-wrap gap-4 text-sm font-semibold pt-4 border-t border-slate-100">
                {RESEARCH_CITATION_GUARDRAILS[0].links.map((link) => (
                  <ResearchTrackedLink
                    key={link.href}
                    href={link.href}
                    className={lightTextLinkClass}
                    ctaRole="contextual"
                    modality={link.modality}
                    source="citation_guardrail"
                  >
                    <span>{link.label}</span>
                    <span aria-hidden="true" className="ml-1">→</span>
                  </ResearchTrackedLink>
                ))}
              </div>
            </article>

            {/* HBOT Guardrail - 5 cols with sleek architectural card design */}
            <article className="lg:col-span-5 relative overflow-hidden rounded-lg border border-slate-200 bg-white p-7 sm:p-9 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-900 font-bold text-xs">
                    HBOT
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500">
                      {RESEARCH_CITATION_GUARDRAILS[1].query}
                    </p>
                    <h3 className="text-xl sm:text-2xl font-light text-slate-950 font-editorial">
                      {RESEARCH_CITATION_GUARDRAILS[1].title}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4 text-sm leading-relaxed text-slate-700">
                  <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4">
                    <p className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">
                      Current scope:
                    </p>
                    <p>{RESEARCH_CITATION_GUARDRAILS[1].supportedScope}</p>
                  </div>

                  <div className="rounded-lg border border-amber-200/60 bg-amber-50/40 p-4">
                    <p className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <span>⚠</span> Do not infer:
                    </p>
                    <p className="text-amber-950/80">{RESEARCH_CITATION_GUARDRAILS[1].notSupported}</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 text-sm font-semibold pt-4 border-t border-slate-100">
                {RESEARCH_CITATION_GUARDRAILS[1].links.map((link) => (
                  <ResearchTrackedLink
                    key={link.href}
                    href={link.href}
                    className={lightTextLinkClass}
                    ctaRole="contextual"
                    modality={link.modality}
                    source="citation_guardrail"
                  >
                    <span>{link.label}</span>
                    <span aria-hidden="true" className="ml-1">→</span>
                  </ResearchTrackedLink>
                ))}
              </div>
            </article>
          </div>
        </section>

        {/* SECTION 4: EVIDENCE COMPARISON & REVIEW MAP (CINEMATIC FULL-BLEED DARK SECTION) */}
        <section className="relative w-full overflow-hidden bg-slate-950 text-white py-16 lg:py-24 border-y border-slate-800">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/landing/testimonials-dusk-lake-v2.jpg"
              alt="Alpine dusk mountain horizon"
              fill
              className="object-cover object-center opacity-30"
              sizes="100vw"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/80"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="grid min-w-0 gap-10 lg:grid-cols-12 items-start">
              <div className="lg:col-span-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-cyan-300">
                  {researchContent.curationTitle}
                </p>
                <h2 className="mt-3 text-3xl sm:text-5xl font-light tracking-tight text-white font-editorial">
                  Full current HBOT and hydrogen coverage.
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-300">
                  {researchContent.selectionPolicy}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">
                  {researchContent.scopeNote}
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-cyan-200/80">
                  {researchContent.sortLabel}
                </p>

                {/* Direct Exits in Dark Section */}
                <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.045] p-6 backdrop-blur-md">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Direct exits
                  </p>
                  <h2 className="mt-2 text-xl font-bold tracking-tight text-white">
                    Keep the evidence path specific.
                  </h2>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                    <ResearchTrackedLink
                      href="/conditions/recovery"
                      className="inline-flex min-h-11 items-center text-cyan-300 underline decoration-cyan-400/50 underline-offset-4 hover:text-cyan-200"
                      ctaRole="supporting"
                      modality="HBOT"
                      source="direct_exits"
                    >
                      Open the recovery guide
                    </ResearchTrackedLink>
                    <ResearchTrackedLink
                      href="/conditions/stress"
                      className="inline-flex min-h-11 items-center text-cyan-300 underline decoration-cyan-400/50 underline-offset-4 hover:text-cyan-200"
                      ctaRole="supporting"
                      modality="H2"
                      source="direct_exits"
                    >
                      Open the stress guide
                    </ResearchTrackedLink>
                    <ResearchTrackedLink
                      href="/rental"
                      className="inline-flex min-h-11 items-center text-cyan-300 underline decoration-cyan-400/50 underline-offset-4 hover:text-cyan-200"
                      ctaRole="supporting"
                      source="direct_exits"
                    >
                      Explore rentals
                    </ResearchTrackedLink>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-slate-400">
                    Use a condition guide when you need context first, or rental when you are already
                    narrowing toward trial, logistics, and support.
                  </p>
                </div>
              </div>

              {/* Evidence Review Map Card - Floating Twilight Card */}
              <div className="lg:col-span-5 rounded-lg border border-white/15 bg-white/[0.07] p-6 sm:p-7 backdrop-blur-lg shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-300">
                    Evidence review map
                  </p>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    Static taxonomy
                  </span>
                </div>
                <p className="mt-4 text-xs leading-relaxed text-slate-300">
                  Use these static groups to scan the current library by modality and study type.
                  The page does not assign numeric evidence-strength scores.
                </p>

                <div className="mt-6 space-y-6">
                  {researchFilterGroups.map((group) => (
                    <div key={group.title}>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                        {group.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={`${group.title}-${item.label}`}
                            className="rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1 text-xs font-semibold text-white backdrop-blur-sm"
                          >
                            {item.label}: {item.count} studies
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: EVIDENCE COMPARISON TABLE (EDITORIAL LIGHT SURFACE) */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="rounded-lg border border-slate-200 bg-white shadow-md overflow-hidden">
            <div className="border-b border-slate-100 bg-slate-50/50 p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-900">
                Evidence comparison table
              </p>
              <h3 className="mt-2 text-2xl sm:text-3xl font-light tracking-tight text-slate-950 font-editorial">
                Compare current evidence without scoring it.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 max-w-3xl">
                This table compares current modality scope, study mix, use cases, and
                unsupported inference boundaries. It is not an interactive evidence-strength
                filter, export tool, downloadable PDF, numeric grade, or generated
                recommendation.
              </p>
            </div>

            <div className="max-w-full overflow-x-auto">
              <table className="min-w-[720px] w-full border-collapse text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase tracking-[0.16em] text-slate-500">
                  <tr>
                    <th scope="col" className="px-6 py-3.5 font-bold">Evidence lane</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Study mix</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Use for</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Boundary</th>
                    <th scope="col" className="px-6 py-3.5 font-bold">Next step</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {evidenceComparisonRows.map((row) => (
                    <tr key={row.label} className="hover:bg-slate-50/70 transition">
                      <th scope="row" className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">
                        {row.label}
                      </th>
                      <td className="px-6 py-4 leading-relaxed text-slate-600">{row.studyMix}</td>
                      <td className="px-6 py-4 leading-relaxed text-slate-700">{row.useFor}</td>
                      <td className="px-6 py-4 leading-relaxed text-slate-600 text-xs">{row.boundary}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <ResearchTrackedLink
                          href={row.href}
                          className={strongTextLinkClass}
                          ctaRole="supporting"
                          modality={row.modality}
                          source="evidence_comparison_table"
                        >
                          <span>{row.action}</span>
                          <span aria-hidden="true" className="ml-1">→</span>
                        </ResearchTrackedLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* How Hylono reads evidence - 4 Principles */}
            <div className="border-t border-slate-200 bg-slate-50/50 p-6 sm:p-8">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                How Hylono reads evidence
              </p>
              <p className="mt-2 text-xs leading-relaxed text-slate-600 max-w-2xl">
                This is a visible editorial framework, not a numeric grade. Hylono keeps research
                claims conservative by checking design, population fit, endpoint specificity, and
                limitations before connecting a study to a next step.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {evidenceReadingPrinciples.map((principle) => (
                  <article
                    key={principle.title}
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-md"
                  >
                    <h3 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>
                      {principle.title}
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">
                      {principle.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: INTENT ROUTING, SYNTHESIS BRIEF & EXPORT PREPARATION */}
        <section className="mx-auto max-w-6xl px-6 py-12 space-y-12">
          {/* Intent Next Steps */}
          <div>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="max-w-2xl">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-900">
                  Start with the question
                </p>
                <h2 className="mt-2 text-3xl font-light tracking-tight text-slate-950 font-editorial">
                  Choose the evidence path that matches your intent.
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  The current library is still compact enough to scan directly. Start with the
                  modality snapshots, then move into condition guides, source studies, product hubs,
                  protocols, or rental planning depending on what question you need answered next.
                </p>
              </div>
              <ResearchTrackedLink
                href="/conditions"
                className={lightTextLinkClass}
                ctaRole="supporting"
                source="condition_prompt"
              >
                Browse related conditions
              </ResearchTrackedLink>
            </div>

            <div className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-md">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
                Intent next steps
              </p>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
                Match the next page to the research question.
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-500 max-w-2xl">
                This is a static guidance aid, not an evidence-strength filter, downloadable
                synthesis, or personalized recommendation.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {researchIntentNextSteps.map((step) => (
                  <article key={step.title} className="rounded-lg border border-slate-100 bg-slate-50/70 p-4 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{step.title}</h4>
                      <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.description}</p>
                    </div>
                    <div className="mt-4 pt-2 border-t border-slate-200/60">
                      <ResearchTrackedLink
                        href={step.href}
                        className={strongTextLinkClass}
                        ctaRole="supporting"
                        source="intent_next_steps"
                      >
                        <span>{step.action}</span>
                      </ResearchTrackedLink>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Synthesis Brief */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-900">
              Synthesis brief
            </p>
            <h3 className="mt-2 text-2xl font-light tracking-tight text-slate-950 font-editorial">
              Research synthesis brief for cited next steps.
            </h3>
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-600">
              Use this static brief before turning the library into page copy, product context, or
              a support question. It is a crawlable summary artifact, not a downloadable PDF,
              export tool, numeric evidence grade, or generated recommendation.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {researchSynthesisBrief.map((item) => (
                <article key={item.title} className="rounded-lg border border-slate-100 bg-slate-50/70 p-5">
                  <h4 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{item.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold pt-4 border-t border-slate-100">
              <ResearchTrackedLink
                href="#study-library"
                className={lightTextLinkClass}
                ctaRole="supporting"
                source="research_synthesis_brief"
              >
                Open cited study cards
              </ResearchTrackedLink>
              <ResearchTrackedLink
                href="/protocols"
                className={lightTextLinkClass}
                ctaRole="supporting"
                source="research_synthesis_brief"
              >
                Match to protocols
              </ResearchTrackedLink>
              <ResearchTrackedLink
                href="/contact"
                className={lightTextLinkClass}
                ctaRole="supporting"
                source="research_synthesis_brief"
              >
                Ask for human review
              </ResearchTrackedLink>
            </div>
          </div>

          {/* Evidence Export Preparation */}
          <div className="rounded-lg border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-900">
              Evidence export preparation
            </p>
            <h3 className="mt-2 text-2xl font-light tracking-tight text-slate-950 font-editorial">
              Prepare a manual evidence handoff without generating a file.
            </h3>
            <p className="mt-3 max-w-3xl text-xs leading-relaxed text-slate-600">
              Use this checklist before copying evidence into notes or a support question. It is
              not a downloadable PDF, CSV export, saved evidence pack, numeric score, or generated
              recommendation.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {evidenceExportPrep.map((item) => (
                <article key={item.title} className="rounded-lg border border-slate-100 bg-slate-50/70 p-5">
                  <h4 className="text-sm font-bold text-slate-900" style={{ fontFamily: 'var(--font-sans), sans-serif' }}>{item.title}</h4>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.description}</p>
                </article>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold pt-4 border-t border-slate-100">
              <ResearchTrackedLink
                href="#study-library"
                className={lightTextLinkClass}
                ctaRole="supporting"
                source="evidence_export_prep"
              >
                Reopen study cards
              </ResearchTrackedLink>
              <ResearchTrackedLink
                href="/contact"
                className={lightTextLinkClass}
                ctaRole="supporting"
                source="evidence_export_prep"
              >
                Ask with evidence context
              </ResearchTrackedLink>
            </div>
          </div>

          {/* Modality Snapshots */}
          {activeResearchModalities.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {activeResearchModalities.map((modality) => {
                const studies = researchStudies.filter((study) => study.modality === modality);
                const productHref = `/product/${RESEARCH_MODALITY_PRODUCT_ROUTE[modality]}`;
                const protocolHref = RESEARCH_MODALITY_PROTOCOL_ROUTE[modality];
                const condition = RESEARCH_MODALITY_CONDITION_ROUTE[modality];
                const content = RESEARCH_MODALITY_INTROS[modality];

                return (
                  <article
                    key={modality}
                    className="relative overflow-hidden rounded-lg border border-slate-200 bg-white p-7 shadow-md flex flex-col justify-between"
                  >
                    <div
                      aria-hidden="true"
                      className="absolute right-6 top-6 text-7xl font-black tracking-tight text-slate-100 select-none pointer-events-none"
                    >
                      {modality}
                    </div>
                    <div className="relative z-10">
                      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-900">
                        {content.eyebrow}
                      </p>
                      <h3 className="mt-2 text-2xl font-light tracking-tight text-slate-950 font-editorial">
                        {content.heading}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-slate-700">{content.description}</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">{content.limitation}</p>

                      <div className="mt-5 flex flex-wrap gap-2">
                        {studies.map((study) => (
                          <span
                            key={study.id}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700"
                          >
                            {study.studyType} | {study.year}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="relative z-10 mt-6 flex flex-wrap gap-4 text-sm font-semibold pt-4 border-t border-slate-100">
                      <ResearchTrackedLink
                        href={productHref}
                        className={strongTextLinkClass}
                        ctaRole="contextual"
                        modality={modality}
                        source="modality_snapshot"
                      >
                        <span>View the {RESEARCH_MODALITY_PRODUCT_NAME[modality]} hub</span>
                      </ResearchTrackedLink>
                      <ResearchTrackedLink
                        href={condition.href}
                        className={lightTextLinkClass}
                        ctaRole="contextual"
                        modality={modality}
                        source="modality_snapshot"
                      >
                        <span>Open the {condition.label}</span>
                      </ResearchTrackedLink>
                      <ResearchTrackedLink
                        href={protocolHref}
                        className={lightTextLinkClass}
                        ctaRole="contextual"
                        modality={modality}
                        source="modality_snapshot"
                      >
                        <span>See the related protocol</span>
                      </ResearchTrackedLink>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">
              {researchContent.emptyState}
            </div>
          )}
        </section>

        {/* SECTION 7: STUDY LIBRARY (#study-library) */}
        <section className="border-t border-slate-200 bg-slate-100/70 py-16">
          <div id="study-library" className="mx-auto max-w-6xl px-6">
            <div className="max-w-2xl">
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-900">
                Study library
              </p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-light tracking-tight text-slate-950 font-editorial">
                Read the selected studies with source context up front.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Each card shows the study type, source provenance, primary endpoint, and a
                plain-language takeaway before you decide whether to continue to source material or
                the next Hylono page.
              </p>
            </div>

            {researchStudies.length > 0 ? (
              <div className="mt-10 grid gap-6 lg:grid-cols-2">
                {researchStudies.map((study) => {
                  const productHref = `/product/${RESEARCH_MODALITY_PRODUCT_ROUTE[study.modality]}`;
                  const protocolHref = RESEARCH_MODALITY_PROTOCOL_ROUTE[study.modality];

                  return (
                    <article
                      key={study.id}
                      className="rounded-lg border border-slate-200 bg-white p-6 sm:p-7 shadow-md flex flex-col justify-between hover:border-cyan-300 transition"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-bold text-white">
                            {study.modality}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                            {study.studyType}
                          </span>
                          <span className="text-xs font-medium text-slate-500">{study.year}</span>
                        </div>

                        <h3
                          className="mt-4 text-xl font-bold leading-snug text-slate-900"
                          style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                        >
                          {study.title}
                        </h3>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          {study.authors} | {study.publication}
                        </p>

                        <div className="mt-4 grid gap-2 text-xs leading-relaxed text-slate-600 sm:grid-cols-2 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                          <p>
                            <span className="font-semibold text-slate-900">Population:</span>{' '}
                            {study.population}
                          </p>
                          <p>
                            <span className="font-semibold text-slate-900">Primary endpoint:</span>{' '}
                            {study.primaryEndpoint}
                          </p>
                          {study.sampleSize ? (
                            <p>
                              <span className="font-semibold text-slate-900">Sample size:</span> n=
                              {study.sampleSize}
                            </p>
                          ) : null}
                        </div>

                        <p className="mt-4 text-sm leading-relaxed text-slate-700">{study.summary}</p>

                        {study.doi ? (
                          <p className="mt-3 text-xs text-slate-400 font-mono">DOI: {study.doi}</p>
                        ) : null}
                      </div>

                      <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold pt-4 border-t border-slate-100">
                        <ResearchTrackedExternalLink
                          href={study.url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex min-h-8 items-center rounded-lg text-slate-900 underline decoration-slate-400 underline-offset-4 transition hover:text-cyan-800 hover:decoration-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700"
                        >
                          Open the source study
                        </ResearchTrackedExternalLink>
                        <ResearchTrackedLink
                          href={productHref}
                          className={lightTextLinkClass}
                          ctaRole="contextual"
                          modality={study.modality}
                          source="study_card"
                          studyId={study.id}
                        >
                          View the related product hub
                        </ResearchTrackedLink>
                        <ResearchTrackedLink
                          href={protocolHref}
                          className={lightTextLinkClass}
                          ctaRole="contextual"
                          modality={study.modality}
                          source="study_card"
                          studyId={study.id}
                        >
                          Continue to a protocol
                        </ResearchTrackedLink>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-md">
                {researchContent.emptyState}
              </div>
            )}
          </div>
        </section>

        {/* SECTION 8: SCOPE & LIMITATIONS + PAGE OWNERSHIP */}
        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-6 lg:grid-cols-12 items-start">
            <div
              id="research-library-disclaimer"
              className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-7 sm:p-8 shadow-md"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-900">
                Scope and limitations
              </p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-light tracking-tight text-slate-950 font-editorial">
                Use this page to judge fit, not to stretch claims.
              </h2>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <p>{researchContent.disclaimer}</p>
                <p>
                  Some studies in this library report promising signals, but none of them replace
                  product-specific guidance, clinician input, or protocol suitability review.
                </p>
                <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                  Last reviewed:{' '}
                  <time dateTime={displayReviewDateIso} className="font-semibold text-slate-800">
                    {displayReviewDate}
                  </time>
                </p>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-7 sm:p-8 shadow-md">
              <PageOwnership
                eyebrow="Ownership and freshness"
                title="Who keeps the evidence hub conservative"
                description="This research hub is maintained as educational evidence context for public Hylono pages, not as personalized medical advice or a live clinical recommendation system."
                items={[
                  {
                    label: siteOwnership.research.label,
                    value: siteOwnership.research.team,
                    detail:
                      'Reviews cited-study alignment, source provenance, and visible limitation wording.',
                  },
                  {
                    label: siteOwnership.editorial.label,
                    value: siteOwnership.editorial.team,
                    detail:
                      'Keeps page hierarchy, next-step links, and policy context aligned with the topical graph.',
                  },
                  {
                    label: 'Support coverage',
                    value: `${siteEntity.serviceArea} | ${siteEntity.supportHours}`,
                    detail: `Research-fit questions can be routed through ${siteEntity.contactEmail}.`,
                  },
                ]}
                note="Ownership, review, and support details come from the shared Hylono trust record used across health-adjacent public pages."
                variant="default"
              />

              <div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold pt-4 border-t border-slate-100">
                <ResearchTrackedLink
                  href="/policies"
                  className={lightTextLinkClass}
                  ctaRole="supporting"
                  source="ownership_freshness"
                >
                  Open policies
                </ResearchTrackedLink>
                <ResearchTrackedLink
                  href="/help"
                  className={lightTextLinkClass}
                  ctaRole="supporting"
                  source="ownership_freshness"
                >
                  Open help center
                </ResearchTrackedLink>
                <ResearchTrackedLink
                  href="/contact"
                  className={lightTextLinkClass}
                  ctaRole="supporting"
                  source="ownership_freshness"
                >
                  Ask with context
                </ResearchTrackedLink>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: FINAL NEXT STEP BANNER (HORIZON PANORAMA WITH GLACIAL ACCENTS) */}
        <section className="relative w-full overflow-hidden bg-slate-950 text-white py-14 border-t border-slate-800">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/landing/testimonials-dusk-lake-v2.jpg"
              alt="Hylono horizon"
              fill
              className="object-cover object-center opacity-25"
              sizes="100vw"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/90"
            />
          </div>

          <div className="relative z-10 mx-auto max-w-6xl px-6">
            <div className="rounded-lg border border-white/15 bg-white/[0.045] p-8 sm:p-10 backdrop-blur-md">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-cyan-300">
                    Next step
                  </p>
                  <h2 className="mt-2 text-3xl sm:text-4xl font-light tracking-tight text-white font-editorial">
                    Move from evidence to an actionable path.
                  </h2>
                  <p className="mt-3 text-sm text-slate-300 max-w-xl">
                    Explore the technology hubs, protocols, or contact our team for guided support.
                  </p>
                  <ol className="mt-4 space-y-2 text-xs font-medium text-slate-300">
                    <li>1. Compare the relevant HBOT or hydrogen hub.</li>
                    <li>2. Check the matching protocol guide.</li>
                    <li>3. Use contact if you need help narrowing the fit.</li>
                  </ol>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3">
                  <ResearchTrackedLink
                    href="/store"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-500 px-6 text-sm font-semibold text-slate-950 shadow-md transition hover:bg-cyan-400"
                    ctaRole="supporting"
                    source="final_next_step"
                  >
                    Compare product hubs
                  </ResearchTrackedLink>
                  <ResearchTrackedLink
                    href="/protocols"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/25 bg-white/[0.08] px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.15]"
                    ctaRole="supporting"
                    source="final_next_step"
                  >
                    Browse protocols
                  </ResearchTrackedLink>
                  <ResearchTrackedLink
                    href="/rental"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/25 bg-white/[0.08] px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.15]"
                    ctaRole="supporting"
                    source="final_next_step"
                  >
                    Explore rentals
                  </ResearchTrackedLink>
                  <ResearchTrackedLink
                    href="/contact"
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/25 bg-white/[0.08] px-5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/[0.15]"
                    ctaRole="supporting"
                    source="final_next_step"
                  >
                    Contact Hylono
                  </ResearchTrackedLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
