// marketing/build-shorts.mjs
//
// Shorty na YouTube / Reels / TikTok z prawdziwych ekranów PS5 Vault.
// Same napisy, bez głosu, pod spodem własny podkład synthwave (marketing/shorts-music.mjs).
// Treść: marketing/shorts-data.mjs. Ekrany: marketing/shots/{lang}/*.png (marketing/shots.mjs),
// liczby z marketing/shots/{lang}/facts.json, więc napisy zgadzają się z tym, co widać na ekranie.
//
// Klatki renderuje Chromium (HTML → PNG 1080×1920), ffmpeg skleja je z krótkimi przejściami.
// Tekst trzymamy w bezpiecznej strefie Shorts: z prawej są przyciski (polubienia, komentarze),
// na dole tytuł i opis filmu.
//
// Własny klip na początek (np. półka z pudełkami nagrana telefonem): połóż plik
// marketing/intro/{slug}.mp4 albo marketing/intro/all.mp4. Skrypt weźmie z niego
// pierwsze INTRO_SEC sekund (domyślnie 2,5), przytnie do 9:16 i położy na nim napis z hooka.
//
// Wynik: marketing/shorts/{lang}/{slug}.mp4 i {slug}-cover.png
// Run: node marketing/build-shorts.mjs [pl en ...] [początek-sluga ...]

import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { buildMusic } from './shorts-music.mjs'
import { VIDEOS, COMMON, enrichFacts } from './shorts-data.mjs'

const require = createRequire(import.meta.url)
const { chromium } = (() => {
  try { return require('playwright') } catch { return require('/opt/node22/lib/node_modules/playwright') }
})()

const DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(DIR, '..')
const OUT = path.join(DIR, 'shorts')
const FFMPEG = process.env.FFMPEG_PATH || 'ffmpeg'
const INTRO_SEC = +(process.env.INTRO_SEC || 2.5)
const W = 1080
const H = 1920
const FADE = 0.18
const LANGS = Object.keys(COMMON)

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
// **słowo** w tekście = wyróżnienie neonem
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>')
const b64 = (file, type = 'png') => `data:image/${type};base64,${fs.readFileSync(file).toString('base64')}`

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { font-family: 'Syne', 'Noto Color Emoji', sans-serif; color: #E8EDF8; background: #080B14; position: relative; }
/* Tło: neonowe poświaty w kolorach apki i siatka jak w synthwave. */
.bg { position: absolute; inset: 0; background:
  radial-gradient(1000px 800px at 5% 5%, rgba(0,212,255,.42), transparent 70%),
  radial-gradient(1000px 900px at 100% 80%, rgba(167,139,250,.45), transparent 70%),
  radial-gradient(700px 600px at 90% 15%, rgba(255,77,109,.22), transparent 70%), #080B14; }
.grid { position: absolute; left: -20%; right: -20%; bottom: -10%; height: 46%;
  background-image: linear-gradient(rgba(0,212,255,.4) 3px, transparent 3px), linear-gradient(90deg, rgba(0,212,255,.4) 3px, transparent 3px);
  background-size: 90px 90px; transform: perspective(600px) rotateX(62deg); transform-origin: bottom;
  mask-image: linear-gradient(to top, rgba(0,0,0,.9), transparent); -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,.9), transparent); }
body.clip .bg { background: linear-gradient(180deg, rgba(8,11,20,.55) 0%, rgba(8,11,20,.15) 40%, rgba(8,11,20,.75) 100%); }
body.clip .grid { display: none; }
body.clip { background: transparent; }
.pill { position: absolute; left: 70px; top: 96px; display: flex; align-items: center; gap: 18px;
  font-family: 'Orbitron', sans-serif; font-size: 36px; font-weight: 900; letter-spacing: 2px; z-index: 5; }
