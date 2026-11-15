/**
 * [DECISION: 2026-10-15] Moduł 3 — dowód procesowy oglądnięcia materiału
 * instruktażowego (podstawy bezpieczeństwa, wyrównywanie ciśnienia w uchu)
 * przed wizytą w komorze.
 *
 * [DECISION: 2026-10-15] PROWENCJA. Mandat Modułu 3 wskazuje Sąd Apelacyjny
 * w Warszawie, sygnatury I ACa 665/14 oraz V ACa 119/18, jako źródło
 * wymogu: udokumentowanie, że osoba korzystająca miała dostęp do informacji
 * instruktażowej PRZED wyrażeniem zgody. Dlatego zapisywanym tutaj
 * znacznikiem jest czas OBEJRZENIA materiału, a nie czas WYSŁANIA linku —
 * i dlatego oba znaczniki są modelowane osobno, a zdarzenie odrzuca
 * oglądanie wyprzedzające wysyłkę. Poza tym plik nie interpretuje treści
 * orzeczeń, nie wyciąga z nich wniosków prawnych i nie zastępuje oceny
 * prawnej; sygnatury są tu wskazaniem źródła wymogu, nie argumentem.
 *
 * [DECISION: 2026-10-15] `visitRef` i `appointmentRef` są ODPORNIKAMI
 * okazji, nie identyfikatorami osoby. Powiązanie z osobą żyje wyłącznie
 * w warstwie health (Moduł 4) — tego plik nie dotyka i nie może jej
 * rozszerzać. Dlatego bramka person-linkage pilnuje nie tylko wspólnej
 * listy PII, ale też nazw pól typu userId/accountId, które przemycają
 * identyfikację pod pozorem technicznego klucza.
 */

import { assertNoPiiDeep, assertNoPiiFields } from '../shared/zero-pii';

/**
 * [DECISION: 2026-10-15] Próg dowodowy: 90 % obejrzanego materiału.
 *
 * JUSTYFIKACJA (decyzja inżynierska, nie wniosek prawny):
 * 1. Otwarcie linku niczego nie dowodzi. Zdarzenie poniżej progu jest
 *    zapisane jako fakt (co, ile), ale raport mówi wprost
 *    `isSufficientEvidence: false`. Zakładka i dwa procent obejrzenia to ta
 *    sama klasa zdarzeń co brak zdarzenia.
 * 2. Materiał instruktażowy kończy się blokiem powtórzenia kluczowych
 *    poleceń. Pominięcie końcówki nie pomija polecenia, które nie padło
 *    wcześniej — stąd próg tuż poniżej bloku podsumowania, a nie 100 %.
 * 3. 100 % jest nieosiągalne operacyjnie (przełączenie karty, opóźnienie
 *    telemetrii odtwarzacza). Bramka, której nie da się nigdy spełnić, nie
 *    chroni niczego. 90 % odsiewa porzucone odtwarzanie, a przepuszcza
 *    obejrzanie zakończone.
 * 4. Poniżej ok. 85 % realne jest pominięcie całego, odrębnego bloku
 *    poleceń, a nie samej końcówki — stąd 90 %, nie 80 %.
 *
 * [GENERAL PRINCIPLE — NOT PROJECT-VERIFIED] Punkt 2 zakłada, że blok
 * podsumowania zajmuje mniej niż 10 % czasu materiału. Rzeczywisty podział
 * czasu zależy od produkcji materiałów (Moduł content), której ten plik nie
 * zna. Dlatego próg jest WYEXPORTOWANĄ STAŁĄ w jednym miejscu: korekta to
 * zmiana jednej liczby, nie audyt dziesięciu plików. Każdy materiał ma własny
 * `materialId` z wersją, więc zmiana treści wymusza nowy identyfikator,
 * a nie nadpisanie historii.
 */
export const EVIDENCE_COMPLETION_THRESHOLD_PERCENT = 90;

