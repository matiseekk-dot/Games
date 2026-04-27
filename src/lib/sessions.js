// Session aggregation and streak computation.
// `dayKey` (YYYY-MM-DD in local time) is the join key for everything time-series.
// Streak math is exact-day-based — gaps of any size break the streak.
import { dayKey } from './util.js';

export function collectSessions(games) {
  const out = [];
  games.forEach(g => {
    (g.sessions || []).forEach(s => {
      out.push({
        gameId: g.id,
        gameTitle: g.title,
        gameAbbr: g.abbr,
        gameCover: g.cover,
        startedAt: s.startedAt,
        endedAt: s.endedAt,
        hours: s.hours,
        // Use startedAt date as the "session date" (YYYY-MM-DD in LOCAL time).
        // Critical for heatmap/streak correctness — see dayKey() comment.
        dateKey: dayKey(s.startedAt),
      });
    });
  });
  return out.sort((a, b) => b.startedAt - a.startedAt);  // newest first
}

// Compute current streak: consecutive days ending today (or yesterday if no session today)
export function computeStreak(sessionsByDay) {
  if (!sessionsByDay.size) return 0;
  let streak = 0;
  const today = new Date(); today.setHours(0,0,0,0);
  let cursor = new Date(today);
  // Allow streak to continue if today has no session but yesterday does
  if (!sessionsByDay.has(dayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!sessionsByDay.has(dayKey(cursor))) return 0;
  }
  while (sessionsByDay.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// Compute longest streak ever
export function computeLongestStreak(sessionsByDay) {
  if (!sessionsByDay.size) return 0;
  const days = [...sessionsByDay.keys()].sort();
  let longest = 1, current = 1;
  for (let i = 1; i < days.length; i++) {
    const prev = new Date(days[i - 1]); prev.setDate(prev.getDate() + 1);
    if (dayKey(prev) === days[i]) { current++; if (current > longest) longest = current; }
    else current = 1;
  }
  return longest;
}
