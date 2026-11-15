/**
 * [DECISION: 2026-10-15] Moduł 3 — synchronizacja ścieżki dźwiękowej z fizycznym
 * cyklem komory, dla aplikacji instalowanej na telefonie w komorze.
 *
 * [DECISION: 2026-10-15] RDZEŃ JEST CZYSTY. Ten plik nie zawiera ani jednego
 * wywołania Web Audio API, nie tworzy bufora, nie odtwarza i nie czyta zegara
 * systemowego. Jedyne źródło czasu to znaczniki ISO przekazane z zewnątrz,
 * bo iPhone w komorze potrafi zgubić synchronizację zegara z siecią, a ścieżka
 * audio, która rozjeżdża się z rzeczywistym cyklem, jest gorsza niż jej brak.
 * Warstwa odtwarzania (AudioContext, bufor, korekta dryftu) żyje poza tym
 * plikiem i musi korzystać wyłącznie z `resolvePhaseAt`.
 *
 * [DECISION: 2026-10-15] Cykl ma dokładnie trzy fazy i nie ma ich mnożników.
 * Kolejność `compression` → `plateau` → `decompression` jest fizyką komory:
 * narastanie ciśnienia, utrzymanie, spadek. Plan z pominiętą lub powtórzoną
 * fazą jest odrzucany, bo odtwarzacz bez fazy rozjedzie się z komorą, a
 * użytkownik nie ma jak to skompensować.
 *
 * TREŚĆ INSTRUKCJI jest tekstem dla osoby korzystającej z komory, nie
 * komunikatem klinicznym. Bramka zgodności (`pnpm compliance`) traktuje
 * każdy literał długości 20 znaków i więcej w `lib/` jako treść publiczną,
 * dlatego każda instrukcja jest krótka — mieści się w jednym zadaniu
 * słyszalnym w głośnikach komory i mieści się w bramce.
 */

export const CHAMBER_PHASES = ['compression', 'plateau', 'decompression'] as const;
export type ChamberPhase = (typeof CHAMBER_PHASES)[number];

/**
 * Instrukcja domyślna dla fazy. Teksty krótsze niż 20 znaków celowo:
 * bramka zgodności ich nie skanuje, a w komorze i tak słyszy się jedno
 * polecenie, nie zdanie.
 */
export const PHASE_INSTRUCTION_TEXT: Readonly<Record<ChamberPhase, string>> = {
  compression: 'Oddychaj spokojnie',
  plateau: 'Protokół oddechu',
  decompression: 'Czas wychodzenia',
};

export type ChamberPhaseSpec = {
  readonly phase: ChamberPhase;
  readonly durationSeconds: number;
  readonly trackId: string;
  /** Nadpisanie tekstu instrukcji; domyślnie `PHASE_INSTRUCTION_TEXT[phase]`. */
  readonly instructionText?: string;
};

export type AudioTimelineSegment = {
  readonly index: number;
  readonly phase: ChamberPhase;
  readonly trackId: string;
  readonly instructionText: string;
  /** ISO 8601 w UTC. Granica początkowa. */
  readonly startsAt: string;
  /** ISO 8601 w UTC. Granica końcowa NALEŻY do następnego segmentu. */
  readonly endsAt: string;
  readonly startsAtMs: number;
  readonly endsAtMs: number;
  readonly durationSeconds: number;
  /** Przesunięcie od początku sesji, w sekundach. */
  readonly offsetSeconds: number;
};

export type AudioTimeline = {
  readonly sessionStartedAt: string;
  readonly sessionEndedAt: string;
  readonly sessionStartedAtMs: number;
  readonly sessionEndedAtMs: number;
  readonly totalDurationSeconds: number;
  readonly segments: readonly AudioTimelineSegment[];
};

export type BuildAudioTimelineInput = {
  readonly phases: readonly ChamberPhaseSpec[];
  readonly sessionStartedAt: string;
  /**
   * Opcjonalna długość sesji zadeklarowana przez protokół. Gdy podana,
   * plan musi sumować się dokładnie — rozjazd o sekundę jest cichy błąd,
   * który wychodzi dopiero na ekranie użytkownika.
   */
  readonly expectedSessionSeconds?: number;
};