export const EVIDENCE_MIN_ALLOWED_THRESHOLD_PERCENT = 1;
export const EVIDENCE_MAX_ALLOWED_THRESHOLD_PERCENT = 100;

/** Nazwy pól, które nie są na liście PII, ale i tak wprowadzają osobę. */
const IDENTITY_SHAPED_FIELDS: readonly string[] = [
  'userId',
  'user_id',
  'userRef',
  'accountId',
  'account_id',
  'profileId',
  'memberId',
  'visitorId',
  'leadId',
  'ownerId',
  'subjectId',
  'identityRef',
  'personId',
];

function normalizeField(field: string): string {
  return field.trim().toLowerCase().replace(/[\s-]+/g, '_');
}

export { ZeroPiiViolationError } from '../shared/zero-pii';

export class PersonLinkageError extends Error {
  readonly fields: readonly string[];

  constructor(fields: readonly string[]) {
    super(
      `Pole wskazujące na osobę jest niedopuszczalne w warstwie okazji: ${fields.join(', ')}. ` +
        'Powiązanie z osobą należy do warstwy health.',
    );
    this.name = 'PersonLinkageError';
    this.fields = fields;
  }
}

export type WatchEvidenceValidationCode =
  | 'visit-ref-empty'
  | 'material-id-empty'
  | 'completion-not-integer'
  | 'completion-out-of-range'
  | 'invalid-timestamp'
  | 'view-before-send'
  | 'mixed-visit-ref';

export class WatchEvidenceValidationError extends Error {
  readonly code: WatchEvidenceValidationCode;
  readonly field: string;
  readonly received: string;

  constructor(code: WatchEvidenceValidationCode, field: string, received: string) {
    super(`Nieprawidłowe zdarzenie oglądania (${code}) w polu ${field}, otrzymano: ${received}`);
    this.name = 'WatchEvidenceValidationError';
    this.code = code;
    this.field = field;
    this.received = received;
  }
}

/**
 * Bramka powiązania z osobą. Deleguje do wspólnej listy PII (rzuca
 * `ZeroPiiViolationError`), a po niej łapie nazwy przemycające tożsamość
 * pod pozorem klucza technicznego (`userId`, `accountId`).
 */
export function assertNoPersonLinkage(fields: readonly string[]): void {
  assertNoPiiFields(fields);

  const denylist = IDENTITY_SHAPED_FIELDS.map(normalizeField);
  const hits = [
    ...new Set(fields.map(normalizeField).filter((field) => denylist.includes(field))),
  ];
  if (hits.length > 0) {
    throw new PersonLinkageError(hits);
  }
}

/**
 * Wersja rekurencyjna — payload z urządzenia ma kształt zagnieżdżony, a
 * bramka płytka przepuszczałaby `email` na trzecim poziomie.
 */
export function assertNoPersonLinkageDeep(payload: unknown): void {
  assertNoPiiDeep(payload);
  if (payload !== null && typeof payload === 'object' && !Array.isArray(payload)) {
    assertNoPersonLinkage(Object.keys(payload));
  }
}

export type VisitRef = string;
export type MaterialId = string;

export type WatchEventInput = {
  /** ODPORNIK okazji. Nie jest identyfikatorem osoby. */
  readonly visitRef: VisitRef;
  /** Wersjonowany identyfikator materiału — bez wersji znak dowodu jest pusty. */
  readonly materialId: MaterialId;
  /** Znacznik czasu OBEJRZENIA, nigdy wysłania. */
  readonly watchedAt: string;
  /** Procent obejrzanego materiału, 0–100, liczba całkowita. */
  readonly completionPercent: number;
  /** Opcornik powiązany z wysyłką; nie jest kluczem do konta. */
  readonly appointmentRef?: string | null;
  /**
   * Znacznik czasu WYSŁANIA linku. Modelowany osobno, bo pomylenie wysłania
   * z oglądaniem jest dokładnie tym błędem, którego ten moduł ma nie
   * dopuścić.
   */
  readonly sentAt?: string | null;
};

