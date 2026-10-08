// marketing/shots.mjs
//
// Zrzuty ekranu PS5 Vault z przykładową kolekcją (marketing/seed.mjs) do shortów.
// Apka musi działać lokalnie: `npx vite --port 5199` w katalogu repo.
// Telefon 412×915 (Pixel 7), skala 2, więc PNG ma 824×1830.
//
// Wynik: marketing/shots/{lang}/{nazwa}.png
// Run: node marketing/shots.mjs [pl en ...] [nazwa...]

import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { makeLibrary, makeWishlist, CURRENCY } from './seed.mjs'

const require = createRequire(import.meta.url)
// Playwright zainstalowany globalnie (npm i -g playwright); lokalnie też zadziała.
const { chromium } = (() => {
  try { return require('playwright') } catch { return require(path.join(process.env.NODE_GLOBAL || '/opt/node22/lib/node_modules', 'playwright')) }
})()

const DIR = path.dirname(fileURLToPath(import.meta.url))
const URL = process.env.APP_URL || 'http://localhost:5199/Games/'
const LANGS = ['pl', 'en', 'es', 'de', 'fr', 'it', 'pt']

const ACH = ['collector_1', 'collector_2', 'collector_3', 'collector_4', 'collector_5', 'finisher_1', 'finisher_2', 'finisher_3',
  'trophy_1', 'trophy_2', 'trophy_3', 'marathoner', 'sprinter', 'critic_1', 'critic_2', 'streak_7', 'streak_30', 'genre_hopper', 'reseller']

// Cena Pro z Play Console (PRO_SETUP.md). Dla innych walut Play przelicza sam,
// więc tam pokazujemy przycisk bez kwoty, żeby nie zgadywać ceny.
const PRO_PRICE = { PLN: '19.99', EUR: '4.99' }

function seedScript({ lang, games, wishes, cur, pro, billing }) {
  const ls = {
    ps5vault_v1: JSON.stringify(games),
    ps5vault_wishlist: JSON.stringify(wishes),
    ps5vault_onboarded: '1',
    ps5vault_lang: lang,
    ps5vault_currency: cur,
    ps5vault_rate: JSON.stringify({ never: true }),
    ps5vault_last_seen_ach: JSON.stringify(ACH),
    ps5vault_menu_seen: JSON.stringify({ achievementsCount: 99, goalsAt: new Date().toISOString(), wrappedYear: 2099 }),
    ps5vault_onboarding_demo_banner_dismissed: '1',
    ps5vault_last_open: String(Date.now()),
    ps5vault_last_weekly_push: new Date().toISOString(),
  }
  if (pro) ls.ps5vault_pro = JSON.stringify({ owned: true, checkedAt: new Date().toISOString() })
  // Udajemy Play Billing jak w aplikacji z Google Play (tylko do zrzutu ekranu Pro).
  const mock = billing ? `window.getDigitalGoodsService = async () => ({
      getDetails: async () => ${PRO_PRICE[cur] ? `[{ itemId: 'pro_lifetime', price: { currency: '${cur}', value: '${PRO_PRICE[cur]}' } }]` : '[]'},
      listPurchases: async () => [] });` : ''
  return `${mock}
  window.blobToB64 = b => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result.split(',')[1]); f.readAsDataURL(b) });
  (() => { if (sessionStorage.getItem('mk_seeded')) return; sessionStorage.setItem('mk_seeded','1');
    localStorage.clear(); const d = ${JSON.stringify(ls)}; for (const k in d) localStorage.setItem(k, d[k]); })()`
}

