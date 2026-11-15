import Image from 'next/image';
import { BookOpen, CalendarDays, Layers, Timer } from 'lucide-react';
import type { ConditionGoalPage } from '@/content/conditions';
import { conditionGoalBySlug } from '@/content/conditions';
import { CITATION_DISCLAIMER, disclaimers } from '@/content/disclaimers';
import { evidenceById } from '@/content/evidence';
import { protocolBySlug } from '@/content/protocols';
import { toProtocolCardView } from '@/content/protocolView';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { PageOwnership } from '@/components/content/PageOwnership';
import { getConditionDetailJourney } from '@/components/ConditionDetailShell';
import {
  ConditionReturnLink,
  ConditionRouteActionStatus,
  ConditionTransitionLink,
} from '@/components/ConditionTransitionLink';

/**
 * Hylono brand tokens. One file, one palette, no drift.
 *
 * BRONZE is the warm-mineral bronze from
 * docs/brand/02_PAGE_ALIGNMENT_AND_LAYOUT_SPECIFICATION.md (#966D48), which is
 * also the value the live /conditions hub uses for its eyebrows and numerals;
 * the spec's alternative #8C6D46 appears only twice there, so #966D48 is the
 * consistent pick. CORAL is Cormorant Garamond for display type, MONO_EYEBROW
 * is Syncopate for technical eyebrows.
 *
 * Hydrogen carries the modality accents: hydrogen leads every stress ranking
 * (content/conditions.ts -> modalities[0] is H2), so focus rings and hover
 * borders stay in the hydrogen teal family instead of the default cyan.
 */
const BRONZE = '#966D48';
const CORAL = 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif';
const MONO_EYEBROW = 'var(--font-syncopate), "Syncopate", sans-serif';

const displayClass =
  'font-normal tracking-tight text-slate-950 break-words';
const eyebrowClass = `text-xs font-bold uppercase tracking-[0.25em]`;
const focusRing = `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0D9488]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]`;
const quietFocusRing = `focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#0D9488]/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]`;

const modalityProductHref = {
  HBOT: '/product/hbot',
  H2: '/product/hydrogen',
  RLT: '/product/rlt',
  PEMF: '/product/pemf',
} as const;

const modalityAccentFallback = {
  dot: 'bg-[#A855F7]',
  text: 'text-[#7E22CE]',
  ring: 'hover:border-[#A855F7]/50',
};

const modalityAccent: Record<string, typeof modalityAccentFallback> = {
  H2: { dot: 'bg-[#0D9488]', text: 'text-[#0F766E]', ring: 'hover:border-[#0D9488]/50' },
  PEMF: { dot: 'bg-[#A855F7]', text: 'text-[#7E22CE]', ring: 'hover:border-[#A855F7]/50' },
  HBOT: { dot: 'bg-[#0891B2]', text: 'text-[#0E7490]', ring: 'hover:border-[#0891B2]/50' },
  RLT: { dot: 'bg-[#D97706]', text: 'text-[#92400E]', ring: 'hover:border-[#D97706]/50' },
};

const displayReviewDate = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
}).format(new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`));

/**
 * Relevance is a planning weight published in content/conditions.ts, not a
 * suitability score. The label names the modality so a screen-reader user hears
 * which modality the five dots belong to.
 */
function RelevanceDots({ score, label }: { score: number; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-slate-500"
      role="img"
      aria-label={`${label}: planning relevance ${score} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`stress-dot-${label}-${index}`}
          aria-hidden="true"
          className={`h-2 w-2 rounded-[9999px] ${
            index < score ? 'bg-[#0D9488]' : 'bg-slate-200'
          }`}
        />
      ))}
      <span className="ml-1 font-semibold text-slate-600">{score}/5</span>
    </span>
  );
}

