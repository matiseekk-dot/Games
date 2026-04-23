# PS5 Vault — v1.2.0 Changelog

**Theme:** Finance promotion + Import safety
**Previous version:** 1.1.0
**Key changes:** Finance is now its own top-level tab. Import has two modes (merge/replace) with confirmation.

## 🎯 Co jest nowego dla usera

### 💰 Finanse jako główna zakładka (nie sub-tab w Statsach)

**Przedtem:** musiałeś wejść Stats → Finance → Finance subtab, 2 kliknięcia żeby zobaczyć wydatki. Plus Analysis była osobnym subtabem w Statsach.

**Teraz:** zakładka **"💰 Finanse"** na głównym pasku nawigacji, między Premiery a Statsy. W środku 2 subtaby: **Przegląd** (KPI + wykresy + top listy) + **Analiza** (insights typu "biggest loss", "most expensive hours").

**Dlaczego:** Finance to killer feature apki (ROI, koszt/godzinę, most expensive hours) — konkurencja tego nie ma. Wystawienie go na glównym tab barze repozycjonuje pozycjonowanie apki: "tracker + financial insights" zamiast "tracker z ukrytym financial tabem".

**Nowy układ głównych tabów (6 zamiast 5):**
`🏠 Home → 🎮 Gry → 📅 Premiery → 💰 Finanse → 📊 Statsy → ⚙️ Opcje`

**Stats zredukowane do 2 subtabów:** `🎮 Ogólne` + `⏱ Czas`. Finance + Insights ("Analiza") przeniesione do nowej głównej zakładki Finanse.

### 📥 Import dual-mode (Scal vs Zastąp)

**Przedtem:** klikasz "Importuj" → wybierasz plik → apka dodaje nowe gry, pomija duplikaty. **Problem:** duplikaty nie dostają update'u. Jeśli na urządzeniu A zagrałeś 2h sesji w Crimson Desert, potem eksportujesz backup i importujesz na urządzeniu B — B pominie Crimson Desert jako duplikat. **Tracisz swoją sesję.**

**Teraz:** klikasz "Importuj" → **modal z wyborem trybu**:

**🔀 Scal z istniejącymi** (bezpieczne, dla dodania nowych gier):
- Dodaje tylko gry których nie masz
- Istniejące gry NIE są aktualizowane
- Flash: "✓ Dodano X nowych gier. Pominięto Y istniejących — użyj 'Zastąp wszystko' jeśli chcesz dane z backupu"

**♻️ Zastąp wszystko** (destructive, dla sync między urządzeniami):
- Usuwa całą obecną kolekcję
- Zastępuje ją backupem 1:1 (wszystkie sesje, godziny, oceny włącznie)
- **Wymaga confirmation:** "Czy na pewno? Masz X gier które zostaną USUNIĘTE"
- Flash: "✓ Zastąpiono kolekcję — X gier z backupu"

**Bezpieczeństwo:** replace ma 3 poziomy protekcji przed przypadkowym uruchomieniem:
1. Wybór trybu (świadoma decyzja nie merge/replace)
2. Wybór pliku (user patrzy co wczytuje)
3. Confirmation dialog z liczbą gier do usunięcia

### Copy flash messages rozjaśnione

Stary flash: `"✓ Dodano 3 gier (8 duplikatów pominięto)"` — nie wyjaśniał że duplikaty NIE dostały update'u.

Nowy flash:
- Gdy były duplikaty: `"✓ Dodano 3 nowych gier. Pominięto 8 istniejących — użyj 'Zastąp wszystko' jeśli chcesz dane z backupu"`
- Gdy nie było duplikatów: `"✓ Dodano 3 nowych gier"`

## 🔧 Tech

### Nowe funkcje w kodzie
- `importReplace(file, onOk, onErr)` — nowa funkcja obok `importMerge`, zwraca imported array bez filtrowania duplikatów
- `<ImportModal>` — nowy komponent z 3 fazami: wybór trybu → wybór pliku → confirmation (tylko replace)
- `<Finance>` — nowy top-level komponent, 2 subtaby (overview + insights), duplikuje computed values ze Stats (TODO: refactor do shared hook w v2.0)

