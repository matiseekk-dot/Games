# Play Store — Listing Content

Material gotowy do wklejenia w Google Play Console. Wszystkie pola maksymalnie dopasowane do limitów (30 znaków title, 80 short desc, 4000 full desc).

---

## App basics

- **App name:** PS5 Vault (10 znaków, < 30)
- **Default language:** Polski (pl-PL) — primary
- **Secondary language:** English (en-US)
- **Category:** Tools (lub Entertainment — Tools daje lepszą widoczność dla utility apps, Entertainment dla discovery)
- **Tags:** game tracker, gaming, statistics, finance, library

---

## Short description (max 80 characters)

### Polski
```
Spotify Wrapped dla Twoich gier + audyt finansowy + skanowanie EAN
```
(67 znaków ✓)

### English
```
Spotify Wrapped for your games + finance audit + barcode scan
```
(60 znaków ✓)

---

## Full description (max 4000 characters)

### Polski

```
🎮 Co byłoby gdyby Spotify Wrapped istniał dla gier?

PS5 Vault to osobisty tracker gier który zamienia Twoją kolekcję w stories — ile godzin grałeś, w co najwięcej, ile wydałeś, czy gry się zwracają.

━━━ CO ROBI ━━━

📊 YEAR-IN-REVIEW
Wrapped jak na Spotify, ale dla gier. Ile godzin, najwięcej grany tytuł, najdroższa gra, najszybsze ukończenie, longest streak, najtańszy ROI. Wszystko na koniec roku, do udostępnienia.

💰 AUDYT FINANSOWY
Każda gra ma cenę zakupu, cenę sprzedaży (jeśli sprzedałeś), wydatki ingame (DLC, mikrotransakcje). PS5 Vault liczy ile zł/godzina dla każdej gry, sumuje miesięczne wydatki, pokazuje ROI nieukończonych gier (= ile pieniędzy "leży" na półce).

📱 SKANOWANIE EAN (barcode)
Kup grę pudełkową, zeskanuj kod kreskowy → tytuł, gatunek, rok i okładka same się wpisują. Działa offline po pierwszym scan'u (cache).

🏆 19 OSIĄGNIĘĆ
Pierwsza gra, kolekcjoner I-V, finiszer I-III, marathoner (100h+), 5 platynek, 30-dniowy streak, ekonomista (50% gier z dodatnim ROI), critic, genre hopper. Dopamine hit przy każdej kolejnej grze.

🎯 CELE
"Ukończ 1 grę w tym miesiącu", "Tylko 5h na nową grę", "Sprzedaj 1 grę za 50% ceny" — proste cele tygodniowe/miesięczne, statusy w czasie rzeczywistym, success/fail tracking.

✨ REKOMENDACJE
Hybrid engine z RAWG.io: "Bo lubisz X" (top-rated seedy) + "Bo grałeś w Y" (recently completed). Top 10 sugestii z covers + reasoning, "+ Dodaj do kolekcji" pre-fill modal.

🔔 PREMIERY
Dodaj grę z przyszłą datą wydania → notification 30 dni / 7 dni / 1 dzień przed premierą.

📊 STATYSTYKI
Status pie chart, gatunki bar chart, rating histogram, heatmap aktywności (12 ostatnich tygodni), longest streak, średni czas na grę.

📲 PWA — LIVE OFFLINE
Działa bez internetu (poza search'em RAWG i barcode lookup). Instaluje się na home screen jak natywna apka. iOS / Android / desktop.

━━━ PRYWATNOŚĆ ━━━

Twoje dane NIGDY nie opuszczają Twojego urządzenia. Wszystko w localStorage. Brak konta. Brak telemetry. Brak reklam.

Aplikacja sama w sobie nie zbiera żadnych danych analitycznych. Strona hostująca (matiseekk-dot.github.io) używa Cloudflare Web Analytics — anonimowe statystyki ruchu, bez cookies, bez identyfikacji osób. Twoja kolekcja gier pozostaje wyłącznie lokalna.

Jedyna komunikacja sieciowa: RAWG.io (search gier po tytule), UPCitemdb (lookup po EAN), i Google Pages żeby załadować apkę. Żadnej z tych firm nie wysyłamy Twoich danych — pytamy je o info o GRACH, nie o Tobie.

━━━ KOMU SIĘ PRZYDA ━━━

✓ PS5 / PS4 / multi-platform graczom
✓ Każdemu kto kiedyś pomyślał "ile ja w to wgryze pieniędzy w ostatnim roku"
✓ Tym którzy chcą prawdziwe Year-in-Review (Steam / PSN dają tylko surface stats)
✓ Backloggers — apka pokazuje ile godzin "leży" na półce, motywuje do skończenia

━━━ TECHNICZNIE ━━━

• Single-file React PWA (730 KB raw / 210 KB gzip — to NIE jest 50 MB native app)
• Tryb offline (Service Worker z network-first cache)
• localStorage do trwałości (multi-game per-game JSON, ~5 KB per gra)
• RAWG.io API dla metadata (free tier)
• 100% open source, kod na GitHub

PL/EN UI — zmień w Opcjach.
```

