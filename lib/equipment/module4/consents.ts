/**
 * [DECISION: 2026-10-15] Cztery ROZDZIELONE zgody.
 *
 * Mandat wymaga „4 ściśle rozdzielonych zgod: zdrowotnej (Art. 9 RODO),
 * zabiegowej (z pełną listą przeciwwskazań), marketingowej PKE (z rejestrem
 * wycofań), wizerunkowej — plus odrębnej klauzuli informacyjnej".
 *
 * Rozdzielenie jest celowe i nie jest kosmetyką. Zgoda na profilaktykę nie
 * upoważnia do wysyłki marketingowej; zgoda na zdjęcie wizerunku nie upoważnia
 * do profilowania. Model „jedna zgoda, cztery checkboxy" jest w praktyce
 * jednym upoważnieniem — bo system nie potrafi powiedzieć, które z czterech
 * praw zostały cofnięte, gdy użytkownik odznaczył jedno pole.
 *
 * Klauzula informacyjna jest OSOBNYM typem, nie osobnym consentType: to nie
 * jest zgoda, tylko obowiązek poinformowania. Mylenie obu rzeczy to klasyczny
 * błąd, po którym zgoda jest nieważna.
 */

export const CONSENT_TYPES = [
  'health',
  'procedure',
  'marketing',
  'image',
] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

/** Informacja to nie zgoda. Osobny typ, bo osobny cykl życia. */
export const INFORMED_NOTICE_TYPE = 'informed_notice' as const;
export type InformedNotice = {
  readonly kind: typeof INFORMED_NOTICE_TYPE;
  readonly contentVersion: string;
  readonly acknowledgedAt: string;
};

export type ConsentRecord = {
  readonly subjectRef: string;
  readonly consentType: ConsentType;
  readonly granted: boolean;
  readonly contentVersion: string;
  readonly grantedAt: string | null;
  readonly withdrawnAt: string | null;
};

export class ConsentError extends Error {
  readonly code: 'unknown_consent_type' | 'missing_consent' | 'stale_content_version';

  constructor(code: ConsentError['code'], message: string) {
    super(message);
    this.name = 'ConsentError';
    this.code = code;
  }
}

export function isConsentType(value: string): value is ConsentType {
  return (CONSENT_TYPES as readonly string[]).includes(value);
}

/**
 * Stan zgód dla jednego podmiotu.
 *
 * `granted` liczy tylko zgody AKTUALNE. Cofnięta zgoda znika ze stanu, a nie
 * zmienia się w `false` — bo `false` i „nigdy nie było" to dwa różne fakty,
 * a w audycie RODO to różnica między niepisaną zgodą a odebraną.
 */
export type ConsentState = {
  readonly subjectRef: string;
  readonly granted: ReadonlySet<ConsentType>;
  readonly notices: readonly InformedNotice[];
};

export function buildConsentState(
  subjectRef: string,
  records: readonly ConsentRecord[],
  notices: readonly InformedNotice[] = [],
): ConsentState {
  const granted = new Set<ConsentType>();

  for (const record of records) {
    if (!isConsentType(record.consentType)) {
      throw new ConsentError(
        'unknown_consent_type',
        `nieznany typ zgody: "${record.consentType}"`,
      );
    }
    const current = record.granted && record.withdrawnAt === null;
    if (current) granted.add(record.consentType);
  }

  return { subjectRef, granted, notices };
}

/** Zgoda wymagana przed daną operacją — rzuca, gdy jej nie ma. */
export function assertConsent(state: ConsentState, required: ConsentType): void {
  if (!isConsentType(required)) {
    throw new ConsentError('unknown_consent_type', `nieznany typ zgody: "${required}"`);
  }
  if (!state.granted.has(required)) {
    throw new ConsentError(
      'missing_consent',
      `brak aktualnej zgody "${required}" dla podmiotu ${state.subjectRef}`,
    );
  }
}

/**
 * Zmiana treści materiału unieważnia wcześniejszą zgodę. Zgoda na wersję
 * „v1" nie jest zgodą na wersję „v2" — to nie jest formalność, bo zmiana
 * treści zmienia to, na co się zgadzano.
 */
export function assertNoticeAcknowledged(state: ConsentState, contentVersion: string): void {
  const acknowledged = state.notices.some(
    (notice) => notice.contentVersion === contentVersion,
  );
  if (!acknowledged) {
    throw new ConsentError(
      'stale_content_version',
      `brak potwierdzenia klauzuli informacyjnej w wersji "${contentVersion}"`,
    );
  }
}

export type OperationRequirement = {
  readonly required: readonly ConsentType[];
  readonly contentVersion?: string;
};

/** Bramka przed każdą operacją dotyczącą podmiotu. */
export function assertCanProceed(
  state: ConsentState,
  requirement: OperationRequirement,
): void {
  for (const consent of requirement.required) assertConsent(state, consent);
  if (requirement.contentVersion !== undefined) {
    assertNoticeAcknowledged(state, requirement.contentVersion);
  }
}

/** Marketing: dozwolony tylko przy aktywnej zgodzie i braku wycofania. */
export function marketingAllowed(
  state: ConsentState,
  revocations: readonly { readonly subjectRef: string; readonly revokedAt: string }[],
  atIso: string,
): boolean {
  if (!state.granted.has('marketing')) return false;
  const revoked = revocations.some(
    (revocation) =>
      revocation.subjectRef === state.subjectRef && revocation.revokedAt <= atIso,
  );
  return !revoked;
}

/** Stan do renderowania — lista praw, bez zdolności do ich nadania. */
export function describeConsentState(state: ConsentState): {
  readonly subjectRef: string;
  readonly granted: readonly ConsentType[];
  readonly missing: readonly ConsentType[];
  readonly noticeVersions: readonly string[];
} {
  const missing = CONSENT_TYPES.filter((type) => !state.granted.has(type));
  return {
    subjectRef: state.subjectRef,
    granted: CONSENT_TYPES.filter((type) => state.granted.has(type)),
    missing,
    noticeVersions: state.notices.map((notice) => notice.contentVersion),
  };
}
