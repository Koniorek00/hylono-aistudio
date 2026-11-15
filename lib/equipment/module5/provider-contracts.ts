/**
 * [DECISION: 2026-10-15] Moduł 5 — umowa z dostawcami danych z opasek.
 *
 * STAN RZECZY, którego nie wolno pominąć przy czytaniu tego pliku:
 * W tym repo nie ma ani jednego klucza dostępu do Oury, Garmina, Whoop,
 * Apple Health ani Polar. Nie ma też kodu sieciowego, który by po nie
 * sięgał. Każdy dostawca wymaga własnego OAuth i własnych danych
 * dostępowych, których ten moduł nie posiada.
 *
 * Dlatego `createProvider()` zwraca implementację, która rzuca
 * `NotConfiguredError` z nazwą brakującej zmiennej środowiskowej. Nie ma
 * trybu cicho zwracającego pustą listę — panel pokazałby wtedy pustą
 * serię jako brak odczytu, a użytkownik wnioskowałby z niej, że opaska
 * nie działa. Brak konfiguracji musi być widoczny, nie zamaskowany.
 *
 * Dane testowe pochodzą wyłącznie z `createFixtureProvider` i są oznaczone
 * polem `synthetic: true`. Raport z danych syntetycznych zatrzymuje
 * `roi-report.ts` przed pokazaniem.
 *
 * Dane z opaski to dane zdrowotne. `shared/zero-pii.ts` ich celowo nie
 * obsługuje — odrzuca nazwy pól hrv, sleep, consent, wearable. Zgoda i
 * granice danych należą do Modułu 4. Dopóki plik schematu Modułu 4 nie
 * istnieje, ten plik deklaruje własne TYPY zgody i nie tworzy plików
 * Modułu 4. Po jego powstaniu typy zgody mają zostać zastąpione
 * pomocnikami Modułu 4, nie powielonymi.
 */

/** Wersja kontraktu danych biometrycznych — spójna z wersją telemetrii. */
export const BIOMETRIC_CONTRACT_VERSION = 'eos.biometric.v1';

export const BIOMETRIC_PROVIDER_IDS = [
  'oura',
  'garmin',
  'whoop',
  'apple_health',
  'polar',
] as const;
export type BiometricProviderId = (typeof BIOMETRIC_PROVIDER_IDS)[number];

export const PROVIDER_LABELS: Readonly<Record<BiometricProviderId, string>> = {
  oura: 'Oura',
  garmin: 'Garmin',
  whoop: 'Whoop',
  apple_health: 'Apple Health',
  polar: 'Polar',
};

/**
 * Zmienne środowiskowe, których brakuje. Nazwy są kontraktem: komunikat
 * błędu ma wskazać operatorowi dokładnie co wpisać, a nie ogólnie „brak
 * konfiguracji".
 */
export const REQUIRED_CREDENTIAL_ENV_VARS: Readonly<Record<BiometricProviderId, string>> = {
  oura: 'OURA_PERSONAL_ACCESS_TOKEN',
  garmin: 'GARMIN_HEALTH_CLIENT_SECRET',
  whoop: 'WHOOP_CLIENT_SECRET',
  apple_health: 'APPLE_HEALTH_EXPORT_DIRECTORY',
  polar: 'POLAR_ACCESS_TOKEN',
};

/**
 * Synchronizacja na żywo nie jest skonfigurowana. Stała istnieje po to, żeby
 * warstwa UI nie musiała zgadywać: ma jedno źródło prawdy o braku kluczy.
 */
export const LIVE_SYNC_AVAILABLE = false;

/** Jeden dzień z opaski. `null` = brak odczytu, nigdy 0. */
export type BiometricDay = {
  /** RRRR-MM-DD, czas lokalny obiektu. */
  readonly day: string;
  readonly deepSleepMinutes: number | null;
  readonly hrvRmssdMs: number | null;
};

/** Wynik odczytu. `synthetic: true` oznacza dane testowe, nie pomiar. */
export type BiometricFetchResult = {
  readonly providerId: BiometricProviderId;
  readonly synthetic: boolean;
  readonly days: readonly BiometricDay[];
};

export const BIOMETRIC_SCOPES = ['daily_summary'] as const;
export type BiometricScope = (typeof BIOMETRIC_SCOPES)[number];

/**
 * Zgoda użytkownika na odczyt dla jednego dostawcy. Typ lokalny Modułu 5 —
 * zastąpić pomocnikami Modułu 4, gdy schemat warstwy zdrowia powstanie.
 */
export type BiometricConsent = {
  readonly providerId: BiometricProviderId;
  readonly scope: BiometricScope;
  readonly grantedAt: string | null;
  readonly revokedAt: string | null;
};

export type BiometricAuthorization = {
  readonly providerId: BiometricProviderId;
  readonly scope: BiometricScope;
  readonly grantedAt: string;
};

export interface BiometricProvider {
  readonly providerId: BiometricProviderId;
  readonly label: string;
  readonly requiredCredentialEnvVar: string;
  authorize(): Promise<BiometricAuthorization>;
  fetchDaily(fromIso: string, toIso: string): Promise<BiometricFetchResult>;
  revoke(): Promise<void>;
}

/** Brak danych dostępowych do dostawcy. Nazywa brakującą zmienną. */
export class NotConfiguredError extends Error {
  readonly providerId: BiometricProviderId;
  readonly missingCredentialEnvVar: string;

