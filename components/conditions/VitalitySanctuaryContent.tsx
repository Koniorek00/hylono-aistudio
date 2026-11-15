/**
 * VitalitySanctuaryContent — the flagship /conditions/vitality experience.
 *
 * WHY A PER-CONDITION COMPONENT
 *
 * `ConditionDetailPageContent` owns the shared conditions branch, and `sleep`
 * and `stress` each take the same escape hatch: a slug branch that returns a
 * dedicated component while the metadata, JSON-LD, and SERP description logic
 * stay in `app/conditions/condition-detail-page.tsx`. Vitality uses that same
 * sanctioned branch. Nothing in the shared branch changes behaviour for
 * `recovery` or `comfort`.
 *
 * WHAT THE SHARED CHAIN CONTRIBUTES
 *
 * The following contracts are load-bearing and are re-established here rather
 * than re-invented, because losing any one of them breaks a published
 * expectation, a JSON-LD selector, or the tracked next-step analytics:
 *
 *  - `id="condition-intro"`, which is the `speakableSelectors` target in
 *    `condition-detail-page.tsx` and the first-view anchor the routing e2e
 *    suite tabs into.
 *  - The return link, the three intro CTAs, the `PageOwnership` block titled
 *    "Guide review context", and the "Best next steps for vitality" route map,
 *    in that DOM order, so keyboard focus order is unchanged.
 *  - The lower "Choose the next step that fits your goal" block with exactly
 *    three CTAs.
 *  - `ConditionRouteActionStatus` and `ConditionTransitionLink`, so every
 *    tracked handoff still carries its `condition`, `cta_role`, `destination`,
 *    and `source` payload.
 *
 * WHAT IS NEW HERE
 *
 * A dark, layered first screen on the real `--surface-ink` and `--surface-page`
 * tokens; the High-Demand Week Planner; one single-markup modality comparison
 * that replaces the duplicated mobile-cards-plus-desktop-table pattern; a
 * protocol anatomy built from the published `vitality-dual-stack` week blocks;
 * and an evidence ledger whose cards are server-rendered with a focus-trapped
 * drawer for the full citation.
 *
 * NOTHING HERE INVENTS A FACT
 *
 * Prices come from the price book through `content/conditions.ts`. Study facts
 * come from the three records attached to this goal. Session arithmetic is
 * performed in `vitalityPlanning.ts` on published strings and shown next to
 * those strings. Where Hylono publishes nothing, the surface says so.
 */

import { getConditionDetailJourney } from '@/components/ConditionDetailShell';
import {
  ConditionReturnLink,
  ConditionRouteActionStatus,
  ConditionTransitionLink,
} from '@/components/ConditionTransitionLink';
import { PageOwnership } from '@/components/content/PageOwnership';
import type {
  ConditionGoalPage,
  ConditionModality,
} from '@/content/conditions';
import { conditionGoalBySlug } from '@/content/conditions';
import { disclaimers } from '@/content/disclaimers';
import { evidenceById } from '@/content/evidence';
import { protocolBySlug } from '@/content/protocols';
import { siteEntity, siteOwnership } from '@/content/site-entity';
import { SCHEMA_DATE_MODIFIED } from '@/lib/seo-schema';
import { VitalityEvidenceLedger } from './vitality/VitalityEvidenceLedger';
import { VitalityHeroDepth } from './vitality/VitalityHeroDepth';
import { VitalityModalityComparison } from './vitality/VitalityModalityComparison';
import { VitalityWeekPlanner } from './vitality/VitalityWeekPlanner';
import {
  buildDeviceEvidenceCoverage,
  buildProtocolCrossCheck,
  longestProtocolWeekMinutes,
  protocolWeekMinutes,
} from './vitality/vitalityPlanning';

const VITALITY_PROTOCOL_SLUG = 'vitality-dual-stack';

