/**
 * Moduł 2 — cykle pulsujące (pulse-cycles).
 *
 * Mandat: „HBOT co 48 h z regeneracją wodorowo-tlenową", „Celluma 2–3 razy
 * w tygodniu przez 4–6 tygodni". To nie jest jedna rezerwacja, tylko ciąg
 * wystąpień, w którym każde następne zależy od poprzedniego. Ten plik zamienia
 * opis cyklu na konkretne terminy.
 *
 * ZASADA NIEROZBIERZALNOŚCI: plan zwraca ZARÓWNO przyjęte wystąpienia, JAK i
 * powody odrzucenia każdego odrzuconego. Cykl, który po cichu gubi sesje,
 * to nie harmonogram, tylko raport, którego nikt nie czyta. Klient, który
 * kupił 12 wizyt, musi wiedzieć, że 11 się odbyło i dlaczego dwunaste nie.
 *
 * [DECISION: 2026-10-15] Parametr 16/8.
 *
 * Mandat wymienia „interwał 16/8" wśród parametrów cyklu pulsującego. Inne
 * materiały źródłowe Hylono opisują 16/8 jako okno przerywanego postu, czyli
 * przerwę przypisaną użytkownikowi, a nie konflikt zasobów. Oba odczyty są
 * uzasadnione, więc silnik NIE wybiera po cichu jednego z nich.
 *
 * Rozwiązanie: `RestCycleConfig` jest nazwanym, dokumentowanym i konfigurowalnym
 * parametrem cyklu. Tennik ustawia go jako `restCycle` w `TherapyCycleSpec`,
 * a plan zwraca go w `PulseCyclePlan.restCycle` i rysuje w harmonogramie jako
 * oznaczenie doradcze. Pole `enforcesResourceLock` ma wpisany literale `false`,
 * więc TypeScript odrzuci `true` przy kompilacji — z tego parametru NIE powstaje
 * żadna blokada `room:`, `staff:`, `device:` ani `mask:`, a w kodzie nie ma
 * zaszytego „16 godzin przerwy po sesji". Silnik traktuje 16/8 wyłącznie jako
 * interwał konfigurowalny, nie jako regułę zasobów. Uzasadnienie kliniczne
 * tego okna nie zostało tu dopisane, bo żadne nie wynika z dokumentów.
 * Pełny opis kontraktu: `RestCycleConfig` w `./types.ts`.
 *
 * KOTWICE TYGODNIOWE: tydzień to dokładnie 7 × 24 h liczone od kotwicy. Po
 * zmianie czasu lokalna godzina kotwicy przesuwa się o godzinę, ale długość
 * każdej blokady i odstęp 48 h pozostają niezmienne — patrz decyzja o granicy
 * doby w `./scheduler.ts`.
 */

import type { DeviceClass, DeviceModality, SessionVariant } from '../domain/contract';
import { mulberry32, pickInRange } from './occupancy';
import {
  buildVisualSchedule,
  DEFAULT_SCHEDULER_CONFIG,
  scheduleBooking,
} from './scheduler';
import {
  DAY_MS,
  type Booking,
  type BookingRequest,
  type CountRange,
  type NominalSessionMinutes,
  type RejectionCode,
  type RestCycleConfig,
  type SchedulerConfig,
  type SchedulerState,
  type VisualSchedule,
} from './types';

export type TherapyCycleKind = 'celluma' | 'hbot_regeneration' | 'custom';

export type TherapyCycleTemplate = {
  readonly kind: TherapyCycleKind;
  readonly label: string;
  /** Tyle razy w tygodniu, zakres wg dokumentu mandatu. */
  readonly sessionsPerWeek: CountRange;
  /** Tyle tygodni trwa cykl, zakres wg dokumentu mandatu. */
  readonly weeks: CountRange;
  readonly nominalMinutes: NominalSessionMinutes;
  readonly deviceClass: DeviceClass;
  /**
   * Modalności tu nie ma. `DeviceModality` z kontraktu zna `hbot`, `hydrogen`
   * i `pemf`, a panel diodowy między nimi nie pasuje do żadnej nazwy bez
   * zgody tennika. Podanie jej zgadywałoby mapowanie urządzenia na klasę,
   * a ten błąd wędruje potem do każdego raportu. Wywołujący podaje
   * modalność świadomie.
   */
  readonly modalitySuppliedByTenant: true;
};

/**
 * Katalog cykli. Liczby pochodzą z dokumentu mandatu; zmiana to zmiana
 * wpisu tutaj, nie przepisywanie algorytmu.
 */
