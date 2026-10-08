// v1.19.2 - Status changes and deletes that can be undone. Shared by the single-game
// actions and the multi-select bar in the collection. Pure functions, no React.

// Status rules for one game: completedAt is stamped once, when a game first becomes
// completed; lastPlayed when it moves into playing/completed (keeps Year in Review right).
export function applyStatus(g, status, extra = {}, now = new Date().toISOString()) {
  const next = { ...g, status, ...extra };
  if (status === 'ukonczone' && g.status !== 'ukonczone' && !next.completedAt) next.completedAt = now;
  if ((status === 'gram' || status === 'ukonczone') && g.status !== status && extra.lastPlayed === undefined) next.lastPlayed = now;
  return next;
}

// Change many games at once. `before` holds the untouched originals for undo.
export function setStatusMany(games, ids, status, now = new Date().toISOString()) {
  const set = ids instanceof Set ? ids : new Set(ids);
  const before = new Map();
  const next = games.map(g => {
    if (!set.has(g.id) || g.status === status) return g;
    before.set(g.id, g);
    return applyStatus(g, status, {}, now);
  });
  return { next, before };
}

export function revertMany(current, before) {
  return current.map(g => before.get(g.id) || g);
}

// Remove games by id. `removed` remembers each game with its old position for undo.
export function removeGames(games, ids) {
  const set = ids instanceof Set ? ids : new Set(ids);
  const kept = [];
  const removed = [];
  games.forEach((g, i) => (set.has(g.id) ? removed.push({ g, i }) : kept.push(g)));
  return { kept, removed };
}

// Put removed games back where they were, skipping any id that exists again.
export function restoreGames(current, removed) {
  const have = new Set(current.map(g => g.id));
  const out = [...current];
  for (const { g, i } of removed) if (!have.has(g.id)) out.splice(Math.min(i, out.length), 0, g);
  return out;
}
