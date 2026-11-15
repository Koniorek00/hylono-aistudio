/**
 * [DECISION: 2026-10-15] Warstwa HTTP bez frameworka. To jest powód, dla
 * którego ten plik istnieje osobno od `app/api/equipment/telemetry/route.ts`.
 *
 * Adapter w `app/` musi być DŁUGI na zewnątrz i KROTKI wewnątrz: czyta
 * surowy tekst, oddaje go i zwraca `Response`. Cała logika decyzyjna —
 * limity, podpis, kolejność bramek, kody HTTP — jest tutaj, jako czysta
 * funkcja `(żądanie, zależności) → { status, body }`. Powody są dwa, oba
 * praktyczne:
 *
 *  1. Testowalność. Test nie musi dźwigać `Request`, `next/server` ani
 *     shimów Next.js, żeby sprawdzić, że podpisany telegram z podkręconym
 *     znacznikiem czasu dostaje 401. Dostaje surowy obiekt.
 *  2. Kolejność bramek jest JEDYNĄ rzeczą, której nie wolno rozprowadzać
 *     między dwa pliki. Rozbita na adapter i handler, kolejność przestaje
 *     być jednym miejscem do przeczytania, a zaczyna być konkretem, który
 *     ktoś przestawi „bo tu się prościej”.
 *
 * KOLEJNOŚĆ KROKÓW w `handleTelemetryIngestRequest` jest umowa, nie
 * przypadek. Zmiana kolejności zmienia odpowiedź, a nie tylko sposób
 * dojścia do niej:
 *
 *   1. METODA — najtańsze odrzucenie, zero alokacji poza odpowiedzią.
 *   2. ROZMIAR CIAŁA na surowym tekście, PRZED parsowaniem. Parsowanie
 *      najpierw to sposób na wpuszczenie 100 MB do procesu: `JSON.parse`
 *      musi dostać cały string, a string i tak już leży w pamięci.
 *      Liczymy bajty UTF-8, nie długość znaków.
 *   3. PODPIS. Klucz idempotencji z ciała jest jeszcze niepodpisany, ale
 *      nagłówek z numerem seryjnym już jest — i dlatego limit tęcza
 *      liczymy PO weryfikacji podpisu, a nie przed: inaczej każdy
 *      anonimowy klient mógłby zablokować limit maszyny, wpisując jej
 *      numer w nagłówku.
 *   4. LIMIT TĘCZA per urządzenie, PRZED parsowaniem. Po podpisie, przed
 *      `JSON.parse` — czyli na surowym tekście, bez obiektu do zbadania.
 *   5. PARSOWANIE JSON. Błąd parsowania to 422, nigdy 500: urządzenie
 *      wysłało uszkodzony bajt, a serwer nie padł.
 *   6. BRAMKA PII, przed schematem. PII zgłoszone jako PII, nie jako
 *      „nieznany klucz" — inaczej wyciek adresu e-mail da się przeczytać
 *      jako zwykły błąd walidacji i nikt go nie zauważy.
 *   7. INGEST z Modułu 1, i mapowanie jego TYPOWANYCH odrzuceń na kody HTTP.
 *
 * Odpowiedź 404 dla nieznanego numeru seryjnego NIE zawiera tego numeru.
 * Odmowa „nie ma takiej maszyny" jest odpowiedzią na pytanie „czy taka
 * maszyna u nas jest", a numery seryjne mają wzór z mieszalnika, więc
 * zgadywanie metodą różnicową jest realne: wysyłasz kandydatów, patrzysz,
 * który odróżnia się od reszty. Komunikat jest generyczny, a numer trafia
 * tylko do logu serwera.
 */

import {
  DeviceOutOfServiceError,
  TelemetryPacketRejectedError,
  UnknownDeviceError,
} from '@/lib/equipment/module1/ingest';
import type { IngestOutcome } from '@/lib/equipment/module1/ingest';
import { hoursFromSeconds } from '@/lib/equipment/module1/runtime-counter';
import type { IngestDeps } from '@/lib/equipment/module1/ports';
import { ZeroPiiViolationError, assertNoPiiDeep } from '@/lib/equipment/shared/zero-pii';

import {
  DEVICE_REPLAY_WINDOW_SECONDS,
  createEnvDeviceSecretResolver,
  verifyDeviceRequest,
  type Clock,
  type DeviceSecretResolver,
  type DeviceSignatureFailureCode,
} from './device-signature';

