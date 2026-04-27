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
export function daysUntil(d) { if (!d) return null; const a = new Date(); a.setHours(0,0,0,0); const b = new Date(d); b.setHours(0,0,0,0); return Math.round((b - a) / 86400000); }

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
