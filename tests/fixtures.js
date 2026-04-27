// Test fixtures — shared helpers for building realistic Game / Session shapes.
// Centralized here so each test file doesn't reinvent the wheel.

/**
 * Builds an ISO timestamp for `now - days` (rounded to noon local for stability).
 * Stable across test runs that span midnight.
 */
export function daysAgoISO(days, now = Date.now()) {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d.toISOString();
}

/**
 * Builds a session object placed `daysAgo` days back at `hour` local time, lasting `hours`.
 */
export function sessionAt(daysAgo, hour, hours, now = Date.now()) {
  const start = new Date(now);
  start.setDate(start.getDate() - daysAgo);
  start.setHours(hour, 0, 0, 0);
  const end = new Date(start.getTime() + hours * 3600 * 1000);
  return { startedAt: start.toISOString(), endedAt: end.toISOString(), hours };
}

/**
 * Game factory with sensible defaults. Override any field via `overrides`.
 *
 * Default shape mirrors EF (constants.js) plus a stable id/title.
 */
export function makeGame(overrides = {}) {
  return {
    id: 'g_' + Math.random().toString(36).slice(2, 9),
    title: 'Test Game',
    abbr: 'TG',
    status: 'planuje',
    year: 2024,
    genre: 'Action',
    hours: 0,
    rating: null,
    notes: '',
    cover: '',
    releaseDate: '',
    notifyEnabled: false,
    priceBought: '',
    priceSold: null,
    storeBought: '',
    targetHours: '',
    extraSpend: '',
    platform: 'PS5',
    platinum: false,
    lastPlayed: null,
    completedAt: null,
    rawgId: null,
    sessions: [],
    addedAt: daysAgoISO(30),
    ...overrides,
  };
}

/**
 * Builds a `ukonczone` (completed) game with `completedAt` set N days ago.
 */
export function completedGame(daysAgo = 30, overrides = {}) {
  return makeGame({
    status: 'ukonczone',
    completedAt: daysAgoISO(daysAgo),
    lastPlayed: daysAgoISO(daysAgo),
    ...overrides,
  });
}

/**
 * Builds a `gram` (currently playing) game with recent sessions.
 */
export function activeGame(sessions = [], overrides = {}) {
  return makeGame({
    status: 'gram',
    sessions,
    lastPlayed: sessions[0]?.startedAt || daysAgoISO(2),
    ...overrides,
  });
}
