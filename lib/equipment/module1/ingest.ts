/**
 * [DECISION: 2026-10-15] Wejście telemetrii Modułu 1.
 *
 * Kolejność operacji w `ingestTelemetryPacket` nie jest uporządkowana dla
 * czytelności — jest ustalona przez trzy niezależne zagrożenia:
 *
 *  1. BRAAMKA PII PRZED WALIDACJĄ SCHEMATU. Pole zabronione na trzecim
 *     poziomie zagniżdżenia musi zostać odrzucone jako dane osobowe, a nie
 *     jako nieznany klucz. Odwrócona kolejność zamienia odmowę w komunikat
 *     o literówce i nie zostawia śladu, po czym szedł pakiet.
 *  2. ROZWIĄZANIE URZĄDZENIA PRZED PRZEJŚCIEM KLUCZA. Urządzenie nieznane to
 *     błąd danych, nie retransmisja. Klucz idempotencji należy do maszyny —
 *     bramka go dla maszyny, której nie ma, tworzyłaby śmieci w tabeli kluczy.
 *  3. PRZEJŚCIE KLUCZA PRZED DODANIEM CZASU PRACY. Retransmisja nie może dodać
 *     czasu pracy drugi raz, więc licznik rusza dopiero po wygranej
 *     bramce idempotencji. Odwrócona kolejność daje podwójny licznik przy
 *     każdej utraconej paczce.
 *
 * Zdarzenia bez czasu pracy (`session_started`, `sensor_reading`, `fault`)
 * są zapisywane i nie ruszają licznika — patrz `RUNTIME_CARRYING_EVENT_TYPES`.
 */

import { z } from 'zod';

import {
  DEVICE_MODALITIES,
  TELEMETRY_EVENT_TYPES,
  type EquipmentStatus,
  type TelemetryEventType,
  type TelemetryPacket,
} from '@/lib/equipment/domain/contract';
import { payloadHash } from '@/lib/equipment/shared/ids';
import { assertNoPiiDeep } from '@/lib/equipment/shared/zero-pii';
import {
  SECONDS_PER_HOUR,
  counterPercentOfThreshold,
  evaluateThresholdSeconds,
  hoursFromSeconds,
} from '@/lib/equipment/module1/runtime-counter';
import {
  FLOW_DEGRADATION_SENSOR_KEY,
  degradationSeverity,
  isActionableDegradation,
  resolveFleetThresholdDecision,
  type DegradationSeverity,
} from '@/lib/equipment/module1/service-threshold';
import type { IngestDeps } from '@/lib/equipment/module1/ports';

/** Zdarzenia, dla których czas pracy jest obowiązkowy. */
export const RUNTIME_CARRYING_EVENT_TYPES: ReadonlySet<TelemetryEventType> = new Set<TelemetryEventType>([
  'runtime_tick',
  'session_completed',
]);

/** Przyczyna otwarcia cyklu — zapisywana w `equipment_service_intervals.trigger_reason`. */
export const SERVICE_TRIGGER_REASON = 'runtime_threshold_reached';

const MAX_RUNTIME_DELTA_SECONDS = 86_400;

const SERIAL_NUMBER_PATTERN = /^[A-Za-z0-9-]+$/;
const SITE_REF_PATTERN = /^[A-Z0-9-]+$/;
const IDEMPOTENCY_KEY_PATTERN = /^[a-f0-9]+$/;
const MODEL_CODE_PATTERN = /^[A-Za-z0-9._-]+$/;
/** ISO 8601 z przesunięciem (Z albo ±hh:mm). Bez przesunięcia nie ma momentu zdarzenia. */
const ISO_WITH_OFFSET_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;

/** Pakiet odrzucony przez schemat. Lista powodów, nie boolean. */
export class TelemetryPacketRejectedError extends Error {
  readonly issues: readonly string[];

  constructor(issues: readonly string[]) {
    super(`Pakiet telemetrii odrzucony (${String(issues.length)}): ${issues.join('; ')}`);
    this.name = 'TelemetryPacketRejectedError';
    this.issues = issues;
  }
}

/**
 * Numeru seryjnego nie ma w paszporcie sprzętu. To TYPOWANY błąd, nie wyjątkiem
 * bazy i nie ciche pominięcie — pominięcie zgubiłoby informację, że maszyna
 * wysyła telemetrię, której nikt nie odbiera.
 */
