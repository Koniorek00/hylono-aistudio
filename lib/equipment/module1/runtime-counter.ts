/**
 * [DECISION: 2026-10-15] Czysty rachunek czasu pracy. Zero IO, zero zegara,
 * zero bazy. Dlatego wszystkie reguły zaokrąglenia mieszkają tutaj, a nie
 * w `ingest.ts` i nie w implementacji portu.
 *
 * [DECISION: 2026-10-15] LICZNIKIEM AUTORYTATYWNYM SĄ SEKUNDY.
 * `equipment_devices.runtime_seconds_since_service` jest suma całkowita.
 * Godziny są wartością pochodna do wyświetlania.
 *
 * Powód zmiany: kolumna godzin jest INTEGER, a urządzenie raportuje
 * w sekundach. Tick 1800 s zapisywał się jako 1 h, a drugie pół godziny
 * przepadało, więc przy krótkich tickach licznik dryfował W GÓRĘ. Dryf
 * w górę to zlecenie przyspieszone: klient płaci za przegląd, którego
 * maszyna nie potrzebowała, a nikt nie potrafi powiedzieć, czy licznik
 * czy technik ma rację. To najdroższy błąd w systemie serwityzacji.
 * Sekundy likwidują dryf: tick 1800 s dwa razy daje dokładnie 3600 s.
 *
 * Dlaczego nadal jedno miejsce na reguły, skoro sumowanie jest trywialne:
 * granica między sekundami a godzinami musi wystąpić w kodzie DOKŁADNIE RAZ.
 * Jeśli każdy wywołujący przelicza sam, flota zacznie liczyć na trzy sposoby
 * i żaden raport nie będzie się zgadzał z poprzednim. Konwersje w obie
 * strony mają `hoursFromSeconds` i `secondsFromHours`, a nie wywołujący.
 */


import { serviceWarnHours } from '@/lib/equipment/domain/contract';

/** Sekund w godzinie. Nazwa, nie literał — 3600 pojawia się w logach testów. */
export const SECONDS_PER_HOUR = 3600;

/** Stan progu dla podglądu floty. */
export type ThresholdState = {
  readonly warn: boolean;
  readonly due: boolean;
};

