# PS5 Vault — v1.1.0 Changelog

**Theme:** Time Tracking Insights
**Previous version:** 1.0.1 (deployed)
**Includes:** Everything from v1.0.1 + v1.1-partial + new F07/F08

## 🎯 Co jest nowego dla usera

Cała sekcja "⏱ Czas" w Stats + pauza w timerze sesji. User który zagrał dziś 2h 15min (z 30 min pauzy bo odebrał telefon) widzi teraz:
- "Dziś: 2h 15min" w zakładce Czas
- Ładny heatmap miesiąca pokazujący intensywność grania dzień po dniu
- Current streak (np. 🔥 5 dni)
- Najdłuższa sesja, średnia sesja, porównanie tydzień/tydzień

To jest **killer update dla retention** — daje powód wracania do apki nawet bez nowej gry do dodania.

## 🐛 Bug fixes

### #B03 — Hours formatting "2h 54min" (z v1.1-partial)
Helper `fmtHours()` w 4 miejscach:
- Stats → KPI "Godzin łącznie"
- Home → Continue playing
- Lista gier inline
- Finance → Best value per gra

Twoje denerwujące "2,9h" nie istnieje nigdzie w apce.

### #B04 — Session history save (z v1.1-partial)
Każda zakończona sesja zapisuje się do `g.sessions[]` z `{startedAt, endedAt, hours, pauseMs}`. Backward compat: gry bez sesji (z v1.0.x) traktujemy jako `[]`.

## ✨ Nowe features

### #F07 — Zakładka "⏱ Czas" w Stats

Nowa subzakładka obok General / Finance / Analysis. Zawiera:

**KPI Grid (4 karty):**
- 🔥 **Passa** (current streak — dni z rzędu z min. 1 sesją)
- 🏆 **Najdłuższa passa** — rekord life-time
- ⚡ **Średnia sesja** — avg session length
- 🔝 **Najdłuższa sesja** — record session

**Dziś:**
- Total godzin grania dzisiaj (duży timer)
- Lista do 4 sesji z dzisiaj (tytuł + czas)

**Ten tydzień (Pn-Nd):**
- Total hours z porównaniem do zeszłego tygodnia ("↑ 2h 15min vs poprzedni tydzień" na zielono gdy growth)
- 7 słupków bar chart (dzień dzisiejszy podświetlony na zielono)

**Ten miesiąc:**
- Total hours z porównaniem do poprzedniego miesiąca
- **Calendar heatmap** (jak GitHub contributions!): grid 7 kolumn, każdy kwadrat = dzień, intensywność zieleni = godziny grania. Dzisiejszy dzień z obramowaniem. Przyszłe dni wyszarzone.
- Legenda "Mniej → Więcej" z 5 odcieniami

**Najczęściej grane (ten miesiąc):**
- Top 5 gier sortowanych po godzinach grania w tym miesiącu
- Format: tytuł + liczba sesji + total hours

**Edge cases obsłużone:**
- Zero sesji → empty state z hintem "Zacznij sesję na zakładce Home"
- Current week all-zero → bar chart nie rozwala się (min height 0.5)
- Current month all-zero → heatmap normalny, bez błędów
- Streak handling: nie grałeś dziś ale grałeś wczoraj? Streak się liczy od wczoraj (grace period 1 dzień)

### #F08 — Pauza w SessionTimer

Trzy stany timera z dedykowanym UI:

**Stan 1 — Nieaktywny:**
- `[▶ Zacznij sesję]` niebieski, full width

**Stan 2 — Aktywna sesja:**
- Timer zielony 00:42:15
- `[⏸ Pauza]` złoty + `[⏹ Zakończ]` zielony (50/50 split)

**Stan 3 — Spauzowana:**
- Timer złoty 00:42:15 + etykieta "⏸ PAUZA" pod spodem
- `[▶ Wznów]` zielony + `[⏹ Zakończ]` transparent (50/50 split)

