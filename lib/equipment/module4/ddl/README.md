# DDL warstwy health — `health_overlay`

**Ten katalog nie jest wykonywany przez aplikację. Nigdy nie był i nie będzie.**

## Co tu jest

| Plik | Rola |
|---|---|
| `health_overlay.sql` | Kanoniczny DDL schematu `health_overlay` na **osobnej instancji w regionie UE**. |
| `README.md` | Ten plik: kto, jak i dlaczego ręcznie. |

## Schemat jest stosowany RĘCZNIE, przez człowieka

Wykonuje go **człowiek z dostępem do bazy na osobnej instancji UE**. Nie aplikacja,
nie `applyEquipmentSchema()`, nie żaden skrypt w tym repozytorium.

Kształt polecenia — do wykonania ręcznie, **poza** repozytorium:

```bash
psql "$HEALTH_OVERLAY_DATABASE_URL" \
  --single-transaction \
  --set ON_ERROR_STOP=1 \
  -f lib/equipment/module4/ddl/health_overlay.sql
```

`--single-transaction` jest tu obowiązkowy: albo powstaje cały schemat, albo nic.
Warstwa w połowie utworzona jest gorsza od warstwy nieutworzonej, bo kod zakłada
obecność tabel i nie sprawdza jej. Plik **nie zawiera** `BEGIN;`/`COMMIT;` —
transakcję prowadzi `psql`, żeby nie powstały dwie rozbieżne konwencje.

Dwie rzeczy, których polecenie **nie** robi i nie powinno:

- nie nadaje żadnych uprawnień (`GRANT`/`REVOKE`) — rola aplikacji warstwy health
  nie jest zadeklarowana w repozytorium;
- nie włącza RLS — patrz „Znane otwarte decyzje” niżej.

Po wykonaniu **sprawdź ręcznie**, że istnieje 5 tabel i 7 indeksów w schemacie
`health_overlay`. Testy w repozytorium tego NIE potwierdzą — patrz niżej.

## Dlaczego nie ma aplikatora

Aplikator dla warstwy equipment istnieje (`lib/equipment/ddl/apply.ts`) i jest
wywoływany z `ensureDatabaseReady()` w `lib/db/client.ts`. **Ten sam mechanizm nie
może obsługiwać health**, i to nie jest kwestia konwencji:

1. **To jest granica zero-PII, na której opiera się cały projekt.** Jedna kopia
   zapasowa, jeden dump i jeden eksport do analityki zabierają razem dane
   zdrowotne i dane o sprzęcie, a prawo rozdziela je (Art. 9 RODO). Aplikator
   w głównej bazie oznaczałby, że ten sam proces, ten sam ciąg poświadczeń i ta
   sama sieć mają dostęp do obu warstw.
2. **Inny podmiot, inna instancja, inna podstawa prawna, inny operator.**
   Warstwa health podlega umowie powierzenia i lokalizacji danych w UE; warstwa
   equipment jest zero-PII i nie ma takiej umowy. Wspólny kod wykonujący DDL to
   wspólny proces — czyli wspólne uprawnienia, wspólny log, wspólny blast radius.
3. **Aplikator sprzedawczy wykonuje się automatycznie przy starcie procesu.**
   To jest dokładnie ta właściwość, której warstwa health nie może mieć: „nikt
   nie zdecydował, kiedy to powstało” jest nie do odróżnienia od „ktoś to
   zdecydował”. Zastosowanie tego DDL ma być **zdarzeniem zapisanym w protokole
   zmiany**, a nie skutkiem ubocznym restartu.
4. **Gdyby istniał wspólny kod, musiałby rozróżniać dwa połączenia.** Każde
   rozróżnienie (`if schema === 'health'`) jest granicą, którą ktoś kiedyś usunie
   przy refaktorze. Granica, która działa tylko dzięki warunkowi w kodzie, nie
   jest granicą.

## Dlaczego ten plik nie leży w `lib/equipment/ddl/`

Katalog `lib/equipment/ddl/` czyta `readEquipmentDdlSql()`
(`lib/equipment/ddl/read-sql.ts`), a jego treść wykonuje
`applyEquipmentSchema()` → `ensureDatabaseReady()` w `lib/db/client.ts`. Wrzucenie
pliku zdrowotnego do tego katalogu oznaczałoby, że **główna baza może utworzyć
schemat health** przy pierwszym starcie procesu — czyli dokładnie ten sam
zapis po tamtej stronie granicy, którego cała warstwa ma bronić.

Dlatego katalog jest `lib/equipment/module4/ddl/`: nie leży pod
`lib/equipment/ddl/`, nie jest przez nic globowany, a czytnik wykonawcy
operuje na jednej ustalonej nazwie pliku (`EQUIPMENT_DDL_FILENAME`), więc nawet
gdyby katalog został przeszukany, nazwy plików się nie zgadzają.

