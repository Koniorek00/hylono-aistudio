/**
 * [DECISION: 2026-10-15] Uwierzytelnianie urządzenia na wejściu sieciowym.
 *
 * Podpis HMAC-SHA256, NIE token bearer. Powód jest w naturze credentiala:
 * token bearer to sekret, który leci w nagłówku i da się go skopiować z
 * loga, z dev toolsa i z pamięci podręcznej proxy. Jest w porządku, gdy
 * sekret należy do CZŁOWIEKA, który da się zidentyfikować i odwołać.
 * Ten sekret należy do MASZYNY stojącej w obiekcie na piętrze trzecim,
 * a maszyny nikt nie odwoła — i nikt nie zauważy, że ktoś skopiował
 * nagłówek z loga serwera wieczorem. Podpis z timestampem i skrótem ciała
 * daje inną własność: atakujący musi znać sekret, a sam podpis nie jest
 * sekretem i nie da się go odtworzyć dla innego ciała albo innej ścieżki.
 *
 * Dlaczego kanoniczny string zaczyna się od wersji: podpis musi dać się
 * unieważnić w chwili zmiany formatu, a nie po cichu zaczynać akceptować
 * stare podpisy. Wersja jako PIERWSZA podpisywana linia oznacza, że
 * zmiana formatu unieważnia wszystkie dotychczasowe podpisy automatycznie —
 * żadnego kodu wyłączającego, żadnej listy wyjątków do utrzymania.
 *
 * DLACZEGO BRAK NONCE — i czego to NIE jest ochroną. Okno czasowe ±300 s
 * NIE jest ochroną przed powtórzeniem żądania. Powtórzony podpisany
 * request wciąż przechodzi weryfikację, bo weryfikacja nie ma stanu:
 * nie ma magazynu nonce, nie ma tabeli w użyciu. Ochronę przed retransmisją
 * daje `idempotencyKey` w ciele pakietu, bramkowana atomowo w bazie przez
 * `TelemetryIngest.claim` (patrz `module1/ports.ts`) — i to jest jedyna
 * bramka, która NAPRAWDĘ usuwa duplikat. Okno czasowe jest natomiast
 * ochroną przed PODRÓBIONYM podpisem sprzed tygodnia: bez niego ktoś
 * przechwycony podpis mógłby być odtwarzany bezterminowo. To dwie różne
 * groźby, dwie różne bramki. Stwierdzenie, że znacznik czasu chroni przed
 * replayem, byłoby kłamstwem — on chroni przed odtwarzaniem starych
 * podpisów, a duplikaty usuwa klucz idempotencji.
 *
 * Brak `Math.random` i `Date.now` w tej warstwie jest celowy: zegar jest
 * wstrzykiwany (`Clock`), więc podpis da się odtworzyć w teście co do
 * bajtu. Podpis, którego nie da się powtórzyć w teście, jest podpisem,
 * którego nie da się zdebugować w produkcji.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import { payloadHash } from '@/lib/equipment/shared/ids';

/** Wersja podpisywanego formatu. Pierwsza linia kanonicznego stringa. */
export const DEVICE_SIGNATURE_VERSION = 'EOS-DEVICE-V1';

/**
 * Okno akceptacji znacznika czasu, w SEKUNDACH.
 *
 * [DECISION: 2026-10-15] Domyślnie ±300 s, czyli 5 minut w każdą stronę.
 * Zakres jest wstrzykiwany do `verifyDeviceRequest`, bo wartość operacyjna
 * zależy od tego, jak długo urządzenie potrafi leżeć bez sieci: maszyna w
 * piwnicy z jednym słabym modemem potrafi nadrobić dziesięciominutową
 * lukę w sieci, a potrzebujący podpisania podglądu w laboratorium na
 * biurku operatora nie. Stała wartość na sztywno zamrożona w kodzie
 * wymagałaby wydań wdrożeniowych tylko po to, żeby poprawić tolerancję
 * zegara, a zegar maszyny jest elementem, który się rozjedzie.
 */
export const DEVICE_REPLAY_WINDOW_SECONDS = 300;

/** Nazwa zmiennej środowiskowej z mapą `SERIAL=sekret`. */
export const DEVICE_SECRET_ENV_VAR = 'EOS_DEVICE_SECRETS';

export const DEVICE_SERIAL_HEADER = 'x-eos-serial';
export const DEVICE_TIMESTAMP_HEADER = 'x-eos-timestamp';
export const DEVICE_SIGNATURE_HEADER = 'x-eos-signature';

