/**
 * [DECISION: 2026-10-15] SCHEMAT WARSTWY HEALTH — POZA GŁÓWNĄ BAZĄ.
 *
 * Mandat: „Osobna, odizolowana warstwa danych w regionie UE, **nie** w głównej
 * bazie". Dlatego tych tabel NIE MA w `lib/db/schema.ts` i NIE MA ich w
 * `equipment_oem_tenants`/`equipment_devices`. Drizzle pozwala zadeklarować
 * schemat `health_overlay` bez tworzenia go — a ten plik jest **kontraktem
 * tego, co istnieje w innej instancji**, nie instrukcją migracji w głównej.
 *
 * Trzy powody, dla których to nie jest gadanie o architekturze:
 *
 * 1. RODO Art. 9 — dane zdrowotne to osobna kategoria. Umieszczenie ich
 *    w tej samej bazie co dane o sprzęcie oznacza, że jedna kopia zapasowa,
 *    jeden dump i jeden eksport do analityki zabierają razem dane, które
 *    prawo rozdziela.
 * 2. Izolacja per-gabinet ma być na poziomie bazy (RLS), nie na poziomie
 *    warstwy aplikacji. Schemat osobnej instancji jest warunkiem, żeby RLS
 *    per-gabinet w ogóle miał sens.
 * 3. Zero-PII w warstwie 1 jest twierdzeniem, które musi dać się MECHANICZNIE
 *    sprawdzić, a nie tylko zadeklarować. `assertNoOverlayReachInLayer1()`
 *    poniżej robi to sprawdzalnym.
 */

import { boolean, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { pgSchema } from 'drizzle-orm/pg-core';

/** Schemat warstwy health — nigdy nie renderowany w głównej bazie. */
export const healthOverlaySchema = pgSchema('health_overlay');

/** Gabinet = tenant warstwy health. Inny podmiot niż tenant OEM. */
export const overlayClinicsTable = healthOverlaySchema.table('overlay_clinics', {
  id: text('id').primaryKey(),
  /** Region przetwarzania — RODO: dane zdrowotne nie opuszczają UE. */
  dataRegion: text('data_region').notNull(),
  /** Szyfrowanie at rest — wymagane, nie opcjonalne. */
  encryptionAtRest: text('encryption_at_rest').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * CZTERY ROZDZIELONE ZGODY. Mandat wymaga osobnych zgód, nie jednego
 * checkboxa — i to jest sedno sprawy: zgoda na profilaktykę nie jest zgodą
 * na kontakt marketingowy. Jeden zapis, jedna flaga `consent` i cztery prawa
 * (zdrowotna, zabiegowa, marketingowa, wizerunkowa) to cztery prawa, których
 * nie da się później rozróżnić przy cofnięciu.
 */
export const overlayConsentRecordsTable = healthOverlaySchema.table('overlay_consent_records', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').notNull(),
  /**
   * ODPORNIK, nie identyfikator osoby. Warstwa 1 używa `sessionToken`;
   * powiązanie z osobą istnieje wyłącznie tutaj i nigdzie indziej.
   */
  subjectRef: text('subject_ref').notNull(),
  consentType: text('consent_type').notNull(),
  granted: boolean('granted').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }),
  withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
  /** Kopia treści, na którą się zgodzono — zmiana treści wymaga nowej zgody. */
  contentVersion: text('content_version').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Rejestr wycofań zgody marketingowej PKE — osobny, bo ma własny cykl życia. */
export const overlayConsentRevocationsTable = healthOverlaySchema.table(
  'overlay_consent_revocations',
  {
    id: text('id').primaryKey(),
    clinicId: text('clinic_id').notNull(),
    subjectRef: text('subject_ref').notNull(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }).notNull(),
    reason: text('reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
);

/** Log dostępu do warstwy health — kto, do czego, kiedy. */
export const overlayAccessLogTable = healthOverlaySchema.table('overlay_access_log', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').notNull(),
  actorRef: text('actor_ref').notNull(),
  accessedAt: timestamp('accessed_at', { withTimezone: true }).notNull(),
  operation: text('operation').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Ankieta kwalifikacyjna — przeciwwskazania. Dane zdrowotne, stąd wyłącznie tutaj. */
export const overlayScreeningTable = healthOverlaySchema.table('overlay_screening', {
  id: text('id').primaryKey(),
  clinicId: text('clinic_id').notNull(),
  subjectRef: text('subject_ref').notNull(),
  /** Odpowiedzi w formie struktury, nie tekstu wolnego — retencja i eksport muszą być możliwe. */
  answers: jsonb('answers').notNull(),
  /** Retencja: 90 dni, potem twarde usunięcie. */
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Ankieta ma retencję wyrażoną w dniach — nie w „miesiącach". */
export const overlayScreeningRetentionDays = 90;

export const overlayRequiredRegion = 'eu';
export const overlayRequiredEncryptionAtRest = 'AES-256';
export const overlayRequiredEncryptionInTransit = 'TLS-1.3';

export type OverlayClinicConfig = {
  readonly dataRegion: string;
  readonly encryptionAtRest: string;
  readonly encryptionInTransit: string;
};

export type OverlayBoundaryErrorKind =
  | 'schema_reachable_from_layer1'
  | 'region_outside_eu'
  | 'weak_encryption_at_rest'
  | 'weak_encryption_in_transit';

export class OverlayBoundaryError extends Error {
  readonly kind: OverlayBoundaryErrorKind;
  readonly detail: string;

  constructor(kind: OverlayBoundaryErrorKind, detail: string) {
    super(`Granica warstwy health naruszona (${kind}): ${detail}`);
    this.name = 'OverlayBoundaryError';
    this.kind = kind;
    this.detail = detail;
  }
}