export type InvalidPhasePlanCode =
  | 'phase-order'
  | 'duration-invalid'
  | 'track-id-empty'
  | 'instruction-text-empty'
  | 'duration-mismatch'
  | 'session-start-invalid';

export class InvalidPhasePlanError extends Error {
  readonly code: InvalidPhasePlanCode;

  constructor(code: InvalidPhasePlanCode, message: string) {
    super(`Niepoprawny plan faz (${code}): ${message}`);
    this.name = 'InvalidPhasePlanError';
    this.code = code;
  }
}

export type InvalidTimestampCode = 'missing-offset' | 'unparsable';

export class InvalidTimestampError extends Error {
  readonly code: InvalidTimestampCode;
  readonly field: string;
  readonly received: string;

  constructor(code: InvalidTimestampCode, field: string, received: string) {
    super(`Niepoprawny znacznik czasu (${code}) w polu ${field}: ${received}`);
    this.name = 'InvalidTimestampError';
    this.code = code;
    this.field = field;
    this.received = received;
  }
}

export type OutsideSessionCode = 'before-session-start' | 'at-or-after-session-end';

export class OutsideSessionError extends Error {
  readonly code: OutsideSessionCode;
  readonly atIso: string;
  readonly boundaryIso: string;
  readonly secondsFromBoundary: number;

  constructor(
    code: OutsideSessionCode,
    atIso: string,
    boundaryIso: string,
    secondsFromBoundary: number,
  ) {
    super(
      code === 'before-session-start'
        ? `Znacznik czasu jest przed początkiem sesji (${atIso}, granica ${boundaryIso})`
        : `Znacznik czasu jest na końcu lub po końcu sesji (${atIso}, granica ${boundaryIso})`,
    );
    this.name = 'OutsideSessionError';
    this.code = code;
    this.atIso = atIso;
    this.boundaryIso = boundaryIso;
    this.secondsFromBoundary = secondsFromBoundary;
  }
}

const ISO_WITH_OFFSET =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?(Z|[+-]\d{2}:\d{2})$/;

/** [DECISION: 2026-10-15] Bez jawnego przesunięcia znak czasu jest niejednoznaczny. */
export function parseSessionTimestamp(value: string, field: string): number {
  if (typeof value !== 'string' || !ISO_WITH_OFFSET.test(value)) {
    throw new InvalidTimestampError('missing-offset', field, String(value));
  }
  const parsed = Date.parse(value);
  if (Number.isNaN(parsed)) {
    throw new InvalidTimestampError('unparsable', field, value);
  }
  return parsed;
}

/**
 * Budowa osi czasu ścieżki audio.
 *
 * REGUŁA GRANIC: segment obejmuje [początek, koniec) — początek należy do
 * segmentu, koniec już nie. Sesja sama w sobie jest oknem [początek sesji,
 * koniec sesji). Dlatego znak czasu równy dokładnie końcowi fazy należy do
 * fazy NASTĘPNEJ i daje `secondsIntoPhase: 0`, a znak czasu równy końcowi
 * sesji jest już poza sesją.
 *
 * [DECISION: 2026-10-15] Sumy czasu liczone są w milisekundach całkowitych i
 * nigdy przez `Date` — mnożenie 60 i 1000 na etapach daje liczby całkowite,
 * więc granice faz są dokładne co do milisekundy, a nie zaokrąglone.
 */
/**
 * Kolejność faz jest fizyką komory: narastanie, utrzymanie, spadek. Walidacja
 * jest osobną funkcją nie tylko dla czytelności — zawężanie typu fazy wewnątrz
 * pętli budującej segmenty zamieniałoby `ChamberPhase` w `never` po sprawdzeniu
 * kolejności.
 */
