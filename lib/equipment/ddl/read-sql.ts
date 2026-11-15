/**
 * [DECISION: 2026-10-16] Jedyne miejsce, z którego aplikacja bierze tekst DDL
 * warstwy `equipment_*`.
 *
 * `lib/equipment/ddl/0001_equipment.sql` został wykonany na Postgresie 17.5
 * i zweryfikowany: 11 tabel, 33 CHECK, 10 FK, 11 PK, 2 UNIQUE, 16/16
 * naruszeń odrzuconych, 7/7 poprawnych wierszy przyjętych. Ale dopóki nic w
 * aplikacji go nie wykonuje, jest dokumentacją, a nie wdrożeniem — pierwsze
 * zapytanie do `equipment_devices` kończy się `relation does not exist`.
 *
 * NIE WLEJAĆ TUTAJ KOPII TREŚCI. Druga kopia to schemat, który potrafi się
 * rozjechać z oryginałem, a cały sens tego pliku to jedno źródło prawdy.
 * Test `tests/equipment/ddl/apply.test.ts` porównuje eksport bajt w bajt z
 * plikiem na dysku i to jest bramka, która taki rozejazd złapie.
 *
 * ── Dlaczego ta kolejność odczytu ──────────────────────────────────────────
 *
 * Odczyt próbuje: `node:fs` → `?raw` → jawny wyjątek.
 *
 * `node:fs` jest ŚIEŻKĄ PRODUKCYJNĄ, nie tylko fallbackiem. Next.js 16 nie ma
 * obsługi `?raw`: w `next/dist/build/webpack-config.js` nie ma reguły dla
 * `raw-loader`, a w regułach Turbopacka nie ma `resourceQuery` obsługującego
 * `raw` (sprawdzone 2026-10-16 na zainstalowanym `next@16.2.0`). Literałowy
 * `import './x.sql?raw'` w module kompilowanym przez Next.js nie jest więc
 * „degradacją", tylko błędem BUDOWANIA. Dlatego literał istnieje, ale jest
 * opatrzony `webpackIgnore` — webpack go nie rozwiązuje, a Vite (czyli vitest)
 * rozwiązuje go normalnie.
 *
 * Zweryfikowano, że gałąź `?raw` pod Vite 7.3.1 zwraca tekst bajt w bajt
 * (`vite.transformRequest('/lib/equipment/ddl/0001_equipment.sql?raw')`
 * porównane z `readFileSync` → identyczne), więc obie gałęzie czytają to samo.
 * `node:fs` wygrywa wszędzie tam, gdzie `fs` w ogóle istnieje: vitest, tsx,
 * `next dev`, `next start`, Docker. Pozostaje Edge, gdzie `fs` nie ma — tam
 * zostaje próba `?raw`, a jeśli bundler jej nie obsługuje,
 * `readEquipmentDdlSql()` rzuca jawny błąd zamiast zwrócić pustą warstwę.
 *
 * [UWAGA: Next.js] Ścieżka `node:fs` szuka pliku względem `import.meta.url`,
 * a potem względem `process.cwd()`. W `next start` cwd jest katalogiem
 * aplikacji, więc `lib/equipment/ddl/0001_equipment.sql` musi trafić do obrazu
 * wdrożeniowego. Nie jest wpisany w `outputFileTracingIncludes` — plik trzeba
 * dołożyć ręcznie.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** Nazwa kanonicznego pliku DDL. Jedyne miejsce, w którym występuje. */
export const EQUIPMENT_DDL_FILENAME = '0001_equipment.sql';

/**
 * Którą gałęzią odczytano tekst. Ujawnione, bo „obsługuje obie ścieżki" bez
 * dowodu jest twierdzeniem, nie faktem.
 */
export type EquipmentDdlSource = 'node-fs' | 'bundler-raw';

export interface LoadedEquipmentDdl {
  readonly sql: string;
  readonly source: EquipmentDdlSource;
}

/** Znacznik odróżniający właściwy plik od czegokolwiek innego w katalogu. */
const DDL_MARKER = 'CREATE TABLE IF NOT EXISTS equipment_devices';

/** Minimalny sensowny rozmiar; plik ma ~16 kB znaków. */
const DDL_MIN_LENGTH = 1000;

const looksLikeEquipmentDdl = (text: string): boolean =>
  text.length >= DDL_MIN_LENGTH && text.includes(DDL_MARKER);

/**
 * Kandydaci na bezwzględną ścieżkę pliku, w kolejności prób.
 *
 * `import.meta.url` jest pierwszy, bo pod vitest wskazuje dokładnie na
 * `lib/equipment/ddl/read-sql.ts`. `process.cwd()` jest drugi, bo pod
 * `next start` `import.meta.url` wskazuje na chunk w `.next/`, a cwd na
 * katalog aplikacji.
 */
