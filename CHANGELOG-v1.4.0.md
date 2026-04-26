# PS5 Vault — v1.4.0

**Theme:** Quick add — frykcji-zero w dodawaniu gier. Reszta pól uciekła pod akordeon.
**Previous:** v1.3.0 (Barcode scanner — w tym samym ZIP-ie)

## Co się zmienia w UI dodawania gry

### Quick add jako default view

Modal *+ Dodaj grę* otwiera się teraz w trybie minimum: **RAWG search → cover → tytuł → status → Save**. Status default = `planuje` (z `EF`, niezmienione). Tyle. Reszta pól ukryta pod przyciskiem.

Dla użytkownika który skanuje 20 gier z półki: 5 stuknięć na grę zamiast 15.

Edycja (`isEdit`) otwiera akordeon domyślnie rozwinięty — bo jak wracasz do gry to zwykle po to żeby coś konkretnego zmienić, a nie przebijać się przez podstawowe pola.

### `+ Więcej szczegółów` akordeon

Pod statusem nowy `<button class='acc-btn'>` z dashed border. Tap → rozwija sekcje:
- Rok + Platforma
- Data premiery (z countdown badge)
- Gatunek + Godziny
- Ocena + Cel godzinowy (z RAWG playtime — patrz niżej)
- Notatki
- Trofeum platynowe (jeśli status=`ukonczone`)
- **💰 Finanse**: zapłacono + sklep, DLC/mikro, sprzedane za
- Powiadomienia (jeśli `releaseDate`)

Akordeon stan: `useState(isEdit)` — domyślnie `false` dla nowej, `true` dla edytowanej.

### Toast „edukuj inkrementalnie"

Po quick-save (nowa gra) toast pokazuje:
- PL: `✓ Dodano. Stuknij grę żeby uzupełnić ceny i godziny`
- EN: `✓ Added. Tap the game to fill in prices and hours`

Toast CSS zmienione: `white-space:nowrap` → `normal`, dodane `max-width:calc(100vw - 32px)`, `text-align:center`, `line-height:1.45`. Bez tego długie zdanie wystawałoby poza ekran na 320 px iPhonie SE. Tło i pozycja bez zmian.

Dla edycji (`isEdit=true`) toast nadal `✓ Zapisano` — bez edukacji.

## Inne zmiany usability (z Twojej listy)

### `priceSold` — koniec toggle'a

Było:
```
[Sprzedałem tę grę] (toggle)  ← klik 1
↓ rozwija
[Sprzedano za ...] input        ← klik 2 + wpis
```

Jest:
```
[Sprzedane za ({cur})] input
puste = nie sprzedane             ← hint pod inputem
```

Jeden input, jeden klik. Empty value (`''`) → przy save normalizowane do `null`. Niepuste → string z liczbą (zgodne ze starym schematem). Filtry/ROI w Stats/Finance widzą `null` tak samo jak wcześniej widziały po wyłączonym toggle'u — zero migracji danych.

`soldToggle`, `soldPriceField` translacje pozostały w tabeli (na wszelki wypadek gdyby gdzieś ktoś jeszcze referencjonował), ale nigdzie w nowym Modal'u się ich nie używa. Można je wyciąć w v1.4.1 cleanupie.

### `abbr` znika z UI — autogeneracja z `mkAbbr()`

Pole `Skrót (2 lit.)` usunięte z formularza. Logika autogeneracji była już od dawna (`upd('title',...)` wywołuje `mkAbbr(v)` dla `!isEdit`). Save derive'uje też w handleSave jako fallback. Stare gry zachowują swoje obecne `abbr` (nic się nie nadpisuje).

`abbrField` translacje zostają w tabeli — nieużywane w Modal'u, ale nie ruszam, bo cheaper than potential miss.

### `targetHours` — prefill z RAWG `playtime`

`rawgSearch()` mapping rozszerzony o `playtime: Number.isFinite(+g.playtime) ? +g.playtime : 0`. RAWG zwraca średni czas gry w godzinach (źródło: HowLongToBeat-style stats agregowane przez RAWG).

`Modal.fill(item)` ma nowy warunek:
```
const pt = +item.playtime || 0;
const currentTarget = +p.targetHours || 0;
if (pt > 0 && currentTarget === 0) {
  next.targetHours = pt;
  setTargetFromRawg(true);
}
```

Czyli: prefill **tylko** jeśli RAWG ma niezerowy playtime ORAZ user nic nie wpisał wcześniej. Nie nadpisujemy ręcznie wpisanej wartości.

Pod inputem hint: `⚡ szacunek z RAWG — możesz zmienić` (kolor blu). Jak user zacznie pisać w polu, hint znika (trigger w `upd()` na klucz `targetHours`).

Edge case zabezpieczony: niektóre gry (zwłaszcza świeże premiery) mają `playtime: 0` w RAWG bo brak danych. W tym przypadku zachowujemy się jak wcześniej — empty input z placeholder `np. 40`. Nigdy nie pokazujemy `0` jako prefill.

## Tech

