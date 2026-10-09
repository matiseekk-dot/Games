// marketing/build-youtube-banner.mjs
//
// Baner kanału YouTube PS5 Vault: 2560×1440 (YouTube wymaga min. 2048×1152, do 6 MB).
// Logo i hasło są w strefie widocznej wszędzie (1546×423 na środku), telefony z ekranami apki
// po bokach widać tylko na komputerze i telewizorze.
// Run: node marketing/build-youtube-banner.mjs → marketing/youtube/banner.png
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { chromium } = (() => {
  try { return require('playwright') } catch { return require('/opt/node22/lib/node_modules/playwright') }
})()
const DIR = path.dirname(fileURLToPath(import.meta.url))
const b64 = f => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`
const icon = b64(path.join(DIR, '..', 'public', 'icons', 'icon-512.png'))
const shot = n => b64(path.join(DIR, 'store', 'en', n))

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Syne:wght@700;800&display=swap');
* { margin: 0; box-sizing: border-box; }
body { width: 2560px; height: 1440px; overflow: hidden; position: relative; font-family: 'Syne', sans-serif; color: #E8EDF8; background:
  radial-gradient(1100px 700px at 15% 30%, rgba(0,212,255,.35), transparent 70%),
  radial-gradient(1100px 800px at 85% 70%, rgba(167,139,250,.38), transparent 70%),
  radial-gradient(700px 500px at 60% 10%, rgba(255,77,109,.18), transparent 70%), #080B14; }
.grid { position: absolute; left: -10%; right: -10%; bottom: -5%; height: 40%;
  background-image: linear-gradient(rgba(0,212,255,.35) 3px, transparent 3px), linear-gradient(90deg, rgba(0,212,255,.35) 3px, transparent 3px);
  background-size: 110px 110px; transform: perspective(700px) rotateX(62deg); transform-origin: bottom;
  -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,.9), transparent); }
.safe { position: absolute; left: 507px; top: 508px; width: 1546px; height: 423px; display: flex; align-items: center; justify-content: center; gap: 44px; }
.safe img { width: 200px; height: 200px; border-radius: 46px; box-shadow: 0 0 80px rgba(0,212,255,.6); }
.name { font-family: 'Orbitron', sans-serif; font-size: 112px; font-weight: 900; letter-spacing: 5px; line-height: 1;
  background: linear-gradient(90deg, #00D4FF, #A78BFA); -webkit-background-clip: text; color: transparent; filter: drop-shadow(0 0 30px rgba(0,212,255,.45)); }
.tag { font-size: 40px; white-space: nowrap; font-weight: 800; margin-top: 18px; }
.tag em { font-style: normal; color: #FFD166; }
.sub { font-size: 28px; font-weight: 700; color: #B9C4E0; margin-top: 14px; letter-spacing: 1px; }
.ph { position: absolute; height: 900px; border-radius: 44px; box-shadow: 0 0 0 4px rgba(0,212,255,.5), 0 0 80px rgba(0,212,255,.35), 0 40px 90px rgba(0,0,0,.7); }
</style></head><body><div class="grid"></div>
<img class="ph" src="${shot('01-kupka-wstydu.png')}" style="left:-20px; top:280px; transform: rotate(-8deg)">
<img class="ph" src="${shot('03-rok-w-grach.png')}" style="right:-20px; top:280px; transform: rotate(8deg)">
<div class="safe"><img src="${icon}"><div>
  <div class="name">PS5 VAULT</div>
  <div class="tag">Your games. Your <em>money</em>. Your time.</div>
  <div class="sub">Game tracker · pile of shame · year in games · Google Play</div>
</div></div></body></html>`

const b = await chromium.launch()
const p = await b.newPage({ viewport: { width: 2560, height: 1440 } })
await p.setContent(html, { waitUntil: 'load' })
await p.evaluate(() => document.fonts.ready)
fs.mkdirSync(path.join(DIR, 'youtube'), { recursive: true })
await p.screenshot({ path: path.join(DIR, 'youtube', 'banner.png') })
// Podgląd strefy bezpiecznej (tak baner wygląda na telefonie).
await p.screenshot({ path: path.join(DIR, 'youtube', 'banner-telefon.png'), clip: { x: 507, y: 508, width: 1546, height: 423 } })
await b.close()
console.log('marketing/youtube/banner.png')