export type WatchEvent = {
  readonly visitRef: VisitRef;
  readonly materialId: MaterialId;
  readonly watchedAt: string;
  readonly completionPercent: number;
  readonly appointmentRef: string | null;
  readonly sentAt: string | null;
  /**
   * Wyliczone przy zapisie progiem domyślnym — wygoda dla warstwy zapisu.
   * Ocena (`evaluateEvidence`) NIE czyta tej flagi: liczy własny próg od
   * `completionPercent`, bo raport bywa liczony z innym progiem niż zapis.
   */
  readonly meetsCompletionThreshold: boolean;
  readonly thresholdPercent: number;
};

const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

export function parseIsoWithOffset(value: string, field: string): number {
  if (typeof value !== 'string' || !ISO_WITH_OFFSET.test(value)) {
    throw new WatchEvidenceValidationError('invalid-timestamp', field, String(value));
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new WatchEvidenceValidationError('invalid-timestamp', field, value);
  }
  return parsed;
}

function assertNonEmptyRef(
  value: string,
  field: string,
  code: WatchEvidenceValidationCode,
): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new WatchEvidenceValidationError(code, field, String(value));
  }
  return value.trim();
}

function assertCompletionPercent(value: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) {
    throw new WatchEvidenceValidationError(
      'completion-not-integer',
      'completionPercent',
      String(value),
    );
  }
  if (value < 0 || value > 100) {
    throw new WatchEvidenceValidationError(
      'completion-out-of-range',
      'completionPercent',
      String(value),
    );
  }
  return value;
}

export type ThresholdOptions = {
  /** Domyślnie `EVIDENCE_COMPLETION_THRESHOLD_PERCENT`. */
  readonly thresholdPercent?: number;
};

function resolveThreshold(options?: ThresholdOptions): number {
  const thresholdPercent = options?.thresholdPercent ?? EVIDENCE_COMPLETION_THRESHOLD_PERCENT;
  if (
    !Number.isInteger(thresholdPercent) ||
    thresholdPercent < EVIDENCE_MIN_ALLOWED_THRESHOLD_PERCENT ||
    thresholdPercent > EVIDENCE_MAX_ALLOWED_THRESHOLD_PERCENT
  ) {
    throw new WatchEvidenceValidationError(
      'completion-out-of-range',
      'thresholdPercent',
      String(thresholdPercent),
    );
  }
  return thresholdPercent;
}

/**
 * Zapis zdarzenia oglądania. Funkcja czysta: nic nie zapisuje do bazy i nic
 * nie generuje poza wartością wejściową — identyfikator rekordu nadaje warstwa
 * zapisu.
 *
 * Kolejność walidacji: bramka person-linkage PRZED resztą. Prywatność nie
 * czeka na poprawność liczb.
 */
export function recordWatchEvent(input: WatchEventInput, options?: ThresholdOptions): WatchEvent {
  assertNoPersonLinkageDeep(input);

  const thresholdPercent = resolveThreshold(options);
  const visitRef = assertNonEmptyRef(input.visitRef, 'visitRef', 'visit-ref-empty');
  const materialId = assertNonEmptyRef(input.materialId, 'materialId', 'material-id-empty');
  const completionPercent = assertCompletionPercent(input.completionPercent);
  const watchedAtMs = parseIsoWithOffset(input.watchedAt, 'watchedAt');

  const appointmentRef =
    input.appointmentRef == null
      ? null
      : assertNonEmptyRef(input.appointmentRef, 'appointmentRef', 'visit-ref-empty');

  const sentAt = input.sentAt ?? null;
  const sentAtMs = sentAt === null ? null : parseIsoWithOffset(sentAt, 'sentAt');

  if (sentAtMs !== null && watchedAtMs < sentAtMs) {
    throw new WatchEvidenceValidationError('view-before-send', 'watchedAt', input.watchedAt);
  }

  return {
    visitRef,
    materialId,
    watchedAt: input.watchedAt,
    completionPercent,
    appointmentRef,
    sentAt,
    meetsCompletionThreshold: completionPercent >= thresholdPercent,
    thresholdPercent,
  };
}

