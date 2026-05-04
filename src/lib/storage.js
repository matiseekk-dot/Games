// Storage layer: localStorage R/W for the games list + small singletons (budget, timer,
// onboarding, language, currency). Plus export/import helpers that act on the games array.
// Per-feature persistence (eanCache, goals) lives next to its feature in lib/barcode.js
// and lib/goals.js — keeping this file focused on the canonical games collection.
import { LS_KEY, LS_ONBOARD, LS_LANG, LS_CURRENCY, LS_LAST_SEEN_ACH, LS_MENU_SEEN, CURRENCIES } from '../constants.js';
import { uid } from './util.js';

// ─── Games list ────────────────────────────────────────────────────────────
export function lsRead() {
  try {
    const games = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    // Migration (v1.2.4+): legacy games may have priceSold:'' from v1.2.3 bug,
    // which rendered as "sold toggle ON" + ROI +0 zł on cards.
    // Normalize to null on read so every load is consistent.
    // Idempotent — running twice is safe.
    //
    // Migration (v1.7.0): completedAt was added to track exact date of completion.
    // For pre-v1.7 games with status==='ukonczone' but no completedAt, backfill from
    // lastPlayed (preferred — actual play date) or addedAt (last resort). Without
    // this, Goals of type 'complete' / 'platinum' and Year-in-Review undercount older
    // completions. Idempotent.
    let dirty = false;
    const migrated = games.map(g => {
      let next = g;
      if (next.priceSold === '') { dirty = true; next = { ...next, priceSold:null }; }
      if (next.status === 'ukonczone' && !next.completedAt) {
        const fallback = next.lastPlayed || next.addedAt || null;
        if (fallback) { dirty = true; next = { ...next, completedAt:fallback }; }
      }
      // Migration (v1.13.10): coerce date-ish fields to ISO strings. Some older / imported
      // schemas stored addedAt/completedAt/lastPlayed as numeric timestamps; downstream
      // code calls .slice(0,4) / .slice(0,7) on them, which crashes on numbers. We coerce
      // any number / Date to ISO string here so every consumer can safely string-slice.
      // Idempotent — already-ISO strings pass through untouched.
      for (const key of ['addedAt','completedAt','lastPlayed']) {
        const v = next[key];
        if (v != null && typeof v !== 'string') {
          try {
            const iso = new Date(v).toISOString();
            dirty = true;
            next = { ...next, [key]: iso };
          } catch { /* drop unparseable value */
            dirty = true;
            next = { ...next, [key]: null };
          }
        }
      }
      return next;
    });
    if (dirty) { try { localStorage.setItem(LS_KEY, JSON.stringify(migrated)); } catch {} }
    return migrated;
  } catch { return []; }
}

export function lsWrite(g) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(g));
    return true;
  } catch (e) {
    // localStorage quota exceeded (5MB ~ 300+ games with session history) or storage disabled.
    // Surface to user via global hook set by App; fall back to console if not registered yet.
    const isQuota = e && (e.name === 'QuotaExceededError' || e.code === 22 || e.code === 1014);
    if (typeof window !== 'undefined' && window.__ps5v_storageError) {
      window.__ps5v_storageError(isQuota ? 'quota' : 'unknown');
    } else {
      console.error('[ps5vault] lsWrite failed:', e);
    }
    return false;
  }
}

// ─── Singletons ────────────────────────────────────────────────────────────
export function budgetRead() { try { return JSON.parse(localStorage.getItem('ps5vault_budget') || '{}'); } catch { return {}; } }
export function budgetWrite(d) { try { localStorage.setItem('ps5vault_budget', JSON.stringify(d)); } catch {} }
export function timerRead() { try { return JSON.parse(localStorage.getItem('ps5vault_timer')); } catch { return null; } }
export function timerWrite(d) { try { if (d === null) localStorage.removeItem('ps5vault_timer'); else localStorage.setItem('ps5vault_timer', JSON.stringify(d)); } catch {} }
export function isOnboarded() { return !!localStorage.getItem(LS_ONBOARD); }
export function setOnboarded() { localStorage.setItem(LS_ONBOARD, '1'); }

// v1.7.0 — set of achievement IDs that the user has already been notified about.
// Returns Set<string>. Reading returns null if never set (callers treat null as
// "first run" and silently sync without showing a banner).
export function lastSeenAchRead() {
  try {
    const raw = localStorage.getItem(LS_LAST_SEEN_ACH);
    if (raw === null) return null;
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return null; }
}
export function lastSeenAchWrite(set) {
  try {
    localStorage.setItem(LS_LAST_SEEN_ACH, JSON.stringify([...set]));
  } catch {}
}

// v1.8.0 — Per-section "last opened" markers used by the hamburger badge trigger.
// First read (no key in LS) returns a zero-state object so the menu can compute
// triggers without null-guards everywhere.
//
// Schema:
//   achievementsCount: number    — how many achievements were unlocked when user
//                                  last opened the Achievements view
//   goalsAt:           ISO string — when user last opened the Goals manager
//   wrappedYear:       number     — last calendar year for which user opened Wrapped
//
// Trigger logic lives in App.jsx; this module just stores/loads the raw object.
const MENU_SEEN_DEFAULT = { achievementsCount:0, goalsAt:null, wrappedYear:null };
export function menuSeenRead() {
  try {
    const raw = localStorage.getItem(LS_MENU_SEEN);
    if (!raw) return { ...MENU_SEEN_DEFAULT };
    const parsed = JSON.parse(raw);
    return { ...MENU_SEEN_DEFAULT, ...parsed };
  } catch { return { ...MENU_SEEN_DEFAULT }; }
}
export function menuSeenWrite(obj) {
  try { localStorage.setItem(LS_MENU_SEEN, JSON.stringify(obj)); } catch {}
}
// Convenience: patch a subset of fields and persist. Returns the new full object.
export function menuSeenUpdate(patch) {
  const next = { ...menuSeenRead(), ...patch };
  menuSeenWrite(next);
  return next;
}