const SIGNATURE_HEX_PATTERN = /^[a-f0-9]{64}$/;
const EPOCH_SECONDS_PATTERN = /^\d{1,15}$/;
const HMAC_OUTPUT_BYTES = 32;

/**
 * Zegar wstrzykiwany. Zwraca milisekundy od epoki, jak `Date.now`.
 * Osobny typ po to, żeby sygnatura nie mogła sięgnąć po zegar globalny:
 * jeśli ktoś podmieni implementację, zmieni ją w jednym miejscu.
 */
export type Clock = () => number;

/**
 * Kody odmowy. Rozdzielone, bo urządzenie musi wiedzieć CO poprawić:
 * zegar (okno czasu), firmware (format podpisu) albo konfiguracja serwera
 * (nieznany numer seryjny). Jeden kod „nieautoryzowane” zjadłby te trzy.
 */
export type DeviceSignatureFailureCode =
  | 'malformed_signature'
  | 'timestamp_out_of_window'
  | 'unknown_device'
  | 'signature_mismatch'
  | 'device_secret_unconfigured';

/**
 * Brak konfiguracji sekretów. OSOBNY typ, osobny kod, osobna odpowiedź HTTP.
 *
 * [DECISION: 2026-10-15] Brak zmiennej środowiskowej to NIE pusta mapa.
 * Pusta mapa oznacza „flota istnieje, żadna maszyna nie ma sekretu" i
 * daje 404 dla każdego numeru seryjnego — czyli symptom identyczny z
 * „ktoś podał nieistniejący numer". Pusty konfig wygląda wtedy jak flota,
 * która zgubiła klucze, a nie jak wdrożenie, które ich nie wydało. Stąd
 * ten typ: pusta mapa i brak konfiguracji muszą dać się rozróżnić.
 */
export class DeviceSecretConfigurationError extends Error {
  readonly variable: string;

  constructor(variable: string) {
    super(
      `Zmienna środowiskowa ${variable} nie jest ustawiona albo jest pusta, ` +
        'więc nie ma żadnego sekretu urządzenia do weryfikacji podpisu.',
    );
    this.name = 'DeviceSecretConfigurationError';
    this.variable = variable;
  }
}

/** Źródło sekretu maszyny. Wstrzykiwane, żeby test nie potrzebował procesu. */
export interface DeviceSecretResolver {
  /**
   * `null` = ten numer seryjny nie ma przypisanego sekretu.
   * Rzuca `DeviceSecretConfigurationError`, gdy sekretów nie da się w ogóle
   * odczytać — to inna sytuacja niż brak jednego wpisu.
   */
  resolveSecret(serialNumber: string): Promise<string | null>;
}

/** Wynik weryfikacji podpisu. */
export type DeviceSignatureVerification =
  | {
      readonly ok: true;
      readonly serialNumber: string;
      readonly canonical: string;
      readonly timestampSeconds: number;
      readonly replayWindowSeconds: number;
    }
  | {
      readonly ok: false;
      readonly code: DeviceSignatureFailureCode;
      readonly detail: string;
    };

/** Kanoniczny string — dokładnie 5 linii, brak ukrytych znaków. */
export type CanonicalRequestInput = {
  readonly method: string;
  readonly path: string;
  readonly timestampSeconds: number;
  readonly body: string;
};

export type SignDeviceRequestInput = {
  readonly method: string;
  readonly path: string;
  /** Epoka w SEKUNDACH albo `Date`. Podpis nie ma własnego zegara. */
  readonly timestamp: number | Date;
  readonly body: string;
  readonly secret: string;
};

export type SignedDeviceRequest = {
  readonly signature: string;
  /** Zawsze w sekundach, zawsze jako liczba do tekstu. */
  readonly timestamp: number;
  readonly canonical: string;
};

export type VerifyDeviceRequestInput = {
  readonly method: string;
  readonly path: string;
  /** Surowy tekst ciała. Podpis liczy się z BAJTÓW, nie z obiektu. */
  readonly rawBody: string;
  /** Nagłówki z kluczami w małych literach. */
  readonly headers: Readonly<Record<string, string>>;
  readonly secrets: DeviceSecretResolver;
  readonly now: Clock;
  readonly replayWindowSeconds?: number;
};

