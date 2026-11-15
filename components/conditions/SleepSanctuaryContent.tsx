import Image from 'next/image';
import { CalendarCheck, Droplets, Lightbulb, MoonStar, Sunrise } from 'lucide-react';
import type { ConditionGoalPage } from '@/content/conditions';
import { conditionGoalBySlug } from '@/content/conditions';
import { disclaimers, CITATION_DISCLAIMER } from '@/content/disclaimers';
import { evidenceById } from '@/content/evidence';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { PageOwnership } from '@/components/content/PageOwnership';
import {
  ConditionReturnLink,
  ConditionRouteActionStatus,
  ConditionTransitionLink,
} from '@/components/ConditionTransitionLink';

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
  PEMF: { dot: 'bg-[#A855F7]', text: 'text-[#7E22CE]', ring: 'hover:border-[#A855F7]/50' },
  RLT: { dot: 'bg-[#D97706]', text: 'text-[#92400E]', ring: 'hover:border-[#D97706]/50' },
  H2: { dot: 'bg-[#0D9488]', text: 'text-[#0F766E]', ring: 'hover:border-[#0D9488]/50' },
  HBOT: { dot: 'bg-[#0891B2]', text: 'text-[#0E7490]', ring: 'hover:border-[#0891B2]/50' },
};

const displayReviewDate = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
}).format(new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`));

function RelevanceDots({ score, label }: { score: number; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-slate-500"
      role="img"
      aria-label={`${label}: relevance ${score} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`sleep-dot-${label}-${index}`}
          aria-hidden="true"
          className={`h-2 w-2 rounded-[9999px] ${index < score ? 'bg-[#A855F7]' : 'bg-slate-200'}`}
        />
      ))}
      <span className="ml-1 font-semibold text-slate-600">{score}/5</span>
    </span>
  );
}

