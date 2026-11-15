-- ═══════════════════════════════════════════════════════════════════════════
-- HYLONO — DDL WARSTWY HEALTH (`health_overlay`)
-- ═══════════════════════════════════════════════════════════════════════════
--
-- [DECISION: 2026-10-16] Kanoniczny DDL schematu `health_overlay` dla OSOBNEJ
-- instancji w regionie UE. Ten plik NIE JEST częścią warstwy equipment i nie
-- ma prawa trafić do `lib/equipment/ddl/` — ten katalog czyta
-- `readEquipmentDdlSql()` i wykonuje `applyEquipmentSchema()` w GŁÓWNEJ bazie.
-- Umieszczenie pliku zdrowotnego obok DDL wykonywanego automatycznie byłoby
-- jednym niewidocznym refaktorem od oddzielenia prawnej podstawy przetwarzania.
--
-- ── Dlaczego w ogóle istnieje ───────────────────────────────────────────────
--
-- `lib/equipment/module4/overlay-schema.ts` deklaruje pięć tabel w schemacie
-- `health_overlay`, a kod nigdy ich nie tworzy. Drizzle opisuje TYPY dla
-- TypeScripta — `pgSchema().table()` nie generuje DDL. Bez tego pliku osobna
-- instancja nie ma ŚCIEŻKI TWORZENIA SCHEMATU w ogóle i ktoś musi zgadywać
-- kolumny z pamięci. Zgadywanie definicji tabeli zdrowotnych to dokładnie ten
-- sposób, w którym health kończy rozjechane z kodem, który je czyta.
--
-- ── Jak stosować ───────────────────────────────────────────────────────────
--
-- RĘCZNIE, przez człowieka, na osobnej instancji. Ten plik nie ma aplikatora
-- i nie będzie go miał — powód w `README.md` obok. Polecenie:
--
--   psql "$HEALTH_OVERLAY_DATABASE_URL" \
--        --single-transaction --set ON_ERROR_STOP=1 \
--        -f lib/equipment/module4/ddl/health_overlay.sql
--
-- Świadomie BEZ `BEGIN;`/`COMMIT;` wewnątrz pliku: transakcję ma prowadzić
-- `psql --single-transaction`, żeby nie powstały dwie rozbieżne wersje
-- posługiwania się transakcją (jedna dla psql, druga dla wywołującego).
--
-- ── Co ten plik świadomie NIE robi ──────────────────────────────────────────
--
-- 1. NIE włącza RLS. `boundary.ts:16-18` mówi, że izolacja per-gabinet ma być
--    na poziomie bazy (RLS), ale ani rola aplikacji, ani żadna zmienna sesyjna
--    NIE SĄ zadeklarowane w `overlay-schema.ts`. Wpisanie tu polityki
--    zmyślonymi nazwami włączyłoby albo „odrzuć wszystko" (tabela umiera),
--    albo — przy zbyt szerokim `USING` — „przepuść wszystko", a oba stany
--    wyglądają jak działające. To jest OTWARTA decyzja dla człowieka z dostępem
--    do instancji, nie do zgadywania w tym pliku.
-- 2. NIE nadaje uprawnień (`GRANT`/`REVOKE`) — rola aplikacji warstwy health
--    nie jest zadeklarowana w repozytorium.
-- 3. NIE tworzy rozszerzeń, typów ENUM ani wyzwalaczy: żadne nie są
--    zadeklarowane w warstwie TypeScript, a wyzwalacz zmieniałby zachowanie
--    zapisu, którego nikt nie kontraktuje.
--
-- ── Pochodzenie ograniczeń ──────────────────────────────────────────────────
--
-- Każde ograniczenie poniżej ma jedno z trzech źródeł, a nagłówek COMMENT
-- przy każdym z nich mówi które. Klasyfikacja jest celowa, bo `CHECK` którego
-- nie da się wyprowadzić z deklaracji jest zgadywaniem i ma taki sam skutek jak
-- brak DDL w ogóle:
--
--   [Z DEKLARACJI]    — wynika wprost z `overlay-schema.ts` (typ, NOT NULL,
--                       DEFAULT, klucz główny) lub z komentarza przy kolumnie.
--   [Z MODUŁU]        — wynika z kodu obok: `consents.ts` albo `boundary.ts`.
--   [UTWARDZENIE]     — nie ma odpowiednika w kodzie; utrzymuje dane w granicach
--                       sensownych dla warstwy zero-PII. Najsłabsza kategoria.
--
-- ── Znane ograniczenia tego pliku ───────────────────────────────────────────
--
--   `OverlayClinicConfig.encryptionInTransit` (`overlay-schema.ts:109`) nie ma
--   odpowiadającej kolumny w `overlay_clinics` — tabela ma tylko `data_region`
--   i `encryption_at_rest` (`overlay-schema.ts:31-38`). Nie dopisujemy tu
--   kolumny, bo jej nie ma w deklaracji i test zgodności kolumn by to złamał.
--   Konfiguracja TLS nie jest więc w tej warstwie utrwalania.
-- ═══════════════════════════════════════════════════════════════════════════

