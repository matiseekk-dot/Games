# PS5 Vault — v1.5.0

**Theme:** Year-in-Review + Achievements + Goals + IA cleanup (Settings → hamburger, Privacy mini)
**Previous:** v1.4.0 (Quick add UX)

## Co nowego

### 🎁 Year-in-Review (Spotify Wrapped style)

Dostępne z hamburgera ⋮ → "🎁 Rok w grach". Pokazuje rok w liczbach:

- **Hero card**: total godzin grania w roku, liczba sesji
- **Stats grid 4×**: gier dodanych / ukończonych / platyn / aktywnych dni (z totalu w roku)
- **Top 3 najczęściej grane** (z okładkami)
- **Najwyżej oceniona** (z ratingiem)
- **Ulubiony gatunek** (godziny + liczba gier)
- **Money grid**: wydano / odzyskano / najdłuższa passa / najdłuższa sesja
- **Year picker** na górze — pokazuje wszystkie lata dla których są dane (sortowane od najnowszego, max 5 widocznych)
- Empty state dla roku bez danych
- Hint "📸 Zrób screenshot żeby się pochwalić" — tworzymy moment wirowy raz na rok

Implementacja: `computeYearReview(games, year)` jest pure function z deterministycznym outputem. Edge case: gra ukończona — używamy `lastPlayed || addedAt` jako proxy daty ukończenia (nie storujemy timestampa zmiany statusu — udokumentowane w komentarzach).

### 🏆 Achievements

19 osiągnięć w 7 grupach. Pure derivation z `games[]` + `longestStreak`. Każdy tier osobny tile (Collector I–V widoczne wszystkie naraz — gracz widzi co dalej).

**Lista:**
- **Collector tiers**: Pierwsza krew (1) → Kolekcjoner I (10) → II (25) → III (50, rare) → Hoarder (100, rare)
- **Finisher tiers**: Finiszer (1) → Seryjny (10) → Maraton (25, rare)
- **Trophy tiers**: Łowca trofeów (1) → II (5) → Platynowy król (10, rare)
- **Hours**: Maratończyk (100h w jednej grze), Sprinter (gra ukończona ≤10h)
- **Critic**: Krytyk (10 ocen) → II (25 ocen)
- **Streaks**: Rozpędzony (7-dniowa passa) → Niezniszczalny (30-dniowa, rare)
- **Variety**: Wszystkożerny (gry w 5+ gatunkach)
- **Money**: Handlarz (sprzedaj 5 gier)

UI: grid 2 kolumny, locked są dimmed z progress barem, unlocked są kolorowe (rare = gold accent + glow).

Brak persystencji — pełna derywacja w czasie renderu. Hamburger badge pokazuje `unlocked/total`.

### 🎯 Goals

Persystowane w `localStorage['ps5vault_goals']`. 4 typy × 6 gotowych templatków:

- ✅ **Complete** — "Ukończ N gier w tym miesiącu" (3, 5)
- ⏱ **Hours** — "Zagraj N godzin w tym miesiącu" (20, 40)
- ➕ **Add** — "Dodaj N gier do kolekcji" (3)
- 🏆 **Platinum** — "Zdobądź N platyn w tym miesiącu" (1)

**Lifecycle:** template + `monthBounds()` snapshotuje cały bieżący miesiąc → cel ważny do końca miesiąca. Po przekroczeniu progu auto-mark `doneAt:ISOString` przez `useEffect` w `GoalsManager` + toast `🎉 Cel osiągnięty: ...`. Done goals lądują w sekcji "Ukończone" (mniej widoczne).

UI:
- **Home**: `<GoalsCard>` poniżej greetingu — empty state to dashed CTA "Wyznacz cel — np. 3 gry do ukończenia"; gdy aktywne, pokazuje top 3 z progress barami
- **GoalsManager** overlay (z hamburgera) — full CRUD, picker template'ów, sekcja Active vs Done
- Liczba dni do końca miesiąca w meta każdego celu (`X dni do końca` lub `Ostatni dzień!`)