  constructor(providerId: BiometricProviderId) {
    const label = PROVIDER_LABELS[providerId];
    const envVar = REQUIRED_CREDENTIAL_ENV_VARS[providerId];
    super(
      `${label}: brak danych dostępowych. Ustaw ${envVar}. Odczyt na żywo nie jest skonfigurowany.`,
    );
    this.name = 'NotConfiguredError';
    this.providerId = providerId;
    this.missingCredentialEnvVar = envVar;
  }
}

/** Brak zgody użytkownika na ten dostawca. Rzucane przed odczytem. */
export class BiometricConsentRequiredError extends Error {
  readonly providerId: BiometricProviderId;

  constructor(providerId: BiometricProviderId) {
    super(
      `Brak zgody użytkownika na dane z: ${PROVIDER_LABELS[providerId]}. Odczyt wstrzymany.`,
    );
    this.name = 'BiometricConsentRequiredError';
    this.providerId = providerId;
  }
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** RRRR-MM-DD, data, która istnieje w kalendarzu. Rzuca RangeError. */
export function assertIsoDay(value: string, label = 'data'): string {
  if (!ISO_DAY.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00.000Z`))) {
    throw new RangeError(`${label} musi być datą RRRR-MM-DD, otrzymano: ${value}`);
  }
  return value;
}

function assertRange(fromIso: string, toIso: string): void {
  assertIsoDay(fromIso, 'od');
  assertIsoDay(toIso, 'do');
  if (fromIso > toIso) {
    throw new RangeError(`zakres dat odwrócony: od ${fromIso} do ${toIso}`);
  }
}

/** Zgoda jest ważna, gdy jej udzielono i nie cofnięto. */
export function isConsentGranted(
  consent: BiometricConsent | null | undefined,
): consent is BiometricConsent {
  return (
    consent !== null &&
    consent !== undefined &&
    consent.grantedAt !== null &&
    consent.revokedAt === null
  );
}

/** Rzuca `BiometricConsentRequiredError`, gdy zgody brakuje albo jest inna. */
export function assertBiometricConsent(
  providerId: BiometricProviderId,
  consent: BiometricConsent | null | undefined,
): BiometricConsent {
  if (!isConsentGranted(consent) || consent.providerId !== providerId) {
    throw new BiometricConsentRequiredError(providerId);
  }
  return consent;
}

/**
 * Odczyt pod bramką zgody. Zgoda sprawdzana jest PRZED wywołaniem dostawcy,
 * żeby brak zgody nie zostawiał śladu w postępowaniu po stronie API.
 */
export async function fetchDailyWithConsent(
  provider: BiometricProvider,
  consent: BiometricConsent | null | undefined,
  fromIso: string,
  toIso: string,
): Promise<BiometricFetchResult> {
  assertBiometricConsent(provider.providerId, consent);
  return provider.fetchDaily(fromIso, toIso);
}

function createUnconfiguredProvider(providerId: BiometricProviderId): BiometricProvider {
  return {
    providerId,
    label: PROVIDER_LABELS[providerId],
    requiredCredentialEnvVar: REQUIRED_CREDENTIAL_ENV_VARS[providerId],
    authorize: () => Promise.reject<BiometricAuthorization>(new NotConfiguredError(providerId)),
    fetchDaily: () => Promise.reject<BiometricFetchResult>(new NotConfiguredError(providerId)),
    revoke: () => Promise.reject<void>(new NotConfiguredError(providerId)),
  };
}

/**
 * Fabryka dostawcy. Zawsze zwraca implementację bez konfiguracji — w tym
 * repo nie ma kluczy, więc nie ma wariantu działającego.
 */
export function createProvider(providerId: BiometricProviderId): BiometricProvider {
  return createUnconfiguredProvider(providerId);
}

/** Mapa wszystkich dostawców w stanie bez konfiguracji. */
export function createUnconfiguredProviders(): Readonly<
  Record<BiometricProviderId, BiometricProvider>
> {
  return {
    oura: createProvider('oura'),
    garmin: createProvider('garmin'),
    whoop: createProvider('whoop'),
    apple_health: createProvider('apple_health'),
    polar: createProvider('polar'),
  };
}

export type FixtureProviderOptions = {
  /** Stała data udzielenia zgody — wynik testu nie zależy od zegara. */
  readonly authorizedAt?: string;
};

const FIXTURE_AUTHORIZED_AT = '2026-01-01T00:00:00.000Z';

/**
 * Dostawca testowy. Deterministyczny, bez sieci i bez losowości. Każdy
 * zwrócony wynik ma `synthetic: true`, a `roi-report.ts` odmawia raportu
 * na danych syntetycznych, dopóki caller nie poda ich jawnie.
 */
export function createFixtureProvider(
  days: readonly BiometricDay[],
  options: FixtureProviderOptions = {},
): BiometricProvider {
  const authorizedAt = options.authorizedAt ?? FIXTURE_AUTHORIZED_AT;
  const rows = [...days].sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0));
  return {
    providerId: 'oura',
    label: 'Oura',
    requiredCredentialEnvVar: REQUIRED_CREDENTIAL_ENV_VARS.oura,
    authorize: () =>
      Promise.resolve<BiometricAuthorization>({
        providerId: 'oura',
        scope: 'daily_summary',
        grantedAt: authorizedAt,
      }),
    fetchDaily: async (fromIso, toIso) => {
      assertRange(fromIso, toIso);
      const filtered = rows.filter((row) => row.day >= fromIso && row.day <= toIso);
      return {
        providerId: 'oura',
        synthetic: true,
        days: filtered,
      };
    },
    revoke: () => Promise.resolve(),
  };
}