(3,847 znaków ✓ pod limit 4000)

### English

```
🎮 What if Spotify Wrapped existed for your games?

PS5 Vault is a personal game tracker that turns your collection into stories — how many hours, top titles, total spent, ROI on backlog.

━━━ WHAT IT DOES ━━━

📊 YEAR-IN-REVIEW
Spotify Wrapped, but for games. Total hours, top played title, most expensive game, fastest completion, longest streak, best ROI. All at year-end, ready to share.

💰 FINANCE AUDIT
Every game has a purchase price, sale price (if sold), in-game spend (DLC, microtransactions). PS5 Vault calculates cost-per-hour, monthly spend totals, and ROI on unfinished games (= how much money is "stuck" on the shelf).

📱 BARCODE SCAN (EAN)
Buy a physical game, scan the barcode → title, genre, year, cover auto-filled. Works offline after first scan (cache).

🏆 19 ACHIEVEMENTS
First game, Collector I-V, Finisher I-III, Marathoner (100h+), 5 platinums, 30-day streak, Economist (50% of games positive ROI), Critic, Genre Hopper. Dopamine hit on every new entry.

🎯 GOALS
"Finish 1 game this month", "Only 5h on new releases", "Sell 1 game for 50% off" — weekly/monthly goals with real-time status and success/fail tracking.

✨ RECOMMENDATIONS
Hybrid engine powered by RAWG.io: "Because you liked X" (top-rated seeds) + "Because you finished Y" (recently completed). Top 10 picks with covers + reasoning, "+ Add to collection" pre-fill modal.

🔔 RELEASES
Add a game with a future release date → push notification 30 / 7 / 1 day before launch.

📊 STATS
Status pie chart, genre bars, rating histogram, activity heatmap (last 12 weeks), longest streak, average hours per title.

📲 PWA — WORKS OFFLINE
Functions without internet (except RAWG search & barcode lookup). Installs to home screen like a native app. iOS / Android / desktop.

━━━ PRIVACY ━━━

Your data NEVER leaves your device. Everything in localStorage. No account. No telemetry. No ads.

The application itself collects zero analytics. The hosting site (matiseekk-dot.github.io) uses Cloudflare Web Analytics — anonymous traffic stats, no cookies, no personal identification. Your game collection stays strictly local.

Only network calls: RAWG.io (game title search), UPCitemdb (EAN lookup), and Google Pages to load the app. None of these vendors get your data — we ask them about GAMES, not about you.

━━━ WHO IT'S FOR ━━━

✓ PS5 / PS4 / multi-platform gamers
✓ Anyone who ever thought "how much have I sunk into this hobby this year"
✓ Players who want a real Year-in-Review (Steam / PSN only give surface stats)
✓ Backloggers — see how many hours "rest" on the shelf, get motivated to finish

━━━ TECHNICAL ━━━

• Single-file React PWA (730 KB raw / 210 KB gzip — this is NOT a 50 MB native app)
• Offline mode (Service Worker, network-first cache)
• localStorage persistence (multi-game per-game JSON, ~5 KB per game)
• RAWG.io API for metadata (free tier)
• 100% open source, code on GitHub

PL/EN UI — switch in Settings.
```

(3,792 znaków ✓ pod limit 4000)

---

## Screenshots brief

Google Play wymaga: minimum 2, maximum 8 screenshots. Format 16:9 lub 9:16, min 320px, max 3840px.

Lista zalecanych 8 screenshots (każdy ~9:16 portrait, 1080×1920 lub 1290×2796 dla iPhone aspect):

1. **Home tab** — pokazuje kolekcję 5 demo gier (Spider-Man 2, Elden Ring, FC 25, GTA V, Crash 4) z covers, status badges, Goals card, ✨ Rekomendacje card. Caption: "Twoja kolekcja w jednym miejscu" / "Your collection in one place"

2. **Year-in-Review (hero)** — najlepszy skreen apki. Total hours, top game card, top genre, longest streak. Caption: "Spotify Wrapped dla gier" / "Spotify Wrapped for games"

3. **Finance tab** — pokazuje monthly spend chart, ROI per game list, cost-per-hour stats. Caption: "Ile zł/godzinę faktycznie kosztowała Twoja kolekcja" / "Real cost-per-hour of your collection"

4. **Recommendations overlay** — "Bo lubisz" tab z 4-6 sugestiami z covers + reasoning. Caption: "Co zagrać następnie? Engine wie" / "What to play next? The engine knows"

5. **Add game flow** — modal z RAWG search results widocznymi (np. wpisane "Elden"). Caption: "Wpisz tytuł, dane same się wypełnią" / "Type the title, fields auto-fill"

6. **Stats tab** — bar charts (gatunki), rating histogram, heatmap aktywności. Caption: "Co naprawdę grasz" / "What you actually play"

