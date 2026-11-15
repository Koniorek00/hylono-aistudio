import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { createPageMetadata } from '@/lib/seo-metadata';
import {
  ORGANIZATION_ID,
  createBreadcrumbSchema,
  createMedicalWebPageSchema,
  SCHEMA_DATE_MODIFIED,
} from '@/lib/seo-schema';
import { env } from '@/lib/env';

const SITE_URL = env.NEXT_PUBLIC_SITE_URL;
import { TECH_DETAILS } from '@/constants';
import { protocolBySlug, protocols, type Protocol } from '@/content/protocols';
import { evidence } from '@/content/evidence';
import { LEGACY_PRODUCT_ROUTE_REDIRECTS, getTechTypeFromRouteSlug } from '@/lib/product-routes';
import { StaticStructuredData } from '@/src/components/StaticStructuredData';
import { ProtocolsRouteActionStatus, ProtocolsTrackedLink } from '../ProtocolsTrackedLink';
import { ProtocolDetailClient } from './ProtocolDetailClient';

const getRouteSlugForProductId = (productId: string): string =>
  LEGACY_PRODUCT_ROUTE_REDIRECTS[
    productId as keyof typeof LEGACY_PRODUCT_ROUTE_REDIRECTS
  ] ?? productId;

const getProtocolProductName = (productId: string): string => {
  const routeSlug = getRouteSlugForProductId(productId);
  const techType = getTechTypeFromRouteSlug(routeSlug);

  return techType ? `Hylono ${TECH_DETAILS[techType].name}` : productId;
};

const getProtocolProductLinks = (protocol: Protocol) =>
  protocol.requiredDevices.map((device) => {
    const routeSlug = getRouteSlugForProductId(device.productId);
    return {
      href: `/product/${routeSlug}`,
      label: getProtocolProductName(device.productId),
    };
  });

const goalToConditionRoute = (goalTag: string): string => {
  const value = goalTag.toLowerCase();
  if (value.includes('recovery')) return '/conditions/recovery';
  if (value.includes('sleep')) return '/conditions/sleep';
  if (value.includes('stress')) return '/conditions/stress';
  if (value.includes('comfort')) return '/conditions/comfort';
  return '/conditions/vitality';
};

const formatDeviceBurden = (deviceCount: number): string =>
  deviceCount === 1 ? '1 required device' : `${deviceCount} required devices`;

const getProtocolModalities = (protocol: Protocol): string[] =>
  Array.from(
    new Set(
      protocol.weeks.flatMap((week) =>
        week.days.flatMap((day) => day.sessions.map((session) => session.modality))
      )
    )
  );

const resolveProtocolSlug = (rawSlug: string) => {
  const canonicalSlug = rawSlug.toLowerCase();
  if (rawSlug !== canonicalSlug && protocolBySlug[canonicalSlug]) {
    permanentRedirect(`/protocols/${canonicalSlug}`);
  }

  return canonicalSlug;
};

type ProtocolStackDecisionFrame = {
  evidenceCtaLabel: string;
  productCtaLabelPrefix: string;
  summary: string;
  title: string;
  criteria: string[];
};

const protocolFollowUpItems = [
  {
    label: 'Week check-in',
    value: 'Write down the week number, completed sessions, and any skipped days before adjusting the routine.',
  },
  {
    label: 'Tolerance note',
    value: 'Capture comfort, timing, and device setup friction as plain notes rather than automated scoring.',
  },
  {
    label: 'Continue or pause',
    value: 'Use contraindications, tolerance, and professional guidance to decide whether to continue, pause, or ask for help.',
  },
  {
    label: 'Support handoff',
    value: 'Bring the protocol title, device list, and notes into rental or advisor review when setup is uncertain.',
  },
];

