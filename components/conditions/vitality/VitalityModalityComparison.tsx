'use client';

/**
 * VitalityModalityComparison — the Oxygen / Hydrogen comparison surface.
 *
 * PATTERN CREDIT
 *
 * Re-implemented from the `FacetedFilterAndQueryEngine` reference (B17) in the
 * `extensions-library` toolbox. The property kept from that engine is its
 * counting algebra, not its persistence layer: a facet's own option counts are
 * computed over the items that pass every OTHER facet (OR inside a facet, AND
 * between facets). That is what keeps a count stable when a reader toggles
 * things in a different order, and it is a pure function of
 * `(modalities, selection)`, so there is no state to drift and no effect to
 * sequence.
 *
 * WHAT THIS REPLACES
 *
 * The shared conditions branch renders the same four metrics twice — once as
 * mobile cards and once as a desktop table. Both markups existed only because a
 * table does not reflow. This surface keeps a single set of markup that reflows,
 * and uses the real `relevance`, `sessionTime`, `rentalFrom`, `purchaseFrom`,
 * and `explanation` values from `content/conditions.ts` with nothing added.
 *
 * HONESTY AS THE FEATURE
 *
 * Two of the four modalities on this goal carry a published line saying Hylono
 * holds no record for them. Those lines are surfaced verbatim in the facet
 * rail, on the card, and in the result count, because "we hold no record here"
 * is the most useful thing on a comparison table and hiding it would be the
 * dishonest choice.
 *
 * ACCESSIBILITY
 *
 * Real checkboxes in real fieldsets, a polite live region for the result count,
 * 44px hit areas, and no `truncate` or `line-clamp` anywhere — modality names,
 * window strings, and price strings all wrap.
 */

import Link from 'next/link';
import { useId, useMemo, useState } from 'react';
import type { ConditionModality } from '@/content/conditions';
import { VitalitySpotlightCard } from './VitalitySpotlightCard';
import {
  sessionWindowLowBoundMinutes,
  UNPUBLISHED_PRICE_LABEL,
} from './vitalityPlanning';

export const MODALITY_PRODUCT_HREF: Record<ConditionModality['slug'], string> =
  {
    HBOT: '/product/hbot',
    H2: '/product/hydrogen',
    RLT: '/product/rlt',
    PEMF: '/product/pemf',
  };

export const MODALITY_ACCENT_VAR: Record<ConditionModality['slug'], string> = {
  HBOT: '--accent-oxygen',
  H2: '--accent-hydrogen',
  RLT: '--accent-light',
  PEMF: '--accent-signal',
};

type FacetKey = 'window' | 'price' | 'record';

interface FacetOption {
  readonly id: string;
  readonly label: string;
}

const SHORT_WINDOW_MINUTES = 20;

interface ComparisonModel {
  readonly modality: ConditionModality;
  readonly lowBoundMinutes: number | null;
  readonly pricePublished: boolean;
  readonly recordCount: number;
}

const toModel = (
  modality: ConditionModality,
  recordCountByModality: Readonly<Record<ConditionModality['slug'], number>>
): ComparisonModel => ({
  modality,
  lowBoundMinutes: sessionWindowLowBoundMinutes(modality.sessionTime),
  pricePublished:
    modality.rentalFrom.trim() !== UNPUBLISHED_PRICE_LABEL &&
    modality.purchaseFrom.trim() !== UNPUBLISHED_PRICE_LABEL,
  recordCount: recordCountByModality[modality.slug],
});

const FACET_OPTIONS: Record<FacetKey, readonly FacetOption[]> = {
  window: [
    { id: 'short', label: '20 min or less per session' },
    { id: 'long', label: 'Longer than 20 min per session' },
  ],
  price: [
    { id: 'published', label: 'Rental and purchase figures published' },
    { id: 'unpublished', label: 'Marked to request or verify' },
  ],
  record: [
    { id: 'covered', label: 'Named by a record on this page' },
    { id: 'uncovered', label: 'No record on this page' },
  ],
};

