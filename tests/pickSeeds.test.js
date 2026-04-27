// Tests for pickSeeds() — selects which user games become Recommendations seeds.
// Two tracks: top-rated (rating ≥ 8, sorted desc) and recently completed (status==='ukonczone',
// sorted by completedAt desc, fallback chain to lastPlayed/addedAt).
//
// Critical invariant: ONLY games with rawgId can be seeds. Pre-v1.9 games or manually
// added titles without rawgId are silently skipped — UI shows bootstrap empty state.
import { describe, it, expect } from 'vitest';
import { pickSeeds } from '../src/lib/recommend.js';
import { makeGame, completedGame, daysAgoISO } from './fixtures.js';

describe('pickSeeds', () => {
  it('returns empty tracks for empty games array', () => {
    const seeds = pickSeeds([]);
    expect(seeds.topRated).toEqual([]);
    expect(seeds.recentlyCompleted).toEqual([]);
  });

  it('returns empty tracks for null/undefined input', () => {
    expect(pickSeeds(null).topRated).toEqual([]);
    expect(pickSeeds(undefined).recentlyCompleted).toEqual([]);
  });

  it('skips games without rawgId entirely', () => {
    const games = [
      makeGame({ title: 'No RAWG', rating: 10, status: 'ukonczone', completedAt: daysAgoISO(5) }),
      makeGame({ title: 'Also no', rating: 9, status: 'ukonczone', completedAt: daysAgoISO(3) }),
    ];
    const { topRated, recentlyCompleted } = pickSeeds(games);
    expect(topRated).toEqual([]);
    expect(recentlyCompleted).toEqual([]);
  });

  it('top-rated track filters to rating ≥ 8', () => {
    const games = [
      makeGame({ title: 'A', rating: 10, rawgId: 1 }),
      makeGame({ title: 'B', rating: 8, rawgId: 2 }),
      makeGame({ title: 'C', rating: 7, rawgId: 3 }), // below threshold
      makeGame({ title: 'D', rating: null, rawgId: 4 }), // unrated
    ];
    const { topRated } = pickSeeds(games);
    expect(topRated.map(g => g.title)).toEqual(['A', 'B']);
  });

  it('top-rated track sorts by rating descending', () => {
    const games = [
      makeGame({ title: 'A', rating: 8, rawgId: 1 }),
      makeGame({ title: 'B', rating: 10, rawgId: 2 }),
      makeGame({ title: 'C', rating: 9, rawgId: 3 }),
    ];
    const { topRated } = pickSeeds(games);
    expect(topRated.map(g => g.title)).toEqual(['B', 'C', 'A']);
  });

  it('top-rated track caps at 3 seeds', () => {
    const games = Array.from({ length: 8 }, (_, i) =>
      makeGame({ title: `G${i}`, rating: 10 - i % 3, rawgId: 100 + i }) // all ≥8
    );
    const { topRated } = pickSeeds(games);
    expect(topRated.length).toBe(3);
  });

  it('recently completed track sorts by completedAt desc', () => {
    const games = [
      completedGame(10, { title: 'Old', rawgId: 1 }),
      completedGame(2,  { title: 'Newest', rawgId: 2 }),
      completedGame(5,  { title: 'Middle', rawgId: 3 }),
    ];
    const { recentlyCompleted } = pickSeeds(games);
    expect(recentlyCompleted.map(g => g.title)).toEqual(['Newest', 'Middle', 'Old']);
  });

  it('recently completed track ignores non-ukonczone games', () => {
    const games = [
      completedGame(5, { title: 'Done', rawgId: 1 }),
      makeGame({ title: 'Playing', status: 'gram', rawgId: 2, lastPlayed: daysAgoISO(1) }),
      makeGame({ title: 'Backlog', status: 'planuje', rawgId: 3 }),
    ];
    const { recentlyCompleted } = pickSeeds(games);
    expect(recentlyCompleted.map(g => g.title)).toEqual(['Done']);
  });

  it('recently completed falls back to lastPlayed when completedAt missing (legacy data)', () => {
    // Pre-v1.7 games may have status='ukonczone' without completedAt set.
    const games = [
      makeGame({ title: 'Legacy', status: 'ukonczone', rawgId: 1, lastPlayed: daysAgoISO(2), completedAt: null }),
      completedGame(5, { title: 'Modern', rawgId: 2 }),
    ];
    const { recentlyCompleted } = pickSeeds(games);
    expect(recentlyCompleted[0].title).toBe('Legacy'); // newer lastPlayed wins
  });

  it('recently completed track caps at 3 seeds', () => {
    const games = Array.from({ length: 8 }, (_, i) =>
      completedGame(i + 1, { title: `G${i}`, rawgId: 100 + i })
    );
    const { recentlyCompleted } = pickSeeds(games);
    expect(recentlyCompleted.length).toBe(3);
    expect(recentlyCompleted[0].title).toBe('G0'); // most recent (1d ago)
  });

  it('a game can appear in BOTH tracks if it qualifies', () => {
    // High-rated AND recently completed → seeds both engines.
    const games = [
      completedGame(2, { title: 'Both', rating: 10, rawgId: 42 }),
    ];
    const { topRated, recentlyCompleted } = pickSeeds(games);
    expect(topRated).toHaveLength(1);
    expect(recentlyCompleted).toHaveLength(1);
    expect(topRated[0].rawgId).toBe(42);
    expect(recentlyCompleted[0].rawgId).toBe(42);
  });
});
