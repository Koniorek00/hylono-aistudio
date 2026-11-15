/**
 * [DECISION: 2026-10-15] Moduł 3 — kolejka przypomnień wysyłanych 24 h przed
 * wizytą (SMS / WhatsApp) z linkiem do materiału instruktażowego.
 *
 * [DECISION: 2026-10-15] PROWENCJA. Mandat Modułu 3 wskazuje Sąd Apelacyjny
 * w Warszawie, sygnatury I ACa 665/14 oraz V ACa 119/18, jako źródło
 * wymogu udokumentowania dostępu do informacji instruktażowej przed zgodą.
 * Ten plik realizuje wyłącznie część transportową: wylicza termin i odkłada
 * wiadomość w kolejce. Nie interpretuje treści orzeczeń i nie wyciąga z
 * nich wniosków prawnych.
 *
 * [DECISION: 2026-10-15] ROZDZIELENIE CELÓW jest typowe, nie stylistyczne.
 * Przypomnienie transakcyjne o nadchodzącej, umówionej usłudze i wiadomość
 * marketingowa to dwa różne obowiązki, dlatego `purpose` jest częścią typu wejścia,
 * a nie opcjonalną etykietą. Przypomnienie serwisowe nie wymaga dodatkowej zgody
 * marketingowej. Wiadomość marketingowa wymaga zgody, której TEN MODUŁ NIE
 * SPRAWDZA — pola `marketingConsentRef` jest tylko odesłaniem do decyzji podjętej
 * w warstwie zamówienia. Bramkowanie zgody należy do warstwy zamówienia i do
 * warstwy health, nie tutaj; udaje się, że tu jest sprawdzane, byłoby fałszywym
 * zapewnieniem.
 *
 * [DECISION: 2026-10-15] `appointmentRef` jest ODPORNIKIEM wizyty, nie
 * identyfikatorem osoby. Numer telefonu odbiorcy należy do warstwy
 * komunikacyjnej i pojawia się dopiero przy wysyłce, poza tym plikiem.
 */

import { payloadHash, recordId } from '../shared/ids';

/**
 * [DECISION: 2026-10-15] Wyprzedzenie przypomnienia: dokładnie 24 h.
 * Nazwana stała, bo jest to wartość z mandatu, a nie parametr do strojenia.
 */
export const REMINDER_LEAD_HOURS = 24;

const MS_PER_HOUR = 3_600_000;
const MS_PER_MINUTE = 60_000;

export const REMINDER_CHANNELS = ['sms', 'whatsapp'] as const;
export type ReminderChannel = (typeof REMINDER_CHANNELS)[number];

export const REMINDER_PURPOSES = ['service', 'marketing'] as const;
export type ReminderPurpose = (typeof REMINDER_PURPOSES)[number];

export type ReminderInputBase = {
  readonly appointmentRef: string;
  readonly channel: ReminderChannel;
  readonly templateId: string;
  /** Znacznik czasu wizyty, ISO 8601 z przesunięciem. */
  readonly appointmentAt: string;
  /** Znacznik czasu planowania, ISO 8601 z przesunięciem. */
  readonly now: string;
};

export type ServiceReminderInput = ReminderInputBase & {
  readonly purpose: 'service';
};

export type MarketingReminderInput = ReminderInputBase & {
  readonly purpose: 'marketing';
  /**
   * Odniesienie do zgody marketingowej. Wymagane w typie, bo bez niego
   * wiadomość marketingowa nie ma podstawy. Ten moduł NIE weryfikuje, czy
   * zgoda istnieje, nie jest wycofana ani dotyczy tego kanału.
   */
  readonly marketingConsentRef: string;
};

export type ScheduleReminderInput = ServiceReminderInput | MarketingReminderInput;

export type ReminderRow = {
  readonly id: string;
  readonly appointmentRef: string;
  readonly channel: ReminderChannel;
  readonly templateId: string;
  readonly purpose: ReminderPurpose;
  /** Wyliczony termin wysyłki — zawsze 24 h przed wizytą. */
  readonly scheduledFor: string;
  readonly status: 'pending';
  readonly sentAt: null;
  /** `null` dla celu serwisowego. */
  readonly marketingConsentRef: string | null;
  /** Cecha bramkowa: czy wysyłka wymaga wykazania podstawy zgody. */
  readonly requiresConsentEvidence: boolean;
  readonly createdAt: string;
};

export type ReminderRejectionCode =
  | 'missing-field'
  | 'invalid-timestamp'
  | 'appointment-too-soon'
  | 'purpose-conflict';

export type ReminderRejection = {
  readonly code: ReminderRejectionCode;
  readonly message: string;
  readonly appointmentRef: string | null;
  readonly channel: ReminderChannel | null;
  readonly requiredLeadMinutes: number;
  /** Ile minut zostało do wizyty w chwili planowania. */
  readonly minutesUntilAppointment: number | null;
};

