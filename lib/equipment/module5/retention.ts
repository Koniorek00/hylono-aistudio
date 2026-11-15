/**
 * [DECISION: 2026-10-15] Moduł 5 — retencja: klienci nieobecni i następny pakiet.
 *
 * Dwie funkcje, obie czyste. Zero IO, zero zegara (czas podaje caller),
 * zero bazy.
 *
 * CENY NIE MA W TYM PLIKU. `nextPackageProposal()` zwraca
 * `pricing.status = 'requires_price_input'` i `pricing.amount` typu `null`
 * — nie da się tam wpisać liczby nawet przypadkiem. Jedyna droga do kwoty
 * to `withOperatorPrice()`, która przyjmuje kwotę podaną przez operatora
 * w groszach (`shared/money-pln.ts`). Wymyślona cena to zmyślony cennik,
 * a zmyślony cennik w panelu klienta to kłamstwo z interfejsem.
 *
 * Identyfikator klienta to `clientRef` — kod, nie nazwa. Warstwa
 * `shared/zero-pii.ts` nie jest tu stosowana: Moduł 5 pracuje na danych
 * o aktywności, a nazwy pól zdrowotnych (`hrv`, `sleep`) należą do
 * warstwy Modułu 4 i mają zostać zastąpione jego pomocnikami.
 */

import { formatPln, plnFromGrosze } from '../shared/money-pln';
import type { PlnGrosze } from '../shared/money-pln';

/** Powyżej tylu dni bez ukończonej sesji klient wraca na listę kontaktu. */
export const REACTIVATION_THRESHOLD_DAYS = 30;

const MS_PER_DAY = 86_400_000;

export type ClientSession = {
  /** Kod klienta, nie imię i nie e-mail. */
  readonly clientRef: string;
  readonly startedAt: string;
  readonly completed: boolean;
};

export type ReactivationCandidate = {
  readonly clientRef: string;
  readonly lastCompletedAt: string;
  readonly daysSinceLastSession: number;
  readonly completedSessionCount: number;
  readonly reason: 'gap_over_threshold';
  readonly nextStep: 'offer_next_package';
};

/**
 * Rozróżnienie liczone w dobach pełnych. Próg 30 dni jest sztywny: 30 dni
 * to nie jest jeszcze „powyżej progu”, 31 już tak. Zaokrąglenie w dół jest
 * tu jedyną uczciwą opcją — zaokrąglenie w górę wysyłałoby wiadomość
 * do klienta, który wrócił w terminie.
 */
export function daysSince(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to)) {
    throw new RangeError(`daty muszą być poprawnym ISO, otrzymano: ${fromIso} / ${toIso}`);
  }
  return Math.floor((to - from) / MS_PER_DAY);
}

function epochMs(value: string | Date, label: string): number {
  const ms = typeof value === 'string' ? Date.parse(value) : value.getTime();
  if (Number.isNaN(ms)) {
    throw new RangeError(`${label} musi być poprawnym ISO, otrzymano: ${String(value)}`);
  }
  return ms;
}

type ClientBucket = {
  lastCompletedAt: string | null;
  lastCompletedMs: number | null;
  completed: number;
};

function bucketByClient(sessions: readonly ClientSession[]): Map<string, ClientBucket> {
  const buckets = new Map<string, ClientBucket>();
  for (const session of sessions) {
    const existing =
      buckets.get(session.clientRef) ?? {
        lastCompletedAt: null,
        lastCompletedMs: null,
        completed: 0,
      };
    if (session.completed) {
      const ms = epochMs(session.startedAt, 'startedAt');
      existing.completed += 1;
      if (existing.lastCompletedMs === null || ms > existing.lastCompletedMs) {
        existing.lastCompletedMs = ms;
        existing.lastCompletedAt = session.startedAt;
      }
    }
    buckets.set(session.clientRef, existing);
  }
  return buckets;
}

/**
 * Klienci bez ukończonej sesji dłużej niż 30 dni. Nieukończone sesje nie
 * wchodzą do obliczania — pobyt w obiekcie bez zakończonego zabiegu nie
 * jest powrotem.
 */
export function clientsDueForReactivation(
  sessions: readonly ClientSession[],
  now: string | Date,
): ReactivationCandidate[] {
  const nowMs = epochMs(now, 'now');
  const due: ReactivationCandidate[] = [];

  for (const [clientRef, bucket] of bucketByClient(sessions)) {
    if (bucket.lastCompletedMs === null || bucket.lastCompletedAt === null) {
      continue;
    }
    const gap = daysSince(bucket.lastCompletedAt, new Date(nowMs).toISOString());
    if (gap > REACTIVATION_THRESHOLD_DAYS) {
      due.push({
        clientRef,
        lastCompletedAt: bucket.lastCompletedAt,
        daysSinceLastSession: gap,
        completedSessionCount: bucket.completed,
        reason: 'gap_over_threshold',
        nextStep: 'offer_next_package',
      });
    }
  }

  return due.sort(
    (a, b) =>
      b.daysSinceLastSession - a.daysSinceLastSession ||
      a.clientRef.localeCompare(b.clientRef),
  );
}

