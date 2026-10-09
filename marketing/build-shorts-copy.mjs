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

// ── Shorts-PO-KOLEI.html ───────────────────────────────────────────────────────
// Strona do wrzucania po kolei: film, data i godzina, tytuł i opis z przyciskiem „Kopiuj”,
// ptaszek „Wrzucone” (zapamiętany w przeglądarce). Otwórz z folderu marketing
// (filmy są w shorts/ obok), np. dwuklikiem w Eksploratorze.
const escH = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const items = []
for (const r of schedule()) {
  r.items.forEach((it, k) => {
    const v = byId[it.id]
    const yt = v.text[it.lang].yt
    items.push({
      key: `${it.lang}-${it.id}`,
      date: fmt(r.date),
      time: r.items.length === 1 ? '19:00' : k === 0 ? '18:00' : '20:30',
      lang: it.lang,
      file: `shorts/${file(v, it.lang)}`,
      cover: `shorts/${it.lang}/${v.slug[it.lang]}-cover.png`,
      name: `${v.slug[it.lang]}.mp4`,
      title: yt.title,
      desc: `${yt.desc}\n\n${COMMON[it.lang].link}:\n${link(v.id)}\n\n${yt.tags}`,
    })
  })
}

const cards = items.map((it, i) => `
<article class="card" id="c${i}" data-key="${it.key}">
  <div class="num">${i + 1}</div>
  <video src="${it.file}" poster="${it.cover}" controls preload="none" playsinline></video>
  <div class="body">
    <div class="when"><b>${it.date}</b> · ${it.time} · ${FLAG[it.lang]} Język filmu: <b>${LANG_NAME[it.lang]}</b></div>
    <div class="file">📁 marketing/${escH(it.file)}</div>
    <label>Tytuł</label>
    <div class="box"><pre>${escH(it.title)}</pre><button data-copy="t${i}">Kopiuj tytuł</button></div>
    <textarea hidden id="t${i}">${escH(it.title)}</textarea>
    <label>Opis</label>
    <div class="box"><pre>${escH(it.desc)}</pre><button data-copy="d${i}">Kopiuj opis</button></div>
    <textarea hidden id="d${i}">${escH(it.desc)}</textarea>
    <div class="steps">Odbiorcy: <b>Nieprzeznaczony dla dzieci</b> · Pokaż więcej → <b>Język filmu: ${LANG_NAME[it.lang]}</b> · Miniatura: <a href="${it.cover}" download>okładka</a> · Widoczność: <b>Zaplanuj ${it.date} ${it.time}</b></div>
    <label class="done"><input type="checkbox"> Wrzucone</label>
  </div>
</article>`).join('')