const resolveCandidatePaths = (): string[] => {
  const candidates: string[] = [];
  const meta = import.meta as ImportMeta;

  if (typeof meta.url === 'string' && meta.url.startsWith('file:')) {
    try {
      candidates.push(fileURLToPath(new URL(EQUIPMENT_DDL_FILENAME, meta.url)));
    } catch {
      // nietypowy identyfikator modułu — próbujemy następnego kandydata
    }
  }

  if (typeof meta.dirname === 'string' && meta.dirname.length > 0) {
    candidates.push(join(meta.dirname, EQUIPMENT_DDL_FILENAME));
  }

  if (typeof process !== 'undefined' && typeof process.cwd === 'function') {
    candidates.push(join(process.cwd(), 'lib', 'equipment', 'ddl', EQUIPMENT_DDL_FILENAME));
  }

  return candidates;
};

/**
 * Gałąź `node:fs`. Sprawdza ZAWARTOŚĆ każdego kandydata, nie samo jego
 * istnienie — plik, który da się otworzyć, ale nie jest DDL, ma być błędem,
 * a nie „warstwą bez tabel".
 *
 * Nigdy nie rzuca w normalnej pracy (używane jest do zainicjowania eksportu
 * poniżej) i nigdy nie zwraca pustego tekstu — pusty wynik jest sygnałem, że
 * kandydatów nie było.
 */
const tryLoadEquipmentDdlFromFs = (): string | null => {
  for (const candidate of resolveCandidatePaths()) {
    try {
      const text = readFileSync(candidate, 'utf8');
      if (looksLikeEquipmentDdl(text)) {
        return text;
      }
    } catch {
      // następny kandydat
    }
  }
  return null;
};

/**
 * Gałąź `node:fs` w wersji, która rzuca. Używana, gdy brak pliku ma być
 * błędem widocznym, a nie cichym brakiem tekstu.
 */
