/**
 * Moduł 6 — rejestr wycofań zgody marketingowej.
 *
 * Kanały sprzedaży w panelu OEM są zautomatyzowane (zlecenie przeglądu i
 * zaplecza po przekroczeniu progu godzin), więc ktoś musi móc je wyłączyć.
 * Wycofanie zgody marketingowej jest REKORDEM, nie flagą na obiekcie zlecenia:
 * brak rekordu znaczy „nie wiadomo", a zapisany rekord znaczy „wymówiono".
 *
 * [DECISION: 2026-10-15] Wycofanie jest TRWAŁE w tym rejestrze. Nie ma ścieżki
 * ponownego wyrażenia zgody w module OEM — ponowienie zgody to inny proces,
 * inny podmiot, inny dowód. Funkcja `canSendForPurpose` nie pyta „czy kiedyś
 * wyrażał zgodę", tylko „czy nie ma wycofania".
 *
 * [DECISION: 2026-10-15] Zgoda serwisowa (purpose `service`) NIE jest zablokowana
 * wycofaniem zgody marketingowej. Serwis odpowiada na zgłoszenie awarii; zablokowanie
 * go odwołaniem z newslettera byłoby karą za kliknięcie.
 *
 * [SCHEMA GAP — 2026-10-15] `equipment_marketing_consent_revocations` nie ma
 * kolumny `oem_tenant_id`. Wycofanie jest więc ogólne dla podmiotu, a nie
 * przypisane do tenanta. Partycjonowanie tego rejestru wymaga zmiany
 * `lib/db/schema.ts`, która leży poza modułem — zgłoszone właścicielowi schemy,
 * nie obejście tutaj. Patrz `MARKETING_REVOCATION_TENANT_SCOPE`.
 */

/**
 * Odpornik podmiotu. NIE jest identyfikatorem osoby ani konta — jest tym samym
 * anonimowym tokenem, którego używa warstwa zgód (Moduł 4/5).
 */
export type SubjectRef = string & { readonly __brand: 'SubjectRef' };

export const SUBJECT_REF_MAX_LENGTH = 128;

/** Cel wysyłki. Dwa, bo dwa różne wymogi prawne. */
export const SEND_PURPOSES = ['service', 'marketing'] as const;
export type SendPurpose = (typeof SEND_PURPOSES)[number];

/** Rekord wycofania — dopasowany do `equipment_marketing_consent_revocations`. */
export type MarketingRevocation = {
  readonly id: string;
  readonly subjectRef: string;
  /** ISO 8601. */
  readonly revokedAt: string;
  readonly reason: string | null;
};

/** Opis luki schematowej, o której mowa w decyzji na górze pliku. */
export const MARKETING_REVOCATION_TENANT_SCOPE =
  'equipment_marketing_consent_revocations nie zawiera kolumny oem_tenant_id — ' +
  'rejestr wycofań jest globalny dla podmiotu, nie partycjonowany per tenant.';

export class MarketingConsentRevokedError extends Error {
  readonly subject: string;
  readonly revokedAt: string;
  readonly at: string;

  constructor(subject: string, revokedAt: string, at: string) {
    super(
      `Zgoda marketingowa została wymówiona dla podmiotu ${subject} ` +
        `w dniu ${revokedAt}; próba wysyłki o ${at}. Kanał serwisowy pozostaje dostępny.`,
    );
    this.name = 'MarketingConsentRevokedError';
    this.subject = subject;
    this.revokedAt = revokedAt;
    this.at = at;
  }
}

export class RevocationRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RevocationRecordError';
  }
}

export function subjectRef(value: unknown, field = 'subjectRef'): SubjectRef {
  if (typeof value !== 'string') {
    throw new RevocationRecordError(
      `${field} musi być odpornikiem podmiotu, otrzymano: ${String(value)}`,
    );
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new RevocationRecordError(`${field} nie może być pusty`);
  }
  if (trimmed.length > SUBJECT_REF_MAX_LENGTH) {
    throw new RevocationRecordError(
      `${field} przekracza ${String(SUBJECT_REF_MAX_LENGTH)} znaków`,
    );
  }
  return trimmed as SubjectRef;
}