export const THERAPY_CYCLE_TEMPLATES: Readonly<Record<TherapyCycleKind, TherapyCycleTemplate>> = {
  celluma: {
    kind: 'celluma',
    label: 'panel diodowy',
    sessionsPerWeek: { min: 2, max: 3 },
    weeks: { min: 4, max: 6 },
    nominalMinutes: 30,
    deviceClass: 'module',
    modalitySuppliedByTenant: true,
  },
  hbot_regeneration: {
    kind: 'hbot_regeneration',
    label: 'komora z regeneracją',
    sessionsPerWeek: { min: 1, max: 1 },
    weeks: { min: 4, max: 6 },
    nominalMinutes: 60,
    deviceClass: 'chamber',
    modalitySuppliedByTenant: true,
  },
  custom: {
    kind: 'custom',
    label: 'cykl własny obiektu',
    sessionsPerWeek: { min: 1, max: 3 },
    weeks: { min: 1, max: 6 },
    nominalMinutes: 30,
    deviceClass: 'module',
    modalitySuppliedByTenant: true,
  },
};

export type TherapyCycleSpec = {
  readonly cycleId: string;
  readonly template: TherapyCycleKind;
  readonly modality: DeviceModality;
  readonly deviceId: string;
  readonly deviceClass: DeviceClass;
  readonly roomId: string;
  readonly staffId: string;
  readonly variant: SessionVariant;
  readonly nominalMinutes: NominalSessionMinutes;
  readonly sessionsPerWeek: CountRange;
  readonly weeks: CountRange;
  /** Kotwica pierwszego tygodnia — czas bezwzględny. */
  readonly firstSessionStart: Date;
  readonly seed: number;
  /** Okno cykliczne (np. 16/8) — opisowe, patrz decyzja na górze pliku. */
  readonly restCycle: RestCycleConfig | null;
};

export type CycleAttempt = {
  readonly attempt: number;
  readonly requestedStart: string;
  readonly code: RejectionCode;
  readonly message: string;
};

export type CycleSession = {
  readonly booking: Booking;
  readonly weekIndex: number;
  readonly targetIndex: number;
  readonly requestedStart: string;
  readonly relocated: boolean;
};

export type CycleDrop = {
  readonly weekIndex: number;
  readonly targetIndex: number;
  readonly requestedStart: string;
  readonly code: RejectionCode;
  readonly message: string;
  readonly attempts: readonly CycleAttempt[];
};

export type PulseCyclePlan = {
  readonly cycleId: string;
  readonly template: TherapyCycleKind;
  readonly modality: DeviceModality;
  readonly deviceId: string;
  readonly seed: number;
  readonly weeks: number;
  readonly sessionsPerWeek: number;
  readonly targetTotal: number;
  readonly restCycle: RestCycleConfig | null;
  readonly accepted: readonly CycleSession[];
  readonly dropped: readonly CycleDrop[];
  readonly state: SchedulerState;
  /** Uwaga operacyjna — powód, dla którego okno nie blokuje zasobów. */
  readonly restCycleNote: string;
};

export const REST_CYCLE_NOTE =
  'Okno cykliczne jest parametrem opisowym planu i nie generuje żadnej blokady zasobu.';

function seedFor(spec: TherapyCycleSpec, index: number): number {
  return (Math.imul(spec.seed, 1_000_003) + Math.imul(index + 1, 2_654_435_761)) >>> 0;
}

/**
 * Dzień w tygodniu dla `n`-tego wystąpienia przy `count` wystąpieniach.
 * Rozkład jest równy i — co ważniejsze — dla zakresu z mandatu (2–3 razy
 * w tygodniu) daje odstępy co najmniej dwudniowe: `floor(n * 7 / count)`
 * dla count=2 daje 0 i 3, dla count=3 daje 0, 2 i 4. Reguła 48 h na tej
 * samej maszynie jest wtedy spełniona z zapasem.
 *
 * Powyżej 3 wystąpień w tygodniu równy rozkład przestaje gwarantować ten
 * odstęp — cztery wystąpienia dają dzień po dniu. To granica udokumentowana,
 * nie zgłoszona: regułę 48 h egzekwuje `scheduleBooking`, więc taki cykl
 * zostanie przesunięty albo odrzucony z powodem, a nigdy podwójnie
 * zarezerwowany. Świadome ograniczenie katalogu cykli to 3 razy w tygodniu.
 */
export function dayOffsetInWeek(index: number, count: number): number {
  if (count <= 1) return 0;
  return Math.floor((index * 7) / count);
}