export class ReminderScheduleRejected extends Error {
  readonly code: ReminderRejectionCode;
  readonly appointmentRef: string | null;
  readonly channel: ReminderChannel | null;
  readonly requiredLeadMinutes: number;
  readonly minutesUntilAppointment: number | null;

  constructor(rejection: ReminderRejection) {
    super(rejection.message);
    this.name = 'ReminderScheduleRejected';
    this.code = rejection.code;
    this.appointmentRef = rejection.appointmentRef;
    this.channel = rejection.channel;
    this.requiredLeadMinutes = rejection.requiredLeadMinutes;
    this.minutesUntilAppointment = rejection.minutesUntilAppointment;
  }
}

const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

function parseIsoWithOffset(value: string, field: string): number {
  if (typeof value !== 'string' || !ISO_WITH_OFFSET.test(value)) {
    throw new ReminderScheduleRejected({
      code: 'invalid-timestamp',
      message: `Odrzucono: pole ${field} musi być znacznikiem ISO 8601 z przesunięciem, otrzymano: ${String(value)}`,
      appointmentRef: null,
      channel: null,
      requiredLeadMinutes: REMINDER_LEAD_HOURS * 60,
      minutesUntilAppointment: null,
    });
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new ReminderScheduleRejected({
      code: 'invalid-timestamp',
      message: `Odrzucono: pole ${field} nie jest poprawną datą, otrzymano: ${String(value)}`,
      appointmentRef: null,
      channel: null,
      requiredLeadMinutes: REMINDER_LEAD_HOURS * 60,
      minutesUntilAppointment: null,
    });
  }
  return parsed;
}

function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes - hours * 60);
  return hours > 0 ? `${String(hours)} h ${String(minutes)} min` : `${String(minutes)} min`;
}

/**
 * Wyliczenie terminu przypomnienia.
 *
 * [DECISION: 2026-10-15] Wyprzedzenie liczone jest na CZASIE ABSOLUTNYM
 * (24 × 3600 000 ms), a nie w kalendarzu. Przy zmianie czasu letniego
 * różnica 24 h to nadal dokładnie 24 h; odejmowanie jednego dnia
 * kalendarzowego dawałoby 23 h albo 25 h i wysłałoby przypomnienie złego dnia.
 */
export function reminderFireTime(appointmentAtIso: string): string {
  const appointmentMs = parseIsoWithOffset(appointmentAtIso, 'appointmentAt');
  return new Date(appointmentMs - REMINDER_LEAD_HOURS * MS_PER_HOUR).toISOString();
}

export type ScheduleReminderResult = {
  readonly scheduledFor: string;
  readonly row: ReminderRow;
  /** `false` przy ponownym wywołaniu dla tej samej pary wizyta + kanał. */
  readonly created: boolean;
  readonly idempotencyKey: string;
  readonly leadHours: number;
  readonly purpose: ReminderPurpose;
};

export type ReminderStore = {
  findByIdempotencyKey(key: string): ReminderRow | null;
  insert(row: ReminderRow): void;
  list(): readonly ReminderRow[];
};

/**
 * Klucz idempotencji zależy od pary wizyta + kanał, nie od szablonu i nie od
 * celu: drugi kanał tej samej wizyty to drugie przypomnienie i musi powstać,
 * a powtórzenie tego samego kanału nie może mnożyć wierszy.
 */
export function reminderIdempotencyKey(appointmentRef: string, channel: ReminderChannel): string {
  return payloadHash(`${appointmentRef}|${channel}`);
}

export function createInMemoryReminderStore(): ReminderStore {
  const rows = new Map<string, ReminderRow>();
  return {
    findByIdempotencyKey: (key) => rows.get(key) ?? null,
    insert: (row) => {
      rows.set(reminderIdempotencyKey(row.appointmentRef, row.channel), row);
    },
    list: () => [...rows.values()],
  };
}

let moduleStore: ReminderStore = createInMemoryReminderStore();

/** Sklep używany, gdy caller nie poda własnego. Procesowy, nie trwały. */
export function defaultReminderStore(): ReminderStore {
  return moduleStore;
}

/** Wyzerowanie sklepu procesowego — potrzebne w testach i przy restarcie. */
export function resetReminderStore(): void {
  moduleStore = createInMemoryReminderStore();
}

function assertNonEmpty(value: string, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ReminderScheduleRejected({
      code: 'missing-field',
      message: `Odrzucono: pole ${field} jest wymagane i nie może być puste`,
      appointmentRef: null,
      channel: null,
      requiredLeadMinutes: REMINDER_LEAD_HOURS * 60,
      minutesUntilAppointment: null,
    });
  }
  return value.trim();
}