export function StressSanctuaryContent({ slug }: { slug: ConditionGoalPage['slug'] }) {
  const goal = conditionGoalBySlug[slug];

  if (!goal || goal.slug !== 'stress') {
    return null;
  }

  const { primaryAction, supportingProduct, supportingProtocol } =
    getConditionDetailJourney(goal);

  const fallbackAction =
    primaryAction.href === '/rental'
      ? { href: '/contact', label: 'Book a consultation' }
      : { href: '/rental', label: 'Explore rentals' };

  const evidenceRecords = goal.evidenceIds
    .map((evidenceId) => evidenceById[evidenceId])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const sampleSizeDelta = (b.sampleSize ?? -1) - (a.sampleSize ?? -1);
      if (sampleSizeDelta !== 0) return sampleSizeDelta;
      return a.title.localeCompare(b.title);
    });

  const protocolViews = goal.protocolSlugs
    .map((protocolSlug) => toProtocolCardView(protocolSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  const leadProtocolSlug =
    goal.protocolSlugs.find((protocolSlug) => Boolean(protocolBySlug[protocolSlug])) ??
    'stress-balance-h2-foundation';
  const leadProtocol = protocolBySlug[leadProtocolSlug];

  // Population limits per cited record, written from each record's own scope.
  const evidenceLimits: Record<string, string> = {
    'ev-h2-001':
      'Healthy adults, fatigue and aerobic-capacity endpoints. Protocol heterogeneity and a limited evidence base are noted by the authors, so this does not transfer directly to a stress-outcome goal.',
    'ev-h2-003':
      'Review-level synthesis of early literature. The authors state that more rigorous research is needed before broad claims, so read it as background rather than settled guidance.',
  };

  const studyQualityChecklist = [
    {
      title: 'Study design',
      body: 'Check whether a card is a meta-analysis, a review, or another evidence type before comparing endpoints.',
    },
    {
      title: 'Population fit',
      body: 'Compare the studied population with the week you are actually planning for before assuming the result transfers.',
    },
    {
      title: 'Endpoint limits',
      body: 'Read a result summary as planning context, not as a severity score, budget result, or personal suitability decision.',
    },
  ] as const;

  const decisionForks = [
    {
      title: 'Evidence first',
      body: 'Open the research records before any device decision when the evidence context should lead the conversation.',
      href: '/research',
      label: 'Review evidence',
      ctaRole: 'supporting' as const,
    },
    {
      title: 'Rental fit',
      body: 'Take the lower-commitment path when setup friction, follow-through, or ownership timing needs a trial first.',
      href: '/rental',
      label: 'Check rental fit',
      ctaRole: 'fallback' as const,
    },
    {
      title: 'Human review',
      body: 'Talk to a person when the goal needs practical narrowing before a device, protocol, or stack is chosen.',
      href: '/contact',
      label: 'Ask Hylono',
      ctaRole: 'primary' as const,
    },
  ];

  const dockLinks = [
    { href: '/conditions', label: 'Condition index', note: 'All five goal guides' },
    { href: '/research', label: 'Research hub', note: 'Cited records in full' },
    { href: supportingProduct.href, label: supportingProduct.label, note: 'Hydrogen devices' },
    {
      href: supportingProtocol?.href ?? '/protocols',
      label: supportingProtocol?.label ?? 'Protocol library',
      note: 'Four-week hydrogen structure',
    },
    { href: '/rental', label: 'Rental options', note: 'Lower-commitment routine check' },
    { href: '/contact', label: 'Contact Hylono', note: 'Human narrowing before devices' },
  ];

  const ribbonNodes = [
    {
      icon: CalendarDays,
      value: leadProtocol ? `${leadProtocol.durationWeeks} weeks` : '4 weeks',
      label: leadProtocol?.title ?? 'Lead protocol',
    },
    {
      icon: Timer,
      value: leadProtocol?.timePerDay ?? '25-40 min',
      label: 'Published daily window',
    },
    {
      icon: Layers,
      value: `${goal.modalities.length}`,
      label: 'Modalities compared here',
    },
    {
      icon: BookOpen,
      value: `${goal.evidenceIds.length}`,
      label: 'Cited research records',
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16 text-slate-950">
      <ConditionRouteActionStatus />

      {/* SECTION 1: ASYMMETRICAL EDITORIAL HERO */}
      <section
        className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20"
        aria-labelledby="stress-hero-headline"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(52rem_30rem_at_85%_-10%,rgba(13,148,136,0.12),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <header id="condition-intro" className="min-w-0">
            <ConditionReturnLink
              condition={goal.slug}
              className={`inline-flex min-h-11 items-center rounded-[9999px] px-3 text-sm font-semibold text-[#0F766E] hover:text-[#115E59] ${quietFocusRing}`}
            />

            <div className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
              <div className="min-w-0 lg:col-span-7">
                <div className="flex items-center gap-3">
                  <span
                    className={`${eyebrowClass} text-[#0F766E]`}
                    style={{ fontFamily: MONO_EYEBROW }}
                  >
                    High-demand weeks — hydrogen support guide
                  </span>
                  <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
                </div>

                <h1
                  id="stress-hero-headline"
                  className={`${displayClass} mt-4 text-5xl leading-[0.98] sm:text-6xl lg:text-[4.75rem]`}
                  style={{ fontFamily: CORAL }}
                >
                  Stress
                </h1>

                <p
                  className="mt-2 max-w-2xl text-2xl font-normal italic leading-tight break-words sm:text-3xl"
                  style={{ fontFamily: CORAL }}
                >
                  Four weeks of hydrogen, before anything else.
                </p>

                <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg break-words">
                  {goal.subtitle}
                </p>

                <div className="mt-5 max-w-2xl space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                  {goal.description.map((paragraph, index) => (
                    <p key={`stress-hero-${index}`} className="break-words">
                      {paragraph}
                    </p>
                  ))}
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-600">
                  {[
                    `${goal.modalities.length} technology comparisons`,
                    `${goal.protocolSlugs.length} related protocol guides`,
                    `${goal.evidenceIds.length} cited research summaries`,
                  ].map((chip) => (
                    <span
                      key={`stress-chip-${chip}`}
                      className="rounded-[9999px] border border-[#E8E1D5] bg-white/70 px-3 py-1 break-words"
                    >
                      {chip}
                    </span>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="primary"
                    href={primaryAction.href}
                    source="detail_intro"
                    label={primaryAction.label}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] bg-[#143D34] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E2C25] ${focusRing}`}
                  />
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="supporting"
                    href={supportingProduct.href}
                    source="detail_intro"
                    label={supportingProduct.label}
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] border border-[#DDD6C8] bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-800 backdrop-blur-xs transition-colors hover:border-[#C4B7A0] hover:bg-white ${quietFocusRing}`}
                  />
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="fallback"
                    href={supportingProtocol?.href ?? '/research'}
                    source="detail_intro"
                    label={
                      supportingProtocol
                        ? `Review ${supportingProtocol.label}`
                        : 'Browse research'
                    }
                    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] px-3 py-3.5 text-sm font-semibold text-[#0F766E] underline decoration-[#0D9488]/40 underline-offset-4 transition-colors hover:text-[#115E59] hover:decoration-[#0D9488] ${quietFocusRing}`}
                  />
                </div>
              </div>

              <figure className="min-w-0 lg:col-span-5">
                <div className="relative overflow-hidden rounded-[2rem] border-2 border-white/85 shadow-[0_20px_50px_rgba(20,61,52,0.12)]">
                  <Image
                    src="/images/conditions/goal-stress-dock.jpg"
                    alt="Weathered wooden dock reaching into a still alpine lake under low cloud, with a round meditation cushion resting on the planks"
                    width={1200}
                    height={900}
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141716]/30 via-transparent to-transparent"
                  />
                  <figcaption className="absolute bottom-3 left-3 rounded-[9999px] border border-white/60 bg-[#141716]/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                    Low-noise, single-session setting
                  </figcaption>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-slate-500 break-words">
                  A short, repeatable session beats a long, occasional one. Device fit still has to
                  clear the room, the schedule, and the review call.
                </p>
              </figure>
            </div>
          </header>
        </div>
      </section>

      {/* SECTION 1B: FIRST-VIEW OWNERSHIP + ROUTE MAP */}
      {/*
        DOM order here is load-bearing: e2e/conditions-routing.spec.ts tab-walks
        return link -> 3 intro CTAs -> 4 ownership actions -> 3 route-map links, so
        these two blocks must stay immediately adjacent to #condition-intro and
        immediately before each other. Same contract as ConditionDetailShell.
        Do not move them below the ribbon, technologies, protocol, or dock sections.
      */}
      <section
        className="mx-auto mt-10 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-label="Guide ownership and first-view next steps"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(19rem,0.8fr)]">
          <div className="min-w-0">
            <PageOwnership
              title="Guide review context"
              description="This stress guide compares hydrogen-first routine options, shows the current evidence posture with its stated limits, and moves visitors into stronger product, protocol, research, rental, or contact paths."
              items={[
                {
                  label: siteOwnership.editorial.label,
                  value: siteOwnership.editorial.team,
                  detail: 'Owns page clarity, next-step fit, and visible trust signals on this guide.',
                },
                {
                  label: siteOwnership.research.label,
                  value: siteOwnership.research.team,
                  detail: 'Reviews cited-study alignment and keeps stress wording conservative.',
                },
                {
                  label: 'Last reviewed',
                  value: displayReviewDate,
                  detail: 'Use this guide to plan and compare — not as personal professional advice.',
                },
                {
                  label: 'Support coverage',
                  value: `${siteEntity.serviceArea} | ${siteEntity.supportHours}`,
                  detail: `Not sure where to go next? ${siteEntity.contactEmail} gets you a human.`,
                },
              ]}
              actions={[
                { href: '/research', label: 'Open research' },
                { href: '/about', label: 'About Hylono' },
                { href: '/contact', label: 'Contact Hylono' },
                { href: '/help', label: 'Open help' },
              ]}
              note="Ownership, review, and support details come from the canonical Hylono trust record used across public health-adjacent pages."
            />
          </div>

          <aside
            className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8"
            aria-labelledby="stress-route-map-headline"
          >
            <p
              className={`${eyebrowClass} text-[11px] text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              First-view next steps
            </p>
            <h2
              id="stress-route-map-headline"
              className={`${displayClass} mt-3 text-2xl`}
              style={{ fontFamily: CORAL }}
            >
              Best next steps for stress
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 break-words">
              Start here if you want a fast way to compare technologies, read the protocol structure,
              and find the best next step for stress.
            </p>

            <dl className="mt-5 divide-y divide-[#EAE4D8] border-y border-[#EAE4D8]">
              <div className="py-3">
                <dt className="text-sm font-medium text-slate-500">Primary product hub</dt>
                <dd className="mt-1">
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="primary"
                    href={supportingProduct.href}
                    source="detail_route_map"
                    label={supportingProduct.label}
                    className={`inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#0F766E] underline decoration-[#0D9488]/40 underline-offset-4 transition-colors hover:text-[#115E59] ${quietFocusRing}`}
                  />
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-sm font-medium text-slate-500">Supporting protocol</dt>
                <dd className="mt-1">
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="supporting"
                    href={supportingProtocol?.href ?? '/research'}
                    source="detail_route_map"
                    label={supportingProtocol?.label ?? 'Research hub'}
                    className={`inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#0F766E] underline decoration-[#0D9488]/40 underline-offset-4 transition-colors hover:text-[#115E59] ${quietFocusRing}`}
                  />
                </dd>
              </div>
              <div className="py-3">
                <dt className="text-sm font-medium text-slate-500">Research page</dt>
                <dd className="mt-1">
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="fallback"
                    href="/research"
                    source="detail_route_map"
                    label="Research hub"
                    className={`inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-[#0F766E] underline decoration-[#0D9488]/40 underline-offset-4 transition-colors hover:text-[#115E59] ${quietFocusRing}`}
                  />
                </dd>
              </div>
            </dl>

            <ul className="mt-5 space-y-3 text-sm leading-relaxed text-slate-600">
              <li className="border-t border-[#EAE4D8] pt-3 break-words">
                This guide compares fit signals and common next-step options. It does not confirm
                personal suitability or promise results.
              </li>
              <li className="border-t border-[#EAE4D8] pt-3 break-words">
                Session timing, stack choice, and budget fit still depend on the product hub,
                protocol page, rental path, or direct support.
              </li>
              <li className="border-t border-[#EAE4D8] pt-3 break-words">
                When you need source depth before acting, open the research hub or contact Hylono
                for a narrower recommendation path.
              </li>
            </ul>
          </aside>
        </div>
      </section>

      {/* SECTION 2: FLOATING PARAMETRIC RIBBON */}
      <section
        className="relative z-20 mx-auto -mt-6 mb-12 max-w-7xl px-4 sm:px-6 sm:-mt-8 lg:px-8"
        aria-label="Stress planning parameters"
      >
        <div className="rounded-[20px] border border-[#E8E1D5] bg-[#FAF8F5]/95 p-5 shadow-xs backdrop-blur-md sm:rounded-[2rem] sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#E8E1D5]">
            {ribbonNodes.map((node) => (
              <div key={node.label} className="flex min-w-0 items-center gap-3.5 lg:px-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] border border-[#DDD5C7] bg-[#F4EFEA] text-[#0F766E]">
                  <node.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span
                    className="block text-2xl font-light leading-none text-slate-950 break-words"
                    style={{ fontFamily: CORAL }}
                  >
                    {node.value}
                  </span>
                  <span className="mt-1 block text-xs font-medium leading-snug text-slate-600 break-words">
                    {node.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-[#E8E1D5] pt-4 text-xs leading-relaxed text-slate-500 break-words">
            Every figure on this ribbon is read from the canonical condition, protocol, and evidence
            records. They are planning inputs, not outcomes and not a suitability check.
          </p>
        </div>
      </section>

      {/* SECTION 3: PRIMARY ARCHITECTURAL GRID */}
      <section
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-technologies-headline"
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className={`${eyebrowClass} text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Technology fit
            </span>
            <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
          </div>
          <h2
            id="stress-technologies-headline"
            className={`${displayClass} mt-3 text-3xl sm:text-4xl`}
            style={{ fontFamily: CORAL }}
          >
            Recommended technologies, ranked by evidence weight
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            Hydrogen leads because the reviewed records behind this goal address fatigue and aerobic
            capacity. The remaining three modalities are planning options with weaker or narrower
            source support, and each card says so in its own words.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {goal.modalities.map((modality, index) => {
            const accent = modalityAccent[modality.slug] ?? modalityAccentFallback;
            return (
              <article
                key={`stress-modality-${modality.slug}`}
                className={`flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs transition-colors duration-300 motion-reduce:transition-none sm:p-8 ${accent.ring}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="select-none text-4xl font-light leading-none sm:text-5xl"
                      style={{ fontFamily: CORAL, color: `${BRONZE}52` }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <RelevanceDots score={modality.relevance} label={modality.shortName} />
                  </div>
                  <p
                    className={`mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${accent.text}`}
                  >
                    <span aria-hidden="true" className={`h-2 w-2 rounded-[9999px] ${accent.dot}`} />
                    {modality.shortName} · {modality.name}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 break-words">
                    {modality.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 break-words">
                    {modality.explanation}
                  </p>
                  <dl className="mt-5 divide-y divide-[#EAE4D8] border-y border-[#EAE4D8]">
                    <div className="flex items-start justify-between gap-4 py-3">
                      <dt className="text-sm font-medium text-slate-500">Session time</dt>
                      <dd className="text-right text-sm font-semibold text-slate-900 break-words">
                        {modality.sessionTime}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4 py-3">
                      <dt className="text-sm font-medium text-slate-500">Rental from</dt>
                      <dd className="text-right text-sm font-semibold text-slate-900 break-words">
                        {modality.rentalFrom}
                      </dd>
                    </div>
                    <div className="flex items-start justify-between gap-4 py-3">
                      <dt className="text-sm font-medium text-slate-500">Purchase from</dt>
                      <dd className="text-right text-sm font-semibold text-slate-900 break-words">
                        {modality.purchaseFrom}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 break-words">
                    Published in PLN, the Hylono transaction currency. “Request / verify” entries need
                    a manual review before any figure is quoted.
                  </p>
                </div>
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href={modalityProductHref[modality.slug]}
                  source="detail_route_map"
                  label="View devices"
                  className={`mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[9999px] bg-[#143D34] px-5 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#0E2C25] ${focusRing}`}
                />
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: DEEP DIVE — PARAMETRIC SPECIFICATION + LIMITS */}
      <section
        className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-protocol-headline"
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className={`${eyebrowClass} text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Protocol parameters
            </span>
            <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
          </div>
          <h2
            id="stress-protocol-headline"
            className={`${displayClass} mt-3 text-3xl sm:text-4xl`}
            style={{ fontFamily: CORAL }}
          >
            Two published protocols, one hydrogen anchor
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            The beginner protocol carries the daily structure; the dual stack is the intermediate
            escalation. Both are read from the canonical protocol registry, including the safety
            notes and oversight the registry records.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {protocolViews.map((view) => {
            const record = protocolBySlug[view.slug];
            return (
              <div
                key={`stress-protocol-${view.slug}`}
                className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8"
              >
                <p
                  className={`${eyebrowClass} text-[11px] text-[#0F766E]`}
                  style={{ fontFamily: MONO_EYEBROW }}
                >
                  {view.goalTag} · {view.difficulty}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950 break-words">
                  {view.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 break-words">
                  {view.description}
                </p>

                <dl className="mt-5 divide-y divide-[#EAE4D8] border-y border-[#EAE4D8]">
                  <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Duration</dt>
                    <dd className="text-sm font-semibold text-slate-900 break-words">
                      {record ? `${record.durationWeeks} weeks` : 'See protocol page'}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Time per day</dt>
                    <dd className="text-sm font-semibold text-slate-900 break-words">
                      {view.timePerDay}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Modalities</dt>
                    <dd className="text-sm font-semibold text-slate-900 break-words">
                      {view.modalities.length > 0 ? view.modalities.join(' + ') : 'Hydrogen'}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Built for</dt>
                    <dd className="text-sm font-semibold leading-relaxed text-slate-900 break-words">
                      {record?.targetAudience ?? 'Routine planning'}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Setup notes</dt>
                    <dd className="text-sm font-semibold leading-relaxed text-slate-900 break-words">
                      {record?.safetyNotes ?? 'Review the manual before use.'}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Oversight</dt>
                    <dd className="text-sm font-semibold leading-relaxed text-slate-900 break-words">
                      {record?.contraindications?.join('; ') ?? 'Specialist oversight where noted.'}
                    </dd>
                  </div>
                  <div className="grid gap-1 py-3 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] sm:gap-4">
                    <dt className="text-sm font-medium text-slate-500">Reviewed by</dt>
                    <dd className="text-sm font-semibold text-slate-900 break-words">
                      {record?.reviewer?.name ?? siteOwnership.research.team}
                    </dd>
                  </div>
                </dl>

                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href={`/protocols/${view.slug}`}
                  source="detail_route_map"
                  label={`Open ${view.title}`}
                  className={`mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition-colors hover:border-[#0D9488]/50 hover:text-[#0F766E] ${quietFocusRing}`}
                />
              </div>
            );
          })}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8">
            <p
              className={`${eyebrowClass} text-[11px] text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Week-by-week structure
            </p>
            <h3
              className={`${displayClass} mt-3 text-2xl sm:text-3xl`}
              style={{ fontFamily: CORAL }}
            >
              What the four weeks actually ask of you
            </h3>
            {leadProtocol ? (
              <ol className="mt-5 space-y-4">
                {leadProtocol.weeks.map((week) => (
                  <li
                    key={`stress-week-${week.number}`}
                    className="flex min-w-0 gap-4 border-t border-[#EAE4D8] pt-4 first:border-t-0 first:pt-0"
                  >
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-3xl font-light leading-none"
                      style={{ fontFamily: CORAL, color: `${BRONZE}59` }}
                    >
                      {String(week.number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-950 break-words">
                        {week.title}
                      </h4>
                      <ul className="mt-2 space-y-2">
                        {week.days.map((day) => (
                          <li
                            key={`stress-week-${week.number}-day-${day.number}`}
                            className="text-sm leading-relaxed text-slate-600 break-words"
                          >
                            <span className="font-semibold text-slate-800">
                              Day {day.number}:{' '}
                            </span>
                            {day.sessions
                              .map(
                                (session) =>
                                  `${session.modality} ${session.duration} — ${session.parameters}`,
                              )
                              .join(' · ')}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </li>
                ))}
              </ol>
            ) : null}
          </div>

          <div className="min-w-0 rounded-[2rem] border border-amber-200/70 bg-amber-50/60 p-6 sm:p-8">
            <p
              className={`${eyebrowClass} text-[11px] text-amber-900`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Limitation upfront
            </p>
            <h3
              className={`${displayClass} mt-3 text-2xl`}
              style={{ fontFamily: CORAL }}
            >
              Verify this before you plan a week around it
            </h3>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-amber-950">
              <li className="break-words">
                <span className="font-semibold">Session length is a fixed input. </span>
                H2 20–30 min, PEMF 20 min, HBOT 45–60 min, red light 10–15 min. Build the day around
                those windows instead of the other way round.
              </li>
              <li className="break-words">
                <span className="font-semibold">Footprint and power vary by device. </span>
                Confirm dimensions, ventilation, and circuit needs on the product hub before a
                room is planned around a unit.
              </li>
              <li className="break-words">
                <span className="font-semibold">Setup effort counts against the goal. </span>
                A routine that adds fifteen minutes of assembly is a different routine, especially
                inside a high-demand week.
              </li>
              <li className="break-words">
                <span className="font-semibold">Support is staffed by people. </span>
                {` ${siteEntity.supportHours}, ${siteEntity.serviceArea}. Write to ${siteEntity.contactEmail} and a human replies before any device is dispatched.`}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 5: RECOMMENDED STACKS */}
      <section
        className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-stacks-headline"
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className={`${eyebrowClass} text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Routine stacks
            </span>
            <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
          </div>
          <h2
            id="stress-stacks-headline"
            className={`${displayClass} mt-3 text-3xl sm:text-4xl`}
            style={{ fontFamily: CORAL }}
          >
            Recommended stacks, least commitment first
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            Three ways to assemble the modalities above, with the published PLN figures quoted
            exactly as recorded. “Request / verify” means a manual review is needed before any
            figure applies.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {goal.stacks.map((stack) => (
              <div key={`stress-stack-${stack.title}`} className="min-w-0">
                <article
                  className={`flex h-full min-w-0 flex-col justify-between rounded-[2rem] border p-6 shadow-xs sm:p-7 ${
                    stack.highlighted
                      ? 'border-[#0D9488]/40 bg-[#F0FAF8]'
                      : 'border-[#E8E2D8] bg-white'
                  }`}
                >
                  <div className="min-w-0">
                    {/* Fixed-height badge slot keeps all three card titles on one baseline. */}
                    <div className="mb-3 flex h-6 items-center">
                      {stack.highlighted ? (
                        <span className="inline-block rounded-[9999px] border border-[#0D9488]/30 bg-white px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
                          Suggested routine
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-semibold tracking-tight text-slate-950 break-words">
                      {stack.title}
                    </h3>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 break-words">
                      Devices: <span className="text-slate-800">{stack.devices.join(' + ')}</span>
                    </p>
                    <dl className="mt-4 space-y-2 border-t border-[#EAE4D8] pt-4 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500">Rental</dt>
                        <dd className="text-right font-semibold text-slate-900 break-words">
                          {stack.rentalPrice}
                        </dd>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <dt className="text-slate-500">Purchase</dt>
                        <dd className="text-right font-semibold text-slate-900 break-words">
                          {stack.purchasePrice}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="supporting"
                    href={stack.link}
                    source="detail_route_map"
                    label={stack.linkLabel}
                    className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition-colors hover:border-[#0D9488]/50 hover:text-[#0F766E] ${quietFocusRing}`}
                  />
                </article>
              </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: EVIDENCE MATRIX + LIMITS OF GENERALIZATION */}
      <section
        className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-research-headline"
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className={`${eyebrowClass} text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Research context
            </span>
            <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
          </div>
          <h2
            id="stress-research-headline"
            className={`${displayClass} mt-3 text-3xl sm:text-4xl`}
            style={{ fontFamily: CORAL }}
          >
            What the research says
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            Sorted by newest publication year, then available sample size. Use these cards to compare
            context, not as a personal suitability score.
          </p>
        </div>

        <div className="mt-8">
          <div className="flex flex-col gap-4 rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <p
                className={`${eyebrowClass} text-[11px] text-[#0F766E]`}
                style={{ fontFamily: MONO_EYEBROW }}
              >
                Study quality checklist
              </p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950 break-words">
                Check study quality before applying the evidence
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 break-words">
                Three static questions to read the cards below with. This is not an interactive
                study-quality filter, severity assessment, budget calculator, numeric evidence
                score, or personalized recommendation.
              </p>
            </div>
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="supporting"
              href="/research"
              source="detail_quality_checklist"
              label="Open research methods"
              className={`inline-flex min-h-11 shrink-0 items-center justify-center rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0D9488]/50 hover:text-[#0F766E] ${quietFocusRing}`}
            />
          </div>

          <dl className="mt-6 grid gap-4 md:grid-cols-3">
            {studyQualityChecklist.map((item) => (
              <div
                key={`stress-quality-${item.title}`}
                className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-white p-5 shadow-xs"
              >
                <dt className="text-sm font-semibold text-slate-950 break-words">{item.title}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-slate-600 break-words">
                  {item.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {evidenceRecords.map((record) => (
            <article
              key={`stress-evidence-${record.id}`}
              className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-[9999px] border border-[#E8E2D8] bg-[#FAF8F5] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 break-words">
                    Evidence type: {record.studyType}
                  </span>
                  {record.sampleSize ? (
                    <span className="rounded-[9999px] border border-[#E8E2D8] bg-[#FAF8F5] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-600 break-words">
                      Sample size: {record.sampleSize}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-4 text-base font-semibold leading-snug tracking-tight text-slate-950 break-words">
                  {record.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-slate-500 break-words">
                  {record.authors}
                </p>
                <p className="mt-1 text-xs font-medium text-slate-500 break-words">
                  {record.publication} - {record.year}
                </p>
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600 break-words">
                  {record.resultSummary}
                </p>
                <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/60 p-4 text-xs leading-relaxed text-amber-900 break-words">
                  <span className="font-bold">Limits of generalization: </span>
                  {evidenceLimits[record.id] ??
                    'Population-specific record. Read it as context, not as a personal outcome promise.'}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href="/research"
                  source="detail_quality_checklist"
                  label="Open research hub"
                  className={`inline-flex min-h-11 items-center justify-center rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0D9488]/50 hover:text-[#0F766E] ${quietFocusRing}`}
                />
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex min-h-11 items-center justify-center rounded-[9999px] px-4 py-2.5 text-sm font-semibold text-[#0F766E] underline decoration-[#0D9488]/40 underline-offset-4 hover:underline ${quietFocusRing}`}
                >
                  Source record
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="max-w-3xl text-xs leading-relaxed text-slate-500 break-words">
            {CITATION_DISCLAIMER}
          </p>
          <ConditionTransitionLink
            condition={goal.slug}
            ctaRole="supporting"
            href="/research"
            source="detail_route_map"
            label="More research"
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] bg-[#143D34] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0E2C25] ${focusRing}`}
          />
        </div>
      </section>

      {/* SECTION 7: DECISION FORKS + FAQ */}
      <section
        className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-forks-headline"
      >
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <span
                className={`${eyebrowClass} text-[#0F766E]`}
                style={{ fontFamily: MONO_EYEBROW }}
              >
                Decision forks
              </span>
              <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
            </div>
            <h2
              id="stress-forks-headline"
              className={`${displayClass} mt-3 text-3xl sm:text-4xl`}
              style={{ fontFamily: CORAL }}
            >
              Three honest ways to leave this page
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base break-words">
              A static routing aid for stress planning. It is not a severity assessment, a budget
              calculator, a personalized recommendation, or a professional care plan.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {decisionForks.map((fork) => (
                <div
                  key={`stress-fork-${fork.title}`}
                  className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#E8E2D8] bg-white p-5 shadow-xs"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-950 break-words">
                      {fork.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600 break-words">
                      {fork.body}
                    </p>
                  </div>
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole={fork.ctaRole}
                    href={fork.href}
                    source="detail_decision_fork"
                    label={fork.label}
                    className={`mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-[9999px] border border-[#0D9488]/35 bg-[#F0FAF8] px-4 py-2.5 text-sm font-semibold text-[#0F766E] transition-colors hover:border-[#0D9488]/60 ${quietFocusRing}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8">
            <p
              className={`${eyebrowClass} text-[11px] text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Straight answers
            </p>
            <h3
              className={`${displayClass} mt-3 text-2xl`}
              style={{ fontFamily: CORAL }}
            >
              Frequently asked questions
            </h3>
            <div className="mt-5 space-y-3">
              {goal.faq.map((faq) => (
                <details
                  key={`stress-faq-${faq.q}`}
                  className="min-w-0 rounded-2xl border border-[#E8E2D8] bg-white p-4"
                >
                  <summary className="min-h-11 cursor-pointer list-none text-sm font-semibold leading-relaxed text-slate-900 break-words hover:text-[#0F766E]">
                    {faq.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 break-words">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 8: SECONDARY PATHWAY DOCK */}
      <section
        className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-dock-headline"
      >
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className={`${eyebrowClass} text-[#0F766E]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Topical pathway
            </span>
            <span className="hidden h-px w-8 shrink-0 bg-[#C8BFB0] sm:block" aria-hidden="true" />
          </div>
          <h2
            id="stress-dock-headline"
            className={`${displayClass} mt-3 text-3xl sm:text-4xl`}
            style={{ fontFamily: CORAL }}
          >
            Condition → Research → Product → Protocol → Rental
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            Every link below keeps you inside the same graph, so the next step stays one hop away
            instead of a dead end.
          </p>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dockLinks.map((link) => (
            <li key={`stress-dock-${link.href}`} className="min-w-0">
              <ConditionTransitionLink
                condition={goal.slug}
                ctaRole="supporting"
                href={link.href}
                source="detail_route_map"
                label={`${link.label} — ${link.note}`}
                className={`flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-[2rem] border border-[#E8E1D5] bg-[#FAF8F5] px-5 py-4 text-left text-sm font-semibold text-slate-800 transition-colors hover:border-[#C4B7A0] hover:bg-white ${quietFocusRing}`}
              />
            </li>
          ))}
        </ul>
      </section>

      {/* SECTION 9: LOWER FALLBACK NEXT-STEP BLOCK */}
      <section
        className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-next-step-headline"
      >
        <div className="rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8">
          <h2
            id="stress-next-step-headline"
            className={`${displayClass} text-2xl sm:text-3xl`}
            style={{ fontFamily: CORAL }}
          >
            Choose the next step that fits your goal
          </h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 break-words">
            Use the main action for stress, or review the related protocol and support options before
            you decide.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="primary"
              href={primaryAction.href}
              label={primaryAction.label}
              className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] bg-[#143D34] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#0E2C25] ${focusRing}`}
            />
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="supporting"
              href={supportingProtocol?.href ?? '/research'}
              label={supportingProtocol ? `Review ${supportingProtocol.label}` : 'Browse research'}
              className={`inline-flex min-h-11 items-center justify-center rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0D9488]/50 hover:text-[#0F766E] ${quietFocusRing}`}
            />
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="fallback"
              href={fallbackAction.href}
              label={fallbackAction.label}
              className={`inline-flex min-h-11 items-center justify-center rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-3.5 text-sm font-semibold text-slate-800 transition-colors hover:border-[#0D9488]/50 hover:text-[#0F766E] ${quietFocusRing}`}
            />
          </div>
        </div>
      </section>

      {/* SECTION 10: PRE-FOOTER SANCTUARY BANNER */}
      <section
        className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8"
        aria-labelledby="stress-cta-headline"
      >
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#143D34] to-[#0A201B] p-8 text-white shadow-lg sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_20rem_at_80%_10%,rgba(13,148,136,0.30),transparent_65%)]"
          />
          <div className="relative max-w-2xl">
            <p
              className={`${eyebrowClass} text-[#5EEAD4]`}
              style={{ fontFamily: MONO_EYEBROW }}
            >
              Workload recovery review
            </p>
            <h2
              id="stress-cta-headline"
              className="mt-3 text-2xl font-normal leading-tight tracking-tight break-words text-white sm:text-3xl lg:text-4xl"
              style={{ fontFamily: CORAL }}
            >
              Bring the week, not the device.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base break-words">
              Describe the demand pattern, the current routine, and the room you have. A reviewer
              narrows the hydrogen-first path and confirms whether rental or direct support fits
              better.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ConditionTransitionLink
                condition={goal.slug}
                ctaRole="primary"
                href="/contact"
                source="detail_next_step"
                label="Talk to Hylono"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] bg-white px-8 py-4 text-sm font-semibold text-slate-950 shadow-md transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              />
              <ConditionTransitionLink
                condition={goal.slug}
                ctaRole="fallback"
                href="/rental"
                source="detail_next_step"
                label="Explore rentals"
                className="inline-flex min-h-11 items-center justify-center rounded-[9999px] border border-white/25 bg-white/[0.06] px-8 py-4 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <p className="rounded-[2rem] border border-[#E8E2D8] bg-white px-5 py-4 text-xs leading-relaxed text-slate-500 break-words">
            {disclaimers.general}
          </p>
          <p className="rounded-[2rem] border border-[#E8E2D8] bg-white px-5 py-4 text-xs leading-relaxed text-slate-500 break-words">
            {disclaimers.research}
          </p>
        </div>
      </section>
    </div>
  );
}
