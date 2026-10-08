import { describe, it, expect, afterEach, vi } from 'vitest';

function memoryStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}
async function load(init) {
  vi.resetModules();
  vi.stubGlobal('localStorage', memoryStorage(init));
  return import('../src/lib/wishlist.js');
}
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

const rawgHit = { id: 3498, title: 'Grand Theft Auto V', cover: 'https://media.rawg.io/x.jpg', releaseDate: '2013-09-17', genre: 'Action' };

describe('wishlist (v1.20.2)', () => {
  it('stores clean items and drops junk', async () => {
    const w = await load({ ps5vault_wishlist: JSON.stringify([{ title: 'Hades', targetPrice: '49.99' }, { title: '' }, null, 'x', { id: 'k', title: 'Celeste', lastPrice: 'abc' }]) });
    const list = w.wishRead();
    expect(list.map(x => x.title)).toEqual(['Hades', 'Celeste']);
    expect(list[0].targetPrice).toBe(49.99);
    expect(list[1].lastPrice).toBe(null);
  });

  it('says when the price hits the target and sorts those first', async () => {
    const w = await load();
    const a = { ...w.newWish(rawgHit, '2026-10-01T00:00:00Z'), targetPrice: 60, lastPrice: 79 };
    const b = { ...w.newWish({ id: 1, title: 'Hades' }, '2026-09-01T00:00:00Z'), targetPrice: 50, lastPrice: 49.99 };
    expect(w.targetHit(a)).toBe(false);
    expect(w.targetHit(b)).toBe(true);
    expect(w.targetHit({ targetPrice: 50, lastPrice: null })).toBe(false);
    expect(w.sortWishes([a, b]).map(x => x.title)).toEqual(['Hades', 'Grand Theft Auto V']);
  });

  it('turns a bought wish into a collection game at the last seen price', async () => {
    const w = await load();
    const g = w.wishToGame({ ...w.newWish(rawgHit), targetPrice: 60, lastPrice: 59.5 }, '2026-10-08T10:00:00.000Z');
    expect(g).toMatchObject({ title: 'Grand Theft Auto V', rawgId: 3498, priceBought: '59.5', status: 'planuje', year: 2013, source: 'owned', addedAt: '2026-10-08T10:00:00.000Z' });
    expect(g.abbr).toBeTruthy();
    expect(w.wishToGame({ ...w.newWish(rawgHit), targetPrice: 60 }).priceBought).toBe('60');
  });

  it('merges a backup without duplicates', async () => {
    const w = await load();
    const cur = [w.newWish(rawgHit)];
    const merged = w.mergeWishlists(cur, [{ title: 'grand theft auto v', rawgId: 3498 }, { title: 'Astro Bot' }]);
    expect(merged.map(x => x.title)).toEqual(['Grand Theft Auto V', 'Astro Bot']);
  });

  it('links to the PS Store search in the user region', async () => {
    const w = await load();
    expect(w.psStoreSearchUrl('Marvel\'s Spider-Man 2')).toBe("https://store.playstation.com/search/Marvel's%20Spider-Man%202");
  });
});