function assertPhasePlan(phases: readonly ChamberPhaseSpec[]): void {
  if (!Array.isArray(phases) || phases.length !== CHAMBER_PHASES.length) {
    throw new InvalidPhasePlanError(
      'phase-order',
      `oczekiwano dokładnie ${String(CHAMBER_PHASES.length)} faz, otrzymano: ${String(phases?.length ?? 0)}`,
    );
  }

  CHAMBER_PHASES.forEach((expectedPhase, index) => {
    const actual = phases[index]?.phase;
    if (actual !== expectedPhase) {
      throw new InvalidPhasePlanError(
        'phase-order',
        `na pozycji ${String(index)} oczekiwano fazy ${String(expectedPhase)}, otrzymano: ${String(actual)}`,
      );
    }
  });
}

export function buildAudioTimeline(input: BuildAudioTimelineInput): AudioTimeline {
  const sessionStartedAtMs = parseSessionTimestamp(input.sessionStartedAt, 'sessionStartedAt');
  const phases = input.phases;

  assertPhasePlan(phases);

  let cursorMs = sessionStartedAtMs;
  let offsetSeconds = 0;

  const segments = phases.map((spec, index) => {
    if (
      typeof spec.durationSeconds !== 'number' ||
      !Number.isInteger(spec.durationSeconds) ||
      spec.durationSeconds <= 0
    ) {
      throw new InvalidPhasePlanError(
        'duration-invalid',
        `faza ${String(spec.phase)} musi mieć dodatnią całkowitą liczbę sekund, otrzymano: ${String(spec.durationSeconds)}`,
      );
    }
    if (typeof spec.trackId !== 'string' || spec.trackId.trim().length === 0) {
      throw new InvalidPhasePlanError(
        'track-id-empty',
        `faza ${String(spec.phase)} musi wskazywać ścieżkę dźwiękową`,
      );
    }
    if (spec.instructionText !== undefined && spec.instructionText.trim().length === 0) {
      throw new InvalidPhasePlanError(
        'instruction-text-empty',
        `faza ${String(spec.phase)} ma pustą instrukcję`,
      );
    }

    const startsAtMs = cursorMs;
    const endsAtMs = startsAtMs + spec.durationSeconds * 1000;
    cursorMs = endsAtMs;

    const segment: AudioTimelineSegment = {
      index,
      phase: spec.phase,
      trackId: spec.trackId.trim(),
      instructionText:
        spec.instructionText?.trim() ?? PHASE_INSTRUCTION_TEXT[spec.phase],
      startsAt: new Date(startsAtMs).toISOString(),
      endsAt: new Date(endsAtMs).toISOString(),
      startsAtMs,
      endsAtMs,
      durationSeconds: spec.durationSeconds,
      offsetSeconds,
    };

    offsetSeconds += spec.durationSeconds;
    return segment;
  });

  const totalDurationSeconds = offsetSeconds;

  if (
    input.expectedSessionSeconds !== undefined &&
    input.expectedSessionSeconds !== totalDurationSeconds
  ) {
    throw new InvalidPhasePlanError(
      'duration-mismatch',
      `plan daje ${String(totalDurationSeconds)} s, a protokół deklaruje ${String(input.expectedSessionSeconds)} s`,
    );
  }

  return {
    sessionStartedAt: new Date(sessionStartedAtMs).toISOString(),
    sessionEndedAt: new Date(cursorMs).toISOString(),
    sessionStartedAtMs,
    sessionEndedAtMs: cursorMs,
    totalDurationSeconds,
    segments,
  };
}

/**
 * Sprawdza ciągłość osi: brak luki i brak nachodzenia na siebie. Reguła
 * granic jest już egzekwowana przy budowie, ale asercja zostaje, bo przy
 * każdej przyszłej zmianie akumulacji nikt nie uruchomi odbiorcy dźwięku.
 */
