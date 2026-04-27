// v1.9.0 — Recommendations engine.
//
// Strategy (option C from CHANGELOG-v1.8.0): hybrid two-track recommendations
//   1. "Bo lubisz X"    — seeds = top-3 highest-rated games (rating ≥ 8)
//   2. "Bo grałeś w Y"  — seeds = last-3 completed games by completedAt desc
//
// For each seed game with a stored rawgId, we fetch /games/{id}/suggested via
// lib/rawg.fetchSuggested, then aggregate + dedupe + score the union.
//
// Cache (LS_RECS_CACHE) is keyed by RAWG game ID. TTL = 30 days. Suggestions are
// content-based and stable per game, so we cache aggressively — at 6 calls per
// "show recommendations" tap and 30-day TTL, even a daily user stays well under
// the 20k/month free quota (~10–30 calls/month realistic).
//
// Dedupe vs already-added games: since most existing user games predate v1.9 and
// don't have rawgId stored, we fall back to normalized-title comparison. Edge
// cases like "Marvel's Spider-Man 2" (user) vs "Spider-Man 2" (RAWG) will be
// flagged as new — acceptable noise. Users who add via RAWG search after v1.9
// get clean rawgId-based dedupe.
import { LS_RECS_CACHE } from '../constants.js';
import { fetchSuggested } from './rawg.js';

const TTL_MS = 30 * 24 * 3600 * 1000; // 30 days
const MAX_SEEDS_PER_TRACK = 3;
const MAX_RESULTS_PER_TRACK = 10;

