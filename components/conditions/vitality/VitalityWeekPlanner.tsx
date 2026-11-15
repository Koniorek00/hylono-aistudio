'use client';

/**
 * VitalityWeekPlanner — the High-Demand Week Planner.
 *
 * WHAT IT DOES
 *
 * The reader states three things about their own week: the session-time budget
 * they can give, how many high-demand days they expect to run something on, and
 * how many devices they can physically host. The planner then compares those
 * three numbers against the three real Hylono vitality stacks and reports four
 * planning facts per stack: session-time budget, equipment footprint, whether
 * the price figures are actually published, and how many of the stack's devices
 * are named by a research record attached to this page.
 *
 * WHAT IT DELIBERATELY DOES NOT DO
 *
 * There is no score, no ranking weight, no percentage, and no sentence that
 * predicts what will happen to anyone. Every number it prints is either a figure
 * Hylono publishes (`sessionTime`, `rentalPrice`, `purchasePrice`, the protocol
 * week blocks) or a number the reader just typed. The arithmetic lives in
 * `vitalityPlanning.ts` as pure functions, and the raw published string is always
 * rendered next to the derived figure so the reader can check the sum.
 *
 * ACCESSIBILITY
 *
 * Every control is a real radio inside a real `<fieldset>` with a `<legend>`, so
 * arrow keys, grouping, and screen-reader labels come from the platform instead
 * of from re-implemented key handling. Each hit area is at least 44px. The result
 * summary is a polite live region, so changing a control announces the new plan
 * without moving focus. The only transition is a colour/border change, and it is
 * disabled under `prefers-reduced-motion: reduce`.
 *
 * PERSISTENCE
 *
 * The plan is mirrored into `localStorage` so a reader does not lose their week
 * on reload. Reads happen inside an effect, after hydration, so the server and
 * client markup match on first paint. A private-mode or blocked-storage browser
 * simply keeps the in-memory default; nothing throws and nothing is required to
 * use the planner.
 */

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { ConditionTransitionLink } from '@/components/ConditionTransitionLink';
import type {
  ConditionGoalPage,
  ConditionModality,
  RecommendedStack,
} from '@/content/conditions';
import type { Evidence } from '@/content/evidence';
import type { Protocol } from '@/content/protocols';
import {
  buildVitalityStackPlans,
  DEFAULT_WEEK_PLAN,
  FOOTPRINT_OPTIONS,
  HIGH_DEMAND_DAY_OPTIONS,
  sortVitalityStackPlans,
  UNPUBLISHED_PRICE_LABEL,
  type VitalityStackPlan,
  type VitalityWeekPlan,
  WEEK_BUDGET_OPTIONS,
} from './vitalityPlanning';

const STORAGE_KEY = 'hylono:vitality-week-plan:v1';

/**
 * Tone is carried by a left rule and a chip, never by flooding the card. Two of
 * the three published stacks carry a real mismatch at the default week, and a
 * full-bleed red card for an ordinary scheduling gap read as an error state
 * rather than as a planning fact.
 */
const toneRule: Record<VitalityStackPlan['tone'], string> = {
  clear: 'bg-[var(--accent-hydrogen)]',
  watch: 'bg-amber-600',
  blocked: 'bg-rose-700',
};

const toneChip: Record<VitalityStackPlan['tone'], string> = {
  clear: 'border-teal-800/25 bg-teal-50 text-teal-900',
  watch: 'border-amber-800/30 bg-amber-50 text-amber-900',
  blocked: 'border-rose-900/25 bg-rose-50 text-rose-900',
};

const toneLabel: Record<VitalityStackPlan['tone'], string> = {
  clear: 'Planning figures line up',
  watch: 'Two figures to check',
  blocked: 'One figure does not line up',
};

const lineDot: Record<VitalityStackPlan['lines'][number]['tone'], string> = {
  clear: 'bg-[var(--accent-hydrogen)]',
  watch: 'bg-amber-600',
  blocked: 'bg-rose-700',
};

const isStoredPlan = (value: unknown): value is Partial<VitalityWeekPlan> =>
  typeof value === 'object' && value !== null;

