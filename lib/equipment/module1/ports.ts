/**
 * [DECISION: 2026-10-15] Porty Modułu 1 (Zero-PII Equipment OS).
 *
 * Ten plik deklaruje KAPALNOŚCI, nie implementacji. Zero importów z bazy,
 * zero zależności od Drizzle, zero zależności wykonawczych. Powód jest jeden:
 * cała logika Modułu 1 — retransmisje, próg przeglądu, degradacja przepływu —
 * ma dać się policzyć na atrapie w pamięci, a warstwa Postgres ma dojść
 * później bez zmiany ani jednej linii w `ingest.ts`.
 *
 * ?????? Dlaczego cykl serwisowy to JEDNA transakcja ????????????????????????????????????????????????????????????????????????????????????
 *
 * Zlecenie przeglądu to trzy wiersze naraz: `equipment_service_intervals`
 * (cykl), `equipment_service_orders` (zlecenie z zestawem filtrów) oraz
 * `equipment_outbox` (powiadomienie dla OEM). Rozbite na trzy osobne zapisy
 * dają trzy stany, w których flota jest sprzeczna z samą sobą:
 *
 *   1. cykl bez zlecenia  — OEM widzi maszynę w obsłudze, a zlecenia nie ma;
 *   2. zlecenie bez powiadomienia — zlecenie leży w tabeli, nikt o nim nie wie;
 *   3. powiadomienie bez zlecenia — OEM dostaje wezwanie do pracy, której nie ma.
 *
 * Każdy z tych trzech stanów jest cichy: nie wywala zapytania, nie zapisuje
 * błędu, zostaje na ekranie jako wszystko w porządku. Dlatego
 * `openCycleWithOrder` ma JEDEN kontrakt: albo wstawia trzy wiersze, albo
 * źadnego. Nie ma wywołania, które robi dwa z trzech, i nie ma wywołania,
 * które robi dwa z trzech po cichu.
 *
 * Ten sam argument dotyczy `TelemetryIngest.claim`: rozstrzygnięcie wyścigu
 * retransmisji musi nastąpić w BAZIE (klucz z??o??ony urządzenie + klucz), a nie
 * w kodzie. `SELECT` przed `INSERT` w aplikacji zostawia okno, w którym dwa
 * równoległe ingesty widzą brak duplikatu i oba doliczają godziny.
 *
 * Licznik: sekundy są jedynym licznikiem, godziny są jego obrazem.
 *
 * [DECISION: 2026-10-15] `runtime_seconds_since_service` jest LICZNIKIEM
 * AUTORYTATYWNYM, a `runtime_hours_since_service` jest wartością pochodna do
 * wyświetlania. Wcześniej port przyjmował sekundy, a zwracał godziny, więc
 * każde wywołanie zaokrąglało inaczej i flota liczyła na trzy sposoby.
 *
 * `DeviceRuntime.addRuntimeSeconds` przyjmuje SEKUNDY i zwraca licznik przed
 * oraz po, także w sekundach. Port nie zaokrągla: implementacja ma użyć
 * `projectedSecondsAfter`. Godziny liczone są dopiero na potrzeby raportu
 * przez `hoursFromSeconds`, a próg ocenia `evaluateThresholdSeconds` w
 * sekundach.
 *
 * Nazwy metod i pól mają jednostkę w nazwie (`addRuntimeSeconds`,
 * `secondsBefore`, `secondsAfter`) właśnie dlatego, że poprzednia wersja
 * miała ją w komentarzu, a błąd w jednostce był nie do zobaczenia.
 */

import type { Device, TelemetryEventType } from '@/lib/equipment/domain/contract';
import type { DegradationSeverity, FleetThresholdConfig } from '@/lib/equipment/module1/service-threshold';

/** Werdykt atomowego przejścia klucza idempotencji. */
export type ClaimVerdict = 'claimed' | 'duplicate';

/** Wiersz telemetrii gotowy do zapisu. Nie zawiera PII — warstwa jest zero-PII. */
export type TelemetryEventRecord = {
  readonly deviceId: string;
  readonly eventType: TelemetryEventType;
  readonly occurredAt: string;
  /** Przyrost czasu pracy w sekundach; null dla zdarzeń bez czasu pracy. */
  readonly runtimeDeltaSeconds: number | null;
  /** Anonimowy token sesji. NIE jest kluczem do osoby. */
  readonly sessionToken: string | null;
  readonly sensors: Readonly<Record<string, number>> | null;
  /** Odciski bajtów pakietu — dowód, że retransmisja niesie to samo. */
  readonly payloadHash: string;
};

/** Przesunięcie licznika roboczogodzin. Oba pola są liczbami całkowitymi. */
export type RuntimeCounterDelta = {
  /** Stan PRZED przyrostem, w sekundach. */
  readonly secondsBefore: number;
  /** Stan PO przyroście, w sekundach. */
  readonly secondsAfter: number;
};

