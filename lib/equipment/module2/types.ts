/**
 * Moduł 2 — typy wewnętrzne silnika harmonogramu (Hylono MAIN).
 *
 * Moduł 2 jest jedynym miejscem w produkcie, w którym podwójna rezerwacja
 * kosztuje więcej niż pieniądze: klient stoi przed zamkniętą komorą albo
 * sesja jest przerwana przez sprężarkę, która nie zdążyła ostygnąć.
 * Dlatego każda liczba wpływająca na blokadę zasobu pochodzi z KONFIGURACJI
 * typu obiektowego — nigdy z literału w logice. Zmiana zakresu to zmiana
 * jednej stałej, nie przekopywanie silnika.
 *
 * CZEGO TEN PLIK NIE ROBI: nie zawiera reguły. Reguły żyją w `occupancy.ts`,
 * `scheduler.ts` i `pulse-cycles.ts`; tu są tylko typy i jednostki.
 */

import type { DeviceClass, DeviceModality, SessionVariant } from '../domain/contract';

export const MINUTE_MS = 60_000;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

/** Długość sesji sprzedawanej w ofercie (nie długość blokady zasobu). */
export type NominalSessionMinutes = 30 | 60 | 90;

/**
 * Przedział w minutach. Nazwa „zakres", nie „wartość", bo źródło podaje
 * przedziały (kompresja 8–10 min, dekompresja 5–7 min, realne zajęcie
 * 75–110 min) i wierne zachowanie zakresu jest częścią kontraktu.
 */
export type MinuteRange = {
  readonly min: number;
  readonly max: number;
};

/** Przedział liczby wystąpień w cyklu (np. 2–3 razy w tygodniu). */
export type CountRange = {
  readonly min: number;
  readonly max: number;
};

/** Fazy technologiczne sesji — źródło podaje je jako zakresy, nie jako stałe. */
export type OccupancyPhasesConfig = {
  /** Napełnienie komory i wyrównanie ciśnienia. */
  readonly compressionMinutes: MinuteRange;
  /** Wypuszczanie powietrza i powrót do ciśnienia otoczenia. */
  readonly decompressionMinutes: MinuteRange;
  /** Realne zajęcie maszyny: kompresja + sesja + dekompresja. */
  readonly totalOccupiedMinutes: MinuteRange;
};

/**
 * Bufor technologiczny jako BUDŻET, nie jako N odstępów.
 *
 * Uzasadnienie (operacyjne, nie kliniczne): dezynfekcja, zmiana masek i
 * schładzanie sprężarki wykonują się w tym samym oknie i częściowo się
 * pokrywają. Liczenie ich osobno dawałoby 15 + 10 + 15 = 40 minut blokady
 * po każdej sesji, czego źródło nie obiecuje i czego żaden operator nie
 * umiałby obiecać klientowi. Dlatego to JEDEN budżet sumowany z konfiguracji.
 */
export type BufferBudgetConfig = {
  /** Zmiana masek + schładzanie sprężarki. Nakładany na koniec sesji. */
  readonly techBufferMinutes: number;
  /** Higiena komory. Nakładany tylko dla klas urządzeń, które jej wymagają. */
  readonly disinfectionBufferMinutes: number;
  /** Klasy urządzeń, dla których bufor dezynfekcji ma znaczenie. */
  readonly disinfectionAppliesTo: readonly DeviceClass[];
  /**
   * Odstęp PRZED kompresją. Źródło go nie podaje, więc domyślnie 0 — brak
   * zmyślonej reguły. Pole istnieje, bo tennik może je ustawić jawnie.
   */
  readonly preSessionBufferMinutes: number;
};

/**
 * Blokowanie naprzemienne. Ta sama modalność na tej samej maszynie wymaga
 * przerwy; mandat podaje 48 h dla komory i dla lampy/wodoru.
 */
export type AlternationConfig = {
  readonly minIntervalHours: number;
  /**
   * Od czego liczymy interwał.
   * - `session_start`: między początkami sesji (tak interpretuje źródło).
   * - `occupies_until`: między momentami zwolnienia maszyny — bardziej
   *   zachowawczo, bo uwzględnia kompresję i schładzanie sprężarki.
   */
  readonly intervalFrom: 'session_start' | 'occupies_until';
};

/**
 * Okno cykliczne (w źródle „16/8") — patrz blok DECYZJI niżej.
 *
 * TYP CELOWO ZABLOKOWANY przez `enforcesResourceLock: false`. System typów
 * odrzuci `true` w miejscu kompilacji, więc ta gałąź nie może się rozwinąć
 * w ciche, nieudokumentowane ograniczenie szeregowania.
 */
