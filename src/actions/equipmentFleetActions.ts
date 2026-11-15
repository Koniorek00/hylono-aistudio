'use server';

/**
 * Akcje floty urządzeń i zleceń serwisowych (Moduł 1 → warstwa Next.js).
 *
 * [DECISION: 2026-10-15] Wszystkie cztery akcje dziedziczą jedną kolejność
 * bramek opisaną w `equipmentActionsCore.ts`. Żadna z nich nie wykonuje
 * obliczeń domenowych: godziny, progi i degradacja liczone są przez
 * `module1/runtime-counter.ts` i `module1/service-threshold.ts`, a wiersze
 * zawężane są przez `module6/tenant.ts`.
 *
 * [DECISION: 2026-10-15] Gdy `DATABASE_URL` nie jest skonfigurowane, akcje
 * zwracają `unavailable` i NICZEGO nie wymyślają. Panel, który pokazuje
 * zmyślone urządzenia, jest gorszy od panelu, który mówi, że nie ma danych.
 */

import { and, desc, eq } from 'drizzle-orm';
import { isDatabaseConfigured, getDb, ensureDatabaseReady } from '@/lib/db/client';
import {
  equipmentDevicesTable,
  equipmentServiceOrdersTable,
} from '@/lib/db/schema';
import { auth } from '@/lib/auth';
import { getNexusServiceSessionProfile } from '@/src/actions/nexusServiceProfile';
import {
  counterPercentOfThreshold,
  hoursFromSeconds,
  evaluateThresholdSeconds,
} from '@/lib/equipment/module1/runtime-counter';
import {
  degradationSeverity,
  resolveFleetThresholdDecision,
  type DegradationSeverity,
  type ThresholdSource,
} from '@/lib/equipment/module1/service-threshold';
import { assertSameTenant, scopeToTenant, type TenantContext } from '@/lib/equipment/module6/tenant';
import type { DeviceModality } from '@/lib/equipment/domain/contract';
import {
  authRequired,
  errorResult,
  hasAuthenticatedSession,
  mapDomainError,
  okResult,
  requireCapability,
  resolveEquipmentTenantContext,
  unavailableResult,
  type EquipmentActionResult,
  type EquipmentSessionLike,
} from '@/src/actions/equipmentActionsCore';

/** Wiersz urządzenia w bazie — ten sam kształt co `Device` w kontrakcie domenowym. */
type DeviceRow = {
  id: string;
  oemTenantId: string;
  serialNumber: string;
  modelCode: string;
  modality: string;
  deviceClass: string;
  siteRef: string;
  filterCount: number;
  runtimeSecondsSinceService: number;
  runtimeHoursSinceService: number;
  flowDegradationPercent: number | null;
  status: string;
  lastTelemetryAt: Date | null;
};

/** Wiersz zlecenia serwisowego — pola potrzebne do potwierdzenia przez tenanta. */
type ServiceOrderRow = {
  id: string;
  oemTenantId: string;
  deviceId: string;
  status: string;
  runtimeHoursAtOrder: number;
  thresholdHours: number;
  createdAt: Date | null;
};

/** Stan progu dla jednego urządzenia. Liczone przez moduł 1, nie tutaj. */
export type EquipmentThresholdStatus = {
  readonly thresholdHours: number;
  readonly warnHours: number;
  readonly source: ThresholdSource;
  readonly percentOfThreshold: number;
  readonly warn: boolean;
  readonly due: boolean;
};

/** Urządzenie widoczne dla tenanta. Wszystkie pola prymitywne — przez RSC. */
export type EquipmentFleetRow = {
  readonly id: string;
  readonly serialNumber: string;
  readonly modelCode: string;
  readonly modality: DeviceModality;
  readonly deviceClass: string;
  readonly siteRef: string;
  readonly filterCount: number;
  readonly runtimeHoursSinceService: number;
  readonly flowDegradationPercent: number | null;
  readonly degradationSeverity: DegradationSeverity;
  readonly status: string;
  readonly lastTelemetryAt: string | null;
  readonly threshold: EquipmentThresholdStatus;
};