// ─── Language + currency selection ────────────────────────────────────────
export function getLang() {
  const saved = localStorage.getItem(LS_LANG);
  if (saved) return saved;
  return navigator.language?.startsWith('pl') ? 'pl' : 'en';
}
export function getCurrency() {
  try { const c = localStorage.getItem(LS_CURRENCY); if (c && CURRENCIES[c]) return c; } catch {}
  return 'PLN';
}
export function getCurSymbol() { return (CURRENCIES[getCurrency()] || CURRENCIES.PLN).symbol; }
// Default for Onboarding picker — based on navigator.language at first render.
export function getDefaultCurrency() {
  try {
    const l = (navigator.language || '').toLowerCase();
    if (l.startsWith('pl')) return 'PLN';
    if (/^(de|fr|es|it)/.test(l)) return 'EUR';
    if (l === 'en-us') return 'USD';
    if (l === 'en-gb') return 'GBP';
  } catch {}
  return 'PLN';
}

// ─── Backup export / import ───────────────────────────────────────────────
export function exportData(games, lang, onDone) {
  const blob = new Blob([JSON.stringify({ version:1, exported:new Date().toISOString(), count:games.length, games }, null, 2)], { type:'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PS5Vault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 100);
  if (typeof onDone === 'function') onDone();
}

export function importData(file, onOk, onErr) {
  const r = new FileReader();
  r.onload = e => { try { const d = JSON.parse(e.target.result); const g = Array.isArray(d) ? d : d.games; if (!Array.isArray(g)) throw new Error('Invalid format'); onOk(g); } catch (e) { onErr(e.message); } };
  r.readAsText(file);
}

// Maximum import file size — protects against memory exhaustion from accidental
// or malicious large JSONs. Realistic backup with 1000 games + sessions ~ 2MB.
const IMPORT_MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// Validate that an imported game has the minimum fields needed to render safely
export function isValidGameShape(g) {
  if (!g || typeof g !== 'object') return false;
  if (typeof g.title !== 'string' || !g.title.trim()) return false;
  return true;
}

export function importMerge(file, existing, onOk, onErr) {
  if (file.size > IMPORT_MAX_BYTES) { onErr('File too large (>10MB)'); return; }
  const r = new FileReader();
  r.onerror = () => onErr('Read failed');
  r.onload = e => { try {
    const d = JSON.parse(e.target.result); const imported = Array.isArray(d) ? d : d.games;
    if (!Array.isArray(imported)) throw new Error('Invalid format');
    // Filter out malformed entries and ensure each has an id (assign new if missing)
    const cleaned = imported.filter(isValidGameShape).map(g => g.id ? g : { ...g, id:uid() });
    const existingIds = new Set(existing.map(g => g.id));
    const newGames = cleaned.filter(g => !existingIds.has(g.id));
    onOk([...existing, ...newGames], newGames.length, cleaned.length - newGames.length);
  } catch (err) { onErr(err.message); } };
  r.readAsText(file);
}

// v1.2.0: importReplace — nadpisuje całą kolekcję backupem (destructive)
// Preserves all fields as-is, including sessions[], hours, ratings etc.
export function importReplace(file, onOk, onErr) {
  if (file.size > IMPORT_MAX_BYTES) { onErr('File too large (>10MB)'); return; }
  const r = new FileReader();
  r.onerror = () => onErr('Read failed');
  r.onload = e => { try {
    const d = JSON.parse(e.target.result); const imported = Array.isArray(d) ? d : d.games;
    if (!Array.isArray(imported)) throw new Error('Invalid format');
    const cleaned = imported.filter(isValidGameShape).map(g => g.id ? g : { ...g, id:uid() });
    onOk(cleaned, cleaned.length);
  } catch (err) { onErr(err.message); } };
  r.readAsText(file);
}

// v1.11.1 — Right-to-deletion / Play Data Safety compliance.
// Removes EVERY ps5vault_* key from localStorage. After this call the app behaves like
// a fresh install — next mount triggers the welcome screen, all caches gone, all
// preferences reset. There is no "soft delete" — this is the nuclear option.
//
// Returns { wiped: number, errors: string[] } so caller can flash a toast with the count.
// Errors come from individual removeItem failures (rare — usually only when storage is
// disabled or quota exceeded mid-iteration).
//
// Caller MUST trigger a hard reload after this returns — clearing state in-memory only
// would leave React refs and useState pointing at deleted underlying data, causing
// inconsistent UI. window.location.reload() is the right exit path.
export function wipeAllData() {
  const errors = [];
  let wiped = 0;
  // Snapshot keys first — modifying localStorage during iteration is unsafe in some browsers.
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ps5vault_')) keys.push(k);
    }
  } catch (e) { errors.push(`enumerate: ${e.message || e}`); }

  for (const k of keys) {
    try {
      localStorage.removeItem(k);
      wiped++;
    } catch (e) { errors.push(`${k}: ${e.message || e}`); }
  }

  return { wiped, errors };
}