-- Schemat jest Osobny: inny podmiot, inna instancja, inna podstawa prawna.
-- `IF NOT EXISTS` dlatego, że plik ma być możliwy do ponownego zastosowania.
CREATE SCHEMA IF NOT EXISTS health_overlay;

-- ─────────────────────────── Gabinet = tenant health ─────────────────────────
-- Gabinet NIE jest tenantem OEM. To inny podmiot, inna podstawa przetwarzania
-- i inny cykl życia, dlatego osobna tabela, a nie kolumna w `equipment_*`.
CREATE TABLE IF NOT EXISTS health_overlay.overlay_clinics (
  id                 text PRIMARY KEY,
  -- Region przetwarzania. Wartość wymuszona w bazie, nie tylko w kodzie:
  -- `boundary.ts:128` porównuje `dataRegion.toLowerCase()` z `'eu'`
  -- (`overlay-schema.ts:102`), więc ten CHECK jest tym samym wyrażeniem.
  data_region        text NOT NULL,
  -- `boundary.ts:136` porównuje `encryptionAtRest.toUpperCase()` z `'AES-256'`
  -- (`overlay-schema.ts:103`). `upper()`, nie `=`, bo kod przyjmuje każdą
  -- wielkość liter — ścislejszy CHECK odrzuciłby zapisy, które granica przepuszcza.
  encryption_at_rest text NOT NULL,
  created_at         timestamptz NOT NULL DEFAULT now(),

  -- [Z DEKLARACJI] `text NOT NULL` (overlay-schema.ts:34-36).
  -- [UTWARDZENIE] Pusty identyfikator gabinetu to brak identyfikatora; wszystkie
  -- klucze obce w tej warstwie wskazują na `id`.
  CONSTRAINT overlay_clinics_id_not_blank CHECK (id <> ''),
  -- [Z MODUŁU] boundary.ts:128 + overlay-schema.ts:102.
  CONSTRAINT overlay_clinics_data_region_eu CHECK (lower(data_region) = 'eu'),
  -- [Z MODUŁU] boundary.ts:136 + overlay-schema.ts:103.
  CONSTRAINT overlay_clinics_encryption_at_rest_alg CHECK (upper(encryption_at_rest) = 'AES-256')
);

-- Świadomie BEZ indeksu wtórnego na `overlay_clinics`: obie kolumny
-- konfiguracyjne są wymuszone przez CHECK na jedną wartość, więc indeks
-- indeksowałby stałą. Wyjątek ten jest jedynym miejscem w tym pliku, gdzie
-- tabela nie ma indeksu poza kluczem głównym, i jest zamierzony.