const readStoredPlan = (): VitalityWeekPlan => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return DEFAULT_WEEK_PLAN;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isStoredPlan(parsed)) {
      return DEFAULT_WEEK_PLAN;
    }

    return {
      budgetMinutes: WEEK_BUDGET_OPTIONS.includes(
        parsed.budgetMinutes as (typeof WEEK_BUDGET_OPTIONS)[number]
      )
        ? (parsed.budgetMinutes as number)
        : DEFAULT_WEEK_PLAN.budgetMinutes,
      highDemandDays: HIGH_DEMAND_DAY_OPTIONS.includes(
        parsed.highDemandDays as (typeof HIGH_DEMAND_DAY_OPTIONS)[number]
      )
        ? (parsed.highDemandDays as number)
        : DEFAULT_WEEK_PLAN.highDemandDays,
      footprint: FOOTPRINT_OPTIONS.includes(
        parsed.footprint as (typeof FOOTPRINT_OPTIONS)[number]
      )
        ? (parsed.footprint as number)
        : DEFAULT_WEEK_PLAN.footprint,
    };
  } catch {
    return DEFAULT_WEEK_PLAN;
  }
};

interface VitalityWeekPlannerProps {
  condition: ConditionGoalPage['slug'];
  evidenceRecords: readonly Evidence[];
  modalities: readonly ConditionModality[];
  protocol: Protocol;
  stacks: readonly RecommendedStack[];
}

