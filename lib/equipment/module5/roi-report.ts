/**
 * [DECISION: 2026-10-15] Moduł 5 — raport obserwacji (ROI dla użytkownika).
 *
 * CZEGO TEN PLIK NIE ROBI, bo to granica uczciwości:
 * 1. Nie liczy wyników testów ani przedziałów dla wyniku. Kanon
 *    (`00-VALUE-HIERARCHY.md`) zabrania zmyślonych badań, a w tym repo nie
 *    ma publikacji, która podpierałaby taki rachunek dla tej bazy klientów.
 * 2. Nie nazywa różnicy między dwiema grupami dni przyczyną. Raport
 *    pokazuje obie średnie, liczności i różnicę obserwowaną, oraz jawne
 *    zastrzeżenie. Nie ma pola, które mogłoby zostać odczytane jako
 *    „protokół zadziałał”.
 * 3. Nie zamienia braku odczytu na zero. Brak odczytu to `null` i tyle —
 *    opaska leży w szufladzie, a nie „opaska dała zero głębokiego snu".
 * 4. Nie raportuje na danych syntetycznych bez jawnego zgody wywołującego.
 *
 * Funkcje są czyste: brak IO, brak zegara, brak sieci. `now` podaje caller.
 */

import { assertIsoDay } from './provider-contracts';
import type { BiometricDay } from './provider-contracts';

/** Sesja z terminarza. `startedAt` w czasie lokalnym obiektu. */
export type SessionRecord = {
  readonly startedAt: string;
  readonly completed: boolean;
};

/** Raport powstaje po 5. i po 10. sesji. */
export const REPORT_TRIGGERS = [5, 10] as const;
export type ReportTrigger = (typeof REPORT_TRIGGERS)[number];

/**
 * Próg odmowy wnioskowania, nie próg uznania. Poniżej 5 dni z odczytem w
 * grupie średnia jest niesumowalna: jedna źle przespana noc potrafi
 * przesunąć ją o kilkanaście minut. Wtedy raport NIE liczy różnicy —
 * zwraca `null` i powód, zamiast drukować liczbę wyglądającą na wynik.
 */
export const MIN_SAMPLE_PER_GROUP = 5;

export type MetricId = 'deep_sleep_minutes' | 'hrv_rmssd_ms';

export type ObservedDirection =
  | 'observed_higher_on_protocol_days'
  | 'observed_lower_on_protocol_days'
  | 'no_observed_difference'
  | 'not_computed';

export type GroupSummary = {
  /** Dni w grupie (także bez odczytu). */
  readonly days: number;
  /** Dni z odczytem — to jest liczność, na której opiera się średnia. */
  readonly n: number;
  readonly missingReadings: number;
  readonly total: number | null;
  readonly mean: number | null;
};

export type MetricObservation = {
  readonly metric: MetricId;
  readonly unit: 'min' | 'ms';
  readonly protocolDays: GroupSummary;
  readonly otherDays: GroupSummary;
  /** Średnia dni protokołu minus średnia dni bez sesji. `null` gdy liczność za mała. */
  readonly observedDifference: number | null;
  readonly direction: ObservedDirection;
  /** Stała etykieta. Nie ma trybu, w którym ta obserwacja jest wnioskiem. */
  readonly interpretation: 'observed_difference_only' | 'not_computed';
  readonly insufficientEvidence: boolean;
  readonly reason: string | null;
};

export type InsufficientReason =
  | 'pending_trigger'
  | 'no_biometric_days'
  | 'group_below_min_sample'
  | 'synthetic_data';