// Każdy zrzut: co kliknąć po starcie. `tab` to tekst zakładki z i18n (szukamy po klasie .tab i indeksie).
// Teksty przycisków bierzemy z i18n apki (działa w każdym języku).
export const SHOTS = {
  home: async p => { await tab(p, 0) },
  collection: async p => { await tab(p, 1) },
  releases: async p => { await tab(p, 2) },
  finance: async p => { await tab(p, 3) },
  stats: async p => { await tab(p, 4) },
  wrapped: async p => { await menu(p, 'menuWrapped') },
  achievements: async p => { await menu(p, 'menuAchievements') },
  wishlist: async p => { await menu(p, 'menuWishlist') },
  random: async p => { await tab(p, 1); await clickText(p, 'randomPick') },
  add: async p => { await p.locator('header button, .hdr button').filter({ hasText: '+' }).first().click(); await p.waitForTimeout(1000) },
  insights: async p => { await tab(p, 3); await clickText(p, 'analysis') },
  // Import bibliotek: wiersze Steam / PSN / Xbox / Playnite w Ustawieniach.
  import: async p => {
    await menu(p, 'menuSettings')
    await p.locator('.set-row').filter({ hasText: await T(p, 'psnImportRowTitle') }).first().evaluate(el => {
      const sec = el.parentElement
      ;(sec.previousElementSibling || sec).scrollIntoView({ block: 'start' })
    })
    await p.waitForTimeout(600)
  },
  // Liczby do napisów w shortach, policzone tym samym kodem co w apce (waluta i liczba mnoga z apki).
  facts: { json: async p => p.evaluate(async () => {
    const lang = localStorage.getItem('ps5vault_lang')
    const { lsRead } = await import('/Games/src/lib/storage.js')
    const { computeShamePile } = await import('/Games/src/lib/shame.js')
    const { computeYearReview } = await import('/Games/src/lib/wrapped.js')
    const { pln, gamesWord } = await import('/Games/src/lib/format.js')
    const games = lsRead()
    const shame = computeShamePile(games)
    const y = new Date().getFullYear()
    const r = computeYearReview(games, y)
    const gta = games.find(g => g.preOrdered)
    return {
      year: y,
      games: games.length, gamesWord: gamesWord(games.length, lang),
      hours: Math.round(games.reduce((s, g) => s + (+g.hours || 0), 0)),
      done: games.filter(g => g.status === 'ukonczone').length,
      shameCount: shame.count, shameWord: gamesWord(shame.count, lang), shameValue: pln(shame.value, lang),
      shameOldest: shame.oldestTitle, shameOldestDays: shame.oldestDays,
      wrappedHours: r.totalHours, wrappedCompleted: r.gamesCompleted, wrappedPlatinums: r.platinums,
      topTitle: r.topPlayed[0] && r.topPlayed[0].game.title, topHours: r.topPlayed[0] && r.topPlayed[0].hours,
      releaseTitle: gta && gta.title,
      releaseDays: gta ? Math.ceil((Date.parse(gta.releaseDate + 'T00:00:00') - Date.now()) / 86400000) : null,
    }
  }) },
  // Gotowe obrazki do udostępniania, wygenerowane tym samym kodem co w apce.
  shame: { image: async p => p.evaluate(async () => {
    const { computeShamePile } = await import('/Games/src/lib/shame.js')
    const { buildShameImage } = await import('/Games/src/lib/shame-image.js')
    const { lsRead } = await import('/Games/src/lib/storage.js')
    const blob = await buildShameImage(computeShamePile(lsRead()), localStorage.getItem('ps5vault_lang'))
    return blobToB64(blob)
  }) },
  wrappedimg: { image: async p => p.evaluate(async () => {
    const { computeYearReview } = await import('/Games/src/lib/wrapped.js')
    const { buildWrappedImage } = await import('/Games/src/lib/wrapped-image.js')
    const { lsRead } = await import('/Games/src/lib/storage.js')
    const y = new Date().getFullYear()
    const blob = await buildWrappedImage(computeYearReview(lsRead(), y), y, localStorage.getItem('ps5vault_lang'))
    return blobToB64(blob)
  }) },
  // Bez Pro: ekran zakupu otwarty z zakładki Finanse.
  pro: { pro: false, billing: true, act: async p => { await tab(p, 3); await clickText(p, 'proUnlockBtn') } },
}

async function tab(p, i) {
  await p.locator('button.tab').nth(i).click()
  await p.waitForTimeout(1200)
}