export function sendPurpose(value: unknown): SendPurpose {
  if (value !== 'service' && value !== 'marketing') {
    throw new RevocationRecordError(
      `Cel wysyłki musi być jednym z: ${SEND_PURPOSES.join(', ')}. ` +
        `Otrzymano: ${String(value)}`,
    );
  }
  return value;
}

function revokedAtMillis(record: MarketingRevocation): number {
  if (record === null || typeof record !== 'object') {
    throw new RevocationRecordError('Rekord wycofania musi być obiektem');
  }
  const at = Date.parse(record.revokedAt);
  if (Number.isNaN(at)) {
    throw new RevocationRecordError(
      `Rekord wycofania ${String(record.id)} ma niepoprawny znacznik czasu: ` +
        String(record.revokedAt),
    );
  }
  return at;
}

/** Rekordy wycofań danego podmiotu. */
export function revocationsForSubject(
  revocations: readonly MarketingRevocation[] | null | undefined,
  subject: unknown,
): MarketingRevocation[] {
  const ref = subjectRef(subject);
  if (!Array.isArray(revocations)) {
    throw new TypeError('revocations musi być tablicą rekordów wycofania');
  }
  return revocations.filter(
    (record) => record !== null && record.subjectRef === ref,
  );
}

function assertRevocationList(
  revocations: readonly MarketingRevocation[] | null | undefined,
): readonly MarketingRevocation[] {
  if (!Array.isArray(revocations)) {
    throw new TypeError('revocations musi być tablicą rekordów wycofania');
  }
  return revocations;
}

/**
 * Bramka marketingowa. Rzuca, jeśli istnieje wycofanie o dacie ≤ `at`.
 * Granica jest włączna: wycofanie w dniu `at` obowiązuje w dniu `at`.
 *
 * Niepoprawny znacznik czasu w rekordzie jest BŁĘDEM, nie „brakiem wycofania" —
 * inaczej uszkodzony rekord cicho przywraca kanał.
 */
export function assertMarketingAllowed(
  revocations: readonly MarketingRevocation[] | null | undefined,
  subject: unknown,
  at: string,
): void {
  const ref = subjectRef(subject);
  const records = assertRevocationList(revocations);
  const now = Date.parse(at);
  if (Number.isNaN(now)) {
    throw new RevocationRecordError(`at musi być znacznikiem czasu ISO 8601: ${String(at)}`);
  }
  for (const record of records) {
    if (record === null || record.subjectRef !== ref) continue;
    if (revokedAtMillis(record) <= now) {
      throw new MarketingConsentRevokedError(ref, record.revokedAt, at);
    }
  }
}

/**
 * Czy dla tego celu wysyłki wolno nadać? Serwis tak, marketing tylko wtedy,
 * gdy nie ma ŻADNEGO wycofania. Wywołanie bez kontekstu czasu znaczy „teraz”,
 * a „teraz” jest po każdym wycofaniu.
 */
export function canSendForPurpose(
  subject: unknown,
  purpose: unknown,
  revocations: readonly MarketingRevocation[] | null | undefined,
): boolean {
  const ref = subjectRef(subject);
  const target = sendPurpose(purpose);
  const records = assertRevocationList(revocations);
  if (target === 'service') return true;
  return !records.some((record) => record !== null && record.subjectRef === ref);
}

/**
 * Bramka wysyłki z celem i czasem. Wymaga `at`, bo „wysyłka kiedyś" nie jest
 * operacją — wysyłka ma datę, a data jest argumentem.
 */
export function assertSendAllowed(
  subject: unknown,
  purpose: unknown,
  revocations: readonly MarketingRevocation[] | null | undefined,
  at: string,
): void {
  const target = sendPurpose(purpose);
  if (target === 'service') {
    subjectRef(subject);
    const now = Date.parse(at);
    if (Number.isNaN(now)) {
      throw new RevocationRecordError(`at musi być znacznikiem czasu ISO 8601: ${String(at)}`);
    }
    return;
  }
  assertMarketingAllowed(revocations, subject, at);
}