export type RestCycleConfig = {
  readonly label: string;
  /** Okno aktywności w godzinach. */
  readonly activeHours: number;
  /** Okno przerwy w godzinach. */
  readonly restHours: number;
  /**
   * [DECISION: 2026-10-15] Okno 16/8 jest w tym produkcie parametrem cyklu,
   * a NIE regułą blokowania komory, pomieszczenia, obsługi ani urządzenia.
   *
   * Dlaczego to rozstrzygnięcie nie jest „oczywiste": mandat zalicza 16/8 do
   * parametrów cyklu pulsującego, przez co czytelnik może uznać je za
   * ograniczenie szeregowania („zablokuj komorę na 8 godzin"). Inne materiały
   * źródłowe Hylono definiują 16/8 jako okno przerywanego postu, czyli
   * przerwę posiłkową przypisaną użytkownikowi, a nie konflikt zasobów.
   * Oba odczyty są uzasadnione, więc silnik NIE wybiera po cichu jednego.
   *
   * Rozwiązanie: parametr istnieje, ma nazwę, zakres godzin i dokładnie
   * jedno pole blokujące zachowanie — `enforcesResourceLock`. Jest ono
   * wpisane na literale `false`, więc TypeScript odrzuci `true` przy
   * kompilacji. Silnik nie wyprowadza z tego żadnej blokady `room:`, `staff:`,
   * `device:` ani `mask:`; parametr trafia wyłącznie do opisu planu i na
   * wizualny harmonogram jako oznaczenie. Nie ma w kodzie zaszytego
   * „16 h przerwy po sesji" ani „8 h blokady". Jeśli tennik będzie chciał
   * egzekwować to okno na zasobach, jest to inna funkcja i inna decyzja —
   * wymaga potwierdzenia, zanim powstanie.
   */
  readonly enforcesResourceLock: false;
};

export type SchedulerConfig = {
  readonly occupancy: OccupancyPhasesConfig;
  readonly buffers: BufferBudgetConfig;
  readonly alternation: AlternationConfig;
  /** Liczba zestawów masek blokowanych przez wariant sesji. */
  readonly masksPerDevice: Readonly<Record<SessionVariant, number>>;
  /** Siatka kroków przy szukaniu najwcześniejszego wolnego terminu. */
  readonly slotStepMinutes: number;
  /** Horyzont poszukiwania przy odrzuceniu — po tym silnik przestaje szukać. */
  readonly searchHorizonHours: number;
  /** Strefa używana wyłącznie do grupowania i wyświetlania dni. */
  readonly planningTimeZone: string;
  /** Długości sesji, które silnik przyjmuje. */
  readonly nominalSessionMinutes: readonly NominalSessionMinutes[];
  /** Ile prób przeniesienia ma jedno wystąpienie w cyklu, zanim zostanie odrzucone. */
  readonly maxRelocationAttemptsPerSession: number;
};

/** Klasy urządzeń blokowane przez wariant sesji — używane w komunikatach. */
export const RESOURCE_KINDS = ['room', 'staff', 'device', 'mask'] as const;
export type ResourceKind = (typeof RESOURCE_KINDS)[number];

/**
 * Jedna blokada. `id` jest kluczem stanu (kanoniczny, maszynowy),
 * `sentence` i `busyVerb` wchodzą do komunikatu odrzucenia — po polsku,
 * z poprawną odmianą przez rodzaj, bo „pokój jest zajęta" w komunikacie
 * do operatora kosztuje zaufanie do całego systemu.
 */
export type ResourceLock = {
  readonly kind: ResourceKind;
  readonly id: string;
  readonly label: string;
  readonly sentence: string;
  readonly busyVerb: 'zajęty' | 'zajęta' | 'zajęte';
};

/** Okno blokady. Wszystkie pola są czasem bezwzględnym (ms od epoki). */
export type OccupancyWindow = {
  /** Od kiedy pomieszczenie jest zablokowane (może być przed kompresją). */
  readonly startsAt: Date;
  /** Od kiedy maszyna jest zajęta (start kompresji). */
  readonly sessionStartsAt: Date;
  /** Koniec sesji wraz z dekompresją. */
  readonly sessionEndsAt: Date;
  /** Koniec kompletnej blokady: maszyna, pomieszczenie, obsługa, maski. */
  readonly occupiesUntil: Date;
  readonly compressionMinutes: number;
  readonly nominalMinutes: number;
  readonly decompressionMinutes: number;
  readonly preSessionBufferMinutes: number;
  readonly techBufferMinutes: number;
  readonly disinfectionBufferMinutes: number;
  /** Realne zajęcie maszyny: kompresja + sesja + dekompresja. */
  readonly occupiedMinutes: number;
};