export class UnknownDeviceError extends Error {
  readonly serialNumber: string;

  constructor(serialNumber: string) {
    super(`Nieznany numer seryjny: ${serialNumber}. Telemetria nie została przyjęta ani odrzucona po cichu.`);
    this.name = 'UnknownDeviceError';
    this.serialNumber = serialNumber;
  }
}

/** Urządzenie wycofane z eksploatacji nie nalicza czasu pracy. */
export class DeviceOutOfServiceError extends Error {
  readonly deviceId: string;
  readonly status: EquipmentStatus;

  constructor(deviceId: string, status: EquipmentStatus) {
    super(`Urządzenie ${deviceId} ma stan ${status} — telemetria nie nalicza czasu pracy.`);
    this.name = 'DeviceOutOfServiceError';
    this.deviceId = deviceId;
    this.status = status;
  }
}

const DeviceRefSchema = z.strictObject({
  serialNumber: z.string().min(4).max(64).regex(SERIAL_NUMBER_PATTERN),
  modelCode: z.string().min(1).max(64).regex(MODEL_CODE_PATTERN),
  modality: z.enum(DEVICE_MODALITIES),
  /** Kod obiektu, NIE adres. Wzorzec to wielkie litery, cyfry i myślnik. */
  siteRef: z.string().min(1).max(64).regex(SITE_REF_PATTERN),
});

/**
 * Schemat pakietu. `strict()` na obu obiektach: nieznany klucz jest BŁĘDEM,
 * nie polem do odrzucenia. Pakiet z dodatkowym polem (dziś nieznanym, jutro
 * potrzebnym) ma zostać zauwaźony przez wdrożenie, a nie prze?? przez bramkę
 * i zniknę.
 */
export const TelemetryPacketSchema = z
  .strictObject({
    schemaVersion: z.literal('eos.telemetry.v1'),
    idempotencyKey: z.string().min(16).max(128).regex(IDEMPOTENCY_KEY_PATTERN),
    device: DeviceRefSchema,
    eventType: z.enum(TELEMETRY_EVENT_TYPES),
    occurredAt: z.string().regex(ISO_WITH_OFFSET_PATTERN),
    sessionToken: z.string().min(8).max(128).optional(),
    runtimeDeltaSeconds: z.number().int().min(0).max(MAX_RUNTIME_DELTA_SECONDS).optional(),
    sensors: z.record(z.string(), z.number()).optional(),
  })
  .superRefine((packet, ctx) => {
    if (packet.runtimeDeltaSeconds !== undefined) return;
    if (!RUNTIME_CARRYING_EVENT_TYPES.has(packet.eventType)) return;

    ctx.addIssue({
      code: 'custom',
      path: ['runtimeDeltaSeconds'],
      message:
        `pole runtimeDeltaSeconds jest wymagane dla zdarzenia ${packet.eventType}; ` +
        'bez czasu pracy zdarzenie nie ma czego dodać do licznika',
    });
  });

/** Pakiet po walidacji. Równy kontraktowi z `domain/contract.ts` — pilnuje tego przypisanie w `parseTelemetryPacket`. */
export type ValidatedPacket = TelemetryPacket;

/** Podzbiór kształtu błędu zod, którego używamy. Bez importu typów wewnętrznych. */
type IssueLike = {
  readonly path: readonly PropertyKey[];
  readonly message?: string | undefined;
};

function describeIssue(issue: IssueLike): string {
  const path = issue.path.length > 0 ? issue.path.map(String).join('.') : '$';
  return `${path}: ${issue.message ?? 'wartość spoza kontraktu'}`;
}

/**
 * Bramka wejścia. Bramka PII pierwsza, potem schemat.
 *
 * `ZeroPiiViolationError` leci dalej w oryginale — jest już typem warstwy
 * zero-PII i ma w sobie ścieżkę naruszenia, więc opakowywanie go w drugi
 * błąd tylko gubiłoby informację.
 */
export function parseTelemetryPacket(packet: unknown): ValidatedPacket {
  assertNoPiiDeep(packet);

  const result = TelemetryPacketSchema.safeParse(packet);
  if (!result.success) {
    throw new TelemetryPacketRejectedError(result.error.issues.map(describeIssue));
  }

  // Przypisanie jest bramką kontraktu: jeśli z.infer rozjedzie się z
  // TelemetryPacket, tsc pada tutaj, a nie u konsumenta zlecenia.
  const typed: TelemetryPacket = result.data;
  return typed;
}

