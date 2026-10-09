// v1.20.1 - "Pile of shame": games the user has but never started (no hours logged, not
// completed or abandoned, not a pre-order, already released), demo games excluded.
// Unlike the Finance "Unplayed games" card, which counts only games with a purchase price,
// the pile also includes PS Plus / Game Pass / free games; money counts only bought games.
import { isOwned } from '../constants.js';
import { daysUntil } from './util.js';

const DAY = 24 * 3600 * 1000;

export function computeShamePile(games, now = Date.now()) {
  const pile = (games || []).filter(g =>
    !g._demo &&
    g.status !== 'ukonczone' && g.status !== 'porzucone' &&
    (!g.hours || +g.hours === 0) &&
    !g.preOrdered &&
    !(g.releaseDate && daysUntil(g.releaseDate) > 0));
  const value = pile.filter(isOwned).reduce((s, g) => s + (+g.priceBought || 0) + (+g.extraSpend || 0), 0);
  // targetHours is prefilled from RAWG's average playtime when a game is picked from search
  const hours = Math.round(pile.reduce((s, g) => s + (+g.targetHours || 0), 0));
  let oldest = null;
  for (const g of pile) {
    const at = Date.parse(g.addedAt || '');
    if (Number.isFinite(at) && (!oldest || at < oldest.at)) oldest = { at, title: g.title };
  }
  const oldestDays = oldest ? Math.max(0, Math.floor((now - oldest.at) / DAY)) : 0;
  // Priciest first, so the pile on the image shows the most "expensive shame"
  const covers = [...pile].sort((a, b) => (+b.priceBought || 0) - (+a.priceBought || 0)).slice(0, 6)
    .map(g => ({ title: g.title, cover: g.cover || '' }));
  return { count: pile.length, value: Math.round(value), hours, oldestTitle: oldest ? oldest.title : '', oldestDays, covers };
}
