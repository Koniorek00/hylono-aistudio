/**
 * Moduł 2 — realne zajęcie zasobu (occupancy).
 *
 * Sedno tego pliku: sesja sprzedawana jako 60 minut NIE zajmuje zasobu przez
 * 60 minut. Komora dodaje kompresję i dekompresję, obsługa dodaje bufor, a
 * operator potrzebuje czasu na wymianę masek i schładzanie sprężarki. Planowanie
 * po długości sprzedanej gwarantuje podwójną rezerwację.
 *
 * [DECISION: 2026-10-15] Zakresy pochodzą z dokumentu mandatu (kompresja
 * 8–10 min, dekompresja 5–7 min, realne zajęcie 75–110 min) i są wczytywane
 * z `SchedulerConfig`. Nie ma w tym pliku literału 8, 10, 5, 7, 75 ani 110 —
 * zamiana zakresu to zmiana konfiguracji, nie przekopywanie silnika.
 *
 * DETERMINIZM. Kompresja i dekompresja są losowane, bo sprzęt zachowuje się
 * różnie na różnych maszynach — ale losowanie idzie przez `mulberry32`, nie
 * przez `Math.random`. Ten sam seed daje te same minuty, więc ten sam plan
 * da się odtworzyć przy rozliczeniu, odwołaniu albo odzyskaniu po awarii.
 * `Math.random()` w tym module jest błędem — nie ma go tutaj.
 */

import type { DeviceClass } from '../domain/contract';
import {
  MINUTE_MS,
  type MinuteRange,
  type NominalSessionMinutes,
  type OccupancyWindow,
  type SchedulerConfig,
} from './types';

export { MINUTE_MS };

/**
 * mulberry32 — deterministyczny generator z zakresu [0, 1).
 * 32 bity stanu, mnożenie z mieszanką bitową; ten sam seed → ten sam ciąg,
 * niezależnie od platformy i wersji silnika JS.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Losowa liczba całkowita z przedziału domkniętego `[min, max]`. */
export function pickInRange(rng: () => number, range: MinuteRange): number {
  const span = range.max - range.min;
  if (span <= 0) return range.min;
  return range.min + Math.floor(rng() * (span + 1));
}

/**
 * Spójność konfiguracji. Zwraca listę problemów po polsku, po jednym wierszu
 * na problem — `scheduler.ts` zamienia ją na odrzucenie `config_invalid`,
 * a nigdy nie rzuca wyjątkiem w ścieżce rezerwacji. Wyjątek w silniku
 * harmonogramu zamienia jedno kliknięcie w 500.
 */
export function inspectSessionConfig(config: SchedulerConfig): readonly string[] {
  const issues: string[] = [];
  const { occupancy, buffers } = config;

  const ranges: readonly (readonly [string, MinuteRange])[] = [
    ['kompresja', occupancy.compressionMinutes],
    ['dekompresja', occupancy.decompressionMinutes],
    ['zajęcie całkowite', occupancy.totalOccupiedMinutes],
  ];

  for (const [label, range] of ranges) {
    if (!Number.isInteger(range.min) || !Number.isInteger(range.max)) {
      issues.push(`zakres ${label} musi mieć całkowite granice`);
    }
    if (range.min > range.max) {
      issues.push(`zakres ${label} ma dolną granicę powyżej górnej`);
    }
  }

  for (const [label, value] of [
    ['bufor technologiczny', buffers.techBufferMinutes],
    ['bufor dezynfekcji', buffers.disinfectionBufferMinutes],
    ['odstęp przed sesją', buffers.preSessionBufferMinutes],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      issues.push(`${label} musi być liczbą nieujemną`);
    }
  }

  if (config.slotStepMinutes <= 0 || !Number.isFinite(config.slotStepMinutes)) {
    issues.push('krok siatki harmonogramu musi być dodatnią liczbą');
  }

  if (config.alternation.minIntervalHours < 0 || !Number.isFinite(config.alternation.minIntervalHours)) {
    issues.push('interwał blokowania naprzemiennego musi być liczbą nieujemną');
  }

  let maskTotal = 0;
  for (const variant of ['single', 'pair'] as const) {
    const masks = config.masksPerDevice[variant];
    if (!Number.isInteger(masks) || masks < 0) {
      issues.push(`wariant ${variant} musi blokować nieujemną liczbę zestawów masek`);
    } else {
      maskTotal += masks;
    }
  }
  if (maskTotal === 0) {
    issues.push('żaden wariant sesji nie blokuje zestawów masek ani maszyny');
  }

  if (config.nominalSessionMinutes.length === 0) {
    issues.push('lista dopuszczalnych długości sesji jest pusta');
  }

  // Najdłuższa dopuszczalna sesja wraz z najgorszymi fazami musi mieścić się
  // w górnej granicy realnego zajęcia. Jeśli się nie mieści, konfiguracja
  // obiecuje maszynie więcej czasu, niż źródło dopuszcza.
  const longestNominal = config.nominalSessionMinutes.reduce((max, v) => Math.max(max, v), 0);
  const worstCase =
    longestNominal +
    occupancy.compressionMinutes.max +
    occupancy.decompressionMinutes.max;
  if (worstCase > occupancy.totalOccupiedMinutes.max) {
    issues.push(
      `najdłuższa sesja ${String(longestNominal)} min wraz z fazami daje ${String(worstCase)} min, a górna granica zajęcia to ${String(occupancy.totalOccupiedMinutes.max)} min`,
    );
  }

  return issues;
}