export function SleepSanctuaryContent({ slug }: { slug: ConditionGoalPage['slug'] }) {
  const goal = conditionGoalBySlug[slug];

  if (!goal || goal.slug !== 'sleep') {
    return null;
  }

  const evidenceRecords = goal.evidenceIds
    .map((evidenceId) => evidenceById[evidenceId])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const sampleSizeDelta = (b.sampleSize ?? -1) - (a.sampleSize ?? -1);
      if (sampleSizeDelta !== 0) return sampleSizeDelta;
      return a.title.localeCompare(b.title);
    });

  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-16 text-slate-950">
      <ConditionRouteActionStatus />

      {/* SECTION 1: ASYMMETRICAL EDITORIAL HERO */}
      <section
        className="relative overflow-hidden pt-10 pb-12 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20"
        aria-labelledby="sleep-hero-headline"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(52rem_30rem_at_85%_-10%,rgba(168,85,247,0.10),transparent_65%)]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ConditionReturnLink
            condition={goal.slug}
            className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A855F7] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAF8F5]"
          />
          <div className="mt-6 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <header id="condition-intro" className="min-w-0 lg:col-span-7">
              <div className="flex items-center gap-3">
                <span
                  className="text-xs font-bold uppercase tracking-[0.25em] text-[#6D28D9]"
                  style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
                >
                  Evening wind-down — Sleep support guide
                </span>
                <span className="h-px w-8 bg-[#C8BFB0]" aria-hidden="true" />
              </div>
              <h1
                id="sleep-hero-headline"
                className="mt-4 max-w-2xl text-4xl font-normal leading-[1.1] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.6rem] break-words"
                style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
              >
                Plan a quieter evening routine that supports{' '}
                <span className="italic text-[#6D28D9]">calmer wind-down.</span>
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg break-words">
                {goal.subtitle}
              </p>
              <div className="mt-5 max-w-2xl space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
                {goal.description.map((paragraph) => (
                  <p key={`sleep-hero-${paragraph.slice(0, 24)}`} className="break-words">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="primary"
                  href="/contact"
                  source="detail_intro"
                  label="Request assessment"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] bg-[#143D34] px-7 py-3.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#0E2C25] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7]/40"
                />
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="fallback"
                  href="/rental"
                  source="detail_intro"
                  label="Explore rentals"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[9999px] border border-[#DDD6C8] bg-white/85 px-6 py-3.5 text-sm font-semibold text-slate-800 shadow-xs backdrop-blur-xs transition-all hover:border-[#C4B7A0] hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7]/30"
                />
              </div>
              <p className="mt-4 max-w-xl text-xs leading-relaxed text-slate-500 break-words">
                One clear next step: request an assessment and a reviewer helps narrow the evening
                routine before any device choice. Rental stays available as the lower-commitment
                path.
              </p>
            </header>
            <div className="min-w-0 lg:col-span-5">
              <figure className="relative overflow-hidden rounded-[2rem] border-2 border-white/85 shadow-[0_20px_50px_rgba(20,61,52,0.12)]">
                <Image
                  src="/images/conditions/goal-sleep-sanctuary.jpg"
                  alt="Restorative minimalist bedroom overlooking tranquil lake dawn"
                  width={1200}
                  height={900}
                  priority
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#141716]/25 via-transparent to-transparent"
                />
                <figcaption className="absolute bottom-3 left-3 rounded-[9999px] border border-white/60 bg-[#141716]/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                  Low-stimulation evening setting
                </figcaption>
              </figure>
            </div>
          </div>

          <div className="mt-10 min-w-0">
            <PageOwnership
              title="Guide review context"
              description="This sleep page compares evening routine options, shows the current evidence posture with stated limits, and moves visitors into stronger product, protocol, research, rental, or contact paths."
              items={[
                {
                  label: siteOwnership.editorial.label,
                  value: siteOwnership.editorial.team,
                  detail: 'Owns page clarity, next-step fit, and visible trust signals on this guide.',
                },
                {
                  label: siteOwnership.research.label,
                  value: siteOwnership.research.team,
                  detail: 'Reviews cited-study alignment and keeps evening-routine wording conservative.',
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
        </div>
      </section>

      {/* SECTION 2: FLOATING SESSION-TIME RIBBON */}
      <section className="relative z-20 mx-auto -mt-2 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Session-time facts">
        <div className="rounded-[20px] border border-[#E8E1D5] bg-[#FAF8F5]/95 p-5 shadow-xs backdrop-blur-md sm:rounded-[2rem] sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0 lg:divide-x lg:divide-[#E8E1D5]">
            {[
              {
                icon: MoonStar,
                value: '20–30 min',
                label: 'PEMF · quiet evening path',
              },
              {
                icon: Lightbulb,
                value: '10–15 min',
                label: 'Red light · controlled cue only',
              },
              {
                icon: Droplets,
                value: '20 min',
                label: 'Hydrogen · when load is high',
              },
              {
                icon: Sunrise,
                value: '45–60 min',
                label: 'Oxygen · earlier-day context',
              },
            ].map((node) => (
              <div key={node.label} className="flex min-w-0 items-center gap-3.5 lg:px-5">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9999px] border border-[#DDD5C7] bg-[#F4EFEA] text-[#6D28D9]">
                  <node.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <span
                    className="block text-2xl font-light leading-none text-slate-950"
                    style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
                  >
                    {node.value}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-slate-600 break-words">
                    {node.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-[#E8E1D5] pt-4 text-xs leading-relaxed text-slate-500 break-words">
            Session lengths come from the modality rows in this guide. They describe routine
            planning inputs, not outcomes or suitability.
          </p>
        </div>
      </section>

      {/* SECTION 3: PRIMARY ARCHITECTURAL GRID */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="sleep-modalities-headline">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-bold uppercase tracking-[0.25em] text-[#6D28D9]"
              style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
            >
              Technology fit · evening order
            </span>
            <span className="h-px w-8 bg-[#C8BFB0]" aria-hidden="true" />
          </div>
          <h2
            id="sleep-modalities-headline"
            className="mt-3 text-3xl font-normal tracking-tight text-slate-950 sm:text-4xl break-words"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
          >
            Evening order: PEMF first, oxygen earlier in the day.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            Compare the four modalities attached to sleep planning before moving to product,
            protocol, or rental next steps. Order follows evening suitability, highest relevance
            first.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {goal.modalities.map((modality, index) => {
            const accent = modalityAccent[modality.slug] ?? modalityAccentFallback;
            return (
              <article
                key={`sleep-modality-${modality.slug}`}
                className={`flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs transition-all duration-300 sm:p-8 ${accent.ring}`}
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="select-none text-4xl font-light leading-none text-[#6D28D9]/25 sm:text-5xl"
                      style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <RelevanceDots score={modality.relevance} label={modality.shortName} />
                  </div>
                  <p className={`mt-4 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] ${accent.text}`}>
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
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-sm font-medium text-slate-500">Session time</dt>
                      <dd className="text-right text-sm font-semibold text-slate-900 break-words">
                        {modality.sessionTime}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-sm font-medium text-slate-500">Rental from</dt>
                      <dd className="text-right text-sm font-semibold text-slate-900 break-words">
                        {modality.rentalFrom}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-4 py-3">
                      <dt className="text-sm font-medium text-slate-500">Purchase from</dt>
                      <dd className="text-right text-sm font-semibold text-slate-900 break-words">
                        {modality.purchaseFrom}
                      </dd>
                    </div>
                  </dl>
                  <p className="mt-3 text-xs leading-relaxed text-slate-500 break-words">
                    Figures are published in PLN, the Hylono transaction currency. Entries marked
                    “Request / verify” need a manual review before any figure is quoted.
                  </p>
                </div>
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href={modalityProductHref[modality.slug]}
                  source="detail_route_map"
                  label={`Review ${modality.shortName} hub`}
                  className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[9999px] bg-[#143D34] px-5 py-3 text-center text-sm font-semibold text-white transition-all hover:bg-[#0E2C25] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7]/40"
                />
              </article>
            );
          })}
        </div>
      </section>

      {/* SECTION 4: TECHNICAL PARAMETERS + LIMITATION UPFRONT */}
      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="sleep-parameters-headline">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <div className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8">
            <p
              className="text-xs font-bold uppercase tracking-[0.25em] text-[#6D28D9]"
              style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
            >
              Evening parameters
            </p>
            <h2
              id="sleep-parameters-headline"
              className="mt-3 text-2xl font-normal tracking-tight text-slate-950 sm:text-3xl break-words"
              style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
            >
              Keep the evening low-stimulation by rule, not by feeling.
            </h2>
            <dl className="mt-6 divide-y divide-[#EAE4D8] border-y border-[#EAE4D8]">
              <div className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">Timing window</dt>
                <dd className="text-sm font-semibold leading-relaxed text-slate-900 break-words">
                  Repeatable evening window; avoid adding a modality so late that setup disrupts the
                  wind-down routine.
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">Stimulation discipline</dt>
                <dd className="text-sm font-semibold leading-relaxed text-slate-900 break-words">
                  Short, quiet PEMF first. Add nothing that raises alertness, noise, or handling
                  effort before rest.
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">Light and brightness control</dt>
                <dd className="text-sm font-semibold leading-relaxed text-slate-900 break-words">
                  Red light only as a controlled low-light cue when brightness, timing, and room
                  setup stay non-stimulating.
                </dd>
              </div>
              <div className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] sm:gap-4">
                <dt className="text-sm font-medium text-slate-500">Combination rule</dt>
                <dd className="text-sm font-semibold leading-relaxed text-slate-900 break-words">
                  Earlier-day oxygen or recovery work stays separate from the evening. Evening
                  sessions stay low-stimulation; review protocol limits before combining goals.
                </dd>
              </div>
            </dl>
          </div>

          <div className="min-w-0">
            <div className="rounded-[2rem] border border-amber-200/70 bg-amber-50/60 p-6 sm:p-8">
              <p
                className="text-xs font-bold uppercase tracking-[0.22em] text-amber-900"
                style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
              >
                Limitation upfront
              </p>
              <h3
                className="mt-3 text-2xl font-normal tracking-tight text-slate-950 break-words"
                style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
              >
                What to verify before planning placement.
              </h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-amber-950">
                <li className="break-words">
                  <span className="font-semibold">Session length is fixed input. </span>
                  PEMF 20–30 min, red light 10–15 min, hydrogen 20 min, oxygen 45–60 min — plan
                  the evening around these windows.
                </li>
                <li className="break-words">
                  <span className="font-semibold">Footprint, power, and clearance vary by device. </span>
                  Verify dimensions and power needs on the linked product hub and at manual
                  review before arranging the room.
                </li>
                <li className="break-words">
                  <span className="font-semibold">Setup effort counts as stimulation. </span>
                  If assembly, noise, or bright controls would disturb the wind-down, move that
                  modality earlier or leave it out.
                </li>
                <li className="break-words">
                  <span className="font-semibold">Staffing and support are human. </span>
                  {` ${siteEntity.supportHours}, ${siteEntity.serviceArea}. `}
                  Manual intake review is required before chamber dispatch to verify floor load
                  and power circuit safety.
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-[2rem] border border-[#E8E2D8] bg-white p-6 sm:p-8">
              <p
                className="text-xs font-bold uppercase tracking-[0.22em] text-[#6D28D9]"
                style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
              >
                Three-step evening order
              </p>
              <ol className="mt-4 space-y-4">
                {[
                  {
                    n: '01',
                    title: 'Dim the room, start quiet PEMF',
                    body: 'Lower light and noise first, then run the short quiet PEMF session as the anchor of the wind-down.',
                  },
                  {
                    n: '02',
                    title: 'Add hydrogen only when load is part of the question',
                    body: 'When stress load is part of the sleep question, place the 20-minute hydrogen session before the final wind-down, not after lights-out preparation.',
                  },
                  {
                    n: '03',
                    title: 'Controlled light cue only if non-stimulating',
                    body: 'Use the 10–15 minute red-light cue only when brightness, timing, and room setup add no stimulation.',
                  },
                ].map((step) => (
                  <li key={step.n} className="flex min-w-0 gap-4 border-t border-[#EAE4D8] pt-4 first:border-t-0 first:pt-0">
                    <span
                      aria-hidden="true"
                      className="shrink-0 text-3xl font-light leading-none text-[#6D28D9]/30"
                      style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
                    >
                      {step.n}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-950 break-words">{step.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-slate-600 break-words">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: STACKS */}
      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="sleep-stacks-headline">
        <div className="max-w-3xl">
          <p
            className="text-xs font-bold uppercase tracking-[0.25em] text-[#6D28D9]"
            style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
          >
            Routine stacks
          </p>
          <h2
            id="sleep-stacks-headline"
            className="mt-3 text-3xl font-normal tracking-tight text-slate-950 sm:text-4xl break-words"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
          >
            Start with the least disruptive path.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            Stacks combine the modalities above into repeatable evening routines. Figures below are
            quoted exactly as published; “Request / verify” means a manual review is needed before
            any figure applies.
          </p>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {goal.stacks.map((stack) => (
            <article
              key={`sleep-stack-${stack.title}`}
              className={`flex min-w-0 flex-col justify-between rounded-[2rem] border p-6 sm:p-7 ${
                stack.highlighted
                  ? 'border-[#A855F7]/40 bg-[#FAF5FF] shadow-xs'
                  : 'border-[#E8E2D8] bg-white shadow-xs'
              }`}
            >
              <div className="min-w-0">
                {stack.highlighted ? (
                  <span className="mb-3 inline-block rounded-md border border-[#A855F7]/30 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6D28D9]">
                    Suggested routine
                  </span>
                ) : null}
                <h3 className="text-lg font-semibold tracking-tight text-slate-950 break-words">
                  {stack.title}
                </h3>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Devices: <span className="text-slate-800">{stack.devices.join(' + ')}</span>
                </p>
                <dl className="mt-4 space-y-2 border-t border-[#EAE4D8] pt-4 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">Rental</dt>
                    <dd className="text-right font-semibold text-slate-900 break-words">{stack.rentalPrice}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-slate-500">Purchase</dt>
                    <dd className="text-right font-semibold text-slate-900 break-words">{stack.purchasePrice}</dd>
                  </div>
                </dl>
              </div>
              <ConditionTransitionLink
                condition={goal.slug}
                ctaRole="supporting"
                href={stack.link}
                source="detail_route_map"
                label={stack.linkLabel}
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-3 text-center text-sm font-semibold text-slate-800 transition-all hover:border-[#A855F7]/40 hover:text-[#5B21B6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7]/30"
              />
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 6: EVIDENCE + GRAPH DOCK + FAQ */}
      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="sleep-evidence-headline">
        <div className="max-w-3xl">
          <p
            className="text-xs font-bold uppercase tracking-[0.25em] text-[#6D28D9]"
            style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
          >
            Research context
          </p>
          <h2
            id="sleep-evidence-headline"
            className="mt-3 text-3xl font-normal tracking-tight text-slate-950 sm:text-4xl break-words"
            style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
          >
            Cited records are population-specific.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base break-words">
            Use these cards for routine planning and rental fit, not as general sleep-outcome
            proof. Each record states its population limit directly.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {evidenceRecords.map((record) => (
            <article
              key={`sleep-evidence-${record.id}`}
              className="flex min-w-0 flex-col justify-between rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8"
            >
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500">
                  {record.studyType} · {record.year}
                </p>
                <h3 className="mt-2 text-base font-semibold leading-snug tracking-tight text-slate-950 break-words">
                  {record.title}
                </h3>
                <p className="mt-2 text-xs font-medium text-slate-500 break-words">
                  {record.authors} — {record.publication}
                </p>
                <p className="mt-4 border-t border-slate-100 pt-4 text-sm leading-relaxed text-slate-600 break-words">
                  {record.resultSummary}
                </p>
                <div className="mt-4 rounded-xl border border-amber-200/60 bg-amber-50/60 p-4 text-xs leading-relaxed text-amber-900">
                  <span className="font-bold">Limits of generalization: </span>
                  {record.id === 'ev-hbot-003'
                    ? 'Chronic post-mTBI population only — not general sleep-outcome proof. Review as earlier-day context.'
                    : 'Chronic post-cancer-care population only — not directly representative of general wellness use.'}
                </div>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href="/research"
                  source="detail_quality_checklist"
                  label="Open research hub"
                  className="inline-flex min-h-11 items-center justify-center rounded-[9999px] border border-[#DDD6C8] bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition-all hover:border-[#A855F7]/40 hover:text-[#5B21B6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7]/30"
                />
                <a
                  href={record.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-[9999px] px-4 py-2.5 text-sm font-semibold text-[#6D28D9] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7]/30"
                >
                  Source record
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-500 break-words">{CITATION_DISCLAIMER}</p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-white p-6 shadow-xs sm:p-8">
            <p
              className="text-xs font-bold uppercase tracking-[0.22em] text-[#6D28D9]"
              style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
            >
              Evening questions, answered early
            </p>
            <h3
              className="mt-3 text-2xl font-normal tracking-tight text-slate-950 break-words"
              style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
            >
              Frequently asked questions
            </h3>
            <div className="mt-5 space-y-3">
              {goal.faq.map((faq) => (
                <details
                  key={`sleep-faq-${faq.q}`}
                  className="min-w-0 rounded-2xl border border-[#E8E2D8] bg-[#FAF8F5] p-4"
                >
                  <summary className="cursor-pointer list-none text-sm font-semibold leading-relaxed text-slate-900 break-words hover:text-[#5B21B6]">
                    {faq.q}
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 break-words">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-[2rem] border border-[#E8E2D8] bg-[#FAF8F5] p-6 sm:p-8">
            <p
              className="text-xs font-bold uppercase tracking-[0.22em] text-[#6D28D9]"
              style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
            >
              Continue the journey
            </p>
            <h3
              className="mt-3 text-2xl font-normal tracking-tight text-slate-950 break-words"
              style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
            >
              Condition → Research → Product → Protocol → Rental
            </h3>
            <ul className="mt-5 space-y-3">
              {[
                { href: '/product/pemf', label: 'PEMF hub', note: 'Quiet evening starting point' },
                { href: '/product/hydrogen', label: 'Hydrogen hub', note: 'High-load evenings' },
                {
                  href: '/protocols/stress-balance-h2-foundation',
                  label: 'Stress-balance protocol',
                  note: 'Daily hydrogen rhythm reference',
                },
                { href: '/research', label: 'Research hub', note: 'Read the cited records in full' },
                { href: '/rental', label: 'Rental options', note: 'Lower-commitment routine check' },
                { href: '/contact', label: 'Contact Hylono', note: 'Human narrowing before devices' },
              ].map((link) => (
                <li key={link.href} className="min-w-0">
                  <ConditionTransitionLink
                    condition={goal.slug}
                    ctaRole="supporting"
                    href={link.href}
                    source="detail_route_map"
                    label={`${link.label} — ${link.note}`}
                    className="flex min-h-11 min-w-0 items-center justify-between gap-3 rounded-2xl border border-[#E8E1D5] bg-white px-4 py-3 text-sm font-semibold text-slate-800 transition-all hover:border-[#C4B7A0] hover:text-[#5B21B6] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#A855F7]/30"
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* SECTION 7: PRE-FOOTER SANCTUARY BANNER */}
      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8" aria-labelledby="sleep-cta-headline">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#143D34] to-[#0A201B] p-8 text-white shadow-lg sm:p-12 lg:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(36rem_20rem_at_80%_10%,rgba(168,85,247,0.22),transparent_65%)]"
          />
          <div className="relative max-w-2xl">
            <p
              className="text-xs font-bold uppercase tracking-[0.25em] text-[#C4B5FD]"
              style={{ fontFamily: 'var(--font-syncopate), "Syncopate", sans-serif' }}
            >
              Evening routine review
            </p>
            <h2
              id="sleep-cta-headline"
              className="mt-3 text-2xl font-normal leading-tight tracking-tight sm:text-3xl lg:text-4xl break-words"
              style={{ fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif' }}
            >
              Bring your evenings to an assessment, leave with a plan.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300 sm:text-base break-words">
              Describe the wind-down goal and current routine. A reviewer helps narrow the
              low-stimulation path and confirms whether rental or direct support fits better.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <ConditionTransitionLink
                condition={goal.slug}
                ctaRole="primary"
                href="/contact"
                source="detail_next_step"
                label="Request assessment"
                className="inline-flex min-h-11 items-center justify-center rounded-[9999px] bg-white px-8 py-4 text-sm font-semibold text-slate-950 shadow-md transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              />
              <ConditionTransitionLink
                condition={goal.slug}
                ctaRole="fallback"
                href="/rental"
                source="detail_next_step"
                label="Explore rentals"
                className="inline-flex min-h-11 items-center justify-center rounded-[9999px] border border-white/25 bg-white/[0.06] px-8 py-4 text-sm font-semibold text-white transition-all hover:bg-white/[0.12] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30"
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

export function SleepSanctuaryCta() {
  return (
    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
      <CalendarCheck className="h-4 w-4" aria-hidden="true" />
      <span>Assessment-led planning · no checkout pressure on this guide.</span>
    </div>
  );
}
