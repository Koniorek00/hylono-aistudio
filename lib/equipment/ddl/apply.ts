/**
 * [DECISION: 2026-10-16] Wykonawca kanonicznego DDL warstwy `equipment_*`.
 *
 * Wzorzec jest już w repozytorium: `bootstrapCoreTables()` w
 * `lib/db/client.ts` tworzy tabele `CREATE TABLE IF NOT EXISTS` leniwie, przy
 * pierwszym użyciu. Ten moduł jest tym samym wzorcem dla warstwy equipment —
 * wywołuje go `ensureDatabaseReady()`, a ten plik ma pozostać nietknięty.
 *
 * Dwie własności, które odróżniają to od listy jedenastu zapytań:
 *
 * 1. CAŁOŚĆ W JEDNEJ TRANSAKCJI. Albo istnieje wszystkie 11 tabel, albo żadna.
 *    Warstwa w połowie utworzona jest gorsza od warstwy nieutworzonej, bo kod
 *    powyżej zakłada obecność tabel i nie sprawdza jej. Jawny `BEGIN;`/`COMMIT;`
 *    w jednym `execute` jest tu konieczny, nie stylistyczny: driver
 *    `neon-http` rzuca `No transactions support in neon-http driver` na
 *    `db.transaction()` (sprawdzone w `neon-http/session.cjs`), więc jedyną
 *    transakcją, która działa na obu sterownikach z `lib/db/client.ts`, jest
 *    jawny blok wewnątrz pojedynczego zapytania.
 *
 * 2. JEDNO ŹRÓDŁO. Tekst DDL pochodzi wyłącznie z `read-sql.ts`, który czyta
 *    `0001_equipment.sql` z dysku. Nie ma tu żadnej wklejonej kopii.
 *
 * Ten moduł NIE tworzy niczego z rodziny `nexus_*`. Tamte 20 tabel obsługuje
 * `bootstrapCoreTables()` i ten plik nie ma prawa ich dotknąć — ani utworzyć,
 * ani zmigrować, ani sprawdzić.
 */

import { sql, type SQL } from 'drizzle-orm';
import { countSqlStatements, readEquipmentDdlSql } from './read-sql';

/**
 * Jedenastka tabel warstwy equipment, w kolejności deklaracji w pliku DDL.
 * Lista jest zgodna z `0001_equipment.sql`; test pilnuje tej zgodności
 * w obie strony, więc dopisanie tabeli do DDL bez dopisania jej tutaj (i
 * odwrotnie) wywala bramkę.
 */
export const EQUIPMENT_TABLES = [
  'equipment_oem_tenants',
  'equipment_devices',
  'equipment_telemetry_events',
  'equipment_ingest_idempotency',
  'equipment_service_intervals',
  'equipment_service_orders',
  'equipment_outbox',
  'equipment_protocol_bookings',
  'equipment_watch_evidence',
  'equipment_reminder_queue',
  'equipment_tenant_billing',
] as const;

export type EquipmentTableName = (typeof EQUIPMENT_TABLES)[number];

/**
 * Minimalny uchwyt bazy — dokładnie ten kształt, który zwraca `getDb()`.
 *
 * Celowo nie importuje `HylonoDatabase` z `lib/db/client.ts`: tamten typ nie
 * jest eksportowany, a ten moduł nie ma prawa zmieniać tamtego pliku.
 * Metoda zapisana skrótem (`execute(...)`) jest dwuznaczna przy przypisaniu, więc
 * oba sterowniki — `NeonHttpDatabase` i `PostgresJsDatabase` — pasują. Test
 * `apply.test.ts` pilnuje tego na poziomie typów, nie tylko w tekście.
 */
export interface EquipmentSchemaExecutor {
  execute(query: SQL): Promise<unknown>;
}

/** Wynik, nie `void`: wołający musi móc zapisać, czy warstwa powstała. */
export interface ApplyEquipmentSchemaResult {
  /** `true` gdy transakcja została faktycznie wykonana. */
  applied: boolean;
  /** Liczba instrukcji DDL w pliku — zawsze dodatnia. */
  statements: number;
}

export interface ApplyEquipmentSchemaOptions {
  /**
   * Pomija sprawdzenie wyprzedzające i wysyła DDL zawsze. DDL jest
   * idempotentny (`CREATE TABLE IF NOT EXISTS` / `CREATE INDEX IF NOT EXISTS`),
   * więc ponowne wysłanie niczego nie zmienia.
   */
  force?: boolean;
  /**
   * Po transakcji sprawdza `information_schema` i rzuca, jeśli nie powstały
   * wszystkie 11 tabel. Domyślnie `false`, żeby zwykła ścieżka wysyłała
   * dokładnie jedno zapytanie; warto włączyć przy pierwszym wdrożeniu.
   */
  verify?: boolean;
  /** Zagłędka do logowania — bez zależności na konkretny logger. */
  onLog?: (message: string) => void;
}

/** Błąd, gdy sterownik zwrócił wynik, którego nie da się odczytać. */
export class EquipmentLedgerShapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EquipmentLedgerShapeError';
  }
}

/** Wyjątek, gdy sam plik DDL nie został odczytany. */
export class EquipmentDdlUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EquipmentDdlUnavailableError';
  }
}