/**
 * Limit rozmiaru ciała: 256 KB.
 *
 * [DECISION: 2026-10-15] Wartość skopiowana z `DEFAULT_MAX_JSON_BODY_BYTES`
 * w `app/api/_shared/validation.ts`, żeby telemetria nie była jedyną
 * trasą, która przyjmuje nieograniczony body. Uzasadnienie: największy
 * prawidłowy pakiet telemetrii ma kilkaset bajtów (znacznik sesji plus
 * kilka odczytów czujników), więc 256 KB to zapas rzędu wielkości, a nie
 * prognoza. Liczymy `Buffer.byteLength`, bo `body.length` liczy znaki —
 * ciało z samymi wieloznakowymi znakami jest sześć razy większe w bajtach
 * niż zgłasza `.length`.
 */
export const DEVICE_BODY_MAX_BYTES = 256 * 1024;

/**
 * Limit tęcza per urządzenie. 120 żądań na minutę.
 *
 * [DECISION: 2026-10-15] Maszyna wysyła tick co 30 s, czyli 2 żądania na
 * minutę; 120 to sześćdziesiąt razy więcej. Wysoki limit jest tu celowy:
 * limit tęcza nie jest mechanizmem ochrony zasadniczo (od tego jest podpis,
 * limit rozmiaru i limit bazowy), tylko zabezpieczeniem przed pętlą
 * retransmisji wadliwego firmware'u. Za ciasno ustawiony limit odcina
 * prawidłową maszynę podczas awarii sieci, a wtedy telemetria cichnie
 * dokładnie wtedy, kiedy ktoś chce ją odczytać.
 */
export const DEFAULT_DEVICE_RATE_LIMIT = { limit: 120, windowMs: 60_000 } as const;

/** Żądanie w postaci surowej. Zero `Request`, zero frameworka. */
export type TelemetryHttpRequest = {
  readonly method: string;
  readonly path: string;
  /** Surowy tekst ciała. Handler NIGDY nie woła `JSON.parse` przed limitem rozmiaru. */
  readonly rawBody: string;
  /** Nagłówki z kluczami w małych literach. */
  readonly headers: Readonly<Record<string, string>>;
};

export type TelemetryHandlerResult = {
  readonly status: number;
  readonly body: Readonly<Record<string, unknown>>;
};

/** Wstrzykiwana bramka Modułu 1. Ten sam kontrakt co `ingestTelemetryPacket`. */
export type TelemetryIngestCall = (packet: unknown) => Promise<IngestOutcome>;

export type DeviceRateLimitDecision = {
  readonly allowed: boolean;
  readonly limit: number;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
};

export type DeviceRateLimiter = {
  consume(key: string, atMs: number, limit: number, windowMs: number): DeviceRateLimitDecision;
};

export type DeviceRateLimitOptions = {
  readonly limit: number;
  readonly windowMs: number;
};

export type TelemetryHandlerDeps = {
  readonly ingest: TelemetryIngestCall;
  readonly secrets: DeviceSecretResolver;
  readonly rateLimiter: DeviceRateLimiter;
  /** Zegar w milisekundach. Wstrzykiwany, żeby test nie czekał. */
  readonly now: Clock;
  readonly rateLimit?: DeviceRateLimitOptions;
  readonly replayWindowSeconds?: number;
  readonly maxBodyBytes?: number;
  /**
   * Wypad do logu serwera. Odpowiedź HTTP nigdy nie zawiera numeru
   * seryjnego ani podanego znacznika czasu — to jest miejsce, w którym
   * operator widzi, dlaczego maszyna została odrzucona.
   */
  readonly onDiagnostic?: (code: DeviceSignatureFailureCode, detail: string) => void;
};

/**
 * Limiter w pamięci procesu.
 *
 * [ZAŁOŻENIE] Poprawny dla jednej instancji. Przy wielu instancjach za
 * route'em stoi albo redis, albo istniejący `distributed-rate-limit` z
 * `app/api/_shared/`. Świadomie nie sięgam tu do tamtego pliku: ten
 * handler ma nie zależeć od `app/`, a wstrzyknięty limiter pozwala podmienić
 * implementację w adapterze bez zmiany w tym pliku.
 *
 * Sprzątanie: wpisy wygasłe kasowane są przy każdym `consume` dla tego samego
 * klucza, plus przekrój przy przekroczeniu progu MAPA, żeby proces nie
 * rósł w nieskończoność od zgłoszeń z nieznanych kluczy.
 */