- `APP_VER` 1.3.0 → 1.4.0
- `package.json` ditto
- Nowe klucze translacji (PL+EN, parity OK): `moreDetails`, `lessDetails`, `soldField`, `soldFieldHint`, `targetFromRawg` (5 par)
- Zmienione: `added` (długie edukacyjne zdanie), `.toast` CSS (wrap + max-width)
- Nowe klasy CSS: `.acc-btn` (dashed border, hover→blu), `.acc-body` (fadeIn animation), `.fhnt` (small dim hint pod polem — wcześniej był inline `<div style={{fontSize:10,...}}>` w 3 miejscach, teraz 1 klasa)
- `Modal` state: `+showDetails: useState(isEdit)`, `+targetFromRawg: useState(false)`
- `Modal.fill()` prefilluje `targetHours` z `item.playtime` (rozszerzony shape z `rawgSearch`)
- `Modal.upd()` resetuje `targetFromRawg` przy ręcznym edicie target hours
- Pre-existing warning `Duplicate key "finance"` (PL 16/45, EN 193/222) — bez zmian od v1.2.4
- Build pass: `685 kB / 195 kB gzip` (+1 kB vs v1.3.0 dla nowego JSX i kilku linii CSS)
- Bundle parsuje, wszystkie nowe symbole obecne (`acc-btn`, `acc-body`, `moreDetails`, `soldField`, `targetFromRawg`, `playtime`)
- SW znów nie bumpany — feature runtime'owy, hash bundla wystarczy do invalidate

## Migracja danych

**Brak.** Wszystkie shape'y zachowane:
- `priceSold: null | string` jak było
- `abbr` zapisywane przy save jak było
- `targetHours: 0 | number` jak było
- `playtime` to nowe pole na **payloadzie z RAWG**, nie na samej grze w localStorage

Stare gry w `ps5vault_v1` otwarte w v1.4.0 pokażą się normalnie — akordeon rozwinięty (bo `isEdit=true`), wszystkie pola wypełnione tak jak wcześniej.

## Co testować

1. **Quick add path**: Tap `+ DODAJ GRĘ` → widzisz tylko: search RAWG, tytuł, status (default `Planuję`), `+ Więcej szczegółów`, Save/Cancel
2. **Search path (manual)**: wpisz "Elden Ring" → wybierz → tytuł, rok, gatunek, okładka i `Cel: 100` (lub ile RAWG zwróci dla Elden Ring) wypełnione + hint `⚡ szacunek z RAWG`
3. **Search path (barcode)**: tap 📷 → skan → wybór → ten sam efekt (playtime też propagowane przez scanner pipeline)
4. **Save bez detali**: pick z RAWG → Save → toast: `✓ Dodano. Stuknij grę żeby uzupełnić ceny i godziny` (powinien się zawinąć w 2 linie na wąskim ekranie)
5. **Akordeon rozwija**: tap `+ Więcej szczegółów` → widać Year, Platform, ..., Finanse — przycisk zmienia się na `− Mniej szczegółów`
6. **Akordeon zwija**: tap ponownie → schowane
7. **Sold input**: rozwiń detale → znajdź `Sprzedane za`, pole **bez** toggle'a, wpisz `120` → save → game.priceSold = 120; otwórz ponownie → `120` w polu; wyczyść → save → game.priceSold = null
8. **abbr autogen**: dodaj grę bez RAWG, wpisz tytuł "God of War" → save → na liście mini-okładka `GW` (ze starego `mkAbbr`)
9. **Target manual override**: pick z RAWG (target wypełni się np. `40`) → przejdź do `Cel godzinowy` → wpisz `25` → hint `⚡ szacunek z RAWG` znika
10. **Edit existing**: stuknij istniejącą grę z kolekcji → modal otwarty z akordeonem **rozwinięty** od razu (`isEdit` path)
11. **Toast wraps**: na wąskim ekranie (<340 px) sprawdzić że długi toast po save zajmuje 2 linie i nie wystaje

## Co świadomie pozostawione

- `soldToggle`, `soldPriceField`, `abbrField` translacje **zostawione** w `TRANSLATIONS` mimo że nieużywane przez Modal. Dlaczego: mogą być w starym backupie JSON-a, mogą być w cache PWA gdzieś, mogą być referencjonowane przez przyszły komponent. Cheap to keep, expensive jak ktoś coś wystrzeli prod-em.
- `EF.priceSold = null` — schemat niezmieniony, mimo że nowy UX nie potrzebuje rozróżnienia `''` vs `null`. Trzymam żeby istniejące dane się ładowały bez quirków.
- Akordeon stan **NIE persystowany** w localStorage. Dla `isEdit` zawsze rozwinięty, dla nowej zawsze zwinięty. Nie ma wartości w "zapamiętaj jak user lubi" — to jest pierwszy ekran w mokrym pierwszym użyciu, defaults dyktują pattern.

## Pliki zmienione

- `src/App.jsx` — Modal restructure, rawgSearch playtime mapping, .toast CSS, .acc-btn/.acc-body/.fhnt CSS, 5 nowych par translacji, `added` value update
- `package.json` — version bump
- `CHANGELOG-v1.4.0.md` — nowy

Bez zmian: `index.html`, `vite.config.js`, `public/*`, `assetlinks.json`, plus cała reszta komponentów.

## Deployment

1. Wypakuj ZIP → zastąp `ps5-vault/`
2. Commit: `v1.4.0 — quick add UX (accordion, single-input sold, RAWG playtime prefill, hidden abbr)`
3. Push → GitHub Pages build
4. Hard refresh w PWA → nowy bundle hash
5. Otwórz add-game modal → smoke test (lista 11 punktów wyżej)
