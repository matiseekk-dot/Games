// marketing/build-store-shots.mjs
//
// 8 zrzutów do strony w Google Play (1080×1920) na język, w neonowym stylu shortów:
// duży nagłówek, prawdziwy ekran apki w telefonie z poświatą, wielka liczba na wierzchu.
// Ekrany: marketing/shots/{lang}/*.png (marketing/shots.mjs).
// Wynik: marketing/store/{lang}/01..08-*.png
// Run: node marketing/build-store-shots.mjs [pl en ...]

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const { chromium } = (() => {
  try { return require('playwright') } catch { return require('/opt/node22/lib/node_modules/playwright') }
})()

const DIR = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(DIR, '..')
const W = 1080
const H = 1920

// [plik, zrzut, czy pokazać wielką liczbę kupki wstydu]
const ORDER = [['01-kupka-wstydu', 'finance', true], ['02-finanse', 'insights'], ['03-rok-w-grach', 'wrapped'], ['04-kolekcja', 'home'],
  ['05-import', 'import'], ['06-lista-zyczen', 'wishlist'], ['07-statystyki', 'stats'], ['08-pro', 'pro']]

const CAPTIONS = {
  pl: { shame: 'leży na półce', items: [
    ['Ile kasy leży **na półce?**', 'Kupka wstydu policzona co do grosza'],
    ['Ile **naprawdę** wydajesz na gry', 'Gdzie przepłacasz i co warto sprzedać'],
    ['Twój **rok w grach**', 'Godziny, ukończone gry i platyny'],
    ['Cała kolekcja **w jednym miejscu**', 'PS5, PS4, Xbox, PC i Switch'],
    ['Import **w minutę**', 'Steam, PSN, Xbox i Playnite'],
    ['Kupuj tylko **w promocji**', 'Lista życzeń z ceną docelową'],
    ['Gdzie poszedł **Twój czas**', 'Top 10, platyny i ukończone gry'],
    ['Bez subskrypcji. **Na zawsze.**', 'Pro to jeden zakup, reszta za darmo'],
  ] },
  en: { shame: 'sitting on the shelf', items: [
    ['How much money is **on your shelf?**', 'Your pile of shame, counted to the cent'],
    ['What you **really** spend on games', 'Where you overpay and what to sell'],
    ['Your **year in games**', 'Hours, games finished and platinums'],
    ['Your whole collection **in one place**', 'PS5, PS4, Xbox, PC and Switch'],
    ['Import **in a minute**', 'Steam, PSN, Xbox and Playnite'],
    ['Only buy **on sale**', 'A wishlist with target prices'],
    ['Where **your time** went', 'Top 10, platinums and games finished'],
    ['No subscription. **Forever.**', 'Pro is one purchase, the rest is free'],
  ] },
  es: { shame: 'parados en la estantería', items: [
    ['¿Cuánto dinero tienes **en la estantería?**', 'Tu pila de la vergüenza, al céntimo'],
    ['Lo que gastas **de verdad** en juegos', 'Dónde pagas de más y qué vender'],
    ['Tu **año en juegos**', 'Horas, juegos terminados y platinos'],
    ['Toda tu colección **en un lugar**', 'PS5, PS4, Xbox, PC y Switch'],
    ['Importa **en un minuto**', 'Steam, PSN, Xbox y Playnite'],
    ['Compra solo **en oferta**', 'Lista de deseos con precio objetivo'],
    ['Adónde se fue **tu tiempo**', 'Top 10, platinos y juegos terminados'],
    ['Sin suscripción. **Para siempre.**', 'Pro es una sola compra, el resto es gratis'],
  ] },
  de: { shame: 'liegen im Regal', items: [
    ['Wie viel Geld liegt **im Regal?**', 'Dein Pile of Shame, auf den Cent genau'],
    ['Was du **wirklich** für Spiele ausgibst', 'Wo du zu viel zahlst und was du verkaufen solltest'],
    ['Dein **Jahr in Spielen**', 'Stunden, beendete Spiele und Platin'],
    ['Deine ganze Sammlung **an einem Ort**', 'PS5, PS4, Xbox, PC und Switch'],
    ['Import **in einer Minute**', 'Steam, PSN, Xbox und Playnite'],
    ['Kauf nur **im Sale**', 'Wunschliste mit Zielpreis'],
    ['Wo **deine Zeit** geblieben ist', 'Top 10, Platin und beendete Spiele'],
    ['Kein Abo. **Für immer.**', 'Pro ist ein einziger Kauf, der Rest ist kostenlos'],
  ] },
  fr: { shame: 'dorment sur l’étagère', items: [
    ['Combien d’argent dort **sur l’étagère ?**', 'Ta pile de la honte, au centime près'],
    ['Ce que tu dépenses **vraiment** en jeux', 'Où tu paies trop et quoi revendre'],
    ['Ton **année en jeux**', 'Heures, jeux terminés et platines'],
    ['Toute ta collection **au même endroit**', 'PS5, PS4, Xbox, PC et Switch'],
    ['Import **en une minute**', 'Steam, PSN, Xbox et Playnite'],
    ['N’achète **qu’en promo**', 'Liste de souhaits avec prix cible'],
    ['Où est passé **ton temps**', 'Top 10, platines et jeux terminés'],
    ['Sans abonnement. **Pour toujours.**', 'Pro, c’est un seul achat, le reste est gratuit'],
  ] },
  it: { shame: 'fermi sullo scaffale', items: [
    ['Quanti soldi hai **sullo scaffale?**', 'La tua pila della vergogna, al centesimo'],
    ['Quanto spendi **davvero** in giochi', 'Dove paghi troppo e cosa vendere'],
    ['Il tuo **anno in giochi**', 'Ore, giochi finiti e platini'],
    ['Tutta la collezione **in un posto**', 'PS5, PS4, Xbox, PC e Switch'],
    ['Importa **in un minuto**', 'Steam, PSN, Xbox e Playnite'],
    ['Compra solo **in saldo**', 'Lista desideri con prezzo obiettivo'],
    ['Dov’è finito **il tuo tempo**', 'Top 10, platini e giochi finiti'],
    ['Niente abbonamento. **Per sempre.**', 'Pro è un solo acquisto, il resto è gratis'],
  ] },
  pt: { shame: 'parados na estante', items: [
    ['Quanto dinheiro está **na estante?**', 'Sua pilha da vergonha, centavo por centavo'],
    ['Quanto você **realmente** gasta com jogos', 'Onde você paga caro e o que vender'],
    ['Seu **ano em jogos**', 'Horas, jogos zerados e platinas'],
    ['Sua coleção inteira **num só lugar**', 'PS5, PS4, Xbox, PC e Switch'],
    ['Importe **em um minuto**', 'Steam, PSN, Xbox e Playnite'],
    ['Compre só **na promoção**', 'Lista de desejos com preço-alvo'],
    ['Pra onde foi **seu tempo**', 'Top 10, platinas e jogos zerados'],
    ['Sem assinatura. **Para sempre.**', 'O Pro é uma compra só, o resto é grátis'],
  ] },
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const rich = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<em>$1</em>')
const b64 = f => `data:image/png;base64,${fs.readFileSync(f).toString('base64')}`

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Syne:wght@600;700;800&display=swap');
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${W}px; height: ${H}px; overflow: hidden; }
body { font-family: 'Syne', 'Noto Color Emoji', sans-serif; color: #E8EDF8; background:
  radial-gradient(1000px 800px at 0% 0%, rgba(0,212,255,.42), transparent 70%),
  radial-gradient(1000px 900px at 100% 75%, rgba(167,139,250,.45), transparent 70%),
  radial-gradient(700px 600px at 95% 10%, rgba(255,77,109,.22), transparent 70%), #080B14; position: relative; }
.grid { position: absolute; left: -20%; right: -20%; bottom: -8%; height: 34%;
  background-image: linear-gradient(rgba(0,212,255,.35) 3px, transparent 3px), linear-gradient(90deg, rgba(0,212,255,.35) 3px, transparent 3px);
  background-size: 90px 90px; transform: perspective(600px) rotateX(62deg); transform-origin: bottom;
  -webkit-mask-image: linear-gradient(to top, rgba(0,0,0,.9), transparent); }
.top { position: absolute; left: 70px; right: 70px; top: 80px; height: 330px; display: flex; flex-direction: column; justify-content: center; text-align: center; }
.t { font-size: 92px; font-weight: 800; line-height: 1.04; letter-spacing: -1px; }
.s { font-size: 46px; font-weight: 700; color: #B9C4E0; margin-top: 22px; }
em { font-style: normal; color: #00D4FF; text-shadow: 0 0 28px rgba(0,212,255,.75); }
.phone { position: absolute; left: 50%; top: 450px; height: 1420px; transform: translateX(-50%); border-radius: 56px; border: 8px solid #1E2A42;
  box-shadow: 0 0 0 4px rgba(0,212,255,.55), 0 0 90px rgba(0,212,255,.45), 0 50px 100px rgba(0,0,0,.7); }
.callout { position: absolute; right: 40px; top: 1180px; transform: rotate(-5deg); background: #FF4D6D; color: #fff; border-radius: 34px;
  padding: 26px 40px; text-align: center; box-shadow: 0 20px 60px rgba(0,0,0,.6), 0 0 60px rgba(255,77,109,.6); }
.callout .n { font-family: 'Orbitron', sans-serif; font-size: 110px; font-weight: 900; line-height: 1; white-space: nowrap; }
.callout .l { font-size: 42px; font-weight: 800; margin-top: 8px; }
`
const FIT = `<script>document.fonts.ready.then(() => { for (const el of document.querySelectorAll('.t, .s')) {
  let s = parseFloat(getComputedStyle(el).fontSize); while (el.scrollHeight > (el.classList.contains('t') ? 210 : 120) && s > 30) { s -= 3; el.style.fontSize = s + 'px' } }
  document.body.dataset.ready = '1' })</script>`

async function main() {
  const langs = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CAPTIONS)
  const browser = await chromium.launch()
  const pg = await browser.newPage({ viewport: { width: W, height: H } })
  for (const lang of langs) {
    const C = CAPTIONS[lang]
    const F = JSON.parse(fs.readFileSync(path.join(DIR, 'shots', lang, 'facts.json'), 'utf8'))
    const out = path.join(DIR, 'store', lang)
    fs.mkdirSync(out, { recursive: true })
    for (const [i, [name, shot, shame]] of ORDER.entries()) {
      const [t, s] = C.items[i]
      const html = `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body><div class="grid"></div>
        <div class="top"><div class="t">${rich(t)}</div><div class="s">${esc(s)}</div></div>
        <img class="phone" src="${b64(path.join(DIR, 'shots', lang, shot + '.png'))}">
        ${shame ? `<div class="callout"><div class="n">${esc(F.shameValue)}</div><div class="l">${esc(C.shame)}</div></div>` : ''}${FIT}</body></html>`
      await pg.setContent(html, { waitUntil: 'load' })
      await pg.waitForFunction(() => document.body.dataset.ready === '1', null, { timeout: 15000 })
      await pg.screenshot({ path: path.join(out, `${name}.png`) })
    }
    console.log(`  [${lang}] ${ORDER.length} zrzutów`)
  }
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
