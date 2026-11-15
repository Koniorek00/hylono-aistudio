/**
 * Moduł 2 — silnik blokowania zasobów (scheduler).
 *
 * Jedna sesja blokuje zasoby RAZEM: pomieszczenie, obsługę, maszynę i zestaw
 * masek. Dopiero potem liczy się, czy coś koliduje. Kolejność ma znaczenie:
 * brak blokady pomieszczenia oznacza dwie osoby w jednym gabinecie, a brak
 * blokady maszyny oznacza klienta przed zamkniętą komorą.
 *
 * Wariant sesji ZMIENIA ŚLAD BLOKADY: `single` trzyma jeden zestaw masek,
 * `pair` dwa. To nie kosmetyka — para na jednej masce to druga maska, która
 * musi zostać umyta i wysuszona przed następną rezerwacją, więc jej brak
 * w śladzie blokady oznacza podwójną rezerwację sprzętu.
 *
 * [DECISION: 2026-10-15] Odrzucenie jest odroczone do końca poszukiwania.
 * Silnik NIE przesuwa rezerwacji po cichu: dostaje „chcę tu", nie „daj gdzie
 * poprawnie". Przesuwanie bez zgody klienta zamienia zapisany termin w inny
 * termin, a klient przychodzi o innej godzinie. Zamiast tego zwrot niesie
 * `earliestAvailableAt` — najwcześniejszy termin, w którym to samo żądanie
 * przejdzie. Wywołujący decyduje: potwierdza nowy termin albo odrzuca
 * propozycję. To jedyna granica między silnikiem a rozmową z klientem.
 *
 * REGUŁA NAPRZEMIENNOŚCI: ta sama modalność na tej samej maszynie wymaga przerwy
 * 48 h (mandat: komora i lampa/wodor blokowane naprzemiennie co 48 h). Liczymy
 * MIĘDZY POCZĄTKAMI SESJI — tak brzmi źródło. Wariant `occupies_until` jest
 * dostępny w konfiguracji dla konserwatywnego odczytu (maszyna musi być
 * zwolniona, nie tylko rozpoczęta), ale domyślnie nie jest używany.
 */

import type { DeviceModality, SessionVariant } from '../domain/contract';
import {
  computeOccupancyWindow,
  inspectSessionConfig,
  isNominalMinuteAllowed,
  roundUpToStepMs,
} from './occupancy';
import {
  HOUR_MS,
  MINUTE_MS,
  type Booking,
  type BookingRequest,
  type BusyInterval,
  type ModalityUsage,
  type OccupancyWindow,
  type Rejection,
  type RejectionCode,
  type ResourceKind,
  type ResourceLock,
  type ScheduleBand,
  type ScheduleBandPhase,
  type ScheduleDay,
  type SchedulerConfig,
  type SchedulerState,
  type ScheduleFailure,
  type ScheduleResult,
  type VisualSchedule,
} from './types';

/**
 * Wartości domyślne — jedyne miejsce w module, gdzie występują liczby
 * wynikające z dokumentu mandatu. Reszta silnika czyta je z konfiguracji.
 */
export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  occupancy: {
    compressionMinutes: { min: 8, max: 10 },
    decompressionMinutes: { min: 5, max: 7 },
    totalOccupiedMinutes: { min: 75, max: 110 },
  },
  buffers: {
    techBufferMinutes: 15,
    disinfectionBufferMinutes: 10,
    disinfectionAppliesTo: ['chamber'],
    preSessionBufferMinutes: 0,
  },
  alternation: {
    minIntervalHours: 48,
    intervalFrom: 'session_start',
  },
  masksPerDevice: { single: 1, pair: 2 },
  slotStepMinutes: 5,
  searchHorizonHours: 24 * 21,
  planningTimeZone: 'Europe/Warsaw',
  nominalSessionMinutes: [30, 60, 90],
  maxRelocationAttemptsPerSession: 6,
};

/** Zabezpieczenie przed zapętleniem w poszukiwaniu — nie ograniczenie dziedzinowe. */
const MAX_CURSOR_STEPS = 100_000;

