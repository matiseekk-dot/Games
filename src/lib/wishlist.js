// v1.20.2 - Wishlist with a target price. There is no free PlayStation Store price API, so
// the user types the price they would pay and, when they spot a sale, the current price;
// the app says when the target is reached. "Check PS Store" opens the store search, which
// redirects to the user's own region. Kept apart from the collection so wishlist games
// never touch stats, money totals or achievements. Included in backups (storage.js) and
// the Drive copy (drivebackup.js).
import { LS_WISHLIST, EF } from '../constants.js';
import { uid, mkAbbr } from './util.js';
import { addTombs, removedIds } from './sync.js';

const num = v => (v === null || v === undefined || v === '' || !Number.isFinite(+v) ? null : +v);

function clean(w) {
  if (!w || typeof w !== 'object' || typeof w.title !== 'string' || !w.title.trim()) return null;
  return {
    id: typeof w.id === 'string' && w.id ? w.id : uid(),
    title: w.title.trim(),
    cover: typeof w.cover === 'string' ? w.cover : '',
    rawgId: Number.isFinite(+w.rawgId) && +w.rawgId > 0 ? +w.rawgId : null,
    releaseDate: typeof w.releaseDate === 'string' ? w.releaseDate : '',
    genre: typeof w.genre === 'string' ? w.genre : '',
    targetPrice: num(w.targetPrice),
    lastPrice: num(w.lastPrice),
    priceAt: typeof w.priceAt === 'string' ? w.priceAt : null,
    addedAt: typeof w.addedAt === 'string' ? w.addedAt : new Date().toISOString(),
    ...(typeof w.updatedAt === 'string' ? { updatedAt: w.updatedAt } : {}),
  };
}

export function cleanWishes(list) {
  return Array.isArray(list) ? list.map(clean).filter(Boolean) : [];
}

export function wishRead() {
  try { return cleanWishes(JSON.parse(localStorage.getItem(LS_WISHLIST) || '[]')); } catch { return []; }
}

// v1.22.0 - stamps updatedAt on changed entries and remembers deletions for the Drive sync.
// raw = list already merged by the sync, written as is.
const sig = w => JSON.stringify({ ...w, updatedAt: undefined });
export function wishWrite(list, { raw = false } = {}) {
  let out = list;
  if (!raw) {
    const prev = wishRead();
    const old = new Map(prev.map(w => [w.id, w]));
    const now = new Date().toISOString();
    out = list.map(w => {
      const o = old.get(w.id);
      return o && sig(o) === sig(w) ? w : { ...w, updatedAt: now };
    });
    addTombs(removedIds(prev, out), 'wish', now);
  }
  try { localStorage.setItem(LS_WISHLIST, JSON.stringify(out)); } catch {}
  return out;
}

// From a RAWG search result
export function newWish(item, now = new Date().toISOString()) {
  return clean({ title: item.title, cover: item.cover, rawgId: item.id, releaseDate: item.releaseDate, genre: item.genre, addedAt: now, id: uid() });
}

const norm = s => String(s || '').trim().toLowerCase();
export function sameGame(a, b) {
  if (a.rawgId && b.rawgId) return +a.rawgId === +b.rawgId;
  return norm(a.title) === norm(b.title);
}

export function targetHit(w) {
  return w.targetPrice !== null && w.lastPrice !== null && w.lastPrice <= w.targetPrice;
}

// Reached targets first, then newest
export function sortWishes(list) {
  return [...list].sort((a, b) => (targetHit(b) - targetHit(a)) || String(b.addedAt).localeCompare(String(a.addedAt)));
}

// Merge a backup's wishlist into the current one, skipping games already on it
export function mergeWishlists(current, incoming) {
  const out = [...current];
  for (const w of cleanWishes(incoming)) if (!out.some(x => x.id === w.id || sameGame(x, w))) out.push(w);
  return out;
}

// "Bought": becomes a normal collection game, priced at the last seen price (or the target)
export function wishToGame(w, now = new Date().toISOString()) {
  const price = w.lastPrice ?? w.targetPrice;
  return {
    ...EF,
    id: uid(),
    title: w.title,
    abbr: mkAbbr(w.title),
    cover: w.cover || '',
    rawgId: w.rawgId,
    releaseDate: w.releaseDate || '',
    year: w.releaseDate ? +w.releaseDate.slice(0, 4) : new Date(now).getFullYear(),
    genre: w.genre || '',
    priceBought: price !== null && price !== undefined ? String(price) : '',
    status: 'planuje',
    addedAt: now,
    sessions: [],
  };
}

export function psStoreSearchUrl(title) {
  return 'https://store.playstation.com/search/' + encodeURIComponent(String(title || '').trim());
}

// v1.22.0 - price history and deal alerts: no free PS Store price source exists, so the
// wishlist links to PSprices, which keeps the history and sends sale e-mails. The store
// region follows the app currency (and the language for the euro).
const REGION_BY_CUR = { PLN: 'pl', USD: 'us', GBP: 'gb', BRL: 'br', CAD: 'ca', AUD: 'au', MXN: 'mx', CZK: 'cz', SEK: 'se', NOK: 'no' };
const EURO_LANG = { de: 'de', fr: 'fr', es: 'es', it: 'it', pt: 'pt' };
export function priceRegion(currency, lang) {
  if (currency === 'EUR') return EURO_LANG[lang] || 'de';
  return REGION_BY_CUR[currency] || (lang === 'pl' ? 'pl' : 'us');
}
export function priceHistoryUrl(title, currency, lang) {
  return `https://psprices.com/region-${priceRegion(currency, lang)}/search/?q=${encodeURIComponent(String(title || '').trim())}&platform=PS5`;
}