**Caveat:** `complete`/`platinum` używają `lastPlayed || addedAt` jako proxy daty ukończenia (jak w Year-in-Review). User który markuje starą grę jako ukończoną *w tym miesiącu* nie zalicza celu, bo `lastPlayed` może być sprzed wielu miesięcy. Akceptowane na v1 — fix wymagałby storage `completedAt` dla nowych gier od v1.5.1.

### 🔒 Privacy mini (cleanup)

Było: 8 sekcji w app + 13 sekcji w `privacy.html` = duplikat treści (S3=RAWG dwa razy, S4=UPCitemdb dwa razy itd.).

Jest: **jeden paragraf** w app + prominent CTA `Pełna polityka prywatności →` linkujący do `privacy.html` (która zostaje 1:1 — to ona jest legalnym dokumentem dla App Store).

Tekst PL: *"Wszystkie dane są przechowywane lokalnie na Twoim urządzeniu — nic nie wysyłamy na serwery, brak trackerów, brak danych osobowych. Jedyne zewnętrzne API to RAWG (wyszukiwanie gier) i UPCitemdb (rozpoznanie EAN podczas skanu) — wysyłany jest tylko tekst zapytania lub kod EAN, nigdy Twoja kolekcja."*

Stare klucze `privacyS1Title`...`privacyS8Body` zostają w `TRANSLATIONS` (defensywne — gdyby coś jeszcze referencjonowało) ale **żaden nie jest renderowany**. Można wyciąć w v1.5.1 cleanupie.

### ⚙️ Settings → hamburger ⋮

Było: 6 tabów (`home`, `gry`, `premiery`, `finanse`, `statsy`, `opcje`) — Settings jako 1/6 prime real estate dla feature'a używanego raz na miesiąc.

Jest: **5 tabów** (Settings tab usunięty) + `≡` button w headerze obok `+ Dodaj grę`. Tap → bottom-sheet `MenuOverlay` z 4 entries:

```
🎁  Rok w grach 2026          [2026]    ›
🏆  Osiągnięcia               [5/19]    ›
🎯  Cele                      [2]       ›
⚙️  Ustawienia                          ›
```

Każde otwiera fullscreen `bs-ovr` overlay (re-using barcode scanner CSS). Settings wewnątrz overlay'a renderuje istniejące `<Settings>` + `<BudgetEditor>` bez modyfikacji wewnętrznej logiki — tylko shell się zmienił.

Hamburger badge counters pokazują quick-status:
- Wrapped: bieżący rok
- Achievements: `unlocked/total` (lub `pusty` jeśli 0 unlocked)
- Goals: liczba aktywnych

## Tech

- `APP_VER` 1.4.0 → 1.5.0
- `package.json` ditto
- **Bundle: 685 → 721 kB raw, 195 → 203 kB gzip** (+36 kB raw, +8 kB gzip dla 19 achievements + 5 nowych komponentów + helpery + CSS)
- 5 nowych komponentów: `MenuOverlay`, `Achievements`, `GoalsManager`, `GoalsCard`, `YearInReview`
- 1 nowy LS key: `ps5vault_goals` (array of `{id, type, target, periodStart, periodEnd, doneAt}`)
- Pure compute helpers: `computeAchievements`, `goalCurrent`, `computeYearReview`, `getYearsWithData`, `monthBounds`, `daysLeftInMonth`
- 2 nowe const arrays: `ACHIEVEMENTS` (19), `GOAL_TEMPLATES` (6)
- 1 nowy const map: `GOAL_TYPES` (4 type definitions)
- ~60 nowych kluczy translacji w PL i EN (full parity verified — 424 keys per lang)
- ~100 linii CSS (`.hmb`, `.menu-*`, `.ach-*`, `.goal-*`, `.wr-*`)
- App-level: nowy `overlay` state (enum: `'menu' | 'wrapped' | 'achievements' | 'goals' | 'settings' | null`) + `goals` state
- Header: `≡` button dodany w `.htop`; tab bar zredukowany z 6 do 5 tabów
- Pre-existing warning `Duplicate key "finance"` (PL 16/45, EN 193/222) — niezmieniony, to z v1.2.4

## Testowanie