export function emptySchedulerState(): SchedulerState {
  return { busy: new Map(), usageByDeviceModality: new Map() };
}

export function roomResourceId(roomId: string): string {
  return `room:${roomId}`;
}

export function staffResourceId(staffId: string): string {
  return `staff:${staffId}`;
}

export function deviceResourceId(deviceId: string): string {
  return `device:${deviceId}`;
}

export function maskResourceId(deviceId: string, maskNumber: number): string {
  return `mask:${deviceId}#${String(maskNumber)}`;
}

export function alternationKey(deviceId: string, modality: DeviceModality): string {
  return `${deviceId}|${modality}`;
}

const LOCK_TERMS: Readonly<Record<ResourceKind, { readonly label: (id: string) => string; readonly sentence: (id: string) => string; readonly busyVerb: ResourceLock['busyVerb'] }>> = {
  room: {
    label: (id) => `pokój ${id}`,
    sentence: (id) => `Pokój ${id}`,
    busyVerb: 'zajęty',
  },
  staff: {
    label: (id) => `obsługa ${id}`,
    sentence: (id) => `Obsługa ${id}`,
    busyVerb: 'zajęta',
  },
  device: {
    label: (id) => `urządzenie ${id}`,
    sentence: (id) => `Urządzenie ${id}`,
    busyVerb: 'zajęte',
  },
  mask: {
    label: (id) => `zestaw masek ${id}`,
    sentence: (id) => `Zestaw masek ${id}`,
    busyVerb: 'zajęty',
  },
};

function makeLock(kind: ResourceKind, canonicalId: string, displayId: string): ResourceLock {
  const term = LOCK_TERMS[kind];
  return {
    kind,
    id: canonicalId,
    label: term.label(displayId),
    sentence: term.sentence(displayId),
    busyVerb: term.busyVerb,
  };
}

/**
 * Ślad blokady sesji.
 *
 * Kolejność ma znaczenie diagnostyczne. Maski są PRZED maszyną, bo to one
 * trzeba umyć i wysuszyć przed kolejną rezerwacją — komunikat o kolizji ma
 * prowadzić obsługę do czynności, a nie do ogólnej informacji, że „coś jest
 * zajęte". Pokój jest pierwszy, bo jest najczęstszą przyczyną odmowy.
 */
export function buildResourceLocks(
  request: BookingRequest,
  config: SchedulerConfig,
): readonly ResourceLock[] {
  const maskCount = Math.max(0, config.masksPerDevice[request.variant]);
  const locks: ResourceLock[] = [];
  if (request.roomId.length > 0) {
    locks.push(makeLock('room', roomResourceId(request.roomId), request.roomId));
  }
  if (request.staffId.length > 0) {
    locks.push(makeLock('staff', staffResourceId(request.staffId), request.staffId));
  }
  for (let index = 1; index <= maskCount; index += 1) {
    const id = maskResourceId(request.deviceId, index);
    locks.push(makeLock('mask', id, id));
  }
  if (request.deviceId.length > 0) {
    locks.push(makeLock('device', deviceResourceId(request.deviceId), request.deviceId));
  }
  return locks;
}

export function maskIdsForVariant(
  deviceId: string,
  variant: SessionVariant,
  config: SchedulerConfig,
): readonly string[] {
  const maskCount = Math.max(0, config.masksPerDevice[variant]);
  const ids: string[] = [];
  for (let index = 1; index <= maskCount; index += 1) ids.push(maskResourceId(deviceId, index));
  return ids;
}

/** Najwcześniejszy dopuszczalny początek sesji wg reguły naprzemiennej. */
export function alternationEarliestSessionStart(
  state: SchedulerState,
  deviceId: string,
  modality: DeviceModality,
  config: SchedulerConfig,
): Date | null {
  const usage = state.usageByDeviceModality.get(alternationKey(deviceId, modality));
  if (usage === undefined) return null;
  const baseMs =
    config.alternation.intervalFrom === 'occupies_until'
      ? usage.occupiesUntil.getTime()
      : usage.sessionStart.getTime();
  return new Date(baseMs + config.alternation.minIntervalHours * HOUR_MS);
}