-- ─────────────────────────── Cztery rozdzielone zgody ───────────────────────
-- `consents.ts:19-25` zna dokładnie cztery typy. `INFORMED_NOTICE_TYPE`
-- ('informed_notice') NIE jest typem zgody — `consents.ts:28-29` nazywa to
-- osobnym obowiązkiem poinformowania, a `isConsentType()` go odrzuca.
-- Dlatego `consent_type` NIE zawiera `informed_notice`: wpisanie tam
-- klauzuli informacyjnej unieważnia zgodę, na którą powołuje się cały cykl.
CREATE TABLE IF NOT EXISTS health_overlay.overlay_consent_records (
  id              text PRIMARY KEY,
  -- [Z MODUŁU] Klucz obcy pominięty w deklaracji Drizzle, a wynika z nazwy
  -- kolumny i z istnienia `overlay_clinics.id`. `ON DELETE RESTRICT`, nie
  -- CASCADE: kaskada przy usunięciu gabinetu skasowałby ślad zgód i dziennik
  -- dostępu, czyli dowód, po którym sięgamy w audycie.
  clinic_id       text NOT NULL REFERENCES health_overlay.overlay_clinics (id) ON DELETE RESTRICT,
  -- ODPORNIK, nie identyfikator osoby (overlay-schema.ts:51-53).
  subject_ref     text NOT NULL,
  consent_type    text NOT NULL,
  granted         boolean NOT NULL,
  -- Dwie nullable, bo deklaracja (overlay-schema.ts:57-58) ich nie wymusza.
  -- Spójność pary czasów pilnuje CHECK poniżej, a nie NOT NULL.
  granted_at      timestamptz,
  withdrawn_at    timestamptz,
  content_version text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),

  -- [UTWARDZENIE] Bez kolumn `timestamp`/`timestamp with time zone`: `timestamp`
  -- bez strefy w warstwie transgranicznej to godzina, która zmienia znaczenie
  -- po zmianie strefy serwera. Deklaracja używa `withTimezone: true`.
  -- [Z DEKLARACJI] NOT NULL na id/clinic_id/subject_ref/consent_type/granted/
  -- content_version/created_at; nullable na granted_at/withdrawn_at.
  -- [Z MODUŁU] consents.ts:19-25 + isConsentType() (consents.ts:55-57).
  CONSTRAINT overlay_consent_records_consent_type_known CHECK (
    consent_type IN ('health', 'procedure', 'marketing', 'image')
  ),
  -- [UTWARDZENIE] Opornik to token, nie tekst wolny. Format wyklucza kropkę,
  -- `@` i spację, więc imię, e-mail ani PESEL nie przechodzą — to najtańsza
  -- linia obrony przed tym, co cała warstwa ma wykluczać. UWAGA: jeżeli na
  -- osobnej instancji istnieją już odporniki spoza tego formatu, ten CHECK
  -- trzeba najpierw zweryfikować na danych, a nie tylko na pliku.
  CONSTRAINT overlay_consent_records_subject_ref_format CHECK (
    subject_ref ~ '^[A-Za-z0-9_-]{1,64}$'
  ),
  -- [UTWARDZENIE] Bez wymyślonego wyrażenia dla `content_version`:
  -- `assertNoticeAcknowledged()` (consents.ts:111-121) porównuje wersje
  -- równością, więc tylko niepustość jest tym, co można bezpiecznie odmówić.
  CONSTRAINT overlay_consent_records_content_version_not_blank CHECK (content_version <> ''),
  -- [Z MODUŁU] consents.ts:86 — zgoda jest „aktualna", gdy `granted` i brak
  -- `withdrawn_at`. Zapis `granted = true` bez czasu nadania nie da się
  -- przedstawić w audycie Art. 7 ust. 1 RODO.
  CONSTRAINT overlay_consent_records_granted_has_timestamp CHECK (
    granted = false OR granted_at IS NOT NULL
  ),
  -- [Z MODUŁU] consents.ts:86 — cofnięta zgoda nie jest zgodą, więc wiersz
  -- nie może twierdzić obu naraz.
  CONSTRAINT overlay_consent_records_withdrawn_means_not_granted CHECK (
    withdrawn_at IS NULL OR granted = false
  ),
  -- [UTWARDZENIE] Cofnięcie przed nadaniem to zapis, którego nie da się
  -- odtworzyć z samej daty cofnięcia.
  CONSTRAINT overlay_consent_records_withdrawn_after_granted CHECK (
    withdrawn_at IS NULL OR granted_at IS NULL OR withdrawn_at >= granted_at
  )
);

