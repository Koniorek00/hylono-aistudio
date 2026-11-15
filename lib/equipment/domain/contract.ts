/**
 * [DECISION: 2026-10-15] Kontrakty dzielone przez sześć modułów. Trzymane
 * w jednym miejscu, bo Moduł 1 (telemetria), Moduł 2 (harmonogram) i Moduł 6
 * (panel OEM) wszystkie operują na tej samej flocie — trzy różne definicje
 * urządzenia to trzy różne odpowiedzi na pytanie „czy ten sprzęt jest spójny".
 *
 * Identyfikatory sprzętu NIE SĄ identyfikatorami osoby. `serialNumber` opisuje
 * maszynę, `siteRef` opisuje obiekt. Żadnego pola identyfikującego osobę
 * korzystającą z urządzenia w tym pliku nie ma i nie powinno się pojawić.
 */

/** Modalność sprzętu — zgodna z podziałem oferty Hylono. */
export const DEVICE_MODALITIES = ['hbot', 'hydrogen', 'pemf'] as const;
export type DeviceModality = (typeof DEVICE_MODALITIES)[number];

/** Klasa urządzenia — określa, ile zasobów sesja blokuje. */
export const DEVICE_CLASSES = ['chamber', 'module'] as const;
export type DeviceClass = (typeof DEVICE_CLASSES)[number];

/** Wariant sesji — decyduje o liczbie masek i obsługi. */
export const SESSION_VARIANTS = ['single', 'pair'] as const;
export type SessionVariant = (typeof SESSION_VARIANTS)[number];

export type EquipmentStatus = 'active' | 'maintenance' | 'decommissioned';

export type Device = {
  readonly id: string;
  readonly oemTenantId: string;
  /** Numer seryjny maszyny. Identyfikator sprzętu, nie osoby. */
  readonly serialNumber: string;
  readonly modelCode: string;
  readonly modality: DeviceModality;
  readonly deviceClass: DeviceClass;
  /** Kod obiektu, np. „WAW-01-KA". KOD LOKALIZACJI, nie adres. */
  readonly siteRef: string;
  /** Liczba filtrów w konfiguracji — element paszportu technicznego. */
  readonly filterCount: number;
  /**
   * LICZNIK AUTORYTATYWNY: roboczogodziny od ostatniego przeglądu w SEKUNDACH.
   *
   * Pole wymagane, nie opcjonalne: brak sekund oznacza licznik, którego nie da
   * się porównać z progiem, a nie licznik równy zero. Default 0 w
   * bazie jest wartością na wierszach sprzed dodania kolumny i wymaga
   * backfillu (`secondsFromHours`), inaczej zlecenie opóźni się o pełny mandat.
   */
  readonly runtimeSecondsSinceService: number;
  /**
   * Roboczogodziny od ostatniego przeglądu. WARTOŚĆ POCHODNA.
   *
   * Panel i kilka modułów czyta godziny, więc kolumna zostaje. Ale to
   * `Math.round(runtimeSecondsSinceService / 3600)`, czyli wartość zaokrąglona
   * z dokładnością co najwyżej 30 minut. Logika progu NIE używa tej
   * wartości — porównuje sekundy, `evaluateThresholdSeconds`.
   */
  readonly runtimeHoursSinceService: number;
  /** Degradacja przepływu w procentowych punktach; null = brak odczytu. */
  readonly flowDegradationPercent: number | null;
  readonly status: EquipmentStatus;
  readonly lastTelemetryAt: string | null;
};

/** Typy zdarzeń telematycznych. Każdy ma inne konsekwencje dla licznika. */
export const TELEMETRY_EVENT_TYPES = [
  'runtime_tick',
  'session_started',
  'session_completed',
  'sensor_reading',
  'fault',
] as const;
export type TelemetryEventType = (typeof TELEMETRY_EVENT_TYPES)[number];

/** Próg zamówienia przeglądu — mandat podaje zakres 200–300 h. */
export const SERVICE_THRESHOLD_MIN_HOURS = 200;
export const SERVICE_THRESHOLD_MAX_HOURS = 300;
/** Próg ostrzegawczy: % progu zamówienia, przy którym OEM dostaje sygnał wcześniej. */
export const SERVICE_WARN_RATIO_BASIS_POINTS = 8_000;

/** Pakiet przychodzący z urządzenia. */
export type TelemetryPacket = {
  readonly schemaVersion: 'eos.telemetry.v1';
  /** sha256( serial | occurredAt | monotonicCounter ). */
  readonly idempotencyKey: string;
  readonly device: {
    readonly serialNumber: string;
    readonly modelCode: string;
    readonly modality: DeviceModality;
    readonly siteRef: string;
  };
  readonly eventType: TelemetryEventType;
  readonly occurredAt: string;
  /** Anonimowy token sesji. NIE jest kluczem do osoby. */
  readonly sessionToken?: string;
  /** Sekundy pracy. Obowiązkowe dla runtime_tick i session_completed. */
  readonly runtimeDeltaSeconds?: number;
  readonly sensors?: Readonly<Record<string, number>>;
};

export type ServiceOrderStatus =
  | 'draft'
  | 'sent_to_oem'
  | 'acknowledged'
  | 'completed'
  | 'cancelled';

export type ServiceOrder = {
  readonly id: string;
  readonly oemTenantId: string;
  readonly deviceId: string;
  readonly intervalId: string;
  readonly runtimeHoursAtOrder: number;
  readonly thresholdHours: number;
  readonly status: ServiceOrderStatus;
  readonly createdAt: string;
};

/** Przedział progu. Mandat: 200–300 h; wybór wewnątrz to decyzja, nie przypadek. */
export function resolveServiceThreshold(hours: number): number {
  if (!Number.isInteger(hours) || hours < SERVICE_THRESHOLD_MIN_HOURS || hours > SERVICE_THRESHOLD_MAX_HOURS) {
    throw new RangeError(
      `próg musi być liczbą całkowitą w przedziale ${String(SERVICE_THRESHOLD_MIN_HOURS)}–${String(SERVICE_THRESHOLD_MAX_HOURS)} h, otrzymano: ${String(hours)}`,
    );
  }
  return hours;
}

/**
 * Próg ostrzegawczy — godziny, od których OEM dostaje sygnał ZANIM
 * urządzenie osiągnie próg zamówienia.
 *
 * `SERVICE_WARN_RATIO_BASIS_POINTS = 8_000` oznacza 80% progu. Dla progu
 * 200 h ostrzeżenie następuje w 160 h, z 40 h zapasu.
 *
 * [DECISION: 2026-10-15] BUG W TEJ FUNKCJI, ZNALEZIONY PRZEZ MODUŁ 1.
 * Implementacja odejmowała `próg × 0.8` od progu, czyli dawała
 * `próg × 0.2` — czyli 40 h dla progu 200 h zamiast 160 h. Nazwa stałej
 * mówiła 80%, kod liczył 20%. Moduł 1 wykrył to i przypiął swoje testy do
 * ZALEŻNOŚCI od tej funkcji zamiast do liczby, co jest właściwą reakcją na
 * obcą własność. Ale liczba musi być poprawna: Moduł 1 ostrzegałby o 160 h,
 * a Moduł 2 o 40 h na tej samej flocie.
 */
export function serviceWarnHours(thresholdHours: number): number {
  return Math.round((thresholdHours * SERVICE_WARN_RATIO_BASIS_POINTS) / 10_000);
}
