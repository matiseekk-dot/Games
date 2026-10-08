import { describe, it, expect, afterEach, vi } from 'vitest';

function memoryStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe('PS Plus is a source, not a status (v1.19.4)', () => {
  it('migrates stored games to Planning + source PS Plus, keeping other subscriptions', async () => {
    vi.stubGlobal('localStorage', memoryStorage({ ps5vault_v1: JSON.stringify([
      { id: 'a', title: 'Stray', status: 'psplus' },
      { id: 'b', title: 'Returnal', status: 'psplus', source: 'owned' },
      { id: 'c', title: 'Hi-Fi Rush', status: 'psplus', source: 'gamepass' },
      { id: 'd', title: 'Hades', status: 'gram', source: 'owned' },
    ]) }));
    const { lsRead } = await import('../src/lib/storage.js');
    const out = lsRead().map(g => [g.id, g.status, g.source]);
    expect(out).toEqual([['a', 'planuje', 'psplus'], ['b', 'planuje', 'psplus'], ['c', 'planuje', 'gamepass'], ['d', 'gram', 'owned']]);
    expect(JSON.parse(localStorage.getItem('ps5vault_v1'))[0].status).toBe('planuje'); // written back
  });

  it('is no longer offered as a status', async () => {
    vi.stubGlobal('localStorage', memoryStorage());
    const { getSM } = await import('../src/i18n.js');
    expect(Object.keys(getSM('pl'))).toEqual(['gram', 'ukonczone', 'planuje', 'porzucone']);
  });
});

describe('plnExact keeps the cents of a single price (v1.19.4)', () => {
  it('shows cents with the local decimal mark and keeps whole amounts short', async () => {
    vi.stubGlobal('localStorage', memoryStorage({ ps5vault_currency: 'PLN' }));
    const { plnExact, pln } = await import('../src/lib/format.js');
    expect(plnExact(59.99, 'pl')).toBe('59,99 zł');
    expect(plnExact(60, 'pl')).toBe('60 zł');
    expect(plnExact('249.5', 'es')).toBe('249,50 zł');
    expect(plnExact(-10.01, 'pl')).toBe('-10,01 zł');
    expect(pln(59.99, 'pl')).toBe('60 zł'); // totals stay rounded
  });
  it('uses a dot in English', async () => {
    vi.stubGlobal('localStorage', memoryStorage({ ps5vault_currency: 'USD' }));
    const { plnExact } = await import('../src/lib/format.js');
    expect(plnExact(19.99, 'en')).toBe('$19.99');
  });
});

describe('pluralForm (v1.19.4: "2 gry · 1 aktywna · 0 premier")', () => {
  it('follows Polish one/few/many and EN/ES one/other', async () => {
    vi.stubGlobal('localStorage', memoryStorage());
    const { pluralForm } = await import('../src/lib/format.js');
    const pl = 'premiera|premiery|premier';
    expect([0, 1, 2, 4, 5, 12, 22, 25, 101].map(n => pluralForm(n, 'pl', pl))).toEqual(['premier', 'premiera', 'premiery', 'premiery', 'premier', 'premier', 'premiery', 'premier', 'premier']);
    expect([0, 1, 2].map(n => pluralForm(n, 'en', 'release|releases'))).toEqual(['releases', 'release', 'releases']);
    expect(pluralForm(1, 'es', 'activo|activos')).toBe('activo');
  });
});