-- Ścieżka odczytu `buildConsentState()` (consents.ts:72-91) to zapytanie
-- jednego podmiotu w jednym gabinecie, po wszystkich typach zgody.
CREATE INDEX IF NOT EXISTS overlay_consent_records_clinic_subject_type_idx
  ON health_overlay.overlay_consent_records (clinic_id, subject_ref, consent_type);

-- `assertNoticeAcknowledged()` (consents.ts:111) skanuje wersje w obrębie
-- gabinetu — osobny indeks, bo zapytanie nie ma `subject_ref`.
CREATE INDEX IF NOT EXISTS overlay_consent_records_clinic_version_idx
  ON health_overlay.overlay_consent_records (clinic_id, content_version);

-- ─────────────────────────── Rejestr wycofań PKE ────────────────────────────
-- Osobna tabela, nie kolumna w zgodach: `marketingAllowed()`
-- (consents.ts:140-151) potrzebuje wycofań podmiotu, żeby odrzucić zgodę
-- marketingową nawet przy aktywnym checkboxie.
CREATE TABLE IF NOT EXISTS health_overlay.overlay_consent_revocations (
  id          text PRIMARY KEY,
  clinic_id   text NOT NULL REFERENCES health_overlay.overlay_clinics (id) ON DELETE RESTRICT,
  subject_ref text NOT NULL,
  -- [Z DEKLARACJI] NOT NULL (overlay-schema.ts:71) — wiersz wycofania bez
  -- chwili cofnięcia jest bezwartościowy i unieruchamia `marketingAllowed()`.
  revoked_at  timestamptz NOT NULL,
  -- Nullable: wycofanie nie wymaga uzasadnienia, a wymuszenie go spowodowałoby
  -- zapisy z „brak powodu", który nic nie wnosi w audycie.
  reason      text,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT overlay_consent_revocations_subject_ref_format CHECK (
    subject_ref ~ '^[A-Za-z0-9_-]{1,64}$'
  ),
  -- [UTWARDZENIE] Pusty powód to brak powodu; `NULL` znaczy „nie podano".
  CONSTRAINT overlay_consent_revocations_reason_not_blank CHECK (
    reason IS NULL OR reason <> ''
  )
);

-- Indeks dokładnie pod warunek z `marketingAllowed()`: `subjectRef ===` oraz
-- `revokedAt <= atIso` (consents.ts:146-149).
CREATE INDEX IF NOT EXISTS overlay_consent_revocations_clinic_subject_time_idx
  ON health_overlay.overlay_consent_revocations (clinic_id, subject_ref, revoked_at DESC);

-- ─────────────────────────── Dziennik dostępu ──────────────────────────────
-- Kto, do czego, kiedy. To jedyna tabela w warstwie, której sensem jest sam
-- zapis, więc brak klucza głównego byłby defektem, a nie uproszczeniem:
-- `overlay-schema.ts:79` już go deklaruje i ten plik go powtarza.
CREATE TABLE IF NOT EXISTS health_overlay.overlay_access_log (
  id          text PRIMARY KEY,
  clinic_id   text NOT NULL REFERENCES health_overlay.overlay_clinics (id) ON DELETE RESTRICT,
  -- Aktor to odpornik, nie konto — warstwa health nie trzyma loginów.
  actor_ref   text NOT NULL,
  -- [Z DEKLARACJI] NOT NULL (overlay-schema.ts:82). Wiersz dostępu bez chwili
  -- dostępu jest wierszem, którego nie da się umieścić w osi czasu.
  accessed_at timestamptz NOT NULL,
  -- Świadomie BEZ wyliczenia wartości `operation`: żadna lista operacji nie
  -- jest zadeklarowana w repozytorium, a wymyślenie jej tutaj odrzucałoby
  -- zapisy, które kod uważa za poprawne.
  operation   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT overlay_access_log_actor_ref_format CHECK (
    actor_ref ~ '^[A-Za-z0-9_-]{1,64}$'
  ),
  CONSTRAINT overlay_access_log_operation_not_blank CHECK (operation <> '')
);

