import { describe, it, expect, vi, afterEach } from 'vitest';

const hit = name => ({ results: [{ id: 1, name, released: '2020-09-17', genres: [{ slug: 'action', name: 'Action' }], background_image: 'https://media.rawg.io/x.jpg', playtime: 20 }] });

// Minimal Cache Storage stand-in shared across module reloads (a real app restart).
function fakeCaches() {
  const stores = new Map();
  return {
    stores,
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const m = stores.get(name);
      return {
        match: async k => (m.has(k) ? new Response(m.get(k)) : undefined),
        put: async (k, res) => { m.set(String(k), await res.text()); },
        keys: async () => [...m.keys()],
        delete: async k => m.delete(String(k)),
      };
    },
  };
}

async function load({ fetchImpl, caches } = {}) {
  vi.resetModules();
  const f = vi.fn(fetchImpl || (async url => new Response(JSON.stringify(hit(decodeURIComponent(String(url).match(/search=([^&]+)/)[1]))))));
  vi.stubGlobal('fetch', f);
  if (caches) vi.stubGlobal('caches', caches);
  const mod = await import('../src/lib/rawg.js');
  mod._resetRawgCacheForTests();
  return { mod, f };
}

afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe('RAWG search cache', () => {
  it('reuses results for the same search, ignoring case and spaces', async () => {
    const { mod, f } = await load();
    const a = await mod.rawgSearch('Hades');
    const b = await mod.rawgSearch('  hades ');
    expect(a[0].title).toBe('hades');
    expect(b).toBe(a);
    expect(f).toHaveBeenCalledTimes(1);
    await mod.rawgSearch('Celeste');
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('shares one request between identical searches in flight', async () => {
    const { mod, f } = await load();
    const [a, b, c] = await Promise.all([mod.rawgSearch('Elden Ring'), mod.rawgSearch('elden ring'), mod.rawgSearch('ELDEN  RING')]);
    expect(f).toHaveBeenCalledTimes(1);
    expect(a).toBe(b);
    expect(b).toBe(c);
  });

  it('never caches a failed request', async () => {
    let n = 0;
    const { mod, f } = await load({ fetchImpl: async () => (++n === 1 ? new Response('busy', { status: 503 }) : new Response(JSON.stringify(hit('Hades')))) });
    expect(await mod.rawgSearch('Hades')).toEqual([]);
    expect((await mod.rawgSearch('Hades')).length).toBe(1);
    expect(f).toHaveBeenCalledTimes(2);
  });

  it('keeps "no match" for a day and real results for two weeks', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-08T12:00:00Z'));
    const { mod, f } = await load({ fetchImpl: async url => new Response(JSON.stringify(String(url).includes('zzzz') ? { results: [] } : hit('Hades'))) });
    await mod.rawgSearch('zzzz'); await mod.rawgSearch('Hades');
    vi.setSystemTime(new Date('2026-10-09T13:00:00Z'));
    await mod.rawgSearch('zzzz'); await mod.rawgSearch('Hades');
    expect(f).toHaveBeenCalledTimes(3); // only the empty one was asked again
    vi.setSystemTime(new Date('2026-10-23T13:00:00Z'));
    await mod.rawgSearch('Hades');
    expect(f).toHaveBeenCalledTimes(4);
  });

  it('survives an app restart through Cache Storage', async () => {
    const caches = fakeCaches();
    const first = await load({ caches });
    await first.mod.rawgSearch('Astro Bot');
    await new Promise(r => setTimeout(r, 0)); // let the background write finish
    const second = await load({ caches });
    const r = await second.mod.rawgSearch('astro bot');
    expect(r[0].title).toBe('astro bot');
    expect(second.f).not.toHaveBeenCalled();
    expect([...caches.stores.keys()]).toEqual(['ps5vault-rawg']);
  });
});