export type RoiReport = {
  readonly triggerAfterSession: ReportTrigger;
  readonly completedSessionCount: number;
  readonly reportDue: boolean;
  readonly insufficientEvidence: boolean;
  readonly reasons: readonly InsufficientReason[];
  readonly window: {
    readonly fromIso: string | null;
    readonly toIso: string | null;
    readonly calendarDays: number;
  };
  /** Surowe liczby — panel nie zrenderuje wniosku, którego danych nie ma. */
  readonly counts: {
    readonly biometricRows: number;
    readonly duplicateDays: number;
    readonly protocolDays: number;
    readonly otherDays: number;
    readonly protocolDaysWithoutData: number;
  };
  readonly metrics: readonly MetricObservation[];
  readonly caveats: readonly string[];
  readonly textLines: readonly string[];
  readonly dataProvenance: 'measured' | 'synthetic_fixture';
};

export type ComputeRoiReportInput = {
  readonly sessions: readonly SessionRecord[];
  readonly biometricDays: readonly BiometricDay[];
  readonly triggerAfterSession: ReportTrigger;
  /** Dane syntetyczne domyślnie nie raportujemy. Caller musi potwierdzić. */
  readonly syntheticData?: boolean;
};

const NON_CAUSAL_CAVEAT =
  'Uwaga: to obserwacja z danych, nie wniosek o przyczynie. Różnica między dwiema grupami dni nie mówi, co ją wywołało.';

const PURPOSE_LINE =
  'Cel raportu: obserwacja regeneracji i wsparcie rutyny użytkownika. To nie jest ocena zdrowia.';

const SYNTHETIC_CAVEAT =
  'Uwaga: dane syntetyczne z dostawcy testowego. Ten wynik nie dotyczy użytkownika.';

export function completedSessionCount(sessions: readonly SessionRecord[]): number {
  return sessions.reduce((total, session) => (session.completed ? total + 1 : total), 0);
}

/** Czy po tej liczbie ukończonych sesji raport jest należny. */
export function reportDueAfterSession(
  completed: number,
  triggerAfterSession: ReportTrigger,
): boolean {
  return completed >= triggerAfterSession;
}

/** Kalendarzowa data z czasu sesji. Bez przesuwania stref czasowej. */
function dayOfInstant(isoInstant: string): string {
  const trimmed = isoInstant.trim();
  if (trimmed.length < 10) {
    throw new RangeError(`startedAt musi zawierać datę, otrzymano: ${trimmed}`);
  }
  return assertIsoDay(trimmed.slice(0, 10), 'startedAt');
}

type MergedDay = {
  readonly day: string;
  readonly deepSleepMinutes: number | null;
  readonly hrvRmssdMs: number | null;
  readonly rows: number;
};

function meanOrNull(values: readonly number[]): number | null {
  if (values.length === 0) {
    return null;
  }
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}

/**
 * Dwa dostawcy mogą przysłać ten sam dzień. Średniujemy odczyty i jawnie
 * liczymy duplikaty — ciche wybranie jednego z dwóch plików byłoby
 * wyborem danych bez śladu.
 */