/** Odpowiedź listy floty. */
export type EquipmentFleetView = {
  readonly tenantId: string;
  readonly thresholdHours: number;
  readonly warnHours: number;
  readonly source: ThresholdSource;
  readonly devices: readonly EquipmentFleetRow[];
  readonly totalCount: number;
  readonly warnCount: number;
  readonly dueCount: number;
};

const toIsoOrNull = (value: Date | string | null): string | null => {
  if (value === null || value === undefined) return null;
  const instant = value instanceof Date ? value : new Date(value);
  return Number.isNaN(instant.getTime()) ? null : instant.toISOString();
};

/**
 * Mapuje wiersz bazy na widok floty. Liczenie progu, procenta i poziomu
 * degradacji jest zadaniem Modułu 1 — ta funkcja je tylko wywołuje i składa
 * wynik. Nie ma tu ani jednej operacji na liczbach własnej.
 *
 * [DECISION: 2026-10-15] Stan progu liczony jest z SEKUND, nie z godzin:
 * `evaluateThresholdSeconds` przyjmuje licznik autorytatywny. Godziny są
 * liczone osobno, bo to jedynie liczba do wyświetlenia — mierzenie progu na
 * zaokrąglonej wartości to dokładnie ten dryf, który Moduł 1 usuwa.
 */
const toFleetRow = (row: DeviceRow, ctx: TenantContext): EquipmentFleetRow => {
  const decision = resolveFleetThresholdDecision({}, ctx.tenantId);
  const seconds = row.runtimeSecondsSinceService;
  const hours = hoursFromSeconds(seconds);
  const threshold = evaluateThresholdSeconds(seconds, decision.thresholdHours);
  const percent = counterPercentOfThreshold(hours, decision.thresholdHours);

  return {
    id: row.id,
    serialNumber: row.serialNumber,
    modelCode: row.modelCode,
    modality: row.modality as DeviceModality,
    deviceClass: row.deviceClass,
    siteRef: row.siteRef,
    filterCount: row.filterCount,
    runtimeHoursSinceService: hours,
    flowDegradationPercent: row.flowDegradationPercent,
    degradationSeverity: degradationSeverity(row.flowDegradationPercent),
    status: row.status,
    lastTelemetryAt: toIsoOrNull(row.lastTelemetryAt),
    threshold: {
      thresholdHours: decision.thresholdHours,
      warnHours: decision.warnHours,
      source: decision.source,
      percentOfThreshold: percent,
      warn: threshold.warn,
      due: threshold.due,
    },
  };
};

/**
 * Lista floty widocznej dla tenanta sesji.
 *
 * [DECISION: 2026-10-15] Zakres pochodzi wyłącznie z sesji. Funkcja nie
 * przyjmuje identyfikatora tenanta — nawet opcjonalnie. `scopeToTenant`
 * jest stosowane do wierszy ODCZYTANYCH z bazy, bo poprawny `WHERE` w SQL jest
 * optymalizacją, a izolacją jest filtr — cudzy wiersz musi zostać ODRZUCONY,
 * a nie zwrócony i przefiltrowany po stronie klienta.
 */
export const listEquipmentFleetAction = async (): Promise<EquipmentActionResult<EquipmentFleetView>> => {
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
  const allowed = requireCapability(ctx, 'panel:read');
  if (allowed.status !== 'ok') {
    return allowed;
  }

  try {
    await ensureDatabaseReady();
    const rows = (await getDb()
      .select()
      .from(equipmentDevicesTable)
      .where(eq(equipmentDevicesTable.oemTenantId, ctx.tenantId))
      .orderBy(desc(equipmentDevicesTable.lastTelemetryAt))) as DeviceRow[];

    const owned = scopeToTenant(rows, ctx, 'listEquipmentFleetAction');
    const devices = owned.map((row) => toFleetRow(row, ctx));
    const decision = resolveFleetThresholdDecision({}, ctx.tenantId);

    return okResult({
      tenantId: ctx.tenantId,
      thresholdHours: decision.thresholdHours,
      warnHours: decision.warnHours,
      source: decision.source,
      devices,
      totalCount: devices.length,
      warnCount: devices.filter((device) => device.threshold.warn).length,
      dueCount: devices.filter((device) => device.threshold.due).length,
    });
  } catch (error) {
    return mapDomainError(error);
  }
};