export type IngestOutcomeKind = 'recorded' | 'duplicate';

export type IngestOutcome = {
  readonly outcome: IngestOutcomeKind;
  readonly deviceId: string;
  /** `null` przy retransmisji — nie zapisano drugiego zdarzenia. */
  readonly eventId: string | null;
  readonly runtimeDeltaSeconds: number;
  /**
   * Faktyczne przesunięcie licznika w SEKUNDACH, czyli
   * `counterSecondsAfter - counterSecondsBefore`.
   *
   * Przy doliczaniu w sekundach jest równe `runtimeDeltaSeconds`, bo nic nie
   * jest zaokrąglane. Osobne pole po to, żeby wynik nie opisywał intencji
   * portu, tylko stan faktycznie zapisany.
   */
  readonly runtimeSecondsAdded: number;
  /** Stan licznika PRZED przyrostem, w sekundach. */
  readonly counterSecondsBefore: number;
  /** Stan licznika PO przyroście, w sekundach. LICZNIK AUTORYTATYWNY. */
  readonly counterSecondsAfter: number;
  /**
   * Godziny po przyroście. WARTOŚĆ POCHODNA (`hoursFromSeconds`), różniąca się
   * od dokładnego momentu o maksymalnie 30 minut. Do raportu i procentu.
   * Oceny progu NIE wolno na niej oprzeć.
   */
  readonly counterHoursAfter: number;
  readonly counterPercent: number;
  readonly thresholdHours: number;
  readonly warnHours: number;
  readonly warnThresholdReached: boolean;
  /** `true` tylko wtedy, gdy W TYM wywołaniu powstało zlecenie. */
  readonly serviceDue: boolean;
  readonly orderId: string | null;
  readonly intervalId: string | null;
  readonly duplicateCount: number;
  readonly degradationPercent: number | null;
  readonly degradationSeverity: DegradationSeverity;
  readonly degradationAlertId: string | null;
};

/**
 * Przyjmuje pakiet, liczy godziny, w razie potrzeby otwiera cykl serwisowy.
 *
 * Odrzucenia są TYPOWANE (`UnknownDeviceError`, `DeviceOutOfServiceError`,
 * `TelemetryPacketRejectedError`, `ZeroPiiViolationError`). Wyjątek bazy
 * nie może wyjść z tej funkcji — caller potrzebuje wiedzieć CO odrzuciło,
 * żeby odpowiedzieć urządzeniu konkretnym kodem, a nie 500.
 */
