/**
 * [DECISION: 2026-10-15] Granica izolacji warstwy 1 ↔ warstwy health.
 *
 * Mandat: „Granica izolacji stanowi anonimowy token sesji" oraz warstwa health
 * jest „osobną, odizolowaną warstwą danych w regionie UE, nie w głównej bazie".
 *
 * Ta funkcja jest twardym dowodem, a nie deklaracją: sprawdza SCHEMAT tabel
 * warstwy 1 pod kątem nazw, które mogłyby sięgnąć do warstwy health. Jeśli
 * ktoś dopisze do `equipment_devices` kolumnę `health_notes` albo
 * `screening_id`, ta funkcja rzuci przy starcie — zanim zlecenie powstanie.
 *
 * Druga funkcja, `assertNoOverlayConfigInLayer1`, sprawdza zmienne środowiskowe.
 * Warstwa 1 nie ma ZADNEJ ścieżki do warstwy health, więc nie może mieć
 * ani jej adresu, ani klucza. Posiadanie adresu bez ścieżki jest tym samym
 * co posiadanie klucza do sejfu, którego się nie używa.
 */

import {
  OverlayBoundaryError,
  overlayRequiredEncryptionAtRest,
  overlayRequiredEncryptionInTransit,
  overlayRequiredRegion,
  type OverlayClinicConfig,
} from './overlay-schema.js';

/** Prefiks schematu warstwy health — warstwa 1 nie może mieć takiej tabeli. */
const OVERLAY_SCHEMA_PREFIX = 'health_overlay';

/**
 * Tokeny, z których kolumna prowadząca do warstwy health się zaczyna.
 *
 * Dopasowanie jest po TOKENACH, nie równości. Pierwsza wersja szukała
 * dokładnego dopasowania i przepuściła `health_notes`, `screening_id`,
 * `consent_ref`, `subject_ref`, `hrv_rms_sd`, `sleep_minutes` i
 * `biometric_raw` — czyli dokładnie te kolumny, które granica ma wychwycić.
 * Granica, która przepuszcza własne przypadki testowe, nie jest granicą.
 *
 * Token zamiast podciągu: `subject_ref` trafia w `subject`, ale
 * `unsubjected` nie, a `consent` w `consent`, ale nie w "consensus".
 */
const OVERLAY_REACHING_TOKENS = [
  'health',
  'medical',
  'screening',
  'consent',
  'subject',
  'hrv',
  'sleep',
  'biometric',
  'wearable',
  'diagnos',
] as const;

/** Rozkład nazwy kolumny na tokeny. */
function tokenize(name: string): string[] {
  return name
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}

function columnReachesOverlay(column: string): boolean {
  return tokenize(column).some((token) =>
    OVERLAY_REACHING_TOKENS.some((reach) => token.startsWith(reach)),
  );
}

/**
 * Sprawdza deklaracje tabel warstwy 1. Przyjmuje surowe nazwy kolumn, żeby
 * funkcja była testowalna bez bazy i bez ładowania całego schematu.
 */
export function assertNoOverlayReachInLayer1(
  tables: Readonly<Record<string, readonly string[]>>,
): void {
  for (const [table, columns] of Object.entries(tables)) {
    if (
      table.startsWith(OVERLAY_SCHEMA_PREFIX) ||
      table.includes(`.${OVERLAY_SCHEMA_PREFIX}.`)
    ) {
      throw new OverlayBoundaryError(
        'schema_reachable_from_layer1',
        `tabela "${table}" należy do warstwy health, nie do warstwy 1`,
      );
    }

    for (const column of columns) {
      if (columnReachesOverlay(column)) {
        throw new OverlayBoundaryError(
          'schema_reachable_from_layer1',
          `kolumna "${column}" w "${table}" sięga warstwy health`,
        );
      }
    }
  }
}

export type EnvReader = (name: string) => string | undefined;

/** Zmienne środowiskowe, których warstwa 1 nie wolno posiadać. */
export const FORBIDDEN_LAYER1_ENV_NAMES = [
  'HEALTH_OVERLAY_DATABASE_URL',
  'HEALTH_OVERLAY_SERVICE_ROLE_KEY',
  'HEALTH_OVERLAY_API_URL',
  'HEALTH_OVERLAY_TOKEN',
] as const;

/**
 * Sprawdza, czy warstwa 1 nie ma skonfigurowanego połączenia z overlayem.
 * Wołana przy starcie procesu warstwy 1.
 */
export function assertNoOverlayConfigInLayer1(readEnv: EnvReader = (n) => process.env[n]): void {
  const configured = FORBIDDEN_LAYER1_ENV_NAMES.filter((name) => {
    const value = readEnv(name);
    return value !== undefined && value.trim() !== '';
  });

  if (configured.length > 0) {
    throw new OverlayBoundaryError(
      'schema_reachable_from_layer1',
      `warstwa 1 ma skonfigurowane zmienne warstwy health: ${configured.join(', ')}`,
    );
  }
}

/** Konfiguracja warstwy health — walidowana zanim cokolwiek w niej powstanie. */
export function assertOverlayIsRegionallyIsolated(config: OverlayClinicConfig): void {
  if (config.dataRegion.toLowerCase() !== overlayRequiredRegion) {
    throw new OverlayBoundaryError(
      'region_outside_eu',
      `region="${config.dataRegion}", wymagany="${overlayRequiredRegion}"`,
    );
  }

  if (config.encryptionAtRest.toUpperCase() !== overlayRequiredEncryptionAtRest) {
    throw new OverlayBoundaryError(
      'weak_encryption_at_rest',
      `"${config.encryptionAtRest}", wymagane="${overlayRequiredEncryptionAtRest}"`,
    );
  }

  if (config.encryptionInTransit.toUpperCase() !== overlayRequiredEncryptionInTransit) {
    throw new OverlayBoundaryError(
      'weak_encryption_in_transit',
      `"${config.encryptionInTransit}", wymagane="${overlayRequiredEncryptionInTransit}"`,
    );
  }
}
