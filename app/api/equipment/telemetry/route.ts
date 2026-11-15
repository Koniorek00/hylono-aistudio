/**
 * [DECISION: 2026-10-15] Adapter HTTP do Modułu 1. Liść, nie warstwa.
 *
 * Mandat pyta o „ingest zdarzeń (MQTT lub webhook symulowany)". Kontrakt
 * telemetrii istnieje od 2026-10-15 jako typy i walidacja w
 * `lib/equipment/`, ale NIKT nie odbierał tych pakietów z sieci — brakowało
 * adresu, pod którym maszyna w obiekcie wysyła odczyt. Ten plik jest tym
 * adresem.
 *
 * [DECISION: 2026-10-15] Webhook symulowany, a nie MQTT. Powód jest
 * operacyjny, nie stylistyczny: broker MQTT to dodatkowa usługa, która musi
 * działać 24/7, mieć własne poświadczenia per urządzenie i osobną ścieżkę
 * awarii. Telemetria sprzętu, która nie działa, jest gorsza niż brak
 * telemetrii — bo Moduł 1 i Moduł 2 patrzą na licznik godzin i na jego
 * podstawie otwierają zlecenie serwisowe. Najpierw musi działać zwykły
 * HTTPS z podpisem, który da się odtworzyć w teście; broker można dodać
 * później, bo `handleTelemetryIngestRequest` nie wie o istnieniu sieci.
 *
 * [DECISION: 2026-10-15] Podpis HMAC zamiast tokenu bearer — uzasadnienie
 * w nagłówku `lib/equipment/transport/device-signature.ts`. Krótko: sekret
 * należy do maszyny, a nie do człowieka, i nie da się go odwołać, więc
 * kradzież nagłówka musi być nieoperacyjna zamiast znośna.
 *
 * [DECISION: 2026-10-15] Cała logika decyzyjna jest w
 * `lib/equipment/transport/handler.ts`. Ten plik robi trzy rzeczy:
 * czyta surowy tekst, woła handler, zwraca `Response`. Nie zawiera
 * walidacji, nie zawiera limitów i nie zawiera kolejności bramek — bo
 * kolejność bramek, gdyby ją powielać w adapterze, przestałaby być
 * jednym miejscem do przeczytania.
 *
 * Rendering strategy: server-only leaf. Brak `'use client'`, brak
 * komponentu React, brak importu z `next/navigation`. `check-page-decisions`
 * i `check-route-client-boundaries` chodzą po całym `app/`, a ta trasa ma
 * zostać liściem serwerowym: jedynym wejściem jest `POST`, jedynym
 * wyjściem jest JSON, i nic w przeglądarce nie ma tu czego renderować.
 *
 * UWAGA na bufor: `request.text()` buforuje CAŁE ciało w pamięci procesu.
 * Limit rozmiaru, który ma tu zastosowanie, jest w handlerze i liczony na
 * surowym tekście — ale zgodnie z charakterem `Request` w Next.js nie da
 * się ograniczyć odczytu przed buforowaniem. Dlatego limit 256 KB jest
 * ograniczeniem KONWENCJONALNYM dla tej trasy (konfiguracja platformy ma
 * ustawić limit na brzegu), a handler pilnuje go jako ostatnią linię, żeby
 * przekroczony rozmiar nie wszedł do parsowania i do bazy.
 */

import { createTelemetryHandlerDeps, handleTelemetryIngestRequest } from '@/lib/equipment/transport/handler';
import { ingestTelemetryPacket } from '@/lib/equipment/module1/ingest';
import type { IngestDeps } from '@/lib/equipment/module1/ports';

// No `runtime` / `dynamic` segment config here: `cacheComponents` rejects both at
// build time. Route handlers already run on the Node.js runtime by default, and a
// POST-only handler is never prerendered, so behaviour is unchanged.