export async function ingestTelemetryPacket(packet: unknown, deps: IngestDeps): Promise<IngestOutcome> {
  const parsed = parseTelemetryPacket(packet);

  const device = await deps.runtime.findDeviceBySerial(parsed.device.serialNumber);
  if (device === null) {
    throw new UnknownDeviceError(parsed.device.serialNumber);
  }
  if (device.status === 'decommissioned') {
    throw new DeviceOutOfServiceError(device.id, device.status);
  }

  const threshold = resolveFleetThresholdDecision(deps.thresholdConfig ?? {}, device.oemTenantId);
  const packetHash = payloadHash(JSON.stringify(parsed));

  // ?????? Bramka retransmisji ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  const verdict = await deps.telemetry.claim(device.id, parsed.idempotencyKey, packetHash);
  if (verdict === 'duplicate') {
    const duplicateCount = await deps.telemetry.incrementDuplicateCount(device.id, parsed.idempotencyKey);
    // Retransmisja NIE rusza licznika. Stan czytamy z sekund, bo sekundy są
    // autorytatywne; godziny liczymy tylko na potrzeby procentu i raportu.
    const unchangedSeconds = device.runtimeSecondsSinceService;
    const unchangedHours = hoursFromSeconds(unchangedSeconds);

    return {
      outcome: 'duplicate',
      deviceId: device.id,
      eventId: null,
      runtimeDeltaSeconds: 0,
      runtimeSecondsAdded: 0,
      counterSecondsBefore: unchangedSeconds,
      counterSecondsAfter: unchangedSeconds,
      counterHoursAfter: unchangedHours,
      counterPercent: counterPercentOfThreshold(unchangedHours, threshold.thresholdHours),
      thresholdHours: threshold.thresholdHours,
      warnHours: threshold.warnHours,
      warnThresholdReached: unchangedSeconds >= threshold.warnHours * SECONDS_PER_HOUR,
      serviceDue: false,
      orderId: null,
      intervalId: null,
      duplicateCount,
      degradationPercent: device.flowDegradationPercent,
      degradationSeverity: degradationSeverity(device.flowDegradationPercent),
      degradationAlertId: null,
    };
  }

  // ?????? Zapis zdarzenia ????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  const eventId = await deps.telemetry.recordEvent({
    deviceId: device.id,
    eventType: parsed.eventType,
    occurredAt: parsed.occurredAt,
    runtimeDeltaSeconds: parsed.runtimeDeltaSeconds ?? null,
    sessionToken: parsed.sessionToken ?? null,
    sensors: parsed.sensors ?? null,
    payloadHash: packetHash,
  });

  // ?????? Czas pracy ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  const deltaSeconds = parsed.runtimeDeltaSeconds ?? 0;
  let counterSecondsBefore = device.runtimeSecondsSinceService;
  let counterSecondsAfter = counterSecondsBefore;

  if (deltaSeconds > 0) {
    const update = await deps.runtime.addRuntimeSeconds(device.id, deltaSeconds);
    counterSecondsBefore = update.secondsBefore;
    counterSecondsAfter = update.secondsAfter;
  }
  // Godziny są wyłącznie obrazem licznika. Powstają PO przyroście, w jednym
  // miejscu, wyłącznie na potrzeby raportu i procentu.
  const counterHoursAfter = hoursFromSeconds(counterSecondsAfter);

  // ?????? Degradacja przepływu ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  const degradationPercent = parsed.sensors?.[FLOW_DEGRADATION_SENSOR_KEY] ?? null;
  const severity = degradationSeverity(degradationPercent);
  if (degradationPercent !== null) {
    await deps.runtime.setFlowDegradation(device.id, degradationPercent);
  }

  // ?????? Cykl serwisowy ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  const state = evaluateThresholdSeconds(counterSecondsAfter, threshold.thresholdHours);
  let orderId: string | null = null;
  let intervalId: string | null = null;

  if (state.due) {
    const alreadyOpen = await deps.runtime.hasOpenInterval(device.id);
    if (!alreadyOpen) {
      const opened = await deps.cycle.openCycleWithOrder({
        deviceId: device.id,
        oemTenantId: device.oemTenantId,
        thresholdHours: threshold.thresholdHours,
        warnHours: threshold.warnHours,
        triggerReason: SERVICE_TRIGGER_REASON,
        runtimeHoursAtOrder: counterHoursAfter,
        occurredAt: parsed.occurredAt,
        eventId,
        idempotencyKey: parsed.idempotencyKey,
        degradationPercent,
        degradationSeverity: severity,
      });
      orderId = opened.orderId;
      intervalId = opened.intervalId;
    }
  }

  // ?????? Alert o degradacji ???????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  let degradationAlertId: string | null = null;
  if (degradationPercent !== null && isActionableDegradation(severity)) {
    degradationAlertId = await deps.cycle.enqueueDegradationAlert({
      deviceId: device.id,
      oemTenantId: device.oemTenantId,
      percent: degradationPercent,
      severity,
      observedAt: parsed.occurredAt,
      thresholdHours: threshold.thresholdHours,
    });
  }

  return {
    outcome: 'recorded',
    deviceId: device.id,
    eventId,
    runtimeDeltaSeconds: deltaSeconds,
    runtimeSecondsAdded: counterSecondsAfter - counterSecondsBefore,
    counterSecondsBefore,
    counterSecondsAfter,
    counterHoursAfter,
    counterPercent: counterPercentOfThreshold(counterHoursAfter, threshold.thresholdHours),
    thresholdHours: threshold.thresholdHours,
    warnHours: threshold.warnHours,
    warnThresholdReached: state.warn,
    serviceDue: orderId !== null,
    orderId,
    intervalId,
    duplicateCount: 0,
    degradationPercent,
    degradationSeverity: severity,
    degradationAlertId,
  };
}

