// Currency-aware formatters and date string builders.
// Pure-pure helpers (uid/mkAbbr/dayKey/weekStart/daysUntil) live in util.js to keep
// this file's dependency on storage from creating a cycle.
import { CURRENCIES } from '../constants.js';
import { getCurrency, getLang } from './storage.js';
import { parseDay } from './util.js';

// v1.14.3 - Spanish month names added. Was binary lang==='en'?EN:PL - now 3-way.
const MONTHS_PL = ['sty','lut','mar','kwi','maj','cze','lip','sie','wrz','paź','lis','gru'];
const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTHS_ES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
// v1.21.0
const MONTHS_DE = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
const MONTHS_FR = ['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
const MONTHS_IT = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
const MONTHS_PT = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const MONTHS = { pl: MONTHS_PL, en: MONTHS_EN, es: MONTHS_ES, de: MONTHS_DE, fr: MONTHS_FR, it: MONTHS_IT, pt: MONTHS_PT };
function monthsFor(lang) { return MONTHS[lang] || MONTHS_PL; }
// German writes the day with a dot: "12. Jan 2026"
const dayOf = (dt, lang) => lang === 'de' ? `${dt.getDate()}.` : String(dt.getDate());

// "12 sty 2026" / "12 Jan 2026" / "12 ene 2026"
export function fmtDate(d, lang) {
  if (!d) return '';
  const dt = parseDay(d); if (isNaN(dt)) return '';
  return `${dayOf(dt, lang)} ${monthsFor(lang)[dt.getMonth()]} ${dt.getFullYear()}`;
}

// "12 sty" / "12 Jan" / "12 ene" (no year)
export function fmtShort(d, lang) {
  if (!d) return '';
  const dt = parseDay(d); if (isNaN(dt)) return '';
  return `${dayOf(dt, lang)} ${monthsFor(lang)[dt.getMonth()]}`;
}

// Money formatter. Uses active currency (read from localStorage on every call).
export function pln(v, lang) {
  const num = (+v || 0).toFixed(0);
  const def = CURRENCIES[getCurrency()] || CURRENCIES.PLN;
  return def.after ? `${num} ${def.symbol}` : `${def.symbol}${num}`;
}

// v1.19.4 - one game's price as typed: 59,99 zł keeps its cents (pln() rounds, which is
// right for totals but showed 59.99 as "60 zł" on cards). Whole amounts stay short.
export function plnExact(v, lang) {
  const n = +v || 0;
  const cents = Math.abs(n * 100 - Math.round(n) * 100) >= 0.5;
  let num = cents ? n.toFixed(2) : n.toFixed(0);
  if (cents && (lang || getLang()) !== 'en') num = num.replace('.', ',');
  const def = CURRENCIES[getCurrency()] || CURRENCIES.PLN;
  return def.after ? `${num} ${def.symbol}` : `${def.symbol}${num}`;
}

// Polish has 3-form plural: 1 gra, 2-4 gry, 5+ gier (also 12-14 → "gier", 22-24 → "gry")
// English uses simpler 1 game / 2+ games. v1.14.3 - Spanish: juego / juegos.
// v1.21.0 - singular/plural words for the languages with two forms. French also uses the
// singular for 0 ("0 jeu").
const TWO_FORMS = {
  en: { game: ['game', 'games'], hour: ['hour', 'hours'], plat: ['platinum', 'platinums'], session: ['session', 'sessions'] },
  es: { game: ['juego', 'juegos'], hour: ['hora', 'horas'], plat: ['platino', 'platinos'], session: ['sesión', 'sesiones'] },
  de: { game: ['Spiel', 'Spiele'], hour: ['Stunde', 'Stunden'], plat: ['Platin', 'Platin'], session: ['Session', 'Sessions'] },
  fr: { game: ['jeu', 'jeux'], hour: ['heure', 'heures'], plat: ['platine', 'platines'], session: ['session', 'sessions'] },
  it: { game: ['gioco', 'giochi'], hour: ['ora', 'ore'], plat: ['platino', 'platini'], session: ['sessione', 'sessioni'] },
  pt: { game: ['jogo', 'jogos'], hour: ['hora', 'horas'], plat: ['platina', 'platinas'], session: ['sessão', 'sessões'] },
};
const isOne = (n, lang) => (lang === 'fr' ? Math.abs(n) < 2 : Math.abs(n) === 1);
function twoForm(n, lang, word) { const f = TWO_FORMS[lang][word]; return isOne(n, lang) ? f[0] : f[1]; }

// v1.19.4 - pick a plural form from "one|few|many" (Polish) or "one|other" (EN/ES).
export function pluralForm(n, lang, forms) {
  const f = String(forms).split('|');
  const abs = Math.abs(n);
  if (lang !== 'pl') return isOne(n, lang) ? f[0] : f[1];
  if (abs === 1) return f[0];
  const last = abs % 10, lastTwo = abs % 100;
  return last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20) ? f[1] : f[2];
}

export function gamesWord(n, lang) {
  const abs = Math.abs(n);
  if (TWO_FORMS[lang]) return twoForm(n, lang, 'game');
  if (abs === 1) return 'gra';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'gry';
  return 'gier';
}

// v1.13.3 - Polish 3-form plural for "hours" used in goal templates and similar
// sentence-style strings. EN: 1 hour / 2+ hours.
// PL: 1 godzinę / 2-4 godziny / 5+ godzin (genitive).
// Note: this is the ACCUSATIVE form (used after verbs like "Zagraj X godzin/y/ę")
// because that's the dominant use case. For nominative ("X godzin minęło"),
// the forms differ slightly but accusative is what we need for goal CTAs.
export function hoursWord(n, lang) {
  const abs = Math.abs(n);
  if (TWO_FORMS[lang]) return twoForm(n, lang, 'hour');
  if (abs === 1) return 'godzinę';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'godziny';
  return 'godzin';
}

// v1.13.3 - Polish plural for "platinum (trophy)" - same 3-form pattern.
// EN: 1 platinum / 2+ platinums. PL: 1 platynę / 2-4 platyny / 5+ platyn.
export function platynaWord(n, lang) {
  const abs = Math.abs(n);
  if (TWO_FORMS[lang]) return twoForm(n, lang, 'plat');
  if (abs === 1) return 'platynę';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'platyny';
  return 'platyn';
}

// v1.13.4 - Polish plural for "session" (gaming session). Used in Wrapped hero subtitle
// ("X sesji"/"X sesje") and home stats ("X sesji dziś"). 1 sesja / 2-4 sesje / 5+ sesji.
// EN: 1 session / 2+ sessions.
export function sessionsWord(n, lang) {
  const abs = Math.abs(n);
  if (TWO_FORMS[lang]) return twoForm(n, lang, 'session');
  if (abs === 1) return 'sesja';
  const last = abs % 10, lastTwo = abs % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 10 || lastTwo >= 20)) return 'sesje';
  return 'sesji';
}

// Cost-per-hour with dynamic symbol. Format always "1.9 sym/h" regardless of before/after.
// Named fmtCph (NOT cph) to avoid collision with local `const cph` inside Stats/Finance.
export function fmtCph(v) {
  // v1.18.1 - decimal comma ("3,2 zł/h"); every app language but English uses one
  let num = (+v || 0).toFixed(1);
  try { if (getLang() !== 'en') num = num.replace('.', ','); } catch {}
  const def = CURRENCIES[getCurrency()] || CURRENCIES.PLN;
  return `${num} ${def.symbol}/h`;
}

// Format hours as "2h 54min" / "30min" / "5h" - replaces ugly "2.9h"
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