const html = `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>PS5 Vault: shorty po kolei</title>
<style>
:root { --bg:#080B14; --card:#0D1120; --bdr:#1E2A42; --txt:#E8EDF8; --dim:#7B8AAD; --blu:#00D4FF; --grn:#39FF6E; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--bg); color: var(--txt); font: 15px/1.45 system-ui, 'Segoe UI', Roboto, sans-serif; }
header { position: sticky; top: 0; z-index: 5; background: rgba(8,11,20,.95); border-bottom: 1px solid var(--bdr); padding: 14px 16px; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
h1 { margin: 0; font-size: 20px; color: var(--blu); }
.prog { color: var(--dim); }
.bar { flex: 1 1 200px; height: 8px; background: var(--bdr); border-radius: 9px; overflow: hidden; }
.bar i { display: block; height: 100%; background: linear-gradient(90deg, var(--blu), var(--grn)); width: 0; }
header button, .box button { background: var(--blu); color: #04121a; border: 0; border-radius: 8px; padding: 8px 12px; font-weight: 700; cursor: pointer; }
header label { color: var(--dim); display: inline; margin: 0; font-size: 14px; text-transform: none; letter-spacing: 0; }
main { max-width: 980px; margin: 0 auto; padding: 16px; }
.intro { background: var(--card); border: 1px solid var(--bdr); border-radius: 14px; padding: 14px 16px; margin-bottom: 16px; color: var(--dim); }
.intro b { color: var(--txt); }
.card { position: relative; display: flex; gap: 16px; background: var(--card); border: 1px solid var(--bdr); border-radius: 14px; padding: 14px; margin-bottom: 14px; }
.card.next { border-color: var(--blu); box-shadow: 0 0 24px rgba(0,212,255,.25); }
.card.isdone { opacity: .45; }
.hide .card.isdone { display: none; }
.num { position: absolute; left: -8px; top: -8px; background: var(--blu); color: #04121a; font-weight: 800; border-radius: 999px; min-width: 30px; height: 30px; display: grid; place-items: center; padding: 0 8px; }
video { width: 200px; aspect-ratio: 9/16; background: #000; border-radius: 10px; flex: none; }
.body { flex: 1; min-width: 0; }
.when { font-size: 16px; }
.file { color: var(--dim); font-size: 13px; margin: 4px 0 8px; word-break: break-all; }
label { display: block; color: var(--dim); font-size: 12px; text-transform: uppercase; letter-spacing: .5px; margin-top: 8px; }
.box { display: flex; gap: 8px; align-items: flex-start; }
pre { flex: 1; margin: 2px 0 0; white-space: pre-wrap; word-break: break-word; font: inherit; background: #111827; border: 1px solid var(--bdr); border-radius: 8px; padding: 8px 10px; max-height: 170px; overflow: auto; }
.box button.ok { background: var(--grn); }
.steps { margin-top: 10px; color: var(--dim); font-size: 13px; }
.steps b { color: var(--txt); } a { color: var(--blu); }
.done { margin-top: 10px; font-size: 15px; text-transform: none; letter-spacing: 0; color: var(--txt); cursor: pointer; }
.done input { width: 18px; height: 18px; vertical-align: -3px; }
@media (max-width: 640px) { .card { flex-direction: column; } video { width: 100%; max-width: 260px; } }
</style></head>
<body>
<header>
  <h1>PS5 Vault: shorty po kolei</h1>
  <span class="prog" id="prog"></span>
  <div class="bar"><i id="bar"></i></div>
  <button id="next">Następny do wrzucenia ↓</button>
  <label><input type="checkbox" id="hide"> ukryj wrzucone</label>
</header>
<main>
  <div class="intro">
    Kanał: <b>PS5 Vault</b> (nie Spokojny Rodzic). YouTube Studio → <b>Utwórz → Prześlij filmy</b>.
    Przy każdym filmie: wklej tytuł i opis, ustaw <b>Język filmu</b>, dodaj okładkę i <b>Zaplanuj</b> na podaną datę i godzinę.
    Ptaszek „Wrzucone” zapamiętuje ta przeglądarka. Plik musi leżeć w folderze <b>marketing</b>, obok folderu <b>shorts</b>.
  </div>
  ${cards}
</main>
<script>
const KEY = 'ps5vault_shorts_done'
let done = {}
try { done = JSON.parse(localStorage.getItem(KEY) || '{}') } catch {}
const cards = [...document.querySelectorAll('.card')]
function save() { try { localStorage.setItem(KEY, JSON.stringify(done)) } catch {} }
function refresh() {
  let n = 0, next = null
  for (const c of cards) {
    const d = !!done[c.dataset.key]
    c.classList.toggle('isdone', d)
    c.querySelector('.done input').checked = d
    c.classList.remove('next')
    if (d) n++; else if (!next) next = c
  }
  if (next) next.classList.add('next')
  document.getElementById('prog').textContent = n + ' / ' + cards.length + ' wrzuconych'
  document.getElementById('bar').style.width = (100 * n / cards.length) + '%'
  return next
}
for (const c of cards) c.querySelector('.done input').addEventListener('change', e => { done[c.dataset.key] = e.target.checked; save(); refresh() })
document.getElementById('next').onclick = () => { const n = refresh(); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'start' }) }
document.getElementById('hide').onchange = e => document.body.classList.toggle('hide', e.target.checked)
document.querySelectorAll('[data-copy]').forEach(b => b.onclick = async () => {
  const text = document.getElementById(b.dataset.copy).value
  try { await navigator.clipboard.writeText(text) } catch {
    const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove()
  }
  const old = b.textContent; b.textContent = 'Skopiowane ✓'; b.classList.add('ok')
  setTimeout(() => { b.textContent = old; b.classList.remove('ok') }, 1500)
})
refresh()
</script>
</body></html>
`
if (/[–—]/.test(html)) throw new Error('Długi myślnik w HTML')
fs.writeFileSync(path.join(DIR, 'Shorts-PO-KOLEI.html'), html)
console.log('marketing/Shorts-PO-KOLEI.html')
