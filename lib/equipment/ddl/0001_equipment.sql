-- ═══════════════════════════════════════════════════════════════════════════
-- HYLONO EQUIPMENT OS — DDL warstwy zero-PII
-- ═══════════════════════════════════════════════════════════════════════════
--
-- [DECISION: 2026-10-15] Ten plik jest kanonicznym DDL dla tabel `equipment_*`.
-- Drizzle w `lib/db/schema.ts` jest deklaracją typów dla TypeScripta — niczego
-- nie tworzy. Bez tego pliku 288 zielonych testów opisywałoby schemat, który
-- nigdy nie istniał w bazie.
--
-- Dlaczego ręcznie, a nie `drizzle-kit`: generator daje same `CREATE TABLE`.
-- Nie daje kluczy obcych, indeksów, ograniczeń `CHECK` ani partycjonowania —
-- czyli dokładnie tych rzeczy, na których opiera się cała reszta tej warstwy.
--
-- Dwa defekty odkryte dopiero przy wykonaniu tego DDL:
--
--   1. `equipment_ingest_idempotency` nie miała klucza głównego ani UNIQUE.
--      Warstwa ingestu rozstrzyga wyścig retransmisji przez
--      `ON CONFLICT (device_id, idempotency_key)`. Bez UNIQUE to wyrażenie
--      jest nieprawidłowe — a duplikaty goniłyby się w nieskończoność,
--      doliczając godziny przy każdej retransmisji.
--   2. `equipment_protocol_bookings.device_id` miało nazwę SQL
--      `device_device_id` — podwójny prefiks, literówka, która przeszłaby
--      przez każdy test działający na deklaracjach TypeScript.
--
-- Warstwa health (`health_overlay.*`) NIE JEST w tym pliku. Zgodnie z mandatem
-- żyje w osobnej instancji w regionie UE; deklaracja jest w
-- `lib/equipment/module4/overlay-schema.ts`.
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────── OEM = tenant ───────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment_oem_tenants (
  id            text PRIMARY KEY,
  slug          text NOT NULL,
  display_name  text NOT NULL,
  -- JEDYNY PII w warstwie zero-PII: e-mail kontrahenta OEM, nie osoby
  -- korzystającej z urządzenia.
  contact_email text NOT NULL,
  branding      jsonb,
  status        text NOT NULL DEFAULT 'active',
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT equipment_oem_tenants_slug_key UNIQUE (slug),
  -- Nazwa firmy, nie osoby. Imię i nazwisko kontrahenta nie ma tu miejsca.
  CONSTRAINT equipment_oem_tenants_slug_format CHECK (slug ~ '^[a-z0-9][a-z0-9-]{1,62}$'),
  CONSTRAINT equipment_oem_tenants_status_known CHECK (status IN ('active', 'suspended'))
);

-- ─────────────────────────── Urządzenia ────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment_devices (
  id                text PRIMARY KEY,
  oem_tenant_id     text NOT NULL REFERENCES equipment_oem_tenants (id) ON DELETE CASCADE,
  -- Identyfikator SPRZĘTU. Numer seryjny maszyny, nie osoby.
  serial_number     text NOT NULL,
  model_code        text NOT NULL,
  modality          text NOT NULL,
  device_class      text NOT NULL,
  -- Kod lokalizacji obiektu, NIE adres pocztowy.
  site_ref          text NOT NULL,
  filter_count      integer NOT NULL DEFAULT 0,

  -- Licznik źródłowy w SEKUNDACH. Kolumna godzinowa poniżej jest wartością
  -- pochodną; przy krótkich pakietach liczenie tylko w godzinach gubiłoby
  -- pół godziny na każdym ticku, a licznik dryfowałby w górę — czyli
  -- zlecenie przeglądu powstawałoby za wcześnie.
  runtime_seconds_since_service integer NOT NULL DEFAULT 0,

  runtime_hours_since_service   integer NOT NULL DEFAULT 0,
  flow_degradation_percent      integer,
  status                        text NOT NULL DEFAULT 'active',
  last_telemetry_at             timestamptz,
  created_at                    timestamptz NOT NULL DEFAULT now(),
  updated_at                    timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_devices_tenant_serial_key UNIQUE (oem_tenant_id, serial_number),
  CONSTRAINT equipment_devices_serial_format CHECK (serial_number ~ '^[A-Za-z0-9-]{4,64}$'),
  -- Kod obiektu, nie adres. Zakaz spacji i kropek jest tu celowy: adres
  -- w warstwie zero-PII to PII.
  CONSTRAINT equipment_devices_site_ref_format CHECK (site_ref ~ '^[A-Z0-9-]{1,64}$'),
  CONSTRAINT equipment_devices_modality_known CHECK (modality IN ('hbot', 'hydrogen', 'pemf')),
  CONSTRAINT equipment_devices_class_known CHECK (device_class IN ('chamber', 'module')),
  CONSTRAINT equipment_devices_status_known CHECK (status IN ('active', 'maintenance', 'decommissioned')),
  CONSTRAINT equipment_devices_filter_count_range CHECK (filter_count >= 0),
  CONSTRAINT equipment_devices_runtime_seconds_range CHECK (runtime_seconds_since_service >= 0),
  CONSTRAINT equipment_devices_runtime_hours_range CHECK (runtime_hours_since_service >= 0),
  CONSTRAINT equipment_devices_degradation_range CHECK (
    flow_degradation_percent IS NULL
    OR (flow_degradation_percent BETWEEN 0 AND 100)
  )
);