/**
 * Kolizje zasobu z oknem `[from, to)`. Przedziały są półotwarte: blokada
 * kończąca się o 10:00 nie koliduje z rezerwacją startującą o 10:00.
 */
export function conflictsFor(
  state: SchedulerState,
  lock: ResourceLock,
  from: Date,
  to: Date,
): readonly BusyInterval[] {
  const list = state.busy.get(lock.id);
  if (list === undefined || list.length === 0) return [];
  const found: BusyInterval[] = [];
  for (const item of list) {
    if (item.start.getTime() < to.getTime() && from.getTime() < item.readyAt.getTime()) found.push(item);
  }
  found.sort((a, b) => a.readyAt.getTime() - b.readyAt.getTime());
  return found;
}

function inspectRequest(request: BookingRequest, config: SchedulerConfig): string | null {
  if (request.sessionRef.length === 0) return 'brak identyfikatora sesji';
  for (const [label, value] of [
    ['pomieszczenia', request.roomId],
    ['obsługi', request.staffId],
    ['urządzenia', request.deviceId],
  ] as const) {
    if (value.length === 0) return `brak identyfikatora ${label}`;
  }
  if (!Number.isFinite(request.requestedStart.getTime())) return 'nieprawidłowy czas rozpoczęcia';
  if (!isNominalMinuteAllowed(config, request.nominalMinutes)) {
    return `długość sesji ${String(request.nominalMinutes)} min jest poza listą dozwolonych`;
  }
  if (!Number.isInteger(request.seed)) return 'ziarno losowania musi być liczbą całkowitą';
  return null;
}

/**
 * Poszukiwanie najwcześniejszego wykonalnego początku powyżej `lowerBoundMs`.
 *
 * Algorytm jest skokowy, nie krokowy: po każdej kolizji przeskakuje do końca
 * najpóźniejszego z blokad, zamiast badać kolejne 5-minutowe siatki. Dzięki
 * temu przesunięcie o tydzień kosztuje kilka iteracji zamiast dwóch tysięcy.
 * W każdej iteracji sprawdzany jest DOKŁADNIE TEN SAM warunek, którego używa
 * `scheduleBooking` — stąd wynika, że termin zwrócony tutaj jest terminem,
 * który `scheduleBooking` zaakceptuje.
 */
function earliestFeasibleStartMs(
  lowerBoundMs: number,
  request: BookingRequest,
  locks: readonly ResourceLock[],
  state: SchedulerState,
  config: SchedulerConfig,
): number | null {
  const alternation = alternationEarliestSessionStart(state, request.deviceId, request.modality, config);
  const alternationMs = alternation === null ? Number.NEGATIVE_INFINITY : alternation.getTime();
  const preMs = Math.max(0, config.buffers.preSessionBufferMinutes) * MINUTE_MS;

  let cursorMs = roundUpToStepMs(lowerBoundMs, config.slotStepMinutes);
  const horizonMs = cursorMs + config.searchHorizonHours * HOUR_MS;

  for (let step = 0; step < MAX_CURSOR_STEPS && cursorMs <= horizonMs; step += 1) {
    const window = computeOccupancyWindow(
      { startsAt: new Date(cursorMs), nominalMinutes: request.nominalMinutes, deviceClass: request.deviceClass, seed: request.seed },
      config,
    );

    let lockJumpMs = -1;
    for (const lock of locks) {
      for (const conflict of conflictsFor(state, lock, window.startsAt, window.occupiesUntil)) {
        if (conflict.readyAt.getTime() > lockJumpMs) lockJumpMs = conflict.readyAt.getTime();
      }
    }

    const alternationOk = window.sessionStartsAt.getTime() >= alternationMs;
    if (alternationOk && lockJumpMs < 0) return cursorMs;

    const floorMs = cursorMs + config.slotStepMinutes * MINUTE_MS;
    const alternationJump = alternationOk
      ? -1
      : roundUpToStepMs(Math.max(alternationMs + preMs, floorMs), config.slotStepMinutes);
    const lockJump = lockJumpMs < 0 ? -1 : roundUpToStepMs(Math.max(lockJumpMs, floorMs), config.slotStepMinutes);
    const nextMs = Math.max(alternationJump, lockJump);
    if (nextMs <= cursorMs) return null;
    cursorMs = nextMs;
  }
  return null;
}