function requireNonEmptySecret(serialNumber: string, secret: string): void {
  if (secret.length === 0) {
    throw new DeviceSecretConfigurationError(
      `${DEVICE_SECRET_ENV_VAR}[${serialNumber}] jest wpisem pustym, a nie sekretem`,
    );
  }
}

/**
 * Górna granica epoki w sekundach: 9999-12-31.
 *
 * [DECISION: 2026-10-15] Granica jest tu z powodu JEDNEGO konkretnego błędu,
 * który bez niej przechodziłby przez bramkę: caller podający milisekundy
 * (`Date.now()`) zamiast sekund. Liczba 1 700 000 000 000 jest całkowitą
 * i dodatnią, więc sama w sobie wygląda poprawnie — tyle że jako sekundy
 * to rok 55 000, a podpis takiego żądania nigdy nie przejdzie i komunikat
 * błędu będzie miał pięćdziesiąt tysięcy lat opóźnienia. Odrzucenie
 * wartości spoza zakresu kalendarzaowego zamienia milisekundy w czytelny
 * błąd w miejscu, w którym caller może go naprawić.
 */
export const MAX_EPOCH_SECONDS = 253_402_300_799;

/** Epoka w sekundach. Liczby wejściowe SĄ sekundami, nie milisekundami. */
export function toEpochSeconds(value: number | Date): number {
  if (value instanceof Date) {
    const ms = value.getTime();
    if (!Number.isFinite(ms)) {
      throw new RangeError(`znacznik czasu nie jest poprawną datą: ${String(value)}`);
    }
    return Math.floor(ms / 1000);
  }

  if (!Number.isInteger(value) || value < 0 || value > MAX_EPOCH_SECONDS) {
    throw new RangeError(
      `znacznik czasu musi być liczbą całkowitą w sekundach od epoki, ` +
        `w przedziale 0–${String(MAX_EPOCH_SECONDS)}, otrzymano: ${String(value)}`,
    );
  }
  return value;
}

/**
 * Buduje kanoniczny string podpisu. Pięć linii, znak po znaku:
 *
 *   1. wersja formatu,
 *   2. metoda wielkimi literami,
 *   3. ścieżka (bez hosta i bez query — query jest częścią decyzji routingu),
 *   4. znacznik czasu w sekundach,
 *   5. skrót sha256 ciała.
 *
 * Ścieżka jest BEZ query stringu celowo: `/api/equipment/telemetry` i
 * `/api/equipment/telemetry?x=1` to ten sam zasób, a podpisanie query
 * sprawiłoby, że podpis trzeba przeliczać w każdym miejscu, gdzie klient
 * dokleja parametr śledzący. Ścieżka jest z KROJU — nieznormalizowana —
 * bo normalizacja w dwóch miejscach to klasyczna droga do podpisu, który
 * przechodzi lokalnie i nie przechodzi w produkcji.
 */
export function buildCanonicalRequestString(input: CanonicalRequestInput): string {
  return [
    DEVICE_SIGNATURE_VERSION,
    input.method.toUpperCase(),
    input.path,
    String(input.timestampSeconds),
    payloadHash(input.body),
  ].join('\n');
}

/** Podpisuje żądanie urządzenia. Deterministyczny: te same wejścia → ten sam podpis. */
export function signDeviceRequest(input: SignDeviceRequestInput): SignedDeviceRequest {
  const timestampSeconds = toEpochSeconds(input.timestamp);
  const canonical = buildCanonicalRequestString({
    method: input.method,
    path: input.path,
    timestampSeconds,
    body: input.body,
  });

  const signature = createHmac('sha256', input.secret).update(canonical, 'utf8').digest('hex');

  return { signature, timestamp: timestampSeconds, canonical };
}

/** Porównanie stałoczasowe — brak wycieku z porównania znak po znaku. */
function signaturesMatch(provided: string, expected: string): boolean {
  const a = Buffer.from(provided, 'hex');
  const b = Buffer.from(expected, 'hex');
  if (a.length !== b.length || a.length !== HMAC_OUTPUT_BYTES) return false;
  return timingSafeEqual(a, b);
}

function failure(code: DeviceSignatureFailureCode, detail: string): DeviceSignatureVerification {
  return { ok: false, code, detail };
}

function readHeader(headers: Readonly<Record<string, string>>, name: string): string | null {
  const value = headers[name];
  if (typeof value !== 'string') return null;
  return value.trim();
}