export function createInMemoryDeviceRateLimiter(
  now: Clock = Date.now,
  sweepThreshold = 10_000,
): DeviceRateLimiter {
  type Bucket = { count: number; resetAtMs: number };
  const buckets = new Map<string, Bucket>();

  function prune(atMs: number): void {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAtMs <= atMs) buckets.delete(key);
    }
  }

  return {
    consume(key, atMs, limit, windowMs) {
      const existing = buckets.get(key);
      if (existing === undefined || existing.resetAtMs <= atMs) {
        buckets.set(key, { count: 1, resetAtMs: atMs + windowMs });
        return { allowed: true, limit, remaining: Math.max(0, limit - 1), retryAfterSeconds: 0 };
      }

      if (buckets.size > sweepThreshold) prune(atMs);

      existing.count += 1;
      const allowed = existing.count <= limit;
      return {
        allowed,
        limit,
        remaining: Math.max(0, limit - existing.count),
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAtMs - atMs) / 1000)),
      };
    },
  };
}

function json(status: number, body: Readonly<Record<string, unknown>>): TelemetryHandlerResult {
  return { status, body };
}

/**
 * Wyciąga ścieżkę pola z komunikatu `TelemetryPacketRejectedError`.
 *
 * `describeIssue` w `module1/ingest.ts` skleja komunikat jako
 * `ścieżka: treść`, więc ścieżka to wszystko przed pierwszym dwukropkiem.
 * Ścieżka idzie do odpowiedzi, bo urządzenie musi wiedzieć KTÓRE pole
 * poprawić — odpowiedź „nieprawidłowy pakiet" bez ścieżki oznacza dla
 * firmware'u zgadywanie.
 */
function fieldPathOf(issue: string): string {
  const separator = issue.indexOf(':');
  return separator > 0 ? issue.slice(0, separator) : '$';
}

const STATUS_CODE_TO_HTTP: Readonly<Record<DeviceSignatureFailureCode, number>> = {
  malformed_signature: 401,
  signature_mismatch: 401,
  timestamp_out_of_window: 401,
  unknown_device: 404,
  device_secret_unconfigured: 503,
};

/**
 * Odmowa podpisu.
 *
 * [DECISION: 2026-10-15] Komunikat w odpowiedzi jest GENERYCZNY i nie
 * zawiera numeru seryjnego ani podanego znacznika czasu — patrz uzasadnienie
 * przy `unknown_device` w nagłówku tego pliku. Powód odrzucenia idzie do
 * logu serwera przez `onDiagnostic`, bo tam operator ma szansę zobaczyć,
 * który zegar się rozjechał.
 */
function signatureFailure(
  code: DeviceSignatureFailureCode,
  detail: string,
  onDiagnostic: ((code: DeviceSignatureFailureCode, detail: string) => void) | undefined,
): TelemetryHandlerResult {
  onDiagnostic?.(code, detail);

  if (code === 'unknown_device') {
    return json(STATUS_CODE_TO_HTTP[code], {
      status: 'error',
      code: 'not_found',
      message: 'Nie znaleziono zasobu dla podanego żądania.',
    });
  }

  if (code === 'device_secret_unconfigured') {
    return json(STATUS_CODE_TO_HTTP[code], {
      status: 'error',
      code: 'device_secret_unconfigured',
      message: 'Brak konfiguracji uwierzytelniania urządzeń.',
    });
  }

  return json(STATUS_CODE_TO_HTTP[code], {
    status: 'error',
    code: 'unauthorized_device',
    message: 'Żądanie nie zostało podpisane przez urządzenie.',
  });
}

/** Odmowa podpisu na poziomie urządzenia — bez echa numeru seryjnego. */
function deviceNotFound(onDiagnostic: ((code: DeviceSignatureFailureCode, detail: string) => void) | undefined): TelemetryHandlerResult {
  return signatureFailure('unknown_device', 'urządzenie o tym numerze nie istnieje w warstwie sprzętu', onDiagnostic);
}

/**
 * Główny handler. Czysty: nie ma `request.json()`, nie ma `Date.now()`
 * w miejscach, które zmieniają wynik, nie ma `Math.random`.
 */