function validateSpec(
  spec: TherapyCycleSpec,
  config: SchedulerConfig,
): string | null {
  if (spec.cycleId.length === 0) return 'brak identyfikatora cyklu';
  if (spec.deviceId.length === 0) return 'brak identyfikatora urządzenia';
  if (spec.roomId.length === 0) return 'brak identyfikatora pomieszczenia';
  if (spec.staffId.length === 0) return 'brak identyfikatora obsługi';
  if (!Number.isFinite(spec.firstSessionStart.getTime())) return 'nieprawidłowa kotwica cyklu';
  if (!Number.isInteger(spec.seed)) return 'ziarno losowania musi być liczbą całkowitą';
  if (!config.nominalSessionMinutes.includes(spec.nominalMinutes)) {
    return `długość sesji ${String(spec.nominalMinutes)} min jest poza listą dozwolonych`;
  }
  for (const [label, range] of [
    ['wystąpień w tygodniu', spec.sessionsPerWeek],
    ['tygodni', spec.weeks],
  ] as const) {
    if (!Number.isInteger(range.min) || !Number.isInteger(range.max) || range.min < 1 || range.min > range.max) {
      return `zakres ${label} musi być dodatnią liczbą całkowitą`;
    }
  }
  return null;
}

/**
 * Rozwija cykl na konkretne terminy.
 *
 * Determinizm: liczba tygodni, liczba wystąpień w tygodniu, dzień każdego
 * wystąpienia i fazy sesji (kompresja, dekompresja) zależą wyłącznie od `seed`.
 * Ten sam seed i ten sam stan wejściowy dają ten sam plan bajt w bajt.
 */
export function expandPulseCycle(
  spec: TherapyCycleSpec,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
  initialState: SchedulerState = { busy: new Map(), usageByDeviceModality: new Map() },
): PulseCyclePlan {
  const rng = mulberry32(spec.seed);

  const invalidReason = validateSpec(spec, config);
  if (invalidReason !== null) {
    return {
      cycleId: spec.cycleId,
      template: spec.template,
      modality: spec.modality,
      deviceId: spec.deviceId,
      seed: spec.seed,
      weeks: 0,
      sessionsPerWeek: 0,
      targetTotal: 0,
      restCycle: spec.restCycle,
      accepted: [],
      dropped: [
        {
          weekIndex: 0,
          targetIndex: 0,
          requestedStart: spec.firstSessionStart.toISOString(),
          code: 'config_invalid',
          message: `Cykl ${spec.cycleId} na urządzeniu ${spec.deviceId} nie może zostać rozwinięty: ${invalidReason}.`,
          attempts: [],
        },
      ],
      state: initialState,
      restCycleNote: REST_CYCLE_NOTE,
    };
  }

  const weeks = pickInRange(rng, spec.weeks);
  const sessionsPerWeek = pickInRange(rng, spec.sessionsPerWeek);
  const targetTotal = weeks * sessionsPerWeek;

  const accepted: CycleSession[] = [];
  const dropped: CycleDrop[] = [];
  let state = initialState;
  let globalIndex = 0;

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    for (let targetIndex = 0; targetIndex < sessionsPerWeek; targetIndex += 1) {
      const anchorMs = spec.firstSessionStart.getTime() + (7 * weekIndex) * DAY_MS;
      const requestedStartMs =
        anchorMs + dayOffsetInWeek(targetIndex, sessionsPerWeek) * DAY_MS;

      const request = (candidateMs: number): BookingRequest => ({
        sessionRef: `${spec.cycleId}-w${String(weekIndex)}-${String(targetIndex)}`,
        variant: spec.variant,
        modality: spec.modality,
        deviceClass: spec.deviceClass,
        deviceId: spec.deviceId,
        roomId: spec.roomId,
        staffId: spec.staffId,
        nominalMinutes: spec.nominalMinutes,
        requestedStart: new Date(candidateMs),
        seed: seedFor(spec, globalIndex),
        cycleRef: spec.cycleId,
        cycleIndex: globalIndex,
      });

      const attempts: CycleAttempt[] = [];
      let candidateMs = requestedStartMs;
      let placed = false;

      for (let attempt = 0; attempt <= config.maxRelocationAttemptsPerSession; attempt += 1) {
        const result = scheduleBooking(request(candidateMs), state, config);
        if (result.ok) {
          accepted.push({
            booking: result.booking,
            weekIndex,
            targetIndex,
            requestedStart: new Date(requestedStartMs).toISOString(),
            relocated: candidateMs !== requestedStartMs,
          });
          state = result.state;
          placed = true;
          break;
        }
        attempts.push({
          attempt,
          requestedStart: new Date(candidateMs).toISOString(),
          code: result.rejection.code,
          message: result.rejection.message,
        });
        const earliest = result.rejection.earliestAvailableAt;
        // Brak ruchu do przodu oznacza, że sama przesunięta rezerwacja nic
        // nie zmieni — wtedy próbujemy następnego dnia. Cykl wolno przesunąć
        // o godziny; nie wolno przesunąć go o tygodnie po cichu.
        candidateMs =
          earliest === null || earliest.getTime() <= candidateMs
            ? candidateMs + DAY_MS
            : earliest.getTime();
      }

      if (!placed) {
        const last = attempts[attempts.length - 1];
        dropped.push({
          weekIndex,
          targetIndex,
          requestedStart: new Date(requestedStartMs).toISOString(),
          code: last === undefined ? 'config_invalid' : last.code,
          message:
            last === undefined
              ? `Cykl ${spec.cycleId}: nie znaleziono terminu dla urządzenia ${spec.deviceId} w tygodniu ${String(weekIndex + 1)}, wystąpienie ${String(targetIndex + 1)}.`
              : last.message,
          attempts,
        });
      }

      globalIndex += 1;
    }
  }

  return {
    cycleId: spec.cycleId,
    template: spec.template,
    modality: spec.modality,
    deviceId: spec.deviceId,
    seed: spec.seed,
    weeks,
    sessionsPerWeek,
    targetTotal,
    restCycle: spec.restCycle,
    accepted,
    dropped,
    state,
    restCycleNote: REST_CYCLE_NOTE,
  };
}