/**
 * Parsuje `SERIAL=sekret,SERIAL2=sekret`.
 *
 * Wpis z numerem seryjnym i PUSTYM sekretem to `DeviceSecretConfigurationError`,
 * a nie pominięty wpis. [DECISION: 2026-10-15] Pierwsza wersja pomijała
 * taki wpis, co oznaczało, że maszyna z pustym kluczem w pliku floty
 * wyglądała dokładnie jak maszyna, której nikt nie wydał — obie dostawały
 * `unknown_device`. Pominięta pusta wartość jest najgorszym możliwym
 * miejscem na zgłoszenie błędu konfiguracji, bo diagnozę „nie znamy
 * takiego urządzenia" kieruje do operatora, a przyczyna jest w pliku,
 * który operator właśnie edytuje.
 *
 * Duplikat numeru seryjnego: ostatni wpis wygrywa. To świadoma decyzja,
 * a nie brak uwagi: konfiguracja floty powstaje przez sklejanie plików
 * per obiekt i nikt nie czyta ich w całości. Ostatni wpis wygrywa, bo
 * plik dołączany później jest nowszym stanem prawdy. Mylący się wpis
 * i tak zostanie wykryty: podpis nie przejdzie i flota zamilknie.
 */
export function parseDeviceSecrets(raw: string): ReadonlyMap<string, string> {
  const entries = raw
    .split(',')
    .map((pair) => pair.trim())
    .filter((pair) => pair.length > 0);

  const secrets = new Map<string, string>();
  for (const pair of entries) {
    const separator = pair.indexOf('=');
    // Brak separatora to przecinek ze śmieciem, np. końcowy znak
    // konfiguracji. Pomijamy, bo nie ma w nim numeru do zgłoszenia.
    if (separator <= 0) continue;
    const serial = pair.slice(0, separator).trim();
    const secret = pair.slice(separator + 1).trim();
    if (serial.length === 0) continue;
    if (secret.length === 0) {
      throw new DeviceSecretConfigurationError(`${DEVICE_SECRET_ENV_VAR}[${serial}]`);
    }
    secrets.set(serial, secret);
  }
  return secrets;
}

/**
 * Sekrety ze zmiennej środowiskowej. Domyślny resolver dla produkcji.
 *
 * Brak zmiennej → `DeviceSecretConfigurationError`, nigdy pusta mapa.
 */
export function createEnvDeviceSecretResolver(
  env: Readonly<Record<string, string | undefined>> = process.env,
  variable: string = DEVICE_SECRET_ENV_VAR,
): DeviceSecretResolver {
  return {
    async resolveSecret(serialNumber: string): Promise<string | null> {
      const raw = env[variable];
      if (raw === undefined || raw.trim().length === 0) {
        throw new DeviceSecretConfigurationError(variable);
      }

      const secrets = parseDeviceSecrets(raw);
      const secret = secrets.get(serialNumber);
      if (secret === undefined) return null;
      requireNonEmptySecret(serialNumber, secret);
      return secret;
    },
  };
}

/**
 * Resolver ze stałej mapy. Dla testów i dla wdrożeń z pliku.
 *
 * [DECISION: 2026-10-15] Przyjmuje mapę albo zwykły obiekt, bo plik
 * konfiguracyjny floty bywa wczytywany do obiektu bez zmiany kształtu,
 * a pisanie po obu stronach `get` i indeksie kolidowałoby z bramkowaniem
 * `__tests__`. Rzutowanie jest tu jawne, bo `ReadonlyMap` jest interfejsem
 * strukturalnym i `instanceof Map` nie zawęża typu w gałęzi przeciwnej —
 * zawężanie po klamrach jest jedynym miejscem, w którym ta różnica jest
 * widoczna, a nie w każdym wywołaniu z osobna.
 */
export function createStaticDeviceSecretResolver(
  secrets: ReadonlyMap<string, string> | Readonly<Record<string, string>>,
  variable: string = DEVICE_SECRET_ENV_VAR,
): DeviceSecretResolver {
  const asMap = secrets as ReadonlyMap<string, string>;
  const asRecord = secrets as Readonly<Record<string, string>>;

  const lookup =
    typeof asMap.get === 'function'
      ? (serial: string): string | undefined => asMap.get(serial)
      : (serial: string): string | undefined => asRecord[serial];

  return {
    async resolveSecret(serialNumber: string): Promise<string | null> {
      const secret = lookup(serialNumber);
      if (secret === undefined) return null;
      requireNonEmptySecret(serialNumber, secret);
      return secret;
    },
  };
}

