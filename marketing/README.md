# Marketing PS5 Vault

| Co | Gdzie |
|---|---|
| Teksty do Google Play (7 języków) | `../PLAY_STORE_LISTING.md` (źródło: `listing.mjs`) |
| Jeden plik z opisami w 7 językach do „Importuj tłumaczenia za pomocą AI” w Play Console | `store/PS5Vault-tlumaczenia-sklep.txt` |
| Zrzuty do Google Play, 8 na język | `store/{język}/` |
| Shorty YouTube / Reels / TikTok, 12 na język | `shorts/{język}/*.mp4` + `*-cover.png` |
| Kanał, harmonogram, tytuły i opisy shortów | `SHORTS.md` |
| Kanał YouTube: baner, opis w 7 językach, linki | `youtube/KANAL.md`, `youtube/banner.png` |
| **Wrzucanie po kolei** (filmy, Kopiuj tytuł/opis, ptaszki) | `Shorts-PO-KOLEI.html` |

Wszystko powstaje z prawdziwych ekranów apki z przykładową kolekcją 48 gier (`seed.mjs`).

## Generowanie od nowa

```
npm install
npx vite --port 5199                      # okno 1: apka lokalnie
node marketing/shots.mjs                  # okno 2: zrzuty ekranu apki do marketing/shots (COVERS=1 = z okładkami)
node marketing/build-store-shots.mjs      # zrzuty do sklepu
node marketing/build-shorts.mjs           # shorty (np. tylko: node marketing/build-shorts.mjs pl 01)
node marketing/build-shorts-copy.mjs      # SHORTS.md
node marketing/listing.mjs && node marketing/build-listing.mjs   # PLAY_STORE_LISTING.md
node marketing/build-store-translations.mjs   # plik do importu tłumaczeń w Play Console
```

Potrzebne: Node, ffmpeg (`FFMPEG_PATH=...`, jeśli nie ma go w PATH) i Playwright z Chromium
(`npm i -g playwright && npx playwright install chromium`).

`marketing/shots/*/*.png` nie są w repo (to pliki robocze, odtwarza je `shots.mjs`), `facts.json` jest.