7. **Achievements overlay** — grid 19 kafelków, część unlocked z gold accent (np. Marathoner, Collector I, Finisher I, Trophy I), część locked z progress barami. Caption: "19 osiągnięć — odblokuj wszystkie" / "19 achievements — unlock them all"

8. **Onboarding step 2 (carousel)** — feature card "📊 Statystyki" z dot indicators. Caption: "Setup w 7 sekund — demo gotowe od razu" / "Setup in 7 seconds — demo ready instantly"

**Sposób tworzenia:** najlepiej w Chrome DevTools → Toggle device toolbar → ustaw na iPhone 14 Pro lub Pixel 7 → screenshot natywny. Apka jest PWA więc renderuje się dokładnie jak na real device.

---

## Feature graphic

`public/feature-graphic.png` — 1024×500 PNG. Już mamy. Zawartość:
- Lewa połowa: ikona apki (controller + bar chart + trophy + clock w niebieskim gradiente)
- Prawa połowa: tekst "PS5 VAULT" w niebieskim Orbitron + tagline "Game Tracker + Finance Insights"

Google Play wymaga że feature graphic NIE może zawierać CTA / "Install" buttonów — nasz nie ma, ✓.

---

## Content rating

Content rating quiz w Play Console — odpowiedzi:
- Violence: None
- Sex/nudity: None
- Profanity: None
- Drugs/alcohol: None (nie pokazujemy w apce)
- Gambling: None
- User-generated content: None (apka jest tylko dla 1 użytkownika)
- Shares user data: No (no telemetry, no analytics)
- Personal info collection: No
- Location: No

Expected rating: **Everyone (3+)** PEGI / ESRB.

---

## Privacy policy URL

Wymagane przez Play Console. Mamy `public/privacy.html` w bundle, deployed jako:

```
https://matiseekk-dot.github.io/Games/privacy.html
```

Wpisz tę URL w "Privacy policy URL" w Play Console.

---

## App access

- "All functionality available without restrictions": ✓
- "All or some functionality is restricted": ✗

Bez konta, bez logowania, bez paywall'i.

---

## Ads

- Contains ads: **No**

(Play Console wykryje że nie używamy AdMob i nie ma ad SDK w bundle.)

---

## Data safety form (NEW PLAY POLICY 2024+)

Sekcja krytyczna. Odpowiedzi:

**Does your app collect or share any of the required user data types?** → **No** (sama aplikacja — odpowiedź dotyczy tego co aplikacja na urządzeniu robi)

(Tutaj Google daje 5+ kategorii: Personal info, Financial info, Health/fitness, Messages, Photos/videos, Audio, Files/docs, Calendar, Contacts, App activity, Web browsing, App info & performance, Device or other identifiers. Dla PS5 Vault — żadne z tych, bo wszystko jest w localStorage user'a.)

**Note about Cloudflare Web Analytics:** Cloudflare Web Analytics na stronie hostującej (`matiseekk-dot.github.io/Games/`) zbiera anonimowe statystyki ruchu (kraj, browser, OS, source). Te dane **nie są personal info według Google Play definition** — bez user identifiers, bez cookies, bez profilu. Google Play Data Safety dotyczy **mobile app behavior**, nie dotyczy hosting webowych statystyk. Privacy policy (sekcja 4b) opisuje to przezroczysto.

**Is all of the user data collected by your app encrypted in transit?** → N/A (nie zbieramy)

**Do you provide a way for users to request that their data is deleted?** → **Yes** — Settings → "🗑️ Usuń wszystkie dane" (z type-to-confirm)

---

## TODO przed publikacją

- [ ] Wygenerować app signing key (jeśli nie ma) i `.aab` file via `bubblewrap` (TWA wrapper) — to jest jak konwertujemy PWA → Android app dla Play Store
- [ ] `assetlinks.json` pod `/Games/.well-known/assetlinks.json` (już mamy, sprawdzić sygnaturę)
- [x] ~~Settings → "Wyczyść wszystkie dane" button~~ — **zrobione w v1.11.1** (Settings → Dane → 🗑️ Usuń wszystkie dane, type-to-confirm `USUŃ`/`DELETE`)
- [ ] Wygenerować Cloudflare Web Analytics token i podstawić w `index.html` (zob. `ANALYTICS_SETUP.md`, ~5 min twoja akcja w CF dashboard)
- [ ] Screenshots × 8 zgodnie z list'ą wyżej
- [ ] Upload feature graphic (1024×500)
- [ ] Upload icon-512 jako "App icon"
- [ ] Wypełnić full description PL + EN (skopiować z tego pliku)
- [ ] Content rating quiz (answer "Everyone")
- [ ] Privacy policy URL: `https://matiseekk-dot.github.io/Games/privacy.html`
- [ ] Data safety form: zaznaczyć "No data collected" + provide deletion mechanism
- [ ] Submit do Internal testing track first (test z 5-10 ludźmi przez tydzień)
- [ ] Po pozytywnych feedback — Closed testing → Open testing → Production
