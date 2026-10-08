// Zero-dependency pure helpers. Lives separately from format.js so that storage.js
// can import uid without creating a cycle (format.js needs getCurrency from storage,
// storage.js needs uid for import-merge — keeping these in util.js keeps the dep tree
// strictly unidirectional: constants ← util ← {format, storage} ← rest).

// Random ID generator. Prefix 'g' so game IDs are syntactically distinct from
// goal IDs ('gl_'). Resolution is millisecond + 5 random base36 chars.
export function uid() { return 'g' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }

// Two-letter abbreviation: first 2 chars of single word, or first letters of first two words.
// Used for cover-less game tiles. v1.4.0+: auto-derived from title in Modal — no UI field.
export function mkAbbr(s) { const w = s.trim().split(/\s+/).filter(Boolean); return !w.length ? '??' : (w.length === 1 ? w[0].slice(0, 2) : w[0][0] + w[1][0]).toUpperCase(); }

// Days from today to a given date (local timezone). Negative = past, 0 = today, positive = future.
// v1.18.1 — Date-only strings ("2026-10-08", as stored for releaseDate) must be read as
// LOCAL calendar days. `new Date('2026-10-08')` means UTC midnight, which in the Americas
// is the previous evening, so releases showed up a day early (daysUntil = -1 on launch day)
// for EN-US / LatAm users. Full timestamps keep their normal Date parsing.
export function parseDay(d) {
  if (typeof d === 'string') {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
    if (m) return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  return new Date(d);
}
export function daysUntil(d) { if (!d) return null; const a = new Date(); a.setHours(0,0,0,0); const b = parseDay(d); b.setHours(0,0,0,0); return Math.round((b - a) / 86400000); }

// v1.18.1 — Numbers typed on Polish/Spanish keyboards arrive as "89,99" or "1 299,99".
// Plain `+value` turns those into NaN, so prices silently dropped out of every total and
// hours fell back to 0. Returns a finite number or null.
export function parseNum(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  const s = String(v).trim().replace(/[\s  ]/g, '').replace(',', '.');
  if (s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

// v1.18.1 — RAWG serves a 420 px resize of every cover (~18 KB instead of ~170 KB).
// Use it wherever a cover is shown as a thumbnail; 120 cards went from ~20 MB to ~2 MB.
// Non-RAWG URLs and already-resized ones pass through untouched.
export function coverThumb(url, width = 420) {
  if (!url || typeof url !== 'string') return url;
  return url.replace(/^(https:\/\/media\.rawg\.io\/media\/)(games|screenshots)\//, `$1resize/${width}/-/$2/`);
}

// Convert a Date to a YYYY-MM-DD string in LOCAL timezone.
// Must NOT use toISOString — that converts to UTC and breaks aggregation
// for any non-UTC user (e.g. Polish player at 00:30 local = previous day in UTC).
export function dayKey(d) {
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Monday of week containing date (ISO week)
export function weekStart(d) {
  const x = new Date(d); x.setHours(0,0,0,0);
  const day = x.getDay(); // 0=Sun...6=Sat
  const diff = day === 0 ? -6 : (1 - day);  // Mon = -1, Sun = -6
  x.setDate(x.getDate() + diff);
  return x;
}