export async function handleTelemetryIngestRequest(
  request: TelemetryHttpRequest,
  deps: TelemetryHandlerDeps,
): Promise<TelemetryHandlerResult> {
  const onDiagnostic = deps.onDiagnostic;
  const maxBodyBytes = deps.maxBodyBytes ?? DEVICE_BODY_MAX_BYTES;
  const rateLimit = deps.rateLimit ?? DEFAULT_DEVICE_RATE_LIMIT;
  const replayWindowSeconds = deps.replayWindowSeconds ?? DEVICE_REPLAY_WINDOW_SECONDS;

  // 1. Metoda.
  if (request.method.toUpperCase() !== 'POST') {
    return json(405, {
      status: 'error',
      code: 'method_not_allowed',
      message: 'Ta trasa przyjmuje wyłącznie żądania POST.',
    });
  }

  // 2. Rozmiar ciała na surowym tekście. PRZED parsowaniem — patrz nagłówek.
  const bodyBytes = Buffer.byteLength(request.rawBody, 'utf8');
  if (bodyBytes > maxBodyBytes) {
    return json(413, {
      status: 'error',
      code: 'payload_too_large',
      message: `Ciało żądania przekracza limit ${String(maxBodyBytes)} bajtów.`,
      limitBytes: maxBodyBytes,
      receivedBytes: bodyBytes,
    });
  }

  // 3. Podpis.
  const verification = await verifyDeviceRequest({
    method: request.method,
    path: request.path,
    rawBody: request.rawBody,
    headers: request.headers,
    secrets: deps.secrets,
    now: deps.now,
    replayWindowSeconds,
  });
  if (!verification.ok) {
    return signatureFailure(verification.code, verification.detail, onDiagnostic);
  }

  // 4. Limit tęcza per urządzenie. Po podpisie (numer jest wiarygodny),
  //    przed parsowaniem (obiektu jeszcze nie ma).
  const rate = deps.rateLimiter.consume(verification.serialNumber, deps.now(), rateLimit.limit, rateLimit.windowMs);
  if (!rate.allowed) {
    return json(429, {
      status: 'error',
      code: 'rate_limited',
      message: 'Urządzenie przekroczyło limit żądań. Proszę, poczekaj przed ponowieniem.',
      retryAfterSeconds: rate.retryAfterSeconds,
    });
  }

  // 5. Parsowanie. Uszkodzony bajt od urządzenia to 422, nie 500.
  let parsed: unknown;
  try {
    parsed = JSON.parse(request.rawBody) as unknown;
  } catch {
    return json(422, {
      status: 'error',
      code: 'invalid_json',
      message: 'Ciało żądania nie jest poprawnym JSON-em.',
    });
  }

  // 6. Bramka PII przed schematem, żeby wyciek nie schował się pod
  //    komunikatem walidacji.
  const piiRejection = assertZeroPii(parsed);
  if (piiRejection !== null) return piiRejection;

  // 7. Moduł 1 + mapowanie odrzuceń na HTTP.
  let outcome: IngestOutcome;
  try {
    outcome = await deps.ingest(parsed);
  } catch (error: unknown) {
    return ingestRejection(error, onDiagnostic);
  }

  if (outcome.outcome === 'duplicate') {
    // 200, NIE 202. Retransmisja to nie nowy odczyt, a urządzenie musi
    // widzieć różnicę: 202 pozwala uznać paczkę za zaliczoną i wyłączyć
    // kolejkę, 200 mówi „już to mamy" i zostawia licznik retransmisji
    // rosnący, czyli widać zepsutą sieć urządzenia.
    return json(200, {
      status: 'duplicate',
      duplicateCount: outcome.duplicateCount,
    });
  }

  // Jednostki na przewodzie pozostają GODZINAMI, mimo że licznik
  // autorytatywny Modułu 1 jest w sekundach. Powód: to jest kontrakt
  // odczytu dla urządzenia i dla panelu OEM, a próg przeglądu z mandatu
  // (200–300 h) jest w godzinach. Godziny są też jednostką, w której
  // firmware liczy „do przeglądu zostało X".
  const counterBeforeHours = hoursFromSeconds(outcome.counterSecondsBefore);
  // `counterHoursAfter` liczy sam Moduł 1 jednym wywołaniem — używamy jego
  // wartości, a nie własnego zaokrąglenia, bo dwie implementacje
  // `hoursFromSeconds` to dwa liczniki godzinowe na tej samej flocie.
  const counterAfterHours = outcome.counterHoursAfter;

  return json(202, {
    status: 'accepted',
    // `runtimeHoursAdded` to FAKTYCZNE przesunięcie raportowanego licznika,
    // czyli `counterAfter - counterBefore`, a nie `runtimeDeltaSeconds / 3600`.
    // Krótki tick potrafi dodać 600 sekund i nie przesunąć licznika
    // godzinowego o całą jedną; raportowanie `delta/3600` obiecywałoby
    // godzinę, której w liczniku nie ma.
    runtimeHoursAdded: counterAfterHours - counterBeforeHours,
    counterBefore: counterBeforeHours,
    counterAfter: counterAfterHours,
    warnThresholdReached: outcome.warnThresholdReached,
    serviceDue: outcome.serviceDue,
    orderId: outcome.orderId,
  });
}