export function VitalityWeekPlanner({
  condition,
  evidenceRecords,
  modalities,
  protocol,
  stacks,
}: VitalityWeekPlannerProps) {
  const [plan, setPlan] = useState<VitalityWeekPlan>(DEFAULT_WEEK_PLAN);
  const [hydrated, setHydrated] = useState(false);
  const baseId = useId();

  useEffect(() => {
    setPlan(readStoredPlan());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // Storage can be unavailable in private mode. The planner keeps working in memory.
    }
  }, [hydrated, plan]);

  const stackPlans = useMemo(
    () =>
      sortVitalityStackPlans(
        buildVitalityStackPlans({
          evidenceRecords,
          modalities,
          plan,
          protocol,
          stacks,
        })
      ),
    [evidenceRecords, modalities, plan, protocol, stacks]
  );

  const summary = useMemo(
    () =>
      `Plan set to ${plan.budgetMinutes} minutes a week across ${plan.highDemandDays} high-demand ${
        plan.highDemandDays === 1 ? 'day' : 'days'
      }, with room for ${plan.footprint} ${plan.footprint === 1 ? 'device' : 'devices'}. ${stackPlans
        .map(
          (entry) =>
            `${entry.stack.title}: ${toneLabel[entry.tone].toLowerCase()}`
        )
        .join('. ')}.`,
    [plan, stackPlans]
  );

  const update = useCallback(
    <K extends keyof VitalityWeekPlan>(key: K, value: VitalityWeekPlan[K]) => {
      setPlan((current) =>
        current[key] === value ? current : { ...current, [key]: value }
      );
    },
    []
  );

  const publishedStacks = stackPlans.filter(
    (entry) => entry.stack.rentalPrice.trim() !== UNPUBLISHED_PRICE_LABEL
  ).length;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.86fr)_minmax(0,1.14fr)]">
      <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-[var(--surface-panel)] p-6 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-800">
          Your week
        </p>
        <h3
          id={`${baseId}-controls`}
          className="mt-2 text-xl font-bold tracking-tight text-slate-950"
        >
          Set the three numbers you actually control
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Nothing here is measured about your body. These are scheduling and
          room constraints, and the planner only checks them against
          Hylono&apos;s own published session windows, price figures, and record
          coverage.
        </p>

        <fieldset className="mt-6 border-0 p-0">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Session-time budget each week
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {WEEK_BUDGET_OPTIONS.map((minutes) => {
              const optionId = `${baseId}-budget-${minutes}`;
              const active = plan.budgetMinutes === minutes;

              return (
                <div key={minutes} className="relative">
                  <input
                    id={optionId}
                    type="radio"
                    name={`${baseId}-budget`}
                    className="peer sr-only"
                    checked={active}
                    onChange={() => update('budgetMinutes', minutes)}
                  />
                  <label
                    htmlFor={optionId}
                    className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0 ${
                      active
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-600'
                    }`}
                  >
                    {minutes} min
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6 border-0 p-0">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            High-demand days each week
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {HIGH_DEMAND_DAY_OPTIONS.map((days) => {
              const optionId = `${baseId}-days-${days}`;
              const active = plan.highDemandDays === days;

              return (
                <div key={days} className="relative">
                  <input
                    id={optionId}
                    type="radio"
                    name={`${baseId}-days`}
                    className="peer sr-only"
                    checked={active}
                    onChange={() => update('highDemandDays', days)}
                  />
                  <label
                    htmlFor={optionId}
                    className={`inline-flex min-h-11 w-12 cursor-pointer items-center justify-center rounded-lg border text-sm font-semibold transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0 ${
                      active
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-600'
                    }`}
                  >
                    {days}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-6 border-0 p-0">
          <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            Devices you can host at once
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {FOOTPRINT_OPTIONS.map((size) => {
              const optionId = `${baseId}-footprint-${size}`;
              const active = plan.footprint === size;

              return (
                <div key={size} className="relative">
                  <input
                    id={optionId}
                    type="radio"
                    name={`${baseId}-footprint`}
                    className="peer sr-only"
                    checked={active}
                    onChange={() => update('footprint', size)}
                  />
                  <label
                    htmlFor={optionId}
                    className={`inline-flex min-h-11 cursor-pointer items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0 ${
                      active
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-cyan-600'
                    }`}
                  >
                    {size === 1
                      ? 'One device'
                      : size === 2
                        ? 'Two devices'
                        : 'Three devices'}
                  </label>
                </div>
              );
            })}
          </div>
        </fieldset>

        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700"
        >
          {summary}
        </p>

        <button
          type="button"
          onClick={() => setPlan(DEFAULT_WEEK_PLAN)}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
        >
          Reset to the default week
        </button>
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight text-slate-950">
            The three published stacks, checked against that week
          </h3>
          <p className="text-sm text-slate-500">
            {publishedStacks} of {stacks.length} stacks publish both figures
            here
          </p>
        </div>

        <ul className="mt-4 grid gap-4">
          {stackPlans.map((entry) => (
            <li
              key={`${entry.stack.title}-${entry.stack.devices.join('-')}`}
              className="relative rounded-[2rem] border border-slate-200 bg-white p-6 pl-7"
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-6 h-[calc(100%-3rem)] w-1.5 rounded-r-full ${toneRule[entry.tone]}`}
              />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="text-lg font-bold tracking-tight text-slate-950 break-words">
                    {entry.stack.title}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {toneLabel[entry.tone]} for the week you set.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${toneChip[entry.tone]}`}
                  >
                    {entry.tone}
                  </span>
                  {entry.stack.highlighted ? (
                    <span className="rounded-md border border-cyan-800/30 bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-cyan-900">
                      Hylono highlighted
                    </span>
                  ) : null}
                </div>
              </div>

              <dl className="mt-4 grid gap-2.5">
                {entry.lines.map((line) => (
                  <div key={line.id} className="flex gap-2.5">
                    <span
                      aria-hidden="true"
                      className={`mt-[7px] inline-block h-1.5 w-1.5 shrink-0 rounded-full ${lineDot[line.tone]}`}
                    />
                    <div className="min-w-0">
                      <dt className="text-[13px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                        {line.label}
                      </dt>
                      <dd className="mt-0.5 text-sm leading-relaxed text-slate-700 break-words">
                        {line.detail}
                      </dd>
                    </div>
                  </div>
                ))}
              </dl>

              <div className="mt-4 border-t border-slate-200/80 pt-4">
                <p className="text-[11px] font-mono uppercase tracking-[0.14em] text-slate-500">
                  Where the minutes come from
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {entry.load.parts.map((part) => (
                    <li
                      key={part.device}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-700"
                    >
                      {part.device} {part.sessionTime}
                    </li>
                  ))}
                </ul>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 break-words">
                  {entry.load.lowBoundTotalMinutes === null
                    ? 'A published session window on this stack could not be read, so no weekly total is shown.'
                    : `Low bounds only: ${entry.load.lowBoundTotalMinutes} min a session across ${entry.load.parts.length} device${
                        entry.load.parts.length === 1 ? '' : 's'
                      }, multiplied by ${plan.highDemandDays} high-demand ${
                        plan.highDemandDays === 1 ? 'day' : 'days'
                      }. The Vitality Dual Stack protocol publishes ${protocol.timePerDay} a day as its own figure.`}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate-600 break-words">
                  <span className="font-semibold text-slate-700">Rental:</span>{' '}
                  {entry.stack.rentalPrice}
                  {' · '}
                  <span className="font-semibold text-slate-700">
                    Purchase:
                  </span>{' '}
                  {entry.stack.purchasePrice}
                </p>

                <ConditionTransitionLink
                  condition={condition}
                  ctaRole="supporting"
                  href={entry.stack.link}
                  className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
                  label={entry.stack.linkLabel}
                  source="detail_route_map"
                />
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs leading-relaxed text-slate-600">
          Not included on purpose: no numeric score, no ranking weight, and no
          statement about what a stack would do for a person. Stack order
          follows how cleanly the published figures line up with the week you
          set, then the order Hylono publishes them in.
        </p>
      </div>
    </div>
  );
}