/** Resolver, który zawsze zwraca `null`. Zwraca błąd konfiguracji, nie „brak sekretu”. */
export function createUnconfiguredDeviceSecretResolver(
  variable: string = DEVICE_SECRET_ENV_VAR,
): DeviceSecretResolver {
  return {
    async resolveSecret(): Promise<string | null> {
      throw new DeviceSecretConfigurationError(variable);
    },
  };
}

/**
 * Weryfikuje podpis żądania urządzenia.
 *
 * KOLEJNOŚĆ KROKÓW jest ustalona, nie przypadkowa:
 *
 *  1. FORMAT, bo nic innego nie da się policzyć bez treści żądania;
 *  2. OKNO CZASU, bo podpis spoza okna jest bezpiecznie do odrzucenia
 *     bez zajęcia sekretu — stary podpis nie powinien obciążać resolvera;
 *  3. SEKRET, i rozróżnienie „nie ma takiego urządzenia” od „nie ma
 *     konfiguracji sekretów";
 *  4. PORÓWNANIE PODPISU, jako ostatnie i jako jedyne, które kosztuje HMAC.
 *
 * [DECISION: 2026-10-15] Brak echo numeru seryjnego w żadnym kodzie odmowy.
 * Odmowa `unknown_device` jest w istocie odpowiedzią na pytanie „czy taka
 * maszyna u nas jest". Numer ktoś zgaduje metodą różnicową: wysyła
 * kandydatów i patrzy, który odróżnia się od reszty. Dlatego komunikat jest
 * generyczny, a szczegół trzymany w logu serwera, nie w odpowiedzi.
 */
export async function verifyDeviceRequest(
  input: VerifyDeviceRequestInput,
): Promise<DeviceSignatureVerification> {
  const serialNumber = readHeader(input.headers, DEVICE_SERIAL_HEADER);
  const timestampRaw = readHeader(input.headers, DEVICE_TIMESTAMP_HEADER);
  const signature = readHeader(input.headers, DEVICE_SIGNATURE_HEADER);

  if (serialNumber === null || serialNumber.length === 0) {
    return failure('malformed_signature', `brak nagłówka ${DEVICE_SERIAL_HEADER}`);
  }
  if (signature === null || !SIGNATURE_HEX_PATTERN.test(signature)) {
    return failure(
      'malformed_signature',
      `nagłówek ${DEVICE_SIGNATURE_HEADER} musi być 64 znakami szesnastkowymi`,
    );
  }
  if (timestampRaw === null || !EPOCH_SECONDS_PATTERN.test(timestampRaw)) {
    return failure(
      'malformed_signature',
      `nagłówek ${DEVICE_TIMESTAMP_HEADER} musi być liczbą całkowitą w sekundach`,
    );
  }

  const timestampSeconds = Number.parseInt(timestampRaw, 10);
  const replayWindowSeconds = input.replayWindowSeconds ?? DEVICE_REPLAY_WINDOW_SECONDS;

  // Okno jest symetryczne i WŁĄCZAJĄCE na granicy: zegar maszyny ma
  // dryf, a granica 1 sekundy przy 5-minutowym oknie to szum, nie
  // bezpieczeństwo. Wykluczenie granicy odrzucałoby urządzenia, które
  // właśnie przekroczyły okno o ułamek sekundy.
  if (Math.abs(Math.floor(input.now() / 1000) - timestampSeconds) > replayWindowSeconds) {
    return failure(
      'timestamp_out_of_window',
      `znacznik czasu jest poza oknem ±${String(replayWindowSeconds)} s`,
    );
  }

  let secret: string | null;
  try {
    secret = await input.secrets.resolveSecret(serialNumber);
  } catch (error: unknown) {
    if (error instanceof DeviceSecretConfigurationError) {
      return failure('device_secret_unconfigured', error.message);
    }
    throw error;
  }

  if (secret === null || secret.length === 0) {
    return failure('unknown_device', 'brak sekretu dla podanego numeru seryjnego');
  }

  const canonical = buildCanonicalRequestString({
    method: input.method,
    path: input.path,
    timestampSeconds,
    body: input.rawBody,
  });

  const expected = createHmac('sha256', secret).update(canonical, 'utf8').digest('hex');
  if (!signaturesMatch(signature, expected)) {
    return failure('signature_mismatch', 'podpis nie zgadza się z treścią żądania');
  }

  return {
    ok: true,
    serialNumber,
    canonical,
    timestampSeconds,
    replayWindowSeconds,
  };
}