/**
 * Zbiera wiersze ze sterownika niezależnie od jego kształtu.
 *
 * `postgres-js` zwraca `Result`, który jest tablicą; `neon-http` zwraca
 * `{ rows: [...] }` (`rawQueryConfig = { arrayMode: false, fullResults: true }`
 * w `neon-http/session.cjs`). Nieznany kształt jest BŁĘDEM, nie pustą listą —
 * „nie wiem, czy tabele istnieją" i „tabel nie ma" muszą dać różne odpowiedzi,
 * inaczej `applyEquipmentSchema()` przeszedłby obok schematu, którego nie ma.
 */
const readRows = (result: unknown): readonly Record<string, unknown>[] => {
  if (Array.isArray(result)) {
    return result as readonly Record<string, unknown>[];
  }

  if (typeof result === 'object' && result !== null && 'rows' in result) {
    const rows = (result as { rows: unknown }).rows;
    if (Array.isArray(rows)) {
      return rows as readonly Record<string, unknown>[];
    }
  }

  throw new EquipmentLedgerShapeError(
    'Equipment ledger query returned an unreadable shape; expected an array of rows or { rows: [...] }.',
  );
};

/** Czytelnik kolumny `table_name` niezależny od wielkości liter zwracanej nazwy. */
const readTableName = (row: Record<string, unknown>): string | null => {
  for (const [key, value] of Object.entries(row)) {
    if (key.toLowerCase() === 'table_name' && typeof value === 'string') {
      return value.toLowerCase();
    }
  }
  return null;
};

/**
 * Księga wdrożenia BEZ tabeli własnej: sprawdza `information_schema`, czy
 * istnieje wszystkie 11 tabel, i zwraca `true` tylko gdy jest komplet.
 *
 * `table_schema = current_schema()` jest tu świadome. Odfiltrowanie tylko po
 * `table_name` mogłoby dać fałszywe `true`, gdy ktoś ma tabelę o tej samej
 * nazwie w innym schemacie. Ograniczenie do bieżącego schematu zamienia ryzyko
 * fałszywego `true` na możliwe fałszywe `false`, a fałszywe `false` jest
 * nieszkodliwe — DDL jest idempotentny i ponowna aplikacja nic nie zmienia.
 */
export const isEquipmentSchemaApplied = async (db: EquipmentSchemaExecutor): Promise<boolean> => {
  const names = sql.join(
    EQUIPMENT_TABLES.map((table) => sql`${table}`),
    sql`, `,
  );

  const result = await db.execute(sql`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = current_schema()
      AND table_name IN (${names})
  `);

  const present = new Set(
    readRows(result)
      .map(readTableName)
      .filter((name): name is string => name !== null),
  );

  return EQUIPMENT_TABLES.every((table) => present.has(table));
};

/**
 * Buduje JEDEN blok `BEGIN; … COMMIT;` wokół całego DDL.
 *
 * Wyeksportowane osobno, żeby test mógł sprawdzić kształt transakcji bez
 * wykonywania jej. Tekst jest dokładnie tą samą treścią co plik — `COUNT`
 * poniżej jest liczbą instrukcji, nie sumą znaków.
 */
export const buildEquipmentSchemaTransaction = (ddlSql: string): SQL =>
  sql.raw(`BEGIN;\n${ddlSql}\nCOMMIT;`);

/**
 * Wykonuje całe DDL warstwy equipment w jednej transakcji.
 *
 * Idempotentne z konstrukcji: każda instrukcja w pliku to
 * `CREATE TABLE IF NOT EXISTS` albo `CREATE INDEX IF NOT EXISTS`, więc
 * ponowne wywołanie nie tylko nie psuje, ale nie robi NIC. Dlatego `applied`
 * mówi, czy transakcja była potrzebna, a nie czy zmieniła się baza.
 */
export const applyEquipmentSchema = async (
  db: EquipmentSchemaExecutor,
  options: ApplyEquipmentSchemaOptions = {},
): Promise<ApplyEquipmentSchemaResult> => {
  const { force = false, verify = false, onLog } = options;

  const { sql: ddlSql, source } = await readEquipmentDdlSql().catch((error: unknown) => {
    throw new EquipmentDdlUnavailableError(
      `Equipment DDL is unavailable: ${error instanceof Error ? error.message : String(error)}`,
    );
  });

  if (ddlSql.length === 0) {
    throw new EquipmentDdlUnavailableError(
      'Equipment DDL resolved to an empty string. An unreadable file is not an empty schema.',
    );
  }

  const statements = countSqlStatements(ddlSql);
  onLog?.(`equipment DDL source: ${source}`);

  if (!force) {
    const alreadyApplied = await isEquipmentSchemaApplied(db);
    if (alreadyApplied) {
      onLog?.(`equipment schema already present (${statements} statements not sent)`);
      return { applied: false, statements };
    }
  }

  await db.execute(buildEquipmentSchemaTransaction(ddlSql));
  onLog?.(`equipment schema applied (${statements} statements)`);

  if (verify) {
    const confirmed = await isEquipmentSchemaApplied(db);
    if (!confirmed) {
      throw new Error(
        `applyEquipmentSchema: verification failed, not all ${EQUIPMENT_TABLES.length} equipment tables exist after the transaction.`,
      );
    }
  }

  return { applied: true, statements };
};