const protocolSharePreparationItems = [
  {
    label: 'Copy protocol context',
    value:
      'Keep the protocol title, goal, duration, device list, fit boundary, and evidence count before leaving the page.',
  },
  {
    label: 'Save notes outside Hylono',
    value:
      'Use your own notes if you need to resume later; this route does not create account-backed progress or a saved passport.',
  },
  {
    label: 'Send context manually',
    value:
      'Paste protocol notes into contact or rental review when setup, tolerance, or scheduling needs human review.',
  },
];

const PROTOCOL_STACK_DECISION_FRAMES: Record<string, ProtocolStackDecisionFrame> = {
  'recovery-oxygen-foundation': {
    evidenceCtaLabel: 'Review recovery evidence',
    productCtaLabelPrefix: 'Review',
    title: 'Recovery stack fit decision frame',
    summary:
      'Use this page as a fit checklist for a home recovery routine, not as a ranking of the best stack. Start from your recovery goal, check the evidence and the contraindications, and consider HBOT access only once the routine burden makes sense for your week.',
    criteria: [
      'Make HBOT your anchor only if you can commit to 45-70 minute low-stimulus sessions, and read the contraindications first.',
      'This page does not promise faster recovery or stronger output. Compare routine burden, cited evidence, and rental logistics before you choose equipment.',
      'If your situation is unclear, ask us for guidance rather than adding more devices.',
    ],
  },
  'stress-balance-h2-foundation': {
    evidenceCtaLabel: 'Review stress-balance evidence',
    productCtaLabelPrefix: 'Review',
    title: 'Stress-balance stack fit decision frame',
    summary:
      'Use this page as a wellness-routine fit check. Hydrogen is the lower-burden starting point when your goal is a calmer workday rhythm. This is not an urgent-support or crisis-support path.',
    criteria: [
      'Start with hydrogen if pressure-based equipment would be too much for your work, travel, or evening timing.',
      'Keep the comparison routine-based: weigh burden, tolerance, and the limits of the evidence before you settle on a device path.',
      'If you are unsure about timing, tolerance, or daily setup, use contact or rental fit first.',
    ],
  },
  'vitality-dual-stack': {
    evidenceCtaLabel: 'Review vitality evidence',
    productCtaLabelPrefix: 'Review',
    title: 'Vitality stack fit decision frame',
    summary:
      'Treat this dual-modality route as an advanced fit check. It connects HBOT, hydrogen, research, rental, and contact paths, and it does not promise certain energy or performance outcomes.',
    criteria: [
      'Choose the dual stack only if you can handle two device workflows across a six-week routine.',
      'Compare HBOT and hydrogen as separate commitments before you combine them into one home routine.',
      'If setup, scheduling, or evidence fit is not yet clear, start with rental or guidance instead.',
    ],
  },
};