CREATE INDEX IF NOT EXISTS overlay_access_log_clinic_time_idx
  ON health_overlay.overlay_access_log (clinic_id, accessed_at DESC);

-- Osobny indeks dla zapytania „co robił ten aktor", bo pytanie o kabinet jest
-- znacznie częstsze niż pytanie o aktora.
CREATE INDEX IF NOT EXISTS overlay_access_log_actor_time_idx
  ON health_overlay.overlay_access_log (clinic_id, actor_ref, accessed_at DESC);

-- ─────────────────────────── Ankieta kwalifikacyjna ─────────────────────────
-- Dane zdrowotne w rozumieniu Art. 9 RODO. Dlatego wyłącznie tutaj.
CREATE TABLE IF NOT EXISTS health_overlay.overlay_screening (
  id          text PRIMARY KEY,
  clinic_id   text NOT NULL REFERENCES health_overlay.overlay_clinics (id) ON DELETE RESTRICT,
  subject_ref text NOT NULL,
  -- [Z DEKLARACJI] `jsonb NOT NULL` (overlay-schema.ts:93).
  answers     jsonb NOT NULL,
  -- [Z DEKLARACJI] NOT NULL (overlay-schema.ts:95). To wyraz retencji w bazie;
  -- `overlayScreeningRetentionDays` jest STAŁĄ TypeScriptu (overlay-schema.ts:100),
  -- a nie kolumną, więc wyraża się ją oknem na `expires_at`, nie osobną kolumną.
  expires_at  timestamptz NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT overlay_screening_subject_ref_format CHECK (
    subject_ref ~ '^[A-Za-z0-9_-]{1,64}$'
  ),
  -- [Z DEKLARACJI] overlay-schema.ts:92 — „odpowiedzi w formie struktury, nie
  -- tekstu wolnego". `jsonb` przepuszcza tekst, więc sama typ kolumny tego
  -- nie egzekwuje; dopiero ta nazwa funkcji to robi.
  CONSTRAINT overlay_screening_answers_structured CHECK (
    jsonb_typeof(answers) IN ('object', 'array')
  ),
  -- [UTWARDZENIE] Dodatnie okno retencji. `expires_at` nie może być w przeszłości
  -- względem utworzenia wiersza — to „retencja 90 dni" zapisana jako 0 dni.
  CONSTRAINT overlay_screening_retention_window_positive CHECK (
    expires_at > created_at
  ),
  -- [Z MODUŁU] overlay-schema.ts:100 (`overlayScreeningRetentionDays = 90`) i
  -- komentarz „Retencja: 90 dni, potem twarde usunięcie" (overlay-schema.ts:94).
  -- Test czytający plik porównuje tę liczbę ze stałą z TypeScriptu, więc zmiana
  -- jednej strony bez drugiej wywala bramkę.
  CONSTRAINT overlay_screening_retention_window_max CHECK (
    expires_at <= created_at + interval '90 days'
  )
);

-- Ścieżka odczytu ankiety podmiotu.
CREATE INDEX IF NOT EXISTS overlay_screening_clinic_subject_idx
  ON health_overlay.overlay_screening (clinic_id, subject_ref);

-- Indeks procesu retencji: `DELETE ... WHERE expires_at <= now()`. Nie może być
-- indeksu częściowego `WHERE expires_at <= now()` — `now()` nie jest
-- `IMMUTABLE`, więc Postgres odrzuciłby taki indeks przy tworzeniu.
CREATE INDEX IF NOT EXISTS overlay_screening_expiry_idx
  ON health_overlay.overlay_screening (expires_at);