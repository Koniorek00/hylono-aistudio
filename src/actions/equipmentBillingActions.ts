'use server';

/**
 * Akcje rozliczenia i brandingu tenanta (Moduł 6 → warstwa Next.js).
 *
 * [DECISION: 2026-10-15] `commissionBasisPoints` jest WEJŚCIEM WYMIAGANYM.
 * Akcja nie ma stawki domyślnej, nie ma stawki z konfiguracji i nie ma
 * stawki z cennika, bo mandatu cennika nie podaje. Brak stawki kończy się
 * `missing_rate`, a nie wyzerowaną prowizją — wyzerowana prowizja to liczba,
 * której nikt nie zamówił, a którą da się potem wytłumaczyć jako wynik.
 *
 * [DECISION: 2026-10-15] Waluta rozliczenia to PLN, kwoty w groszach
 * całkowitych. Kwota zmiennoprzecinkowa z formularza jest odrzucana przez
 * `plnFromGrosze` jako `RangeError` i nigdy nie trafia do `computePeriodBilling`.
 *
 * [DECISION: 2026-10-15] Abonament jest wejściem jawnym z tego samego powodu
 * co stawka prowizji: mandat podaje model rozliczenia, nie cennik.
 */

import { and, eq } from 'drizzle-orm';
import { isDatabaseConfigured, getDb, ensureDatabaseReady } from '@/lib/db/client';
import {
  equipmentOemTenantsTable,
  equipmentServiceOrdersTable,
} from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';
import {
  computePeriodBilling,
  formatBillingReport,
  type BillableOrder,
  type TenantBillingBreakdown,
} from '@/lib/equipment/module6/billing';
import {
  brandingConfigSchema,
  defineThemeFallback,
  resolveTheme,
  BRANDING_WRITE_CAPABILITY,
  type BrandingConfig,
} from '@/lib/equipment/module6/white-label';
import { assertSameTenant, type TenantContext } from '@/lib/equipment/module6/tenant';
import { plnFromGrosze, type PlnGrosze } from '@/lib/equipment/shared/money-pln';
import {
  authRequired,
  errorResult,
  hasAuthenticatedSession,
  mapDomainError,
  okResult,
  parseBrandingInput,
  readBrandingIssues,
  readCommissionBasisPoints,
  readSubscriptionGrosze,
  requireCapability,
  resolveEquipmentTenantContext,
  unavailableResult,
  type BillingActionInput,
  type BrandingFieldIssue,
  type BrandingInput,
  type EquipmentActionResult,
  type EquipmentSessionLike,
} from '@/src/actions/equipmentActionsCore';

/** Wiersz zlecenia w bazie, sprowadzony do pól, którymi interesuje się domena. */
type BillableOrderRow = {
  id: string;
  oemTenantId: string;
  orderValuePlnGrosze: number | null;
  commissionedAt: Date | null;
};

/** Wiersz tenanta w bazie — branding jest jsonb, więc przychodzi jako tekst. */
type TenantRow = {
  id: string;
  branding: unknown;
};

const toIsoOrNull = (value: Date | string | null): string | null => {
  if (value === null || value === undefined) return null;
  const instant = value instanceof Date ? value : new Date(value);
  return Number.isNaN(instant.getTime()) ? null : instant.toISOString();
};

/**
 * Widok rozliczenia zwracany do panelu. Wszystkie kwoty to liczby całkowite
 * w groszach — nigdy `Date`, nigdy `Map`, nigdy instancja klasy, bo cała
 * odpowiedź idzie przez RSC i musi przejść `JSON.parse(JSON.stringify(...))`.
 */
export type TenantBillingView = {
  readonly tenantId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly subscriptionPlnGrosze: PlnGrosze;
  readonly commissionPlnGrosze: PlnGrosze;
  readonly ordersPlnGrosze: PlnGrosze;
  readonly totalPlnGrosze: PlnGrosze;
  readonly orderCount: number;
  readonly commissionBasisPoints: number;
  readonly unpricedOrderCount: number;
  readonly notCommissionedOrderCount: number;
  readonly report: string;
};

const toBillingView = (
  breakdown: TenantBillingBreakdown,
  ctx: TenantContext
): TenantBillingView => ({
  tenantId: breakdown.tenantId,
  periodStart: breakdown.periodStart,
  periodEnd: breakdown.periodEnd,
  subscriptionPlnGrosze: breakdown.subscriptionPln,
  commissionPlnGrosze: breakdown.commissionPln,
  ordersPlnGrosze: breakdown.ordersPlnGrosze,
  totalPlnGrosze: breakdown.totalPln,
  orderCount: breakdown.orderCount,
  commissionBasisPoints: breakdown.commissionBasisPoints,
  unpricedOrderCount: breakdown.unpricedOrderCount,
  notCommissionedOrderCount: breakdown.notCommissionedOrderCount,
  // Formatowanie idzie przez funkcję domenową — kwota wychodzi wyłącznie
  // przez `formatPln`, więc panel nie ma szansy wyświetlić surowych groszy.
  report: formatBillingReport(breakdown, ctx),
});