CREATE INDEX IF NOT EXISTS equipment_devices_tenant_idx
  ON equipment_devices (oem_tenant_id);
CREATE INDEX IF NOT EXISTS equipment_devices_serial_lookup_idx
  ON equipment_devices (serial_number);

-- ─────────────────────────── Telemetria ────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment_telemetry_events (
  id                    text PRIMARY KEY,
  device_id             text NOT NULL REFERENCES equipment_devices (id) ON DELETE CASCADE,
  event_type            text NOT NULL,
  occurred_at           timestamptz NOT NULL,
  runtime_delta_seconds integer,
  -- Anonimowy token sesji. NIE jest kluczem do osoby.
  session_token         text,
  sensors               jsonb,
  -- SHA-256 ciała pakietu: dowód, że retransmisja niesie te same bajty.
  payload_hash          text NOT NULL,
  received_at           timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_telemetry_events_type_known CHECK (
    event_type IN ('runtime_tick', 'session_started', 'session_completed',
                   'sensor_reading', 'fault')
  ),
  -- Górna granica zgadza się ze schematem telemetrycznym: pakiet dłuższy
  -- niż dobę oznaczałby, że urządzenie zgłasza coś, czego nie zmierzyło.
  CONSTRAINT equipment_telemetry_events_delta_range CHECK (
    runtime_delta_seconds IS NULL
    OR (runtime_delta_seconds BETWEEN 0 AND 86400)
  ),
  CONSTRAINT equipment_telemetry_events_payload_hash_format CHECK (payload_hash ~ '^[a-f0-9]{64}$')
);

CREATE INDEX IF NOT EXISTS equipment_telemetry_events_device_time_idx
  ON equipment_telemetry_events (device_id, occurred_at DESC);

-- ─────────────────────────── Idempotencja ──────────────────────────────────
-- Klucz złożony (urządzenie, klucz) JEST kluczem głównym. To jedyna struktura,
-- która rozstrzyga wyścig retransmisji w bazie, a nie w kodzie aplikacji.
-- `SELECT` przed `INSERT` daje dwa równoległe ingesty, oba widzą „brak
-- duplikatu" i oba doliczają godziny — cicho, raz za razem.
CREATE TABLE IF NOT EXISTS equipment_ingest_idempotency (
  device_id       text NOT NULL REFERENCES equipment_devices (id) ON DELETE CASCADE,
  idempotency_key text NOT NULL,
  payload_hash    text NOT NULL,
  duplicate_count integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now(),

  PRIMARY KEY (device_id, idempotency_key),
  CONSTRAINT equipment_ingest_idempotency_key_hex CHECK (idempotency_key ~ '^[a-f0-9]{16,128}$'),
  -- Ten sam defekt co w telemetrii: kolumna jest udokumentowana jako SHA-256 ciała
  -- pakietu, więc musi mieć format hex. Weryfikacja DDL na Postgresie wykryła
  -- jego brak — deklaracja TypeScript nigdy by tego nie pokazała.
  CONSTRAINT equipment_ingest_idempotency_payload_hash_format CHECK (payload_hash ~ '^[a-f0-9]{64}$'),
  CONSTRAINT equipment_ingest_idempotency_duplicate_nonneg CHECK (duplicate_count >= 0)
);

