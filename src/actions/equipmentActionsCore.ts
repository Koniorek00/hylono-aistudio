/**
 * Adaptery wspólne dla akcji panelu OEM (Moduł 6 → warstwa Next.js).
 *
 * Ten plik NIE jest domeną i NIE liczy niczego sam. Jego zadanie jest trzy:
 *   1. zmapować błąd domenowy na typowaną, serializowalną odpowiedź,
 *   2. rozwiązać kontekst tenanta z SESJI (nigdy z formularza),
 *   3. zbudować kształt odpowiedzi, który da się wysłać przez RSC.
 *
 * [DECISION: 2026-10-15] Kolejność bramek w każdej akcji jest jedna i jest
 * kodem, nie konwencją:
 *   1. poprawność STRUKTURY wejścia (zod),
 *   2. poprawność WARTOŚCI wejścia przez funkcję domenową (stawka prowizji,
 *      branding) — zanim cokolwiek sięgnie do bazy,
 *   3. SESJA — brak sesji to błąd, nigdy brak zakresu,
 *   4. KONFIGURACJA BAZY — brak `DATABASE_URL` to `unavailable`, nie błąd
 *      i na pewno nie zmyślona flota,
 *   5. PROFIL → ZAKRES TENANTA z sesji, potem bramka uprawnień,
 *   6. wywołanie funkcji domenowej.
 *
 * Dlaczego stawka i branding są sprawdzane PRZED bazą: wejście błędne jest
 * błędne niezależnie od tego, czy baza jest skonfigurowana. Odwrócona
 * kolejność odpowiedziałaby `database_not_configured` na pytanie, na które
 * odpowiedź brzmi: stawka prowizji jest wymaganym wejściem.
 *
 * [DECISION: 2026-10-15] Identyfikatorem tenanta jest `organizationId` z
 * profilu zweryfikowanego przez `getNexusServiceSessionProfile`. To ten sam
 * identyfikator, którego używa warstwa trwała (`resolveNexusServiceAuthContextForSession`
 * i `persistNexusFleetServiceLog`), więc panel OEM i panel serwisowy widzą
 * jedną i tę samą organizację. Nie pochodzi on z formularza.
 *
 * [DECISION: 2026-10-15] Treści `error.message` z domeny NIGDY nie wracają do
 * klienta. `TenantIsolationError` niesie w komunikacie oba identyfikatory
 * tenanta, a ujawnienie, do kogo należy cudzy wiersz, jest dokładnie tym
 * wyciekiem, którego brama izolacji miała zapobiec. Klient dostaje komunikat
 * z katalogu poniżej; do logu operacyjnego idzie wyłącznie nazwa błędu przez
 * `summarizeErrorForOperationalLog`, czyli bez komunikatu i bez stosu.
 */

import { summarizeErrorForOperationalLog } from '@/app/api/_shared/log-safety';
import {
  BrandingValidationError,
  ThemeIncompleteError,
  brandingConfigSchema,
  type BrandingConfig,
} from '@/lib/equipment/module6/white-label';
import {
  MissingRateError,
  commissionBasisPoints,
  type CommissionBasisPoints,
} from '@/lib/equipment/module6/billing';
import {
  TenantIsolationError,
  TenantScopeError,
  assertCapability,
  tenantContext,
  type TenantCapability,
  type TenantContext,
} from '@/lib/equipment/module6/tenant';
import { plnFromGrosze, type PlnGrosze } from '@/lib/equipment/shared/money-pln';
import {
  isNexusServiceRole,
  type NexusServiceRole,
} from '@/content/nexus-service-app-contract';

/** Powód `unavailable`. Jeden, bo jedna jest przyczyna: brak skonfigurowanej bazy. */
export const DATABASE_UNAVAILABLE_REASON = 'database_not_configured' as const;

export type EquipmentActionErrorCode =
  | 'invalid_input'
  | 'missing_rate'
  | 'invalid_amount'
  | 'branding_invalid'
  | 'auth_required'
  | 'tenant_required'
  | 'capability_denied'
  | 'tenant_isolation'
  | 'storage_error'
  | 'unexpected_error';

export type EquipmentUnavailableResult = {
  readonly status: 'unavailable';
  readonly reason: typeof DATABASE_UNAVAILABLE_REASON;
};

