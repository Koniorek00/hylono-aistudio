/**
 * Moduł 6 — izolacja danych OEM (tenant).
 *
 * Tenant = producent albo dystrybutor sprzętu. Panel OEM ma pokazywać WYŁĄCZNIE
 * dane własnego tenanta. Izolacja jest egzekwowana w domenie: `TenantId` jest
 * oznaczone w typie, `TenantContext` jest wymaganym argumentem każdej funkcji,
 * która czyta albo zapisuje dane tenanta, a `scopeToTenant` ODRZUCA (nie
 * zwraca) każdy wiersz, którego właścicielem jest inny tenant. Poprawny
 * `WHERE` w warstwie SQL jest optymalizacją, a izolacją jest typ i filtr.
 *
 * [DECISION: 2026-10-15] W tym pliku nie ma ani jednej kwoty ani stawki.
 * Mandat nie podaje cennika panelu OEM, a funkcja, która podaje domyślną
 * cenę, jest gorsza od funkcji, która się nie uruchomi — patrz `billing.ts`.
 */

/** Identyfikator tenanta (OEM). Oznaczony, bo goły `string` przechodzi wszędzie. */
export type TenantId = string & { readonly __brand: 'TenantId' };

/** Granica długości identyfikatora. Schema traktuje `id` jako `text`. */
export const TENANT_ID_MAX_LENGTH = 128;

/**
 * Uprawnienia w panelu tenanta. Wymienione jawnie, bo lista kontrolna
 * uprawnień rośnie szybciej niż kod, który ją sprawdza.
 */
export const TENANT_CAPABILITIES = [
  'panel:read',
  'orders:read',
  'orders:write',
  'billing:read',
  'branding:write',
  'outbox:write',
] as const;

export type TenantCapability = (typeof TENANT_CAPABILITIES)[number];

/** Brak zakresu tenanta. Baza izolacji, nie szczegółowa przyczyna. */
export class TenantScopeError extends Error {
  readonly field: string;

  constructor(message: string, field: string) {
    super(message);
    this.name = 'TenantScopeError';
    this.field = field;
  }
}

/**
 * Wiersz należy do innego tenanta. Komunikat zawiera OBA identyfikatory —
 * log rozliczeniowy musi dać odpowiedź na pytanie, czyja operacja ujawniła
 * cudzy wiersz, a nie tylko to, że jakaś operacja się nie powiodła.
 */
export class TenantIsolationError extends TenantScopeError {
  readonly actorTenantId: string;
  readonly recordTenantId: string;
  readonly subject: string;

  constructor(actorTenantId: string, recordTenantId: string, subject: string) {
    super(
      `Brak izolacji tenanta: ${subject} należy do ${recordTenantId}, ` +
        `a operacja pochodzi od ${actorTenantId}.`,
      'oemTenantId',
    );
    this.name = 'TenantIsolationError';
    this.actorTenantId = actorTenantId;
    this.recordTenantId = recordTenantId;
    this.subject = subject;
  }
}

/** Kontekst wykonania — zakres tenanta obowiązujący w całej operacji. */
export type TenantContext = {
  readonly tenantId: TenantId;
  readonly capabilities: readonly TenantCapability[];
};

/** Wiersz tabeli nośnikowej. Kolumna właściciela jest warunkiem widoczności. */
export type TenantScopedRow = {
  readonly oemTenantId: string;
};

const CAPABILITY_SET: ReadonlySet<string> = new Set<string>(TENANT_CAPABILITIES);

/**
 * Zamienia surową wartość na `TenantId`. Rzuca zamiast zwracać `undefined`:
 * brak identyfikatora tenanta to brak zakresu, a nie pusty zakres.
 */
export function tenantId(value: unknown, field = 'tenantId'): TenantId {
  if (typeof value !== 'string') {
    throw new TenantScopeError(
      `${field} musi być identyfikatorem tenanta, otrzymano: ${describe(value)}`,
      field,
    );
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new TenantScopeError(`${field} nie może być pusty — brak zakresu tenanta`, field);
  }
  if (trimmed.length > TENANT_ID_MAX_LENGTH) {
    throw new TenantScopeError(
      `${field} przekracza ${String(TENANT_ID_MAX_LENGTH)} znaków`,
      field,
    );
  }
  return trimmed as TenantId;
}

function describe(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `"${value}"`;
  return String(value);
}

/**
 * Bramka izolacji. Rzuca `TenantIsolationError`, gdy rekord należy do innego
 * tenanta. Brak identyfikatora po stronie aktora jest również naruszeniem —
 * stąd `TenantScopeError` zamiast cichego założenia, że aktorem jest wszyscy.
 */
export function assertSameTenant(
  actorTenantId: TenantId,
  recordTenantId: unknown,
  subject = 'rekord',
): void {
  const actor = tenantId(actorTenantId, 'actorTenantId');
  const record = tenantId(recordTenantId, 'recordTenantId');
  if (actor !== record) {
    throw new TenantIsolationError(actor, record, subject);
  }
}

/** Odczytuje i waliduje `TenantId` z dowolnej wartości (np. z bazy). */
export function readTenantId(value: unknown, field = 'oemTenantId'): TenantId {
  return tenantId(value, field);
}

/**
 * Buduje kontekst z surowego wejścia. Uprawnienia są normalizowane
 * (odrzut duplikatów + sortowanie), żeby równy zestaw zawsze dawał ten sam
 * obiekt — inaczej testy porównujące kontekst krują o kolejność wstawienia.
 */
