// Tests for computeYearReview() — Year-in-Review derivation (Spotify Wrapped).
//
// v1.17.5 — Rewritten. computeYearReview now derives from game-level fields
// (hours, lastPlayed, completedAt, addedAt) instead of sessions[]. A game's
// lifetime hours are attributed to the year it was last played.
//
// Returns null when the year has zero data (no active game + none added + none
// completed). Otherwise returns: totalHours, gamesPlayed, avgHoursPerGame,
// gamesAdded, gamesCompleted, platinums, topPlayed[], highestRated, topGenre,
// totalSpent, totalRecovered.
import { describe, it, expect } from 'vitest';
import { computeYearReview, getYearsWithData } from '../src/lib/wrapped.js';
import { makeGame } from './fixtures.js';

const Y = 2024; // Test year
const iso = (year, month, day) => new Date(year, month, day, 12, 0, 0).toISOString();

describe('computeYearReview', () => {
  it('returns null for year with zero data', () => {
    expect(computeYearReview([], Y)).toBeNull();
    // Game added + played in a different year
    const games = [makeGame({ addedAt: iso(2020, 5, 15), lastPlayed: iso(2020, 5, 15), hours: 10 })];
    expect(computeYearReview(games, Y)).toBeNull();
  });

  it('returns object when at least one game added in year (no hours needed)', () => {
    const games = [makeGame({ addedAt: iso(Y, 2, 15), hours: 0 })];
    const r = computeYearReview(games, Y);
    expect(r).not.toBeNull();
    expect(r.year).toBe(Y);
    expect(r.gamesAdded).toBe(1);
    expect(r.totalHours).toBe(0);
    expect(r.gamesPlayed).toBe(0);
  });

  it('totalHours sums hours of games last-played in the year', () => {
    const games = [
      makeGame({ hours: 40, lastPlayed: iso(Y, 5, 10), addedAt: iso(Y, 0, 1) }),   // IN
      makeGame({ hours: 20, lastPlayed: iso(Y, 8, 2), addedAt: iso(Y, 0, 1) }),    // IN
      makeGame({ hours: 99, lastPlayed: iso(Y - 1, 11, 30), addedAt: iso(Y, 0, 1) }), // last year — OUT
    ];
    const r = computeYearReview(games, Y);
    expect(r.totalHours).toBe(60);
    expect(r.gamesPlayed).toBe(2);
    expect(r.avgHoursPerGame).toBe(30);
  });

  it('attributes imported games to their lastPlayed year (not addedAt)', () => {
    // Imported today (2026) but last played in Y — should count in Y, not 2026.
    const games = [makeGame({ hours: 50, lastPlayed: iso(Y, 3, 1), addedAt: iso(2026, 4, 12) })];
    const r = computeYearReview(games, Y);
    expect(r.totalHours).toBe(50);
    expect(r.gamesPlayed).toBe(1);
    expect(r.gamesAdded).toBe(0); // addedAt is 2026, not Y
  });

  it('gamesCompleted counts ukonczone with completedAt in year', () => {
    const games = [
      makeGame({ status: 'ukonczone', completedAt: iso(Y, 3, 10), addedAt: iso(Y, 0, 1) }),
      makeGame({ status: 'ukonczone', completedAt: iso(Y - 1, 11, 15), addedAt: iso(Y, 0, 1) }), // last year
      makeGame({ status: 'gram', addedAt: iso(Y, 1, 2) }),
    ];
    expect(computeYearReview(games, Y).gamesCompleted).toBe(1);
  });

  it('platinums counted only with completion in year', () => {
    const games = [
      makeGame({ platinum: true, status: 'ukonczone', completedAt: iso(Y, 5, 1), addedAt: iso(Y, 0, 1) }),
      makeGame({ platinum: true, status: 'ukonczone', completedAt: iso(Y - 2, 5, 1), addedAt: iso(Y - 2, 0, 1) }),
    ];
    expect(computeYearReview(games, Y).platinums).toBe(1);
  });

  it('topPlayed: sorts active games by hours desc, capped at 3', () => {
    const games = [
      makeGame({ id: 'a', title: 'A', hours: 8,  lastPlayed: iso(Y, 5, 1), addedAt: iso(Y, 0, 1) }),
      makeGame({ id: 'b', title: 'B', hours: 12, lastPlayed: iso(Y, 6, 1), addedAt: iso(Y, 0, 1) }),
      makeGame({ id: 'c', title: 'C', hours: 2,  lastPlayed: iso(Y, 7, 1), addedAt: iso(Y, 0, 1) }),
      makeGame({ id: 'd', title: 'D', hours: 1,  lastPlayed: iso(Y, 7, 2), addedAt: iso(Y, 0, 1) }),
    ];
    const r = computeYearReview(games, Y);
    expect(r.topPlayed.map(t => t.game.title)).toEqual(['B', 'A', 'C']);
    expect(r.topPlayed[0].hours).toBe(12);
    expect(r.topPlayed[1].hours).toBe(8);
  });

  it('topGenre: groups active games by genre, picks top by hours', () => {
    const games = [
      makeGame({ id: 'a', genre: 'RPG', hours: 10, lastPlayed: iso(Y, 5, 1), addedAt: iso(Y, 0, 1) }),
      makeGame({ id: 'b', genre: 'Action', hours: 3, lastPlayed: iso(Y, 5, 2), addedAt: iso(Y, 0, 1) }),
      makeGame({ id: 'c', genre: 'RPG', hours: 2, lastPlayed: iso(Y, 5, 3), addedAt: iso(Y, 0, 1) }),
    ];
    const r = computeYearReview(games, Y);
    expect(r.topGenre.name).toBe('RPG');
    expect(r.topGenre.hours).toBe(12);
    expect(r.topGenre.gamesCount).toBe(2);
  });

  it('topGenre: null when no active game has a genre', () => {
    const games = [makeGame({ id: 'a', genre: '', hours: 5, lastPlayed: iso(Y, 5, 1), addedAt: iso(Y, 0, 1) })];
    expect(computeYearReview(games, Y).topGenre).toBeNull();
  });

  it('totalSpent sums priceBought + extraSpend for games added in year', () => {
    const games = [
      makeGame({ priceBought: 200, extraSpend: 50, addedAt: iso(Y, 2, 15) }),
      makeGame({ priceBought: 100, addedAt: iso(Y, 3, 1) }),
      makeGame({ priceBought: 999, addedAt: iso(Y - 1, 0, 1) }), // OUT
    ];
    expect(computeYearReview(games, Y).totalSpent).toBe(350);
  });

  it('totalRecovered sums priceSold for games completed in year', () => {
    const games = [
      makeGame({ status: 'ukonczone', priceSold: 80, completedAt: iso(Y, 5, 1), addedAt: iso(Y, 0, 1) }),
      makeGame({ status: 'ukonczone', priceSold: 120, completedAt: iso(Y - 1, 11, 30), addedAt: iso(Y - 1, 0, 1) }), // OUT
    ];
    expect(computeYearReview(games, Y).totalRecovered).toBe(80);
  });

  it('totalSpent excludes subscription games (PS Plus / Game Pass)', () => {
    const games = [
      makeGame({ priceBought: 200, addedAt: iso(Y, 2, 15), source: 'owned' }),
      makeGame({ priceBought: 999, addedAt: iso(Y, 3, 1), source: 'psplus' }),
      makeGame({ priceBought: 500, addedAt: iso(Y, 4, 1), source: 'gamepass' }),
    ];
    expect(computeYearReview(games, Y).totalSpent).toBe(200);
  });

  it('highestRated: picks top-rated game active or added in year', () => {
    const games = [
      makeGame({ id: 'a', title: 'A', rating: 7, hours: 5, lastPlayed: iso(Y, 5, 1), addedAt: iso(Y, 0, 1) }),
      makeGame({ id: 'b', title: 'B', rating: 9, hours: 3, lastPlayed: iso(Y, 5, 2), addedAt: iso(Y, 0, 1) }),
    ];
    expect(computeYearReview(games, Y).highestRated.title).toBe('B');
  });
});

describe('getYearsWithData', () => {
  it('returns empty for empty games', () => {
    expect(getYearsWithData([])).toEqual([]);
  });

  it('includes years from lastPlayed / completedAt / addedAt, newest first', () => {
    const games = [
      makeGame({ addedAt: iso(2026, 0, 1), lastPlayed: iso(2022, 5, 1) }),  // added 2026, played 2022
      makeGame({ addedAt: iso(2026, 0, 1), completedAt: iso(2024, 1, 15) }), // completed 2024
      makeGame({ addedAt: iso(2023, 0, 15) }),
    ];
    expect(getYearsWithData(games)).toEqual([2026, 2024, 2023, 2022]);
  });

  it('filters out garbage years outside 2000-2100', () => {
    const games = [
      makeGame({ addedAt: iso(1980, 0, 1) }),
      makeGame({ addedAt: iso(2024, 5, 1) }),
    ];
    expect(getYearsWithData(games)).toEqual([2024]);
  });
});
