/**
 * Vitality planning model — pure derivations for /conditions/vitality.
 *
 * WHY THIS FILE EXISTS
 *
 * The vitality goal guide is a planning surface, so the only arithmetic it is
 * allowed to perform is arithmetic on numbers Hylono already publishes:
 * `ConditionModality.sessionTime`, `RecommendedStack.rentalPrice` /
 * `purchasePrice`, the `weeks[]` block on the vitality dual-stack protocol, and
 * which of the goal's own `evidenceIds` name a given device.
 *
 * Every function here is deterministic, side-effect free, and returns the
 * inputs it used so the UI can show the derivation next to the result. Nothing
 * here invents a number, scores a person, or models an outcome: a "fit" label
 * in this file means "the published figures and the numbers the reader typed
 * agree", never "this will work for you".
 *
 * The reader's own week is the only input. That is what keeps the planner a
 * planning tool instead of a suitability claim.
 */

import type { ConditionModality, RecommendedStack } from '@/content/conditions';
import type { Evidence } from '@/content/evidence';
import type { Protocol } from '@/content/protocols';

/** Session-time budgets offered to the reader, in minutes per week. */
export const WEEK_BUDGET_OPTIONS = [60, 120, 180, 240, 300, 360, 420] as const;

/** High-demand days offered to the reader, per week. */
export const HIGH_DEMAND_DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7] as const;

/** Equipment footprints offered to the reader. Mirrors the real stack sizes. */
export const FOOTPRINT_OPTIONS = [1, 2, 3] as const;

export const DEFAULT_WEEK_PLAN: VitalityWeekPlan = {
  budgetMinutes: 240,
  highDemandDays: 3,
  footprint: 1,
};

export interface VitalityWeekPlan {
  /** Minutes per week the reader can realistically give to sessions. */
  budgetMinutes: number;
  /** Days per week the reader expects to run something. */
  highDemandDays: number;
  /** How many devices the reader can physically host at once. */
  footprint: number;
}

/**
 * `Request / verify` is the literal Hylono uses for a figure that is not
 * published. It is compared here as a value, never rendered as a price.
 */
export const UNPUBLISHED_PRICE_LABEL = 'Request / verify';

const isPublishedPrice = (value: string): boolean =>
  value.trim() !== UNPUBLISHED_PRICE_LABEL;

/** 'rental' | 'purchase' -> 'Rental and purchase' / 'Rental' / 'Purchase'. */
const sentenceCaseList = (labels: readonly string[]): string => {
  const capitalised = labels.map(
    (label) => label.charAt(0).toUpperCase() + label.slice(1)
  );

  if (capitalised.length === 1) {
    return capitalised[0] ?? '';
  }

  return `${capitalised.slice(0, -1).join(', ')} and ${capitalised[capitalised.length - 1] ?? ''}`;
};

/**
 * Low bound of a published session window, in minutes.
 *
 * `sessionTime` values are publication copy ('45–60 min', '20 min', '5 min
 * prep'). This reads the FIRST whole number out of the string and nothing else,
 * so a value that stops being a window stops producing a number instead of
 * producing a wrong one. The raw string is always shown beside the derived
 * figure so a reader can check the arithmetic.
 */
export const sessionWindowLowBoundMinutes = (
  sessionTime: string
): number | null => {
  const match = sessionTime.match(/\d+/);

  if (!match) {
    return null;
  }

  const value = Number.parseInt(match[0], 10);

  return Number.isFinite(value) ? value : null;
};

/** Low bound of a protocol `timePerDay` window ('60–95 min'). */
export const protocolDayLowBoundMinutes = (timePerDay: string): number | null =>
  sessionWindowLowBoundMinutes(timePerDay);

/** Sum of the published per-device session low bounds in a stack, plus the parts. */
export interface StackSessionLoad {
  /** One `{ device, sessionTime, lowBoundMinutes }` row per device, in stack order. */
  readonly parts: ReadonlyArray<{
    readonly device: string;
    readonly sessionTime: string;
    readonly lowBoundMinutes: number | null;
  }>;
  /** Sum of the parts, or null when any part has no readable window. */
  readonly lowBoundTotalMinutes: number | null;
  /** true when at least one device window could not be read. */
  readonly hasUnreadablePart: boolean;
}