export function generateStaticParams() {
  return protocols.map((protocol) => ({
    slug: protocol.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = resolveProtocolSlug(rawSlug);
  const protocol = protocolBySlug[slug];

  if (!protocol) {
    notFound();
  }

  return createPageMetadata({
    title: `${protocol.title} | Schedule, Devices and Setup Guidance`,
    description: `Review the ${protocol.title.toLowerCase()} schedule, required devices, safety notes, and related research references.`,
    path: `/protocols/${slug}`,
  });
}

function ProtocolDetailServerShell({ protocol }: { protocol: Protocol }) {
  const guidanceHref = `/contact?bundle=${protocol.slug}&intent=protocol`;
  const rentalHref = `/rental?bundle=${protocol.slug}`;
  const relatedConditionHref = goalToConditionRoute(protocol.goalTag);
  const modalitySummary = getProtocolModalities(protocol).join(', ');
  const productLinks = getProtocolProductLinks(protocol);
  const stackDecisionFrame = PROTOCOL_STACK_DECISION_FRAMES[protocol.slug];
  const deviceNames = protocol.requiredDevices
    .map((device) => getProtocolProductName(device.productId))
    .join(', ');
  const reviewerName = protocol.reviewer?.name ?? 'Hylono Research Review';
  const reviewerCredentials = protocol.reviewer?.credentials ?? 'Editorial review team';
  const answerStats = [
    {
      label: 'Fit check',
      value: protocol.targetAudience,
    },
    {
      label: 'Time and length',
      value: `${protocol.timePerDay} per day for ${protocol.durationWeeks} weeks`,
    },
    {
      label: 'Difficulty',
      value: protocol.difficulty,
    },
    {
      label: 'Hardware burden',
      value: `${formatDeviceBurden(protocol.requiredDevices.length)}: ${deviceNames}`,
    },
    {
      label: 'Escalate first',
      value:
        protocol.contraindications.length > 0
          ? 'Review contraindications and professional guidance before starting.'
          : 'Use professional guidance if tolerance, symptoms, or device setup are uncertain.',
    },
    {
      label: 'Evidence context',
      value: `${protocol.evidenceIds.length} related research records listed on this page`,
    },
  ];
  const protocolPassportItems = [
    {
      label: 'Fit boundary',
      value: `Confirm the intended audience, daily time burden, and ${protocol.durationWeeks}-week routine length before starting.`,
    },
    {
      label: 'Device readiness',
      value: `Confirm the required device count, product hub, setup space, and support route before using the protocol.`,
    },
    {
      label: 'Evidence review',
      value: `${protocol.evidenceIds.length} cited research records should be reviewed before treating the routine as a fit.`,
    },
    {
      label: 'Human handoff',
      value:
        protocol.contraindications.length > 0
          ? 'Use guidance before starting when contraindications, symptoms, setup, or tolerance are uncertain.'
          : 'Use guidance when symptoms, setup, timing, or tolerance are uncertain.',
    },
  ];

  return (
    <section className="bg-slate-950 pt-24 text-slate-200">
      <ProtocolsRouteActionStatus />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <article
          aria-labelledby="protocol-detail-answer"
          className="rounded-lg border border-white/10 bg-white/[0.035] p-6 shadow-[0_40px_120px_-62px_rgba(8,145,178,0.45)] md:p-8 lg:p-10"
        >
          <ProtocolsTrackedLink
            href="/protocols"
            ctaRole="supporting"
            source="protocol_detail_hero"
            className="inline-flex min-h-11 items-center text-sm font-semibold text-cyan-200 underline decoration-cyan-300/[0.45] underline-offset-4 hover:text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
          >
            Back to all protocols
          </ProtocolsTrackedLink>

          <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.95fr)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                Protocol detail
              </p>
              <h1
                id="protocol-detail-answer"
                className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl"
              >
                {protocol.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200 md:text-lg">
                {protocol.shortDescription}
              </p>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-400">
                This page is an educational protocol guide for {protocol.goal.toLowerCase()}. It is
                not a personalized medical plan; review safety notes, contraindications, and
                professional guidance before using the devices in this protocol.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <ProtocolsTrackedLink
                  href={guidanceHref}
                  ctaRole="primary"
                  source="protocol_detail_hero"
                  className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  Ask for protocol guidance
                </ProtocolsTrackedLink>
                <ProtocolsTrackedLink
                  href={rentalHref}
                  ctaRole="supporting"
                  source="protocol_detail_hero"
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  Explore rental fit
                </ProtocolsTrackedLink>
                <ProtocolsTrackedLink
                  href="/research"
                  ctaRole="supporting"
                  source="protocol_detail_hero"
                  className="inline-flex min-h-11 items-center rounded-lg border border-transparent px-2 text-sm font-semibold text-slate-200 underline decoration-white/[0.28] underline-offset-4 transition-colors hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  Review evidence
                </ProtocolsTrackedLink>
                <ProtocolsTrackedLink
                  href={relatedConditionHref}
                  ctaRole="supporting"
                  source="protocol_detail_hero"
                  className="inline-flex min-h-11 items-center rounded-lg border border-transparent px-2 text-sm font-semibold text-slate-200 underline decoration-white/[0.28] underline-offset-4 transition-colors hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  View related condition
                </ProtocolsTrackedLink>
              </div>
            </div>

            <aside className="rounded-lg border border-cyan-300/[0.16] bg-slate-950 p-5 text-slate-200 md:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">
                First-answer summary
              </p>
              <dl className="mt-4 grid gap-3">
                {answerStats.map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.045] p-4">
                    <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                      {item.label}
                    </dt>
                    <dd className="mt-2 text-sm leading-6 text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Modalities
                </p>
                <p className="mt-2 text-sm leading-6 text-white">{modalitySummary}</p>
              </div>
              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Supporting product hubs
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {productLinks.map((link) => (
                    <ProtocolsTrackedLink
                      key={link.href}
                      href={link.href}
                      ctaRole="supporting"
                      source="protocol_detail_product_hubs"
                      className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.08] px-4 text-sm font-semibold text-white transition-colors hover:bg-white/[0.12] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                    >
                      Open {link.label} hub
                    </ProtocolsTrackedLink>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.045] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Reviewed by
                </p>
                <p className="mt-2 text-sm font-semibold text-white">{reviewerName}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{reviewerCredentials}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Last reviewed: {SCHEMA_DATE_MODIFIED}
                </p>
              </div>
            </aside>
          </div>

          {stackDecisionFrame ? (
            <section
              aria-labelledby="protocol-stack-fit-decision"
              className="mt-8 border-t border-white/10 pt-8"
            >
              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                    Stack logic
                  </p>
                  <h2
                    id="protocol-stack-fit-decision"
                    className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl"
                  >
                    {stackDecisionFrame.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                    {stackDecisionFrame.summary}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">Decision criteria</p>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
                    {stackDecisionFrame.criteria.map((criterion) => (
                      <li key={criterion} className="border-l-2 border-cyan-300/[0.45] pl-4">
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <ProtocolsTrackedLink
                  href="/research"
                  ctaRole="supporting"
                  source="protocol_detail_answer_frame"
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  {stackDecisionFrame.evidenceCtaLabel}
                </ProtocolsTrackedLink>
                {productLinks.map((link) => (
                  <ProtocolsTrackedLink
                    key={link.href}
                    href={link.href}
                    ctaRole="supporting"
                    source="protocol_detail_answer_frame"
                    className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                  >
                    {stackDecisionFrame.productCtaLabelPrefix} {link.label} fit
                  </ProtocolsTrackedLink>
                ))}
                <ProtocolsTrackedLink
                  href={rentalHref}
                  ctaRole="supporting"
                  source="protocol_detail_answer_frame"
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  Check rental fit
                </ProtocolsTrackedLink>
                <ProtocolsTrackedLink
                  href={guidanceHref}
                  ctaRole="primary"
                  source="protocol_detail_answer_frame"
                  className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                >
                  Ask for stack guidance
                </ProtocolsTrackedLink>
              </div>
            </section>
          ) : null}

          <section
            aria-labelledby="protocol-passport-heading"
            className="mt-10 border-t border-white/10 pt-8"
          >
            <div className="rounded-lg border border-white/10 bg-white/[0.045] p-5 md:p-6">
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,1.08fr)]">
                <div className="min-w-0">
                  <div className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-cyan-300/[0.26] bg-cyan-300/[0.12] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                    Printable artifact
                  </div>
                  <h2
                    id="protocol-passport-heading"
                    className="mt-4 text-2xl font-black tracking-tight text-white md:text-3xl"
                  >
                    Printable protocol passport
                  </h2>
                  <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                    Use this static checklist to carry the protocol into rental, product, or
                    advisor review. It is not a save/resume flow, email export, calendar reminder,
                    or personalized medical plan.
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 sm:grid-cols-4">
                    {protocolPassportItems.map((item, index) => (
                      <div
                        key={item.label}
                        className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-3"
                      >
                        <span className="block text-lg font-black leading-none text-cyan-200">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <span className="mt-2 block leading-5">{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <ol className="relative grid gap-4 sm:grid-cols-2">
                  {protocolPassportItems.map((item, index) => (
                    <li
                      key={item.label}
                      className="group relative min-w-0 overflow-hidden rounded-lg border border-white/10 bg-white/[0.065] p-5 shadow-[0_24px_80px_-54px_rgba(8,145,178,0.65)] transition-colors hover:border-cyan-300/[0.45] motion-reduce:transition-none"
                    >
                      <span
                        aria-hidden="true"
                        className="absolute -right-1 -top-3 text-7xl font-black leading-none text-white/[0.08] transition-colors group-hover:text-cyan-200/[0.16] motion-reduce:transition-none"
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <p className="relative inline-flex min-h-9 items-center rounded-lg border border-cyan-300/[0.26] bg-cyan-300/[0.12] px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-100">
                        Step {index + 1}
                      </p>
                      <h3 className="relative mt-4 text-sm font-semibold text-white">
                        {item.label}
                      </h3>
                      <p className="relative mt-2 text-sm leading-6 text-slate-300">
                        {item.value}
                      </p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="protocol-share-prep-heading"
            className="mt-10 border-t border-white/10 pt-8"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(280px,1.1fr)]">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                  Manual handoff prep
                </p>
                <h2
                  id="protocol-share-prep-heading"
                  className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl"
                >
                  Protocol share preparation
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                  Keep a manual protocol handoff without saving it. This is not saved account
                  progress, a share link, an emailed protocol artifact, calendar sync, reminder,
                  saved-plan artifact, account-backed tracker, or personalized medical plan.
                </p>
                <div className="mt-5 h-2 overflow-hidden rounded-lg bg-white/[0.08]">
                  <div className="h-full w-2/3 rounded-lg bg-emerald-300" />
                </div>
              </div>

              <div>
                <ol className="grid gap-4 sm:grid-cols-3">
                  {protocolSharePreparationItems.map((item, index) => (
                    <li
                      key={item.label}
                      className="relative min-w-0 rounded-lg border border-white/10 bg-white/[0.055] p-4 shadow-[0_22px_70px_-58px_rgba(8,145,178,0.7)]"
                    >
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg border border-emerald-300/[0.26] bg-emerald-300/[0.12] text-sm font-black text-emerald-100">
                        {index + 1}
                      </span>
                      <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                        Prep {index + 1}
                      </p>
                      <h3 className="mt-2 text-sm font-semibold text-white">{item.label}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.value}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          <section
            aria-labelledby="protocol-follow-up-heading"
            className="mt-10 border-t border-white/10 pt-8"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(280px,1.08fr)]">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200">
                  Manual progress aid
                </p>
                <h2
                  id="protocol-follow-up-heading"
                  className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl"
                >
                  Manual follow-up checklist
                </h2>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 md:text-base">
                  Use this as a handwritten follow-up layer after each protocol week. It does not
                  save progress, send reminders, sync a calendar, email an artifact, or generate a
                  personalized care plan.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <ProtocolsTrackedLink
                    href={guidanceHref}
                    ctaRole="primary"
                    source="protocol_detail_follow_up"
                    className="inline-flex min-h-11 items-center rounded-lg bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                  >
                    Ask about follow-up
                  </ProtocolsTrackedLink>
                  <ProtocolsTrackedLink
                    href={rentalHref}
                    ctaRole="supporting"
                    source="protocol_detail_follow_up"
                    className="inline-flex min-h-11 items-center rounded-lg border border-white/15 bg-white/[0.06] px-5 py-3 text-sm font-semibold text-slate-100 transition-colors hover:bg-white/[0.1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 motion-reduce:transition-none"
                  >
                    Bring notes to rental fit
                  </ProtocolsTrackedLink>
                </div>
              </div>

              <div>
                <ol className="grid gap-4 sm:grid-cols-2">
                  {protocolFollowUpItems.map((item, index) => (
                    <li
                      key={item.label}
                      className="relative min-w-0 rounded-lg border border-white/10 bg-white/[0.055] p-4 pl-5 shadow-[0_22px_70px_-58px_rgba(8,145,178,0.7)]"
                    >
                      <div className="flex gap-4">
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-amber-300/[0.3] bg-amber-300/[0.12] text-sm font-black text-amber-100">
                          {index + 1}
                        </span>
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Note {index + 1}
                          </p>
                          <h3 className="mt-2 text-sm font-semibold text-white">
                            {item.label}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.value}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        </article>
      </div>
    </section>
  );
}

// [DECISION: ISR because protocol detail content is editorial and refreshed periodically.]
// Rendering strategy: server-rendered metadata, schema, and first-answer shell with the interactive protocol schedule isolated in a client leaf.
export default async function ProtocolDetailPageRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug: rawSlug } = await params;
  const slug = resolveProtocolSlug(rawSlug);
  const protocol = protocolBySlug[slug];

  if (!protocol) {
    notFound();
  }

  const reviewOwnerName = protocol.reviewer?.name ?? 'Hylono Research Review';

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', path: '/' },
    { name: 'Protocols', path: '/protocols' },
    { name: protocol.title, path: `/protocols/${slug}` },
  ]);

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    '@id': `${SITE_URL}/protocols/${slug}#howto`,
    name: protocol.title,
    description: protocol.shortDescription,
    url: `${SITE_URL}/protocols/${slug}`,
    inLanguage: 'en',
    image: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/og-image.svg`,
      width: 1200,
      height: 630,
    },
    isPartOf: { '@type': 'CollectionPage', '@id': `${SITE_URL}/protocols` },
    publisher: { '@id': ORGANIZATION_ID() },
    totalTime: `P${Math.max(protocol.durationWeeks, 1)}W`,
    step: protocol.weeks.slice(0, 3).map((week) => ({
      '@type': 'HowToStep',
      position: week.number,
      name: `Week ${week.number}: ${week.title}`,
      text: week.days
        .map((day) => {
          const sessionSummary = day.sessions
            .map((session) => `${session.modality} (${session.duration})`)
            .join(', ');
          return `Day ${day.number}: ${sessionSummary}`;
        })
        .join(' | '),
    })),
    tool: protocol.requiredDevices.map((device) => {
      const routeSlug = getRouteSlugForProductId(device.productId);
      const techType = getTechTypeFromRouteSlug(routeSlug);
      const toolName = techType ? `Hylono ${TECH_DETAILS[techType].name}` : device.productId;
      return {
        '@type': 'HowToTool',
        '@id': `${SITE_URL}/product/${routeSlug}#product`,
        name: toolName,
        url: `${SITE_URL}/product/${routeSlug}`,
      };
    }),
    about: {
      '@type': 'DefinedTerm',
      '@id': `${SITE_URL}/conditions/${protocol.goalTag}#term`,
      name: protocol.goal,
      url: `${SITE_URL}/conditions/${protocol.goalTag}`,
      inDefinedTermSet: `${SITE_URL}/conditions`,
    },
    yield: {
      '@type': 'DefinedTerm',
      name: protocol.goal,
      url: `${SITE_URL}/conditions/${protocol.goalTag}`,
      inDefinedTermSet: `${SITE_URL}/conditions`,
    },
    teaches: protocol.goal,
    audience: {
      '@type': 'Audience',
      audienceType: protocol.targetAudience,
    },
    ...(protocol.safetyNotes
      ? { warning: protocol.safetyNotes }
      : {}),
    ...(protocol.contraindications.length > 0
      ? { contraindication: protocol.contraindications.join('; ') }
      : {}),
    author: {
      '@type': 'Organization',
      '@id': ORGANIZATION_ID(),
      name: reviewOwnerName,
      url: `${SITE_URL}/about`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['#protocol-detail-answer'],
    },
    ...(protocol.relatedProtocolSlugs.length > 0
      ? {
          isRelatedTo: protocol.relatedProtocolSlugs.map((s) => ({
            '@type': 'HowTo',
            '@id': `${SITE_URL}/protocols/${s}#howto`,
            url: `${SITE_URL}/protocols/${s}`,
            name: protocolBySlug[s]?.title ?? s,
          })),
        }
      : {}),
  };
  return (
    <>
      <ProtocolDetailServerShell protocol={protocol} />
      <StaticStructuredData
        id="jsonld-protocol-page"
        data={{
          ...createMedicalWebPageSchema({
            name: protocol.title,
            description: protocol.shortDescription,
            abstract: protocol.shortDescription,
            path: `/protocols/${slug}`,
            about: protocol.requiredDevices.map((d) => {
              const routeSlug = getRouteSlugForProductId(d.productId);
              const techType = getTechTypeFromRouteSlug(routeSlug);
              return techType ? TECH_DETAILS[techType].name : d.productId;
            }),
            citations: protocol.evidenceIds
              .map((id) => evidence.find((e) => e.id === id))
              .filter((ev): ev is NonNullable<typeof ev> => Boolean(ev))
              .map((ev) => ({
                title: ev.title,
                url: ev.sourceUrl,
                doi: ev.doi,
                year: ev.year,
                authors: ev.authors,
              })),
            reviewedByName: reviewOwnerName,
            speakableSelectors: ['#protocol-detail-answer'],
            dateModified: SCHEMA_DATE_MODIFIED,
            lastReviewed: SCHEMA_DATE_MODIFIED,
            mainEntity: { '@id': `${SITE_URL}/protocols/${slug}#howto` },
          }),
          about: [
            ...protocol.requiredDevices.map((d) => {
              const routeSlug = getRouteSlugForProductId(d.productId);
              return {
                '@type': 'Product',
                '@id': `${SITE_URL}/product/${routeSlug}#product`,
                url: `${SITE_URL}/product/${routeSlug}`,
              };
            }),
            {
              '@type': 'DefinedTerm',
              '@id': `${SITE_URL}/conditions/${protocol.goalTag}#term`,
              name: protocol.goal,
              url: `${SITE_URL}/conditions/${protocol.goalTag}`,
              inDefinedTermSet: `${SITE_URL}/conditions`,
            },
          ],
          audience: {
            '@type': 'Audience',
            audienceType: protocol.targetAudience,
          },
          mentions: [
            ...protocol.requiredDevices.map((d) => {
              const routeSlug = getRouteSlugForProductId(d.productId);
              const techType = getTechTypeFromRouteSlug(routeSlug);
              return {
                '@type': 'Product',
                '@id': `${SITE_URL}/product/${routeSlug}#product`,
                url: `${SITE_URL}/product/${routeSlug}`,
                name: techType ? `Hylono ${TECH_DETAILS[techType].name}` : d.productId,
              };
            }),
            {
              '@type': 'WebPage',
              '@id': `${SITE_URL}/conditions/${protocol.goalTag}`,
              url: `${SITE_URL}/conditions/${protocol.goalTag}`,
              name: `${protocol.goal} wellness guide`,
            },
          ],
          keywords: [protocol.goal, protocol.goalTag, protocol.difficulty, 'wellness protocol'].join(
            ', '
          ),
          relatedLink: [
            `${SITE_URL}/protocols`,
            `${SITE_URL}/conditions`,
            `${SITE_URL}/conditions/${protocol.goalTag}`,
            `${SITE_URL}/research`,
            ...protocol.relatedProtocolSlugs.map((s) => `${SITE_URL}/protocols/${s}`),
          ],
        }}
      />
      <StaticStructuredData id="jsonld-protocol-breadcrumb" data={breadcrumbSchema} />
      <StaticStructuredData id="jsonld-protocol-howto" data={howToSchema} />
      <ProtocolDetailClient hideDetailIntro slug={slug} />
    </>
  );
}