export type Booking = {
  readonly bookingId: string;
  readonly sessionRef: string;
  readonly variant: SessionVariant;
  readonly modality: DeviceModality;
  readonly deviceClass: DeviceClass;
  readonly deviceId: string;
  readonly roomId: string;
  readonly staffId: string;
  readonly maskIds: readonly string[];
  /** Komplet blokad trzymanych przez tę rezerwację. */
  readonly locks: readonly ResourceLock[];
  readonly window: OccupancyWindow;
  readonly seed: number;
  /** Cykl, z którego powstała rezerwacja; null przy rezerwacji jednorazowej. */
  readonly cycleRef: string | null;
  /** Indeks wystąpienia w cyklu, 0-based. */
  readonly cycleIndex: number;
};

/** Wpis stanu: przedział zajętości jednego zasobu. */
export type BusyInterval = {
  readonly start: Date;
  readonly readyAt: Date;
  readonly bookingId: string;
  readonly modality: DeviceModality;
};

/** Ostatnie wystąpienie modalności na maszynie — wejście reguły naprzemiennej. */
export type ModalityUsage = {
  readonly sessionStart: Date;
  readonly occupiesUntil: Date;
};

export type SchedulerState = {
  readonly busy: ReadonlyMap<string, readonly BusyInterval[]>;
  readonly usageByDeviceModality: ReadonlyMap<string, ModalityUsage>;
};

/**
 * Kody odrzuceń. Wszystkie są osiągalne i wszystkie są testowane — kod, do
 * którego nie da się dojść, to dokumentacja, która kłamie.
 * `device_unavailable` wymaga konfiguracji, w której wariant nie blokuje osobnych
 * masek (maska jest wtedy częścią maszyny); przy standardowej konfiguracji
 * pierwszy zgłaszany konflikt dotyczy maski, bo ślad blokady zaczyna się od
 * masek, a operator musi wiedzieć, co trzeba umyć.
 */
export const REJECTION_CODES = [
  'config_invalid',
  'room_unavailable',
  'staff_unavailable',
  'mask_unavailable',
  'device_unavailable',
  'alternating_block',
] as const;
export type RejectionCode = (typeof REJECTION_CODES)[number];

export type RejectionConflict = {
  readonly bookingId: string;
  readonly modality: DeviceModality;
  readonly startsAt: string;
  readonly occupiesUntil: string;
};

/**
 * Odrzucenie jest typowane i zawsze niesie komunikat z nazwą zasobu.
 * Rezerwacja bez powodu nie wraca do operatora — operator nie ma czego poprawić.
 */
export type Rejection = {
  readonly code: RejectionCode;
  readonly message: string;
  readonly resource: ResourceLock;
  readonly conflict: RejectionConflict | null;
  /** Najwcześniejszy termin, w którym to samo żądanie przejdzie. */
  readonly earliestAvailableAt: Date | null;
};

export type BookingRequest = {
  readonly sessionRef: string;
  readonly variant: SessionVariant;
  readonly modality: DeviceModality;
  readonly deviceClass: DeviceClass;
  readonly deviceId: string;
  readonly roomId: string;
  readonly staffId: string;
  readonly nominalMinutes: NominalSessionMinutes;
  /** Początek blokady pomieszczenia; nie musi leżeć na siatce kroków. */
  readonly requestedStart: Date;
  readonly seed: number;
  readonly cycleRef?: string;
  readonly cycleIndex?: number;
};

export type ScheduleSuccess = {
  readonly ok: true;
  readonly booking: Booking;
  readonly state: SchedulerState;
};

export type ScheduleFailure = {
  readonly ok: false;
  readonly rejection: Rejection;
  /** Ten sam obiekt, który przyszedł do wywołania — brak rezerwacji widma. */
  readonly state: SchedulerState;
};

export type ScheduleResult = ScheduleSuccess | ScheduleFailure;

/** Pasmo wizualnego harmonogramu — bufory są widoczne jako osobne pasma. */
export type ScheduleBandPhase =
  | 'pre_session_buffer'
  | 'compression'
  | 'session'
  | 'decompression'
  | 'tech_buffer'
  | 'disinfection';

export type ScheduleBand = {
  readonly bookingId: string;
  readonly phase: ScheduleBandPhase;
  readonly label: string;
  readonly from: Date;
  readonly to: Date;
  readonly resourceIds: readonly string[];
};

export type ScheduleDay = {
  readonly dateKey: string;
  readonly bands: readonly ScheduleBand[];
};

export type VisualSchedule = {
  readonly days: readonly ScheduleDay[];
  readonly rows: readonly string[];
};