/**
 * [DECISION: 2026-10-15] Brak eksportu `IngestDeps` z tego pliku.
 *
 * Adapter NIE składa zależności Modułu 1 sam — nie ma tu ani Drizzle, ani
 * zapytania do bazy. Bramki są wstrzykiwane przez `setIngestDeps(...)`, które
 * ma zostać podłączone do warstwy danych Postgres. Do czasu tej podmiany
 * bramka jest JAWNIE niepodłączona: zamiast atrapy udającej zapis, żądanie
 * kończy się czytelnym 503, a nie zapisem, który ginie przy starcie
 * procesu.
 */
let ingestDeps: IngestDeps | null = null;

export function setIngestDeps(deps: IngestDeps | null): void {
  ingestDeps = deps;
}

function diagnostic(code: string, detail: string): void {
  // Numer seryjny NIE trafia do odpowiedzi — do logu też nie w formie
  // surowej, bo logi podrzędnej trasy bywają zbierane przez dostawców
  // zewnętrznych. Kod i opis bez identyfikatora wystarczą do diagnostyki
  // zegara i formatu podpisu.
  console.warn(`[eos/telemetry] device request refused: ${code} — ${detail}`);
}

/**
 * [DECISION: 2026-10-16] Zależności powstają RAZ na moduł, nie na żądanie.
 *
 * Powód jest konkretny i został zmierzony, nie przeczytany z komentarza.
 * `createTelemetryHandlerDeps()` tworzy `createInMemoryDeviceRateLimiter()`,
 * a ten trzyma wiaderka w domknięciu. Odtworzenie go w każdym wywołaniu `POST`
 * dawało świeżą, pustą mapę przy każdym żądaniu, więc **limit tęcza nie
 * działał w ogóle**: 121 podpisanych żądań pod rząd, zero odpowiedzi 429.
 * Limit, który nigdy nie zadziała, jest w kodzie gorszy niż brak limitu —
 * wygląda na ochronę, której nie ma.
 *
 * Podniesienie na poziom modułu jest bezpieczne po obu stronach:
 *
 * - `ingestTelemetryPacket(packet, ingestDeps!)` to domknięcie czytające
 *   zmienną modułową `ingestDeps`, więc `setIngestDeps()` dalej podmienia bramkę
 *   bez potrzeby odtwarzania zależności.
 * - `createEnvDeviceSecretResolver()` przechwytuje **referencję** do
 *   `process.env` i czyta zmienną dopiero w `resolveSecret()`, czyli przy
 *   każdym rozwiązaniu sekretu. Sekrety są więc nadal odczytywane świeżo;
 *   podniesienie nie zamraża ich w momencie importu.
 *
 * Stan limitera jest teraz stanem procesu. To ograniczenie, które trzeba
 * powiedzieć wprost: przy wdrożeniu na więcej niż jednej instancji limit
 * działa per instancja, nie globalnie. Globalny wymaga współdzielonego
 * magazynu, a to decyzja wdrożeniowa, nie poprawka w tym pliku.
 */
const deps = createTelemetryHandlerDeps(
  async (packet: unknown) => ingestTelemetryPacket(packet, ingestDeps!),
  { onDiagnostic: diagnostic },
);

export async function POST(request: Request): Promise<Response> {
  // Brama sprawdzana PRZED odczytem ciała: żądanie, które nie ma gdzie
  // trafić, nie powoduje buforowania w pamięci procesu.
  if (ingestDeps === null) {
    return Response.json(
      {
        status: 'error',
        code: 'ingest_unavailable',
        message: 'Brama telemetrii jest chwilowo niedostępna.',
      },
      { status: 503 },
    );
  }

  const rawBody = await request.text();

  const result = await handleTelemetryIngestRequest(
    {
      method: request.method,
      path: new URL(request.url).pathname,
      rawBody,
      headers: Object.fromEntries(request.headers.entries()),
    },
    deps,
  );

  return Response.json(result.body, {
    status: result.status,
    headers: {
      'cache-control': 'no-store',
      'x-content-type-options': 'nosniff',
    },
  });
}