/**
 * Najwcześniejszy termin, w którym to samo żądanie przejdzie.
 * Zwraca `null`, gdy w horyzoncie poszukiwania nie ma wolnego miejsca.
 */
export function earliestAvailableAt(
  request: BookingRequest,
  state: SchedulerState,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
): Date | null {
  const locks = buildResourceLocks(request, config);
  if (locks.length === 0) return null;
  const lowerBoundMs = Math.max(request.requestedStart.getTime(), 0);
  const found = earliestFeasibleStartMs(lowerBoundMs, request, locks, state, config);
  return found === null ? null : new Date(found);
}

function toConflictView(conflict: BusyInterval) {
  return {
    bookingId: conflict.bookingId,
    modality: conflict.modality,
    startsAt: conflict.start.toISOString(),
    occupiesUntil: conflict.readyAt.toISOString(),
  };
}

function earliestSentence(earliestAvailableAt: Date | null): string {
  return earliestAvailableAt === null
    ? ''
    : ` Najwcześniejszy wolny termin: ${earliestAvailableAt.toISOString()}.`;
}

function reject(
  state: SchedulerState,
  code: RejectionCode,
  message: string,
  resource: ResourceLock,
  conflict: BusyInterval | null,
  earliest: Date | null,
): ScheduleFailure {
  const rejection: Rejection = {
    code,
    message,
    resource,
    conflict: conflict === null ? null : toConflictView(conflict),
    earliestAvailableAt: earliest,
  };
  return { ok: false, rejection, state };
}

function commit(
  state: SchedulerState,
  booking: Booking,
): SchedulerState {
  const busy = new Map(state.busy);
  for (const lock of booking.locks) {
    const list = busy.get(lock.id) ?? [];
    busy.set(lock.id, [
      ...list,
      {
        start: booking.window.startsAt,
        readyAt: booking.window.occupiesUntil,
        bookingId: booking.bookingId,
        modality: booking.modality,
      },
    ]);
  }
  const usage = new Map(state.usageByDeviceModality);
  const nextUsage: ModalityUsage = {
    sessionStart: booking.window.sessionStartsAt,
    occupiesUntil: booking.window.occupiesUntil,
  };
  usage.set(alternationKey(booking.deviceId, booking.modality), nextUsage);
  return { busy, usageByDeviceModality: usage };
}

function buildBookingId(request: BookingRequest, window: OccupancyWindow): string {
  return `${request.sessionRef}@${window.startsAt.toISOString()}#${String(request.seed)}`;
}

/**
 * Bilet na rezerwację. Albo `{ ok: true, booking, state }`, albo
 * `{ ok: false, rejection, state }` z tym SAMYM obiektem stanu, który przyszedł
 * w argumencie — brak rezerwacji widma jest własnością kontraktu, nie przypadkiem.
 */
