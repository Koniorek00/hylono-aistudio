import {
  DEGRADATION_THRESHOLDS_BASIS_POINTS,
  degradationSeverity,
} from '@/lib/equipment/module1/service-threshold';
import { serviceWarnHours } from '@/lib/equipment/domain/contract';
import type { EquipmentFleetRow } from '@/src/actions/equipmentFleetActions';

/**
 * Czysty widok panelu floty: formatowanie liczb, etykiety statusu, mapowanie
 * poziomów degradacji i sama tabela.
 *
 * [DECISION: 2026-10-15] Ten plik NIE pobiera danych i NIE zna sesji. Dostaje
 * gotowy kształt z akcji i rysuje go. Dzięki temu formatowanie da się
 * przetestować bez bazy, bez sesji i bez renderowania całej strony — a strona
 * zostaje cienką powłoką, która woła akcję i układa wynik.
 *
 * [DECISION: 2026-10-15] Próg ostrzegawczy pochodzi z JEDNEGO miejsca —
 * `serviceWarnHours()` w `domain/contract.ts`. Pierwsza wersja panelu
 * powtórzyła tu wzór na nowo i powtórzyła jego literówkę: liczyła
 * `próg × 0.2` zamiast `próg × 0.8`, czyli ostrzegała 40 h zamiast 160 h.
 * Ta sama liczba w dwóch miejscach to dwa miejsca do rozsynchronizowania;
 * panel ma ją tylko wywoływać. Ten plik nie zawiera własnej arytmetyki progu.
 */

/** Procent zużycia progu, zaokrąglony do jednej dziesiątej. */
export function percentOfThreshold(hours: number, threshold: number): number {
  if (!Number.isFinite(threshold) || threshold <= 0) return 0;
  return Math.round((hours / threshold) * 1000) / 10;
}

/**
 * Etykieta stanu dla jednego urządzenia.
 *
 * [DECISION: 2026-10-15] Próg ostrzegawczy jest wywoływany z kontraktu
 * domenowego, a nie liczony tutaj. Kolejność porównań jest zgodna z
 * `evaluateThresholdSeconds` po stronie akcji: najpierw „do przeglądu",
 * potem „zbliża się próg”. `warn` jest liczone przez domenę dla licznika
 * w sekundach, a `warnHours()` zwraca tę samą wartość w godzinach — różnica
 * to zaokrąglenie do całej godziny, którego etykieta nie zmienia.
 */
export function statusLabel(hours: number, threshold: number): string {
  const warn = serviceWarnHours(threshold);
  if (hours >= threshold) return 'Do przeglądu';
  if (hours >= warn) return 'Zbliża się próg';
  return 'Praca prawidłowa';
}

/** Jedna pozycja w tabeli progów degradacji przepływu. */
export type DegradationLevelEntry = {
  readonly level: string;
  readonly fromBasisPoints: number;
  /** Poziom, jaki domena zgłasza dokładnie na granicy tego progu. */
  readonly sample: string;
};

/**
 * Mapowanie poziomów degradacji na progi z Modułu 1.
 *
 * [DECISION: 2026-10-15] Progi czytane są ze stałej `DEGRADATION_THRESHOLDS_BASIS_POINTS`,
 * a nie zapisywane tutaj liczby. Progi cent, alarmu i krytycznego należą do
 * Modułu 1; panel je pokazuje i nie ma prawa ich powtarzać.
 */
export function buildDegradationLevels(): readonly DegradationLevelEntry[] {
  return (['none', 'watch', 'alert', 'critical'] as const).map((level) => {
    const fromBasisPoints =
      level === 'watch'
        ? DEGRADATION_THRESHOLDS_BASIS_POINTS.watch
        : level === 'alert'
          ? DEGRADATION_THRESHOLDS_BASIS_POINTS.alert
          : level === 'critical'
            ? DEGRADATION_THRESHOLDS_BASIS_POINTS.critical
            : 0;

    return {
      level,
      fromBasisPoints,
      sample: degradationSeverity(fromBasisPoints / 100),
    };
  });
}

/** Lista progów degradacji przepływu. */
export function DegradationLevels() {
  const levels = buildDegradationLevels();
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {levels.map((entry) => (
        <li key={entry.level} className="rounded-xl border p-4">
          <span className="font-medium">{entry.level}</span>
          <span className="ml-2 opacity-70">od {entry.fromBasisPoints / 100} %</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Tabela floty. Kolumny to wyłącznie stan sprzętu — bez danych osoby
 * korzystającej z urządzenia.
 *
 * [DECISION: 2026-10-15] Godziny i progi w komórkach pochodzą z wiersza
 * zwróconego przez akcję (`thresholdHours` rozwiązany dla tenanta), a nie
 * z globalnego progu pokazywanego w sekcji konfiguracji. Te dwie liczby mogą
 * się różnić, gdy tenant ma nadpisanie progu; tabela pokazuje tę właściwą.
 */
export function FleetTable({ devices }: { readonly devices: readonly EquipmentFleetRow[] }) {
  return (
    <table className="mt-3 w-full border-collapse text-left">
      <thead>
        <tr className="border-b">
          <th scope="col" className="py-2">Numer seryjny</th>
          <th scope="col" className="py-2">Model</th>
          <th scope="col" className="py-2">Roboczogodziny</th>
          <th scope="col" className="py-2">Progres progu</th>
          <th scope="col" className="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {devices.map((device) => (
          <tr key={device.id} className="border-b">
            <td className="py-2 font-mono">{device.serialNumber}</td>
            <td className="py-2">{device.modelCode}</td>
            <td className="py-2">
              {device.runtimeHoursSinceService} / {device.threshold.thresholdHours} h
            </td>
            <td className="py-2">
              {percentOfThreshold(
                device.runtimeHoursSinceService,
                device.threshold.thresholdHours
              )}{' '}
              %
            </td>
            <td className="py-2">
              {statusLabel(device.runtimeHoursSinceService, device.threshold.thresholdHours)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}