export type EvidenceRequirements = {
  /**
   * Materiały wymagane przed zgodą. Świadomie podawane przez caller:
   * wyprowadzanie listy wymaganej z listy obejrzanej czyniłoby test
   * wystarczalności pustym — każda lista byłaby sama dla siebie pełna.
   */
  readonly requiredMaterialIds: readonly MaterialId[];
  readonly thresholdPercent?: number;
};

export type MaterialGapReason = 'no-viewing-event' | 'below-threshold';

export type MaterialGap = {
  readonly materialId: MaterialId;
  readonly reason: MaterialGapReason;
  /** Najwyższy zapisany procent, `null` gdy nie ma ani jednego zdarzenia. */
  readonly bestCompletionPercent: number | null;
  readonly thresholdPercent: number;
  readonly lastWatchedAt: string | null;
  readonly eventCount: number;
};

export type MaterialCoverage = {
  readonly materialId: MaterialId;
  readonly eventCount: number;
  readonly bestCompletionPercent: number | null;
  /** ZNAK CZASU oglądania pierwszego zdarzenia osiągającego próg. */
  readonly sufficientWatchedAt: string | null;
  readonly meetsThreshold: boolean;
};

export type EvidenceReport = {
  readonly visitRef: VisitRef | null;
  /**
   * Jedyna odpowiedź na pytanie, czy to jest dowód. Osobno od `sufficient`,
   * żeby nie dało się odczytać go jako flagi technicznej.
   */
  readonly isSufficientEvidence: boolean;
  /** Alias skrótowy z sygnatury raportu; ta sama wartość. */
  readonly sufficient: boolean;
  /**
   * Znak czasu OBEJRZENIA materiału, który ZAMKNIĄŁ komplet wymaganych
   * materiałów — chwila, w której informacja stała się kompletna. `null`,
   * gdy kompletu nie ma. Nigdy nie jest to znak czasu wysłania.
   */
  readonly watchedAt: string | null;
  /** Wszystkie identyfikatory materiałów widziane w zdarzeniach. */
  readonly materialIds: readonly MaterialId[];
  /** Wymagane materiały mające własne wystarczające obejrzanie. */
  readonly satisfiedMaterialIds: readonly MaterialId[];
  readonly requiredMaterialIds: readonly MaterialId[];
  /** Wskaźnik postępu 0–100. POSTĘP, nie dowód — patrz `isSufficientEvidence`. */
  readonly coveragePercent: number;
  readonly gaps: readonly MaterialGap[];
  readonly thresholdPercent: number;
  readonly perMaterial: readonly MaterialCoverage[];
  readonly observedEventCount: number;
  readonly appointmentRef: string | null;
  readonly sentAt: string | null;
};

function dedupe(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter((value) => value.length > 0))];
}

/**
 * Ocena kompletu dowodu.
 *
 * [DECISION: 2026-10-15] REGUŁA SUMOWANIA: procenty z różnych materiałów
 * NIGDY się nie sumują i NIGDY nie zastępują siebie nawzajem. Każdy wymagany
 * `materialId` musi mieć WŁASNE zdarzenie osiągające próg. Dwa oglądania po
 * 55 % dają 110 % i nadal nie są dowodem — 55 % jednego materiału nie oznacza,
 * że drugi został obejrzany, a 55 % tego samego materiału dwa razy nie oznacza,
 * że był obejrzany w całości. Dla tego samego materiału liczy się MAKSIMUM,
 * nie suma.
 */