/** Wynik potwierdzenia zlecenia przez tenanta. */
export type ServiceOrderAcknowledgement = {
  readonly orderId: string;
  readonly deviceId: string;
  readonly status: string;
  readonly acknowledgedAt: string;
};

export type AcknowledgeServiceOrderInput = {
  readonly orderId?: unknown;
  /** [DECISION] Przyjmowane, ale NIE UŻYWANE do zapytania. Zakres idzie z sesji. */
  readonly tenantId?: unknown;
  readonly oemTenantId?: unknown;
};

/**
 * [DECISION: 2026-10-15] Pola `tenantId` i `oemTenantId` są w typie wejścia
 * OBECNE DLA CZYTELNIKA FORMU, ale nie są nigdzie używane. Zod je wytnie przed
 * dosięgnięcie logiki, a gdyby przeszły, warunek zapytania i tak budowany jest
 * z `ctx.tenantId`. Zostawienie ich w sygnaturze jest celowe: formularz ma je
 * wysyłać, a akcja ma je ignorować — to jest kontrakt, nie przypadek.
 */
const readOrderId = (value: unknown): string | null => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

/**
 * Potwierdzenie zlecenia serwisowego przez tenanta.
 *
 * Cudze zlecenie to BŁĄD (`TenantIsolationError`), nie pominięcie: potwierdzenie
 * cudzego zlecenia to zapis do cudzego wiersza, a `assertSameTenant` jest
 * bramką, która to blokuje. Dlatego ścieżka zapisu nie używa `scopeToTenant`.
 */
export const acknowledgeServiceOrderAction = async (
  input: AcknowledgeServiceOrderInput
): Promise<EquipmentActionResult<ServiceOrderAcknowledgement>> => {
  const session = (await auth()) as EquipmentSessionLike;
  if (!hasAuthenticatedSession(session)) {
    return authRequired();
  }

  const orderId = readOrderId(input?.orderId);
  if (orderId === null) {
    return errorResult('invalid_input');
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
  const allowed = requireCapability(ctx, 'orders:write');
  if (allowed.status !== 'ok') {
    return allowed;
  }

  try {
    await ensureDatabaseReady();
    const rows = (await getDb()
      .select()
      .from(equipmentServiceOrdersTable)
      .where(
        and(
          eq(equipmentServiceOrdersTable.id, orderId),
          eq(equipmentServiceOrdersTable.oemTenantId, ctx.tenantId)
        )
      )) as ServiceOrderRow[];

    const found = rows[0];
    if (found === undefined) {
      // Zlecenia nie ma albo należy do innego tenanta. Te dwie sytuacje mają
      // tę samą odpowiedź: odsłanianie różnicy byłoby pomiarem obecności
      // cudzych identyfikatorów.
      return errorResult('tenant_isolation');
    }

    // Bramka domenowa na ścieżce zapisu. SQL już zawęził, ale izolacją jest
    // typ i filtr — nie optymalizacja zapytania.
    assertSameTenant(ctx.tenantId, found.oemTenantId, `zlecenie ${found.id}`);

    const acknowledgedAt = new Date().toISOString();
    await getDb()
      .update(equipmentServiceOrdersTable)
      .set({ status: 'acknowledged', updatedAt: new Date() })
      .where(
        and(
          eq(equipmentServiceOrdersTable.id, found.id),
          eq(equipmentServiceOrdersTable.oemTenantId, ctx.tenantId)
        )
      );

    return okResult({
      orderId: found.id,
      deviceId: found.deviceId,
      status: 'acknowledged',
      acknowledgedAt,
    });
  } catch (error) {
    return mapDomainError(error);
  }
};
