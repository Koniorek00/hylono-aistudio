import type { ConditionGoalPage } from '@/content/conditions';
import { conditionGoalBySlug } from '@/content/conditions';
import { ConditionTransitionLink } from '@/components/ConditionTransitionLink';
import { disclaimers } from '@/content/disclaimers';
import { evidenceById } from '@/content/evidence';
import { toProtocolCardView } from '@/content/protocolView';
import { ConditionDetailShell, getConditionDetailJourney } from './ConditionDetailShell';
import { ConditionRoutineDecisionFrame } from './ConditionRoutineDecisionFrame';
import { SleepSanctuaryContent } from './conditions/SleepSanctuaryContent';
import { StressSanctuaryContent } from './conditions/StressSanctuaryContent';
import { VitalitySanctuaryContent } from './conditions/VitalitySanctuaryContent';
import { ProtocolCard } from './protocols/ProtocolCard';

const modalityProductHref = {
  HBOT: '/product/hbot',
  H2: '/product/hydrogen',
  RLT: '/product/rlt',
  PEMF: '/product/pemf',
} as const;

function RelevanceDots({ score }: { score: number }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-slate-500"
      aria-label={`Relevance ${score} out of 5`}
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <span
          key={`dot-${index}`}
          className={`h-2.5 w-2.5 rounded-sm ${
            index < score ? 'bg-cyan-500' : 'bg-slate-200'
          }`}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function ConditionDetailPageContent({
  slug,
}: {
  slug: ConditionGoalPage['slug'];
}) {
  const goal = conditionGoalBySlug[slug];

  if (!goal) {
    return null;
  }

  // Sleep renders the flagship sanctuary experience. Metadata, JSON-LD, and SERP
  // description logic stay in condition-detail-page.tsx and are untouched.
  if (slug === 'sleep') {
    return <SleepSanctuaryContent slug={slug} />;
  }

  // Stress is hydrogen-led, so it gets its own sanctuary layout. This is a superset
  // of the generic branch below: it keeps the #condition-intro contract, the
  // PageOwnership block, the "Best next steps for stress" route-map aside, the
  // "Recommended stacks" section, the "What the research says" section, the lower
  // fallback next-step block, and every ConditionTransitionLink analytics source.
  if (slug === 'stress') {
    return <StressSanctuaryContent slug={slug} />;
  }

  // Vitality is the dual-modality planning goal, so it takes the same sanctioned
  // per-condition branch: a High-Demand Week Planner, one single-markup modality
  // comparison, a vitality-dual-stack protocol anatomy, and a server-rendered
  // evidence ledger. Metadata, JSON-LD, and the SERP description stay in
  // condition-detail-page.tsx, and every shared contract below is preserved:
  // the #condition-intro speakable anchor, the PageOwnership block, the "Best next
  // steps for vitality" route map, the "What the research says" section in
  // recency order, the lower three-CTA next-step block, and the analytics sources
  // on every ConditionTransitionLink.
  if (slug === 'vitality') {
    return <VitalitySanctuaryContent slug={slug} />;
  }

  const protocolCards = goal.protocolSlugs
    .map((protocolSlug) => toProtocolCardView(protocolSlug))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const evidenceRecords = goal.evidenceIds
    .map((evidenceId) => evidenceById[evidenceId])
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      const sampleSizeDelta = (b.sampleSize ?? -1) - (a.sampleSize ?? -1);
      if (sampleSizeDelta !== 0) return sampleSizeDelta;
      return a.title.localeCompare(b.title);
    });
  const { primaryAction, supportingProtocol } = getConditionDetailJourney(goal);
  const fallbackAction =
    primaryAction.href === '/rental'
      ? { href: '/contact', label: 'Book a consultation' }
      : { href: '/rental', label: 'Explore rentals' };
  const conditionDecisionForks = [
    {
      title: 'Evidence first',
      body: 'Start here when the cited research context should come before product, protocol, or access planning.',
      href: '/research',
      label: 'Review evidence',
      ctaRole: 'supporting',
    },
    {
      title: 'Rental fit',
      body: 'Use this path when setup friction, routine follow-through, or ownership timing needs a lower-commitment check.',
      href: '/rental',
      label: 'Check rental fit',
      ctaRole: 'fallback',
    },
    {
      title: 'Human review',
      body: 'Use direct support when the condition goal needs practical narrowing before choosing a device, protocol, or stack.',
      href: '/contact',
      label: 'Ask Hylono',
      ctaRole: 'primary',
    },
  ] as const;
  const studyQualityChecklist = [
    {
      title: 'Study design',
      body: 'Check whether the card is an RCT, meta-analysis, review, or another evidence type before comparing outcomes.',
    },
    {
      title: 'Population fit',
      body: 'Compare sample size, participant context, and whether the study population matches the goal you are exploring.',
    },
    {
      title: 'Endpoint limits',
      body: 'Read result summaries as context for planning, not as a severity score, budget result, or personal suitability decision.',
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[var(--surface-page)] pt-24 pb-16 text-slate-950">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <ConditionDetailShell goal={goal} />

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            {goal.description.map((paragraph) => (
              <p key={`${goal.slug}-${paragraph}`}>{paragraph}</p>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Static decision support
          </p>
          <h2 className="mt-2 text-xl font-bold text-slate-950 break-words">Condition decision forks</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 break-words">
            Pick the safest next reading path for {goal.title.toLowerCase()}. These forks are a
            static routing aid, not a severity assessment, budget calculator, personalized
            recommendation, or professional care plan.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {conditionDecisionForks.map((fork) => (
              <article key={`${goal.slug}-${fork.title}`} className="rounded-lg border border-slate-200 bg-slate-50 p-4 min-w-0 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-950 break-words">{fork.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 break-words">{fork.body}</p>
                </div>
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole={fork.ctaRole}
                  href={fork.href}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-800 hover:bg-cyan-100 break-words"
                  label={fork.label}
                  source="detail_decision_fork"
                />
              </article>
            ))}
          </div>
        </section>

        {goal.slug === 'recovery' || goal.slug === 'sleep' ? (
          <ConditionRoutineDecisionFrame condition={goal.slug} />
        ) : null}

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(280px,1.18fr)]">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
                Technology fit
              </p>
              <h2 className="mt-3 text-xl font-bold text-slate-950 break-words">Recommended technologies</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 break-words">
                Compare the modalities attached to this goal before moving to product, protocol, or
                rental next steps.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 sm:grid-cols-4">
                {goal.modalities.map((modality, index) => (
                  <div
                    key={`modality-index-${goal.slug}-${modality.slug}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 min-w-0"
                  >
                    <span className="block text-lg font-black leading-none text-cyan-700">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="mt-2 block leading-5 break-words">{modality.shortName}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 min-w-0">
            {goal.modalities.map((modality) => (
              <article
                key={`${goal.slug}-${modality.slug}`}
                className="group relative min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all duration-300 hover:border-cyan-300 hover:bg-cyan-50/70 motion-reduce:transition-none"
              >
                <span
                  aria-hidden="true"
                  className="absolute -right-3 -top-6 text-7xl font-black leading-none text-cyan-200/30 pointer-events-none select-none overflow-hidden max-w-full transition-colors group-hover:text-cyan-200/50 motion-reduce:transition-none"
                >
                  {modality.shortName}
                </span>
                <div className="relative flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700">
                      Modality fit
                    </p>
                    <h3 className="mt-2 font-semibold text-slate-950 break-words">{modality.name}</h3>
                  </div>
                  <RelevanceDots score={modality.relevance} />
                </div>
                <p className="relative mt-3 text-sm leading-6 text-slate-600 break-words">
                  {modality.explanation}
                </p>
                <div className="relative mt-4 h-2 overflow-hidden rounded-lg bg-slate-200">
                  <div
                    className="h-full rounded-lg bg-cyan-500"
                    style={{ width: `${modality.relevance * 20}%` }}
                  />
                </div>
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href={modalityProductHref[modality.slug]}
                  className="relative mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 shadow-2xs transition-colors duration-200 hover:border-cyan-400 hover:text-cyan-700 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600 motion-reduce:transition-none"
                  label="View devices ->"
                  source="detail_route_map"
                />
              </article>
            ))}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 break-words">
            Technology comparison for this goal
          </h2>
          <div className="mt-4 grid gap-3 md:hidden">
            {goal.modalities.map((modality) => (
              <article
                key={`mobile-compare-${goal.slug}-${modality.slug}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 min-w-0"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-slate-950 break-words">{modality.shortName}</h3>
                  <RelevanceDots score={modality.relevance} />
                </div>
                <dl className="mt-3 grid gap-2 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Session time</dt>
                    <dd className="text-right font-medium text-slate-800 break-words">{modality.sessionTime}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Rental from</dt>
                    <dd className="text-right font-medium text-slate-800 break-words">{modality.rentalFrom}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Purchase from</dt>
                    <dd className="text-right font-medium text-slate-800 break-words">{modality.purchaseFrom}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
          <div className="mt-4 hidden w-full overflow-x-auto md:block">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-3">Metric</th>
                  {goal.modalities.map((modality) => (
                    <th key={`head-${goal.slug}-${modality.slug}`} className="py-2 pr-3">
                      {modality.shortName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-slate-600">
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-3 font-medium">Relevance</td>
                  {goal.modalities.map((modality) => (
                    <td key={`rel-${goal.slug}-${modality.slug}`} className="py-2 pr-3">
                      <RelevanceDots score={modality.relevance} />
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-3 font-medium">Session time</td>
                  {goal.modalities.map((modality) => (
                    <td key={`time-${goal.slug}-${modality.slug}`} className="py-2 pr-3">
                      {modality.sessionTime}
                    </td>
                  ))}
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="py-2 pr-3 font-medium">Rental from</td>
                  {goal.modalities.map((modality) => (
                    <td key={`rent-${goal.slug}-${modality.slug}`} className="py-2 pr-3">
                      {modality.rentalFrom}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="py-2 pr-3 font-medium">Purchase from</td>
                  {goal.modalities.map((modality) => (
                    <td key={`buy-${goal.slug}-${modality.slug}`} className="py-2 pr-3">
                      {modality.purchaseFrom}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 break-words">Protocols</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {protocolCards.map((protocolCard) => (
              <div key={`${goal.slug}-${protocolCard.slug}`} className="min-w-0">
                <ProtocolCard
                  protocol={protocolCard}
                  href={`/protocols/${protocolCard.slug}`}
                  compact
                  variant="light"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 break-words">Recommended stacks</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {goal.stacks.map((stack) => (
              <article
                key={`${goal.slug}-${stack.title}`}
                className={`rounded-lg border p-4 sm:p-5 min-w-0 flex flex-col justify-between ${
                  stack.highlighted ? 'border-cyan-300 bg-cyan-50/80 shadow-sm' : 'border-slate-200 bg-slate-50'
                }`}
              >
                <div>
                  {stack.highlighted && (
                    <span className="inline-block mb-2 rounded-md bg-cyan-100 border border-cyan-300 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-900">
                      Recommended Stack
                    </span>
                  )}
                  <h3 className="font-semibold text-slate-950 break-words">{stack.title}</h3>
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-700">Devices:</span>
                    {stack.devices.map((device) => (
                      <span key={device} className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium">
                        {device}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1 text-sm text-slate-600">
                    <p className="break-words"><span className="text-slate-500">Rental:</span> {stack.rentalPrice}</p>
                    <p className="break-words"><span className="text-slate-500">Purchase:</span> {stack.purchasePrice}</p>
                  </div>
                </div>
                <ConditionTransitionLink
                  condition={goal.slug}
                  ctaRole="supporting"
                  href={stack.link}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-200 bg-white px-4 text-sm font-semibold text-cyan-800 hover:bg-cyan-50 break-words"
                  label={stack.linkLabel}
                  source="detail_route_map"
                />
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 break-words">What the research says</h2>
          <p className="mt-2 text-sm text-slate-600 break-words leading-relaxed">
            Sorted by newest publication year, then available sample size. Use these cards to
            compare context, not as a personal suitability score.
          </p>
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                  Study quality checklist
                </p>
                <h3 className="mt-2 text-base font-bold text-slate-950 break-words">
                  Check study quality before applying the evidence
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 break-words">
                  Use this static checklist before reading the cards below. It is not an interactive
                  study-quality filter, severity assessment, budget calculator, numeric evidence score,
                  or personalized recommendation.
                </p>
              </div>
              <ConditionTransitionLink
                condition={goal.slug}
                ctaRole="supporting"
                href="/research"
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-800 hover:bg-cyan-100"
                label="Open research methods"
                source="detail_quality_checklist"
              />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {studyQualityChecklist.map((item) => (
                <article key={`${goal.slug}-${item.title}`} className="rounded-lg border border-slate-200 bg-white p-4 min-w-0">
                  <h4 className="text-sm font-semibold text-slate-950 break-words">{item.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600 break-words">{item.body}</p>
                </article>
              ))}
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {evidenceRecords.map((evidence) => {
              return (
                <article
                  key={`${goal.slug}-${evidence.id}`}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-lg border border-slate-200/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-500/30 hover:shadow-[0_8px_30px_rgb(6,182,212,0.1)] min-w-0"
                >
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-cyan-500/0 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-10" aria-hidden />
                  <div>
                    <h3
                      className="text-base font-semibold text-slate-900 tracking-tight leading-snug break-words"
                      style={{ fontFamily: 'var(--font-sans), sans-serif' }}
                    >
                      {evidence.title}
                    </h3>
                    <p className="mt-2 text-xs text-slate-500 font-medium">
                      {evidence.publication} - {evidence.year}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                      <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1">
                        <span className="mr-1.5 h-1.5 w-1.5 rounded-sm bg-cyan-500"></span>
                        Evidence type: {evidence.studyType}
                      </span>
                      {evidence.sampleSize ? (
                        <span className="inline-flex items-center rounded-md border border-slate-200/80 bg-slate-50 px-2.5 py-1">
                          Sample size: {evidence.sampleSize}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <p className="text-sm leading-relaxed text-slate-600 break-words">{evidence.resultSummary}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <ConditionTransitionLink
            condition={goal.slug}
            ctaRole="supporting"
            href="/research"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-800 hover:bg-cyan-100"
            label="More research ->"
            source="detail_route_map"
          />
        </section>

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 break-words">Frequently asked questions</h2>
          <div className="mt-4 space-y-3">
            {goal.faq.map((faq) => (
              <details
                key={`${goal.slug}-${faq.q}`}
                className="rounded-lg border border-slate-200 bg-slate-50 p-4 min-w-0"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-slate-900 hover:text-cyan-800 break-words">
                  {faq.q}
                </summary>
                <p className="mt-2 text-sm text-slate-600 break-words leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200/80 bg-white p-6 md:p-8 shadow-xs">
          <h2 className="text-xl font-bold text-slate-950 break-words">Choose the next step that fits your goal</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 break-words">
            Use the main action for {goal.title.toLowerCase()}, or review the related protocol and
            support options before you decide.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="primary"
              href={primaryAction.href}
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 shadow-sm"
              label={primaryAction.label}
            />
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="supporting"
              href={supportingProtocol?.href ?? '/research'}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              label={supportingProtocol ? `Review ${supportingProtocol.label}` : 'Browse research'}
            />
            <ConditionTransitionLink
              condition={goal.slug}
              ctaRole="fallback"
              href={fallbackAction.href}
              className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              label={fallbackAction.label}
            />
          </div>
        </section>

        <p className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-500">
          {disclaimers.general}
        </p>
      </div>
    </div>
  );
}
