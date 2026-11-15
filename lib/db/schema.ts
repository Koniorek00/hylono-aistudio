import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export interface CheckoutOrderItemRecord {
  id: string;
  quantity: number;
  unitPriceCents: number;
}

export interface CheckoutShippingRecord {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface RentalItemRecord {
  techId: string;
  quantity: number;
  monthlyPrice: number;
}

export interface RentalContactRecord {
  fullName: string;
  email: string;
  phone?: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  company?: string;
}

export type NexusServiceNoteScope = 'owner-visible' | 'technician-only' | 'company';
export type NexusServiceTodoScope = 'Company' | 'Owner' | 'Technician';
export type NexusServiceTodoStatus = 'open' | 'done';
export type NexusServiceTodoPriority = 'High' | 'Medium' | 'Routine';
export type NexusServicePartsDraftStatus =
  | 'review-draft'
  | 'manager-review'
  | 'approved'
  | 'cancelled';
export type NexusServiceManualDocumentLinkStatus = 'linked' | 'review-needed';
export type NexusServiceManualLinkTargetType = 'device' | 'visit' | 'part';
export type NexusServiceManualExtractionStatus =
  | 'queued'
  | 'in-review'
  | 'owner-safe-draft'
  | 'blocked';
export type NexusServiceReportStatus =
  | 'draft-review'
  | 'owner-ready'
  | 'published'
  | 'cancelled';
export type NexusFleetServiceLogType = 'routine' | 'repair' | 'issue';
export type NexusTeamHandoffModule =
  | 'Safety handoff review'
  | 'Support escalation contact path'
  | 'Client intake readiness';
export type NexusTeamHandoffTarget = 'All' | 'Operators' | 'New hires';
export type NexusDocsTemplateId =
  | 'informed-consent'
  | 'liability-waiver'
  | 'hbot-consent'
  | 'pemf-consent'
  | 'health-intake'
  | 'protocol-agreement';
export type NexusDocsTemplateCategory = 'consent' | 'liability' | 'intake' | 'protocol';
export type NexusSupplyRequisitionStatus = 'Queued' | 'Needs review';
export type NexusAcademyRoleTrack = 'operator' | 'manager' | 'sales';
export type NexusStudioCampaignGoal = 'launch' | 'education' | 'promotion' | 'event';
export type NexusStudioCampaignFormat = 'social-square' | 'social-story' | 'print-poster';
export type NexusStudioModality = 'HBOT' | 'PEMF' | 'RLT' | 'Hydrogen';
export type NexusStudioTheme = 'modern' | 'luxury' | 'bold';
export type NexusStudioVoice = 'balanced' | 'clinical' | 'luxury';
export type NexusClientRiskLevel = 'stable' | 'monitor' | 'high';

export interface NexusServicePartsDraftLineRecord {
  partNumber: string;
  label?: string;
  quantity: number;
  reason?: string;
}

export interface NexusServiceManualDocumentMetadataRecord {
  packetKind?: string;
  visibility?: string;
  sourceRef?: string;
  ownerReportLabel?: string;
  ownerReportEligible?: boolean;
}

export interface NexusServiceOwnerManualReferenceRecord {
  targetType: NexusServiceManualLinkTargetType;
  targetId: string;
  documentId: string;
  documentTitle: string;
  documentVersion: string;
  ownerReportLabel: string;
  reviewStatus: 'Linked' | 'Review needed';
}

export interface NexusServiceManualExtractionChecklistRecord {
  label: string;
}

export const contactInquiriesTable = pgTable('contact_inquiries', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  phone: text('phone'),
  company: text('company'),
  inquiryType: text('inquiry_type').notNull(),
  submissionHash: text('submission_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const bookingRequestsTable = pgTable('booking_requests', {
  id: text('id').primaryKey(),
  bookingRef: text('booking_ref').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  preferredDate: text('preferred_date'),
  preferredTime: text('preferred_time'),
  timezone: text('timezone').notNull(),
  techInterest: text('tech_interest'),
  notes: text('notes'),
  bookingType: text('booking_type').notNull(),
  submissionHash: text('submission_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const newsletterSubscriptionsTable = pgTable('newsletter_subscriptions', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  firstName: text('first_name'),
  source: text('source').notNull(),
  providerSynced: boolean('provider_synced').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const checkoutOrdersTable = pgTable('checkout_orders', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().unique(),
  paymentMethod: text('payment_method').notNull(),
  email: text('email').notNull(),
  requestFingerprint: text('request_fingerprint'),
  shipping: jsonb('shipping').$type<CheckoutShippingRecord>().notNull(),
  items: jsonb('items').$type<CheckoutOrderItemRecord[]>().notNull(),
  totalCents: integer('total_cents').notNull(),
  currency: text('currency').notNull().default('pln'),
  status: text('status').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  stripeClientSecret: text('stripe_client_secret'),
  lastErrorMessage: text('last_error_message'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const rentalApplicationsTable = pgTable('rental_applications', {
  id: text('id').primaryKey(),
  rentalId: text('rental_id').notNull().unique(),
  userId: text('user_id').notNull(),
  contact: jsonb('contact').$type<RentalContactRecord | null>(),
  items: jsonb('items').$type<RentalItemRecord[]>().notNull(),
  termMonths: integer('term_months').notNull(),
  status: text('status').notNull(),
  totalMonthlyCents: integer('total_monthly_cents').notNull(),
  submissionHash: text('submission_hash'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const stripeWebhookEventsTable = pgTable('stripe_webhook_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  orderId: text('order_id'),
  processedAt: timestamp('processed_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusServiceProfilesTable = pgTable('nexus_service_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  email: text('email').notNull(),
  organizationId: text('organization_id').notNull(),
  personId: text('person_id'),
  ownerDeviceIds: jsonb('owner_device_ids').$type<string[] | null>(),
  role: text('role').notNull(),
  status: text('status').notNull().default('active'),
  source: text('source').notNull().default('manual'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusServiceNotesTable = pgTable('nexus_service_notes', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  deviceId: text('device_id').notNull(),
  visitId: text('visit_id'),
  scope: text('scope').$type<NexusServiceNoteScope>().notNull(),
  body: text('body').notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusServiceTodosTable = pgTable('nexus_service_todos', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  deviceId: text('device_id').notNull(),
  title: text('title').notNull(),
  scope: text('scope').$type<NexusServiceTodoScope>().notNull().default('Company'),
  assigneePersonId: text('assignee_person_id'),
  dueDate: text('due_date'),
  priority: text('priority').$type<NexusServiceTodoPriority>().notNull().default('Medium'),
  status: text('status').$type<NexusServiceTodoStatus>().notNull().default('open'),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusServicePartsDraftsTable = pgTable('nexus_service_parts_drafts', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  deviceId: text('device_id').notNull(),
  visitId: text('visit_id'),
  status: text('status').$type<NexusServicePartsDraftStatus>().notNull().default('review-draft'),
  lines: jsonb('lines').$type<NexusServicePartsDraftLineRecord[]>().notNull(),
  lineCount: integer('line_count').notNull(),
  quantityTotal: integer('quantity_total').notNull(),
  totalCents: integer('total_cents').notNull().default(0),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusServiceManualDocumentLinksTable = pgTable(
  'nexus_service_manual_document_links',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull(),
    deviceId: text('device_id').notNull(),
    targetType: text('target_type').$type<NexusServiceManualLinkTargetType>(),
    targetId: text('target_id'),
    targetLabel: text('target_label'),
    documentId: text('document_id').notNull(),
    documentTitle: text('document_title').notNull(),
    documentSource: text('document_source'),
    documentVersion: text('document_version'),
    documentMetadata: jsonb('document_metadata').$type<NexusServiceManualDocumentMetadataRecord | null>(),
    reviewStatus: text('review_status')
      .$type<NexusServiceManualDocumentLinkStatus>()
      .notNull()
      .default('linked'),
    authorUserId: text('author_user_id').notNull(),
    authorPersonId: text('author_person_id'),
    authorEmail: text('author_email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const nexusServiceManualExtractionQueueTable = pgTable(
  'nexus_service_manual_extraction_queue',
  {
    id: text('id').primaryKey(),
    organizationId: text('organization_id').notNull(),
    deviceId: text('device_id').notNull(),
    targetType: text('target_type').$type<NexusServiceManualLinkTargetType>().notNull(),
    targetId: text('target_id').notNull(),
    targetLabel: text('target_label'),
    documentId: text('document_id').notNull(),
    documentTitle: text('document_title').notNull(),
    documentVersion: text('document_version').notNull(),
    sourceRef: text('source_ref'),
    packetKind: text('packet_kind'),
    visibility: text('visibility'),
    ownerReportLabel: text('owner_report_label'),
    requestedOutcome: text('requested_outcome').notNull(),
    extractionChecklist:
      jsonb('extraction_checklist').$type<NexusServiceManualExtractionChecklistRecord[]>(),
    checklistCount: integer('checklist_count').notNull().default(0),
    reviewStatus: text('review_status')
      .$type<NexusServiceManualExtractionStatus>()
      .notNull()
      .default('queued'),
    authorUserId: text('author_user_id').notNull(),
    authorPersonId: text('author_person_id'),
    authorEmail: text('author_email').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  }
);

export const nexusServiceReportsTable = pgTable('nexus_service_reports', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  deviceId: text('device_id').notNull(),
  visitId: text('visit_id'),
  reportId: text('report_id').notNull(),
  reportNumber: text('report_number').notNull(),
  finalStatus: text('final_status')
    .$type<NexusServiceReportStatus>()
    .notNull()
    .default('owner-ready'),
  ownerSummary: text('owner_summary').notNull(),
  ownerSummaryLength: integer('owner_summary_length').notNull(),
  checklistCount: integer('checklist_count').notNull().default(0),
  manualReferences: jsonb('manual_references').$type<NexusServiceOwnerManualReferenceRecord[] | null>(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusFleetServiceLogsTable = pgTable('nexus_fleet_service_logs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  deviceId: text('device_id').notNull(),
  type: text('type').$type<NexusFleetServiceLogType>().notNull(),
  serviceDate: text('service_date').notNull(),
  description: text('description').notNull(),
  technician: text('technician').notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusTeamHandoffsTable = pgTable('nexus_team_handoffs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  moduleName: text('module_name').$type<NexusTeamHandoffModule>().notNull(),
  targetAudience: text('target_audience').$type<NexusTeamHandoffTarget>().notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusDocumentPacketsTable = pgTable('nexus_document_packets', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  templateId: text('template_id').$type<NexusDocsTemplateId>().notNull(),
  category: text('category').$type<NexusDocsTemplateCategory>().notNull(),
  required: boolean('required').notNull(),
  clientNamePresent: boolean('client_name_present').notNull(),
  clinicNamePresent: boolean('clinic_name_present').notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusSupplyRequisitionsTable = pgTable('nexus_supply_requisitions', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  lineCount: integer('line_count').notNull(),
  totalPacks: integer('total_packs').notNull(),
  approvalOnlyLines: integer('approval_only_lines').notNull(),
  status: text('status').$type<NexusSupplyRequisitionStatus>().notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusAcademyAssignmentsTable = pgTable('nexus_academy_assignments', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  roleTrack: text('role_track').$type<NexusAcademyRoleTrack>().notNull(),
  moduleCount: integer('module_count').notNull(),
  requiredCount: integer('required_count').notNull(),
  drillIncluded: boolean('drill_included').notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusStudioCampaignHandoffsTable = pgTable('nexus_studio_campaign_handoffs', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  campaignGoal: text('campaign_goal').$type<NexusStudioCampaignGoal>().notNull(),
  format: text('format').$type<NexusStudioCampaignFormat>().notNull(),
  modality: text('modality').$type<NexusStudioModality>().notNull(),
  theme: text('theme').$type<NexusStudioTheme>().notNull(),
  voice: text('voice').$type<NexusStudioVoice>().notNull(),
  checklistTotal: integer('checklist_total').notNull(),
  checklistComplete: integer('checklist_complete').notNull(),
  assetFormatCount: integer('asset_format_count').notNull(),
  qrEnabled: boolean('qr_enabled').notNull(),
  logoIncluded: boolean('logo_included').notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const nexusClientIntakeDraftsTable = pgTable('nexus_client_intake_drafts', {
  id: text('id').primaryKey(),
  organizationId: text('organization_id').notNull(),
  risk: text('risk').$type<NexusClientRiskLevel>().notNull(),
  identityFieldCount: integer('identity_field_count').notNull(),
  protocolProvided: boolean('protocol_provided').notNull(),
  dobProvided: boolean('dob_provided').notNull(),
  nextSessionProvided: boolean('next_session_provided').notNull(),
  previewOnly: boolean('preview_only').notNull(),
  authorUserId: text('author_user_id').notNull(),
  authorPersonId: text('author_person_id'),
  authorEmail: text('author_email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/* ════════════════════════════════════════════════════════════════════════════
   HYLONO EQUIPMENT OS — Moduł 1 (Zero-PII) + Moduł 2 (Protokół) + Moduł 6 (OEM)
   ════════════════════════════════════════════════════════════════════════════
   [DECISION: 2026-10-15] Wszystkie poniższe tabele należą do warstwy ZERO-PII.
   Jedyna kolumna PII w całej warstwie to `equipment_oem_tenants.contact_email`
   (kontrahent OEM, nie osoba korzystająca). Uzasadnienie: bez adresu
   kontrahenta nie ma do kogo skierować zlecenia ani faktury.

   Konwencja schematu w tym repo: `text` na identyfikatory i `authorEmail`
   notNull() na KAŻDEJ tabeli (nexus_*). Tego ostatniego tu CELOWO nie copied —
   `authorEmail` na tabeli telemetrii oznaczałoby, że każdy wiersz
   przechowuje czyjś e-mail, czyli PII w warstwie, która ma być jej pozbawiona.
   Telemetria jest przypisana do MASZYNY (`device_id`), nie do operatora.

   Warstwa health (Moduł 4/5: zgody, zegarki, HRV) NIE JEST tutaj. Zgodnie
   z mandatem żyje w osobnej, izolowanej instancji w regionie UE — patrz
   `lib/equipment/module4/overlay-schema.ts`.
   ════════════════════════════════════════════════════════════════════════════ */

/** OEM = tenant. Producent lub dystrybutor sprzętu. */
export const equipmentOemTenantsTable = pgTable('equipment_oem_tenants', {
  id: text('id').primaryKey(),
  slug: text('slug').notNull(),
  displayName: text('display_name').notNull(),
  /** JEDYNY PII w warstwie: e-mail kontrahenta OEM. */
  contactEmail: text('contact_email').notNull(),
  /** White-label: nazwa marki, kolory, własna domena. */
  branding: jsonb('branding'),
  status: text('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Urządzenie — paszport techniczny + licznik roboczogodzin. */
export const equipmentDevicesTable = pgTable('equipment_devices', {
  id: text('id').primaryKey(),
  oemTenantId: text('oem_tenant_id').notNull(),
  /** Numer seryjny maszyny. Identyfikator sprzętu, nie osoby. */
  serialNumber: text('serial_number').notNull(),
  modelCode: text('model_code').notNull(),
  modality: text('modality').notNull(),
  deviceClass: text('device_class').notNull(),
  /** Kod obiektu (np. WAW-01-KA). KOD LOKALIZACJI, nie adres. */
  siteRef: text('site_ref').notNull(),
  filterCount: integer('filter_count').notNull().default(0),
  /**
   * LICZNIK AUTORYTATYWNY: czas pracy w SEKUNDACH od ostatniego przegladu.
   *
   * Kolumna godzin nie moze byc zrodlem prawdy. Jest INTEGER godzin, a
   * urzadzenie raportuje w sekundach, wiec tick 1800 s zapisywal sie jako 1 h,
   * a drugie pol godziny przepadalo. Przy krotkich tickach licznik dryfowal
   * W GORE, czyli zlecenie przyspieszalo. W systemie serwityzacji to najdrozszy
   * mozliwy blad: klient dostaje rachunek za przeglad, ktorego maszyna nie
   * potrzebowala, a nikt nie potrafi powiedziec, czy licznik czy technik ma
   * racje. Sekundy likwiduja dryf: przyrost jest suma calkowita, nic nie ginie
   * i tick 1800 s dwa razy daje dokladnie 3600 s.
   *
   * Wiersze istniejace przed ta kolumna maja tu 0 i wymagaja backfillu:
   * `runtime_seconds_since_service = runtime_hours_since_service * 3600`
   * (`secondsFromHours` w `lib/equipment/module1/runtime-counter.ts`).
   * Bez backfillu licznik startuje od zera, a zlecenie opozni sie o pelny mandat.
   */
  runtimeSecondsSinceService: integer('runtime_seconds_since_service').notNull().default(0),
  /**
   * Godziny: WARTOSC POCHODNA, cache do wyswietlania. Logika progu NIGDY nie
   * czyta tej kolumny.
   *
   * Regula: `Math.round(runtimeSecondsSinceService / 3600)`, czyli half-up
   * w gore. W gore dlatego, ze dol odsuwalby zlecenie poza prog.
   *
   * KOSZT TEJ REGULY, jawnie: wyswietlana godzina moze roznic sie od
   * dokladnego momentu o maksymalnie 30 minut. Urzadzenie z 179 h 59 min 30 s
   * pokaze 180 h, mimo ze zlecenie jeszcze nie powstalo, bo 180 h to
   * 648000 s, a stan jest 30 s nizej.
   *
   * Kierunek tego odchylenia jest bezpieczny. Ekran MOZE pokazac 180 h, ale
   * zlecenie NIE wystawi sie wczesniej niz w 648000 s, bo prog liczony jest
   * w sekundach (`evaluateThresholdSeconds`). Odwrotna kolejnosc, czyli
   * zlecenie przed progiem, byla wlasnie tym bledem.
   */
  runtimeHoursSinceService: integer('runtime_hours_since_service').notNull().default(0),
  /** Degradacja przepływu w punktach procentowych; null = brak odczytu. */
  flowDegradationPercent: integer('flow_degradation_percent'),
  status: text('status').notNull().default('active'),
  lastTelemetryAt: timestamp('last_telemetry_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Telemetria. Partycjonowanie po miesiącu robi warstwa DDL, nie ORM. */
export const equipmentTelemetryEventsTable = pgTable('equipment_telemetry_events', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  eventType: text('event_type').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  /** Przyrost czasu pracy w sekundach. */
  runtimeDeltaSeconds: integer('runtime_delta_seconds'),
  /** Anonimowy token sesji. NIE klucz do osoby. */
  sessionToken: text('session_token'),
  sensors: jsonb('sensors'),
  payloadHash: text('payload_hash').notNull(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Klucze idempotencji. Klucz złożony (urządzenie, klucz) — to jedyna
 * struktura, która rozstrzyga wyścig retransmisji w BAZIE, a nie w kodzie.
 * `SELECT` przed `INSERT` to okno, w którym dwa równoległe ingesty oba
 * widzą „brak duplikatu" i oba doliczają godziny.
 */
export const equipmentIngestIdempotencyTable = pgTable('equipment_ingest_idempotency', {
  deviceId: text('device_id').notNull(),
  idempotencyKey: text('idempotency_key').notNull(),
  payloadHash: text('payload_hash').notNull(),
  duplicateCount: integer('duplicate_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Cykl serwisowy — od progu do zamknięcia po przeglądzie. */
export const equipmentServiceIntervalsTable = pgTable('equipment_service_intervals', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  thresholdHours: integer('threshold_hours').notNull(),
  triggerReason: text('trigger_reason').notNull(),
  runtimeHoursAtOrder: integer('runtime_hours_at_order').notNull(),
  openedAt: timestamp('opened_at', { withTimezone: true }).notNull().defaultNow(),
  closedAt: timestamp('closed_at', { withTimezone: true }),
});

/** Zlecenie przeglądu + zestawu filtrów. */
export const equipmentServiceOrdersTable = pgTable('equipment_service_orders', {
  id: text('id').primaryKey(),
  oemTenantId: text('oem_tenant_id').notNull(),
  deviceId: text('device_id').notNull(),
  intervalId: text('interval_id').notNull(),
  runtimeHoursAtOrder: integer('runtime_hours_at_order').notNull(),
  thresholdHours: integer('threshold_hours').notNull(),
  /** Kwota w groszach PLN. CAŁKOWITA — grosze jako integer, nigdy number zmiennoprzecinkowy. */
  orderValuePlnGrosze: integer('order_value_pln_grosze'),
  status: text('status').notNull().default('draft'),
  commissionedAt: timestamp('commissioned_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Kolejka alertowa — zlecenie powstaje w bazie, powiadomienie jest transportem. */
export const equipmentOutboxTable = pgTable('equipment_outbox', {
  id: text('id').primaryKey(),
  oemTenantId: text('oem_tenant_id').notNull(),
  notificationType: text('notification_type').notNull(),
  payload: jsonb('payload').notNull(),
  status: text('status').notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  availableAt: timestamp('available_at', { withTimezone: true }).notNull().defaultNow(),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Moduł 2 — rezerwacja zasobów. Jedna sesja blokuje wiele zasobów naraz. */
export const equipmentProtocolBookingsTable = pgTable('equipment_protocol_bookings', {
  id: text('id').primaryKey(),
  resourceRoom: text('resource_room').notNull(),
  resourceStaff: text('resource_staff').notNull(),
  deviceId: text('device_device_id').notNull(),
  /** single = jedna maska, pair = para na dwie maski. Zmienia zasoby. */
  sessionVariant: text('session_variant').notNull(),
  startsAt: timestamp('starts_at', { withTimezone: true }).notNull(),
  endsAt: timestamp('ends_at', { withTimezone: true }).notNull(),
  /** Do kiedy zasób jest zajęty — obejmuje bufor technologiczny. */
  occupiesUntil: timestamp('occupies_until', { withTimezone: true }).notNull(),
  modality: text('modality').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Moduł 3 — dowód procesowy oglądnięcia materiału.
 * [DECISION: 2026-10-15] `visitRef` jest ODPORNIKIEM, nie identyfikatorem
 * osoby. Materiał instruktażowy jest informacją dla użytkownika; sam fakt
 * obejrzenia materiału nie jest o nim i nie może stać w warstwie, która
 * tak twierdzi. Powiązanie z osobą istnieje tylko w warstwie health (Moduł 4).
 */
export const equipmentWatchEvidenceTable = pgTable('equipment_watch_evidence', {
  id: text('id').primaryKey(),
  visitRef: text('visit_ref').notNull(),
  materialId: text('material_id').notNull(),
  /** Znacznik czasu OBEJRZENIA, nie wysłania linku. */
  watchedAt: timestamp('watched_at', { withTimezone: true }).notNull(),
  /** Procent obejrzanego materiału, 0–100. */
  completionPercent: integer('completion_percent').notNull(),
  /** Zdarzenie send przypisane do wizyty; brak identyfikatora konta. */
  appointmentRef: text('appointment_ref'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Moduł 3 — kolejka wiadomości przypominających (SMS/WhatsApp 24 h przed).
 * `channel` rozdziela SMS od WhatsApp, bo mają różne wymogi prawne
 * (zgoda marketingowa vs. transakcyjna) i różne API.
 */
export const equipmentReminderQueueTable = pgTable('equipment_reminder_queue', {
  id: text('id').primaryKey(),
  appointmentRef: text('appointment_ref').notNull(),
  channel: text('channel').notNull(),
  templateId: text('template_id').notNull(),
  /** 24 h przed wizytą — mandat. */
  scheduledFor: timestamp('scheduled_for', { withTimezone: true }).notNull(),
  status: text('status').notNull().default('pending'),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Moduł 6 — rozliczenie OEM (SaaS + prowizja od zamówień).
 * Wszystko w GROSZACH PLN. Kanon: „Price, quote, and book in PLN" —
 * (`03_FOUNDER_DECISION_FRAMEWORKS_GEMS.md` §3 ALWAYS). Waluty obce w tym
 * zapisie nie występują, bo rozliczenie transakcyjne ma jedną walutę.
 */
export const equipmentTenantBillingTable = pgTable('equipment_tenant_billing', {
  id: text('id').primaryKey(),
  oemTenantId: text('oem_tenant_id').notNull(),
  periodStart: timestamp('period_start', { withTimezone: true }).notNull(),
  periodEnd: timestamp('period_end', { withTimezone: true }).notNull(),
  subscriptionPlnGrosze: integer('subscription_pln_grosze').notNull().default(0),
  commissionPlnGrosze: integer('commission_pln_grosze').notNull().default(0),
  orderCount: integer('order_count').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
