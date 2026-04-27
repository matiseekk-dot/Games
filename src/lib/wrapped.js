// v1.5.0 Year-in-Review (Spotify Wrapped style).
// Pure derivation of a year's worth of stats. Returns null if there's not enough data.
// "Enough data" = at least 1 game added or 1 session in the year.
import { dayKey } from './util.js';
import { computeLongestStreak } from './sessions.js';

// List of distinct years that contain at least one addedAt or session.
// Sorted newest-first, sanity-bounded to 2000–2100 (filters out garbage timestamps).
export function getYearsWithData(games) {
  const years = new Set();
  games.forEach(g => {
    if (g.addedAt) years.add(+g.addedAt.slice(0, 4));
    (g.sessions || []).forEach(s => {
      const ts = s.startedAt || s.endedAt;
      if (ts) years.add(new Date(ts).getFullYear());
    });
  });
  return [...years].filter(y => y >= 2000 && y <= 2100).sort((a, b) => b - a);
}

export function computeYearReview(games, year) {
  const yStart = new Date(year, 0, 1); yStart.setHours(0,0,0,0);
  const yEnd = new Date(year, 11, 31); yEnd.setHours(23,59,59,999);
  const inYear = ts => { if (!ts) return false; const d = new Date(ts); return d >= yStart && d <= yEnd; };

  // Sessions filtered to the year
  const allSessions = [];
  games.forEach(g => {
    (g.sessions || []).forEach(s => {
      if (!inYear(s.startedAt)) return;
      allSessions.push({ ...s, gameId:g.id, gameTitle:g.title, gameCover:g.cover, gameAbbr:g.abbr, gameGenre:g.genre });
    });
  });
  if (!allSessions.length && !games.some(g => inYear(g.addedAt))) {
    return null; // no data at all for this year
  }

  const totalHours = allSessions.reduce((s, x) => s + (+x.hours || 0), 0);
  const gamesAdded = games.filter(g => inYear(g.addedAt)).length;
  // v1.7.0: completedAt is exact (set on status transition). Pre-v1.7 games are
  // backfilled in lsRead() migration with lastPlayed||addedAt — kept as fallback chain
  // here as defense in depth.
  const completionDate = g => g.completedAt || g.lastPlayed || g.addedAt;
  const gamesCompleted = games.filter(g => g.status === 'ukonczone' && inYear(completionDate(g))).length;
  const platinums = games.filter(g => g.platinum && inYear(completionDate(g))).length;

  // Per-game hours in year
  const hrsByGame = new Map();
  allSessions.forEach(s => { hrsByGame.set(s.gameId, (hrsByGame.get(s.gameId) || 0) + (+s.hours || 0)); });
  const topPlayed = [...hrsByGame.entries()]
    .map(([gid, h]) => { const g = games.find(x => x.id === gid); return g ? { game:g, hours:h } : null; })
    .filter(Boolean)
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 3);

  // Highest rated this year (games rated AND added or completed in year)
  const ratedThisYear = games
    .filter(g => g.rating != null && +g.rating > 0 && (inYear(g.addedAt) || inYear(g.lastPlayed)))
    .sort((a, b) => (+b.rating || 0) - (+a.rating || 0));
  const highestRated = ratedThisYear[0] || null;

  // Genre hours
  const hrsByGenre = new Map();
  allSessions.forEach(s => { const g = s.gameGenre || '?'; hrsByGenre.set(g, (hrsByGenre.get(g) || 0) + (+s.hours || 0)); });
  const topGenreEntry = [...hrsByGenre.entries()].filter(([k]) => k && k !== '?').sort((a, b) => b[1] - a[1])[0];
  const topGenre = topGenreEntry ? {
    name: topGenreEntry[0],
    hours: Math.round(topGenreEntry[1]),
    gamesCount: new Set(allSessions.filter(s => s.gameGenre === topGenreEntry[0]).map(s => s.gameId)).size,
  } : null;

  // Money in year — use addedAt as proxy for "spent in year"
  const totalSpent = games
    .filter(g => inYear(g.addedAt))
    .reduce((s, g) => s + (+g.priceBought || 0) + (+g.extraSpend || 0), 0);
  const totalRecovered = games
    .filter(g => g.priceSold != null && +g.priceSold > 0 && inYear(completionDate(g)))
    .reduce((s, g) => s + (+g.priceSold || 0), 0);

  // Streak / active days inside the year
  const sbd = new Map();
  allSessions.forEach(s => { const k = dayKey(s.startedAt); if (!sbd.has(k)) sbd.set(k, []); sbd.get(k).push(s); });
  const activeDays = sbd.size;
  const totalDaysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
  const longestStreak = computeLongestStreak(sbd);

  // Longest single session
  const longestSession = allSessions.reduce((m, s) => Math.max(m, +s.hours || 0), 0);

  return {
    year,
    totalHours: Math.round(totalHours),
    gamesAdded,
    gamesCompleted,
    platinums,
    topPlayed,        // [{game, hours}]
    highestRated,     // game or null
    topGenre,         // { name, hours, gamesCount } or null
    totalSpent,
    totalRecovered,
    activeDays,
    totalDaysInYear,
    longestStreak,
    longestSession: Math.round(longestSession * 10) / 10,
    sessionCount: allSessions.length,
  };
}
