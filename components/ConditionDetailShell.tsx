import type { ConditionGoalPage } from '@/content/conditions';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { goalJourneys } from '@/content/topical-graph';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import {
  ConditionReturnLink,
  ConditionRouteActionStatus,
  ConditionTransitionLink,
} from './ConditionTransitionLink';
import { PageOwnership } from './content/PageOwnership';

const displayReviewDate = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
}).format(new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`));

const defaultPrimaryAction = {
  href: '/contact',
  label: 'Talk to Hylono',
};

const defaultSupportingProduct = {
  href: '/store',
  label: 'Store hub',
};

export function getConditionDetailJourney(goal: ConditionGoalPage) {
  const goalJourney = goalJourneys.find((journey) => journey.slug === goal.slug);

  return {
    primaryAction: goalJourney?.action ?? defaultPrimaryAction,
    supportingProduct: goalJourney?.product ?? defaultSupportingProduct,
    supportingProtocol: goalJourney?.protocol,
  };
}

export function ConditionDetailShell({
  goal,
}: {
  goal: ConditionGoalPage;
}) {
  const { primaryAction, supportingProduct, supportingProtocol } = getConditionDetailJourney(goal);

  return (
    <>
      <ConditionRouteActionStatus />

      <header
        id="condition-intro"
        className="rounded-lg border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs"
      >
        <ConditionReturnLink
          condition={goal.slug}
          className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-cyan-700 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-white"
        />

        <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-1">
            {goal.modalities.length} technology comparisons
          </span>
          <span className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-1">
            {goal.protocolSlugs.length} related protocol guides
          </span>
          <span className="rounded-lg border border-slate-200/80 bg-slate-50/70 px-3 py-1">
            {goal.evidenceIds.length} cited research summaries
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-bold text-slate-950">{goal.title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 md:text-base">{goal.subtitle}</p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
          Use this guide to compare technologies, open the strongest product or protocol path,
          review cited research, and decide whether rental or direct support is the better next
          step for {goal.title.toLowerCase()}.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <ConditionTransitionLink
            condition={goal.slug}
            ctaRole="primary"
            href={primaryAction.href}
            className="inline-flex min-h-11 items-center rounded-lg bg-slate-900 px-5 text-sm font-semibold text-white shadow-xs hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-white"
            label={primaryAction.label}
            source="detail_intro"
          />
          <ConditionTransitionLink
            condition={goal.slug}
            ctaRole="supporting"
            href={supportingProduct.href}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-200/80 bg-white px-5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-white"
            label={supportingProduct.label}
            source="detail_intro"
          />
          <ConditionTransitionLink
            condition={goal.slug}
            ctaRole="fallback"
            href={supportingProtocol?.href ?? '/research'}
            className="inline-flex min-h-11 items-center rounded-lg border border-slate-200/80 bg-white px-5 text-sm font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-white"
            label={supportingProtocol ? `Review ${supportingProtocol.label}` : 'Browse research'}
            source="detail_intro"
          />
        </div>
      </header>

      <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
        <PageOwnership
          title="Guide review context"
          description={`This ${goal.title.toLowerCase()} page is intended to compare next-step options, show the current evidence posture, and move visitors into stronger product, protocol, research, rental, or contact paths.`}
          items={[
            {
              label: siteOwnership.editorial.label,
              value: siteOwnership.editorial.team,
              detail: 'Owns page clarity, next-step fit, and visible trust signals on this guide.',
            },
            {
              label: siteOwnership.research.label,
              value: siteOwnership.research.team,
              detail: 'Reviews cited-study alignment and keeps modality wording conservative.',
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

        <aside className="rounded-lg border border-slate-200/80 bg-white p-6 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
            First-view next steps
          </p>
          <h2
            className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-slate-900 break-words"
            style={{ fontFamily: 'var(--font-sans), sans-serif' }}
          >
            Best next steps for {goal.title.toLowerCase()}
          </h2>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Start here if you want a fast way to compare technologies, review protocols, and find
            the best next step for {goal.title.toLowerCase()}.
          </p>

          <dl className="mt-5 grid gap-3 text-sm">
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
              <dt className="font-medium text-slate-500">Primary product hub</dt>
              <dd className="mt-1">
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="primary"
                  href={supportingProduct.href}
                  className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-cyan-700 underline-offset-4 hover:bg-cyan-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-white"
                  label={supportingProduct.label}
                  source="detail_route_map"
                />
              </dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
              <dt className="font-medium text-slate-500">Supporting protocol</dt>
              <dd className="mt-1">
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href={supportingProtocol?.href ?? '/research'}
                  className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-cyan-700 underline-offset-4 hover:bg-cyan-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-white"
                  label={supportingProtocol?.label ?? 'Research hub'}
                  source="detail_route_map"
                />
              </dd>
            </div>
            <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
              <dt className="font-medium text-slate-500">Research page</dt>
              <dd className="mt-1">
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="fallback"
                  href="/research"
                  className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-cyan-700 underline-offset-4 hover:bg-cyan-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-600 focus-visible:ring-offset-2 focus-visible:ring-white"
                  label="Research hub"
                  source="detail_route_map"
                />
              </dd>
            </div>
          </dl>

          <ul className="mt-5 space-y-3 text-sm leading-7 text-slate-600">
            <li className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
              This page compares fit signals and common next-step options. It does not confirm personal
              suitability or promise results.
            </li>
            <li className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
              Session timing, stack choice, and budget fit still depend on the product hub,
              protocol page, rental path, or direct support.
            </li>
            <li className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
              When you need source depth before acting, open the research hub or contact Hylono
              for a narrower recommendation path.
            </li>
          </ul>
        </aside>
      </section>
    </>
  );
}