export function tenantContext(input: {
  readonly tenantId: unknown;
  readonly capabilities: readonly string[];
}): TenantContext {
  if (input === null || typeof input !== 'object') {
    throw new TenantScopeError(
      `kontekst tenanta musi być obiektem, otrzymano: ${describe(input)}`,
      'ctx',
    );
  }
  const id = tenantId(input.tenantId, 'ctx.tenantId');
  if (!Array.isArray(input.capabilities)) {
    throw new TenantScopeError(
      `ctx.capabilities musi być tablicą uprawnień, otrzymano: ${describe(input.capabilities)}`,
      'ctx.capabilities',
    );
  }
  const capabilities = normalizeCapabilities(input.capabilities, 'ctx.capabilities');
  return Object.freeze({ tenantId: id, capabilities }) as TenantContext;
}

function normalizeCapabilities(
  values: readonly string[],
  field: string,
): readonly TenantCapability[] {
  const out = new Set<TenantCapability>();
  for (const value of values) {
    if (typeof value !== 'string' || !CAPABILITY_SET.has(value)) {
      throw new TenantScopeError(
        `${field}: nieznane uprawnienie ${describe(value)}. ` +
          `Dostępne: ${TENANT_CAPABILITIES.join(', ')}`,
        field,
      );
    }
    out.add(value as TenantCapability);
  }
  return Object.freeze([...out].sort());
}

/**
 * Ponowna walidacja kontekstu w miejscu użycia. Kontekst jest typem, a typy
 * nie obowiązują się przy `as` ani przy danych z sieci — dlatego każda funkcja
 * czytająca dane tenanta waliduje kontekst jeszcze raz, u siebie.
 */
export function assertTenantContext(
  ctx: unknown,
  label = 'kontekst tenanta',
): TenantContext {
  if (ctx === null || typeof ctx !== 'object') {
    throw new TenantScopeError(
      `${label} musi być obiektem TenantContext, otrzymano: ${describe(ctx)}`,
      'ctx',
    );
  }
  const candidate = ctx as { tenantId?: unknown; capabilities?: unknown };
  const id = tenantId(candidate.tenantId, `${label}.tenantId`);
  if (!Array.isArray(candidate.capabilities)) {
    throw new TenantScopeError(
      `${label}.capabilities musi być tablicą uprawnień, otrzymano: ${describe(candidate.capabilities)}`,
      `${label}.capabilities`,
    );
  }
  const capabilities = normalizeCapabilities(
    candidate.capabilities as readonly string[],
    `${label}.capabilities`,
  );
  return Object.freeze({ tenantId: id, capabilities }) as TenantContext;
}

export function hasCapability(ctx: TenantContext, capability: TenantCapability): boolean {
  return assertTenantContext(ctx).capabilities.includes(capability);
}

/** Rzuca, gdy kontekst nie ma konkretnego uprawnienia. */
export function assertCapability(ctx: TenantContext, capability: TenantCapability): void {
  if (!hasCapability(ctx, capability)) {
    throw new TenantScopeError(
      `brak uprawnienia ${capability} dla tenanta ${assertTenantContext(ctx).tenantId}`,
      'ctx.capabilities',
    );
  }
}

/**
 * TWARDY FILTR. Zwraca wyłącznie wiersze należące do tenanta z kontekstu.
 * Wiersz innego tenanta jest ODRZUCANY, nie zwracany — to jedyna poprawna
 * semantyka, bo zwrócenie go z filtrem „po stronie klienta" przenosi wyciek
 * do warstwy prezentacji, a ta jest pisana przez inny zespół.
 *
 * Wiersz bez identyfikatora właściciela też jest odrzucany: brak dowodu
 * własności nie jest dowodem własności.
 */
export function scopeToTenant<TRow extends TenantScopedRow>(
  rows: readonly TRow[] | null | undefined,
  ctx: TenantContext,
  label = 'scopeToTenant',
): TRow[] {
  const active = assertTenantContext(ctx, label);
  if (!Array.isArray(rows)) {
    throw new TypeError(
      `${label}: oczekiwano tablicy wierszy, otrzymano: ${describe(rows)}`,
    );
  }
  const out: TRow[] = [];
  for (const row of rows) {
    if (row === null || typeof row !== 'object') continue;
    const owner = (row as TenantScopedRow).oemTenantId;
    if (typeof owner !== 'string') continue;
    const trimmed = owner.trim();
    if (trimmed.length === 0) continue;
    if (trimmed === active.tenantId) out.push(row);
  }
  return out;
}

/** Ile wierszy odrzucił `scopeToTenant` — do telemetrii, nie do tabeli. */
export function countDroppedByScope(
  rows: readonly TenantScopedRow[] | null | undefined,
  ctx: TenantContext,
): number {
  const kept = scopeToTenant(rows, ctx).length;
  return Array.isArray(rows) ? rows.length - kept : 0;
}

/**
 * Wariant ścieżki zapisu: obcy wiersz jest BŁĘDEM, a nie pominięciem.
 * Odczyt ma prawo odfiltrować, zapis ma obowiązek się zatrzymać.
 */
export function assertAllRowsBelongToTenant<TRow extends TenantScopedRow & { readonly id?: string }>(
  rows: readonly TRow[] | null | undefined,
  ctx: TenantContext,
  label = 'operacja zapisu',
): void {
  const active = assertTenantContext(ctx, label);
  if (!Array.isArray(rows)) {
    throw new TypeError(
      `${label}: oczekiwano tablicy wierszy, otrzymano: ${describe(rows)}`,
    );
  }
  for (const row of rows) {
    if (row === null || typeof row !== 'object') continue;
    const owner = (row as TenantScopedRow).oemTenantId;
    assertSameTenant(active.tenantId, owner, row.id ?? label);
  }
}