async function T(p, key) {
  return p.evaluate(async k => {
    const m = await import('/Games/src/i18n.js')
    return m.t(localStorage.getItem('ps5vault_lang'), k)
  }, key)
}

// Klika pierwszy widoczny przycisk, którego tekst zawiera tłumaczenie klucza (bez emoji).
async function clickText(p, key) {
  const label = (await T(p, key)).replace(/^[^\p{L}\p{N}]+/u, '').trim()
  await p.locator('button:visible').filter({ hasText: label }).first().click()
  await p.waitForTimeout(1200)
}

async function menu(p, key) {
  await p.locator('button[aria-label]').filter({ hasText: '≡' }).first().click().catch(async () => {
    await p.getByRole('button', { name: await T(p, 'menuAria') }).first().click()
  })
  await p.waitForTimeout(700)
  await clickText(p, key)
}

// COVERS=1: okładki z RAWG (tak jak w apce po wyszukaniu gry). Wymaga dostępu do
// api.rawg.io i media.rawg.io, więc uruchamiaj u siebie. Wynik trafia do
// marketing/covers.json, kolejne uruchomienia biorą okładki stamtąd.
const RAWG_KEY = '0c13edec026d489a97cc183170d796fd'
async function covers(titles) {
  const file = path.join(DIR, 'covers.json')
  const cache = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
  for (const t of titles) {
    if (cache[t] !== undefined) continue
    try {
      const r = await fetch(`https://api.rawg.io/api/games?key=${RAWG_KEY}&page_size=1&search=${encodeURIComponent(t)}`)
      const j = await r.json()
      cache[t] = (j.results && j.results[0] && j.results[0].background_image) || ''
    } catch { cache[t] = '' }
  }
  fs.writeFileSync(file, JSON.stringify(cache, null, 2))
  return cache
}

async function main() {
  const args = process.argv.slice(2)
  const langs = args.filter(a => LANGS.includes(a))
  const names = args.filter(a => !LANGS.includes(a))
  const browser = await chromium.launch()
  const coverMap = process.env.COVERS ? await covers([...makeLibrary().map(g => g.title), ...makeWishlist().map(w => w.title)]) : {}
  const withCovers = list => list.map(g => ({ ...g, cover: coverMap[g.title] || '' }))
  for (const lang of langs.length ? langs : LANGS) {
    const cur = CURRENCY[lang]
    const out = path.join(DIR, 'shots', lang)
    fs.mkdirSync(out, { recursive: true })
    for (const [name, spec] of Object.entries(SHOTS)) {
      const act = typeof spec === 'function' ? spec : spec.act
      const pro = typeof spec === 'function' ? true : spec.pro !== false
      const billing = typeof spec === 'object' && spec.billing
      if (names.length && !names.includes(name)) continue
      const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 2, locale: lang, isMobile: true, hasTouch: true })
      await ctx.addInitScript(seedScript({ lang, games: withCovers(makeLibrary(cur)), wishes: withCovers(makeWishlist(cur)), cur, pro, billing }))
      const p = await ctx.newPage()
      p.on('pageerror', e => console.warn(`  [${lang}/${name}] błąd strony: ${e.message}`))
      await p.goto(URL, { waitUntil: 'networkidle' }).catch(() => {})
      await p.waitForTimeout(1500)
      if (spec.json) {
        fs.writeFileSync(path.join(out, 'facts.json'), JSON.stringify(await spec.json(p), null, 2))
        console.log(`  [${lang}] facts.json`)
        await ctx.close()
        continue
      }
      if (spec.image) {
        fs.writeFileSync(path.join(out, `${name}.png`), Buffer.from(await spec.image(p), 'base64'))
        console.log(`  [${lang}] ${name}.png (obrazek z apki)`)
        await ctx.close()
        continue
      }
      await act(p)
      await p.screenshot({ path: path.join(out, `${name}.png`), fullPage: !!process.env.FULL })
      console.log(`  [${lang}] ${name}.png`)
      await ctx.close()
    }
  }
  await browser.close()
}

main().catch(e => { console.error(e); process.exit(1) })
