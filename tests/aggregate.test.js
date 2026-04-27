// Tests for aggregate() — combines per-seed RAWG suggestions into ranked recommendations.
//
// Score formula: 10 × (#seeds recommending) + RAWG aggregate rating.
// Tiebreak: playtime desc.
// Dedupe: by normalized title vs alreadyOwnedNorms set + cross-seed (same game from
// multiple seeds → single entry with combined reasons + boosted score).
import { describe, it, expect } from 'vitest';
import { aggregate, normalizeTitle } from '../src/lib/recommend.js';

// Minimal seed shape for tests — { title, rating } + nothing else needed.
const seedA = { title: 'Elden Ring', rating: 10 };
const seedB = { title: 'GTA V',      rating: 9 };

// Minimal RAWG result shape — { id, title, rawgRating, playtime, ... }
function rawgResult(overrides = {}) {
  return { id: Math.floor(Math.random() * 1e6), title: 'Some Game', rawgRating: 4.0, playtime: 30, cover: '', genre: 'Action', ...overrides };
}

describe('aggregate', () => {
  it('returns empty array for empty input', () => {
    expect(aggregate([], new Set())).toEqual([]);
  });

  it('returns empty when all results filtered by ownership set', () => {
    const out = aggregate(
      [{ seed: seedA, results: [rawgResult({ title: 'Owned 1' }), rawgResult({ title: 'Owned 2' })] }],
      new Set([normalizeTitle('Owned 1'), normalizeTitle('Owned 2')])
    );
    expect(out).toEqual([]);
  });

  it('single seed: scores = 10 + rawgRating, preserves all fields', () => {
    const game = rawgResult({ id: 100, title: 'Bloodborne', rawgRating: 4.5, playtime: 45 });
    const [out] = aggregate([{ seed: seedA, results: [game] }], new Set());
    expect(out.score).toBeCloseTo(14.5, 5);
    expect(out.id).toBe(100);
    expect(out.title).toBe('Bloodborne');
    expect(out.reasons).toEqual([{ title: 'Elden Ring', rating: 10 }]);
  });

  it('multi-seed dedupe: same title from 2 seeds gets single entry, score boosted, reasons merged', () => {
    const dark = rawgResult({ id: 200, title: 'Dark Souls III', rawgRating: 4.5, playtime: 50 });
    const out = aggregate(
      [
        { seed: seedA, results: [dark] },
        { seed: seedB, results: [dark] },
      ],
      new Set()
    );
    expect(out).toHaveLength(1);
    expect(out[0].score).toBeCloseTo(24.5, 5); // 10 + 4.5 (first) + 10 (second seed boost) = 24.5
    expect(out[0].reasons).toEqual([
      { title: 'Elden Ring', rating: 10 },
      { title: 'GTA V', rating: 9 },
    ]);
  });

  it('sort: higher score first', () => {
    const a = rawgResult({ title: 'A', rawgRating: 3.0 });
    const b = rawgResult({ title: 'B', rawgRating: 4.5 });
    const out = aggregate([{ seed: seedA, results: [a, b] }], new Set());
    expect(out.map(r => r.title)).toEqual(['B', 'A']);
  });

  it('multi-seed wins over higher-rated single-seed', () => {
    const lonelyHigh = rawgResult({ title: 'Solo Hit', rawgRating: 4.9 });
    const popular = rawgResult({ title: 'Multi-rec', rawgRating: 3.5 });
    const out = aggregate(
      [
        { seed: seedA, results: [popular, lonelyHigh] },
        { seed: seedB, results: [popular] },
      ],
      new Set()
    );
    // Multi-rec: 10 + 3.5 + 10 = 23.5; Solo Hit: 10 + 4.9 = 14.9
    expect(out.map(r => r.title)).toEqual(['Multi-rec', 'Solo Hit']);
  });

  it('tiebreak: equal score → longer playtime first', () => {
    // Both single-seed with rawgRating 4.0 → score 14.0 → tie → playtime decides
    const short = rawgResult({ title: 'Short', rawgRating: 4.0, playtime: 20 });
    const long = rawgResult({ title: 'Long', rawgRating: 4.0, playtime: 80 });
    const out = aggregate([{ seed: seedA, results: [short, long] }], new Set());
    expect(out.map(r => r.title)).toEqual(['Long', 'Short']);
  });

  it('skips games with empty/missing title', () => {
    const out = aggregate(
      [{ seed: seedA, results: [
        rawgResult({ title: '' }),
        rawgResult({ title: 'Real' }),
      ]}],
      new Set()
    );
    expect(out).toHaveLength(1);
    expect(out[0].title).toBe('Real');
  });

  it('treats missing rawgRating as 0 in score', () => {
    const game = rawgResult({ title: 'No rating', rawgRating: undefined });
    const [out] = aggregate([{ seed: seedA, results: [game] }], new Set());
    expect(out.score).toBe(10);
  });

  it('ownership filter uses normalizeTitle (handles punctuation/case differences)', () => {
    const out = aggregate(
      [{ seed: seedA, results: [rawgResult({ title: "Marvel's Spider-Man" })] }],
      new Set([normalizeTitle('marvels spider man')])
    );
    expect(out).toEqual([]);
  });
});

describe('normalizeTitle', () => {
  it('strips punctuation and lowercases', () => {
    expect(normalizeTitle("Marvel's Spider-Man 2")).toBe('marvelsspiderman2');
  });
  it('preserves Unicode letters (Polish, accented chars)', () => {
    expect(normalizeTitle('Wiedźmin 3: Dziki Gon')).toBe('wiedźmin3dzikigon');
    expect(normalizeTitle('Pokémon Red')).toBe('pokémonred');
  });
  it('handles empty/null input', () => {
    expect(normalizeTitle('')).toBe('');
    expect(normalizeTitle(null)).toBe('');
    expect(normalizeTitle(undefined)).toBe('');
  });
  it('trims whitespace', () => {
    expect(normalizeTitle('  GTA V  ')).toBe('gtav');
  });
});
