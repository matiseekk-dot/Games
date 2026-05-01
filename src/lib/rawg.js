// RAWG.io API client. Single function that returns a normalized list of game results.
// `playtime` (added v1.4.0) is mapped from RAWG's average-hours field — used by Modal.fill
// to prefill targetHours. Genre is resolved through RMAP (slug → PL label) with fallback
// to RAWG's English name when slug isn't in our map.
import { RAWG_KEY, RMAP } from '../constants.js';
import { mkAbbr } from './util.js';

export async function rawgSearch(q) {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://api.rawg.io/api/games?search=${encodeURIComponent(q)}&page_size=10&key=${RAWG_KEY}`, { signal:ctrl.signal });
    if (!r.ok) return [];
    return (await r.json()).results.map(g => ({
      id: g.id,
      title: g.name,
      year: g.released ? +g.released.slice(0, 4) : new Date().getFullYear(),
      releaseDate: g.released || '',
      genre: (g.genres || []).map(x => RMAP[x.slug]).filter(Boolean)[0] || g.genres?.[0]?.name || '',
      cover: g.background_image || '',
      abbr: mkAbbr(g.name),
      playtime: Number.isFinite(+g.playtime) ? +g.playtime : 0,
    }));
  } catch { return []; }
  finally { clearTimeout(tm); }
}

// v1.9.0 — Fetch suggested games for a given RAWG game ID.
// Returns up to 20 normalized game objects (same shape as rawgSearch results),
// or [] on any failure (404, network, abort). Caller is responsible for caching.
//
// RAWG endpoint: /games/{id}/suggested?key=...&page_size=20
// Suggestions are content-based (genre/tag overlap, popularity) and deterministic per-game,
// so aggressive cache TTL (~30 days in lib/recommend.js) is safe.
export async function fetchSuggested(rawgGameId) {
  if (!Number.isFinite(+rawgGameId) || +rawgGameId <= 0) return [];
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://api.rawg.io/api/games/${+rawgGameId}/suggested?key=${RAWG_KEY}&page_size=20`, { signal: ctrl.signal });
    if (!r.ok) return [];
    const j = await r.json();
    if (!j || !Array.isArray(j.results)) return [];
    return j.results.map(g => ({
      id: g.id,
      title: g.name || '',
      year: g.released ? +g.released.slice(0, 4) : null,
      releaseDate: g.released || '',
      genre: (g.genres || []).map(x => RMAP[x.slug]).filter(Boolean)[0] || g.genres?.[0]?.name || '',
      cover: g.background_image || '',
      abbr: mkAbbr(g.name || ''),
      playtime: Number.isFinite(+g.playtime) ? +g.playtime : 0,
      // RAWG aggregate rating (0–5 scale). Used to break ties when sorting recommendations.
      rawgRating: Number.isFinite(+g.rating) ? +g.rating : 0,
    })).filter(g => g.title); // drop any malformed rows
  } catch { return []; }
  finally { clearTimeout(tm); }
}

// v1.13.1 — Fetch single game by RAWG ID. Used by Modal "Aktualizuj z RAWG" button
// to refresh stale fields (releaseDate, year, genre, cover) for an existing game.
// Returns normalized object (same shape subset as rawgSearch) or null on any failure.
// Caller flashes appropriate toast on null vs success.
//
// Endpoint: /games/{id}?key=... — single game detail, includes released, genres, background_image.
// We deliberately do NOT use rawgSearch(title) because:
//   1. Game titles can change (re-launches, renames) — id is stable
//   2. Search-by-title is non-deterministic (returns 10 results, filter risk)
//   3. Single endpoint = less RAWG quota usage
export async function fetchGameById(rawgId) {
  if (!Number.isFinite(+rawgId) || +rawgId <= 0) return null;
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetch(`https://api.rawg.io/api/games/${+rawgId}?key=${RAWG_KEY}`, { signal: ctrl.signal });
    if (!r.ok) return null;
    const g = await r.json();
    if (!g || !g.id) return null;
    return {
      id: g.id,
      title: g.name || '',
      year: g.released ? +g.released.slice(0, 4) : null,
      releaseDate: g.released || '',
      genre: (g.genres || []).map(x => RMAP[x.slug]).filter(Boolean)[0] || g.genres?.[0]?.name || '',
      cover: g.background_image || '',
    };
  } catch { return null; }
  finally { clearTimeout(tm); }
}