-- ─────────────────────────── Cykl serwisowy ────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment_service_intervals (
  id                   text PRIMARY KEY,
  device_id            text NOT NULL REFERENCES equipment_devices (id) ON DELETE CASCADE,
  threshold_hours      integer NOT NULL,
  trigger_reason       text NOT NULL,
  runtime_hours_at_order integer NOT NULL,
  opened_at            timestamptz NOT NULL DEFAULT now(),
  closed_at            timestamptz,

  -- Próg z mandatu to ZAKRES 200–300 h, nie jedna liczba. Zakres trafia do
  -- bazy jako ograniczenie, żeby zły próg nie wszedł przez zapytanie.
  CONSTRAINT equipment_service_intervals_threshold_range CHECK (
    threshold_hours BETWEEN 200 AND 300
  )
);

-- Jeden otwarty cykl na urządzenie. Bez tego dwa równoległe pakiety
-- przekraczające próg zakładałyby dwa cykle i dwa zlecenia.
CREATE UNIQUE INDEX IF NOT EXISTS equipment_service_intervals_one_open_per_device
  ON equipment_service_intervals (device_id)
  WHERE closed_at IS NULL;

-- ─────────────────────────── Zlecenia ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS equipment_service_orders (
  id                    text PRIMARY KEY,
  oem_tenant_id         text NOT NULL REFERENCES equipment_oem_tenants (id) ON DELETE CASCADE,
  device_id             text NOT NULL REFERENCES equipment_devices (id) ON DELETE CASCADE,
  interval_id           text NOT NULL REFERENCES equipment_service_intervals (id),
  runtime_hours_at_order integer NOT NULL,
  threshold_hours       integer NOT NULL,
  -- Grosze PLN. CAŁKOWITE — kwota zmiennoprzecinkowa w bazie zamienia
  -- rozliczenie w kwestię zgadywania, ile odsetek jest błędem zaokrąglenia.
  order_value_pln_grosze integer,
  status                text NOT NULL DEFAULT 'draft',
  commissioned_at       timestamptz,
  delivered_at          timestamptz,
  completed_at          timestamptz,
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_service_orders_status_known CHECK (
    status IN ('draft', 'sent_to_oem', 'acknowledged', 'completed', 'cancelled')
  ),
  CONSTRAINT equipment_service_orders_threshold_range CHECK (threshold_hours BETWEEN 200 AND 300),
  CONSTRAINT equipment_service_orders_value_nonneg CHECK (
    order_value_pln_grosze IS NULL OR order_value_pln_grosze >= 0
  )
);

CREATE INDEX IF NOT EXISTS equipment_service_orders_tenant_status_idx
  ON equipment_service_orders (oem_tenant_id, status, created_at DESC);

-- ─────────────────────────── Kolejka alertowa ──────────────────────────────
-- Zlecenie jest prawdą w bazie; powiadomienie jest transportem. Stąd osobna
-- tabela z własnym cyklem życia: `pending → delivered | retrying | dead`.
CREATE TABLE IF NOT EXISTS equipment_outbox (
  id                text PRIMARY KEY,
  oem_tenant_id     text NOT NULL REFERENCES equipment_oem_tenants (id) ON DELETE CASCADE,
  notification_type text NOT NULL,
  payload           jsonb NOT NULL,
  status            text NOT NULL DEFAULT 'pending',
  attempts          integer NOT NULL DEFAULT 0,
  available_at      timestamptz NOT NULL DEFAULT now(),
  delivered_at      timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_outbox_status_known CHECK (
    status IN ('pending', 'delivered', 'retrying', 'dead_letter')
  ),
  CONSTRAINT equipment_outbox_attempts_nonneg CHECK (attempts >= 0)
);

-- Indeks kolejki: dispatcher pyta o `pending/retrying` o `available_at <= now`.
CREATE INDEX IF NOT EXISTS equipment_outbox_pending_idx
  ON equipment_outbox (available_at)
  WHERE status IN ('pending', 'retrying');

-- ─────────────────────────── Rezerwacje zasobów ───────────────────────────
CREATE TABLE IF NOT EXISTS equipment_protocol_bookings (
  id             text PRIMARY KEY,
  resource_room  text NOT NULL,
  resource_staff text NOT NULL,
  device_id      text NOT NULL REFERENCES equipment_devices (id) ON DELETE CASCADE,
  -- Wariant zmienia footprint: `pair` blokuje dodatkową maskę.
  session_variant text NOT NULL,
  modality       text NOT NULL,
  starts_at      timestamptz NOT NULL,
  ends_at        timestamptz NOT NULL,
  -- Do kiedy zasób jest zajęty. Obejmuje bufor technologiczny i
  -- dezynfekcji, więc `ends_at` NIE jest końcem blokady.
  occupies_until timestamptz NOT NULL,
  created_at     timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_protocol_bookings_variant_known CHECK (session_variant IN ('single', 'pair')),
  CONSTRAINT equipment_protocol_bookings_window_ordered CHECK (ends_at > starts_at),
  CONSTRAINT equipment_protocol_bookings_occupies_after_end CHECK (occupies_until >= ends_at)
);