export type EquipmentErrorResult = {
  readonly status: 'error';
  readonly code: EquipmentActionErrorCode;
  readonly message: string;
};

export type EquipmentActionResult<TData> =
  | { readonly status: 'ok'; readonly data: TData }
  | EquipmentUnavailableResult
  | EquipmentErrorResult;

/**
 * Katalog komunikatów. Polski, bez angielskich fraz marketingowych i bez
 * terminów klinicznych — skaner zgodności czyta `src/` i każdy napis dłuższy
 * niż 20 znaków przechodzi przez listę zakazanych pojęć.
 */
export const EQUIPMENT_ACTION_MESSAGES: Readonly<Record<EquipmentActionErrorCode, string>> = {
  invalid_input: 'Nie udało się odczytać danych z formularza. Sprawdź pola i wyślij ponownie.',
  missing_rate:
    'Rozliczenie wymaga stawki prowizji podanej wprost. Stawka nie ma wartości domyślnej.',
  invalid_amount:
    'Kwota musi być całkowitą liczbą groszy. Waluta rozliczenia to złote, grosze są liczbą całkowitą.',
  branding_invalid:
    'Dane brandingu są niepoprawne. Kolor musi mieć postać #rrggbb, a domena — sam hostname.',
  auth_required: 'Ta operacja wymaga zalogowania. Zaloguj się i spróbuj ponownie.',
  tenant_required: 'Sesja nie wskazuje tenanta. Brak zakresu tenanta blokuje tę operację.',
  capability_denied: 'Rola zalogowanego użytkownika nie pozwala na tę operację.',
  tenant_isolation: 'Wiersz należy do innego tenanta. Operacja została wstrzymana.',
  storage_error: 'Dane przeszły walidację, ale zapis w magazynie nie powiódł się.',
  unexpected_error: 'Operacja zakończyła się nieoczekiwanym błędem. Spróbuj ponownie.',
};

/**
 * Panel pokazuje tę linijkę, gdy `status` to `unavailable`. Trzymana obok
 * typu zamiast w nim, bo `unavailable` niesie tylko `reason` — a panel bez
 * tekstu pokazuje pustą tabelę, co wygląda jak awaria.
 */
export const DATABASE_UNAVAILABLE_MESSAGE =
  'Magazyn danych nie jest skonfigurowany. Panel nie pokazuje floty, dopóki nie ma połączenia z bazą.';

/**
 * Sesja w formie, której faktycznie używamy: obiekt użytkownika z JWT.
 * [DECISION: 2026-10-15] Deklaracja celowo nie jest typem sesji NextAuth,
 * tylko minimalnym kształtem, którego używamy. Dzięki temu test podaje
 * sesję bez podnoszenia `next-auth`.
 */
export type EquipmentSessionLike = {
  readonly user?: {
    readonly id?: string | null;
    readonly email?: string | null;
  } | null;
} | null;

/**
 * [DECISION: 2026-10-15] Rola zalogowanego użytkownika → uprawnienia tenanta.
 * Mapowanie jest jawne, bo lista uprawnień rośnie szybciej niż kod, który ją
 * sprawdza. Rola nieznana nie dostaje żadnego uprawnienia — brak wpisu w tej
 * tabeli to brak zakresu, a nie domyślne pełne uprawnienia.
 */
const CAPABILITIES_BY_ROLE: Readonly<Record<NexusServiceRole, readonly TenantCapability[]>> = {
  OWNER: [
    'billing:read',
    'branding:write',
    'orders:read',
    'orders:write',
    'outbox:write',
    'panel:read',
  ],
  OPERATIONS_ADMIN: [
    'billing:read',
    'branding:write',
    'orders:read',
    'orders:write',
    'outbox:write',
    'panel:read',
  ],
  SERVICE_MANAGER: ['billing:read', 'branding:write', 'orders:read', 'orders:write', 'panel:read'],
  TECHNICIAN: ['orders:read', 'panel:read'],
};

export const capabilitiesForRole = (role: NexusServiceRole): readonly TenantCapability[] =>
  CAPABILITIES_BY_ROLE[role];

/** Katalog pomocniczy: nie ma sesji → błąd, nigdy domyślny zakres. */
export const authRequired = (): EquipmentErrorResult => ({
  status: 'error',
  code: 'auth_required',
  message: EQUIPMENT_ACTION_MESSAGES.auth_required,
});