/** Czy dana sesja mieści się w deklarowanym czasie trwania. */
export function isNominalMinuteAllowed(
  config: SchedulerConfig,
  minutes: number,
): minutes is NominalSessionMinutes {
  return config.nominalSessionMinutes.includes(minutes as NominalSessionMinutes);
}

export type OccupancyInput = {
  /** Początek blokady pomieszczenia. */
  readonly startsAt: Date;
  readonly nominalMinutes: NominalSessionMinutes;
  readonly deviceClass: DeviceClass;
  readonly seed: number;
};

/**
 * Buduje okno blokady dla jednej sesji.
 *
 * Bufor jest BUDŻETEM rozłożonym na dwa końce, a nie pojedynczym odstępem
 * dopisanym do sprzedanej długości:
 *
 *   `startsAt ─pre─ sessionStartsAt ─kompresja─ nominal ─dekomp─ sessionEndsAt ─budżet─ occupiesUntil`
 *
 * Dlaczego nie inaczej: kompresja (8–10 min) i dekompresja (5–7 min) ZJAZDUJĄ
 * WEWNĄTRZ okna sesji sprzedanej jako 60 minut. Dopisanie do tego 15-minutowego
 * odstępu dałoby 90 minut blokady zamiast ~75–110 zadeklarowanych przez źródło,
 * a przy 90-minutowej ofercie dałoby 125 minut przy górnej granicy 110. Bufor
 * technologiczny liczony jest więc OD końca rzeczywistej sesji (po
 * dekompresji), nie od długości sprzedanej.
 *
 * Budżet jest jeden, bo czynności w nim zawarte się pokrywają: wymiana masek,
 * schładzanie sprężarki i higiena komory to jedno okno serwisowe, a nie trzy
 * kolejne. Ich sumowanie dawałoby blokadę, której nikt nie umiałby zapowiedzieć
 * klientowi. Kto chce liczyć je osobno, niech rozbije budżet w konfiguracji
 * przez zmniejszenie `techBufferMinutes` i dodanie własnych pasm.
 */
export function computeOccupancyWindow(
  input: OccupancyInput,
  config: SchedulerConfig,
): OccupancyWindow {
  const rng = mulberry32(input.seed);
  const { occupancy, buffers } = config;

  const compressionMinutes = pickInRange(rng, occupancy.compressionMinutes);
  const decompressionMinutes = pickInRange(rng, occupancy.decompressionMinutes);

  const needsDisinfection = buffers.disinfectionAppliesTo.includes(input.deviceClass);
  const disinfectionBufferMinutes = needsDisinfection ? buffers.disinfectionBufferMinutes : 0;

  const preSessionBufferMinutes = Math.max(0, buffers.preSessionBufferMinutes);
  const techBufferMinutes = Math.max(0, buffers.techBufferMinutes);

  const rawOccupiedMinutes = compressionMinutes + input.nominalMinutes + decompressionMinutes;
  const occupiedMinutes = Math.min(
    occupancy.totalOccupiedMinutes.max,
    Math.max(occupancy.totalOccupiedMinutes.min, rawOccupiedMinutes),
  );

  const startsAtMs = input.startsAt.getTime();
  const sessionStartsAtMs = startsAtMs + preSessionBufferMinutes * MINUTE_MS;
  const sessionEndsAtMs = sessionStartsAtMs + occupiedMinutes * MINUTE_MS;
  const occupiesUntilMs = sessionEndsAtMs + (techBufferMinutes + disinfectionBufferMinutes) * MINUTE_MS;

  return {
    startsAt: new Date(startsAtMs),
    sessionStartsAt: new Date(sessionStartsAtMs),
    sessionEndsAt: new Date(sessionEndsAtMs),
    occupiesUntil: new Date(occupiesUntilMs),
    compressionMinutes,
    nominalMinutes: input.nominalMinutes,
    decompressionMinutes,
    preSessionBufferMinutes,
    techBufferMinutes,
    disinfectionBufferMinutes,
    occupiedMinutes,
  };
}

/** Realne zajęcie maszyny w minutach, liczone od kompresji do zwolnienia bufora. */
export function occupiedMinutesOf(window: OccupancyWindow): number {
  return (window.occupiesUntil.getTime() - window.sessionStartsAt.getTime()) / MINUTE_MS;
}

/** Zaokrąglenie w górę do wielokrotności `stepMinutes`. */
export function roundUpToStepMs(timeMs: number, stepMinutes: number): number {
  const stepMs = stepMinutes * MINUTE_MS;
  return Math.ceil(timeMs / stepMs) * stepMs;
}

/** Zaokrąglenie w górę do wielokrotności `stepMinutes`, jako `Date`. */
export function roundUpToStep(timeMs: number, stepMinutes: number): Date {
  return new Date(roundUpToStepMs(timeMs, stepMinutes));
}