**Logika:**
- Pauza zamraża licznik elapsed (nie tick'a dalej)
- `totalPause` accumulates across multiple pauses in single session
- Stop podczas pauzy: nie liczy czasu pauzy jako grania (poprawnie)
- **Stale pause guard:** jeśli user spauzuje i zamknie apkę >24h, przy reopenie auto-stop zapisuje tylko czas do momentu pauzy (nie 24h jako granie)
- **Minimum session threshold:** sesja <1 minuty nie zapisuje się (chroni przed noise z przypadkowych start/stop)

**Session metadata rozszerzone o pauzy:**
```js
{ startedAt, endedAt, hours, pauseMs }
```
`pauseMs` zapisany do `g.sessions[]` — future użyte dla "active vs idle ratio" w statystykach v1.2+.

## 🔒 Z v1.0.1 (wliczone)

Wszystko z v1.0.1 już na produkcji:
- Export PS5Vault_Backup_YYYY-MM-DD.json + toast
- RAWG flicker/race fix + loading state
- Finance info banner
- Currency zawsze zł
- Onboarding CTA "+ DODAJ PIERWSZĄ GRĘ"
- ErrorBoundary wrapper
- RAWG key env vars

## 🔧 Tech

### Service Worker cache bump: `ps5vault-v6` → `ps5vault-v7`
Krytyczne — bez tego testerzy zostają na v1.0.1 w cache.

### Version bump
`package.json` → 1.1.0

### Bundle size
- Raw: 632KB (+12KB vs v1.0.1)
- Gzipped: 180KB (+3KB vs v1.0.1)
- Dodatek to F07 UI (~200 linii JSX + helpers agregacji) oraz F08 extended state (~100 linii)
- No new deps

### localStorage impact
- Session history growing: per session ~80-120B. 100 gier × 50 sesji × 100B = 500KB. OK (limit 5-10MB)
- Backward compat: wszystkie odczyty `g.sessions` mają `|| []`

## ✅ Testing verification

- Build passes: 829 modules, no errors
- Symbols w bundle: `currentStreak`, `longestStreak`, `pausedAt`, `PAUZA`/`Pauza`
- Dead code removed (fmtDelta)
- All translations PL+EN dla F07/F08

## ⚠️ Rzeczy NIE przetestowane empirycznie (zalecam manual test na telefonie)

1. **Pauza + zamknięcie apki + wznowienie** — stale pause guard (>24h) opiera się na `useEffect` on mount. Powinien działać, ale warto zatestować
2. **Session calendar heatmap na małych ekranach** (iPhone SE) — grid-template-columns: repeat(7,1fr) powinien skalować, ale na bardzo wąskich ekranach tekst "15" etc może być za duży
3. **Streak liczenie gdy timezone change** — np. podróż. Używamy local time `toISOString().slice(0,10)` więc mogą być subtelne off-by-one edge cases. Do observation.
4. **Session sub-1min rejection** — sesje krótsze niż 60s nie zapisują się w ogóle. Decyzja produktowa, nie bug.

## Deployment checklist

1. ⬜ Wypakuj `ps5vault-v1.1.0.zip` → zastąp folder `ps5-vault/` w repo
2. ⬜ **Commit:** `v1.1.0 — Time Tracking Insights (F07 + F08) + v1.0.1 fixes`
3. ⬜ **Push origin**
4. ⬜ GitHub Actions → zielony ✓
5. ⬜ Hard refresh (Ctrl+Shift+R) na `matiseekk-dot.github.io/Games/`
6. ⬜ DevTools → Application → Service Worker → `ps5vault-v7`
7. ⬜ Otwórz Stats → nowa zakładka "⏱ Czas" widoczna
8. ⬜ Zacznij sesję na jakiejś grze → Pauzuj → Wznów → Zakończ → sprawdź że wszystko działa
9. ⬜ Stats → Czas → sprawdź że sesja się pojawiła w "Dziś" i w heatmapie
10. ⬜ Wiadomość do testerów na Google Group (draft poniżej)

## Draft wiadomości do testerów (EN, na grupę)

```
Hi everyone,

v1.1.0 is live — "Time Tracking Insights" update.

What's new:
• Pause button in session timer (finally 🎮)
• New "Time" tab in Stats showing today / this week / this month
• Daily streak counter (current + longest)
• Calendar heatmap showing when you played this month
• Longest session, avg session length metrics
• Hours now show as "2h 54min" instead of "2.9h"

Everything else from v1.0.1 is still in place (export fix, 
search fix, finance info banner etc).

This should auto-update next time you open the app. If not, 
close and reopen.

I'm really curious to see how streak tracking feels in daily 
use — please share thoughts on the Time tab after a few days 
of playing.

Thanks!
Mateusz
```

## Następne kroki

Po zweryfikowaniu że v1.1.0 działa stabilnie u testerów (~3-4 dni), decyzja:
- Czy deployować do produkcji (dzień 14, ~2 maja) z v1.1.0, czy
- Push do produkcji v1.0.1 a v1.1 jako pierwszy update po launch'u

Obecnie opcja 1 wygląda lepsza — jest więcej wartości dla nowych userów.