export const errorResult = (code: EquipmentActionErrorCode): EquipmentErrorResult => ({
  status: 'error',
  code,
  message: EQUIPMENT_ACTION_MESSAGES[code],
});

export const unavailableResult = (): EquipmentUnavailableResult => ({
  status: 'unavailable',
  reason: DATABASE_UNAVAILABLE_REASON,
});

export const okResult = <TData>(data: TData): { status: 'ok'; data: TData } => ({
  status: 'ok',
  data,
});

/** Czy sesja ma zalogowanego użytkownika. E-mail jest tu tylko sprawdzeniem obecności. */
export const hasAuthenticatedSession = (session: EquipmentSessionLike): boolean => {
  const user = session?.user;
  if (!user) return false;
  return Boolean(user.email?.trim() || user.id?.trim());
};

/**
 * [DECISION: 2026-10-15] Kontekst tenanta budowany jest WYŁĄCZNIE z profilu
 * zweryfikowanego po sesji. Ta funkcja przyjmuje organizację z profilu, nigdy
 * z wejścia akcji.
 *
 * Klient może przysłać dowolne pole `tenantId` czy `oemTenantId`. Zod je
 * wytnie (obiekty zod domyślnie pomijają nieznane klucze), a gdyby jakaś
 * ścieżka je przepuściła, i tak nie trafiają tutaj — jedynym źródłem
 * identyfikatora jest argument pochodzący z profilu sesji.
 */
export const resolveEquipmentTenantContext = (
  organizationId: string | null | undefined,
  role: string | null | undefined
): EquipmentActionResult<TenantContext> => {
  const tenant = typeof organizationId === 'string' ? organizationId.trim() : '';
  if (tenant.length === 0) {
    return errorResult('tenant_required');
  }
  // [DECISION: 2026-10-15] Zawężanie TYPU, nie rzutowanie na tekst.
  // `isNexusServiceRole(String(role))` sprawdzał to, czy `String(role)` jest
  // rolą — ale nie zawężał zmiennej `role`, więc dalej do `capabilitiesForRole`
  // (która przyjmuje `NexusServiceRole`) trafiał `string | null | undefined`.
  // Sprawdzenie na tej samej wartości, którą później przekazujemy, zawęża typ
  // i usuwa potrzebę rzutowania.
  if (typeof role !== 'string' || !isNexusServiceRole(role)) {
    return errorResult('capability_denied');
  }

  let ctx: TenantContext;
  try {
    ctx = tenantContext({ tenantId: tenant, capabilities: capabilitiesForRole(role) });
  } catch (error) {
    return mapDomainError(error);
  }

  return okResult(ctx);
};

/**
 * Sprawdzenie uprawnienia bramką domenową. Osobne od budowania kontekstu,
 * bo kapacliność różni się per akcja, a kontekst jest wspólny.
 *
 * [DECISION: 2026-10-15] Brak uprawnienia zwraca `capability_denied`, a nie
 * `tenant_isolation`. `assertCapability` rzuca `TenantScopeError` — tę samą
 * klasę co brak tenanta — więc samo mapowanie po nazwie błędu zgłosiłoby
 * „wiersz należy do innego tenanta" dla rola zbyt niskiej. Operator dostający
 * odmowę uprawnienia musi widzieć odmowę uprawnienia: to inny problem, inny
 * zestaw działań i inny komunikat.
 */
export const requireCapability = (
  ctx: TenantContext,
  capability: TenantCapability
): EquipmentActionResult<TenantContext> => {
  try {
    assertCapability(ctx, capability);
  } catch {
    return errorResult('capability_denied');
  }
  return okResult(ctx);
};

/**
 * Mapuje błąd domenowy na odpowiedź akcji.
 *
 * Do klienta idzie komunikat z katalogu. Do logu operacyjnego idzie wyłącznie
 * nazwa błędu z `summarizeErrorForOperationalLog` — bez komunikatu, bez stosu
 * wywołań i bez identyfikatorów tenanta. Ta funkcja NIGDY nie zwraca obiektu
 * `Error` ani `error.message`.
 */
