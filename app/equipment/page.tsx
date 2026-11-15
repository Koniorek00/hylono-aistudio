import { connection } from 'next/server';
import { Suspense } from 'react';

import { createPageMetadata } from '@/lib/seo-metadata';
import { resolveFleetThreshold } from '@/lib/equipment/module1/service-threshold';
import {
  SERVICE_THRESHOLD_MAX_HOURS,
  SERVICE_THRESHOLD_MIN_HOURS,
} from '@/lib/equipment/domain/contract';
import { isDatabaseConfigured } from '@/lib/db/client';
import { listEquipmentFleetAction } from '@/src/actions/equipmentFleetActions';
import {
  readEquipmentPanelFleet,
  type EquipmentPanelFleetState,
} from './_lib/equipmentPanelData';
import {
  DegradationLevels,
  FleetTable,
} from './_lib/equipmentPanelView';

// [DECISION: 2026-10-15] Panel OEM Equipment OS — widok floty zero-PII.
// Panel pokazuje wyłącznie stan sprzętu: numer seryjny, model, modalność,
// roboczogodziny, próg, degradację przepływu. Żadnych danych osoby korzystającej
// z urządzenia — bo warstwa 1 ich nie ma i panel nie ma skąd.
// Rendering strategy: server-first rendering with `connection()`; strona nie ma
// stanu klienta, nie pobiera danych w przeglądarce i nie wysyła formularzy.
// Flota pochodzi z `listEquipmentFleetAction()`, wywołanej na serwerze w tym
// samym przebiegu, więc panel nie ma ani pustego stanu klienta, ani danych
// zastępczych.
// Panel OEM jest powierzchnią B2B, nie stroną publiczną — `forceNoIndex`
// wyklucza ją z indeksacji, tak jak pozostałe trasy operacyjne w tym repo.
export const metadata = createPageMetadata({
  title: 'Panel floty — Equipment OS',
  description:
    'Panel operatora OEM: stan floty sprzętu, licznik roboczogodzin, progi przeglądu i zlecenia serwisowe.',
  path: '/equipment',
  forceNoIndex: true,
});

/** Blok „nie ma bazy”. Tekst bez zmian — mówi, czego brakuje i jak to naprawić. */
function DatabaseNotConfiguredNotice() {
  return (
    <p className="mt-3 rounded-xl border border-dashed p-6 opacity-80">
      Baza nie jest skonfigurowana w tym środowisku, więc flota jest pusta. Panel pokazuje
      to wprost, zamiast wyświetlać dane zastępcze. Aby zobaczyć flotę, ustaw{' '}
      <code>DATABASE_URL</code> i zastosuj tabele <code>equipment_*</code>.
    </p>
  );
}

/**
 * Sekcja floty. Każdy wynik ma własny widok — brak wspólnego „pustego” fallbacku,
 * bo to on zamieniał bazę pełną urządzeń w pustą tabelę.
 */
function FleetSection({ fleet }: { readonly fleet: EquipmentPanelFleetState }) {
  return (
    <section aria-labelledby="flota">
      <h2 id="flota" className="text-xl font-medium">
        Flota
      </h2>
      {fleet.kind === 'database_not_configured' ? (
        <DatabaseNotConfiguredNotice />
      ) : fleet.kind === 'unavailable' ? (
        <p className="mt-3 rounded-xl border border-dashed p-6 opacity-80">{fleet.message}</p>
      ) : fleet.kind === 'error' ? (
        <div className="mt-3 rounded-xl border border-dashed p-6">
          <p className="opacity-80">{fleet.message}</p>
          {/* Kod błędu z akcji — bez niego diagnozę trzeba zgadywać. */}
          <p className="mt-2 font-mono text-sm opacity-60">
            Kod błędu: <code>{fleet.code}</code>
          </p>
        </div>
      ) : fleet.kind === 'empty' ? (
        <p className="mt-3 rounded-xl border border-dashed p-6 opacity-80">
          Baza skonfigurowana, brak urządzeń przypisanych do tego operatora.
        </p>
      ) : (
        <FleetTable devices={fleet.devices} />
      )}
    </section>
  );
}

