// marketing/build-shorts-copy.mjs
//
// marketing/SHORTS.md: jak założyć kanał, harmonogram wrzucania i tytuł + opis
// każdego shorta (z marketing/shorts-data.mjs). Run: node marketing/build-shorts-copy.mjs

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { VIDEOS, COMMON, PLAY } from './shorts-data.mjs'

const DIR = path.dirname(fileURLToPath(import.meta.url))
const LANG_ORDER = ['pl', 'en', 'de', 'pt', 'es', 'fr', 'it']
const LANG_NAME = { pl: 'Polski', en: 'Angielski', es: 'Hiszpański', de: 'Niemiecki', fr: 'Francuski', it: 'Włoski', pt: 'Portugalski (Brazylia)' }
const FLAG = { pl: '🇵🇱', en: '🇬🇧', es: '🇪🇸', de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', pt: '🇧🇷' }

// Link do Google Play z oznaczeniem źródła: Play Console → Statystyki → Pozyskiwanie
// użytkowników pokaże, ile instalacji przyszło z YouTube i z którego filmu.
const link = id => `${PLAY}&referrer=utm_source%3Dyoutube%26utm_medium%3Dshorts%26utm_campaign%3Dshort${id}`

// ── Harmonogram ────────────────────────────────────────────────────────────────
// Faza 1: 10 tematów × 7 języków, 2 filmy dziennie. W każdej rundzie każdy temat raz,
// język przesuwa się o jeden, więc po 7 rundach każdy temat jest w każdym języku,
// a jednego dnia nigdy nie ma dwóch filmów w tym samym języku ani temacie.
// Faza 2: lista życzeń (06) codziennie przed Black Friday (27.11.2026).
// Faza 3: rok w grach (03) w grudniu, gdy ludzie i tak robią podsumowania roku.
const PHASE1 = ['01', '08', '02', '05', '12', '04', '07', '10', '09', '11']
const START = new Date(Date.UTC(2026, 9, 10)) // sobota 10.10.2026
const WISH_START = new Date(Date.UTC(2026, 10, 16)) // 16.11, 11 dni przed Black Friday
const WRAP_START = new Date(Date.UTC(2026, 11, 1)) // 1.12
const DAYS = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb']
const day = (d0, n) => new Date(d0.getTime() + n * 86400000)
const fmt = d => `${DAYS[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`
const byId = Object.fromEntries(VIDEOS.map(v => [v.id, v]))

function schedule() {
  const seq = []
  for (let r = 0; r < LANG_ORDER.length; r++) {
    PHASE1.forEach((id, t) => seq.push({ id, lang: LANG_ORDER[(t + r) % LANG_ORDER.length] }))
  }
  const rows = []
  for (let i = 0; i < seq.length; i += 2) rows.push({ date: day(START, i / 2), items: seq.slice(i, i + 2) })
  LANG_ORDER.forEach((lang, i) => rows.push({ date: day(WISH_START, i), items: [{ id: '06', lang }] }))
  LANG_ORDER.forEach((lang, i) => rows.push({ date: day(WRAP_START, i), items: [{ id: '03', lang }] }))
  return rows
}

const file = (v, lang) => `${lang}/${v.slug[lang]}.mp4`

let md = `# Shorty PS5 Vault: kanał, harmonogram, tytuły i opisy

${VIDEOS.length} filmów × ${LANG_ORDER.length} języków = ${VIDEOS.length * LANG_ORDER.length} gotowych shortów w \`marketing/shorts/{język}/\`.
Każdy ma 12 do 18 sekund, format 9:16 (1080×1920), napisy, własny podkład synthwave (bez praw autorskich
osób trzecich) i prawdziwe ekrany apki. Obok każdego filmu leży \`*-cover.png\` (miniatura).
Te same pliki pasują do TikToka, Instagram Reels i reklam w Google Ads.

Generowanie od nowa (np. po zmianach w apce):
\`\`\`
npx vite --port 5199                 # w jednym oknie: apka lokalnie
node marketing/shots.mjs             # zrzuty ekranu (COVERS=1 = z okładkami gier, u siebie)
node marketing/build-shorts.mjs      # filmy (albo: node marketing/build-shorts.mjs pl 01)
node marketing/build-shorts-copy.mjs # ten plik
\`\`\`

## Kanał: osobny, na tym samym koncie Google

Na jednym koncie Google możesz mieć kilka kanałów YouTube. Shorty PS5 Vault wrzucaj na **nowy kanał**,
nie na kanał Spokojnego Rodzica: YouTube podsuwa shorty widzom podobnym do tych, którzy już oglądają kanał.
Rodzice niemowląt nie będą oglądać filmów o grach, a słabe wyniki obniżyłyby zasięgi obu tematów.

1. YouTube → zdjęcie profilowe → **Ustawienia** → **Dodaj kanał lub nim zarządzaj** → **Utwórz kanał**.
2. Nazwa: **PS5 Vault**. Uchwyt (handle): np. \`@ps5vault\` albo \`@ps5vaultapp\`, jeśli zajęty.
3. Zdjęcie profilowe: \`public/icons/icon-512.png\`. Baner: \`public/feature-graphic.png\` (YouTube przytnie środek).
4. YouTube Studio → **Dostosowywanie** → **Profil** → **Linki** → dodaj „PS5 Vault w Google Play”:
   \`\`\`
   ${PLAY}&referrer=utm_source%3Dyoutube%26utm_medium%3Dprofile
   \`\`\`
   Ten link jest klikalny pod nazwą kanału. Linki w opisie Shorta nie są klikalne, dlatego opis odsyła do profilu.
5. Opis kanału: „Tracker gier dla graczy: kolekcja, wydatki, kupka wstydu i podsumowanie roku. Bez konta i bez reklam.”

Między kanałami przełączasz się w YouTube Studio: zdjęcie profilowe → **Przełącz konto**.

## Jak wrzucać

1. YouTube Studio (kanał PS5 Vault) → **Utwórz** → **Prześlij filmy** → zaznacz kilka plików naraz.
2. Dla każdego: wklej **tytuł** i **opis** z sekcji w języku filmu (niżej). Miniatura: \`*-cover.png\`.
3. **Odbiorcy:** Nieprzeznaczony dla dzieci.
4. **Pokaż więcej → Język i certyfikacja napisów → Język filmu:** ustaw język filmu. Dzięki temu YouTube
   pokazuje film ludziom mówiącym w tym języku, więc wszystkie języki mogą być na jednym kanale.
5. **Widoczność → Zaplanuj:** wpisz datę i godzinę z harmonogramu. Możesz wrzucić cały tydzień za jednym razem.

Najlepsza pora: **18:00 i 20:30** czasu polskiego (gracze siedzą wieczorem). Filmy po angielsku i portugalsku
lepiej na 20:30 (wtedy w Ameryce jest popołudnie).

Pierwsze godziny decydują o zasięgu, więc po publikacji odpowiadaj na komentarze. Pytanie w komentarzu
(„Ile gier masz w folii?”) i przypięcie go nic nie kosztuje, a podbija rozmowę.

## Własny klip na początek (opcjonalnie, mocno polecam)

Film zaczynający się od prawdziwego obrazu zatrzymuje przewijanie lepiej niż sama grafika.
Nagraj telefonem w pionie 2 do 3 sekund: Twoja półka z pudełkami, pad w ręku albo skanowanie pudełka.
Plik połóż jako \`marketing/intro/01.mp4\` (dla filmu 01) albo \`marketing/intro/all.mp4\` (dla wszystkich)
i uruchom generator jeszcze raz: napis z hooka pojawi się na Twoim nagraniu.

**Nie wklejaj nagrań z gier** (gameplay, trailery). Materiał należy do wydawcy, a w reklamie cudzej apki to
prosta droga do roszczenia Content ID albo ostrzeżenia na nowym kanale. Pudełka na półce w Twoim pokoju są w porządku.

## Harmonogram

2 filmy dziennie od soboty 10.10. Potem lista życzeń przed Black Friday, a podsumowanie roku w grudniu.
Gdy któryś temat wyraźnie wygrywa (Studio → Analityka → wyświetlenia i „obejrzane do końca”),
zrób do niego drugą wersję: inny hook, ten sam ekran.

| Dzień | 18:00 | 20:30 |
|---|---|---|
`
for (const r of schedule()) {
  const cell = it => it ? `${FLAG[it.lang]} \`${file(byId[it.id], it.lang)}\`` : ''
  md += `| ${fmt(r.date)} | ${cell(r.items[0])} | ${cell(r.items[1])} |\n`
}

for (const lang of LANG_ORDER) {
  md += `\n---\n\n# ${FLAG[lang]} ${lang.toUpperCase()} (Język filmu: ${LANG_NAME[lang]})\n`
  for (const v of VIDEOS) {
    const yt = v.text[lang].yt
    md += `\n## ${v.id}. \`${v.slug[lang]}.mp4\`\n\n\`\`\`\n${yt.title}\n\`\`\`\n\`\`\`\n${yt.desc}\n\n${COMMON[lang].link}:\n${link(v.id)}\n\n${yt.tags}\n\`\`\`\n`
    if ([...yt.title].length > 100) throw new Error(`Tytuł za długi (${lang} ${v.id})`)
  }
}

if (/[\u2013\u2014]/.test(md)) throw new Error('Długi myślnik w tekstach')
fs.writeFileSync(path.join(DIR, 'SHORTS.md'), md)
console.log('marketing/SHORTS.md')