/**
 * The brand display stack, stated explicitly instead of through `var(--font-heading)`.
 *
 * WHY NOT `var(--font-heading)`
 *
 * `app/layout.tsx:21-24` declares Syncopate as a plain object and applies
 * `syncopate.variable` — the literal string `'--font-syncopate'` — as a class
 * name on `<html>`, so no CSS custom property is ever defined. `--font-heading`
 * in `app/styles/base.css:73` is `var(--font-syncopate), 'Syncopate', sans-serif`,
 * which therefore resolves to an invalid value, and `app/styles/motion-typography.css:17-24`
 * hands that invalid value to every `h1`–`h6` on the site. Measured in Chromium
 * on this route, `getComputedStyle(h1).fontFamily` was the browser default sans,
 * not the brand face. That root cause is global and outside this route's blast
 * radius, so it is reported rather than patched here.
 *
 * What this page does instead is refuse to inherit the failure: it asks for the
 * brand face first and falls back to the repo's own body token rather than to
 * the browser default. A reader with Syncopate installed locally gets Syncopate
 * (no webfont ships for it — `app/styles/base.css:389-393` records that CSP
 * removed Google Fonts and that shipping a self-hosted face is an owner
 * decision). Everyone else gets Outfit, the documented brand body face. Neither
 * branch is a generic fallback.
 */
const BRAND_DISPLAY_STACK =
  'var(--font-syncopate, "Syncopate"), "Syncopate", var(--font-body, "Outfit"), sans-serif';

const displayReviewDate = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'long',
  timeZone: 'UTC',
  year: 'numeric',
}).format(new Date(`${SCHEMA_DATE_MODIFIED}T00:00:00Z`));

const MODALITY_ACCENT_VAR: Record<ConditionModality['slug'], string> = {
  HBOT: '--accent-oxygen',
  H2: '--accent-hydrogen',
  RLT: '--accent-light',
  PEMF: '--accent-signal',
};