.pill img { width: 70px; height: 70px; border-radius: 16px; box-shadow: 0 0 30px rgba(0,212,255,.6); }
.safe { position: absolute; left: 70px; right: 160px; top: 220px; bottom: 440px; display: flex; flex-direction: column; justify-content: center; z-index: 2; }
em { font-style: normal; color: #00D4FF; text-shadow: 0 0 28px rgba(0,212,255,.75); }
.kicker { align-self: flex-start; font-size: 40px; font-weight: 800; padding: 14px 30px; border-radius: 999px;
  background: rgba(255,77,109,.18); color: #FF4D6D; border: 3px solid rgba(255,77,109,.6); margin-bottom: 44px; }
.title { font-size: 120px; font-weight: 800; line-height: 1.04; letter-spacing: -2px; text-shadow: 0 6px 40px rgba(0,0,0,.6); }
.sub { font-size: 52px; font-weight: 700; color: #B9C4E0; margin-top: 40px; line-height: 1.25; }
/* Ekran apki: nagłówek u góry, telefon z neonową ramką, opcjonalnie wielka liczba na wierzchu. */
.shot { position: absolute; left: 60px; right: 150px; top: 200px; bottom: 420px; display: flex; flex-direction: column; align-items: center; z-index: 2; }
.shot .head { width: 100%; font-size: 76px; font-weight: 800; line-height: 1.08; letter-spacing: -1px; margin-bottom: 40px; }
.shot .phonebox { position: relative; flex: 1 1 0; min-height: 0; width: 100%; display: flex; justify-content: center; align-items: flex-start; }
.phone { max-width: 100%; max-height: 100%; border-radius: 44px; border: 6px solid #1E2A42;
  box-shadow: 0 0 0 3px rgba(0,212,255,.55), 0 0 70px rgba(0,212,255,.45), 0 40px 90px rgba(0,0,0,.7); }
.callout { position: absolute; right: -10px; bottom: 30px; transform: rotate(-4deg); background: #FFD166; color: #080B14;
  border-radius: 30px; padding: 22px 34px; box-shadow: 0 20px 60px rgba(0,0,0,.6), 0 0 50px rgba(255,209,102,.5); text-align: center; max-width: 620px; }
.callout .n { font-family: 'Orbitron', sans-serif; font-size: 96px; font-weight: 900; line-height: 1; white-space: nowrap; }
.callout .l { font-size: 38px; font-weight: 800; margin-top: 8px; line-height: 1.15; }
.callout.red { background: #FF4D6D; color: #fff; box-shadow: 0 20px 60px rgba(0,0,0,.6), 0 0 50px rgba(255,77,109,.6); }
.callout.green { background: #39FF6E; color: #04140a; box-shadow: 0 20px 60px rgba(0,0,0,.6), 0 0 50px rgba(57,255,110,.55); }
/* Wielka liczba */
.big .n { font-family: 'Orbitron', sans-serif; font-size: 230px; font-weight: 900; line-height: 1; letter-spacing: -4px; white-space: nowrap;
  background: linear-gradient(90deg, #00D4FF, #A78BFA 60%, #FF4D6D); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 0 40px rgba(0,212,255,.45)); }
.big .l { font-size: 76px; font-weight: 800; line-height: 1.1; margin-top: 30px; }
.big .sub { margin-top: 34px; }
/* Lista odsłaniana punkt po punkcie */
.heading { font-size: 86px; font-weight: 800; line-height: 1.06; margin-bottom: 50px; letter-spacing: -1px; }
.rows { display: flex; flex-direction: column; gap: 26px; }
.row { display: flex; align-items: center; gap: 30px; background: rgba(13,17,32,.85); border: 3px solid #1E2A42; border-radius: 30px; padding: 30px 36px; }
.row.hidden { visibility: hidden; }
.row.new { border-color: #00D4FF; box-shadow: 0 0 40px rgba(0,212,255,.35); }
.row .ico { font-size: 70px; flex: none; width: 90px; text-align: center; }
.row .txt { font-size: 54px; font-weight: 800; line-height: 1.15; }
/* Obrazek do udostępniania z apki, przechylony */
.share { position: absolute; left: 0; right: 110px; top: 200px; bottom: 420px; display: flex; flex-direction: column; align-items: center; z-index: 2; }
.share .head { font-size: 72px; font-weight: 800; line-height: 1.08; text-align: center; margin-bottom: 40px; padding: 0 60px; }
.share img { flex: 1 1 0; min-height: 0; max-width: 90%; border-radius: 36px; transform: rotate(-3deg);
  box-shadow: 0 0 0 4px rgba(255,209,102,.7), 0 0 80px rgba(255,209,102,.35), 0 40px 90px rgba(0,0,0,.7); }
/* Karta końcowa */
.end { position: absolute; left: 0; right: 0; top: 150px; bottom: 420px; display: flex; flex-direction: column; align-items: center; z-index: 2; }
.end .headline { width: 880px; text-align: center; font-size: 80px; font-weight: 800; line-height: 1.08; letter-spacing: -1px; }
.end .phonebox { flex: 1 1 0; min-height: 0; margin-top: 40px; display: flex; justify-content: center; }
.end .phone { height: 100%; width: auto; }
.end .brand { margin-top: 36px; display: flex; align-items: center; gap: 22px; font-family: 'Orbitron', sans-serif; font-size: 58px; font-weight: 900; letter-spacing: 2px; }
.end .brand img { width: 96px; height: 96px; border-radius: 22px; box-shadow: 0 0 40px rgba(0,212,255,.6); }
.end .cta { margin-top: 26px; font-size: 46px; font-weight: 800; background: linear-gradient(90deg, #00D4FF, #0A84FF); color: #04121a;
  padding: 20px 50px; border-radius: 999px; box-shadow: 0 0 50px rgba(0,212,255,.6); }
.end .free { margin-top: 18px; font-size: 36px; font-weight: 700; color: #B9C4E0; }
`

// Za długie słowa (np. niemieckie) zmniejszamy, aż się zmieszczą w szerokości.
const FIT = `<script>
document.fonts.ready.then(() => {
  for (const el of document.querySelectorAll('.title, .head, .heading, .big .n, .big .l, .callout .n, .end .headline, .row .txt')) {
    let size = parseFloat(getComputedStyle(el).fontSize)
    while ((el.scrollWidth > el.clientWidth + 1) && size > 30) { size -= 3; el.style.fontSize = size + 'px' }
  }
  document.body.dataset.ready = '1'
})
</script>`

function page(inner, ctx, { pill = true, clip = false } = {}) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head>
  <body class="${clip ? 'clip' : ''}"><div class="bg"></div><div class="grid"></div>
  ${pill ? `<div class="pill"><img src="${ctx.icon}">PS5 VAULT</div>` : ''}${inner}${FIT}</body></html>`
}

// Wycinek zrzutu ekranu (współrzędne w pikselach zrzutu 824×1830) jako data URL.
async function crop(lang, shot, box) {
  const file = path.join(DIR, 'shots', lang, `${shot}.png`)
  if (!box) return b64(file)
  const tmp = path.join(OUT, '.tmp', `${lang}-${shot}-${box.join('-')}.png`)
  if (!fs.existsSync(tmp)) {
    execFileSync(FFMPEG, ['-y', '-i', file, '-vf', `crop=${box[2]}:${box[3]}:${box[0]}:${box[1]}`, tmp], { stdio: 'ignore' })
  }
  return b64(tmp)
}

async function htmlFrames(f, ctx) {
  const { T, lang } = ctx
  switch (f.type) {
    case 'hook':
      return [{ dur: f.dur, html: page(`<div class="safe">
        ${f.kicker ? `<div class="kicker">${rich(f.kicker)}</div>` : ''}
        <div class="title">${rich(f.title)}</div>
        ${f.sub ? `<div class="sub">${rich(f.sub)}</div>` : ''}</div>`, ctx, { clip: ctx.clip }), clip: ctx.clip }]
    case 'shot': {
      const img = await crop(lang, f.shot, f.crop)
      const c = f.callout ? `<div class="callout ${f.callout.tone || ''}"><div class="n">${esc(f.callout.n)}</div>${f.callout.l ? `<div class="l">${esc(f.callout.l)}</div>` : ''}</div>` : ''
      return [{ dur: f.dur, html: page(`<div class="shot"><div class="head">${rich(f.head)}</div>
        <div class="phonebox"><img class="phone" src="${img}">${c}</div></div>`, ctx) }]
    }
    case 'big':
      return [{ dur: f.dur, html: page(`<div class="safe big"><div class="n">${esc(f.n)}</div>
        <div class="l">${rich(f.l)}</div>${f.sub ? `<div class="sub">${rich(f.sub)}</div>` : ''}</div>`, ctx) }]
    case 'list':
      return f.items.map((_, shown) => ({
        dur: f.durs[shown],
        html: page(`<div class="safe"><div class="heading">${rich(f.heading)}</div><div class="rows">${f.items.map(([ico, txt], i) =>
          `<div class="row${i > shown ? ' hidden' : i === shown ? ' new' : ''}"><div class="ico">${ico}</div><div class="txt">${rich(txt)}</div></div>`).join('')}</div></div>`, ctx),
      }))
    case 'share':
      return [{ dur: f.dur, html: page(`<div class="share"><div class="head">${rich(f.head)}</div><img src="${b64(path.join(DIR, 'shots', lang, f.image + '.png'))}"></div>`, ctx) }]
    case 'end': {
      const img = await crop(lang, f.shot || 'home', f.crop || [0, 0, 824, 1100])
      return [{ dur: f.dur, html: page(`<div class="end"><div class="headline">${rich(f.headline)}</div>
        <div class="phonebox"><img class="phone" src="${img}"></div>
        <div class="brand"><img src="${ctx.icon}">PS5 VAULT</div>
        <div class="cta">${esc(T.cta)}</div><div class="free">${esc(T.free)}</div></div>`, ctx, { pill: false }) }]
    }
    default:
      throw new Error(`Nieznany typ klatki: ${f.type}`)
  }
}

// Klip na początek: przycięty do 9:16, wyciszony (pod spodem idzie nasz podkład).
function introClip(slug) {
  for (const name of [`${slug}.mp4`, 'all.mp4']) {
    const file = path.join(DIR, 'intro', name)
    if (fs.existsSync(file)) return file
  }
  return null
}

function encode(frames, out, music, intro) {
  const args = ['-y']
  let idx = 0
  const inputs = []
  if (intro) {
    args.push('-t', String(INTRO_SEC + FADE), '-i', intro)
    inputs.push({ kind: 'intro', i: idx++ })
  }
  for (const f of frames) {
    args.push('-loop', '1', '-framerate', '30', '-t', (f.dur + FADE).toFixed(2), '-i', f.file)
    inputs.push({ kind: 'img', i: idx++, f })
  }
  args.push('-i', music)
  const musicIdx = idx
  let chain = ''
  // Każde wejście → 1080×1920, 30 kl/s. Na klipie kładziemy przezroczystą klatkę z napisem hooka.
  inputs.forEach((inp, k) => {
    if (inp.kind === 'intro') {
      chain += `[${inp.i}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},fps=30,setsar=1,format=yuv420p[s${k}];`
    } else if (inp.f.clip && intro) {
      // Hook z przezroczystym tłem leży na klipie, więc klatka hooka = klip + napis.
      chain += `[${inp.i}:v]fps=30,format=rgba[ov${k}];`
    } else {
      // Powolny najazd (Ken Burns): obraz cały czas się rusza, hook najeżdża mocniej.
      const n = Math.round((inp.f.dur + FADE) * 30)
      const zoom = inp.f.kind === 'hook' ? 0.07 : inp.f.kind === 'list' ? 0 : 0.025
      chain += `[${inp.i}:v]scale=${W * 2}:${H * 2},zoompan=z='1+${zoom}*on/${n}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${W}x${H}:fps=30,setsar=1,format=yuv420p[s${k}];`
    }
  })
  // Jeśli jest klip, pierwsza klatka hooka (clip) nakłada się na klip zamiast stać osobno.
  let parts = inputs.map((inp, k) => ({ ...inp, k }))
  let durs = parts.map(p => p.kind === 'intro' ? INTRO_SEC : p.f.dur)
  if (intro && parts[1] && parts[1].f.clip) {
    chain += `[s0][ov1]overlay=0:0:shortest=1,format=yuv420p[s0b];`
    parts = [{ ...parts[0], label: 's0b' }, ...parts.slice(2)]
    durs = [INTRO_SEC, ...durs.slice(2)]
  }
  let last = `[${parts[0].label || 's' + parts[0].k}]`
  let offset = 0
  for (let j = 1; j < parts.length; j++) {
    offset += durs[j - 1]
    const lbl = `[x${j}]`
    chain += `${last}[${parts[j].label || 's' + parts[j].k}]xfade=transition=${j === parts.length - 1 ? 'fade' : 'slideleft'}:duration=${FADE}:offset=${(offset - FADE / 2).toFixed(2)}${lbl};`
    last = lbl
  }
  const total = durs.reduce((a, b) => a + b, 0) + FADE
  chain += `${last}format=yuv420p[out];`
  chain += `[${musicIdx}:a]atrim=0:${total.toFixed(2)},afade=t=in:d=0.3,afade=t=out:st=${(total - 1.6).toFixed(2)}:d=1.6[aout]`
  args.push('-filter_complex', chain, '-map', '[out]', '-map', '[aout]', '-r', '30',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '21', '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out)
  execFileSync(FFMPEG, args, { stdio: ['ignore', 'ignore', 'pipe'] })
  return total
}

async function main() {
  const args = process.argv.slice(2)
  const langs = args.filter(a => LANGS.includes(a))
  const slugs = args.filter(a => !LANGS.includes(a))
  fs.mkdirSync(path.join(OUT, '.tmp'), { recursive: true })
  const music = buildMusic(path.join(OUT, '.tmp', 'music.wav'), FFMPEG)
  const iconFile = path.join(OUT, '.tmp', 'icon.png')
  execFileSync(FFMPEG, ['-y', '-i', path.join(ROOT, 'public', 'icons', 'icon-192.png'), '-vf', 'scale=128:128', iconFile], { stdio: 'ignore' })
  const icon = b64(iconFile)
  const browser = await chromium.launch()
  const pg = await browser.newPage({ viewport: { width: W, height: H } })

  for (const lang of langs.length ? langs : LANGS) {
    const T = COMMON[lang]
    const F = enrichFacts(JSON.parse(fs.readFileSync(path.join(DIR, 'shots', lang, 'facts.json'), 'utf8')))
    const dir = path.join(OUT, lang)
    const tmp = path.join(OUT, '.tmp', lang)
    fs.mkdirSync(dir, { recursive: true })
    fs.mkdirSync(tmp, { recursive: true })
    for (const v of VIDEOS) {
      const slug = v.slug[lang]
      if (slugs.length && !slugs.some(s => slug.startsWith(s) || v.id.startsWith(s))) continue
      const intro = introClip(v.id) || introClip(slug)
      const ctx = { T, lang, icon, clip: !!intro }
      const spec = v.frames(v.text[lang], F, T)
      const frames = []
      for (const f of spec) frames.push(...(await htmlFrames(f, ctx)).map(x => ({ ...x, kind: f.type })))
      for (const [i, f] of frames.entries()) {
        f.file = path.join(tmp, `${slug}-${String(i).padStart(2, '0')}.png`)
        await pg.setContent(f.html, { waitUntil: 'load' })
        await pg.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 15000 })
        const bad = await pg.evaluate(() => {
          const box = document.querySelector('.safe, .shot, .share, .end')
          if (!box) return false
          const b = box.getBoundingClientRect()
          const cta = document.querySelector('.end .free')
          if (cta) return cta.getBoundingClientRect().bottom > 1500
          const hit = [...box.querySelectorAll('*')].filter(el => !el.closest('.callout') && !el.querySelector('.callout') && !el.matches('.share img') && getComputedStyle(el).display !== 'inline').find(el => {
            const r = el.getBoundingClientRect()
            return r.height > 0 && (r.bottom > b.bottom + 2 || r.top < b.top - 2 || (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2))
          })
          return hit ? hit.className + ' ' + hit.textContent.slice(0, 40) : false
        })
        if (bad && process.env.DEBUG) console.warn(bad)
        if (bad) console.warn(`  UWAGA: ${lang}/${slug} klatka ${i} wychodzi poza bezpieczną strefę`)
        await pg.screenshot({ path: f.file, omitBackground: !!f.clip })
      }
      // Okładka: hook bez klipu (pełne tło), żeby miniatura była czytelna.
      const coverHtml = frames[0].clip ? frames[0].html.replace('<body class="clip">', '<body>') : frames[0].html
      await pg.setContent(coverHtml, { waitUntil: 'load' })
      await pg.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 15000 })
      await pg.screenshot({ path: path.join(dir, `${slug}-cover.png`) })
      const out = path.join(dir, `${slug}.mp4`)
      const total = encode(frames, out, music, intro)
      console.log(`  [${lang}] ${slug}.mp4  ${total.toFixed(1)} s, ${frames.length} klatek, ${(fs.statSync(out).size / 1e6).toFixed(1)} MB${intro ? ' + klip' : ''}`)
    }
  }
  await browser.close()
}

main().catch(err => { console.error('FAILED:', err); process.exit(1) })
