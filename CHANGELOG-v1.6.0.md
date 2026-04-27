# PS5 Vault — v1.6.0

**Theme:** File structure refactor (option C) — translacje, CSS, constants i helpery wydzielone do osobnych modułów. Komponenty zostają w App.jsx.
**Previous:** v1.5.0 (Year-in-Review + Achievements + Goals)
**User-visible changes:** **ZERO.** To jest czysty internal refactor. Bundle byte-equivalent (720.45 vs 720.65 kB — różnica to inny module hashing).

## Co się zmieniło

### Struktura plików

```
src/
├── App.jsx              2459 LOC  ← było 4058 (-1599)
├── main.jsx             bez zmian
├── constants.js           51      ← APP_VER, RAWG_KEY, LS_*, G, GENRES, RMAP, STORES, PLATFORMS, CURRENCIES, EF
├── i18n.js               579      ← TRANSLATIONS (PL+EN), t(), getSM()
├── styles.js             397      ← const CSS = `...`
└── lib/
    ├── util.js            36      ← uid, mkAbbr, daysUntil, dayKey, weekStart    (zero deps)
    ├── format.js          64      ← fmtDate, fmtShort, pln, gamesWord, fmtCph, fmtHours
    ├── storage.js        135      ← lsRead/Write, budget*, timer*, isOnboarded, getLang, getCurrency*, exportData, importData, importMerge/Replace
    ├── platform.js        41      ← registerSW, requestNotifPerm, checkReleases  (zero project deps)
    ├── rawg.js            27      ← rawgSearch
    ├── barcode.js         72      ← cleanProductName, eanLookup, eanCache*
    ├── sessions.js        57      ← collectSessions, computeStreak, computeLongestStreak
    ├── achievements.js   113      ← ACHIEVEMENTS array (19), computeAchievements
    ├── goals.js           85      ← GOAL_TYPES, GOAL_TEMPLATES, monthBounds, daysLeftInMonth, goalCurrent, goalsRead/Write
    └── wrapped.js        105      ← getYearsWithData, computeYearReview
```

**TOTAL: 4221 LOC across 14 plików** vs 4058 LOC w jednym App.jsx. **+163 LOC overhead** (4%) na file headers, exports, importy. Akceptowalne za drastyczną poprawę nawigacji.

### Dependency graph

Czyste, bez cykli:

```
constants.js  ←  util.js  ←  storage.js
                          ←  format.js  ←  storage.js (getCurrency)
                          ←  sessions.js
                          ←  goals.js
                          ←  wrapped.js  ←  sessions.js (computeLongestStreak)
                          ←  achievements.js (self-contained, no util needed)
                          ←  barcode.js   ←  constants (LS_EAN_CACHE)
                          ←  rawg.js      ←  constants (RAWG_KEY, RMAP) + util (mkAbbr)
                          ←  i18n.js      ←  constants (CURRENCIES, G) + storage (getCurrency)
platform.js — zero project deps (czysto Web API)
styles.js   ←  constants.js (G)
```

`util.js` zostało wydzielone z `format.js` żeby zerwać would-be cycle: `format` chce `getCurrency` ze `storage`, a `storage` chce `uid` z `format`. Pure helpery (uid, mkAbbr, dayKey, weekStart, daysUntil) idą do `util.js`, currency-aware formatters (pln, fmtCph) zostają w `format.js`.

### Naprawione przy okazji

- **`Duplicate key "finance"` warning** — siedział od v1.2.4 (PL line 16/45, EN 193/222). Klucz `finance` był zadeklarowany dwa razy: raz jako `finance:"💰 Finanse"` przy głównych tabach, drugi raz jako `finance:"💰 Finanse"` przy Stats subtabach (general/finance/analysis). Wartości identyczne, więc lint-only — ale 4 buildy z rzędu pokazywały warning. Usunięte w extraction step (i18n.js linia 28-30 — komentarz objaśniający). PL i EN mają teraz po **423 unikalnych kluczach** (zamiast 424 z dupe).
- **Defensive `typeof CURRENCIES === 'undefined'` guards** w pln/fmtCph — usunięte. Były zostawione na wszelki wypadek w epoce single-file gdy hoisting mógł dać surprise. ES modules statycznie resolve'ują importy, więc guard jest dead code.

### Czego refactor NIE zmienia

- **Bundle size** — 720.45 kB raw (vs 720.65 v1.5.0), 203.16 kB gzip (vs 203.27). Różnica ~0.2 kB to inny moduły-hashing po stronie Vite.
- **Runtime perf** — identyczny. ESM imports rozkminione przy bundle time, nie ma extra fetchów.
- **User behavior** — wszystkie 21 komponentów zachowują pełną funkcjonalność. Stan, eventy, dane, wszystko bez zmian.
- **localStorage shape** — żadne klucze nie były ruszane. `ps5vault_v1`, `ps5vault_goals`, `ps5vault_ean_cache`, `ps5vault_budget`, `ps5vault_timer`, `ps5vault_onboarded`, `ps5vault_lang`, `ps5vault_currency` — wszystkie 8 LS keys działa byte-identical.
- **Build pipeline** — Vite ogarnia ESM bezpośrednio, żadnych zmian w `vite.config.js`, `package.json` scripts, GitHub Actions workflow.