/**
 * Bramka PII zgłaszana ZANIM cokolwiek zajrzy w strukturę pakietu.
 * Osobna funkcja, bo `assertNoPiiDeep` rzuca, a handler chce złapać
 * i zamienić na kod HTTP, nie wyjść z wyjątkiem do adaptera.
 */
function assertZeroPii(parsed: unknown): TelemetryHandlerResult | null {
  try {
    // Moduł 1 ma tę samą bramkę w `parseTelemetryPacket`. Powtórzenie
    // jest tu celowe: handler musi odpowiedzieć `zero_pii_violation`
    // na PII, a nie polegać na tym, że moduł w głębi rzuci właściwym
    // typem. Bramka, na której nie widać jej celu, jest usuwana przy
    // pierwszym refaktorze. Ta sama funkcja, jeden import — brak
    // opóźniania i brak drugiej, zdrętwiającej kopii listy pól.
    assertNoPiiDeep(parsed);
    return null;
  } catch (error: unknown) {
    if (error instanceof ZeroPiiViolationError) {
      return json(422, {
        status: 'error',
        code: 'zero_pii_violation',
        message: 'Pakiet zawiera pola zabronione w warstwie zero-PII.',
        field: error.fields[0] ?? '$',
      });
    }
    throw error;
  }
}

/** Mapowanie TYPOWANYCH odrzuceń Modułu 1 na kody HTTP. */
function ingestRejection(
  error: unknown,
  onDiagnostic: ((code: DeviceSignatureFailureCode, detail: string) => void) | undefined,
): TelemetryHandlerResult {
  if (error instanceof ZeroPiiViolationError) {
    return json(422, {
      status: 'error',
      code: 'zero_pii_violation',
      message: 'Pakiet zawiera pola zabronione w warstwie zero-PII.',
      field: error.fields[0] ?? '$',
    });
  }

  if (error instanceof TelemetryPacketRejectedError) {
    const first = error.issues[0];
    return json(422, {
      status: 'error',
      code: 'invalid_packet',
      message: 'Pakiet nie spełnia kontraktu telemetrii.',
      field: first === undefined ? '$' : fieldPathOf(first),
      issues: [...error.issues],
    });
  }

  if (error instanceof UnknownDeviceError) {
    return deviceNotFound(onDiagnostic);
  }

  if (error instanceof DeviceOutOfServiceError) {
    // 409: żądanie jest poprawne, stan urządzenia je wyklucza. Urządzenie
    // ma dostać to niezależny od siebie sygnał, a nie 404 sugerujące,
    // że maszyny nie ma w bazie.
    return json(409, {
      status: 'error',
      code: 'device_out_of_service',
      message: 'Urządzenie nie nalicza czasu pracy w tym stanie.',
    });
  }

  if (error instanceof RangeError) {
    // Próg przeglądu poza przedziałem mandatu. To BŁĄD KONFIGURACJI, nie
    // błąd pakietu — urządzenie nic tu nie poprawi, więc 500 i bez echa
    // treści wyjątku do klienta.
    onDiagnostic?.('signature_mismatch', `błąd konfiguracji progu: ${error.message}`);
    return json(500, {
      status: 'error',
      code: 'threshold_configuration_error',
      message: 'Konfiguracja progu przeglądu jest poza dozwolonym przedziałem.',
    });
  }

  return json(500, {
    status: 'error',
    code: 'internal_error',
    message: 'Pakiet nie mógł zostać przyjęty z powodu błędu wewnętrznego.',
  });
}

/** Zależności gotowe do użycia w `app/`: sekrety z env, limiter w pamięci. */
export function createTelemetryHandlerDeps(
  ingest: TelemetryIngestCall,
  overrides: Partial<Omit<TelemetryHandlerDeps, 'ingest' | 'secrets'>> & {
    readonly secrets?: DeviceSecretResolver;
  } = {},
): TelemetryHandlerDeps {
  return {
    ingest,
    secrets: overrides.secrets ?? createEnvDeviceSecretResolver(),
    rateLimiter: overrides.rateLimiter ?? createInMemoryDeviceRateLimiter(),
    now: overrides.now ?? Date.now,
    ...(overrides.rateLimit === undefined ? {} : { rateLimit: overrides.rateLimit }),
    ...(overrides.replayWindowSeconds === undefined
      ? {}
      : { replayWindowSeconds: overrides.replayWindowSeconds }),
    ...(overrides.maxBodyBytes === undefined ? {} : { maxBodyBytes: overrides.maxBodyBytes }),
    ...(overrides.onDiagnostic === undefined ? {} : { onDiagnostic: overrides.onDiagnostic }),
  };
}

export type { IngestDeps };