// v1.10.0 — Weekly summary push notification helper.
//
// Fires a local Notification once per 7 days, summarizing the user's last 7 days of
// gaming activity. App.jsx runs maybePushWeeklySummary() on mount; this file
// computes the summary and (if eligible) shows the notification.
//
// "Eligible" means ALL of:
//   1. Notification.permission === 'granted'
//   2. ≥ 7 days since LS_LAST_WEEKLY_PUSH (or first run)
//   3. User has ≥ 1 session in the last 7 days (no point pinging an inactive user)
//
// Notification text uses the same translation system as the rest of the app
// (passed-in t() callback to keep this module language-agnostic).
//
// Note: this is an App-side check, not a true scheduled push. PWA Periodic Background
// Sync would be the "right" answer but its support is fragmented (Chrome-only, requires
// installed PWA with site engagement). App-side check is reliable when user opens the
// app — the worst case is "user doesn't open app for 14 days, gets one push on day 14
// summarizing the last 7", which is still useful retention-wise.
import { LS_LAST_WEEKLY_PUSH } from '../constants.js';
import { collectSessions } from './sessions.js';

const WEEK_MS = 7 * 24 * 3600 * 1000;

// Returns null if not eligible OR no activity; otherwise summary object.
export function computeWeeklyStats(games) {
  const now = Date.now();
  const weekAgo = now - WEEK_MS;
  const allSessions = collectSessions(games);
  const recent = allSessions.filter(s => {
    const t = new Date(s.startedAt).getTime();
    return Number.isFinite(t) && t >= weekAgo && t <= now;
  });
  if (!recent.length) return null;

  const totalHours = recent.reduce((sum, s) => sum + (+s.hours || 0), 0);
  const sessionCount = recent.length;

  // Group by game to find the top one
  const byGame = new Map();
  for (const s of recent) {
    const game = games.find(g => g.id === s.gameId);
    if (!game) continue;
    const key = game.id;
    if (!byGame.has(key)) byGame.set(key, { title: game.title, hours: 0 });
    byGame.get(key).hours += +s.hours || 0;
  }
  const topGame = [...byGame.values()].sort((a, b) => b.hours - a.hours)[0] || null;

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    sessionCount,
    topGame,
  };
}

// Returns true if a notification was fired (or attempted), false otherwise.
// Caller should only invoke this once per app mount — internal LS throttle prevents
// firing more than once per 7 days, but doesn't prevent multiple-calls-per-mount issues.
export async function maybePushWeeklySummary(games, lang, t) {
  // Permission check first — skip everything else if we can't notify.
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return false;

  // Throttle check: ≥ 7 days since last push.
  let last = null;
  try { last = localStorage.getItem(LS_LAST_WEEKLY_PUSH); } catch {}
  if (last) {
    const lastT = new Date(last).getTime();
    if (Number.isFinite(lastT) && (Date.now() - lastT) < WEEK_MS) return false;
  }

  // Activity check: any sessions in the last 7 days.
  const stats = computeWeeklyStats(games);
  if (!stats) return false;

  // Build the body. Two flavors depending on whether we have a top game.
  // Translation keys: weeklyPushTitle, weeklyPushBodyTop, weeklyPushBodyNoTop.
  const title = t(lang, 'weeklyPushTitle');
  const body = stats.topGame
    ? t(lang, 'weeklyPushBodyTop', { hours: stats.totalHours, sessions: stats.sessionCount, game: stats.topGame.title })
    : t(lang, 'weeklyPushBodyNoTop', { hours: stats.totalHours, sessions: stats.sessionCount });

  // Fire the notification. Use the SW registration so the notification persists
  // even when the page is closed (best-effort — falls back to local Notification API).
  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg && reg.showNotification) {
        await reg.showNotification(title, {
          body,
          icon: '/Games/icons/icon-192.png',
          badge: '/Games/icons/icon-192.png',
          tag: 'ps5vault-weekly',           // replaces previous unread weekly push
          renotify: false,                  // don't re-vibrate if user already saw it
          data: { type: 'weekly', tab: 'st' },
        });
      } else {
        new Notification(title, { body });
      }
    } else {
      new Notification(title, { body });
    }
    try { localStorage.setItem(LS_LAST_WEEKLY_PUSH, new Date().toISOString()); } catch {}
    return true;
  } catch {
    return false;
  }
}