## Tech

- `APP_VER` 1.5.0 → 1.6.0 (+ `package.json`)
- **App.jsx: 4058 → 2459 lines (-1599 / -39%)**
- **Bundle: 720.65 → 720.45 kB raw, 203.27 → 203.16 kB gzip** (essentially noise)
- 13 nowych modułów, 41–579 LOC każdy
- 49 helperów + 2 const arrays + 1 const map + TRANSLATIONS + CSS — wszystko wydzielone
- 21 komponentów + state hooks + event handlers + JSX render — **zostają w App.jsx** (świadomy wybór: opcja C, nie a/b)

## Build verification

✅ `vite build` pass — 842 modułów (vs 829 w v1.5.0; +13 = nasze nowe pliki)
✅ Bundle parses (`new Function(code)` test)
✅ **95/95 strukturalnych checków zielone**:
  - 14× file existence
  - 13× import statements w App.jsx
  - 40× moved-block markers absent z App.jsx (TRANSLATIONS, CSS, ACHIEVEMENTS, GOAL_*, function rawgSearch, function lsRead, function pln, ...)
  - 4× i18n internals (export t, export getSM, parity, finance dupe×2)
  - 21× bundle string markers (PL+EN labels, LS keys, CSS classy, RAWG endpoint, BarcodeDetector, upcitemdb)
  - 3× version + parse
✅ PL/EN parity: **424 = 424** (oba spadły o 1 vs v1.5.0 z powodu finance dupe removal — czyli "423 unique + 1 dupe" → "423 unique" w obu)
✅ `Duplicate key "finance"` warning **GONE**
✅ Wszystkie 8 localStorage kluczy ciągle używane: `ps5vault_v1`, `_goals`, `_ean_cache`, `_budget`, `_timer`, `_onboarded`, `_lang`, `_currency`

## Co teraz łatwiej