export const loadEquipmentDdlFromFs = (): string => {
  const candidates = resolveCandidatePaths();
  const failures: string[] = [];

  for (const candidate of candidates) {
    try {
      const text = readFileSync(candidate, 'utf8');
      if (looksLikeEquipmentDdl(text)) {
        return text;
      }
      failures.push(`${candidate}: readable, but not ${EQUIPMENT_DDL_FILENAME}`);
    } catch (error) {
      failures.push(`${candidate}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  throw new Error(
    `Cannot read ${EQUIPMENT_DDL_FILENAME} from node:fs. Tried ${candidates.length} path(s): ${failures.join(' | ')}`,
  );
};

/**
 * Gałąź `?raw`. Literał jest opatrzony `webpackIgnore`, żeby webpack i
 * Turbopack nie próbowały go rozwiązywać podczas budowania Next.js — brak
 * reguły dla `.sql?raw` zabija build, zamiast dać możliwość degrademu.
 * TypeScript zgłaszałby na tym miejscu TS2307, więc wyjątek wygaszony jest
 * jawnym `@ts-expect-error`: gdyby ktoś dodał kiedyś ambient
 * `declare module '*.sql?raw'`, dyrektywa stanie się zbędna i tsc zgłosi
 * „nieuzytą dyrektywę" zamiast po cichu zepsuć odczyt.
 */
export const loadEquipmentDdlFromBundlerRaw = async (): Promise<string> => {
  const loaded = (await import(
    // @ts-expect-error -- `.sql?raw` nie jest modułem TypeScripta; patrz komentarz wyżej.
    /* webpackIgnore: true */ './0001_equipment.sql?raw'
  )) as { default?: unknown };

  const text = typeof loaded.default === 'string' ? loaded.default : '';

  if (!looksLikeEquipmentDdl(text)) {
    throw new Error(
      `Bundler raw import of ${EQUIPMENT_DDL_FILENAME} did not yield the DDL: ${text.length} chars. ` +
        'This pipeline has no ?raw support for .sql.',
    );
  }

  return text;
};

const eagerDdlText = tryLoadEquipmentDdlFromFs();

/**
 * Kanoniczny tekst DDL jako nazwany string — wypełniany w chwili ewaluacji
 * modułu z `node:fs`, czyli na ścieżce produkcyjnej (vitest, tsx, `next dev`,
 * `next start`, Docker).
 *
 * Na runtime bez `fs` pozostaje pusty i wtedy JEDYNYM poprawnym wejściem jest
 * `readEquipmentDdlSql()`. Pusty string NIE oznacza „nie ma schematu" —
 * `applyEquipmentSchema()` traktuje go jako błąd, nigdy jako „nic do
 * zrobienia", bo brak pliku i pusta warstwa to dwie różne katastrofy.
 */
export const EQUIPMENT_DDL_SQL: string = eagerDdlText ?? '';

/** Którą gałęzią wypełniono `EQUIPMENT_DDL_SQL`; `null` gdy nie wypełniono. */
export const EQUIPMENT_DDL_SOURCE: EquipmentDdlSource | null = eagerDdlText === null ? null : 'node-fs';

let cachedDdl: LoadedEquipmentDdl | null = null;
let pendingDdl: Promise<LoadedEquipmentDdl> | null = null;

/**
 * Odczytuje i cache'uje tekst DDL. Kolejność `node:fs` → `?raw` → wyjątek.
 * Cache powstaje po pierwszym odczycie, a równoległe wywołania dzielą jedną
 * obietnicę zamiast czytać plik wielokrotnie.
 */
export const readEquipmentDdlSql = async (): Promise<LoadedEquipmentDdl> => {
  if (cachedDdl) {
    return cachedDdl;
  }
  if (pendingDdl) {
    return pendingDdl;
  }

  pendingDdl = (async (): Promise<LoadedEquipmentDdl> => {
    let source: EquipmentDdlSource;
    let text: string;

    const fromFs = tryLoadEquipmentDdlFromFs();
    if (fromFs !== null) {
      source = 'node-fs';
      text = fromFs;
    } else {
      source = 'bundler-raw';
      text = await loadEquipmentDdlFromBundlerRaw();
    }

    if (!looksLikeEquipmentDdl(text)) {
      throw new Error(
        `${EQUIPMENT_DDL_FILENAME} read via ${source} is not the equipment DDL (${text.length} chars).`,
      );
    }

    const loaded: LoadedEquipmentDdl = { sql: text, source };
    cachedDdl = loaded;
    return loaded;
  })();

  try {
    return await pendingDdl;
  } finally {
    pendingDdl = null;
  }
};

/**
 * Czyści cache. Istnieje po to, by test mógł udowodnić, że obie gałęzie
 * odczytu dają ten sam tekst — inaczej sprawdzałby tylko to, co akurat
 * zcache'ował pierwszy import.
 */
export const resetEquipmentDdlCache = (): void => {
  cachedDdl = null;
  pendingDdl = null;
};

/**
 * Usuwa komentarze `--` oraz blokowe, NIE wchodząc w literały tekstowe.
 *
 * Bez znajomości literałów zwykłe wyszukiwanie `--` wycięłoby fragment wyrażenia
 * regularnego w ograniczeniu `CHECK` i policzyłoby dwie instrukcje zamiast
 * jednej. Ta sama funkcja odpowiada za odczytanie warstwy health poprawnie:
 * nazwa `health_overlay` występuje w pliku wyłącznie w KOMENTARZU, więc surowe
 * `includes()` na tekście DDL zgłosiłoby fałszywy alarm.
 */
export const stripSqlComments = (input: string): string => {
  let out = '';
  let i = 0;
  const n = input.length;

  while (i < n) {
    const ch = input[i];

    if (ch === "'") {
      // literał pojedynczy; `''` wewnątrz to escape, nie koniec
      let j = i + 1;
      while (j < n) {
        if (input[j] === "'") {
          if (input[j + 1] === "'") {
            j += 2;
            continue;
          }
          break;
        }
        j += 1;
      }
      out += input.slice(i, Math.min(j + 1, n));
      i = j + 1;
      continue;
    }

    if (ch === '-' && input[i + 1] === '-') {
      const newline = input.indexOf('\n', i);
      i = newline === -1 ? n : newline;
      out += '\n';
      continue;
    }

    if (ch === '/' && input[i + 1] === '*') {
      const end = input.indexOf('*/', i + 2);
      i = end === -1 ? n : end + 2;
      out += ' ';
      continue;
    }

    if (ch !== undefined) {
      out += ch;
    }
    i += 1;
  }

  return out;
};

/**
 * Liczy instrukcje SQL: średniki na głębokości parens 0, po usunięciu
 * komentarzy i z pominięciem literałów. Liczy DDL, nie opakowanie transakcji —
 * `BEGIN;` i `COMMIT;` dochodzą w `buildEquipmentSchemaTransaction()`.
 */
export const countSqlStatements = (input: string): number => {
  const stripped = stripSqlComments(input);
  let statements = 0;
  let depth = 0;
  let i = 0;
  const n = stripped.length;

  while (i < n) {
    const ch = stripped[i];

    if (ch === "'") {
      let j = i + 1;
      while (j < n) {
        if (stripped[j] === "'") {
          if (stripped[j + 1] === "'") {
            j += 2;
            continue;
          }
          break;
        }
        j += 1;
      }
      i = Math.min(j + 1, n);
      continue;
    }

    if (ch === '(') {
      depth += 1;
    } else if (ch === ')') {
      depth = Math.max(0, depth - 1);
    } else if (ch === ';' && depth === 0) {
      statements += 1;
    }

    i += 1;
  }

  return statements;
};