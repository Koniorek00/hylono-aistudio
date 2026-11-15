import {
  DATABASE_UNAVAILABLE_MESSAGE,
  type EquipmentActionErrorCode,
  type EquipmentActionResult,
} from '@/src/actions/equipmentActionsCore';
import type { EquipmentFleetView } from '@/src/actions/equipmentFleetActions';

/**
 * Odczyt odpowiedzi akcji floty jako stanu, który da się narysować.
 *
 * [DECISION: 2026-10-15] Ten plik jest granicą między tym, co akcja zwróciła,
 * a tym, co panel pokaże. Każdy wynik akcji ma dokładnie jeden stan renderu,
 * a stan `ready` istnieje tylko wtedy, gdy baza zwróciła wiersze. Nie ma
 * stanu „nie wiem, pokażę pustkę" — pustka musi być wyraźnym `empty` albo
 * `error`, inaczej wraca defekt z twardą pustą listą obok działającego zapytania.
 */
export type EquipmentPanelFleetState =
  /** Panel sam wie, że `DATABASE_URL` nie ma — nie ma czego pytać. */
  | { readonly kind: 'database_not_configured' }
  /** Akcja odpowiedziała `unavailable`: baza nieosiągalna mimo skonfigurowania. */
  | { readonly kind: 'unavailable'; readonly message: string }
  /** Akcja zwróciła błąd: komunikat z katalogu plus kod do diagnozy. */
  | {
      readonly kind: 'error';
      readonly code: EquipmentActionErrorCode;
      readonly message: string;
    }
  /** Baza odpowiedziała, a flota tenanta jest pusta. To prawda, nie brak danych. */
  | { readonly kind: 'empty'; readonly thresholdHours: number }
  /** Baza zwróciła wiersze. */
  | {
      readonly kind: 'ready';
      readonly devices: EquipmentFleetView['devices'];
      readonly thresholdHours: number;
      readonly warnHours: number;
      readonly warnCount: number;
      readonly dueCount: number;
    };

/**
 * Kolejność rozpoznawania wyniku.
 *
 * [DECISION: 2026-10-15] `databaseReady` jest sprawdzane PRZED wynikiem akcji,
 * bo panel zna `isDatabaseConfigured()` i ta wiedza jest pewniejsza niż
 * odpowiedź akcji w środowisku bez sesji. Bramki akcji są ustawione w kolejności
 * sesja → baza → tenant, więc bez sesji akcja zwraca `auth_required` nawet przy
 * braku bazy. Renderowanie komunikatu „wymaga zalogowania” dla środowiska, w
 * którym brakuje `DATABASE_URL`, byłoby prawdą techniczną, ale mylącą
 * wskazówką. Panel pokazuje wtedy to, czego naprawdę brakuje.
 *
 * Stan `unavailable` pozostaje obsłużony osobno: jest osiągalny, gdy sesja
 * istnieje, a baza nieosiąga. Jeśli kolejność bramek w akcji się kiedyś
 * zmieni, panel nie zgubi tej odpowiedzi.
 */
export function readEquipmentPanelFleet(
  result: EquipmentActionResult<EquipmentFleetView>,
  databaseReady: boolean
): EquipmentPanelFleetState {
  if (!databaseReady) {
    return { kind: 'database_not_configured' };
  }

  if (result.status === 'unavailable') {
    return { kind: 'unavailable', message: DATABASE_UNAVAILABLE_MESSAGE };
  }

  if (result.status === 'error') {
    return { kind: 'error', code: result.code, message: result.message };
  }

  const view = result.data;
  if (view.devices.length === 0) {
    return { kind: 'empty', thresholdHours: view.thresholdHours };
  }

  return {
    kind: 'ready',
    devices: view.devices,
    thresholdHours: view.thresholdHours,
    warnHours: view.warnHours,
    warnCount: view.warnCount,
    dueCount: view.dueCount,
  };
}