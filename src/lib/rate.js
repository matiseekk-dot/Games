// v1.20.0 - Ask for a Google Play rating at a good moment: a game just completed, the
// 10th game in the collection, or closing Year in Review. Only inside the Play app (a
// rating needs the Play install), only for people who have used it for a few days, at most
// every 60 days and 3 times in total, never again after "Rate" or "Don't ask again".
// The sheet asks no opinion question first and always offers feedback next to the rating,
// so it never filters out unhappy users (Google's review guidelines).

const LS = 'ps5vault_rate';
const DAY = 24 * 3600 * 1000;
export const MIN_GAMES = 5;
export const MIN_DAYS = 3;
export const COOLDOWN_DAYS = 60;
export const MAX_ASKS = 3;

// Opens the Play Store app on the PS5 Vault page; the browser fallback covers phones
// without the Play Store app.
export const PLAY_REVIEW_URL = 'intent://details?id=com.skudev.ps5vault#Intent;scheme=market;package=com.android.vending;' +
  'S.browser_fallback_url=' + encodeURIComponent('https://play.google.com/store/apps/details?id=com.skudev.ps5vault') + ';end';

export function readRate() {
  try {
    const s = JSON.parse(localStorage.getItem(LS) || 'null');
    return s && typeof s === 'object' ? s : {};
  } catch { return {}; }
}

export function writeRate(patch) {
  const next = { ...readRate(), ...patch };
  try { localStorage.setItem(LS, JSON.stringify(next)); } catch {}
  return next;
}

export function shouldAskRating(state, games, now = Date.now()) {
  if (state.rated || state.never) return false;
  if ((state.asks || 0) >= MAX_ASKS) return false;
  const last = Date.parse(state.askedAt || '');
  if (Number.isFinite(last) && now - last < COOLDOWN_DAYS * DAY) return false;
  const real = (games || []).filter(g => !g._demo);
  if (real.length < MIN_GAMES) return false;
  const added = real.map(g => Date.parse(g.addedAt || '')).filter(Number.isFinite);
  if (!added.length) return false;
  return now - Math.min(...added) >= MIN_DAYS * DAY;
}

export function markAsked(now = Date.now()) {
  const s = readRate();
  return writeRate({ askedAt: new Date(now).toISOString(), asks: (s.asks || 0) + 1 });
}
