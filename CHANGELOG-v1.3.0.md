# PS5 Vault — v1.3.0

**Theme:** Barcode scanner — dodawanie gier przez kod EAN z pudełka
**Previous:** v1.2.4 (Finance translation key hotfix — na produkcji)

## Co nowego

### 📷 Skaner kodów kreskowych w `RawgSearch`

W modalu *+ Dodaj grę*, obok pola wyszukiwania RAWG, jest nowy przycisk **📷**. Tap → fullscreen kamera tylna → wyceluj w EAN/UPC z tyłu pudełka → reszta dzieje się sama.

Pipeline po wykryciu kodu:

1. **`BarcodeDetector` API** wykrywa EAN-13/EAN-8/UPC-A/UPC-E (poll co ~280ms na `<video>`)
2. Camera stop natychmiast po pierwszym dopasowaniu (oszczędność baterii + intuicyjny feedback)
3. **EAN → nazwa** przez `api.upcitemdb.com/prod/trial/lookup` (free, 100/dzień/IP, CORS, no key)
4. **`cleanProductName()`** strippuje śmieci: `Sony`, `PlayStation 5`, `PS5`, `Standard/Deluxe/GOTY Edition`, `(EU/PAL/NTSC)`, `for PS5` itd.
5. **Wyczyszczona nazwa → istniejący `rawgSearch()`** → lista hitów w tym samym layoucie co dropdown RAWG
6. Tap wynik → ten sam `onSelect/fill` co manualny RAWG → pola formularza wypełnione

### Cache EAN

Każdy lookup zapisany w `localStorage['ps5vault_ean_cache']`. Cache trafia też miss-y (404 z UPCitemdb) — zero powtórnych zapytań do tego samego EAN po pierwszym strzale. W UI pokazuję `⚡ z cache` przy nazwie kiedy hitujemy lokalnie.

### Manualny fallback EAN

Pod statusem skanera zawsze widać pole **"…albo wpisz EAN ręcznie"** (numeric input, min 8 cyfr). Wpisz cyfry → *Szukaj* → ten sam pipeline. Działa zawsze — także na iOS Safari gdzie `BarcodeDetector` nie istnieje.

### Graceful degradation

- **iOS / Safari / Firefox:** brak `BarcodeDetector` w `window` → pokazuje warn `scanUnsupported` z hintem żeby wpisał EAN manualnie. Pole manualne dalej działa.
- **Camera denied (`NotAllowedError`):** `scanDenied` + hint o ustawieniach przeglądarki. Manualne pole dalej działa.
- **Inny `getUserMedia` error:** `scanError` + komunikat z `e.message`.
- **0 hits z RAWG po lookupie:** `scanNoMatch` + EAN i nazwa produktu w hint, retry button.
- **0 hits z UPCitemdb (404 cached):** `scanNoEAN` + sugestia ręcznego dodania.

### Privacy

Nowa sekcja `privacyS4Title:"Skaner kodów kreskowych (UPCitemdb)"` w polityce prywatności (PL+EN). Wyjaśnia że tylko sam numer EAN leci do `api.upcitemdb.com`, kolekcja nigdzie nie ucieka, wynik cachowany lokalnie. Sekcje S4–S7 (Tip jar, Powiadomienia, Zgłoś problem, RODO) renumerowane → S5–S8; mapa w modalu prywatności bumpnięta z `[1..7]` do `[1..8]`.

## Tech

