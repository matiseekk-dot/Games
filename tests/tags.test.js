// v1.22.0 - own tags / lists
import { describe, it, expect } from 'vitest';
import { normTag, cleanTags, hasTag, allTags, addTagMany, MAX_TAGS } from '../src/lib/tags.js';

describe('tags', () => {
  it('normalizes and dedupes ignoring case', () => {
    expect(normTag('  co-op ,  ')).toBe('co-op');
    expect(cleanTags(['Co-op', 'co-op', '', ' z Olą ', null])).toEqual(['Co-op', 'z Olą']);
    expect(cleanTags(Array.from({ length: 20 }, (_, i) => 't' + i))).toHaveLength(MAX_TAGS);
    expect(cleanTags('x')).toEqual([]);
  });
  it('matches tags ignoring case and counts them', () => {
    const games = [{ tags: ['Co-op'] }, { tags: ['co-op', 'Couch'] }, {}];
    expect(hasTag(games[1], 'CO-OP')).toBe(true);
    expect(allTags(games)).toEqual([{ tag: 'Co-op', n: 2 }, { tag: 'Couch', n: 1 }]);
  });
  it('adds a tag to selected games with undo data', () => {
    const games = [{ id: 'a', tags: ['x'] }, { id: 'b' }, { id: 'c', tags: ['Co-op'] }];
    const { next, before } = addTagMany(games, new Set(['a', 'b', 'c']), 'co-op');
    expect(next.map(g => g.tags)).toEqual([['x', 'co-op'], ['co-op'], ['Co-op']]);
    expect([...before.keys()]).toEqual(['a', 'b']);
    expect(next[2]).toBe(games[2]);
  });
});

import { priceHistoryUrl, priceRegion } from '../src/lib/wishlist.js';
describe('wishlist price history link', () => {
  it('uses the store region of the app currency', () => {
    expect(priceRegion('PLN', 'pl')).toBe('pl');
    expect(priceRegion('EUR', 'fr')).toBe('fr');
    expect(priceRegion('EUR', 'en')).toBe('de');
    expect(priceRegion('BRL', 'pt')).toBe('br');
    expect(priceHistoryUrl(' Elden Ring ', 'USD', 'en')).toBe('https://psprices.com/region-us/search/?q=Elden%20Ring&platform=PS5');
  });
});
