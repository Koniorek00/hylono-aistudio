/**
 * Identyfikatory. Deterministyczne tam, gdzie determinizm ma znaczenie
 * (klucz idempotencji — musi być taki sam dla retransmisji tego samego
 * pakietu), losowe tam, gdzie nie ma (identyfikator zlecenia — dwie
 * transakcje nie mogą dostać tego samego).
 */

import { createHash } from 'node:crypto';

/** Klucz idempotencji: ten sam pakiet → ten sam klucz, zawsze. */
export function idempotencyKey(
  deviceSerial: string,
  occurredAtIso: string,
  monotonicCounter: number,
): string {
  return createHash('sha256')
    .update(`${deviceSerial}|${occurredAtIso}|${String(monotonicCounter)}`)
    .digest('hex');
}

/** Skrót ciała pakietu — dowód, że retransmisja niesie te same bajty. */
export function payloadHash(body: string): string {
  return createHash('sha256').update(body, 'utf8').digest('hex');
}

/** Identyfikator rekordu. crypto.randomUUID, nie licznik — brak kolizji między replikami. */
export function recordId(): string {
  return crypto.randomUUID();
}

/**
 * Alfabet BEZ znaków mylących przy czytaniu z telefonu.
 *
 * Pomijamy i, l, o (litery) oraz 0, 1 (cyfry odpowiadające O oraz l/I).
 * Pierwsza wersja używała pełnego alfabetu i generowała kody zawierające
 * "l" — a jej własny komentarz twierdził, że ich nie zawiera. Kod, który
 * czyta się przez telefon do serwisu, musi być jednoznaczny dla człowieka,
 * który go dyktuje.
 */
const ID_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789';

/**
 * Identyfikator krótki, czytelny, bez znaków mylących (bez 0/O, 1/l/I).
 * Używany tam, gdzie identyfikator wchodzi do kodu, który czyta człowiek
 * przy telefonie do serwisu.
 */
export function shortCode(length = 10): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  // Indeksowanie `string` jest bezpieczne: `byte % 36` mieści się w 0–35,
  // a `noUncheckedIndexedAccess` dotyczy indeksów, nie literałów.
  return Array.from(bytes, (byte) => ID_ALPHABET[byte % ID_ALPHABET.length]).join('');
}