### Service Worker cache bump: `ps5vault-v7` → `ps5vault-v8`
Krytyczne — bez tego testerzy zostają na v1.1.0 w cache.

### Version bump
`package.json` → 1.2.0

### Bundle size
- Raw: 640KB (+8KB vs v1.1.0)
- Gzipped: 182KB (+2KB vs v1.1.0)
- Dodatek to Finance component (duplikuje ~90 linii computed values + ~60 linii render) + ImportModal (~70 linii)
- No new deps

### Backward compat
- Bazy danych v1.0.x, v1.1.x, v1.2.0 są 100% kompatybilne
- Żadne pole nie zostało przemianowane ani usunięte
- Istniejący localStorage `ps5vault_games` nie wymaga migration

## ⚠️ Rzeczy do uwagi przy code review

1. **Duplicate computed values** — w `<Finance>` i `<Stats>` są duplikaty computed (bought, sold, totalBase, fkpis etc.). To **celowe** żeby uniknąć drill prop i shared context. Długofalowo (v2.0) warto wydobyć do `useFinanceData(games)` hook
2. **InsightsTab scope** — używa importu `<InsightsTab>` — teraz dostępny zarówno dla `<Stats>` (nieużywany, ale tam jest) jak i `<Finance>`. Komponent sam się nie zmienił

## ✅ Testing verification

- Build passes: 829 modules, no syntax errors
- Symbols w bundle: `ImportModal`, `Finance`, `importReplace`, `importMerge`
- Wszystkie translations PL+EN dla import modes + cancel
- Finance tab dostępny w main nav, sub-tabs `overview` + `insights` działają
- Stats ma już tylko `general` + `time` subtabs

## ⚠️ Rzeczy NIE przetestowane empirycznie (zalecam manual test)

1. **Import Replace flow end-to-end** — modal confirmation → replace → flash. Logika jest prosta ale nigdy nie zobaczyłem jej odpalonej
2. **Modal file picker na iPhone Safari** — `<input type='file'>` wewnątrz modala może mieć edge case'y na iOS
3. **Collection tab import** — teraz otwiera ten sam modal co Settings. Spójne, ale sprawdź czy działa z obu miejsc

## Deployment checklist

1. ⬜ Wypakuj `ps5vault-v1.2.0.zip` → zastąp folder `ps5-vault/` w repo
2. ⬜ **Commit:** `v1.2.0 — Finance main tab + Import dual-mode`
3. ⬜ **Push origin**
4. ⬜ GitHub Actions → zielony ✓
5. ⬜ Hard refresh (Ctrl+Shift+R) na `matiseekk-dot.github.io/Games/`
6. ⬜ DevTools → Application → Service Worker → `ps5vault-v8`
7. ⬜ Otwórz apkę → widać **"💰 Finanse"** w main tab barze
8. ⬜ Finance → Przegląd = stary finance. Finance → Analiza = stary analysis. Wszystko działa.
9. ⬜ Stats → widać tylko Ogólne + Czas (bez Finance i Analiza)
10. ⬜ Settings → Importuj → modal z wyborem → test merge + test replace (na backupie)
11. ⬜ Wiadomość do testerów (draft poniżej)

## Draft wiadomości do testerów (EN)

```
Hi everyone,

v1.2.0 is live. Two main changes:

1. Finance is now its own tab (between Releases and Stats).
   Previously it was hidden inside Stats. Now you get it with 
   one tap: ROI, cost per hour, most expensive hours — front 
   and center.

2. Import has two modes now:
   • "Merge" — adds only new games (skips duplicates). Safe.
   • "Replace" — wipes your current collection and replaces 
     it with the backup. Useful for syncing between devices.
     Requires confirmation because it's destructive.

This solves a real issue: before, if you played a session on 
phone A and imported the backup on phone B, B would skip the 
game as a duplicate and your session data would be lost. Now 
you have a clear choice.

Should auto-update next time you open the app.

As always, thanks for testing.
Mateusz
```