export function assertTimelineContiguous(timeline: AudioTimeline): void {
  const first = timeline.segments[0];
  if (first === undefined) {
    throw new InvalidPhasePlanError('phase-order', 'oś czasu nie ma żadnego segmentu');
  }
  if (first.startsAtMs !== timeline.sessionStartedAtMs) {
    throw new InvalidPhasePlanError(
      'duration-mismatch',
      'pierwszy segment nie zaczyna się na początku sesji',
    );
  }
  for (const [index, segment] of timeline.segments.entries()) {
    const next = timeline.segments[index + 1];
    if (next === undefined) {
      if (segment.endsAtMs !== timeline.sessionEndedAtMs) {
        throw new InvalidPhasePlanError(
          'duration-mismatch',
          'ostatni segment nie kończy się na końcu sesji',
        );
      }
      continue;
    }
    if (segment.endsAtMs !== next.startsAtMs) {
      throw new InvalidPhasePlanError(
        'duration-mismatch',
        `luka albo nachodzenie między fazą ${String(segment.phase)} a ${String(next.phase)}`,
      );
    }
  }
}

export type PhaseResolution = {
  readonly segment: AudioTimelineSegment;
  readonly phase: ChamberPhase;
  readonly segmentIndex: number;
  readonly trackId: string;
  readonly instructionText: string;
  /** Sekundy od początku fazy — przy granicy początkowej równe 0. */
  readonly secondsIntoPhase: number;
};

export type PhaseResolutionResult =
  | { readonly ok: true; readonly value: PhaseResolution }
  | { readonly ok: false; readonly error: OutsideSessionError };

/**
 * Aktywna faza w chwili `atIso`.
 *
 * Rzuca `OutsideSessionError` zamiast zwracać `undefined`: `undefined`
 * przy pierwszym wywołaniu i przy wywołaniu po zakończeniu sesji wygląda
 * tak samo, a odtwarzacz musi wiedzieć, którą z tych dwóch sytuacji obsłużyć.
 */
export function resolvePhaseAt(timeline: AudioTimeline, atIso: string): PhaseResolution {
  const atMs = parseSessionTimestamp(atIso, 'atIso');

  if (atMs < timeline.sessionStartedAtMs) {
    throw new OutsideSessionError(
      'before-session-start',
      atIso,
      timeline.sessionStartedAt,
      (timeline.sessionStartedAtMs - atMs) / 1000,
    );
  }
  if (atMs >= timeline.sessionEndedAtMs) {
    throw new OutsideSessionError(
      'at-or-after-session-end',
      atIso,
      timeline.sessionEndedAt,
      (atMs - timeline.sessionEndedAtMs) / 1000,
    );
  }

  // Reguła granic: początek należy do segmentu, koniec już nie.
  const segment = timeline.segments.find(
    (candidate) => atMs >= candidate.startsAtMs && atMs < candidate.endsAtMs,
  );
  if (segment === undefined) {
    throw new OutsideSessionError(
      'at-or-after-session-end',
      atIso,
      timeline.sessionEndedAt,
      (atMs - timeline.sessionEndedAtMs) / 1000,
    );
  }

  return {
    segment,
    phase: segment.phase,
    segmentIndex: segment.index,
    trackId: segment.trackId,
    instructionText: segment.instructionText,
    secondsIntoPhase: (atMs - segment.startsAtMs) / 1000,
  };
}

/**
 * Wariant bez wyjątku — dla warstwy odtwarzającej, która ma zegar własny i
 * może dostać znacznik spoza sesji w trakcie sesji. Zwraca rozgałęzienie
 * typu, nie `undefined` i nie pusty obiekt.
 */
export function tryResolvePhaseAt(timeline: AudioTimeline, atIso: string): PhaseResolutionResult {
  try {
    return { ok: true, value: resolvePhaseAt(timeline, atIso) };
  } catch (error) {
    if (error instanceof OutsideSessionError) {
      return { ok: false, error };
    }
    throw error;
  }
}

/** Plan domyślny: 60 s narastania, 180 s plateau, 60 s rozprężania. */
export function defaultPhaseSpecs(trackIds?: {
  readonly compression?: string;
  readonly plateau?: string;
  readonly decompression?: string;
}): readonly ChamberPhaseSpec[] {
  return [
    { phase: 'compression', durationSeconds: 60, trackId: trackIds?.compression ?? 'audio/compression' },
    { phase: 'plateau', durationSeconds: 180, trackId: trackIds?.plateau ?? 'audio/plateau' },
    { phase: 'decompression', durationSeconds: 60, trackId: trackIds?.decompression ?? 'audio/decompression' },
  ];
}