function mergeDays(rows: readonly BiometricDay[]): {
  readonly merged: readonly MergedDay[];
  readonly duplicateDays: number;
} {
  const byDay = new Map<string, { deep: number[]; hrv: number[]; rows: number }>();
  for (const row of rows) {
    const day = assertIsoDay(row.day, 'day');
    const entry = byDay.get(day) ?? { deep: [], hrv: [], rows: 0 };
    if (row.deepSleepMinutes !== null) entry.deep.push(row.deepSleepMinutes);
    if (row.hrvRmssdMs !== null) entry.hrv.push(row.hrvRmssdMs);
    entry.rows += 1;
    byDay.set(day, entry);
  }
  const merged = [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .map(([day, entry]) => ({
      day,
      deepSleepMinutes: meanOrNull(entry.deep),
      hrvRmssdMs: meanOrNull(entry.hrv),
      rows: entry.rows,
    }));
  const duplicateDays = merged.filter((row) => row.rows > 1).length;
  return { merged, duplicateDays };
}

function summarise(
  days: readonly MergedDay[],
  pick: (day: MergedDay) => number | null,
): GroupSummary {
  const values: number[] = [];
  for (const day of days) {
    const value = pick(day);
    if (value !== null) {
      values.push(value);
    }
  }
  const total = values.length > 0 ? values.reduce((sum, value) => sum + value, 0) : null;
  return {
    days: days.length,
    n: values.length,
    missingReadings: days.length - values.length,
    total,
    mean: total === null ? null : total / values.length,
  };
}

function observe(
  metric: MetricId,
  unit: 'min' | 'ms',
  protocolDays: readonly MergedDay[],
  otherDays: readonly MergedDay[],
  pick: (day: MergedDay) => number | null,
): MetricObservation {
  const protocol = summarise(protocolDays, pick);
  const other = summarise(otherDays, pick);
  const thinProtocol = protocol.n < MIN_SAMPLE_PER_GROUP;
  const thinOther = other.n < MIN_SAMPLE_PER_GROUP;

  if (thinProtocol || thinOther) {
    const which = thinProtocol ? 'dni protokołu' : 'dni bez sesji';
    const count = thinProtocol ? protocol.n : other.n;
    return {
      metric,
      unit,
      protocolDays: protocol,
      otherDays: other,
      observedDifference: null,
      direction: 'not_computed',
      interpretation: 'not_computed',
      insufficientEvidence: true,
      reason: `mało odczytów: ${which} n=${String(count)}, minimum ${String(MIN_SAMPLE_PER_GROUP)}`,
    };
  }

  const difference = (protocol.mean ?? 0) - (other.mean ?? 0);
  const direction: ObservedDirection =
    difference > 0
      ? 'observed_higher_on_protocol_days'
      : difference < 0
        ? 'observed_lower_on_protocol_days'
        : 'no_observed_difference';

  return {
    metric,
    unit,
    protocolDays: protocol,
    otherDays: other,
    observedDifference: difference,
    direction,
    interpretation: 'observed_difference_only',
    insufficientEvidence: false,
    reason: null,
  };
}

const MS_PER_DAY = 86_400_000;

function calendarDays(fromIso: string, toIso: string): number {
  const from = Date.parse(`${fromIso}T00:00:00.000Z`);
  const to = Date.parse(`${toIso}T00:00:00.000Z`);
  return Math.floor((to - from) / MS_PER_DAY) + 1;
}

/** Przecinek dziesiętny, liczba bez miejsc tysięcy. */
function decimal(value: number, digits: number): string {
  return value.toFixed(digits).replace('.', ',');
}

function pluralDays(count: number): string {
  return count === 1 ? '1 dzień' : `${String(count)} dni`;
}

function signed(value: number, digits: number): string {
  return `${value > 0 ? '+' : ''}${decimal(value, digits)}`;
}

function metricLine(metric: MetricObservation): string {
  const label = metric.metric === 'deep_sleep_minutes' ? 'Sen głęboki' : 'HRV (RMSSD)';
  const protocolMean = decimal(metric.protocolDays.mean ?? 0, 1);
  const otherMean = decimal(metric.otherDays.mean ?? 0, 1);
  const head =
    `${label} — dni protokołu ${protocolMean} ${metric.unit} (n=${String(metric.protocolDays.n)}), ` +
    `dni bez sesji ${otherMean} ${metric.unit} (n=${String(metric.otherDays.n)})`;

  if (metric.observedDifference === null) {
    return `${head}. Różnica nie jest liczona: ${metric.reason ?? 'mało danych'}.`;
  }
  const missingCount =
    metric.protocolDays.missingReadings + metric.otherDays.missingReadings;
  const missing =
    missingCount > 0 ? ` Bez odczytu pominięto: ${pluralDays(missingCount)}.` : '';
  return `${head}, różnica obserwowana ${signed(metric.observedDifference, 1)} ${metric.unit}.${missing}`;
}

/**
 * Raport obserwacji. Porównuje dni z ukończoną sesją (dni protokołu) z dniami
 * bez sesji w tym samym oknie. Zwraca surowe liczby i gotowe linie tekstu;
 * panel nie musi niczego wyliczać sam.
 */
export function computeRoiReport(input: ComputeRoiReportInput): RoiReport {
  const syntheticData = input.syntheticData === true;
  const completed = completedSessionCount(input.sessions);
  const reportDue = reportDueAfterSession(completed, input.triggerAfterSession);

  const { merged, duplicateDays } = mergeDays(input.biometricDays);

  const protocolDayKeys = new Set<string>();
  for (const session of input.sessions) {
    if (session.completed) {
      protocolDayKeys.add(dayOfInstant(session.startedAt));
    }
  }

  const protocolDays = merged.filter((day) => protocolDayKeys.has(day.day));
  const otherDays = merged.filter((day) => !protocolDayKeys.has(day.day));
  const protocolDaysWithoutData = [...protocolDayKeys].filter(
    (key) => !merged.some((day) => day.day === key),
  ).length;

  const fromIso = merged.length > 0 ? (merged[0]?.day ?? null) : null;
  const toIso = merged.length > 0 ? (merged[merged.length - 1]?.day ?? null) : null;

  const reasons: InsufficientReason[] = [];
  if (!reportDue) {
    reasons.push('pending_trigger');
  }
  if (syntheticData) {
    reasons.push('synthetic_data');
  }
  if (merged.length === 0) {
    reasons.push('no_biometric_days');
  }

  const metrics: readonly MetricObservation[] =
    reportDue && merged.length > 0
      ? [
          observe(
            'deep_sleep_minutes',
            'min',
            protocolDays,
            otherDays,
            (day) => day.deepSleepMinutes,
          ),
          observe('hrv_rmssd_ms', 'ms', protocolDays, otherDays, (day) => day.hrvRmssdMs),
        ]
      : [];

  const thinMetric = metrics.find((metric) => metric.insufficientEvidence);
  if (thinMetric !== undefined && !reasons.includes('group_below_min_sample')) {
    reasons.push('group_below_min_sample');
  }

  const caveats = syntheticData ? [SYNTHETIC_CAVEAT, NON_CAUSAL_CAVEAT] : [NON_CAUSAL_CAVEAT];

  const textLines: string[] = [];
  textLines.push('Raport obserwacji — Moduł 5');
  textLines.push(
    reportDue
      ? `Raport po ${String(input.triggerAfterSession)}. sesji. Sesji ukończonych: ${String(completed)}.`
      : `Raport po ${String(input.triggerAfterSession)}. sesji jeszcze nie. Sesji ukończonych: ${String(completed)}.`,
  );
  textLines.push(
    fromIso !== null && toIso !== null
      ? `Okno porównania: ${fromIso} → ${toIso} (${String(calendarDays(fromIso, toIso))} dni).`
      : 'Okno porównania: brak danych z opaski.',
  );
  textLines.push(
    `Dni protokołu: ${String(protocolDays.length)}. Dni bez sesji: ${String(otherDays.length)}. ` +
      `Dni protokołu bez odczytu: ${String(protocolDaysWithoutData)}.`,
  );
  for (const metric of metrics) {
    textLines.push(metricLine(metric));
  }
  for (const caveat of caveats) {
    textLines.push(caveat);
  }
  textLines.push(PURPOSE_LINE);

  return {
    triggerAfterSession: input.triggerAfterSession,
    completedSessionCount: completed,
    reportDue,
    insufficientEvidence: reasons.length > 0,
    reasons,
    window: {
      fromIso,
      toIso,
      calendarDays:
        fromIso !== null && toIso !== null ? calendarDays(fromIso, toIso) : 0,
    },
    counts: {
      biometricRows: input.biometricDays.length,
      duplicateDays,
      protocolDays: protocolDays.length,
      otherDays: otherDays.length,
      protocolDaysWithoutData,
    },
    metrics,
    caveats,
    textLines,
    dataProvenance: syntheticData ? 'synthetic_fixture' : 'measured',
  };
}

/** Tekst raportu. Panel renderuje dokładnie te linie. */
export function renderRoiReportText(report: RoiReport): string {
  return report.textLines.join('\n');
}