export type RetentionOverview = {
  readonly thresholdDays: number;
  readonly observedClients: number;
  readonly due: readonly ReactivationCandidate[];
  /** Klienci z sesjami, ale bez żadnej ukończonej. */
  readonly withoutCompletedSession: readonly string[];
};

/** Zestawienie dla panelu: kto wraca, kto jeszcze nigdy nie doszedł do celu. */
export function retentionOverview(
  sessions: readonly ClientSession[],
  now: string | Date,
): RetentionOverview {
  const buckets = bucketByClient(sessions);
  const withoutCompletedSession = [...buckets.entries()]
    .filter(([, bucket]) => bucket.lastCompletedAt === null)
    .map(([clientRef]) => clientRef)
    .sort((a, b) => a.localeCompare(b));

  return {
    thresholdDays: REACTIVATION_THRESHOLD_DAYS,
    observedClients: buckets.size,
    due: clientsDueForReactivation(sessions, now),
    withoutCompletedSession,
  };
}

export type ClientSnapshot = {
  readonly clientRef: string;
  readonly completedSessionCount: number;
  readonly lastCompletedAt: string | null;
  readonly daysSinceLastSession: number | null;
};

/**
 * Stan ceny w propozycji. `amount` ma typ `null` — nie `number`, nie
 * opcjonalny. Celowo nie przyjmuje liczby.
 */
export type PriceInputRequired = {
  readonly status: 'requires_price_input';
  readonly source: 'operator_input';
  readonly amount: null;
  readonly currency: null;
  readonly note: string;
};

export type PackageProposal = {
  readonly clientRef: string;
  readonly observed: ClientSnapshot;
  readonly copy: {
    readonly subject: string;
    readonly body: string;
  };
  readonly pricing: PriceInputRequired;
  readonly nextAction: 'operator_enters_price_then_sends';
  readonly requiresHumanReview: true;
};

const PRICE_NOTE = 'Kwota zostaje pusta do czasu wpisania przez operatora.';

const SUBJECT_LINE = 'Kolejny protokół — wróć do rutyny';

const BODY_LINE =
  'Użytkownik wraca po przerwie. Cel propozycji: wsparcie regeneracji i ciągłości rutyny. Cenę wpisuje operator.';

/**
 * Propozycja następnego pakietu. Zawiera to, co da się wyliczyć z danych, i
 * deklaruje brak ceny. Nie zgaduje długości pakietu ani kwoty: obie liczby
 * są decyzją handlową, a nie wnioskiem z danych.
 */
export function nextPackageProposal(client: ClientSnapshot): PackageProposal {
  return {
    clientRef: client.clientRef,
    observed: {
      clientRef: client.clientRef,
      completedSessionCount: client.completedSessionCount,
      lastCompletedAt: client.lastCompletedAt,
      daysSinceLastSession: client.daysSinceLastSession,
    },
    copy: {
      subject: SUBJECT_LINE,
      body: BODY_LINE,
    },
    pricing: {
      status: 'requires_price_input',
      source: 'operator_input',
      amount: null,
      currency: null,
      note: PRICE_NOTE,
    },
    nextAction: 'operator_enters_price_then_sends',
    requiresHumanReview: true,
  };
}

/** Wygoda: propozycja prosto z kandydata na listę kontaktu. */
export function proposalFromCandidate(
  candidate: ReactivationCandidate,
): PackageProposal {
  return nextPackageProposal({
    clientRef: candidate.clientRef,
    completedSessionCount: candidate.completedSessionCount,
    lastCompletedAt: candidate.lastCompletedAt,
    daysSinceLastSession: candidate.daysSinceLastSession,
  });
}

export type PricedProposal = {
  readonly status: 'operator_price_set';
  readonly source: 'operator_input';
  /** Grosze całkowite — konwencja `shared/money-pln.ts`. */
  readonly amount: PlnGrosze;
  readonly formatted: string;
};

/** Propozycja z kwotą wpisaną przez operatora — osobny typ, brak spreadu. */
export type PricedProposalShape = Omit<PackageProposal, 'pricing'> & {
  readonly pricing: PricedProposal;
};

/**
 * Jedyna droga do kwoty: operator podaje liczbę groszy. Ułamek grosza
 * odrzucany jest przez `plnFromGrosze`, bo kwota z resztą na fakturze jest
 * cichym błędem. Pola nie są rozprzestrzeniane, bo `pricing.amount` w
 * propozycji ma typ `null` — spread złożyłby z tego `never`.
 */
export function withOperatorPrice(
  proposal: PackageProposal,
  amount: PlnGrosze,
): PricedProposalShape {
  const grosze = plnFromGrosze(amount, 'cena od operatora');
  return {
    clientRef: proposal.clientRef,
    observed: proposal.observed,
    copy: proposal.copy,
    nextAction: proposal.nextAction,
    requiresHumanReview: proposal.requiresHumanReview,
    pricing: {
      status: 'operator_price_set',
      source: 'operator_input',
      amount: grosze,
      formatted: formatPln(grosze),
    },
  };
}