- 1 nowy plik nie — wszystko nadal w `src/App.jsx` (one-file convention)
- Nowa stała `LS_EAN_CACHE = 'ps5vault_ean_cache'`
- Nowy komponent `BarcodeScanner` (~190 LOC) z fazami `init|scanning|lookup|rawg|results|unsupported|denied|error`
- Helpery: `eanCacheRead/Write`, `cleanProductName`, `eanLookup`
- `RawgSearch` rozszerzone o `scanOpen` state + `📷` button w `.rrow` + osadzony `<BarcodeScanner/>`
- Nowe klasy CSS: `.rscan`, `.bs-ovr`, `.bs-hdr`, `.bs-vid`, `.bs-frm`, `.bs-laser`, `.bs-hint`, `.bs-pn`, `.bs-st`, `.bs-cached`, `.bs-err`, `.bs-mlbl`, `.bs-mrow`, `.bs-actrow`, `.bs-retry`, `.bs-results-h`
- Nowa keyframe `bsLaser` (skan-line animation pod ramką)
- 18 nowych kluczy translacji w PL i EN (`scanTitle`, `scanHint`, `scanLookup`, `scanRawg`, `scanFoundAs`, `scanCachedHint`, `scanFound`, `scanNoMatch`/`Hint`, `scanNoEAN`/`Hint`, `scanUnsupported`/`Hint`, `scanDenied`/`Hint`, `scanError`, `scanRetry`, `scanManualLabel`, `scanManualPh`, `scanManualBtn`, `scanBarcodeAria`, `scanInitializing`, `scanScanning`)
- `APP_VER` 1.2.4 → 1.3.0; `package.json` ditto
- **Service Worker NIE bumpnięty** — feature jest czysto runtime'owy w bundlu, nowy `index-*.js` hash sam wymusi reload przez istniejący SW updatefound listener
- Build pass: `vite build` → `dist/assets/index-*.js` 683 kB / 195 kB gzip (było ~666 kB / ~190 kB)
- Pre-existing warning `Duplicate key "finance"` (linie 16/45 PL, 193/222 EN) niezmienione — to nie regresja, było w v1.2.4

## Browser support BarcodeDetector

| Browser              | Status                          |
|----------------------|----------------------------------|
| Chrome Android 83+   | ✅ pełna obsługa EAN/UPC         |
| Edge Android         | ✅ pełna obsługa                 |
| Chrome desktop       | ✅ (z `chrome://flags` lub natywnie zależnie od OS) |
| Safari iOS / macOS   | ❌ — fallback do manual EAN      |
| Firefox              | ❌ — fallback do manual EAN      |
| Samsung Internet     | ✅ ostatnie wersje               |

Dla iOS users używających apki jako PWA pokażemy `scanUnsupported` z czytelnym hintem + dalej mają manual EAN. Bez polifilu (ZXing/Quagga +300 kB) — apka ma być lekka.

## Deployment

1. Wypakuj ZIP → zastąp `ps5-vault/`
2. Commit: `v1.3.0 — barcode scanner (BarcodeDetector + UPCitemdb + RAWG name search)`
3. Push → GitHub Pages build
4. Hard refresh w PWA — nowy bundle hash przeładuje
5. Test smoke:
   - Tap **+ DODAJ GRĘ** → widzisz 📷 obok pola RAWG?
   - Tap 📷 → modal kamery, prośba o uprawnienia
   - Skanuj prawdziwy EAN z gry PS5 → status `Sprawdzam EAN...` → `Szukam w RAWG: ...` → lista hitów
   - Tap hit → modal się zamyka skanera, pola w formie wypełnione (tytuł, rok, gatunek, okładka, data premiery)
   - Drugi raz ten sam EAN → widzisz `⚡ z cache`
   - Disable kamerę w Site Settings → tap 📷 znowu → `Brak dostępu do kamery` + manual EAN dalej działa
6. Test na iPhone (jeśli masz): tap 📷 → `Skanowanie niedostępne` + manual EAN działa

## Co NIE jest w tym release

- **Brak polifilu** dla iOS / Firefox. Świadoma decyzja — ZXing/Quagga to +300 kB i komplikacja. iOS user wpisze EAN ręcznie (3 sekundy roboty).
- **Brak fuzzy matchingu** EAN→RAWG. Jeśli UPCitemdb zwróci dziwną nazwę typu *"Sony PS5 Console God of War Bundle"*, czyściciel nazwy może nie wystarczyć i RAWG nie znajdzie. To edge-case — manual fallback działa.
- **Brak fallback'u** na inne EAN-DB (Open Food Facts to spożywka, nie gry; reszta paid). Jeśli okaże się że upcitemdb miss-uje za dużo PS5 EANów w praktyce, to zadanie na v1.3.1.
- **Brak własnej tabeli EAN→RAWG** offline. Też zadanie na potem — najpierw zobaczymy co cache nazbiera w realnym użyciu.

## Pliki zmienione

- `src/App.jsx` (~+340 LOC: BarcodeScanner + helpery + CSS + i18n + privacy renumber)
- `package.json` (version bump)
- `CHANGELOG-v1.3.0.md` (nowy)

Bez zmian: `index.html`, `vite.config.js`, `public/manifest.json`, `public/sw.js`, `public/icons/*`, `assetlinks.json`.