/**
 * Rozliczenie okresu dla tenanta sesji.
 *
 * Kolejność ma znaczenie dowodowe: stawka jest sprawdzana PRZED bazą, bo brak
 * stawki jest błędem wejścia niezależnym od tego, czy baza w ogóle istnieje.
 * Gdy bazy nie ma, akcja zwraca `unavailable` — nigdy rozliczenie z zmyślonym
 * zleceniem i nigdy prowizję policzoną z listy, której nie ma.
 */
export const computeTenantBillingAction = async (
  input: BillingActionInput
): Promise<EquipmentActionResult<TenantBillingView>> => {
  // 1. Stawka przez domenę. Brak → `MissingRateError` → `missing_rate`.
  //    To jest świadomie PRZED sprawdzeniem bazy.
  let basisPoints;
  try {
    basisPoints = readCommissionBasisPoints(input ?? {});
  } catch (error) {
    return mapDomainError(error);
  }

  let subscription: PlnGrosze;
  try {
    subscription = readSubscriptionGrosze(input?.subscriptionPlnGrosze);
  } catch (error) {
    return mapDomainError(error);
  }

  const periodStart = typeof input?.periodStart === 'string' ? input.periodStart.trim() : '';
  const periodEnd = typeof input?.periodEnd === 'string' ? input.periodEnd.trim() : '';
  if (periodStart.length === 0 || periodEnd.length === 0) {
    return errorResult('invalid_input');
  }

  // 2. Sesja.
  const session = (await auth()) as EquipmentSessionLike;
  if (!hasAuthenticatedSession(session)) {
    return authRequired();
  }

  // 3. Baza.
  if (!isDatabaseConfigured()) {
    return unavailableResult();
  }

  // 4. Zakres tenana z profilu sesji — nigdy z wejścia.
  const profile = await getNexusServiceSessionProfile(session as never);
  const resolved = resolveEquipmentTenantContext(profile?.organizationId, profile?.role);
  if (resolved.status !== 'ok') {
    return resolved;
  }

  const ctx = resolved.data;
  const allowed = requireCapability(ctx, 'billing:read');
  if (allowed.status !== 'ok') {
    return allowed;
  }

  try {
    await ensureDatabaseReady();
    const rows = (await getDb()
      .select({
        id: equipmentServiceOrdersTable.id,
        oemTenantId: equipmentServiceOrdersTable.oemTenantId,
        orderValuePlnGrosze: equipmentServiceOrdersTable.orderValuePlnGrosze,
        commissionedAt: equipmentServiceOrdersTable.commissionedAt,
      })
      .from(equipmentServiceOrdersTable)
      .where(eq(equipmentServiceOrdersTable.oemTenantId, ctx.tenantId))) as BillableOrderRow[];

    const orders: BillableOrder[] = rows.map((row) => ({
      id: row.id,
      oemTenantId: row.oemTenantId,
      orderValuePlnGrosze:
        row.orderValuePlnGrosze === null || row.orderValuePlnGrosze === undefined
          ? null
          : plnFromGrosze(row.orderValuePlnGrosze, `zlecenie ${row.id}`),
      commissionedAt: toIsoOrNull(row.commissionedAt),
    }));

    const breakdown = computePeriodBilling({
      ctx,
      subscriptionPln: subscription,
      orders,
      commissionBasisPoints: basisPoints,
      periodStart,
      periodEnd,
    });

    return okResult(toBillingView(breakdown, ctx));
  } catch (error) {
    return mapDomainError(error);
  }
};

/** Motyw tenanta sprowadzony do postaci serializowalnej. */
export type TenantThemeView = {
  readonly tenantId: string;
  readonly brandName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly logoAssetRef: string | null;
  readonly customDomain: string | null;
  readonly cssVars: Readonly<Record<string, string>>;
  readonly origins: Readonly<Record<string, string>>;
};

export type SetTenantBrandingInput = {
  readonly brandName?: unknown;
  readonly primaryColor?: unknown;
  readonly secondaryColor?: unknown;
  readonly logoAssetRef?: unknown;
  readonly customDomain?: unknown;
  /** [DECISION] Przyjmowane, ignorowane. Zakres idzie z sesji. */
  readonly tenantId?: unknown;
  readonly oemTenantId?: unknown;
};

export type SetTenantBrandingResult =
  | {
      readonly status: 'ok';
      readonly data: {
        readonly tenantId: string;
        readonly branding: BrandingInput;
        readonly theme: TenantThemeView;
      };
    }
  | { readonly status: 'unavailable'; readonly reason: 'database_not_configured' }
  | {
      readonly status: 'error';
      readonly code: string;
      readonly message: string;
      readonly issues?: readonly BrandingFieldIssue[];
    };