export function VitalitySanctuaryContent({
  slug,
}: {
  slug: ConditionGoalPage['slug'];
}) {
  const goal = conditionGoalBySlug[slug];

  if (!goal) {
    return null;
  }

  const protocol = protocolBySlug[VITALITY_PROTOCOL_SLUG];

  if (!protocol) {
    return null;
  }

  const { primaryAction, supportingProduct, supportingProtocol } =
    getConditionDetailJourney(goal);
  const fallbackAction =
    primaryAction.href === '/rental'
      ? { href: '/contact', label: 'Book a consultation' }
      : { href: '/rental', label: 'Explore rentals' };

  // Newest first, then available sample size, then title — the same ordering the
  // shared branch uses, so a reader moving between goal guides sees one rule.
  const evidenceRecords = goal.evidenceIds
    .map((evidenceId) => evidenceById[evidenceId])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const sampleSizeDelta = (b.sampleSize ?? -1) - (a.sampleSize ?? -1);
      if (sampleSizeDelta !== 0) return sampleSizeDelta;
      return a.title.localeCompare(b.title);
    });

  const recordCountByModality = {
    HBOT:
      buildDeviceEvidenceCoverage(['HBOT'], evidenceRecords)[0]?.recordIds
        .length ?? 0,
    H2:
      buildDeviceEvidenceCoverage(['H2'], evidenceRecords)[0]?.recordIds
        .length ?? 0,
    RLT:
      buildDeviceEvidenceCoverage(['RLT'], evidenceRecords)[0]?.recordIds
        .length ?? 0,
    PEMF:
      buildDeviceEvidenceCoverage(['PEMF'], evidenceRecords)[0]?.recordIds
        .length ?? 0,
  } satisfies Record<ConditionModality['slug'], number>;

  const crossCheck = buildProtocolCrossCheck(protocol);
  const longestWeekMinutes = longestProtocolWeekMinutes(protocol);
  const coveredDevices = Object.entries(recordCountByModality)
    .filter(([, count]) => count > 0)
    .map(([slug]) => slug);
  const uncoveredDevices = Object.entries(recordCountByModality)
    .filter(([, count]) => count === 0)
    .map(([slug]) => slug);

  return (
    <div className="min-h-screen bg-[var(--surface-page)] pt-24 pb-16 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ConditionRouteActionStatus />

        {/* ---------------- First screen ---------------- */}
        <header
          id="condition-intro"
          className="relative isolate overflow-hidden rounded-[2rem] bg-[var(--surface-ink)] p-6 text-[var(--color-on-ink)] sm:p-8 md:p-10"
        >
          <VitalityHeroDepth />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start">
            <div className="min-w-0">
              <ConditionReturnLink
                condition={goal.slug}
                className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-cyan-200 transition-none hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-ink)]"
              />

              <p
                className="mt-5 text-[11px] font-semibold uppercase tracking-[0.26em] text-cyan-300"
                style={{ fontFamily: BRAND_DISPLAY_STACK }}
              >
                Goal guide · dual-modality planning
              </p>

              <h1 className="mt-4 text-4xl leading-[1.05] font-bold text-white sm:text-5xl md:text-6xl">
                <span
                  className="tracking-[0.02em]"
                  style={{ fontFamily: BRAND_DISPLAY_STACK }}
                >
                  {goal.title}
                </span>
              </h1>

              <p className="mt-5 max-w-3xl font-editorial text-2xl leading-snug text-slate-100 sm:text-3xl">
                Vitality is a planning goal, not an energy promise.
              </p>

              <p className="mt-5 max-w-3xl text-base leading-relaxed text-slate-300">
                {goal.subtitle}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="primary"
                  href={primaryAction.href}
                  className="inline-flex min-h-11 items-center rounded-lg bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition-none hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-ink)]"
                  label={primaryAction.label}
                  source="detail_intro"
                />
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href={supportingProduct.href}
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition-none hover:border-cyan-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-ink)]"
                  label={supportingProduct.label}
                  source="detail_intro"
                />
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="fallback"
                  href={supportingProtocol?.href ?? '/research'}
                  className="inline-flex min-h-11 items-center rounded-lg border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition-none hover:border-cyan-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-ink)]"
                  label={
                    supportingProtocol
                      ? `Review ${supportingProtocol.label}`
                      : 'Browse research'
                  }
                  source="detail_intro"
                />
              </div>
            </div>

            {/* Non-focusable planning readout. Every figure below is either a
                published string from content/conditions.ts or a count of this
                goal's own evidence records. Nothing is derived from a visitor. */}
            <div className="min-w-0 rounded-[2rem] border border-white/15 bg-white/[0.05] p-6">
              <p
                className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300"
                style={{ fontFamily: BRAND_DISPLAY_STACK }}
              >
                Planning readout
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                The dual-stack protocol publishes{' '}
                <span className="font-semibold text-white">
                  {crossCheck.publishedTimePerDay}
                </span>{' '}
                a day across {crossCheck.publishedWeeks} weeks. Session windows
                and record counts below are the published figures the planner
                checks.
              </p>

              <dl className="mt-5 grid gap-2.5">
                {goal.modalities.map((modality) => (
                  <div
                    key={`readout-${modality.slug}`}
                    className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-baseline gap-3 border-b border-white/10 pb-2.5 last:border-0 last:pb-0"
                  >
                    <dt className="min-w-0 text-sm font-semibold text-white break-words">
                      <span
                        aria-hidden="true"
                        className="mr-2 inline-block h-2 w-2 translate-y-[-1px] rounded-sm"
                        style={{
                          background: `var(${MODALITY_ACCENT_VAR[modality.slug]})`,
                        }}
                      />
                      {modality.shortName}
                    </dt>
                    <dd className="min-w-0 text-right text-sm text-slate-200 break-words">
                      {modality.sessionTime}
                      <span className="block text-xs text-slate-400">
                        {recordCountByModality[modality.slug] === 0
                          ? 'no record on this page'
                          : `${recordCountByModality[modality.slug]} record${recordCountByModality[modality.slug] === 1 ? '' : 's'} on this page`}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Full-width telemetry band: three honest counts, each with a
              screen-reader term so the figure is never announced bare. */}
          <dl className="relative z-10 mt-10 grid gap-4 border-t border-white/10 pt-6 sm:grid-cols-3">
            {[
              [
                String(goal.modalities.length).padStart(2, '0'),
                'technology comparisons',
              ],
              [
                String(goal.protocolSlugs.length).padStart(2, '0'),
                'related protocol guides',
              ],
              [
                String(goal.evidenceIds.length).padStart(2, '0'),
                'cited research records',
              ],
            ].map(([figure, label]) => (
              <div key={label} className="min-w-0">
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span
                    className="block text-2xl font-bold text-cyan-300"
                    style={{ fontFamily: BRAND_DISPLAY_STACK }}
                  >
                    {figure}
                  </span>
                  <span className="mt-1 block text-[11px] uppercase tracking-[0.14em] text-slate-400">
                    {label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {/* ---------------- Ownership + route map ---------------- */}
        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
          <PageOwnership
            title="Guide review context"
            description={`This ${goal.title.toLowerCase()} page compares next-step options, shows the current evidence posture, and moves readers into stronger product, protocol, research, rental, or contact paths.`}
            items={[
              {
                label: siteOwnership.editorial.label,
                value: siteOwnership.editorial.team,
                detail:
                  'Owns page clarity, next-step fit, and visible trust signals here.',
              },
              {
                label: siteOwnership.research.label,
                value: siteOwnership.research.team,
                detail:
                  'Reviews cited-study alignment and keeps modality wording conservative.',
              },
              {
                label: 'Last reviewed',
                value: displayReviewDate,
                detail:
                  'Use this guide to plan and compare — not as personal professional advice.',
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

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
              First-view next steps
            </p>
            <h2 className="mt-3 text-lg font-bold tracking-tight text-slate-900 break-words sm:text-xl">
              Best next steps for {goal.title.toLowerCase()}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Start here if you want a fast way to compare modalities, read the
              protocol, and find the honest next step for{' '}
              {goal.title.toLowerCase()}.
            </p>

            <dl className="mt-5 grid gap-3 text-sm">
              {[
                {
                  term: 'Primary product hub',
                  href: supportingProduct.href,
                  label: supportingProduct.label,
                  ctaRole: 'primary' as const,
                },
                {
                  term: 'Supporting protocol',
                  href: supportingProtocol?.href ?? '/research',
                  label: supportingProtocol?.label ?? 'Research hub',
                  ctaRole: 'supporting' as const,
                },
                {
                  term: 'Research page',
                  href: '/research',
                  label: 'Research hub',
                  ctaRole: 'fallback' as const,
                },
              ].map((row) => (
                <div
                  key={row.term}
                  className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3"
                >
                  <dt className="font-medium text-slate-500">{row.term}</dt>
                  <dd className="mt-1">
                    <ConditionTransitionLink
                      condition={goal.slug}
                      ctaRole={row.ctaRole}
                      href={row.href}
                      className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-cyan-800 underline-offset-4 transition-none hover:bg-cyan-50 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2 focus-visible:ring-white"
                      label={row.label}
                      source="detail_route_map"
                    />
                  </dd>
                </div>
              ))}
            </dl>

            <ul className="mt-5 grid gap-3 text-sm leading-7 text-slate-600">
              <li className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                This page compares fit signals and common next-step options. It
                does not confirm personal suitability or promise results.
              </li>
              <li className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                Session timing, stack choice, and budget fit still depend on the
                product hub, protocol page, rental path, or direct support.
              </li>
              <li className="rounded-lg border border-slate-100 bg-slate-50/70 px-4 py-3">
                When source depth matters before acting, open the research hub
                or contact Hylono for a narrower path.
              </li>
            </ul>
          </aside>
        </section>

        {/* ---------------- Narrative arc ---------------- */}
        <section
          aria-labelledby="vitality-narrative"
          className="mt-6 grid gap-6 rounded-[2rem] border border-slate-200 bg-[var(--surface-video)] p-6 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] md:p-8"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
              Where this goal sits
            </p>
            <h2
              id="vitality-narrative"
              className="mt-3 text-2xl font-bold tracking-tight text-slate-950 break-words sm:text-3xl"
              style={{ fontFamily: BRAND_DISPLAY_STACK }}
            >
              A week is the unit that actually gets planned
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-700 font-editorial">
              Oxygen sessions are long. Hydrogen sessions are short. Comparing
              them only by price hides the constraint that decides most plans:
              the hours a demanding week can genuinely give away.
            </p>
          </div>
          <div className="min-w-0">
            <div className="space-y-4 text-sm leading-relaxed text-slate-600">
              {goal.description.map((paragraph) => (
                <p key={`${goal.slug}-${paragraph}`} className="break-words">
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              The order below is the order of decisions: express the week, see
              what the records can and cannot say, compare modalities, choose a
              stack, then pick a next step.
            </p>
          </div>
        </section>

        {/* ---------------- Signature moment 1: the planner ---------------- */}
        <section
          aria-labelledby="vitality-planner"
          className="mt-6 rounded-[2rem] border border-slate-200 bg-[var(--surface-panel)] p-6 md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
            Signature planning tool
          </p>
          <h2
            id="vitality-planner"
            className="mt-3 text-2xl font-bold tracking-tight text-slate-950 break-words sm:text-3xl"
            style={{ fontFamily: BRAND_DISPLAY_STACK }}
          >
            High-Demand Week Planner
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Three questions about your own week, checked against the three
            stacks Hylono publishes for this goal. Planning arithmetic only — no
            score, no ranking weight, and no statement about what a stack would
            do for a person.
          </p>

          <div className="mt-7">
            <VitalityWeekPlanner
              condition={goal.slug}
              evidenceRecords={evidenceRecords}
              modalities={goal.modalities}
              protocol={protocol}
              stacks={goal.stacks}
            />
          </div>
        </section>

        {/* ---------------- Signature moment 2: modality comparison ---------------- */}
        <section aria-labelledby="vitality-technologies" className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
            Technology fit
          </p>
          <h2
            id="vitality-technologies"
            className="mt-3 text-2xl font-bold tracking-tight text-slate-950 break-words sm:text-3xl"
            style={{ fontFamily: BRAND_DISPLAY_STACK }}
          >
            Recommended technologies
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Compare the modalities attached to this goal before moving to
            product, protocol, or rental next steps. One comparison surface for
            every breakpoint, built from the same four records the shared
            conditions branch uses — relevance, session window, rental,
            purchase, and the explanation Hylono publishes for each.
          </p>

          <div className="mt-7">
            <VitalityModalityComparison
              modalities={goal.modalities}
              recordCountByModality={recordCountByModality}
            />
          </div>
        </section>

        {/* ---------------- Signature moment 3: protocol anatomy ---------------- */}
        <section
          aria-labelledby="vitality-anatomy"
          className="mt-6 rounded-[2rem] border border-slate-200 bg-[var(--surface-panel)] p-6 md:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
                Protocol anatomy
              </p>
              <h2
                id="vitality-anatomy"
                className="mt-3 text-2xl font-bold tracking-tight text-slate-950 break-words sm:text-3xl"
                style={{ fontFamily: BRAND_DISPLAY_STACK }}
              >
                {crossCheck.protocolTitle}, week by week
              </h2>
            </div>
            <p className="text-sm text-slate-500">
              {crossCheck.publishedTimePerDay} a day ·{' '}
              {crossCheck.publishedWeeks} weeks · {protocol.difficulty}
            </p>
          </div>

          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-600">
            The published record details {crossCheck.detailedWeeks.length} of
            the {crossCheck.publishedWeeks} weeks it covers, so only those weeks
            are drawn below. Nothing is extrapolated into the gaps. Bar lengths
            are the sum of the session minutes inside each week block.
          </p>

          <ol className="mt-7 grid gap-4">
            {protocol.weeks.map((week) => {
              const weekMinutes = protocolWeekMinutes(week);
              const widthPercent =
                longestWeekMinutes === 0
                  ? 0
                  : Math.round((weekMinutes / longestWeekMinutes) * 100);

              return (
                <li
                  key={`${protocol.slug}-week-${week.number}`}
                  className="rounded-[2rem] border border-slate-200 bg-white p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h3
                      className="text-lg font-bold tracking-tight text-slate-950 break-words"
                      style={{ fontFamily: BRAND_DISPLAY_STACK }}
                    >
                      Week {week.number} — {week.title}
                    </h3>
                    <p className="text-sm font-medium text-slate-600">
                      {weekMinutes} min across {week.days.length} documented{' '}
                      {week.days.length === 1 ? 'day' : 'days'}
                    </p>
                  </div>

                  <div
                    aria-hidden="true"
                    className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-200"
                  >
                    <div
                      className="h-full rounded-full bg-[var(--accent-oxygen)]"
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>

                  <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                    {week.days.map((day) => (
                      <li
                        key={`${protocol.slug}-week-${week.number}-day-${day.number}`}
                        className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                      >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Day {day.number}
                        </p>
                        <ul className="mt-2 grid gap-2">
                          {day.sessions.map((session, sessionIndex) => (
                            <li
                              key={`${day.number}-${sessionIndex}`}
                              className="text-sm"
                            >
                              <span className="font-semibold text-slate-800 break-words">
                                {session.modality}
                              </span>{' '}
                              <span className="text-slate-600">
                                · {session.duration}
                              </span>
                              <span className="mt-0.5 block text-xs leading-relaxed text-slate-500 break-words">
                                {session.parameters}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold tracking-tight text-slate-950">
                Devices the protocol asks for
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {protocol.requiredDevices.map((device) => (
                  <li
                    key={device.productId}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
                  >
                    <span className="break-words">{device.productId}</span>{' '}
                    <span className="text-slate-500">({device.role})</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                {protocol.shortDescription}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Written for: {protocol.targetAudience}.
              </p>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
              <h3 className="text-base font-bold tracking-tight text-slate-950">
                Progression and safety notes from the record
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 break-words">
                {protocol.safetyNotes}
              </p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Listed contraindications
              </p>
              <ul className="mt-2 grid gap-1.5 text-sm text-slate-700">
                {protocol.contraindications.map((item) => (
                  <li key={item} className="flex gap-2 break-words">
                    <span
                      aria-hidden="true"
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-700"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                {disclaimers.safety}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="supporting"
              href={`/protocols/${protocol.slug}`}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
              label={`Open ${protocol.title} in full`}
              source="detail_route_map"
            />
            {goal.protocolSlugs
              .filter((protocolSlug) => protocolSlug !== protocol.slug)
              .map((protocolSlug) => {
                const related = protocolBySlug[protocolSlug];

                return related ? (
                  <ConditionTransitionLink
                    key={protocolSlug}
                    condition={goal.slug}
                    ctaRole="supporting"
                    href={`/protocols/${related.slug}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
                    label={`Open ${related.title}`}
                    source="detail_route_map"
                  />
                ) : null;
              })}
          </div>
        </section>

        {/* ---------------- Signature moment 4: evidence ledger ---------------- */}
        <section
          aria-labelledby="vitality-research"
          className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8"
        >
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
            Evidence posture
          </p>
          <h2
            id="vitality-research"
            className="mt-3 text-2xl font-bold tracking-tight text-slate-950 break-words sm:text-3xl"
            style={{ fontFamily: BRAND_DISPLAY_STACK }}
          >
            What the research says
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
            Sorted by newest publication year, then available sample size. These
            are
            {` ${evidenceRecords.length} `}records attached to this goal, read
            as planning context, not as a personal suitability score.
          </p>

          <div className="mt-5 grid gap-3 rounded-[2rem] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
            {[
              {
                title: 'Design first',
                body: 'Check whether a record is an RCT, a meta-analysis, or a review before comparing anything it reports.',
              },
              {
                title: 'Population fit',
                body: 'Compare sample size and participant context against the situation you are actually planning for.',
              },
              {
                title: 'Endpoint limits',
                body: 'Read a result summary as context for planning, not as a severity score, budget result, or personal decision.',
              },
            ].map((item) => (
              <div key={item.title} className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-950 break-words">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 break-words">
                  {item.body}
                </p>
              </div>
            ))}
          </div>

          <VitalityEvidenceLedger records={evidenceRecords} />

          <p className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            Records attached to this goal name{' '}
            <span className="font-semibold text-slate-900">
              {coveredDevices.length > 0
                ? coveredDevices.join(' and ')
                : 'no device'}
            </span>
            .{' '}
            {uncoveredDevices.length > 0
              ? `${uncoveredDevices.join(' and ')} carr${uncoveredDevices.length === 1 ? 'ies' : 'y'} no vitality record here, and the modality explanations above say so in the same words.`
              : 'Every device on this goal has a record here.'}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="supporting"
              href="/research"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
              label="Open research methods"
              source="detail_quality_checklist"
            />
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="supporting"
              href="/research"
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
              label="See every cited record"
              source="detail_route_map"
            />
          </div>

          <p className="mt-4 text-xs leading-relaxed text-slate-500 break-words">
            {disclaimers.research}
          </p>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section
          aria-labelledby="vitality-faq"
          className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 md:p-8"
        >
          <h2
            id="vitality-faq"
            className="text-2xl font-bold tracking-tight text-slate-950 break-words sm:text-3xl"
            style={{ fontFamily: BRAND_DISPLAY_STACK }}
          >
            Frequently asked questions
          </h2>
          <div className="mt-5 grid gap-3">
            {goal.faq.map((faq) => (
              <details
                key={`${goal.slug}-${faq.q}`}
                className="group rounded-[2rem] border border-slate-200 bg-slate-50 p-5"
              >
                <summary className="flex min-h-11 cursor-pointer list-none items-center text-sm font-semibold text-slate-900 marker:hidden break-words hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700">
                  <span className="flex w-full items-start justify-between gap-4 py-2">
                    <span className="break-words">{faq.q}</span>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-cyan-700 transition-transform duration-200 group-open:rotate-45 motion-reduce:transition-none motion-reduce:duration-0"
                    >
                      +
                    </span>
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 break-words">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        {/* ---------------- Next step ---------------- */}
        <section
          aria-labelledby="vitality-next-step"
          className="mt-6 rounded-[2rem] border border-slate-200 bg-[var(--surface-ink)] p-6 text-[var(--color-on-ink)] md:p-8"
        >
          <h2
            id="vitality-next-step"
            className="text-2xl font-bold tracking-tight text-white break-words sm:text-3xl"
            style={{ fontFamily: BRAND_DISPLAY_STACK }}
          >
            Choose the next step that fits your goal
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
            Use the main action for {goal.title.toLowerCase()}, or review the
            related protocol and support options before you decide.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="primary"
              href={primaryAction.href}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition-none hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-ink)]"
              label={primaryAction.label}
            />
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="supporting"
              href={supportingProtocol?.href ?? '/research'}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition-none hover:border-cyan-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-ink)]"
              label={
                supportingProtocol
                  ? `Review ${supportingProtocol.label}`
                  : 'Browse research'
              }
            />
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="fallback"
              href={fallbackAction.href}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 bg-white/[0.06] px-5 text-sm font-semibold text-white transition-none hover:border-cyan-300/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface-ink)]"
              label={fallbackAction.label}
            />
          </div>
        </section>

        <p className="mt-6 rounded-[2rem] border border-slate-200 bg-white px-5 py-4 text-xs leading-relaxed text-slate-500">
          {disclaimers.general}
        </p>
      </div>
    </div>
  );
}