export function scheduleBooking(
  request: BookingRequest,
  state: SchedulerState,
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
): ScheduleResult {
  const deviceLock = makeLock('device', deviceResourceId(request.deviceId), request.deviceId);

  const configIssues = inspectSessionConfig(config);
  if (configIssues.length > 0) {
    return reject(
      state,
      'config_invalid',
      `Konfiguracja silnika jest niespójna, więc urządzenie ${request.deviceId} nie może zostać zablokowane poprawnie: ${configIssues.join('; ')}.`,
      deviceLock,
      null,
      null,
    );
  }

  const requestIssue = inspectRequest(request, config);
  if (requestIssue !== null) {
    return reject(
      state,
      'config_invalid',
      `Żądanie sesji ${request.sessionRef} dla urządzenia ${request.deviceId} jest niepoprawne: ${requestIssue}.`,
      deviceLock,
      null,
      null,
    );
  }

  const locks = buildResourceLocks(request, config);

  const window = computeOccupancyWindow(
    {
      startsAt: request.requestedStart,
      nominalMinutes: request.nominalMinutes,
      deviceClass: request.deviceClass,
      seed: request.seed,
    },
    config,
  );

  // Kolizje zasobów rozpatrywane są w kolejności śladu blokady. Pierwsza
  // znaleziona trafia do komunikatu; `earliestAvailableAt` i tak uwzględnia
  // WSZYSTKIE przeszkody naraz, więc podany termin jest poprawny niezależnie
  // od tego, którą z nich zgłoszono.
  let blockingLock: ResourceLock | null = null;
  let blockingConflict: BusyInterval | null = null;
  for (const lock of locks) {
    const [first] = conflictsFor(state, lock, window.startsAt, window.occupiesUntil);
    if (first !== undefined) {
      blockingLock = lock;
      blockingConflict = first;
      break;
    }
  }

  if (blockingLock !== null && blockingConflict !== null) {
    const earliest = earliestAvailableAt(request, state, config);
    const code: RejectionCode = `${blockingLock.kind}_unavailable`;
    return reject(
      state,
      code,
      `${blockingLock.sentence} jest ${blockingLock.busyVerb} do ${blockingConflict.readyAt.toISOString()} — rezerwacja ${blockingConflict.bookingId} (${blockingConflict.modality}).${earliestSentence(earliest)}`,
      blockingLock,
      blockingConflict,
      earliest,
    );
  }

  const alternation = alternationEarliestSessionStart(state, request.deviceId, request.modality, config);
  if (alternation !== null && window.sessionStartsAt.getTime() < alternation.getTime()) {
    const earliest = earliestAvailableAt(request, state, config);
    return reject(
      state,
      'alternating_block',
      `Urządzenie ${request.deviceId} jest zablokowane przez regułę naprzemienną: modalność ${request.modality} wymaga przerwy ${formatHours(config.alternation.minIntervalHours)} od poprzedniej sesji na tym urządzeniu.${earliestSentence(earliest)}`,
      deviceLock,
      null,
      earliest,
    );
  }

  const booking: Booking = {
    bookingId: buildBookingId(request, window),
    sessionRef: request.sessionRef,
    variant: request.variant,
    modality: request.modality,
    deviceClass: request.deviceClass,
    deviceId: request.deviceId,
    roomId: request.roomId,
    staffId: request.staffId,
    maskIds: maskIdsForVariant(request.deviceId, request.variant, config),
    locks,
    window,
    seed: request.seed,
    cycleRef: request.cycleRef ?? null,
    cycleIndex: request.cycleIndex ?? 0,
  };

  return { ok: true, booking, state: commit(state, booking) };
}

function formatHours(hours: number): string {
  return `${String(hours)} h`;
}

/* ─────────────────── Niezmienniki (używane przez testy właściwościowe) ─────────────────── */

/** Niezmiennik 1: żadne dwa wystąpienia nie dzielą zasobu w nakładających się oknach. */
export function assertNoDoubleBooking(bookings: readonly Booking[]): void {
  const byResource = new Map<string, { start: Date; readyAt: Date; bookingId: string }[]>();
  for (const booking of bookings) {
    for (const lock of booking.locks) {
      const list = byResource.get(lock.id) ?? [];
      for (const existing of list) {
        if (
          booking.window.startsAt.getTime() < existing.readyAt.getTime() &&
          existing.start.getTime() < booking.window.occupiesUntil.getTime()
        ) {
          throw new Error(
            `Podwójna rezerwacja zasobu ${lock.id}: ${booking.bookingId} (${booking.window.startsAt.toISOString()}) koliduje z ${existing.bookingId} (${existing.start.toISOString()}).`,
          );
        }
      }
      list.push({
        start: booking.window.startsAt,
        readyAt: booking.window.occupiesUntil,
        bookingId: booking.bookingId,
      });
      byResource.set(lock.id, list);
    }
  }
}

/**
 * Niezmiennik 2: bufor po sesji jest zawsze dotrzymany.
 * Wymagana długość jest liczona z KONFIGURACJI, nie z okna rezerwacji — okno
 * może kłamać, konfiguracja nie.
 */