function assertNonNegativeFinite(value: number, label: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} musi być skończoną liczbą >= 0, otrzymano: ${String(value)}`);
  }
}

/**
 * Sekundy na godziny. ZAOKRĄGLENIE P????WKOWE W GÓRĘ (half-up).
 *
 * Dlaczego half-up, a nie banker's rounding (half-even):
 *
 *  1. kierunek błędu. Pół godziny przy progu 200 h to 0,25% progu. Zaokrąglenie
 *     w dół oznacza, że zlecenie powstaje PO przekroczeniu progu, a nie przy
 *     nim. Half-even przy 1800 s daje 0 h, przy 5400 s daje 2 h — nierówny
 *     systematyczny błąd w dwie strony przy tej samej ułamkowej części.
 *  2. powtarzalność. `Math.round` to jedyna operacja zaokrąglenia, o której
 *     wszystkie środowiska JS zgadzają się bez zastrzeżeń, a kolumna w bazie
 *     i tak nie przechowuje ułamka. Reguła musi być jedna dla całej floty.
 *
 * Kontrast: half-up przy 1800 s daje 1 h, half-even daje 0 h. Ta różnica jest
 * całą treśćią tego wyboru.
 
 * KOSZT TEJ KONWERSJI, jawnie i bez upiększania: `Math.round` rozjecha się
 * z dokładnym momentem o maksymalnie 30 minut. Stan 647999 s, czyli
 * 179 h 59 min 59 s, wyświetli się jako 180 h. Dlatego ta funkcja NIE SŁUŻY
 * do oceny progu. Do tego jest `evaluateThresholdSeconds`. Godziny są tym,
 * co czyta operator, a nie tym, na czym zapada zlecenie.
*/
export function hoursFromSeconds(seconds: number): number {
  assertNonNegativeFinite(seconds, 'liczba sekund');
  return Math.round(seconds / SECONDS_PER_HOUR);
}

/**
 * Godziny na sekundy. Jedyna strona tej konwersji i odwrotność
 * `hoursFromSeconds` co do wartości, nie co do dokładności wstecznej:
 * `hoursFromSeconds(secondsFromHours(1800))` to 1, a `hoursFromSeconds(1801)`
 * to też 1. Godziny nie potrafią oddać reszty.
 *
 * Używana głównie na potrzeby backfillu wierszy sprzed kolumny sekund, gdzie
 * jedynym dostępnym odczytem były całe godziny, oraz tam, gdzie próg z
 * kontraktu jest podany w godzinach.
 */
export function secondsFromHours(hours: number): number {
  assertNonNegativeFinite(hours, 'liczba godzin');
  return Math.round(hours * SECONDS_PER_HOUR);
}

/**
 * Przyrost licznika w sekundach. DOKŁADNE DODAWANIE, bez zaokrąglenia.
 *
 * To jest reguła, według której liczy się flota. Nie ma tu `Math.round`, bo nie
 * ma tu miejsca na stratę: `deltaSeconds` jest całkowite i `counterSecondsBefore`
 * jest całkowite, więc suma jest całkowita. Dziesięć ticków po 1800 s daje
 * dokładnie 18000 s, a nie 5 h i resztkę, która kiedyś gubiła kolumna godzin.
 *
 * Godziny po tym przyroście są liczone osobno, na potrzeby wyświetlania:
 * `hoursFromSeconds`.
 */
export function projectedSecondsAfter(counterSecondsBefore: number, deltaSeconds: number): number {
  assertNonNegativeFinite(counterSecondsBefore, 'stan licznika w sekundach');
  assertNonNegativeFinite(deltaSeconds, 'przyrost w sekundach');
  return counterSecondsBefore + deltaSeconds;
}

/**
 * [STRATA UDOKUMENTOWANA] Przyrost licznika liczonego w GODZINACH.
 *
 * UWAGA: ta funkcja jest stratna z definicji i nie wolno jej używać do
 * rozstrzygania, czy nadeszła pora na zlecenie. Zaokrągla SUMĘ przy każdym
 * przyroście, więc przy krótkich tickach licznik ucieka w górę: 1800 s dwa
 * razy z rzędu daje tu 2 h, chociaż maszyna pracowała dokładnie godzinę.
 * To jest dokładnie ten dryf, o którym mówi `docs/equipment/README.md`.
 *
 * Zostawiona, bo opisuje regułę stosowaną przez poprzednią wersję Modułu 1,
 * i bo test regresyjny zestawia ją z `projectedSecondsAfter`, żeby udowodnić,
 * że dryf już nie występuje. Ścieżka zlecenia używa `projectedSecondsAfter`.
 */
export function projectedHoursAfter(counterHoursBefore: number, deltaSeconds: number): number {
  assertNonNegativeFinite(counterHoursBefore, 'stan licznika');
  assertNonNegativeFinite(deltaSeconds, 'przyrost w sekundach');
  return hoursFromSeconds(counterHoursBefore * SECONDS_PER_HOUR + deltaSeconds);
}

/**
 * Procent progu, zaokrąglony do JEDNEGO miejsca po przecinku.
 * Panel floty pokazuje `62,4%`, nie `62,444444%` — drugie nie mieści się
 * w kolumnie i nie pomaga w decyzji.
 */
export function counterPercentOfThreshold(hours: number, thresholdHours: number): number {
  if (typeof thresholdHours !== 'number' || !Number.isFinite(thresholdHours) || thresholdHours <= 0) {
    throw new RangeError(
      `próg musi być skończoną liczbą dodatnią, otrzymano: ${String(thresholdHours)}`,
    );
  }
  assertNonNegativeFinite(hours, 'stan licznika');
  return Math.round((hours / thresholdHours) * 1000) / 10;
}

/**
 * Czy licznik przekroczył próg ostrzegawczy i próg zamówienia. Liczone
 * W SEKUNDACH.
 *
 * [DECISION: 2026-10-15] Jednostka WEJŚCIA to sekunda, nie godzina. Próg z
 * kontraktu podawany jest w godzinach, ale porównanie idzie przez sekundy:
 * `thresholdHours * 3600`. Gdyby porównanie szło po godzinach, stan
 * 179 h 59 min 59 s dałby 180 h i zlecenie przyspieszyłoby prawie o
 * pół godziny. Dokładnie o ten błąd chodzi: progu nie wolno zaokrąglać
 * w dół drogi do zlecenia.
 *
 * Ostrzeżenie bierze `serviceWarnHours` z KONTRAKTU, a nie własny mnożnik.
 * Powód: Moduł 2 i Moduł 6 liczą ten sam próg tą samą funkcją. Druga kopia
 * reguły w systemie to dwa różne progi ostrzegawcze na tej samej flocie.
 *
 * `serviceWarnHours()` zwraca dokładnie 80% progu — 160 h dla progu 200 h,
 * 200 h dla 250 h, 240 h dla 300 h — a nie 20%. Historycznie odejmowała 80%
 * progu zamiast je zachować i dawała 40 h dla progu 200 h. Skutek był konkretny:
 * Moduł 1 ostrzegałby o 160 h, a Moduł 2 o 40 h, czyli dwa różne progi
 * ostrzegawcze na tej samej flocie z tego samego powodu. Błąd jest naprawiony w
 * `lib/equipment/domain/contract.ts`. Ta warstwa używa helpera taki, jaki jest,
 * żeby nie tworzyć drugiej implementacji tej samej reguły — a nie dlatego, że
 * miałaby lepszą.
 *
 * Oba znaki to `>=`: stan, nie zbocze. Licznik nie chodzi w dół, więc próg
 * osiągnięty raz zostaje osiągnięty, a zdarzenie `>=` na szczycie ticka daje
 * ten sam wynik co na jego końcu.
 *
 * Nazwa kończy się na `Seconds`, bo poprzednia wersja przyjmowała godziny pod
 * nazwa bez jednostki. Ta sama funkcja z inną jednostką to dokładnie ten błąd,
 * którą ta warstwa usuwa, więc jednostka jest w nazwie, a nie w komentarzu.
 */
export function evaluateThresholdSeconds(
  runtimeSeconds: number,
  thresholdHours: number,
): ThresholdState {
  if (typeof thresholdHours !== 'number' || !Number.isFinite(thresholdHours) || thresholdHours <= 0) {
    throw new RangeError(
      `próg musi być skończoną liczbą dodatnią, otrzymano: ${String(thresholdHours)}`,
    );
  }
  assertNonNegativeFinite(runtimeSeconds, 'stan licznika w sekundach');
  const thresholdSeconds = thresholdHours * SECONDS_PER_HOUR;
  const warnSeconds = serviceWarnHours(thresholdHours) * SECONDS_PER_HOUR;
  return { warn: runtimeSeconds >= warnSeconds, due: runtimeSeconds >= thresholdSeconds };
}