export function evaluateEvidence(
  events: readonly WatchEvent[],
  requirements: EvidenceRequirements,
): EvidenceReport {
  assertNoPersonLinkageDeep(events);

  const thresholdPercent = resolveThreshold({
    ...(requirements.thresholdPercent === undefined
      ? {}
      : { thresholdPercent: requirements.thresholdPercent }),
  });
  const requiredMaterialIds = dedupe(requirements.requiredMaterialIds);

  const visitRefs = dedupe(events.map((event) => event.visitRef));
  if (visitRefs.length > 1) {
    throw new WatchEvidenceValidationError('mixed-visit-ref', 'visitRef', visitRefs.join(','));
  }

  const perMaterial: MaterialCoverage[] = requiredMaterialIds.map((materialId) => {
    const forMaterial = events.filter((event) => event.materialId === materialId);
    const best = forMaterial.reduce(
      (max, event) => (event.completionPercent > max ? event.completionPercent : max),
      -1,
    );
    const sufficient = forMaterial.find(
      (event) => event.completionPercent >= thresholdPercent,
    );
    return {
      materialId,
      eventCount: forMaterial.length,
      bestCompletionPercent: best < 0 ? null : best,
      sufficientWatchedAt: sufficient?.watchedAt ?? null,
      meetsThreshold: sufficient !== undefined,
    };
  });

  const gaps: MaterialGap[] = perMaterial
    .filter((coverage) => !coverage.meetsThreshold)
    .map((coverage) => {
      const forMaterial = events.filter((event) => event.materialId === coverage.materialId);
      return {
        materialId: coverage.materialId,
        reason: forMaterial.length === 0 ? ('no-viewing-event' as const) : ('below-threshold' as const),
        bestCompletionPercent: coverage.bestCompletionPercent,
        thresholdPercent,
        lastWatchedAt: forMaterial.at(-1)?.watchedAt ?? null,
        eventCount: forMaterial.length,
      };
    });

  const satisfiedMaterialIds = perMaterial
    .filter((coverage) => coverage.meetsThreshold)
    .map((coverage) => coverage.materialId);

  // Pusta lista wymagań nie dowodzi niczego — inaczej bramka byłaby spełniona
  // przez swój brak.
  const isSufficientEvidence = requiredMaterialIds.length > 0 && gaps.length === 0;

  const coveragePercent =
    requiredMaterialIds.length === 0
      ? 0
      : Math.min(
          100,
          Math.round(
            (perMaterial.reduce((sum, coverage) => {
              const ratio =
                coverage.bestCompletionPercent === null
                  ? 0
                  : Math.min(1, coverage.bestCompletionPercent / thresholdPercent);
              return sum + ratio;
            }, 0) *
              100) /
              requiredMaterialIds.length,
          ),
        );

  // Chwila, w której informacja stała się kompletna: najpóźniejszy znak
  // czasu spośród materiałów wymaganych.
  const sufficientPairs = perMaterial
    .map((coverage) => coverage.sufficientWatchedAt)
    .filter((value): value is string => value !== null);
  let watchedAt: string | null = null;
  if (sufficientPairs.length === requiredMaterialIds.length && sufficientPairs.length > 0) {
    watchedAt = sufficientPairs.reduce((latest, value) =>
      parseIsoWithOffset(value, 'watchedAt') > parseIsoWithOffset(latest, 'watchedAt') ? value : latest,
    );
  }

  const appointmentRefs = dedupe(events.map((event) => event.appointmentRef ?? ''));
  const sentAts = dedupe(events.map((event) => event.sentAt ?? ''));

  return {
    visitRef: visitRefs[0] ?? null,
    isSufficientEvidence,
    sufficient: isSufficientEvidence,
    watchedAt,
    materialIds: dedupe(events.map((event) => event.materialId)),
    satisfiedMaterialIds,
    requiredMaterialIds,
    coveragePercent,
    gaps,
    thresholdPercent,
    perMaterial,
    observedEventCount: events.length,
    appointmentRef: appointmentRefs[0] ?? null,
    sentAt: sentAts[0] ?? null,
  };
}