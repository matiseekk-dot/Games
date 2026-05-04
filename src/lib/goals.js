// v1.5.0 Goals.
// Goals live in localStorage as { id, type, target, periodStart, periodEnd, doneAt }.
// `periodStart` and `periodEnd` are ISO date strings (YYYY-MM-DD) bounding the active
// month. Progress is recomputed live from games + sessions — never stored.
import { LS_GOALS } from '../constants.js';
import { dayKey } from './util.js';

export function goalsRead() {
  try {
    const raw = JSON.parse(localStorage.getItem(LS_GOALS) || '[]');
    if (!Array.isArray(raw)) return [];
    // v1.13.10 — drop stale/unknown goal types on read. A goal whose `type` no longer
    // matches GOAL_TYPES (e.g. survived a downgrade, came from a corrupted import, or was
    // hand-edited in localStorage) used to crash the app via `GOAL_TYPES[g.type].tk` —
    // pure undefined.tk. Filtering here means the renderer never sees one.
    return raw.filter(g => g && typeof g.type === 'string' && GOAL_TYPES[g.type]);
  } catch { return []; }
}
export function goalsWrite(g) { try { localStorage.setItem(LS_GOALS, JSON.stringify(g)); } catch {} }

export function monthBounds(d = new Date()) {
  const y = d.getFullYear(), m = d.getMonth();
  const start = new Date(y, m, 1); start.setHours(0,0,0,0);
  const end = new Date(y, m + 1, 0); end.setHours(23,59,59,999);
  return { start, end, startKey:dayKey(start), endKey:dayKey(end) };
}

export function daysLeftInMonth(d = new Date()) {
  const { end } = monthBounds(d);
  return Math.max(0, Math.ceil((end - d) / 86400000));
}

// Goal type catalog. Templates are picked from a UI list; once picked, a goal instance
// captures `target` and the current month's bounds. The `tk` field is a translation key
// looked up by the caller (i18n is the consumer's job, this module stays string-free).
export const GOAL_TYPES = {
  complete:  { ico:'✅', tk:'goalTplCompleteTitle' },
  hours:     { ico:'⏱', tk:'goalTplHoursTitle' },
  add:       { ico:'➕', tk:'goalTplAddTitle' },
  platinum:  { ico:'🏆', tk:'goalTplPlatinumTitle' },
};

// v1.13.3 — Build the placeholder bag for goal title interpolation. Polish uses
// 3-form plural ("3 gry" not "3 gier") so we supply pluralized words alongside
// the count {n}. EN uses simpler 1/many split. Caller picks pluralizers via type:
//   complete → games word
//   hours    → hours word
//   add      → games word
//   platinum → platinums word
// Importing pluralizers here keeps the call site clean: `t(lang, tpl.tk, goalParams(type, n, lang))`.
import { gamesWord, hoursWord, platynaWord } from './format.js';
export function goalParams(type, n, lang) {
  const params = { n };
  if (type === 'complete' || type === 'add') params.games = gamesWord(n, lang);
  if (type === 'hours')   params.hrs   = hoursWord(n, lang);
  if (type === 'platinum') params.plats = platynaWord(n, lang);
  return params;
}

export const GOAL_TEMPLATES = [
  { type:'complete',  target:3 },
  { type:'complete',  target:5 },
  { type:'hours',     target:20 },
  { type:'hours',     target:40 },
  { type:'add',       target:3 },
  { type:'platinum',  target:1 },
];

// Returns the current numeric value of a goal (raw, not capped at target).
// Caller is responsible for `Math.min(cur, target)` and percent calc if needed.
//
// v1.7.0: 'complete' and 'platinum' now use completedAt as the date filter.
// Pre-v1.7 games without completedAt fall back to lastPlayed||addedAt — handled
// transparently by the migration in lsRead().
export function goalCurrent(goal, games, sessions) {
  const start = new Date(goal.periodStart);
  const end = new Date(goal.periodEnd);
  switch (goal.type) {
    case 'complete': {
      // Games whose status flipped to ukonczone during the goal period.
      // completedAt is exact — set on transition in handleStatusChange / handleSave.
      // Legacy games without completedAt are backfilled in lsRead() migration.
      return games.filter(g => {
        if (g.status !== 'ukonczone') return false;
        const ts = g.completedAt || g.lastPlayed || g.addedAt;
        if (!ts) return false;
        const d = new Date(ts);
        return d >= start && d <= end;
      }).length;
    }
    case 'hours': {
      return Math.round(sessions
        .filter(s => { const d = new Date(s.startedAt); return d >= start && d <= end; })
        .reduce((sum, s) => sum + (+s.hours || 0), 0));
    }
    case 'add': {
      return games.filter(g => {
        if (!g.addedAt) return false;
        const d = new Date(g.addedAt);
        return d >= start && d <= end;
      }).length;
    }
    case 'platinum': {
      // Same date precision as 'complete' — uses completedAt with fallbacks.
      return games.filter(g => {
        if (!g.platinum) return false;
        const ts = g.completedAt || g.lastPlayed || g.addedAt;
        if (!ts) return false;
        const d = new Date(ts);
        return d >= start && d <= end;
      }).length;
    }
    default: return 0;
  }
}