/** Przyrost zdarzeń telematycznych + bramka retransmisji. */
export interface TelemetryIngest {
  /**
   * Atomowo przejmuje (urządzenie, klucz). `duplicate` znaczy: ktoś już
   * ten pakiet przyjął i doliczył jego czas pracy.
   */
  claim(deviceId: string, idempotencyKey: string, payloadHash: string): Promise<ClaimVerdict>;

  /**
   * Podnosi licznik retransmisji i zwraca jego nową wartość. Osobne od
   * `claim`, bo `claim` zwraca sam werdykt — a licznik retransmisji musi
   * rosnąć, inaczej nie wiadomo, czy urządzenie ma zepsutą sieć, czy ktoś
   * wysyła te same dane 50 razy. Jeden `UPDATE` z licznikiem jest atomowy sam
   * w sobie i nie potrzebuje transakcji z `claim`.
   */
  incrementDuplicateCount(deviceId: string, idempotencyKey: string): Promise<number>;

  /** Zapisuje zdarzenie i zwraca jego identyfikator. */
  recordEvent(event: TelemetryEventRecord): Promise<string>;
}

/** Paszport techniczny + licznik. */
export interface DeviceRuntime {
  /** `null` = urządzenie nieznane. Nigdy nie rzuca wyjątkiem bazy. */
  findDeviceBySerial(serialNumber: string): Promise<Device | null>;

  /**
   * Dolicza SEKUNDY i zwraca licznik przed oraz po, także w sekundach.
   * Implementacja ma użyć `projectedSecondsAfter`, nie własnego zaokrąglenia.
   *
   * [DECISION: 2026-10-15] Poprzednia nazwa brzmiała `addRuntimeHours` przy
   * argumencie `deltaSeconds` i zwracaniu godzin. Trzy jednostki w jednym
   * podpisie to niejedność, która kosztowała pół godziny na tick.
   */
  addRuntimeSeconds(deviceId: string, deltaSeconds: number): Promise<RuntimeCounterDelta>;

  /** Degradacja przepływu w punktach procentowych; `null` = brak odczytu. */
  setFlowDegradation(deviceId: string, percent: number | null): Promise<void>;

  /** Czy istnieje otwarty cykl serwisowy. Bramka przed otwarciem kolejnego. */
  hasOpenInterval(deviceId: string): Promise<boolean>;
}

/** Dane potrzebne do otwarcia cyklu, zlecenia i powiadomienia w jednej transakcji. */
export type OpenCycleInput = {
  readonly deviceId: string;
  readonly oemTenantId: string;
  readonly thresholdHours: number;
  readonly warnHours: number;
  readonly triggerReason: string;
  /**
   * Stan licznika w GODZINACH w chwili otwarcia zlecenia, czyli
   * `hoursFromSeconds` z licznika autorytatywnego. Pole w `equipment_service_*`
   * jest INTEGER godzin i pozostaje takie. Dla odczytu uproszczonego
   * `runtimeSecondsSinceService` pozostaje autorytatywne.
   */
  readonly runtimeHoursAtOrder: number;
  /** Moment zdarzenia, które przekroczyło próg — nie czas serwera. */
  readonly occurredAt: string;
  /** Zdarzenie wyzwalające — powiązanie zlecenia z telemetrią. */
  readonly eventId: string;
  readonly idempotencyKey: string;
  readonly degradationPercent: number | null;
  readonly degradationSeverity: DegradationSeverity;
};

export type OpenCycleResult = {
  readonly intervalId: string;
  readonly orderId: string;
};

/** Alert o degradacji przepływu. Osobny od cyklu: degradacja nie otwiera zlecenia. */
export type DegradationAlertInput = {
  readonly deviceId: string;
  readonly oemTenantId: string;
  readonly percent: number;
  readonly severity: DegradationSeverity;
  readonly observedAt: string;
  readonly thresholdHours: number;
};

export interface ServiceCycle {
  /**
   * OTWIERA cykl, zlecenie i powiadomienie JEDNYM wywołaniem. Kontrakt
   * jest all-or-nothing — uzasadnienie w nagłówku tego pliku.
   */
  openCycleWithOrder(input: OpenCycleInput): Promise<OpenCycleResult>;

  /**
   * Kolejka alertowa dla degradacji. Osobna metoda, bo degradacja jest
   * sygnałem operacyjnym, a nie cyklem serwisowym: poziom krytyczny ma
   * obudził OEM o 3:00 w nocy, nie wystawia f faktury.
   */
  enqueueDegradationAlert(input: DegradationAlertInput): Promise<string>;
}

/** Wszystko, czego potrzebuje `ingestTelemetryPacket`. */
export type IngestDeps = {
  readonly telemetry: TelemetryIngest;
  readonly runtime: DeviceRuntime;
  readonly cycle: ServiceCycle;
  /** Pusty obiekt = próg z dołu przedziału mandatu. */
  readonly thresholdConfig?: FleetThresholdConfig;
};