export function assertBuffersRespected(
  bookings: readonly Booking[],
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
): void {
  for (const booking of bookings) {
    const disinfection = config.buffers.disinfectionAppliesTo.includes(booking.deviceClass)
      ? config.buffers.disinfectionBufferMinutes
      : 0;
    const required = config.buffers.techBufferMinutes + disinfection;
    const gapMinutes =
      (booking.window.occupiesUntil.getTime() - booking.window.sessionEndsAt.getTime()) / MINUTE_MS;
    if (gapMinutes < required) {
      throw new Error(
        `Bufor po sesji ${booking.bookingId} wynosi ${String(gapMinutes)} min, a konfiguracja wymaga co najmniej ${String(required)} min.`,
      );
    }
  }
}

/** Niezmiennik: realne zajęcie maszyny mieści się w zakresie ze źródła. */
export function assertOccupancyWithinSourceRange(
  bookings: readonly Booking[],
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
): void {
  const { min, max } = config.occupancy.totalOccupiedMinutes;
  for (const booking of bookings) {
    if (booking.window.occupiedMinutes < min || booking.window.occupiedMinutes > max) {
      throw new Error(
        `Zajęcie maszyny ${String(booking.window.occupiedMinutes)} min wychodzi poza zakres źródłowy ${String(min)}–${String(max)} min dla ${booking.bookingId}.`,
      );
    }
  }
}

/** Kanoniczna serializacja — podstawa porównania bajt w bajt w teście determinizmu. */
export function serializeBookings(bookings: readonly Booking[]): string {
  return JSON.stringify(
    bookings.map((booking) => ({
      bookingId: booking.bookingId,
      variant: booking.variant,
      modality: booking.modality,
      deviceId: booking.deviceId,
      roomId: booking.roomId,
      staffId: booking.staffId,
      maskIds: [...booking.maskIds],
      locks: booking.locks.map((lock) => lock.id),
      window: {
        startsAt: booking.window.startsAt.toISOString(),
        sessionStartsAt: booking.window.sessionStartsAt.toISOString(),
        sessionEndsAt: booking.window.sessionEndsAt.toISOString(),
        occupiesUntil: booking.window.occupiesUntil.toISOString(),
        compressionMinutes: booking.window.compressionMinutes,
        nominalMinutes: booking.window.nominalMinutes,
        decompressionMinutes: booking.window.decompressionMinutes,
        techBufferMinutes: booking.window.techBufferMinutes,
        disinfectionBufferMinutes: booking.window.disinfectionBufferMinutes,
        occupiedMinutes: booking.window.occupiedMinutes,
      },
    })),
  );
}

/* ─────────────────────────── Wizualny harmonogram ─────────────────────────── */

const formatterCache = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterCache.get(timeZone);
  if (cached !== undefined) return cached;
  let created: Intl.DateTimeFormat;
  try {
    created = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
  } catch {
    created = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
  }
  formatterCache.set(timeZone, created);
  return created;
}

/**
 * [DECISION: 2026-10-15] Granica doby.
 *
 * Reguła: wszech czas w silniku jest BEZWZGLĘDNY (milisekundy od epoki), a
 * strefa czasowa z konfiguracji służy WYŁĄCZNIE do grupowania i wyświetlania.
 * Sesja zaczynająca się o 23:59 i kończąca o 00:41 jest jednym oknem
 * blokady, które przechodzi przez północ; żadna gałąź kodu nie sprawdza
 * „czy to nowy dzień". Pasem, który wykracza poza lokalną północ, rysowany
 * jest w dwóch rzędach, ale należy do obu dni w podsumowaniu.
 *
 * Konsekwencja dla DST: trwajemy w milisekundach, więc zmiana czasu
 * przesuwa RENDEROWANĄ godzinę lokalną najwyżej o godzinę, a nigdy długość
 * blokady. Dodanie „7 dni" do cyklu liczy 7 × 24 h, więc kotwica tygodnia po
 * zmianie czasu wypada o godzinę później lub wcześniej w zapisie lokalnym —
 * to świadomy wybór: godzina zawsze się powtarza, długość zawsze jest stała.
 *
 * Grupowanie pasm: pasmo należy do dnia, w którym się ZACZYNA. Sesja
 * przechodząca przez lokalną północ pojawia się więc w dwóch rzędach —
 * i to jest właściwe, bo „zajęty do 00:35" trzeba zobaczyć w dniu, w którym
 * klient miał przyjść.
 */
