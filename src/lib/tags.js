// v1.22.0 - Own tags ("lists"): free words on a game, e.g. "co-op", "with Ola", "PS Plus
// Extra", "2026 backlog". A game can have a few; the collection filters by one. Stored as
// g.tags (array of strings), travels in backups and the Drive sync like any other field.
export const MAX_TAGS = 10;
export const MAX_TAG_LEN = 24;

export function normTag(s) {
  return String(s ?? '').replace(/[\s,]+/g, ' ').trim().slice(0, MAX_TAG_LEN).trim();
}

// Unique (ignoring case), non-empty, at most MAX_TAGS, first spelling kept
export function cleanTags(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const out = [];
  for (const raw of list) {
    const tag = normTag(raw);
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) continue;
    seen.add(key);
    out.push(tag);
    if (out.length >= MAX_TAGS) break;
  }
  return out;
}

export function hasTag(g, tag) {
  const key = String(tag).toLowerCase();
  return Array.isArray(g.tags) && g.tags.some(x => String(x).toLowerCase() === key);
}

// All tags in the collection, most used first, then A-Z
export function allTags(games) {
  const count = new Map();
  const spell = new Map();
  for (const g of games || []) for (const tag of cleanTags(g && g.tags)) {
    const key = tag.toLowerCase();
    count.set(key, (count.get(key) || 0) + 1);
    if (!spell.has(key)) spell.set(key, tag);
  }
  return [...count.keys()]
    .sort((a, b) => count.get(b) - count.get(a) || a.localeCompare(b))
    .map(k => ({ tag: spell.get(k), n: count.get(k) }));
}

// Add one tag to the chosen games. Returns { next, before } like setStatusMany (undo).
export function addTagMany(games, ids, tag) {
  const clean = normTag(tag);
  const before = new Map();
  if (!clean) return { next: games, before };
  const next = games.map(g => {
    if (!ids.has(g.id) || hasTag(g, clean)) return g;
    const tags = cleanTags([...(Array.isArray(g.tags) ? g.tags : []), clean]);
    if (tags.length === (Array.isArray(g.tags) ? g.tags.length : 0)) return g; // full
    before.set(g.id, g);
    return { ...g, tags };
  });
  return { next, before };
}
