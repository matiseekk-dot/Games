// marketing/seed.mjs
//
// Przykładowa kolekcja do zrzutów ekranu i shortów: 48 gier gracza, który ma
// na PS5 kilka lat i sporą kupkę wstydu. Liczby są wymyślone, ale realistyczne
// (godziny, ceny, wyprzedaże, PS Plus). Ceny bazowe w złotówkach, dla innych walut
// przeliczamy i zaokrąglamy "po sklepowemu" (69,99, 59,99 itd.).
// Okładek nie ma celowo: w filmach pokazujemy apkę, nie cudze grafiki z gier.

const DAY = 86400000

function iso(daysAgo, hour = 20) {
  const d = new Date(Date.now() - daysAgo * DAY)
  d.setHours(hour, 0, 0, 0)
  return d.toISOString()
}

// [tytuł, status, gatunek, rok, godziny, ocena, cena, sklep, dni temu ostatnio grane, extra]
// status: u = ukończone, g = gram, p = planuję (kupka wstydu), x = porzucone
const RAW = [
  ['Elden Ring', 'u', 'RPG', 2022, 142, 10, 249, 'PS Store', 230, { platinum: true, extraSpend: 159 }],
  ["Baldur's Gate 3", 'u', 'RPG', 2023, 118, 10, 279, 'PS Store', 300, { platinum: true }],
  ["Marvel's Spider-Man 2", 'u', 'Action', 2023, 34, 9, 329, 'Media Expert', 400, { priceSold: 150 }],
  ['God of War Ragnarök', 'u', 'Action', 2022, 41, 10, 199, 'Allegro', 520, { platinum: true }],
  ['Astro Bot', 'u', 'Platformer', 2024, 17, 10, 249, 'PS Store', 330, { platinum: true }],
  ['Ghost of Yōtei', 'g', 'Action', 2025, 26, 9, 349, 'PS Store', 1, {}],
  ['EA SPORTS FC 26', 'g', 'Sport', 2025, 61, 7, 299, 'PS Store', 0, { extraSpend: 220 }],
  ['Helldivers 2', 'g', 'FPS', 2024, 88, 9, 169, 'PS Store', 3, {}],
  ['Resident Evil 4', 'u', 'Horror', 2023, 19, 9, 89, 'PS Store', 610, { priceNote: 'promo' }],
  ['Final Fantasy VII Rebirth', 'x', 'RPG', 2024, 23, 8, 299, 'Empik', 260, {}],
  ['Stellar Blade', 'u', 'Action', 2024, 38, 8, 179, 'Allegro', 180, { priceSold: 110 }],
  ['Gran Turismo 7', 'x', 'Racing', 2022, 12, 7, 149, 'OLX', 700, {}],
  ['Hogwarts Legacy', 'u', 'Adventure', 2023, 52, 8, 119, 'PS Store', 450, {}],
  ['Cyberpunk 2077', 'u', 'RPG', 2020, 96, 9, 99, 'PS Store', 380, { extraSpend: 119 }],
  ['Red Dead Redemption 2', 'u', 'Adventure', 2018, 71, 10, 59, 'PS Store', 900, {}],
  ['The Last of Us Part II', 'u', 'Action', 2020, 27, 10, 79, 'OLX', 1100, {}],
  ['Horizon Forbidden West', 'p', 'Action', 2022, 3, null, 129, 'PS Store', 600, {}],
  ['Death Stranding', 'p', 'Adventure', 2019, 0, null, 59, 'PS Store', null, { source: 'psplus' }],
  ['Starfield', 'x', 'RPG', 2023, 6, 5, 0, 'Other', 500, { source: 'gamepass', platform: 'Xbox Series X/S' }],
  ['Sekiro: Shadows Die Twice', 'p', 'Action', 2019, 2, null, 89, 'PS Store', 800, {}],
  ['Persona 5 Royal', 'p', 'RPG', 2020, 0, null, 99, 'PS Store', null, {}],
  ['Lies of P', 'p', 'RPG', 2023, 0, null, 149, 'PS Store', null, {}],
  ['Alan Wake 2', 'p', 'Horror', 2023, 0, null, 139, 'PS Store', null, {}],
  ['Dragon Age: The Veilguard', 'p', 'RPG', 2024, 0, null, 159, 'Allegro', null, {}],
  ['Star Wars Jedi: Survivor', 'p', 'Action', 2023, 1, null, 99, 'PS Store', 650, {}],
  ['Assassin\'s Creed Shadows', 'p', 'Adventure', 2025, 0, null, 229, 'Media Expert', null, {}],
  ['Kingdom Come: Deliverance II', 'p', 'RPG', 2025, 4, null, 249, 'PS Store', 90, {}],
  ['Silent Hill 2', 'p', 'Horror', 2024, 0, null, 199, 'PS Store', null, {}],
  ['Prince of Persia: The Lost Crown', 'p', 'Platformer', 2024, 0, null, 79, 'PS Store', null, {}],
  ['Sea of Stars', 'p', 'RPG', 2023, 0, null, 0, 'PSN', null, { source: 'psplus' }],
  ['Returnal', 'p', 'Action', 2021, 2, null, 0, 'PSN', 400, { source: 'psplus' }],
  ['Ratchet & Clank: Rift Apart', 'u', 'Platformer', 2021, 15, 9, 0, 'PSN', 720, { source: 'psplus' }],
  ['Stray', 'u', 'Adventure', 2022, 6, 8, 0, 'PSN', 800, { source: 'psplus' }],
  ['It Takes Two', 'u', 'Platformer', 2021, 14, 10, 79, 'PS Store', 560, {}],
  ['Split Fiction', 'u', 'Adventure', 2025, 15, 9, 199, 'PS Store', 160, {}],
  ['Clair Obscur: Expedition 33', 'u', 'RPG', 2025, 44, 10, 199, 'PS Store', 120, {}],
  ['Black Myth: Wukong', 'u', 'Action', 2024, 39, 8, 249, 'PS Store', 280, {}],
  ['Call of Duty: Black Ops 6', 'x', 'FPS', 2024, 21, 6, 349, 'PS Store', 340, { extraSpend: 90 }],
  ['Mortal Kombat 1', 'x', 'Fighting', 2023, 9, 6, 149, 'Allegro', 420, { priceSold: 70 }],
  ['Diablo IV', 'u', 'RPG', 2023, 64, 7, 199, 'Media Expert', 470, { priceSold: 90 }],
  ['Hades II', 'g', 'Indie', 2025, 22, 9, 119, 'PS Store', 5, {}],
  ['Hollow Knight: Silksong', 'p', 'Indie', 2025, 3, null, 89, 'PS Store', 20, {}],
  ['Metaphor: ReFantazio', 'p', 'RPG', 2024, 0, null, 189, 'PS Store', null, {}],
  ['Dead Space', 'p', 'Horror', 2023, 0, null, 69, 'PS Store', null, {}],
  ['Uncharted: Legacy of Thieves', 'u', 'Adventure', 2022, 23, 9, 69, 'PS Store', 760, {}],
  ['Demon\'s Souls', 'p', 'RPG', 2020, 5, null, 109, 'OLX', 820, {}],
  ['Tekken 8', 'p', 'Fighting', 2024, 1, null, 139, 'PS Store', 370, {}],
  ['Grand Theft Auto VI', 'p', 'Action', 2026, 0, null, 349, 'PS Store', null, { future: '2026-11-19', preOrdered: true }],
]