export function localDateTimeParts(date: Date, timeZone: string): { dateKey: string; time: string } {
  const parts = formatterFor(timeZone).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes): string => {
    const found = parts.find((part) => part.type === type);
    return found === undefined ? '00' : found.value;
  };
  return {
    dateKey: `${read('year')}-${read('month')}-${read('day')}`,
    time: `${read('hour')}:${read('minute')}`,
  };
}

const PHASE_LABELS: Readonly<Record<ScheduleBandPhase, string>> = {
  pre_session_buffer: 'bufor przed sesją',
  compression: 'kompresja',
  session: 'sesja',
  decompression: 'dekompresja',
  tech_buffer: 'bufor technologiczny',
  disinfection: 'dezynfekcja',
};

/**
 * Buduje pasma wizualnego harmonogramu. Bufory są OSOBNYMI pasmami — nie
 * dopiskiem do godziny — bo klient pytający „mam być 10:05 czy 10:35"
 * musi zobaczyć, że komora jest zajęta do 10:35.
 */
export function buildVisualSchedule(
  bookings: readonly Booking[],
  config: SchedulerConfig = DEFAULT_SCHEDULER_CONFIG,
): VisualSchedule {
  const bands: ScheduleBand[] = [];
  for (const booking of bookings) {
    const w = booking.window;
    const nominalStartMs = w.sessionStartsAt.getTime() + w.compressionMinutes * MINUTE_MS;
    const nominalEndMs = nominalStartMs + w.nominalMinutes * MINUTE_MS;
    const push = (phase: ScheduleBandPhase, from: Date, to: Date): void => {
      bands.push({
        bookingId: booking.bookingId,
        phase,
        label: PHASE_LABELS[phase],
        from,
        to,
        resourceIds: booking.locks.map((lock) => lock.id),
      });
    };
    if (w.preSessionBufferMinutes > 0) {
      push('pre_session_buffer', w.startsAt, w.sessionStartsAt);
    }
    push('compression', w.sessionStartsAt, new Date(nominalStartMs));
    push('session', new Date(nominalStartMs), new Date(nominalEndMs));
    push('decompression', new Date(nominalEndMs), w.sessionEndsAt);
    if (w.techBufferMinutes > 0) {
      push('tech_buffer', w.sessionEndsAt, new Date(w.sessionEndsAt.getTime() + w.techBufferMinutes * MINUTE_MS));
    }
    if (w.disinfectionBufferMinutes > 0) {
      push(
        'disinfection',
        new Date(w.sessionEndsAt.getTime() + w.techBufferMinutes * MINUTE_MS),
        w.occupiesUntil,
      );
    }
  }

  bands.sort((a, b) => a.from.getTime() - b.from.getTime() || a.to.getTime() - b.to.getTime());

  const byDay = new Map<string, ScheduleBand[]>();
  for (const band of bands) {
    const key = localDateTimeParts(band.from, config.planningTimeZone).dateKey;
    const list = byDay.get(key);
    if (list === undefined) byDay.set(key, [band]);
    else list.push(band);
  }

  const days: ScheduleDay[] = [...byDay.entries()]
    .sort((a, b) => (a[0] < b[0] ? -1 : 1))
    .map(([dateKey, dayBands]) => ({ dateKey, bands: dayBands }));

  const rows: string[] = [];
  for (const day of days) {
    rows.push(day.dateKey);
    for (const band of day.bands) {
      const from = localDateTimeParts(band.from, config.planningTimeZone).time;
      const to = localDateTimeParts(band.to, config.planningTimeZone).time;
      const minutes = (band.to.getTime() - band.from.getTime()) / MINUTE_MS;
      rows.push(
        `  ${from}-${to}  ${band.label.padEnd(20, ' ')} ${String(minutes).padStart(4, ' ')} min  ${band.resourceIds.join(', ')}`,
      );
    }
  }

  return { days, rows };
}