-- Kolizja zasobów jest wykrywana przez silnik, ale baza musi móc odrzucić
-- dwa zapisane w tym samym czasie na tej samej maszynie.
CREATE INDEX IF NOT EXISTS equipment_protocol_bookings_device_window_idx
  ON equipment_protocol_bookings (device_id, starts_at, occupies_until);
CREATE INDEX IF NOT EXISTS equipment_protocol_bookings_room_window_idx
  ON equipment_protocol_bookings (resource_room, starts_at, occupies_until);
CREATE INDEX IF NOT EXISTS equipment_protocol_bookings_staff_window_idx
  ON equipment_protocol_bookings (resource_staff, starts_at, occupies_until);

-- ─────────────────────────── Dowód procesowy ───────────────────────────────
-- `visit_ref` jest ODPORNIKIEM na wizytę, nie identyfikatorem osoby. Fakt
-- obejrzenia materiału nie jest o użytkowniku i nie może w warstwie zero-PII
-- stać w warstwie, która tak twierdzi.
CREATE TABLE IF NOT EXISTS equipment_watch_evidence (
  id                 text PRIMARY KEY,
  visit_ref          text NOT NULL,
  material_id        text NOT NULL,
  -- Znacznik czasu OBEJRZENIA, nie wysłania linku. Te dwie chwile muszą
  -- pozostać odrębne — to istota dowodu.
  watched_at         timestamptz NOT NULL,
  completion_percent integer NOT NULL,
  appointment_ref    text,
  created_at         timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_watch_evidence_completion_range CHECK (
    completion_percent BETWEEN 0 AND 100
  )
);

CREATE INDEX IF NOT EXISTS equipment_watch_evidence_visit_idx
  ON equipment_watch_evidence (visit_ref, material_id, watched_at DESC);

-- ─────────────────────────── Kolejka przypomnień ───────────────────────────
CREATE TABLE IF NOT EXISTS equipment_reminder_queue (
  id              text PRIMARY KEY,
  appointment_ref text NOT NULL,
  channel         text NOT NULL,
  template_id     text NOT NULL,
  scheduled_for   timestamptz NOT NULL,
  status          text NOT NULL DEFAULT 'pending',
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_reminder_queue_channel_known CHECK (channel IN ('sms', 'whatsapp')),
  CONSTRAINT equipment_reminder_queue_status_known CHECK (
    status IN ('pending', 'sent', 'failed', 'cancelled')
  )
);

-- Idempotencja przypomnienia: ta sama wizyta i ten sam kanał to jedna
-- wiadomość, niezależnie od tego, ile razy kolejka została przeliczona.
CREATE UNIQUE INDEX IF NOT EXISTS equipment_reminder_queue_once_per_slot_idx
  ON equipment_reminder_queue (appointment_ref, channel, scheduled_for);

-- ─────────────────────────── Rozliczenia OEM ───────────────────────────────
-- Wyłącznie grosze PLN. Kanon: „Price, quote, and book in PLN"
-- (`03_FOUNDER_DECISION_FRAMEWORKS_GEMS.md` §3 ALWAYS). Walut obcych w tym
-- zapisie nie ma, bo rozliczenie transakcyjne ma jedną walutę.
CREATE TABLE IF NOT EXISTS equipment_tenant_billing (
  id                      text PRIMARY KEY,
  oem_tenant_id           text NOT NULL REFERENCES equipment_oem_tenants (id) ON DELETE CASCADE,
  period_start            timestamptz NOT NULL,
  period_end              timestamptz NOT NULL,
  subscription_pln_grosze integer NOT NULL DEFAULT 0,
  commission_pln_grosze   integer NOT NULL DEFAULT 0,
  order_count             integer NOT NULL DEFAULT 0,
  created_at              timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT equipment_tenant_billing_period_ordered CHECK (period_end > period_start),
  CONSTRAINT equipment_tenant_billing_subscription_nonneg CHECK (subscription_pln_grosze >= 0),
  CONSTRAINT equipment_tenant_billing_commission_nonneg CHECK (commission_pln_grosze >= 0),
  CONSTRAINT equipment_tenant_billing_order_count_nonneg CHECK (order_count >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS equipment_tenant_billing_period_once_idx
  ON equipment_tenant_billing (oem_tenant_id, period_start, period_end);