// Cena w złotówkach → waluta apki, zaokrąglona jak w sklepie.
const RATE = { PLN: 1, EUR: 0.25, USD: 0.27, BRL: 1.45 }
export function price(pln, cur) {
  if (!pln) return 0
  if (cur === 'PLN') return pln
  const v = pln * RATE[cur]
  return Math.max(0.99, Math.round(v) - 0.01)
}

const abbr = t => t.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

export function makeLibrary(cur = 'PLN') {
  return RAW.map(([title, s, genre, year, hours, rating, pln, store, played, x], i) => {
    const status = { u: 'ukonczone', g: 'gram', p: 'planuje', x: 'porzucone' }[s]
    // Dodane do kolekcji przed ostatnim graniem; nieruszone gry z kupki wstydu
    // kupowane po trochu przez ostatnie dwa lata.
    const added = played != null ? played + 30 + (i * 17) % 120 : 20 + (i * 37) % 700
    return {
      id: 'mk_' + i,
      title,
      abbr: abbr(title),
      status,
      year,
      genre,
      hours,
      rating,
      notes: '',
      cover: '',
      releaseDate: x.future || `${year}-06-15`,
      notifyEnabled: !!x.future,
      priceBought: price(pln, cur),
      priceSold: x.priceSold ? price(x.priceSold, cur) : null,
      storeBought: store,
      targetHours: 0,
      extraSpend: x.extraSpend ? price(x.extraSpend, cur) : '',
      platform: x.platform || 'PS5',
      platinum: !!x.platinum,
      source: x.source || 'owned',
      preOrdered: !!x.preOrdered,
      lastPlayed: played != null ? iso(played, 19 + (i % 4)) : null,
      completedAt: status === 'ukonczone' ? iso(played) : null,
      addedAt: iso(added),
      sessions: [],
    }
  })
}

// Lista życzeń: jedna gra osiągnęła cenę docelową (zielony znacznik w apce).
export function makeWishlist(cur = 'PLN') {
  const w = (id, title, genre, target, last, days) => ({
    id, title, genre, cover: '', rawgId: null, releaseDate: '',
    targetPrice: price(target, cur), lastPrice: last ? price(last, cur) : null,
    priceAt: last ? iso(days) : null, addedAt: iso(days + 40),
  })
  return [
    w('w1', 'Death Stranding 2', 'Action', 149, 139, 1),
    w('w2', 'Monster Hunter Wilds', 'RPG', 129, 199, 4),
    w('w3', 'Indiana Jones and the Great Circle', 'Adventure', 99, 179, 9),
    w('w4', 'Rise of the Ronin', 'Action', 79, null, 30),
  ]
}

export const CURRENCY = { pl: 'PLN', en: 'USD', es: 'EUR', de: 'EUR', fr: 'EUR', it: 'EUR', pt: 'BRL' }