/** Kanoniczna serializacja planu — podstawa porównania bajt w bajt. */
export function serializePulseCyclePlan(plan: PulseCyclePlan): string {
  return JSON.stringify({
    cycleId: plan.cycleId,
    template: plan.template,
    modality: plan.modality,
    deviceId: plan.deviceId,
    seed: plan.seed,
    weeks: plan.weeks,
    sessionsPerWeek: plan.sessionsPerWeek,
    targetTotal: plan.targetTotal,
    restCycle: plan.restCycle,
    accepted: plan.accepted.map((session) => ({
      weekIndex: session.weekIndex,
      targetIndex: session.targetIndex,
      requestedStart: session.requestedStart,
      relocated: session.relocated,
      bookingId: session.booking.bookingId,
      startsAt: session.booking.window.startsAt.toISOString(),
      occupiesUntil: session.booking.window.occupiesUntil.toISOString(),
      locks: session.booking.locks.map((lock) => lock.id),
    })),
    dropped: plan.dropped.map((drop) => ({
      weekIndex: drop.weekIndex,
      targetIndex: drop.targetIndex,
      code: drop.code,
      message: drop.message,
    })),
  });
}

/**
 * Wizualny harmonogram cyklu. Bufory są widoczne osobno, a odrzucone
 * wystąpienia są wypisane pod tabelą — brakująca sesja musi być widoczna,
 * inaczej klient płaci za cykl, którego nie dostanie.
 */
export function renderPulseCyclePlan(
  plan: PulseCyclePlan,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
): { readonly text: string; readonly schedule: VisualSchedule } {
  const schedule = buildVisualSchedule(
    plan.accepted.map((session) => session.booking),
    config,
  );
  const lines: string[] = [];
  lines.push(`Cykl ${plan.cycleId} (${plan.template}, ${plan.modality}) na urządzeniu ${plan.deviceId}`);
  lines.push(
    `Zamówiono ${String(plan.targetTotal)} wystąpień: ${String(plan.weeks)} tygodni × ${String(plan.sessionsPerWeek)} razy w tygodniu.`,
  );
  if (plan.restCycle !== null) {
    lines.push(
      `Okno ${plan.restCycle.label}: ${String(plan.restCycle.activeHours)}/${String(plan.restCycle.restHours)} — ${plan.restCycleNote}`,
    );
  }
  lines.push(`Przyjęte wystąpienia: ${String(plan.accepted.length)}. Odrzucone: ${String(plan.dropped.length)}.`);
  lines.push('');
  for (const row of schedule.rows) lines.push(row);
  if (plan.dropped.length > 0) {
    lines.push('');
    lines.push('Odrzucone wystąpienia:');
    for (const drop of plan.dropped) {
      lines.push(
        `  tydzień ${String(drop.weekIndex + 1)}, wystąpienie ${String(drop.targetIndex + 1)}: ${drop.code} — ${drop.message}`,
      );
    }
  }
  return { text: lines.join('\n'), schedule };
}