export const buildStackSessionLoad = (
  stack: RecommendedStack,
  modalities: readonly ConditionModality[]
): StackSessionLoad => {
  const parts = stack.devices.map((device) => {
    const modality = modalities.find(
      (candidate) => candidate.shortName === device
    );
    const sessionTime = modality?.sessionTime ?? '';

    return {
      device,
      sessionTime,
      lowBoundMinutes: sessionWindowLowBoundMinutes(sessionTime),
    };
  });

  const readable = parts.filter(
    (
      part
    ): part is (typeof parts)[number] & { readonly lowBoundMinutes: number } =>
      typeof part.lowBoundMinutes === 'number'
  );

  return {
    parts,
    lowBoundTotalMinutes:
      readable.length === parts.length
        ? readable.reduce((total, part) => total + part.lowBoundMinutes, 0)
        : null,
    hasUnreadablePart: readable.length !== parts.length,
  };
};

/**
 * Which modality keys an evidence record can be attached to.
 *
 * `content/evidence.ts` keys records by research modality ('HBOT',
 * 'H2_inhalation', 'H2_water'), while a stack names devices by short name
 * ('HBOT', 'H2', 'RLT', 'PEMF'). Only the keys Hylono actually publishes are
 * listed. RLT and PEMF are deliberately absent: this is the honest statement
 * that no vitality record names them, not an oversight.
 */
const EVIDENCE_MODALITY_KEYS: Record<
  ConditionModality['slug'],
  readonly string[]
> = {
  HBOT: ['HBOT'],
  H2: ['H2_inhalation'],
  RLT: [],
  PEMF: [],
};

export interface DeviceEvidenceCoverage {
  readonly device: string;
  readonly recordIds: readonly string[];
}

/** Which of the goal's own evidence records name each device on this page. */
export const buildDeviceEvidenceCoverage = (
  devices: readonly string[],
  evidenceRecords: readonly Evidence[]
): readonly DeviceEvidenceCoverage[] =>
  devices.map((device) => {
    const keys =
      EVIDENCE_MODALITY_KEYS[device as ConditionModality['slug']] ?? [];
    const recordIds = evidenceRecords
      .filter((record) => record.modalities.some((key) => keys.includes(key)))
      .map((record) => record.id);

    return { device, recordIds };
  });

export type StackVerdictTone = 'clear' | 'watch' | 'blocked';

export interface StackPlanLine {
  readonly id: 'session-time' | 'footprint' | 'price' | 'record-coverage';
  readonly label: string;
  readonly detail: string;
  readonly tone: StackVerdictTone;
}

export interface VitalityStackPlan {
  readonly stack: RecommendedStack;
  readonly load: StackSessionLoad;
  readonly coverage: readonly DeviceEvidenceCoverage[];
  /** Minutes the published per-device low bounds add up to for the reader's week. */
  readonly requiredWeeklyMinutes: number | null;
  readonly surplusMinutes: number | null;
  readonly lines: readonly StackPlanLine[];
  /** Worst tone across all lines. Used only for ordering, never as a score. */
  readonly tone: StackVerdictTone;
}

const toneRank: Record<StackVerdictTone, number> = {
  clear: 0,
  watch: 1,
  blocked: 2,
};

const worstTone = (tones: readonly StackVerdictTone[]): StackVerdictTone =>
  tones.reduce<StackVerdictTone>(
    (worst, tone) => (toneRank[tone] > toneRank[worst] ? tone : worst),
    'clear'
  );

/**
 * The whole planner, as pure data.
 *
 * `protocol` is optional: when the goal's highlighted stack is the dual stack,
 * the protocol's published `timePerDay` is shown next to the derived total as
 * a cross-check, so the reader can see the two figures side by side instead of
 * being asked to trust either.
 */