Pure helpers przepuszczone przez Node sim:
- ✅ `computeAchievements` — 19 entries returned, unlocked/locked split poprawny dla realistic 4-game collection
- ✅ `monthBounds` — Apr 2026: `2026-04-01` → `2026-04-30`, days left 5 (z Apr 26)
- ✅ `goalCurrent` — wszystkie 4 typy: complete=0, hours=5 (April only — March ignored), add=2, platinum=0
- ✅ `getYearsWithData` — `[2026, 2025]` (descending, deduped)
- ✅ `computeYearReview(2026)` — totalHours=5, gamesAdded=2, completed=1, platinums=1, topPlayed=Elden Ring 5h, highestRated=Elden Ring, topGenre=RPG, totalSpent=270, longestStreak=2, longestSession=2.5
- ✅ `computeYearReview(2010)` — null (empty year handled)

Build:
- ✅ `vite build` pass, 829 modules
- ✅ Bundle parses (`new Function()` test)
- ✅ Translation parity: **424 keys w PL = 424 w EN, zero rozbieżności**
- ✅ 64 strukturalnych checków zielone (versions, components, helpers, removed UI, bundle markers w PL i EN)
- ✅ Brak stale references: `tab==='cfg'` × 0, `setTab('cfg')` × 0, `[1..8].map` privacy iteration × 0, `'privacyS` rendered × 0

## Migracja danych

**Brak.** Wszystkie istniejące shape'y zachowane. Nowe:
- `ps5vault_goals` — pusty array dla nowych userów; istniejący userzy zaczynają z `[]`
- Brak migracji dla `ps5vault_v1` — gry, sesje, ratings, finanse — wszystko zostaje

Tab state nie jest persystowany w localStorage, więc usunięty `cfg` nie zostawia śmieci.

## Smoke test checklist

1. **Hamburger present**: open app → header has `≡` button between logo and `+ Dodaj grę`
2. **5 tabs**: tab bar pokazuje Home/Gry/Premiery/Finanse/Statsy. **Brak "Ustawienia"** taba.
3. **Menu opens**: tap `≡` → bottom sheet z 4 entries (Wrapped, Achievements, Goals, Settings)
4. **Achievements**: tap → grid 2-kolumnowy, większość locked z progress barami; "Pierwsza krew" unlocked jeśli masz ≥1 grę
5. **Year-in-Review**: tap → year picker u góry, hero card z total hours, top played z okładkami
6. **Year picker**: jeśli masz dane z 2 lat — przełącz na drugi rok → stats się aktualizują
7. **Empty year state**: w year pickerze wybierz rok bez danych (np. 2010 jeśli się da wpisać) → empty state
8. **Goals empty**: home tab → widzisz dashed card "🎯 Cele tego miesiąca · Wyznacz cel — np. 3 gry do ukończenia"
9. **Add goal**: tap card → GoalsManager overlay → "+ Dodaj cel" → picker z 6 templatami → wybierz "Ukończ 3 gry" → toast `✓ Cel dodany`
10. **Goal progress**: home card teraz pokazuje aktywny cel z 0/3 + bar 0%
11. **Goal auto-done**: zmień status 3 gier na `Ukończone` (set `lastPlayed` w bieżącym miesiącu) → po reloadzie aplikacji goal auto-mark jako done + toast `🎉 Cel osiągnięty: ...`
12. **Settings via menu**: tap `≡` → tap "⚙️ Ustawienia" → fullscreen overlay z istniejącym Settings + Budget. Język/Waluta/Export/Import/Privacy/Buy coffee/Report problem — wszystko działa jak w v1.4.0
13. **Privacy mini**: w Settings tap "🔒 Polityka prywatności" → mały modal z **jednym paragrafem** + niebieski CTA `Pełna polityka prywatności →` → tap → otwiera `privacy.html` w nowej karcie
14. **Privacy NIE 8 sekcji**: w mini modal NIE widzisz "1. Co przechowujemy / 2. Czego NIE zbieramy / ..."
15. **Hamburger badges**: ≡ → Achievements row pokazuje np. `5/19`; Goals pokazuje `1` (jeśli masz aktywny goal); Wrapped pokazuje rok
16. **Back navigation**: w Achievements/Wrapped/Goals — `✕` w prawym górnym rogu wraca do menu (nie do tabu); zamknięcie menu (klik poza panel) zamyka cały overlay