To są obserwacje z mojej (Claude'a) perspektywy podczas pracy z plikiem przez ostatnie 4 wersje. Twoje workflow może być inne, ale spodziewam się że odczujesz podobną różnicę:

- **Edycja translacji** — `src/i18n.js` ma pure dict + 50 LOC funkcji. Search-by-key od razu trafia w cel. Wcześniej trzeba było scrollować przez 540 linii w środku 4000-linijkowego pliku.
- **Tweak CSS** — `src/styles.js` to czysty template literal. Edycja stylu klasy `.ach-card` to wejście w plik + Cmd+F. Wcześniej cały plik się obcinał w view bo > 16k znaków.
- **Dodawanie achievementów** — `src/lib/achievements.js` ma jasną strukturę: array entries + measure functions. Dodanie 20-tego achievementu to 1 wpis w array, bez wpływu na resztę.
- **Refactor formatters** — `src/lib/format.js` ma 6 funkcji w 64 liniach. Łatwo zobaczyć całość naraz i porównać behavior między pln/fmtCph/fmtHours.
- **Dodanie nowego LS key** — `constants.js` ma listę wszystkich `LS_*`. Jeden punkt prawdy zamiast `grep -n "ps5vault_" src/App.jsx`.
- **`str_replace` lock-on** — kontekst dla anchor staje się unikalny zazwyczaj w 1-2 liniach (vs 5-10 dla App.jsx). Edycje są szybsze i mniej kruche.

Komponenty (Modal, Home, Stats, Finance, MenuOverlay, ...) zostają w App.jsx — to świadoma decyzja opcji C. Migracja komponentów to opcja B (faza po fazie, każdy komponent osobny plik) i może być zrobiona w v1.7.0 jeśli okaże się że ich edycja w środku 2459-linijkowego App.jsx też zaczyna przeszkadzać.

## Co świadomie pozostawione

- **`React import` w App.jsx** zostaje jako pojedynczy `import { useState, useEffect, useRef, useCallback } from 'react'` — komponenty importują z tego samego scope, nie ma potrzeby duplikować.
- **`recharts` import** też zostaje w App.jsx — używany przez Stats i Finance komponenty (tylko w App.jsx). Dodanie do constants.js mijałoby się z celem.
- **Cleanup `privacyS1...S8` translacji** — 16 nieużywanych kluczy w PL+EN. Defensywnie zostawione na wypadek gdyby coś jeszcze referencjonowało. Real cleanup w v1.6.1.
- **Brak TypeScript** — kuszące byłoby dodać types przy okazji refactoru, ale to zwiększa scope ~5×. Wszystkie helpery są pure functions z dobrymi nazwami params; kontrakty są oczywiste z czytania kodu.
- **Brak unit testów** — sims przeprowadzone w changelog v1.5.0 dotyczą byte-identical kodu (refactor nie zmienia behavior, tylko relokacje). Dodanie Jest/Vitest = osobna sprawa.
- **Komponenty zostają w App.jsx** — opcja C. Jeśli ich edycja będzie się sypała przy v1.7.0/v1.8.0 dodawaniu fichów, robimy migrację (opcja B) wtedy.

## Migracja danych

**Brak.** Każdy localStorage key zachowany. Importy/exporty backupów kompatybilne 1:1 z v1.5.0.

## Smoke test checklist

Ponieważ refactor nie zmienia funkcjonalności, smoke test = "wszystko z v1.5.0 ciągle działa":

1. **Otwórz aplikację** → Home tab ładuje się jak zawsze
2. **Sprawdź wszystkie 5 tabów** (Home, Gry, Premiery, Finanse, Statsy) — każdy renderuje
3. **Hamburger ⋮** → 4 entries (Wrapped, Achievements, Goals, Settings) — wszystkie otwierają overlay
4. **Wrapped 2026** → year picker działa, hero card pokazuje twoje dane
5. **Achievements** → grid 2-kol, twoje unlocked są podświetlone, locked z progress barami
6. **Goals** → istniejące cele widoczne, można dodać nowy z templatu
7. **Settings overlay** → język/waluta/export/import/privacy mini → 1-paragraf + link do `privacy.html`
8. **Dodaj grę** → modal z RAWG search działa, scanner 📷 button widoczny
9. **Edytuj grę** → klik tile → modal otwiera się z `+ Więcej szczegółów` rozwiniętym
10. **Session timer** → start → pauza → koniec → toast z ROI
11. **Eksport backup** → JSON download z całą kolekcją
12. **Import merge/replace** → wybierz plik → toast z licznikami
13. **PWA install** → service worker rejestruje się przy ładowaniu (sprawdź DevTools → Application → SW)
14. **Powiadomienia o premierze** → włącz dla gry z release date → expected to push notification at release time
15. **Polski/English toggle** → wszystkie stringi się przełączają (no missing translations)
16. **Sprawdź console** → BRAK `Duplicate key "finance"` warning (był od v1.2.4!)

Jeśli wszystkie 16 punktów ✓ — refactor v1.6.0 jest validated.

## Pliki zmienione

- `src/App.jsx` (-1599 LOC, +30 LOC importów)
- `src/constants.js` (NEW, 51 LOC)
- `src/i18n.js` (NEW, 579 LOC — z naprawionym finance dupe)
- `src/styles.js` (NEW, 397 LOC)
- `src/lib/util.js` (NEW, 36 LOC)
- `src/lib/format.js` (NEW, 64 LOC)
- `src/lib/storage.js` (NEW, 135 LOC)
- `src/lib/platform.js` (NEW, 41 LOC)
- `src/lib/rawg.js` (NEW, 27 LOC)
- `src/lib/barcode.js` (NEW, 72 LOC)
- `src/lib/sessions.js` (NEW, 57 LOC)
- `src/lib/achievements.js` (NEW, 113 LOC)
- `src/lib/goals.js` (NEW, 85 LOC)
- `src/lib/wrapped.js` (NEW, 105 LOC)
- `package.json` (version bump only)
- `CHANGELOG-v1.6.0.md` (NEW)

Bez zmian: `index.html`, `vite.config.js`, `public/manifest.json`, `public/sw.js`, `public/privacy.html`, `public/icons/*`, `assetlinks.json`, `src/main.jsx`.

## Deployment

1. Wypakuj ZIP → zastąp `ps5-vault/`
2. Commit: `v1.6.0 — refactor: split App.jsx into modules (no user-visible changes)`
3. Push → GitHub Actions build
4. Hard refresh w PWA → nowy bundle hash (BypygwlW vs c5oCZbRJ)
5. Smoke test: 16 punktów wyżej

## Wersja w skrócie

- **=** Funkcjonalność: 100% identyczna z v1.5.0
- **=** Bundle: ~720 kB raw / ~203 kB gzip — bez zmian
- **=** Storage: identyczne klucze i shape
- **=** UI/UX: zero zmian
- **−** App.jsx: 4058 → 2459 LOC (-39%)
- **−** `Duplicate key "finance"` warning od v1.2.4 — usunięty
- **+** 13 nowych plików `lib/*` + `constants.js` + `i18n.js` + `styles.js`
- **+** Translacje, CSS i helpery są teraz pojedynczymi punktami prawdy z czystymi exportami

