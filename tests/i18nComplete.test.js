import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

async function load() {
  const m = new Map();
  vi.stubGlobal('localStorage', { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) });
  const i18n = await import('../src/i18n.js');
  const c = await import('../src/constants.js');
  return { T: i18n.TRANSLATION_TABLE, READY: c.READY_LANGS, LANGS: c.LANGS };
}
const ph = s => [...String(s).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');

describe('translations (v1.21.1)', () => {
  it('every app language has exactly the English keys', async () => {
    const { T, READY } = await load();
    const en = Object.keys(T.en).sort();
    for (const l of READY) expect(Object.keys(T[l] || {}).sort(), l).toEqual(en);
  });

  it('keeps every {placeholder} and has no long dashes', async () => {
    const { T, READY } = await load();
    const bad = [];
    for (const l of READY) for (const [k, v] of Object.entries(T[l])) {
      if (ph(v) !== ph(T.en[k])) bad.push(`${l}.${k}`);
      if (/[–—]/.test(v)) bad.push(`${l}.${k} dash`);
    }
    expect(bad).toEqual([]);
  });

  it('the picker offers every ready language', async () => {
    const { READY, LANGS } = await load();
    for (const l of READY) expect(LANGS.some(x => x.code === l), l).toBe(true);
  });
});