## Co świadomie pozostawione

- **`completedAt` timestamp dla gier nie storujemy** — `goalCurrent` typu `complete`/`platinum` używa `lastPlayed || addedAt` jako proxy. User markujący starą grę jako "ukończona dzisiaj" nie zalicza celu typu Complete jeśli nie ma żadnego sessiona dzisiaj. Documented w komentarzach. Fix to v1.5.1: dodać `completedAt` setter w `Modal.handleSave` gdy status zmienia się NA `ukonczone`.

- **Goals nie auto-rolują na nowy miesiąc** — design decision. Nieukończony goal kończący się 30 kwietnia zostaje w sekcji Active z metą "Ostatni dzień!", a 1 maja jego cur=0 (bo `goalCurrent` filtruje po periodStart/periodEnd, które są zamrożone). User musi ręcznie usunąć stary i dodać nowy. Plus: nie ma "ghost goals" które rolują się w nieskończoność. Minus: trochę friction. Można zmienić w v1.5.1 jeśli okaże się annoying.

- **Year-in-Review: brak share API** — `Web Share API` (`navigator.share`) działa pięknie na iOS/Android ale wymaga touch event w handlerze, plus zachowuje się różnie w PWA vs browser. Hint "📸 Zrób screenshot żeby się pochwalić" to MVP — viral moment opiera się na tym że user sam screenshotuje. v1.5.1 może dodać `navigator.share({title, text, url})` jako progressive enhancement.

- **`privacyS1...S8` translacje zostają w TRANSLATIONS** — nieużywane, ale defensywne. Cheap to keep. Cleanup w v1.5.1.

- **Achievements bez animacji unlock** — pure derivation w czasie renderu nie wie kiedy coś *właśnie* się odblokowało (brak diff'a vs. poprzedni render). Dodanie tego wymagałoby śledzenia `lastSeenAchievements` w localStorage + porównania na każdy render. Skipped na v1 — odblokowanie pojawia się "magicznie" gdy user otworzy widok. Można dodać animację + toast po odblokowaniu w v1.5.1.

- **Streak achievement liczy `longestStreak`** (najdłuższa kiedykolwiek), nie current streak. Czyli "Niezniszczalny — 30-dniowa passa grania" odblokowuje się raz i zostaje, nawet jeśli user przerwie passę. Tak było w istniejącym `computeLongestStreak` z Stats — używamy istniejącej logiki dla spójności.

## Pliki zmienione

- `src/App.jsx` (~+770 LOC: ACHIEVEMENTS array + 5 nowych komponentów + helpery + CSS + i18n + privacy mini + tab bar)
- `package.json` (version bump)
- `CHANGELOG-v1.5.0.md` (nowy)

Bez zmian: `index.html`, `vite.config.js`, `public/manifest.json`, `public/sw.js`, `public/privacy.html` (zostaje 13-section pełna wersja jako legalny dokument), `public/icons/*`, `assetlinks.json`.

## Deployment

1. Wypakuj ZIP → zastąp `ps5-vault/`
2. Commit: `v1.5.0 — Year-in-Review + Achievements + Goals + Settings→hamburger + privacy mini`
3. Push → GitHub Pages build
4. Hard refresh w PWA → nowy bundle hash
5. Smoke test: 16 punktów wyżej

## Wersja w skrócie

- **+** 3 nowe duże fichery (Wrapped, Achievements, Goals)
- **+** Cleaner IA: 5 tabów zamiast 6, secondary za hamburgerem
- **+** Privacy w app skondensowane: 1 paragraf zamiast 8 sekcji
- **=** Wszystkie poprzednie fichery (v1.3 barcode, v1.4 quick-add) działają bez zmian
- **=** Zero migracji danych — istniejący userzy `ps5vault_v1` ładują się bez różnicy
- **+** Bundle +36 kB raw / +8 kB gzip — przyzwoity koszt za 770 nowych LOC