**Te dwie własności są testowane**, nie opisane: `tests/equipment/module4/overlay-ddl.test.ts`
sprawdza, że `health_overlay.sql` nie leży w katalogu czytanym przez aplikator,
że czytany tekst jest bajt w bajt plikiem `0001_equipment.sql`, że w wykonywalnych
instrukcjach głównego DDL nie ma ani `CREATE SCHEMA`, ani słowa `health_overlay`,
i że nic poza `lib/equipment/module4/` nie odwołuje się do tego pliku.

## Zgodność z kodem — co pilnuje i jak

Źródłem prawdy jest `lib/equipment/module4/overlay-schema.ts`. DDL jest wyprowadzone
z niego kolumna po kolumnie; test porównuje obie strony **w obu kierunkach**, więc
dodanie tabeli lub kolumny w jednym miejscu bez drugiego wywala bramkę:

- każda tabela zadeklarowana w Drizzle ma `CREATE TABLE` w SQL i odwrotnie;
- każda kolumna ma zgodne `NOT NULL`, `DEFAULT` i typ (w tym `timestamptz`);
- klucz główny, format opornika, strukturalność `answers` i okno retencji są
  sprawdzane osobno.

Ograniczenia `CHECK` są opisane w nagłówku samego pliku SQL z podziałem na
`[Z DEKLARACJI]`, `[Z MODUŁU]` i `[UTWARDZENIE]`. Kategoria `[UTWARDZENIE]` to
ta, której nie da się wyprowadzić z kodu — jest jawna po to, żeby człowiek
zatwierdzający DDL wiedział, co dokładnie dodajemy od siebie.

## Czego te testy NIE dowodzą

`tests/equipment/module4/overlay-ddl.test.ts` czyta **tekst**. Nie wykonuje DDL,
nie łączy się z bazą, nie ma `pglite` i nie ma `DATABASE_URL`. W tym repozytorium
nie ma bazy danych, więc test wykonujący schemat nie może być częścią codziennej
bramki i nie udawałby, że jest.

Konsekwencja: zielony ten plik mówi, że **DDL i deklaracja mówią to samo**. Nie
mówi, że Postgres to przyjmie. To drugie wymaga wykonania pliku na instancji —
i dlatego wykonanie jest zdarzeniem ręcznym, a nie krokiem testu.

Trzy rzeczy, których zielony test nie wyłapie:

1. **Kolizja istniejących danych na instancji.** CHECK-y zostaną dodane przez
   `ALTER TABLE` dopiero wtedy, gdy ludzie zaczną je weryfikować; `CREATE TABLE
   IF NOT EXISTS` na tabeli, która już istnieje, **nie doda** żadnego ograniczenia.
   Przed pierwszym zastosowaniem trzeba porównać `information_schema` na
   instancji z tym plikiem.
2. **Poprawność samego Postgresa dla konkretnej wersji.** To plik był
   zaprojektowany, nie uruchomiony.
3. **RLS.** Patrz niżej — świadomie nieopisane przez ten DDL.

## Znane otwarte decyzje (do zamknięcia przez człowieka z dostępem)

1. **RLS per-gabinet.** `boundary.ts:16-18` przewiduje izolację na poziomie bazy,
   a `assertOverlayIsRegionallyIsolated()` pilnuje regionu i szyfrowania. Polityki
   RLS **nie ma** w tym DDL, bo rola aplikacji ani zmienna sesyjna z gabinetem nie
   są zadeklarowane w repozytorium — a `ENABLE ROW LEVEL SECURITY` bez sensownej
   polityki blokuje wszystko, a za szeroka polityka przepuszcza wszystko. Oba stany
   wyglądają jak działające, dopóki nie trafi w nie konkretny czytelnik.
2. **Brak kolumny `encryption_in_transit`.** `OverlayClinicConfig`
   (`overlay-schema.ts:109`) ma takie pole, ale `overlay_clinics`
   (`overlay-schema.ts:31-38`) go nie przechowuje. Tu jest luka między
   konfiguracją a jej zapisem — nie została zasłonięta dopisaniem kolumny,
   bo jej nie ma w deklaracji.
3. **Format oporników `subject_ref` / `actor_ref`.** Format
   `^[A-Za-z0-9_-]{1,64}$` pochodzi z *tyłu* deklaracji („ODPORNIK, nie
   identyfikator osoby”), nie z kodu. Jeżeli na instancji istnieją odporniki
   wygenerowane według innej konwencji, te CHECK-i trzeba najpierw policzyć na
   danych.

## Historia

- **2026-10-16** — powstanie pliku. `overlay-schema.ts` deklarował 5 tabel
  `health_overlay`, a żadne DDL w repozytorium ich nie tworzyło; skan eksportów
  zadeklarowanych i nieużytych wskazał cztery z nich. Osobna instancja nie miała
  ścieżki utworzenia schematu.