const FACET_LABEL: Record<FacetKey, string> = {
  window: 'Session window',
  price: 'Price published here',
  record: 'Record on this page',
};

const matchesFacet = (
  model: ComparisonModel,
  facet: FacetKey,
  optionId: string
): boolean => {
  if (facet === 'window') {
    if (model.lowBoundMinutes === null) {
      return false;
    }

    return optionId === 'short'
      ? model.lowBoundMinutes <= SHORT_WINDOW_MINUTES
      : model.lowBoundMinutes > SHORT_WINDOW_MINUTES;
  }

  if (facet === 'price') {
    return optionId === 'published'
      ? model.pricePublished
      : !model.pricePublished;
  }

  return optionId === 'covered'
    ? model.recordCount > 0
    : model.recordCount === 0;
};

type Selection = Record<FacetKey, string[]>;

const EMPTY_SELECTION: Selection = { window: [], price: [], record: [] };

const facetKeys: readonly FacetKey[] = ['window', 'price', 'record'];

export function VitalityModalityComparison({
  modalities,
  recordCountByModality,
}: {
  modalities: readonly ConditionModality[];
  recordCountByModality: Readonly<Record<ConditionModality['slug'], number>>;
}) {
  const [selection, setSelection] = useState<Selection>(EMPTY_SELECTION);
  const baseId = useId();

  const models = useMemo(
    () =>
      modalities.map((modality) => toModel(modality, recordCountByModality)),
    [modalities, recordCountByModality]
  );

  const matches = useMemo(
    () =>
      models.filter((model) =>
        facetKeys.every((facet) => {
          const chosen = selection[facet];

          return (
            chosen.length === 0 ||
            chosen.some((optionId) => matchesFacet(model, facet, optionId))
          );
        })
      ),
    [models, selection]
  );

  /**
   * Disjunctive counts. For facet F, count each of F's options over the models
   * that pass every facet other than F. An option whose count is zero is left
   * enabled and labelled, so the reader can see it exists and is empty instead
   * of having it silently disappear.
   */
  const counts = useMemo(() => {
    const table: Record<FacetKey, Record<string, number>> = {
      window: {},
      price: {},
      record: {},
    };

    for (const facet of facetKeys) {
      const others = facetKeys.filter((candidate) => candidate !== facet);
      const pool = models.filter((model) =>
        others.every((candidate) => {
          const chosen = selection[candidate];

          return (
            chosen.length === 0 ||
            chosen.some((optionId) => matchesFacet(model, candidate, optionId))
          );
        })
      );

      for (const option of FACET_OPTIONS[facet]) {
        table[facet][option.id] = pool.filter((model) =>
          matchesFacet(model, facet, option.id)
        ).length;
      }
    }

    return table;
  }, [models, selection]);

  const toggle = (facet: FacetKey, optionId: string) => {
    setSelection((current) => {
      const chosen = current[facet];
      const next = chosen.includes(optionId)
        ? chosen.filter((value) => value !== optionId)
        : [...chosen, optionId];

      return { ...current, [facet]: next };
    });
  };

  const activeFilterCount = facetKeys.reduce(
    (total, facet) => total + selection[facet].length,
    0
  );

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="min-w-0 rounded-[2rem] border border-slate-200 bg-[var(--surface-panel)] p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-bold tracking-tight text-slate-950">
              Narrow the comparison
            </h3>
            {activeFilterCount > 0 ? (
              <button
                type="button"
                onClick={() => setSelection(EMPTY_SELECTION)}
                className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
              >
                Clear {activeFilterCount} filter
                {activeFilterCount === 1 ? '' : 's'}
              </button>
            ) : null}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Each count is the number of modalities left when every other filter
            is applied, so a count never depends on the order you clicked.
          </p>

          {facetKeys.map((facet) => (
            <fieldset key={facet} className="mt-5 border-0 p-0">
              <legend className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {FACET_LABEL[facet]}
              </legend>
              <ul className="mt-2 grid gap-1.5">
                {FACET_OPTIONS[facet].map((option) => {
                  const optionId = `${baseId}-${facet}-${option.id}`;
                  const checked = selection[facet].includes(option.id);
                  const count = counts[facet][option.id] ?? 0;

                  return (
                    <li key={option.id}>
                      <input
                        id={optionId}
                        type="checkbox"
                        className="peer sr-only"
                        checked={checked}
                        onChange={() => toggle(facet, option.id)}
                      />
                      <label
                        htmlFor={optionId}
                        className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-transparent px-3 text-sm text-slate-700 transition-colors duration-200 hover:bg-slate-50 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
                      >
                        <span
                          aria-hidden="true"
                          className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border transition-colors duration-200 ${
                            checked
                              ? 'border-slate-950 bg-slate-950'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {checked ? (
                            <span className="h-1.5 w-1.5 rounded-[2px] bg-white" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1 break-words">
                          {option.label}
                        </span>
                        <span className="shrink-0 text-xs font-mono text-slate-500">
                          {count}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}

          <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
            Red light and PEMF carry a published line on this goal stating
            Hylono holds no record for them. An empty count against the record
            filter is that line, not a rendering fault.
          </p>
        </div>

        <div className="min-w-0">
          <p
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="text-sm font-semibold text-slate-700"
          >
            Showing {matches.length} of {models.length} modalities
          </p>

          {matches.length === 0 ? (
            <p className="mt-4 rounded-[2rem] border border-dashed border-slate-300 bg-white p-6 text-sm leading-relaxed text-slate-600">
              No modality matches every filter at once. Loosen one filter and
              the counts above will show which one is empty.
            </p>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {matches.map((model) => (
                <li key={model.modality.slug} className="min-w-0">
                  <VitalitySpotlightCard
                    accentVar={MODALITY_ACCENT_VAR[model.modality.slug]}
                    className="h-full rounded-[2rem] border border-slate-200 bg-white"
                  >
                    <div className="flex h-full flex-col p-6">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {String(
                          modalities.indexOf(model.modality) + 1
                        ).padStart(2, '0')}{' '}
                        · {model.modality.shortName}
                      </p>
                      <h4 className="mt-2 text-lg font-bold tracking-tight text-slate-950 break-words">
                        {model.modality.name}
                      </h4>

                      <div
                        aria-hidden="true"
                        className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${model.modality.relevance * 20}%`,
                            background: `var(${MODALITY_ACCENT_VAR[model.modality.slug]})`,
                          }}
                        />
                      </div>
                      <p className="mt-2 text-[11px] font-mono text-slate-500">
                        Relevance {model.modality.relevance} of 5 on this goal
                      </p>

                      <dl className="mt-4 grid gap-2 text-sm">
                        {[
                          ['Session window', model.modality.sessionTime],
                          ['Rental from', model.modality.rentalFrom],
                          ['Purchase from', model.modality.purchaseFrom],
                          [
                            'Records on this page',
                            model.recordCount === 0
                              ? 'None named'
                              : `${model.recordCount} named`,
                          ],
                        ].map(([term, value]) => (
                          <div
                            key={term}
                            className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                          >
                            <dt className="text-slate-500">{term}</dt>
                            <dd className="text-right font-medium text-slate-800 break-words">
                              {value}
                            </dd>
                          </div>
                        ))}
                      </dl>

                      <p className="mt-4 text-sm leading-relaxed text-slate-600 break-words">
                        {model.modality.explanation}
                      </p>

                      <Link
                        href={MODALITY_PRODUCT_HREF[model.modality.slug]}
                        className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 pt-2 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-cyan-600 hover:text-cyan-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-700 motion-reduce:transition-none motion-reduce:duration-0"
                      >
                        Open the {model.modality.shortName} device hub
                      </Link>
                    </div>
                  </VitalitySpotlightCard>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