// `cacheComponents` needs request-time work (`connection()`) inside a Suspense
// boundary, otherwise the production build stops at prerender.
export default function EquipmentPanelPage() {
  return (
    <Suspense fallback={null}>
      <EquipmentPanelContent />
    </Suspense>
  );
}

async function EquipmentPanelContent() {
  await connection();

  // [DECISION: 2026-10-15] Konfiguracja progu liczona jest TUTAJ, na serwerze,
  // z jednego źródła. Panel nie duplikuje stałej — gdy zmieni się próg
  // domyślny, panel pokazuje nowy bez zmian w tym pliku.
  const threshold = resolveFleetThreshold(undefined);
  const databaseReady = isDatabaseConfigured();

  // [DECISION: 2026-10-15] Flota jest pytana o WARTOŚĆ, nie zastępowana stałą.
  // Wcześniejsza wersja tego pliku miała twardą stałą pustą listę i przypisywała
  // ją do `fleet` bezwarunkowo: tabela była pusta niezależnie od zawartości bazy,
  // a panel twierdził „brak urządzeń przypisanych do tego operatora”, gdy
  // flota była pełna. Twarda pusta lista obok działającego zapytania to
  // demona, która wygląda jak produkt — dlatego jej tu nie ma, a wynik akcji
  // jest jedynym źródłem wierszy.
  //
  // [DECISION: 2026-10-16] Panel NIE MA uwierzytelnienia i tego nie udaje.
  // `listEquipmentFleetAction()` wymaga sesji: pierwszą bramką akcji jest
  // `auth()` i bez zalogowanego użytkownika zwraca błąd, nigdy listę. `/equipment`
  // nie ma okna logowania, nie czyta nagłówka sesji i nie ma providera, więc
  // dziś zwraca `auth_required`, a po zalogowaniu sesja bez organizacji da
  // `tenant_required`. Panel nie wymyśla sesji ani identyfikatora tenanta —
  // zmyślona sesja pokazałaby cudzą flotę. Do podłączenia floty potrzebne są:
  //   1. uwierzytelnienie na tej trasie (działający provider + `auth()`),
  //   2. profil sesji z `organizationId`, który `getNexusServiceSessionProfile`
  //      odczyta jako tenanta,
  //   3. rola z uprawnieniem `panel:read` (OWNER, OPERATIONS_ADMIN,
  //      SERVICE_MANAGER albo TECHNICIAN).
  // Do czasu tego zmiany panel pokazuje prawdziwy komunikat błędu z kodem,
  // zamiast pustej tabeli udającej, że floty nie ma.
  const fleetResult = await listEquipmentFleetAction();
  const fleet = readEquipmentPanelFleet(fleetResult, databaseReady);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm tracking-widest uppercase opacity-60">Equipment OS</p>
        <h1 className="mt-2 text-3xl font-semibold">Panel floty operatora</h1>
        <p className="mt-2 max-w-2xl opacity-80">
          Warstwa operacyjna sprzętu. Przedstawia wyłącznie dane sprzętu —
          identyfikatory maszyny i obiektu, bez danych osób korzystających
          z urządzenia.
        </p>
      </header>

      <section aria-labelledby="konfiguracja" className="mb-8">
        <h2 id="konfiguracja" className="text-xl font-medium">
          Konfiguracja serwisu
        </h2>
        <dl className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border p-4">
            <dt className="text-sm opacity-70">Próg zamówienia przeglądu</dt>
            <dd className="text-2xl font-semibold">{threshold} h</dd>
          </div>
          <div className="rounded-xl border p-4">
            <dt className="text-sm opacity-70">Dopuszczalny przedział mandatu</dt>
            <dd className="text-2xl font-semibold">
              {SERVICE_THRESHOLD_MIN_HOURS}–{SERVICE_THRESHOLD_MAX_HOURS} h
            </dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="poziomy" className="mb-8">
        <h2 id="poziomy" className="text-xl font-medium">
          Poziomy degradacji przepływu
        </h2>
        <DegradationLevels />
      </section>

      <FleetSection fleet={fleet} />
    </main>
  );
}
