// Tests for computeYearReview() — Year-in-Review derivation (Spotify Wrapped).
//
// Returns null when year has zero data (no games added that year + no sessions).
// Otherwise returns aggregate object: totalHours, gamesAdded, gamesCompleted, platinums,
// topPlayed[], highestRated, topGenre, totalSpent, totalRecovered, activeDays, longestStreak,
// longestSession, sessionCount.
//
// Date handling is critical here — years are bucketed by local time (Jan 1–Dec 31).
import { describe, it, expect } from 'vitest';
import { computeYearReview, getYearsWithData } from '../src/lib/wrapped.js';
import { makeGame } from './fixtures.js';

// Build a session at exact date (year, month [0-indexed], day, hour) lasting `hours`.
function sessionAtDate(year, month, day, hour, hours) {
  const start = new Date(year, month, day, hour, 0, 0, 0);
  const end = new Date(start.getTime() + hours * 3600 * 1000);
  return { startedAt: start.toISOString(), endedAt: end.toISOString(), hours };
}

const Y = 2024; // Test year

describe('computeYearReview', () => {
  it('returns null for year with zero data', () => {
    expect(computeYearReview([], Y)).toBeNull();
    // Game added in different year, no sessions in target year
    const games = [makeGame({ addedAt: '2020-06-15T12:00:00.000Z' })];
    expect(computeYearReview(games, Y)).toBeNull();
  });

  it('returns object when at least one game added in year (no sessions needed)', () => {
    const games = [makeGame({ addedAt: `${Y}-03-15T12:00:00.000Z` })];
    const r = computeYearReview(games, Y);
    expect(r).not.toBeNull();
    expect(r.year).toBe(Y);
    expect(r.gamesAdded).toBe(1);
    expect(r.totalHours).toBe(0);
  });

  it('totalHours sums sessions in year only', () => {
    const games = [makeGame({
      addedAt: `${Y}-01-01T12:00:00.000Z`,
      sessions: [
        sessionAtDate(Y, 5, 10, 20, 3),       // June, +3h, in year
        sessionAtDate(Y, 5, 11, 21, 2.5),     // June, +2.5h, in year
        sessionAtDate(Y - 1, 11, 30, 23, 5),  // Dec last year, OUT
        sessionAtDate(Y + 1, 0, 1, 1, 4),     // Jan next year, OUT
      ],
    })];
    const r = computeYearReview(games, Y);
    expect(r.totalHours).toBe(6); // round(5.5) = 6
    expect(r.sessionCount).toBe(2);
  });

  it('gamesCompleted counts ukonczone with completedAt in year', () => {
    const games = [
      makeGame({ status: 'ukonczone', completedAt: `${Y}-04-10T12:00:00.000Z`, addedAt: `${Y}-01-01T12:00:00.000Z` }),
      makeGame({ status: 'ukonczone', completedAt: `${Y - 1}-12-15T12:00:00.000Z`, addedAt: `${Y}-01-01T12:00:00.000Z` }), // last year
      makeGame({ status: 'gram', addedAt: `${Y}-02-02T12:00:00.000Z` }),
    ];
    const r = computeYearReview(games, Y);
    expect(r.gamesCompleted).toBe(1);
  });

  it('platinums counted only with completion in year', () => {
    const games = [
      makeGame({ platinum: true, completedAt: `${Y}-06-01T12:00:00.000Z`, addedAt: `${Y}-01-01T12:00:00.000Z`, status: 'ukonczone' }),
      makeGame({ platinum: true, completedAt: `${Y - 2}-06-01T12:00:00.000Z`, addedAt: `${Y - 2}-01-01T12:00:00.000Z`, status: 'ukonczone' }),
    ];
    const r = computeYearReview(games, Y);
    expect(r.platinums).toBe(1);
  });

  it('topPlayed: aggregates per-game hours, sorted desc, capped at 3', () => {
    const games = [
      makeGame({ id: 'a', title: 'A', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 5, 1, 20, 4),
        sessionAtDate(Y, 5, 2, 20, 4), // total 8h
      ]}),
      makeGame({ id: 'b', title: 'B', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 6, 1, 20, 12), // 12h
      ]}),
      makeGame({ id: 'c', title: 'C', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 7, 1, 20, 2),
      ]}),
      makeGame({ id: 'd', title: 'D', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 7, 2, 20, 1),
      ]}),
    ];
    const r = computeYearReview(games, Y);
    expect(r.topPlayed.map(t => t.game.title)).toEqual(['B', 'A', 'C']);
    expect(r.topPlayed[0].hours).toBe(12);
    expect(r.topPlayed[1].hours).toBe(8);
  });

  it('topGenre: groups sessions by genre, picks top by hours', () => {
    const games = [
      makeGame({ id: 'a', genre: 'RPG', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 5, 1, 20, 10),
      ]}),
      makeGame({ id: 'b', genre: 'Action', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 5, 2, 20, 3),
      ]}),
      makeGame({ id: 'c', genre: 'RPG', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 5, 3, 20, 2),
      ]}),
    ];
    const r = computeYearReview(games, Y);
    expect(r.topGenre.name).toBe('RPG');
    expect(r.topGenre.hours).toBe(12);
    expect(r.topGenre.gamesCount).toBe(2); // 'a' + 'c'
  });

  it('topGenre: returns null when no sessions have genre', () => {
    const games = [
      makeGame({ id: 'a', genre: '', addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
        sessionAtDate(Y, 5, 1, 20, 5),
      ]}),
    ];
    const r = computeYearReview(games, Y);
    expect(r.topGenre).toBeNull();
  });

  it('totalSpent sums priceBought + extraSpend for games added in year', () => {
    const games = [
      makeGame({ priceBought: 200, extraSpend: 50, addedAt: `${Y}-03-15T12:00:00.000Z` }),
      makeGame({ priceBought: 100, addedAt: `${Y}-04-01T12:00:00.000Z` }),
      makeGame({ priceBought: 999, addedAt: `${Y - 1}-01-01T12:00:00.000Z` }), // OUT
    ];
    const r = computeYearReview(games, Y);
    expect(r.totalSpent).toBe(350);
  });

  it('totalRecovered sums priceSold for games completed in year', () => {
    const games = [
      makeGame({ status: 'ukonczone', priceSold: 80, completedAt: `${Y}-06-01T12:00:00.000Z`, addedAt: `${Y}-01-01T12:00:00.000Z` }),
      makeGame({ status: 'ukonczone', priceSold: 120, completedAt: `${Y - 1}-12-30T12:00:00.000Z`, addedAt: `${Y - 1}-01-01T12:00:00.000Z` }), // OUT
    ];
    const r = computeYearReview(games, Y);
    expect(r.totalRecovered).toBe(80);
  });

  it('activeDays counts unique session dates in year', () => {
    const games = [makeGame({ addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
      sessionAtDate(Y, 5, 10, 20, 1),
      sessionAtDate(Y, 5, 10, 22, 1), // same day
      sessionAtDate(Y, 5, 11, 20, 1), // different day
      sessionAtDate(Y, 5, 12, 20, 1), // different day
    ]})];
    const r = computeYearReview(games, Y);
    expect(r.activeDays).toBe(3);
  });

  it('totalDaysInYear: 365 normal, 366 leap year', () => {
    const games = [makeGame({ addedAt: `${Y}-06-01T12:00:00.000Z` })];
    const r2024 = computeYearReview(games, 2024); // leap
    expect(r2024.totalDaysInYear).toBe(366);

    const g2023 = [makeGame({ addedAt: '2023-06-01T12:00:00.000Z' })];
    const r2023 = computeYearReview(g2023, 2023);
    expect(r2023.totalDaysInYear).toBe(365);

    // Centuries are NOT leap unless divisible by 400
    const g2100 = [makeGame({ addedAt: '2100-06-01T12:00:00.000Z' })];
    expect(computeYearReview(g2100, 2100).totalDaysInYear).toBe(365);
    const g2000 = [makeGame({ addedAt: '2000-06-01T12:00:00.000Z' })];
    expect(computeYearReview(g2000, 2000).totalDaysInYear).toBe(366);
  });

  it('longestSession is max single-session hours, rounded to 1 decimal', () => {
    const games = [makeGame({ addedAt: `${Y}-01-01T12:00:00.000Z`, sessions: [
      sessionAtDate(Y, 5, 1, 20, 1),
      sessionAtDate(Y, 5, 2, 20, 4.7),
      sessionAtDate(Y, 5, 3, 20, 2),
    ]})];
    const r = computeYearReview(games, Y);
    expect(r.longestSession).toBe(4.7);
  });
});

describe('getYearsWithData', () => {
  it('returns empty for empty games', () => {
    expect(getYearsWithData([])).toEqual([]);
  });

  it('returns sorted (newest first) unique years from addedAt and sessions', () => {
    const games = [
      makeGame({ addedAt: '2022-06-01T12:00:00.000Z', sessions: [
        sessionAtDate(2022, 5, 1, 20, 1),
        sessionAtDate(2024, 1, 15, 20, 2),
      ]}),
      makeGame({ addedAt: '2023-01-15T12:00:00.000Z', sessions: [] }),
    ];
    expect(getYearsWithData(games)).toEqual([2024, 2023, 2022]);
  });

  it('filters out garbage years outside 2000-2100', () => {
    const games = [
      makeGame({ addedAt: '1980-01-01T12:00:00.000Z' }),
      makeGame({ addedAt: '2024-06-01T12:00:00.000Z' }),
    ];
    expect(getYearsWithData(games)).toEqual([2024]);
  });
});