/**
 * Zapis brandingu tenanta.
 *
 * Wejście jest budowane WYŁĄCZNIE z pól jawnie wymienionych poniżej —
 * `tenantId` i `oemTenantId` z wejścia są tu świadomie pomijane, więc
 * schemat domenowy `.strict()` ich nie widzi, a zapis idzie do wiersza
 * rozwiązanego z sesji. Kolor musi mieć postać #rrggbb, a domena być
 * hostname'em bez schematu — obie reguły egzekwuje `brandingConfigSchema`
 * w `module6/white-label.ts`, nie ta warstwa.
 */
export const setTenantBrandingAction = async (
  input: SetTenantBrandingInput
): Promise<SetTenantBrandingResult> => {
  const candidate: Record<string, unknown> = {};
  if (input?.brandName !== undefined) candidate.brandName = input.brandName;
  if (input?.primaryColor !== undefined) candidate.primaryColor = input.primaryColor;
  if (input?.secondaryColor !== undefined) candidate.secondaryColor = input.secondaryColor;
  if (input?.logoAssetRef !== undefined) candidate.logoAssetRef = input.logoAssetRef;
  if (input?.customDomain !== undefined) candidate.customDomain = input.customDomain;

  const parsed = parseBrandingInput(candidate);
  if (!parsed.success) {
    return {
      status: 'error',
      code: 'branding_invalid',
      message: 'Dane brandingu są niepoprawne. Kolor musi mieć postać #rrggbb, a domena — sam hostname.',
      issues: readBrandingIssues(parsed.error),
    };
  }

  const session = (await auth()) as EquipmentSessionLike;
  if (!hasAuthenticatedSession(session)) {
    return authRequired();
  }

  if (!isDatabaseConfigured()) {
    return unavailableResult();
  }

  const profile = await getNexusServiceSessionProfile(session as never);
  const resolved = resolveEquipmentTenantContext(profile?.organizationId, profile?.role);
  if (resolved.status !== 'ok') {
    return resolved;
  }

  const ctx = resolved.data;
  // Wymagane uprawnienie pochodzi z modułu domenowego, nie z lokalnej listy.
  const allowed = requireCapability(ctx, BRANDING_WRITE_CAPABILITY);
  if (allowed.status !== 'ok') {
    return allowed;
  }

  try {
    await ensureDatabaseReady();
    const rows = (await getDb()
      .select({ id: equipmentOemTenantsTable.id, branding: equipmentOemTenantsTable.branding })
      .from(equipmentOemTenantsTable)
      .where(eq(equipmentOemTenantsTable.id, ctx.tenantId))) as TenantRow[];

    const found = rows[0];
    if (found === undefined) {
      return errorResult('tenant_isolation');
    }
    assertSameTenant(ctx.tenantId, found.id, 'wiersz tenenta');

    await getDb()
      .update(equipmentOemTenantsTable)
      .set({ branding: parsed.data, updatedAt: new Date() })
      .where(
        and(
          eq(equipmentOemTenantsTable.id, ctx.tenantId),
          eq(equipmentOemTenantsTable.status, 'active')
        )
      );

    // Motyw wymaga wartości zapasowej. Gdy zapisany branding jest niepełny,
    // `defineThemeFallback` rzuca `ThemeIncompleteError` — i to jest właściwa
    // odpowiedź, bo panel musi pokazać komplet, a zmyślona paleta platformy
    // w cudzym panelu jest kradzieżą marki.
    const fallback = defineThemeFallback(
      {
        brandName: parsed.data.brandName ?? '',
        primaryColor: parsed.data.primaryColor ?? '',
        secondaryColor: parsed.data.secondaryColor ?? '',
        logoAssetRef: parsed.data.logoAssetRef ?? null,
        customDomain: parsed.data.customDomain ?? null,
      },
      ctx
    );
    const theme = resolveTheme(parsed.data, fallback, ctx);

    return okResult({
      tenantId: ctx.tenantId,
      branding: parsed.data,
      theme: {
        tenantId: theme.tenantId,
        brandName: theme.brandName,
        primaryColor: theme.primaryColor,
        secondaryColor: theme.secondaryColor,
        logoAssetRef: theme.logoAssetRef,
        customDomain: theme.customDomain,
        cssVars: theme.cssVars,
        origins: theme.origins,
      },
    });
  } catch (error) {
    return mapDomainError(error);
  }
};

/**
 * [DECISION: 2026-10-15] Plik ma dyrektywę `use server`, a taka dyrektywa
 * pozwala eksportować wyłącznie funkcje asynchroniczne. Dlatego `brandingConfigSchema`
 * NIE jest tu reeksportowany — panel importuje go wprost z
 * `lib/equipment/module6/white-label.ts`. Reeksport byłby wygodny i złamałby
 * kontrakt dyrektywy, więc wybór jest jednoznaczny.
 */
export type { BrandingConfig };
