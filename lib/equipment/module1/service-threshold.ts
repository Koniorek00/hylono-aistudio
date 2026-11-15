/**
 * [DECISION: 2026-10-15] Próg przeglądu i poziomy degradacji.
 *
 * Mandat podaje ZAKRES 200–300 h, nie jedną liczbą. Liczba z zakresu to
 * decyzja gospodarcza, więc jest jawna, ma źródło (konfiguracja globalna
 * albo deklaracja producenta) i uzasadnienie, które da się zakwestionować.
 * Domyślna wartość to DOLNY koniec przedziału — patrz uzasadnienie niżej.
 *
 * Procent degradacji trzymany jest w PUNKTACH PROCENTOWYCH, a progi w
 * PUNKTACH BASIS POINTS (1% = 100 bp). Powód: `0.15 + 0.15 === 0.3` to w JS
 * prawda, ale `0.1 + 0.2 === 0.30000000000000004` też, a granica alertu
 * nie może zależeć od tego, w jakiej kolejności dodawano liczby. Całkowite
 * bp zdejmują ten problem z definicji.
 */

import {
  SERVICE_THRESHOLD_MAX_HOURS,
  SERVICE_THRESHOLD_MIN_HOURS,
  resolveServiceThreshold,
  serviceWarnHours,
} from '@/lib/equipment/domain/contract';

/** Konfiguracja floty: nadpisanie per kontrahent + wartość globalna. */
export type FleetThresholdConfig = {
  /** Wartość dla całej floty, gdy kontrahent nie ma własnej. */
  readonly globalDefaultHours?: number;
  /** Klucz to `oemTenantId`. */
  readonly tenantOverrides?: Readonly<Record<string, number>>;
};

/** Skąd wzięła się wartość. Panel OEM pokazuje to razem z progiem. */
export type ThresholdSource = 'tenant_override' | 'global_default' | 'mandate_floor';

export type FleetThresholdDecision = {
  readonly thresholdHours: number;
  readonly source: ThresholdSource;
  /** Godziny, od których OEM dostaje ostrzeżenie wyprzedzające. */
  readonly warnHours: number;
  /** Dlaczego ta wartość. W języku operatora, nie językiem prawnym. */
  readonly justification: string;
};

/** Domyślnie bierzemy 200 h — dolny koniec przedziału mandatu. */
export const DEFAULT_FLEET_THRESHOLD_HOURS = SERVICE_THRESHOLD_MIN_HOURS;

/** Dolna i górna granica przedziału, skopiowane do komunikatów diagnostycznych. */
export const THRESHOLD_BOUNDS = {
  min: SERVICE_THRESHOLD_MIN_HOURS,
  max: SERVICE_THRESHOLD_MAX_HOURS,
} as const;

/**
 * Uzasadnienie progu domyślnego. Jedyne miejsce w systemie, w którym
 * pojawia się kwota pieniężna dotycząca progu.
 *
 * [ZAŁOŻENIE] Stawka 60 PLN za godziną postoju maszyny pochodzi od
 * operatora, nie z cennika ani z wyliczenia. Jeśli stawka się zmieni,
 * zmienia się JEDEN literę w tym pliku i nic poza nim — dlatego jest
 * wyodrębniony, a nie wplątany w kod.
 */
export const DEFAULT_THRESHOLD_JUSTIFICATION = [
  'Próg 200 h to dolny koniec przedziału z mandatu (200-300 h),',
  'więc przegląd powstaje zanim licznik dorośnie do zalecenia producenta.',
  'Różnica między 200 h a 300 h to 100 h pracy maszyny BEZ zlecenia,',
  'czyli 100 godzin postoju na urządzenie.',
  'Przy stawce 60 PLN za godziną postoju to 6000 PLN mniej straty na maszynę',
  '[ZAŁOŻENIE: stawka od operatora, nie z cennika].',
  'Koszt wcześniejszego przeglądu zwraca się przy jednym pojedynczym przeglądzie,',
  'a OEM i tak dostaje ostrzeżenie wyprzedzające na progu ostrzegawczym z kontraktu,',
  'więc wybór 200 h nie odbiera kontrahentowi czasu na zaplanowanie okna serwisowego.',
].join(' ');

/** Klucz odczytu degradacji przepływu w mapie `sensors` pakietu. */
export const FLOW_DEGRADATION_SENSOR_KEY = 'flow_degradation_percent';

export type DegradationSeverity = 'none' | 'watch' | 'alert' | 'critical';

/**
 * Progi degradacji w punktach basis points (1 punkt procentowy = 100 bp).
 *
 * [ZAŁOŻENIE] Wartości dobrane jako rzędy wielkości dla sprzętu, nie
 * jako pomiar: 5% obniżenia przepływu jest widoczne w logu serwisowym,
 * 15% dochodzi do niego klient, 25% oznacza, że wymiana elementu jest
 * kwestią tygodni. Progi są jednym miejscem do podmiany po wejściu
 * danych serwisowych z floty.
 */
