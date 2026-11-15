import { neon } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import { drizzle as drizzleNeon, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import { drizzle as drizzlePostgresJs, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env, readRuntimeEnv } from '@/lib/env';
import * as schema from '@/lib/db/schema';
import { applyEquipmentSchema } from '@/lib/equipment/ddl/apply';

type HylonoDatabase =
  | NeonHttpDatabase<typeof schema>
  | PostgresJsDatabase<typeof schema>;

let databaseClient: HylonoDatabase | null = null;
let bootstrapPromise: Promise<void> | null = null;

const resolveConfiguredDatabaseUrl = (): string | undefined =>
  readRuntimeEnv('DATABASE_URL');

const resolveLocalFallbackDatabaseUrl = (): string | undefined => {
  if (!env.POSTGRES_ROOT_PASSWORD) {
    return undefined;
  }

  if (readRuntimeEnv('VERCEL')) {
    return undefined;
  }

  return `postgresql://postgres:${env.POSTGRES_ROOT_PASSWORD}@127.0.0.1:5432/postgres`;
};

const getDatabaseUrl = (): string | undefined =>
  resolveConfiguredDatabaseUrl() ?? resolveLocalFallbackDatabaseUrl();

const isNeonUrl = (databaseUrl: string): boolean => {
  try {
    const host = new URL(databaseUrl).hostname.toLowerCase();
    return host.includes('neon.tech');
  } catch {
    return false;
  }
};

const createDatabaseClient = (databaseUrl: string): HylonoDatabase => {
  if (isNeonUrl(databaseUrl)) {
    const sqlClient = neon(databaseUrl);
    return drizzleNeon({ client: sqlClient, schema });
  }

  const sqlClient = postgres(databaseUrl, {
    max: 1,
    prepare: false,
  });

  return drizzlePostgresJs(sqlClient, { schema });
};

const bootstrapCoreTables = async (db: HylonoDatabase): Promise<void> => {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS contact_inquiries (
      id text PRIMARY KEY,
      ticket_id text NOT NULL UNIQUE,
      name text NOT NULL,
      email text NOT NULL,
      subject text NOT NULL,
      message text NOT NULL,
      phone text,
      company text,
      inquiry_type text NOT NULL,
      submission_hash text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS booking_requests (
      id text PRIMARY KEY,
      booking_ref text NOT NULL UNIQUE,
      name text NOT NULL,
      email text NOT NULL,
      phone text,
      preferred_date text,
      preferred_time text,
      timezone text NOT NULL,
      tech_interest text,
      notes text,
      booking_type text NOT NULL,
      submission_hash text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
      id text PRIMARY KEY,
      email text NOT NULL UNIQUE,
      first_name text,
      source text NOT NULL,
      provider_synced boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS checkout_orders (
      id text PRIMARY KEY,
      order_id text NOT NULL UNIQUE,
      payment_method text NOT NULL,
      email text NOT NULL,
      request_fingerprint text,
      shipping jsonb NOT NULL,
      items jsonb NOT NULL,
      total_cents integer NOT NULL,
      currency text NOT NULL DEFAULT 'pln',
      status text NOT NULL,
      stripe_payment_intent_id text,
      stripe_client_secret text,
      last_error_message text,
      paid_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS rental_applications (
      id text PRIMARY KEY,
      rental_id text NOT NULL UNIQUE,
      user_id text NOT NULL,
      contact jsonb,
      items jsonb NOT NULL,
      term_months integer NOT NULL,
      status text NOT NULL,
      total_monthly_cents integer NOT NULL,
      submission_hash text,
      created_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS stripe_webhook_events (
      id text PRIMARY KEY,
      event_type text NOT NULL,
      stripe_payment_intent_id text,
      order_id text,
      processed_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_service_profiles (
      id text PRIMARY KEY,
      user_id text,
      email text NOT NULL,
      organization_id text NOT NULL,
      person_id text,
      owner_device_ids jsonb,
      role text NOT NULL,
      status text NOT NULL DEFAULT 'active',
      source text NOT NULL DEFAULT 'manual',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_service_notes (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      device_id text NOT NULL,
      visit_id text,
      scope text NOT NULL,
      body text NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_service_todos (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      device_id text NOT NULL,
      title text NOT NULL,
      scope text NOT NULL DEFAULT 'Company',
      assignee_person_id text,
      due_date text,
      priority text NOT NULL DEFAULT 'Medium',
      status text NOT NULL DEFAULT 'open',
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_service_parts_drafts (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      device_id text NOT NULL,
      visit_id text,
      status text NOT NULL DEFAULT 'review-draft',
      lines jsonb NOT NULL,
      line_count integer NOT NULL,
      quantity_total integer NOT NULL,
      total_cents integer NOT NULL DEFAULT 0,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_service_manual_document_links (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      device_id text NOT NULL,
      target_type text,
      target_id text,
      target_label text,
      document_id text NOT NULL,
      document_title text NOT NULL,
      document_source text,
      document_version text,
      document_metadata jsonb,
      review_status text NOT NULL DEFAULT 'linked',
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_service_reports (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      device_id text NOT NULL,
      visit_id text,
      report_id text NOT NULL,
      report_number text NOT NULL,
      final_status text NOT NULL DEFAULT 'owner-ready',
      owner_summary text NOT NULL,
      owner_summary_length integer NOT NULL,
      checklist_count integer NOT NULL DEFAULT 0,
      manual_references jsonb,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_service_manual_extraction_queue (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      device_id text NOT NULL,
      target_type text NOT NULL,
      target_id text NOT NULL,
      target_label text,
      document_id text NOT NULL,
      document_title text NOT NULL,
      document_version text NOT NULL,
      source_ref text,
      packet_kind text,
      visibility text,
      owner_report_label text,
      requested_outcome text NOT NULL,
      extraction_checklist jsonb,
      checklist_count integer NOT NULL DEFAULT 0,
      review_status text NOT NULL DEFAULT 'queued',
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_fleet_service_logs (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      device_id text NOT NULL,
      type text NOT NULL,
      service_date text NOT NULL,
      description text NOT NULL,
      technician text NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_team_handoffs (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      module_name text NOT NULL,
      target_audience text NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_document_packets (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      template_id text NOT NULL,
      category text NOT NULL,
      required boolean NOT NULL,
      client_name_present boolean NOT NULL,
      clinic_name_present boolean NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_supply_requisitions (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      line_count integer NOT NULL,
      total_packs integer NOT NULL,
      approval_only_lines integer NOT NULL,
      status text NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_academy_assignments (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      role_track text NOT NULL,
      module_count integer NOT NULL,
      required_count integer NOT NULL,
      drill_included boolean NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_studio_campaign_handoffs (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      campaign_goal text NOT NULL,
      format text NOT NULL,
      modality text NOT NULL,
      theme text NOT NULL,
      voice text NOT NULL,
      checklist_total integer NOT NULL,
      checklist_complete integer NOT NULL,
      asset_format_count integer NOT NULL,
      qr_enabled boolean NOT NULL,
      logo_included boolean NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS nexus_client_intake_drafts (
      id text PRIMARY KEY,
      organization_id text NOT NULL,
      risk text NOT NULL,
      identity_field_count integer NOT NULL,
      protocol_provided boolean NOT NULL,
      dob_provided boolean NOT NULL,
      next_session_provided boolean NOT NULL,
      preview_only boolean NOT NULL,
      author_user_id text NOT NULL,
      author_person_id text,
      author_email text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now()
    )
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS rental_applications
    ADD COLUMN IF NOT EXISTS contact jsonb
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS contact_inquiries
    ADD COLUMN IF NOT EXISTS submission_hash text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS booking_requests
    ADD COLUMN IF NOT EXISTS submission_hash text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS checkout_orders
    ADD COLUMN IF NOT EXISTS request_fingerprint text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS checkout_orders
    ADD COLUMN IF NOT EXISTS stripe_client_secret text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS checkout_orders
    ADD COLUMN IF NOT EXISTS last_error_message text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS checkout_orders
    ADD COLUMN IF NOT EXISTS paid_at timestamptz
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS checkout_orders
    ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now()
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS rental_applications
    ADD COLUMN IF NOT EXISTS submission_hash text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS nexus_service_profiles
    ADD COLUMN IF NOT EXISTS owner_device_ids jsonb
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS nexus_service_manual_document_links
    ADD COLUMN IF NOT EXISTS target_type text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS nexus_service_manual_document_links
    ADD COLUMN IF NOT EXISTS target_id text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS nexus_service_manual_document_links
    ADD COLUMN IF NOT EXISTS target_label text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS nexus_service_manual_document_links
    ADD COLUMN IF NOT EXISTS document_version text
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS nexus_service_manual_document_links
    ADD COLUMN IF NOT EXISTS document_metadata jsonb
  `);

  await db.execute(sql`
    ALTER TABLE IF EXISTS nexus_service_reports
    ADD COLUMN IF NOT EXISTS manual_references jsonb
  `);

  await db.execute(sql`
    UPDATE nexus_service_manual_document_links
    SET target_type = COALESCE(target_type, 'device'),
      target_id = COALESCE(target_id, device_id),
      document_version = COALESCE(document_version, 'legacy-import')
    WHERE target_type IS NULL OR target_id IS NULL OR document_version IS NULL
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS contact_inquiries_submission_hash_idx
    ON contact_inquiries (submission_hash)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS booking_requests_submission_hash_idx
    ON booking_requests (submission_hash)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS checkout_orders_request_fingerprint_idx
    ON checkout_orders (request_fingerprint)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS rental_applications_submission_hash_idx
    ON rental_applications (submission_hash)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS stripe_webhook_events_payment_intent_idx
    ON stripe_webhook_events (stripe_payment_intent_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_profiles_email_idx
    ON nexus_service_profiles (email)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_profiles_user_id_idx
    ON nexus_service_profiles (user_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_profiles_org_status_idx
    ON nexus_service_profiles (organization_id, status)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_notes_org_created_idx
    ON nexus_service_notes (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_notes_device_idx
    ON nexus_service_notes (organization_id, device_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_notes_visit_idx
    ON nexus_service_notes (organization_id, visit_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_todos_org_created_idx
    ON nexus_service_todos (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_todos_assignee_idx
    ON nexus_service_todos (organization_id, assignee_person_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_todos_scope_idx
    ON nexus_service_todos (organization_id, scope)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_parts_drafts_org_created_idx
    ON nexus_service_parts_drafts (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_parts_drafts_device_idx
    ON nexus_service_parts_drafts (organization_id, device_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_parts_drafts_visit_idx
    ON nexus_service_parts_drafts (organization_id, visit_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_manual_links_org_created_idx
    ON nexus_service_manual_document_links (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_manual_links_device_idx
    ON nexus_service_manual_document_links (organization_id, device_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_manual_links_document_idx
    ON nexus_service_manual_document_links (organization_id, document_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_manual_links_target_idx
    ON nexus_service_manual_document_links (organization_id, target_type, target_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_manual_extraction_queue_org_created_idx
    ON nexus_service_manual_extraction_queue (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_manual_extraction_queue_document_idx
    ON nexus_service_manual_extraction_queue (organization_id, document_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_manual_extraction_queue_target_idx
    ON nexus_service_manual_extraction_queue (organization_id, target_type, target_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_reports_org_created_idx
    ON nexus_service_reports (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_reports_device_idx
    ON nexus_service_reports (organization_id, device_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_reports_visit_idx
    ON nexus_service_reports (organization_id, visit_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_service_reports_report_id_idx
    ON nexus_service_reports (organization_id, report_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_fleet_service_logs_org_created_idx
    ON nexus_fleet_service_logs (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_fleet_service_logs_device_idx
    ON nexus_fleet_service_logs (organization_id, device_id)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_team_handoffs_org_created_idx
    ON nexus_team_handoffs (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_document_packets_org_created_idx
    ON nexus_document_packets (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_supply_requisitions_org_created_idx
    ON nexus_supply_requisitions (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_academy_assignments_org_created_idx
    ON nexus_academy_assignments (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_studio_campaign_handoffs_org_created_idx
    ON nexus_studio_campaign_handoffs (organization_id, created_at DESC)
  `);

  await db.execute(sql`
    CREATE INDEX IF NOT EXISTS nexus_client_intake_drafts_org_created_idx
    ON nexus_client_intake_drafts (organization_id, created_at DESC)
  `);
};

export const isDatabaseConfigured = (): boolean => Boolean(getDatabaseUrl());

export function getDb(): HylonoDatabase {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for conversion API persistence.');
  }

  if (databaseClient) {
    return databaseClient;
  }

  databaseClient = createDatabaseClient(databaseUrl);
  return databaseClient;
}

export async function ensureDatabaseReady(): Promise<void> {
  if (bootstrapPromise) {
    await bootstrapPromise;
    return;
  }

  const db = getDb();
  bootstrapPromise = (async () => {
    await bootstrapCoreTables(db);

    // [DECISION: 2026-10-16] Warstwa Equipment OS stosuje swój DDL w tym samym
    // miejscu, co tabele `nexus_*`: leniwie, przy pierwszym użyciu, w ramach
    // tej samej obietnicy `bootstrapPromise`.
    //
    // Bez tego wywołania `applyEquipmentSchema()` istnieje, ale nikt go nie
    // woła — a pierwsze zapytanie do `equipment_devices` kończy się
    // „relation does not exist". 481 zielonych testów opisywałoby wtedy
    // schemat, którego w bazie nie ma. Kod, którego nikt nie uruchamia,
    // wygląda dokładnie tak samo jak działający — aż do pierwszego wdrożenia.
    //
    // Kolejność ma znaczenie tylko dla komunikatu błędu: tabele `nexus_*` są
    // bootstrapem tego repo sprzed warstwy Equipment OS, więc jeśli one nie
    // wstaną, nie ma sensu próbować stawiać kolejnych.
    // `verify: true` nie jest ozdoba — bez niego `applyEquipmentSchema()`
    // mogłoby "sukcesem" zgłosić stan, w którym część DDL przeszła, a część
    // nie. Domyślnie `verify` wynosi `false`, więc samo wywołanie bez opcji
    // **nie sprawdza** niczego po fakcie: tę wartość trzeba przekazać wprost.
    //
    // Błąd tej warstwy NIE może wywracać bootstrapu całego repo. `ensureDatabaseReady()`
    // jest wspólne dla checkoutu, kontaktu, newslettera, rezerwacji i wszystkich
    // akcji `nexus*` — żadna z nich nie wie o Equipment OS. Wyjątek stąd
    // zabijałby ścieżki, które działały, i to jest dokładnie "zmiana
    // działających ścieżek", której mandat zabrania.
    //
    // Dodatkowo `bootstrapPromise` jest cache'owany: odrzucona obietnica zostaje
    // odrzucona na cały czas procesu. Jedna transientna awaria bazy przy
    // pierwszym kontakcie zamieniałaby wtedy każdą późniejszą trasę w błąd,
    // choć baza już dawno wróciła.
    //
    // Warstwa equipment dostaje więc własny tryb porażki: jawny log z przyczyną,
    // a warstwy korzystające z equipment dostaną swoje istniejące, uczciwe
    // `{ status: 'unavailable', reason: 'database_not_configured' }`. Brak
    // schematu jest stanem, nie wyjatkiem dla reszty aplikacji.
    try {
      await applyEquipmentSchema(db, { verify: true });
    } catch (error) {
      console.error('[eos/schema] Nie udało się zastosować schematu Equipment OS:', error);
    }
  })();
  await bootstrapPromise;
}