function assertChannel(value: string): ReminderChannel {
  const channel = (REMINDER_CHANNELS as readonly string[]).includes(value)
    ? (value as ReminderChannel)
    : null;
  if (channel === null) {
    throw new ReminderScheduleRejected({
      code: 'missing-field',
      message: `Odrzucono: kanał musi być jednym z sms albo whatsapp, otrzymano: ${String(value)}`,
      appointmentRef: null,
      channel: null,
      requiredLeadMinutes: REMINDER_LEAD_HOURS * 60,
      minutesUntilAppointment: null,
    });
  }
  return channel;
}

/**
 * Zakładowanie przypomnienia na 24 h przed wizytą.
 *
 * Gwarancje:
 * - termin liczony na czasie absolutnym, z przesunięciem strefy czasowej,
 * - wiersz nigdy nie powstaje w przeszłości — zamiast tego lecący odrzucenie
 *   z nazwanym powodem,
 * - powtórzenie tej samej pary wizyta + kanał zwraca istniejący wiersz,
 * - zmiana celu przy tej samej parze jest odrzucana, nie po cichu nadpisywana:
 *   wiersz serwisowy nie może zostać podmieniony na marketingowy.
 */
export function scheduleReminder(
  input: ScheduleReminderInput,
  store: ReminderStore = moduleStore,
): ScheduleReminderResult {
  const appointmentRef = assertNonEmpty(input.appointmentRef, 'appointmentRef');
  const channel = assertChannel(input.channel);
  const templateId = assertNonEmpty(input.templateId, 'templateId');
  const appointmentMs = parseIsoWithOffset(input.appointmentAt, 'appointmentAt');
  const nowMs = parseIsoWithOffset(input.now, 'now');
  const scheduledForMs = appointmentMs - REMINDER_LEAD_HOURS * MS_PER_HOUR;

  const minutesUntilAppointment = (appointmentMs - nowMs) / MS_PER_MINUTE;

  if (scheduledForMs < nowMs) {
    throw new ReminderScheduleRejected({
      code: 'appointment-too-soon',
      message:
        `Odrzucono: wizyta jest za blisko, aby zaplanować przypomnienie ` +
        `24 h wcześniej — do wizyty zostało ${formatMinutes(minutesUntilAppointment)}, ` +
        `a wymagane wyprzedzenie to ${String(REMINDER_LEAD_HOURS)} h ` +
        `(wizyta ${appointmentRef}, kanał ${channel}). Wiersz w przeszłości nie powstaje.`,
      appointmentRef,
      channel,
      requiredLeadMinutes: REMINDER_LEAD_HOURS * 60,
      minutesUntilAppointment,
    });
  }

  const purposeLabel: string = String(input.purpose);
  if (!REMINDER_PURPOSES.some((candidate) => candidate === purposeLabel)) {
    throw new ReminderScheduleRejected({
      code: 'missing-field',
      message: `Odrzucono: cel wiadomości musi być serwisowy albo marketingowy, otrzymano: ${purposeLabel}`,
      appointmentRef,
      channel,
      requiredLeadMinutes: REMINDER_LEAD_HOURS * 60,
      minutesUntilAppointment,
    });
  }

  let marketingConsentRef: string | null = null;
  if (input.purpose === 'marketing') {
    marketingConsentRef = assertNonEmpty(input.marketingConsentRef, 'marketingConsentRef');
  }

  const idempotencyKey = reminderIdempotencyKey(appointmentRef, channel);
  const existing = store.findByIdempotencyKey(idempotencyKey);

  if (existing !== null) {
    if (existing.purpose !== input.purpose) {
      throw new ReminderScheduleRejected({
        code: 'purpose-conflict',
        message:
          `Odrzucono: dla wizyty ${appointmentRef} i kanału ${channel} istnieje już kolejka ` +
          `o celu ${existing.purpose}, a wywołanie żąda celu ${input.purpose}. ` +
          'Zmiana celu wymaga jawnego anulowania, nie ponownego planowania.',
        appointmentRef,
        channel,
        requiredLeadMinutes: REMINDER_LEAD_HOURS * 60,
        minutesUntilAppointment,
      });
    }
    return {
      scheduledFor: existing.scheduledFor,
      row: existing,
      created: false,
      idempotencyKey,
      leadHours: REMINDER_LEAD_HOURS,
      purpose: existing.purpose,
    };
  }

  const row: ReminderRow = {
    id: recordId(),
    appointmentRef,
    channel,
    templateId,
    purpose: input.purpose,
    scheduledFor: new Date(scheduledForMs).toISOString(),
    status: 'pending',
    sentAt: null,
    marketingConsentRef,
    requiresConsentEvidence: input.purpose === 'marketing',
    createdAt: input.now,
  };

  store.insert(row);

  return {
    scheduledFor: row.scheduledFor,
    row,
    created: true,
    idempotencyKey,
    leadHours: REMINDER_LEAD_HOURS,
    purpose: row.purpose,
  };
}