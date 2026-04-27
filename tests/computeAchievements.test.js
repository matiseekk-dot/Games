// Tests for computeAchievements() — derives per-achievement {progress, unlocked, pct}
// from games[] + longestStreak. Pure function, no side effects.
//
// 19 achievements across 8 groups:
//   collector × 5   (1, 10, 25, 50, 100 games)
//   finisher × 3    (1, 10, 25 ukonczone)
//   trophy × 3      (1, 5, 10 platinums)
//   marathoner      (100h on single game)
//   sprinter        (complete in ≤10h)
//   critic × 2      (10, 25 rated)
//   streak × 2      (7, 30 day streaks)
//   genre_hopper    (5+ unique genres)
//   reseller        (5 games sold)
import { describe, it, expect } from 'vitest';
import { computeAchievements } from '../src/lib/achievements.js';
import { makeGame, completedGame } from './fixtures.js';

const findById = (achievements, id) => achievements.find(a => a.id === id);

describe('computeAchievements', () => {
  it('empty games + 0 streak → all locked, all 0% progress', () => {
    const result = computeAchievements([], 0);
    expect(result).toHaveLength(19);
    for (const a of result) {
      expect(a.progress).toBe(0);
      expect(a.unlocked).toBe(false);
      expect(a.pct).toBe(0);
    }
  });

  it('1 game unlocks collector_1 ("First Blood") only', () => {
    const result = computeAchievements([makeGame()], 0);
    expect(findById(result, 'collector_1').unlocked).toBe(true);
    expect(findById(result, 'collector_2').unlocked).toBe(false);
    expect(findById(result, 'collector_2').pct).toBe(10); // 1/10
  });

  it('collector tiers cascade: 50 games unlocks collector_1..4 but not 5', () => {
    const games = Array.from({ length: 50 }, () => makeGame());
    const result = computeAchievements(games, 0);
    expect(findById(result, 'collector_1').unlocked).toBe(true);
    expect(findById(result, 'collector_2').unlocked).toBe(true);
    expect(findById(result, 'collector_3').unlocked).toBe(true);
    expect(findById(result, 'collector_4').unlocked).toBe(true); // rare tier
    expect(findById(result, 'collector_5').unlocked).toBe(false);
    expect(findById(result, 'collector_5').pct).toBe(50);
  });

  it('finisher tiers count only ukonczone games', () => {
    const games = [
      ...Array.from({ length: 5 }, () => completedGame()),
      ...Array.from({ length: 5 }, () => makeGame({ status: 'gram' })), // not done
    ];
    const result = computeAchievements(games, 0);
    expect(findById(result, 'finisher_1').unlocked).toBe(true);  // ≥1
    expect(findById(result, 'finisher_2').unlocked).toBe(false); // need 10
    expect(findById(result, 'finisher_2').progress).toBe(5);
  });

  it('trophy_1 fires only when platinum:true', () => {
    const noPlat = [completedGame(5, { platinum: false })];
    const yesPlat = [completedGame(5, { platinum: true })];
    expect(findById(computeAchievements(noPlat, 0), 'trophy_1').unlocked).toBe(false);
    expect(findById(computeAchievements(yesPlat, 0), 'trophy_1').unlocked).toBe(true);
  });

  it('marathoner: 100h on a SINGLE game (not sum)', () => {
    // 5 games × 30h each = 150h total but no single game ≥100
    const spread = Array.from({ length: 5 }, () => makeGame({ hours: 30 }));
    expect(findById(computeAchievements(spread, 0), 'marathoner').unlocked).toBe(false);
    // Single 120h game → unlocks
    const focused = [makeGame({ hours: 120 })];
    expect(findById(computeAchievements(focused, 0), 'marathoner').unlocked).toBe(true);
  });

  it('sprinter: ukonczone in ≤10h, not ≤0h', () => {
    const fast = [completedGame(5, { hours: 8 })];
    expect(findById(computeAchievements(fast, 0), 'sprinter').unlocked).toBe(true);
    const zero = [completedGame(5, { hours: 0 })]; // 0 doesn't qualify (must be >0)
    expect(findById(computeAchievements(zero, 0), 'sprinter').unlocked).toBe(false);
    const long = [completedGame(5, { hours: 50 })];
    expect(findById(computeAchievements(long, 0), 'sprinter').unlocked).toBe(false);
  });

  it('critic: counts only games with rating > 0', () => {
    const games = [
      ...Array.from({ length: 12 }, (_, i) => makeGame({ rating: i + 1 })), // ratings 1..12
      makeGame({ rating: 0 }),    // 0 doesn't count
      makeGame({ rating: null }), // null doesn't count
    ];
    const result = computeAchievements(games, 0);
    expect(findById(result, 'critic_1').unlocked).toBe(true); // ≥10
    expect(findById(result, 'critic_1').progress).toBe(12);
  });

  it('streak achievements use the longestStreak parameter (not games[])', () => {
    // Streaks are computed externally (sessions logic) and passed in.
    expect(findById(computeAchievements([], 7), 'streak_7').unlocked).toBe(true);
    expect(findById(computeAchievements([], 6), 'streak_7').unlocked).toBe(false);
    expect(findById(computeAchievements([], 30), 'streak_30').unlocked).toBe(true);
    expect(findById(computeAchievements([], 29), 'streak_30').unlocked).toBe(false);
  });

  it('genre_hopper: 5+ unique non-empty genres', () => {
    const fiveGenres = ['Action', 'RPG', 'Sport', 'Platformer', 'Horror'].map(g =>
      makeGame({ genre: g })
    );
    expect(findById(computeAchievements(fiveGenres, 0), 'genre_hopper').unlocked).toBe(true);

    // Same genre 5x → only 1 unique
    const oneGenre = Array.from({ length: 5 }, () => makeGame({ genre: 'Action' }));
    expect(findById(computeAchievements(oneGenre, 0), 'genre_hopper').unlocked).toBe(false);
    expect(findById(computeAchievements(oneGenre, 0), 'genre_hopper').progress).toBe(1);

    // Empty/null genres ignored
    const fourGoodOneEmpty = [
      makeGame({ genre: 'Action' }), makeGame({ genre: 'RPG' }),
      makeGame({ genre: 'Sport' }), makeGame({ genre: 'Horror' }),
      makeGame({ genre: '' }), makeGame({ genre: null }),
    ];
    expect(findById(computeAchievements(fourGoodOneEmpty, 0), 'genre_hopper').progress).toBe(4);
  });

  it('reseller: 5 games sold (priceSold > 0)', () => {
    const sold = Array.from({ length: 5 }, () => makeGame({ priceSold: 100 }));
    expect(findById(computeAchievements(sold, 0), 'reseller').unlocked).toBe(true);
    // priceSold null/0 doesn't count
    const notSold = Array.from({ length: 10 }, () => makeGame({ priceSold: 0 }));
    expect(findById(computeAchievements(notSold, 0), 'reseller').progress).toBe(0);
  });

  it('rare flag survives in computed result', () => {
    const result = computeAchievements([], 0);
    expect(findById(result, 'collector_4').rare).toBe(true);
    expect(findById(result, 'collector_5').rare).toBe(true);
    expect(findById(result, 'finisher_3').rare).toBe(true);
    expect(findById(result, 'trophy_3').rare).toBe(true);
    expect(findById(result, 'streak_30').rare).toBe(true);
    // Non-rare
    expect(findById(result, 'collector_1').rare).toBeUndefined();
    expect(findById(result, 'sprinter').rare).toBeUndefined();
  });

  it('pct caps at 100 even when progress > threshold', () => {
    const games = Array.from({ length: 200 }, () => makeGame());
    const result = computeAchievements(games, 0);
    expect(findById(result, 'collector_1').pct).toBe(100); // 200/1 capped
    expect(findById(result, 'collector_5').pct).toBe(100); // 200/100 capped
  });

  it('Math.floor on progress prevents fractional displays', () => {
    // Marathoner uses Math.max which can produce fractional values — verify floor.
    const games = [makeGame({ hours: 99.7 })];
    const result = computeAchievements(games, 0);
    expect(findById(result, 'marathoner').progress).toBe(99); // floor of 99.7
  });
});
