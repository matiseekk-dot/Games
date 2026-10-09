// v1.22.0 - Sync between phones through the Drive copy (drivebackup.js).
//
// The Drive file used to be a plain backup: whichever phone uploaded last overwrote the
// other one's changes. Now every upload first reads the Drive copy and merges it:
//   - every game and wishlist entry carries updatedAt (stamped when it changes),
//   - a deleted entry leaves a tombstone { id: deletedAt } so it does not come back from
//     the other phone,
//   - for the same id the newer updatedAt wins; a tombstone newer than the entry removes it,
//   - the same game added separately on two phones (different ids) is matched by RAWG id or
//     title + platform and kept once.
// Pure functions, no storage access except the tombstone helpers at the bottom.

const TOMB_KEY = 'ps5vault_tombstones';
const TOMB_TTL = 180 * 24 * 3600 * 1000; // a phone offline for half a year may resurrect a deletion

const ts = v => { const n = Date.parse(v || ''); return Number.isFinite(n) ? n : 0; };
const stamp = x => ts(x.updatedAt) || ts(x.addedAt);
const norm = s => String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
const sameKey = x => (x.rawgId ? 'r' + x.rawgId : 't' + norm(x.title)) + '|' + (x.platform || '');

// Give changed and added entries a fresh updatedAt (an entry brought back by undo is newer
// than its tombstone and than the edit it undid). Lists merged by the sync are stored
// without calling this, so they keep the other phone's times.
export function stampChanges(prev, next, now = new Date().toISOString()) {
  if (!Array.isArray(next) || prev === next) return next;
  const before = new Map((prev || []).map(x => [x && x.id, x]));
  let changed = false;
  const out = next.map(x => {
    if (!x || typeof x !== 'object') return x;
    const old = before.get(x.id);
    if (old === x) return x;
    changed = true;
    return { ...x, updatedAt: now };
  });
  return changed ? out : next;
}

// Ids that disappeared between two lists
export function removedIds(prev, next) {
  const keep = new Set((next || []).map(x => x && x.id));
  return (prev || []).filter(x => x && x.id && !keep.has(x.id)).map(x => x.id);
}

export function mergeTombstones(a = {}, b = {}, now = Date.now()) {
  const out = {};
  for (const src of [a, b]) for (const [id, at] of Object.entries(src || {})) {
    if (now - ts(at) > TOMB_TTL) continue;
    if (!out[id] || ts(at) > ts(out[id])) out[id] = at;
  }
  return out;
}

// Merge two lists of games (or wishlist entries). Local wins ties, so nothing changes
// locally when both sides are equal. Returns { list, changed } where changed means the
// local list is different after the merge.
export function mergeLists(local = [], remote = [], tombs = {}) {
  const byId = new Map();
  const order = [];
  for (const x of local) if (x && x.id) { byId.set(x.id, x); order.push(x.id); }
  const byKey = new Map(local.filter(x => x && x.id).map(x => [sameKey(x), x.id]));
  let changed = false;
  for (const r of remote || []) {
    if (!r || typeof r !== 'object' || !r.id || typeof r.title !== 'string') continue;
    let id = r.id;
    if (!byId.has(id) && byKey.has(sameKey(r))) {
      // Same game added on both phones: keep the smaller id on both, so they converge
      id = byKey.get(sameKey(r));
      if (r.id < id) {
        const l = byId.get(id);
        byId.delete(id); byId.set(r.id, { ...l, id: r.id });
        order[order.indexOf(id)] = r.id; byKey.set(sameKey(r), r.id);
        id = r.id; changed = true;
      }
    }
    const l = byId.get(id);
    if (!l) { byId.set(id, r); order.push(id); byKey.set(sameKey(r), id); changed = true; }
    else if (stamp(r) > stamp(l)) { byId.set(id, { ...r, id }); changed = true; }
  }
  const list = [];
  for (const id of order) {
    const x = byId.get(id);
    if (tombs[id] && ts(tombs[id]) >= stamp(x)) { if (local.some(l => l && l.id === id)) changed = true; continue; }
    list.push(x);
  }
  return { list, changed };
}

// Whole Drive payload vs this phone. local/remote = { games, wishlist, tombstones, wishTombstones }
export function mergeSync(local, remote, now = Date.now()) {
  const tombstones = mergeTombstones(local.tombstones, remote && remote.tombstones, now);
  const wishTombstones = mergeTombstones(local.wishTombstones, remote && remote.wishTombstones, now);
  const g = mergeLists(local.games, remote && Array.isArray(remote.games) ? remote.games : [], tombstones);
  const w = mergeLists(local.wishlist, remote && Array.isArray(remote.wishlist) ? remote.wishlist : [], wishTombstones);
  return { games: g.list, wishlist: w.list, tombstones, wishTombstones, gamesChanged: g.changed, wishChanged: w.changed };
}

// ─── Tombstones in localStorage ────────────────────────────────────────────
function readKey(k) {
  try { const v = JSON.parse(localStorage.getItem(k) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; } catch { return {}; }
}
function writeKey(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }

export function readTombs(kind = 'games') { return readKey(kind === 'wish' ? TOMB_KEY + '_wish' : TOMB_KEY); }
export function writeTombs(map, kind = 'games') { writeKey(kind === 'wish' ? TOMB_KEY + '_wish' : TOMB_KEY, mergeTombstones(map, {})); }
export function addTombs(ids, kind = 'games', at = new Date().toISOString()) {
  if (!ids || !ids.length) return;
  const m = readTombs(kind);
  for (const id of ids) m[id] = at;
  writeTombs(m, kind);
}
