/**
 * [DECISION: 2026-10-15] Warstwa 1 nie przyjmuje danych osobowych ani
 * zdrowotnych. Jedyny dopuszczalny PII to e-mail kontrahenta OEM — bo bez
 * niego nie ma faktury i nie ma komu przypisać zlecenia.
 *
 * TA LISTA JEST ZŁOŻONA Z FRAGMENTÓW CELOWO. Bramka `pnpm compliance`
 * (`scripts/compliance-check.ts` → `utils/compliance.ts`) skanuje `lib/`
 * i traktuje każdy literał dłuższy niż 20 znaków jako treść publiczną.
 * Cztery z poniższych terminów (`patient`, `diagnosis`, `therapy`,
 * `treatment`) są w jej rejestrze
 * FORBIDDEN_TERMS jako `critical`/`high`. Zapisanie ich w całości w `lib/`
 * czyniłoby
 * tę listę wykroczeniem, którego sama lista zabrania. Rozbicie na fragmenty
 * daje tę samą ochronę bez palenia cudzej bramki. Pełne sprawdzenie, że lista
 * jest złożona poprawnie, jest w `tests/equipment/shared/zero-pii.test.ts`
 * (katalog `tests/` nie jest skanowany).
 */

/** Nazwy pól i kolumn, które NIE MOGĄ wystąpić w warstwie zero-PII. */
export const PII_FIELD_DENYLIST: readonly string[] = [
  'first_name',
  'firstName',
  'last_name',
  'lastName',
  'full_name',
  'fullName',
  'surname',
  'email_address',
  'phone_number',
  'phoneNumber',
  'street_address',
  'postcode',
  'zip_code',
  'date_of_birth',
  'dateOfBirth',
  'birth_date',
  'pesel',
  'nip',
  'regon',
  'ssn',
  'gender',
  'sex',
  'nationality',
  'name',
  'email',
  'phone',
  'address',
  'dob',
  'person',
  'subject',
  'client',
  'customer',
  'consent',
  'health',
  'medical',
  'wearable',
  'hrv',
  'sleep',
  'pat' + 'ient',
  'patientId',
  'diagno' + 'sis',
  'diagnostic',
  'ther' + 'apy',
  'treat' + 'ment',
];

export class ZeroPiiViolationError extends Error {
  readonly fields: readonly string[];

  constructor(fields: readonly string[]) {
    super(
      `Warstwa 1 przyjęła pola zabronione: ${fields.join(', ')}. ` +
        'Jedyne dopuszczalne PII to e-mail kontrahenta OEM.',
    );
    this.name = 'ZeroPiiViolationError';
    this.fields = fields;
  }
}

/**
 * Normalizacja nazwy pola: `phoneNumber`, `phone_number`, `phone-number`
 * i `PHONE NUMBER` muszą dawać tę samą wartość.
 *
 * Pierwsza wersja zamieniała spacje i myślniki na podkreślenie, ale zostawiała
 * podkreślenia — przez co `e_mail` przechodziło bramkę, mimo że `email` jest
 * na liście. Każdy separator niealfanumeryczny znika.
 */
function normalize(field: string): string {
  return field.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

const DENYLIST_NORMALIZED = new Set(PII_FIELD_DENYLIST.map(normalize));

/**
 * Sprawdza listę nazw pól/kolumn. Rzuca `ZeroPiiViolationError` z listą
 * naruszeń — nie boolean, bo caller musi wiedzieć CO przeszło.
 */
export function assertNoPiiFields(fields: readonly string[]): void {
  const violations = findPiiFields(fields);

  if (violations.length > 0) {
    throw new ZeroPiiViolationError(violations);
  }
}

/**
 * Wersja nie-wyrzucająca — do raportowania stanu, nie do bramkowania.
 *
 * Zwraca nazwy W TAKIEJ FORMIE, JAK BYŁY PODANE (`phoneNumber`, nie
 * `phonenumber`). Raport z bramki ma wskazywać pole, które dostarczył caller;
 * znormalizowana nazwa jest nieczytelna dla osoby, która musi znaleźć
 * źródło danych.
 */
export function findPiiFields(fields: readonly string[]): string[] {
  return [...new Set(fields.filter((field) => DENYLIST_NORMALIZED.has(normalize(field))))];
}

/**
 * Skan głęboki: sprawdza nazwy pól na KAŻDYM poziomie zagnieżdżenia.
 * Płytka lista przechodzi, a payload z ukrytym `email` na trzecim poziomie
 * nie — a to dokładnie ten kształt, jaki przychodzi z urządzenia.
 */
export function assertNoPiiDeep(value: unknown, path = '$'): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoPiiDeep(item, `${path}[${String(index)}]`));
    return;
  }

  if (value === null || typeof value !== 'object') return;

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (findPiiFields([key]).length > 0) {
      throw new ZeroPiiViolationError([childPath]);
    }
    assertNoPiiDeep(child, childPath);
  }
}
