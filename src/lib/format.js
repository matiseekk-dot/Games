// Currency-aware formatters and date string builders.
// Pure-pure helpers (uid/mkAbbr/dayKey/weekStart/daysUntil) live in util.js to keep
// this file's dependency on storage from creating a cycle.
import { CURRENCIES } from '../constants.js';
import { getCurrency } from './storage.js';

// "12 sty 2026" / "12 Jan 2026"
export function fmtDate(d, lang) {
  if (!d) return '';
  const dt = new Date(d); if (isNaN(dt)) return '';
  const day = dt.getDate();
  const months = lang === 'en' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  return `${day} ${months[dt.getMonth()]} ${dt.getFullYear()}`;
}

// "12 sty" / "12 Jan" (no year)
export function fmtShort(d, lang) {
  if (!d) return '';
  const dt = new Date(d); if (isNaN(dt)) return '';
  const day = dt.getDate();
  const months = lang === 'en' ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'] : ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
  return `${day} ${months[dt.getMonth()]}`;
}

// Money formatter. Uses active currency (read from localStorage on every call).
export function pln(v, lang) {
  const num = (+v || 0).toFixed(0);
  const def = CURRENCIES[getCurrency()] || CURRENCIES.PLN;
  return def.after ? `${num} ${def.symbol}` : `${def.symbol}${num}`;
}

// Polish has 3-form plural: 1 gra, 2-4 gry, 5+ gier (also 12-14 → "gier", 22-24 → "gry")
// English uses simpler 1 game / 2+ games
export function gamesWord(n, lang) {
  const abs = Math.abs(n);
  if (lang === 'en') return abs === 1 ? 'game' : 'games';
  if (abs === 1) return 'gra';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'gry';
  return 'gier';
}

// v1.13.3 — Polish 3-form plural for "hours" used in goal templates and similar
// sentence-style strings. EN: 1 hour / 2+ hours.
// PL: 1 godzinę / 2-4 godziny / 5+ godzin (genitive).
// Note: this is the ACCUSATIVE form (used after verbs like "Zagraj X godzin/y/ę")
// because that's the dominant use case. For nominative ("X godzin minęło"),
// the forms differ slightly but accusative is what we need for goal CTAs.
export function hoursWord(n, lang) {
  const abs = Math.abs(n);
  if (lang === 'en') return abs === 1 ? 'hour' : 'hours';
  if (abs === 1) return 'godzinę';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'godziny';
  return 'godzin';
}

// v1.13.3 — Polish plural for "platinum (trophy)" — same 3-form pattern.
// EN: 1 platinum / 2+ platinums. PL: 1 platynę / 2-4 platyny / 5+ platyn.
export function platynaWord(n, lang) {
  const abs = Math.abs(n);
  if (lang === 'en') return abs === 1 ? 'platinum' : 'platinums';
  if (abs === 1) return 'platynę';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'platyny';
  return 'platyn';
}

// v1.13.4 — Polish plural for "session" (gaming session). Used in Wrapped hero subtitle
// ("X sesji"/"X sesje") and home stats ("X sesji dziś"). 1 sesja / 2-4 sesje / 5+ sesji.
// EN: 1 session / 2+ sessions.
export function sessionsWord(n, lang) {
  const abs = Math.abs(n);
  if (lang === 'en') return abs === 1 ? 'session' : 'sessions';
  if (abs === 1) return 'sesja';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'sesje';
  return 'sesji';
}

// Cost-per-hour with dynamic symbol. Format always "1.9 sym/h" regardless of before/after.
// Named fmtCph (NOT cph) to avoid collision with local `const cph` inside Stats/Finance.
export function fmtCph(v) {
  const num = (+v || 0).toFixed(1);
  const def = CURRENCIES[getCurrency()] || CURRENCIES.PLN;
  return `${num} ${def.symbol}/h`;
}

// Format hours as "2h 54min" / "30min" / "5h" — replaces ugly "2.9h"
// minStr: "min" in both PL/EN (common, no need to translate)
export function fmtHours(v, opts) {
  const h = +v || 0;
  if (h <= 0) return '0h';
  const hh = Math.floor(h);
  const mm = Math.round((h - hh) * 60);
  if (mm === 60) { return `${hh + 1}h`; }  // rounding edge case: 2.995 -> 3h not "2h 60min"
  if (hh === 0) return `${mm}min`;
  if (mm === 0) return `${hh}h`;
  if (opts && opts.compact) return `${hh}h${mm}m`;  // for tight inline displays
  return `${hh}h ${mm}min`;
}