export const DEGRADATION_THRESHOLDS_BASIS_POINTS = {
  watch: 500,
  alert: 1500,
  critical: 2500,
} as const as Readonly<Record<Exclude<DegradationSeverity, 'none'>, number>>;

function justificationFor(source: ThresholdSource, hours: number): string {
  if (source === 'tenant_override') {
    return (
      `Próg zadeklarowany przez producenta dla tego kontrahenta: ${String(hours)} h. ` +
      'Wartość wewnątrz przedziału z mandatu; poza nim zgłoszenie jest odrzucane przed zapisem.'
    );
  }
  if (hours === DEFAULT_FLEET_THRESHOLD_HOURS) {
    return DEFAULT_THRESHOLD_JUSTIFICATION;
  }
  return (
    `Próg globalny ustawiony na ${String(hours)} h — wewnątrz przedziału z mandatu. ` +
    'Każda godzina powyżej 200 h wydłuża czas do automatycznego zlecenia, ' +
    'więc ustawienie to świadomy wybór operatora, a nie wartość domyślna systemu.'
  );
}

/**
 * Pełna decyzja o progu: wartość, źródło, próg ostrzegawczy i uzasadnienie.
 *
 * Kolejność źródeł: nadpisanie kontrahenta, potem wartość globalna, potem
 * dolny koniec przedziału mandatu. Każda wartość przechodzi przez
 * `resolveServiceThreshold` z kontraktu, więc 199 h i 301 h wywalają
 * `RangeError` ZANIM cokolwiek trafi do bazy — žby próg nie może zostać
 * zapisany i cicho obowiązywał na całej flocie.
 */
export function resolveFleetThresholdDecision(
  config: FleetThresholdConfig = {},
  tenantId?: string,
): FleetThresholdDecision {
  const override = tenantId === undefined ? undefined : config.tenantOverrides?.[tenantId];

  if (override !== undefined) {
    const hours = resolveServiceThreshold(override);
    return {
      thresholdHours: hours,
      source: 'tenant_override',
      warnHours: serviceWarnHours(hours),
      justification: justificationFor('tenant_override', hours),
    };
  }

  if (config.globalDefaultHours !== undefined) {
    const hours = resolveServiceThreshold(config.globalDefaultHours);
    return {
      thresholdHours: hours,
      source: 'global_default',
      warnHours: serviceWarnHours(hours),
      justification: justificationFor('global_default', hours),
    };
  }

  const hours = resolveServiceThreshold(DEFAULT_FLEET_THRESHOLD_HOURS);
  return {
    thresholdHours: hours,
    source: 'mandate_floor',
    warnHours: serviceWarnHours(hours),
    justification: justificationFor('mandate_floor', hours),
  };
}

/**
 * Sam próg w godzinach. Wywołanie bez kontrahenta daje wartość floty.
 * Pełna decyzja (źródło, ostrzeżenie, uzasadnienie) idzie przez
 * `resolveFleetThresholdDecision`.
 */
export function resolveFleetThreshold(config: FleetThresholdConfig = {}): number {
  return resolveFleetThresholdDecision(config).thresholdHours;
}

/**
 * Poziom degradacji przepływu.
 *
 * `null` = brak odczytu, nie zero procent. Urządzenie, które milczało,
 * nie jest zdrowe ani chore — nie ma odczytu, więc nie ma poziomu.
 * Wartość spoza 0–100 to błąd urządzenia, nie obserwacja: `RangeError`,
 * bo cicha korekta w danych ukryłaby usterkę firmware'u.
 *
 * Ucięcie do całych punktów basis points, NIE zaokrąglenie. Zaokrąglenie
 * podbijałoby ostatnią cyfrę odczytu w górę: 4,999999% to 499 bp, czyli
 * poniżej progu 500 bp. Podbicie z 499 do 500 podniosłoby poziom alertu
 * przez artefakt zapisu zmiennoprzecinkowego, a nie przez obserwację.
 */
export function degradationSeverity(percent: number | null): DegradationSeverity {
  if (percent === null) return 'none';
  if (typeof percent !== 'number' || !Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new RangeError(
      `degradacja musi być wartością w przedziale 0–100 albo null, otrzymano: ${String(percent)}`,
    );
  }

  const basisPoints = Math.floor(percent * 100);
  const thresholds = DEGRADATION_THRESHOLDS_BASIS_POINTS;

  if (basisPoints >= thresholds.critical) return 'critical';
  if (basisPoints >= thresholds.alert) return 'alert';
  if (basisPoints >= thresholds.watch) return 'watch';
  return 'none';
}

/** Poziomy, przy których OEM ma dostać powiadomienie, a nie tylko wpis w logu. */
export function isActionableDegradation(severity: DegradationSeverity): boolean {
  return severity === 'alert' || severity === 'critical';
}