export const buildVitalityStackPlans = ({
  evidenceRecords,
  modalities,
  plan,
  protocol,
  stacks,
}: {
  evidenceRecords: readonly Evidence[];
  modalities: readonly ConditionModality[];
  plan: VitalityWeekPlan;
  protocol?: Protocol;
  stacks: readonly RecommendedStack[];
}): readonly VitalityStackPlan[] =>
  stacks.map((stack) => {
    const load = buildStackSessionLoad(stack, modalities);
    const coverage = buildDeviceEvidenceCoverage(
      stack.devices,
      evidenceRecords
    );
    const lines: StackPlanLine[] = [];

    const requiredWeeklyMinutes =
      load.lowBoundTotalMinutes === null
        ? null
        : load.lowBoundTotalMinutes * plan.highDemandDays;
    const surplusMinutes =
      requiredWeeklyMinutes === null
        ? null
        : plan.budgetMinutes - requiredWeeklyMinutes;

    if (requiredWeeklyMinutes === null) {
      lines.push({
        id: 'session-time',
        label: 'Session-time budget',
        detail:
          'A published session window for this stack could not be read, so no weekly total is shown.',
        tone: 'watch',
      });
    } else if (surplusMinutes !== null && surplusMinutes >= 0) {
      lines.push({
        id: 'session-time',
        label: 'Session-time budget',
        detail: `${requiredWeeklyMinutes} min a week across ${plan.highDemandDays} high-demand days, ${surplusMinutes} min inside the ${plan.budgetMinutes} min you set.`,
        tone: 'clear',
      });
    } else {
      lines.push({
        id: 'session-time',
        label: 'Session-time budget',
        detail: `${requiredWeeklyMinutes} min a week across ${plan.highDemandDays} high-demand days, ${surplusMinutes === null ? 0 : Math.abs(surplusMinutes)} min over the ${plan.budgetMinutes} min you set.`,
        tone: 'blocked',
      });
    }

    lines.push({
      id: 'footprint',
      label: 'Equipment footprint',
      detail:
        stack.devices.length <= plan.footprint
          ? `${stack.devices.length} device${stack.devices.length === 1 ? '' : 's'} on this stack; you indicated room for ${plan.footprint}.`
          : `${stack.devices.length} devices on this stack; you indicated room for ${plan.footprint}.`,
      tone: stack.devices.length <= plan.footprint ? 'clear' : 'blocked',
    });

    const unpublishedLines = [
      isPublishedPrice(stack.rentalPrice) ? null : 'rental',
      isPublishedPrice(stack.purchasePrice) ? null : 'purchase',
    ].filter((value): value is string => value !== null);

    lines.push({
      id: 'price',
      label: 'Published figures',
      detail:
        unpublishedLines.length === 0
          ? `Rental ${stack.rentalPrice}; purchase ${stack.purchasePrice}.`
          : `${sentenceCaseList(unpublishedLines)} figure${unpublishedLines.length === 1 ? ' is' : 's are'} published as "${UNPUBLISHED_PRICE_LABEL}" on this page, so no comparison is made.`,
      tone: unpublishedLines.length === 0 ? 'clear' : 'watch',
    });

    const covered = coverage.filter(
      (entry) => entry.recordIds.length > 0
    ).length;
    lines.push({
      id: 'record-coverage',
      label: 'Records on this page',
      detail:
        covered === coverage.length
          ? `All ${coverage.length} device${coverage.length === 1 ? '' : 's'} on this stack ${coverage.length === 1 ? 'is' : 'are'} named by a record attached to this page.`
          : `${covered} of ${coverage.length} devices on this stack ${covered === 1 ? 'is' : 'are'} named by a record attached to this page. The rest carry no vitality record here.`,
      tone: covered === coverage.length ? 'clear' : 'watch',
    });

    return {
      stack,
      load,
      coverage,
      requiredWeeklyMinutes,
      surplusMinutes,
      lines,
      tone: worstTone(lines.map((line) => line.tone)),
    };
  });

/** Stable ordering: clearest planning fit first, then the real record order. */
export const sortVitalityStackPlans = (
  plans: readonly VitalityStackPlan[]
): readonly VitalityStackPlan[] =>
  plans
    .map((plan, index) => ({ plan, index }))
    .sort(
      (a, b) =>
        toneRank[a.plan.tone] - toneRank[b.plan.tone] || a.index - b.index
    )
    .map((entry) => entry.plan);

/** Published protocol cross-check for the dual stack, when one is attached. */
export interface ProtocolCrossCheck {
  readonly protocolTitle: string;
  readonly publishedTimePerDay: string;
  readonly lowBoundMinutes: number | null;
  readonly publishedWeeks: number;
  readonly detailedWeeks: readonly number[];
}

export const buildProtocolCrossCheck = (
  protocol: Protocol
): ProtocolCrossCheck => ({
  protocolTitle: protocol.title,
  publishedTimePerDay: protocol.timePerDay,
  lowBoundMinutes: protocolDayLowBoundMinutes(protocol.timePerDay),
  publishedWeeks: protocol.durationWeeks,
  detailedWeeks: protocol.weeks.map((week) => week.number),
});

/** Total published minutes inside one protocol week block. */
export const protocolWeekMinutes = (week: Protocol['weeks'][number]): number =>
  week.days.reduce(
    (dayTotal, day) =>
      dayTotal +
      day.sessions.reduce(
        (sessionTotal, session) =>
          sessionTotal + (sessionWindowLowBoundMinutes(session.duration) ?? 0),
        0
      ),
    0
  );

/** Longest published week total, used to scale the anatomy bars deterministically. */
export const longestProtocolWeekMinutes = (protocol: Protocol): number =>
  protocol.weeks.reduce(
    (longest, week) => Math.max(longest, protocolWeekMinutes(week)),
    0
  );