export const mapDomainError = (error: unknown): EquipmentErrorResult => {
  const { name } = summarizeErrorForOperationalLog(error);

  switch (name) {
    case 'MissingRateError':
      return errorResult('missing_rate');
    case 'BrandingValidationError':
    case 'ThemeIncompleteError':
      return errorResult('branding_invalid');
    case 'TenantIsolationError':
    case 'TenantScopeError':
      return errorResult('tenant_isolation');
    case 'RangeError':
    case 'TypeError':
      return errorResult('invalid_input');
    default:
      return errorResult('unexpected_error');
  }
};

/** Czy `error` jest brakiem wymaganej stawki — do testu i do raportowania. */
export const isMissingRateError = (error: unknown): error is MissingRateError =>
  error instanceof MissingRateError;

/** Czy `error` jest naruszeniem izolacji tenanta — do testu i do raportowania. */
export const isTenantIsolationError = (error: unknown): error is TenantIsolationError =>
  error instanceof TenantIsolationError;

/** Czy `error` jest niepoprawnym brandingiem — do testu i do raportowania. */
export const isBrandingError = (
  error: unknown
): error is BrandingValidationError | ThemeIncompleteError =>
  error instanceof BrandingValidationError || error instanceof ThemeIncompleteError;

/**
 * Wejście rozliczenia. `commissionBasisPoints` ma tu typ `unknown`, a nie
 * opcjonalne zero: brak stawki ma zostać podniesiony przez
 * `commissionBasisPoints()` jako `MissingRateError`, a nie zamieniony w zero.
 */
export type BillingActionInput = {
  readonly periodStart?: unknown;
  readonly periodEnd?: unknown;
  readonly subscriptionPlnGrosze?: unknown;
  readonly commissionBasisPoints?: unknown;
};

/**
 * Stawka prowizji przez funkcję domenową. Osobne od parsowania strukturalnego,
 * bo `MissingRateError` ma pochodzić z `module6/billing.ts`, a nie z
 * walidatora w warstwie akcji.
 */
export const readCommissionBasisPoints = (input: {
  readonly commissionBasisPoints?: unknown;
}): CommissionBasisPoints => commissionBasisPoints(input.commissionBasisPoints);

/**
 * [DECISION: 2026-10-15] Abonament też jest wejściem jawnym, a nie wartością
 * domyślną. Mandat nie podaje cennika panelu OEM, a funkcja, która podaje
 * domyślną cenę, jest gorsza od funkcji, która się nie uruchomi. Walidacja
 * groszy idzie przez `plnFromGrosze`, więc kwota zmiennoprzecinkowa nigdy nie
 * dotrze do rozliczenia — zostanie odrzucona jako `RangeError`.
 */
export const readSubscriptionGrosze = (value: unknown): PlnGrosze =>
  plnFromGrosze(typeof value === 'number' ? value : Number.NaN, 'subscriptionPlnGrosze');

/**
 * Wejście brandingu walidowane SCHEMĄ DOMENOWĄ. Zwraca komunikaty zod,
 * które są już po polsku i bez terminów klinicznych.
 */
export const parseBrandingInput = (value: unknown) => brandingConfigSchema.safeParse(value);

export type BrandingInput = BrandingConfig;

/** Wynik walidacji brandingu sprowadzony do postaci serializowalnej. */
export type BrandingFieldIssue = {
  readonly field: string;
  readonly message: string;
};

export type BrandingValidationOutcome =
  | { readonly valid: true; readonly branding: BrandingInput }
  | { readonly valid: false; readonly issues: readonly BrandingFieldIssue[] };

/**
 * Zamienia `ZodError` na listę pól i komunikatów. Zod sam w sobie jest
 * serializowalny, ale jego `issues` niosą obiekty z cyklicznymi referencjami
 * w niektórych wersjach — przez RSC nie przechodzą. Dlatego spłaszczamy do
 * dwóch pól prymitywnych.
 */
export const readBrandingIssues = (error: {
  readonly issues: readonly { readonly path?: readonly PropertyKey[]; readonly message?: string }[];
}): readonly BrandingFieldIssue[] =>
  error.issues.map((issue) => ({
    field: (issue.path ?? []).map(String).join('.'),
    message: issue.message ?? 'niepoprawna wartość',
  }));

export { assertCapability, TenantScopeError, TenantIsolationError, MissingRateError };
export { BrandingValidationError, ThemeIncompleteError };
