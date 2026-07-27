// v1.5.0 Year-in-Review (Spotify Wrapped style).
// v1.17.5 — Rewritten to derive from game-level fields (hours, lastPlayed,
// completedAt) instead of sessions[]. The SessionTimer was removed in v1.17.4
// and imported libraries (Playnite / PSN / Xbox) carry `hours` + `lastPlayed`
// but NO sessions — so the old session-only math reported 0 hours / empty tops
// for anyone who imported. This version attributes each game's lifetime hours to
// the year it was last played (best available signal without per-session data).
import { isOwned } from '../constants.js';

// Year-attribution helpers. A game "belongs" to a year based on when it was last
// touched — lastPlayed is the truest signal, then completedAt, then addedAt.
function activityYear(g) {
  const ts = g.lastPlayed || g.completedAt || g.addedAt;
  if (!ts) return null;
  const y = new Date(ts).getFullYear();
  return Number.isFinite(y) ? y : null;
}
function completionYear(g) {
  const ts = g.completedAt || g.lastPlayed || g.addedAt;
  if (!ts) return null;
  const y = new Date(ts).getFullYear();
  return Number.isFinite(y) ? y : null;
}
function addedYear(g) {
  if (!g.addedAt) return null;
  const y = +String(g.addedAt).slice(0, 4);
  return Number.isFinite(y) ? y : null;
}

// List of distinct years that contain activity (played / completed / added),
// newest-first, bounded to 2000–2100 (filters garbage timestamps).
export function getYearsWithData(games) {
  const years = new Set();
  games.forEach(g => {
    const a = activityYear(g); if (a) years.add(a);
    const c = completionYear(g); if (c) years.add(c);
    const d = addedYear(g); if (d) years.add(d);
  });
  return [...years].filter(y => y >= 2000 && y <= 2100).sort((a, b) => b - a);
}

export function computeYearReview(games, year) {
  // Games "active" in the year = played/finished/last-touched in the year AND
  // have some hours logged. This is the pool for hours + top-played + top-genre.
  const activeGames = games.filter(g => (+g.hours || 0) > 0 && activityYear(g) === year);

  const gamesAdded = games.filter(g => addedYear(g) === year).length;
  const gamesCompleted = games.filter(g => g.status === 'ukonczone' && completionYear(g) === year).length;
  const platinums = games.filter(g => g.platinum && completionYear(g) === year).length;

  // Bail only if the year is truly empty across every metric.
  if (!activeGames.length && !gamesAdded && !gamesCompleted) return null;

  const totalHours = Math.round(activeGames.reduce((s, g) => s + (+g.hours || 0), 0));
  const gamesPlayed = activeGames.length;

  // Top played — by lifetime hours among games active this year.
  const topPlayed = [...activeGames]
    .sort((a, b) => (+b.hours || 0) - (+a.hours || 0))
    .slice(0, 3)
    .map(g => ({ game: g, hours: +g.hours || 0 }));

  // Highest rated — rated games that were active OR added this year.
  const highestRated = games
    .filter(g => g.rating != null && +g.rating > 0 && (activityYear(g) === year || addedYear(g) === year))
    .sort((a, b) => (+b.rating || 0) - (+a.rating || 0))[0] || null;

  // Top genre — by hours among active games.
  const hrsByGenre = new Map();
  activeGames.forEach(g => {
    const ge = g.genre || '?';
    hrsByGenre.set(ge, (hrsByGenre.get(ge) || 0) + (+g.hours || 0));
  });
  const topGenreEntry = [...hrsByGenre.entries()]
    .filter(([k]) => k && k !== '?')
    .sort((a, b) => b[1] - a[1])[0];
  const topGenre = topGenreEntry ? {
    name: topGenreEntry[0],
    hours: Math.round(topGenreEntry[1]),
    gamesCount: activeGames.filter(g => g.genre === topGenreEntry[0]).length,
  } : null;

  // Money — owned games only (subscriptions excluded). Spent uses addedAt year;
  // recovered uses completion year.
  const totalSpent = games
    .filter(g => isOwned(g) && addedYear(g) === year)
    .reduce((s, g) => s + (+g.priceBought || 0) + (+g.extraSpend || 0), 0);
  const totalRecovered = games
    .filter(g => isOwned(g) && g.priceSold != null && +g.priceSold > 0 && completionYear(g) === year)
    .reduce((s, g) => s + (+g.priceSold || 0), 0);

  // Average hours per game played this year — a nice derived headline stat.
  const avgHoursPerGame = gamesPlayed > 0 ? Math.round(totalHours / gamesPlayed) : 0;

  return {
    year,
    totalHours,
    gamesPlayed,       // NEW — replaces sessionCount / activeDays
    avgHoursPerGame,   // NEW — derived
    gamesAdded,
    gamesCompleted,
    platinums,
    topPlayed,         // [{game, hours}]
    highestRated,      // game or null
    topGenre,          // { name, hours, gamesCount } or null
    totalSpent,
    totalRecovered,
  };
}
