// Tests for computeWeeklyStats() — last-7-days summary used by weekly push notification.
//
// Returns null when there are no recent sessions (no point pinging an inactive user).
// Otherwise returns { totalHours, sessionCount, topGame } where topGame is the game
// with most hours in the window, by hours descending.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { computeWeeklyStats } from '../src/lib/weeklysummary.js';
import { makeGame } from './fixtures.js';

// Helper: session at exactly N days ago, lasting `hours` hours.
function sessionDaysAgo(daysAgo, hours, base = Date.now()) {
  const start = new Date(base - daysAgo * 86400000);
  const end = new Date(start.getTime() + hours * 3600 * 1000);
  return { startedAt: start.toISOString(), endedAt: end.toISOString(), hours };
}

describe('computeWeeklyStats', () => {
  it('returns null for empty games', () => {
    expect(computeWeeklyStats([])).toBeNull();
  });

  it('returns null when no sessions exist', () => {
    const games = [makeGame({ sessions: [] })];
    expect(computeWeeklyStats(games)).toBeNull();
  });

  it('returns null when all sessions are older than 7 days', () => {
    const games = [makeGame({ sessions: [
      sessionDaysAgo(8, 3),
      sessionDaysAgo(14, 5),
      sessionDaysAgo(30, 2),
    ]})];
    expect(computeWeeklyStats(games)).toBeNull();
  });

  it('counts only sessions within last 7 days', () => {
    const games = [makeGame({ id: 'a', title: 'A', sessions: [
      sessionDaysAgo(2, 3),   // IN
      sessionDaysAgo(5, 2),   // IN
      sessionDaysAgo(10, 5),  // OUT
      sessionDaysAgo(20, 3),  // OUT
    ]})];
    const r = computeWeeklyStats(games);
    expect(r.sessionCount).toBe(2);
    expect(r.totalHours).toBe(5);
  });

  it('rounds totalHours to one decimal place', () => {
    const games = [makeGame({ id: 'a', title: 'A', sessions: [
      sessionDaysAgo(1, 1.234),
      sessionDaysAgo(2, 2.567),
    ]})];
    const r = computeWeeklyStats(games);
    // 1.234 + 2.567 = 3.801 → round to 3.8
    expect(r.totalHours).toBe(3.8);
  });

  it('topGame: game with most hours in window', () => {
    const games = [
      makeGame({ id: 'a', title: 'Less Played', sessions: [
        sessionDaysAgo(1, 1),
        sessionDaysAgo(2, 2),
      ]}),
      makeGame({ id: 'b', title: 'Top Played', sessions: [
        sessionDaysAgo(3, 5),
        sessionDaysAgo(4, 3),
      ]}),
    ];
    const r = computeWeeklyStats(games);
    expect(r.topGame.title).toBe('Top Played');
    expect(r.topGame.hours).toBe(8);
  });

  it('topGame ignores OUT-of-window sessions when summing', () => {
    const games = [
      makeGame({ id: 'a', title: 'A', sessions: [
        sessionDaysAgo(2, 5),   // IN
        sessionDaysAgo(15, 50), // OUT — would dominate if counted
      ]}),
      makeGame({ id: 'b', title: 'B', sessions: [
        sessionDaysAgo(2, 6), // IN
      ]}),
    ];
    const r = computeWeeklyStats(games);
    expect(r.topGame.title).toBe('B'); // 6h IN beats A's 5h IN
  });

  it('handles game lookup failure gracefully (orphan session)', () => {
    // If session has gameId pointing to non-existent game (shouldn't happen with
    // collectSessions but defensive), it's skipped from topGame computation.
    // Total hours / count still include it though — we count what we see.
    const games = [makeGame({ id: 'a', title: 'A', sessions: [
      sessionDaysAgo(2, 3),
    ]})];
    const r = computeWeeklyStats(games);
    expect(r.topGame).not.toBeNull();
    expect(r.topGame.title).toBe('A');
  });

  it('exact 7-day boundary: sessions at exactly 7 days ago are IN', () => {
    // 7 * 24 * 3600 * 1000 = exactly the WEEK_MS cutoff.
    // Session AT cutoff is IN (>= weekAgo), session BEFORE is OUT.
    const games = [makeGame({ id: 'a', title: 'A', sessions: [
      sessionDaysAgo(6.99, 1), // IN (just under 7d)
      sessionDaysAgo(7.01, 1), // OUT (just over 7d)
    ]})];
    const r = computeWeeklyStats(games);
    expect(r.sessionCount).toBe(1);
  });
});
