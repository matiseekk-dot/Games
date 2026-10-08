import { describe, it, expect } from 'vitest';
import { applyStatus, setStatusMany, revertMany, removeGames, restoreGames } from '../src/lib/bulk.js';

const NOW = '2026-10-08T12:00:00.000Z';
const lib = () => [
  { id: 'a', title: 'Hades', status: 'planuje' },
  { id: 'b', title: 'Celeste', status: 'gram', lastPlayed: '2026-01-01T00:00:00.000Z' },
  { id: 'c', title: 'Astro Bot', status: 'ukonczone', completedAt: '2025-12-24T10:00:00.000Z' },
  { id: 'd', title: 'Elden Ring', status: 'porzucone' },
];

describe('bulk edit helpers', () => {
  it('stamps completedAt once and lastPlayed on moving into playing/completed', () => {
    const done = applyStatus(lib()[0], 'ukonczone', {}, NOW);
    expect(done).toMatchObject({ status: 'ukonczone', completedAt: NOW, lastPlayed: NOW });
    const again = applyStatus(lib()[2], 'ukonczone', {}, NOW);
    expect(again.completedAt).toBe('2025-12-24T10:00:00.000Z');
    expect(again.lastPlayed).toBeUndefined();
    expect(applyStatus(lib()[1], 'porzucone', {}, NOW).lastPlayed).toBe('2026-01-01T00:00:00.000Z');
  });

  it('changes only selected games that need it and can be reverted', () => {
    const games = lib();
    const { next, before } = setStatusMany(games, new Set(['a', 'c', 'd']), 'ukonczone', NOW);
    expect(next.map(g => g.status)).toEqual(['ukonczone', 'gram', 'ukonczone', 'ukonczone']);
    expect(next[2]).toBe(games[2]); // already completed: untouched, same object
    expect([...before.keys()]).toEqual(['a', 'd']);
    expect(revertMany(next, before)).toEqual(games);
  });

  it('removes games and puts them back in their old places', () => {
    const games = lib();
    const { kept, removed } = removeGames(games, ['b', 'd']);
    expect(kept.map(g => g.id)).toEqual(['a', 'c']);
    expect(restoreGames(kept, removed).map(g => g.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('restore keeps games added in the meantime and never duplicates', () => {
    const { kept, removed } = removeGames(lib(), ['a']);
    const later = [...kept, { id: 'e', title: 'New', status: 'planuje' }];
    expect(restoreGames(later, removed).map(g => g.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
    expect(restoreGames(restoreGames(later, removed), removed).length).toBe(5);
  });
});