// ─── Cache ───────────────────────────────────────────────────────────────
export function recsCacheRead() {
  try {
    const raw = localStorage.getItem(LS_RECS_CACHE);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
export function recsCacheWrite(cache) {
  try { localStorage.setItem(LS_RECS_CACHE, JSON.stringify(cache)); } catch {}
}
// Returns cached entry if present and within TTL; null otherwise.
function readCacheEntry(rawgId) {
  const cache = recsCacheRead();
  const entry = cache[rawgId];
  if (!entry || !entry.fetchedAt || !Array.isArray(entry.results)) return null;
  const age = Date.now() - new Date(entry.fetchedAt).getTime();
  if (age > TTL_MS) return null;
  return entry.results;
}
function writeCacheEntry(rawgId, results) {
  const cache = recsCacheRead();
  cache[rawgId] = { fetchedAt: new Date().toISOString(), results };
  recsCacheWrite(cache);
}

// ─── Title normalization ─────────────────────────────────────────────────
// Lowercase + strip non-alphanumerics. Used to dedupe suggestions vs games already
// in the user's collection (which usually lack rawgId for pre-v1.9 entries).
export function normalizeTitle(s) {
  if (!s) return '';
  return String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
}

// ─── Seed selection ──────────────────────────────────────────────────────
// "Bo lubisz" track: top-3 highest-rated owned games (rating ≥ 8) with a stored rawgId.
// "Bo grałeś w" track: last-3 ukonczone games by completedAt desc, with a stored rawgId.
// Falls back to addedAt for old completions without completedAt (mirrors goalCurrent
// fallback chain). Returns at most MAX_SEEDS_PER_TRACK per track.
//
// IMPORTANT: only games with rawgId can be seeds. Manual entries / pre-v1.9 games
// without rawgId are silently skipped — UI shows an empty-state CTA pointing user
// at the RAWG search.
export function pickSeeds(games) {
  const eligible = (games || []).filter(g => g && g.rawgId);
  const topRated = eligible
    .filter(g => +g.rating >= 8)
    .sort((a, b) => (+b.rating || 0) - (+a.rating || 0))
    .slice(0, MAX_SEEDS_PER_TRACK);
  const recentlyCompleted = eligible
    .filter(g => g.status === 'ukonczone')
    .sort((a, b) => {
      const da = new Date(a.completedAt || a.lastPlayed || a.addedAt || 0);
      const db = new Date(b.completedAt || b.lastPlayed || b.addedAt || 0);
      return db - da; // newest completion first
    })
    .slice(0, MAX_SEEDS_PER_TRACK);
  return { topRated, recentlyCompleted };
}

// ─── Per-seed fetch with caching ─────────────────────────────────────────
// Returns the suggested[] array for a seed game. Cache hit → instant.
// Cache miss → live fetch + write back. Network failure → return []
// (caller treats as "no suggestions for this seed").
async function getSuggestionsFor(seed) {
  const cached = readCacheEntry(seed.rawgId);
  if (cached) return { results: cached, cached: true };
  const fresh = await fetchSuggested(seed.rawgId);
  if (fresh.length) writeCacheEntry(seed.rawgId, fresh);
  return { results: fresh, cached: false };
}

// ─── Aggregation ─────────────────────────────────────────────────────────
// Combines results from multiple seeds into a single ranked list.
//
// Score = (number of seeds that recommended this game) × 10 + RAWG rating.
// The frequency boost surfaces titles that are "similar to" multiple favorites,
// while RAWG rating breaks ties by quality. Ties broken by playtime (longer first
// — bigger ROI for backlog optimization).
//
// Each result keeps a `reasons[]` list (array of {seedTitle, seedRating}) so the
// UI can show "Bo lubisz X (ocena 9), Y (ocena 8)" tooltip.
function aggregate(perSeedResults, alreadyOwnedNorms) {
  // perSeedResults: [{ seed, results }]
  const byKey = new Map(); // normalizedTitle → aggregated entry
  for (const { seed, results } of perSeedResults) {
    for (const r of results) {
      const key = normalizeTitle(r.title);
      if (!key) continue;
      if (alreadyOwnedNorms.has(key)) continue; // dedupe vs user's collection
      const existing = byKey.get(key);
      if (existing) {
        existing.score += 10;
        existing.reasons.push({ title: seed.title, rating: seed.rating });
      } else {
        byKey.set(key, {
          ...r,
          score: 10 + (+r.rawgRating || 0),
          reasons: [{ title: seed.title, rating: seed.rating }],
        });
      }
    }
  }
  return [...byKey.values()].sort((a, b) =>
    b.score - a.score || (+b.playtime || 0) - (+a.playtime || 0)
  );
}

// ─── Top-level orchestrator ──────────────────────────────────────────────
// Builds both tracks of recommendations. Returns:
//   { topRated:    { recs: [...], seeds: [...], anyCached: bool },
//     completed:   { recs: [...], seeds: [...], anyCached: bool },
//     hasAnyData:  bool  ← false → UI should show empty state }
//
// Each track is independent — empty topRated is OK if user has completions, and vice
// versa. UI shows per-track empty states with appropriate CTAs.
export async function buildRecommendations(games) {
  const { topRated, recentlyCompleted } = pickSeeds(games);

  // Build the ownership set ONCE — used for dedupe across both tracks.
  const ownedNorms = new Set(
    (games || []).map(g => normalizeTitle(g?.title)).filter(Boolean)
  );
  // Also add the seeds themselves to the dedupe set so they don't appear as
  // recommendations for each other (a top-rated seed is by definition owned).
  topRated.forEach(g => ownedNorms.add(normalizeTitle(g.title)));
  recentlyCompleted.forEach(g => ownedNorms.add(normalizeTitle(g.title)));

  // Fetch in parallel — RAWG handles 6 concurrent requests fine.
  const fetchTrack = async (seeds) => {
    const responses = await Promise.all(seeds.map(async (seed) => {
      const { results, cached } = await getSuggestionsFor(seed);
      return { seed, results, cached };
    }));
    const anyCached = responses.some(r => r.cached);
    const recs = aggregate(
      responses.map(r => ({ seed: r.seed, results: r.results })),
      ownedNorms
    ).slice(0, MAX_RESULTS_PER_TRACK);
    return { recs, seeds, anyCached };
  };

  const [topRatedTrack, completedTrack] = await Promise.all([
    fetchTrack(topRated),
    fetchTrack(recentlyCompleted),
  ]);

  return {
    topRated: topRatedTrack,
    completed: completedTrack,
    hasAnyData: topRatedTrack.recs.length > 0 || completedTrack.recs.length > 0,
  };
}

// ─── Cache utility for Settings ─────────────────────────────────────────
// Returns total cached entries + their cumulative size in bytes (rough — JSON length).
// Used by Settings → Data → "Wyczyść cache rekomendacji" row to show meaningful info.
export function recsCacheStats() {
  const c = recsCacheRead();
  const keys = Object.keys(c);
  let bytes = 0;
  try { bytes = JSON.stringify(c).length; } catch {}
  return { entries: keys.length, bytes };
}
export function recsCacheClear() {
  try { localStorage.removeItem(LS_RECS_CACHE); } catch {}
}
