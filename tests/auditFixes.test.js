import { describe, it, expect, afterEach, vi } from 'vitest';
import { parseNum, parseDay, daysUntil, coverThumb } from '../src/lib/util.js';

describe('parseNum (v1.18.1: Polish/Spanish decimal comma)', () => {
  it('reads comma and dot decimals, spaces as thousands separators', () => {
    expect(parseNum('89,99')).toBe(89.99);
    expect(parseNum('89.99')).toBe(89.99);
    expect(parseNum('12,5')).toBe(12.5);
    expect(parseNum('1 299,99')).toBe(1299.99);
    expect(parseNum('1 299,99')).toBe(1299.99);
    expect(parseNum(42)).toBe(42);
  });
  it('returns null for empty or junk input instead of NaN', () => {
    for (const v of ['', '   ', null, undefined, 'abc', NaN, '1,2,3']) expect(parseNum(v)).toBe(null);
  });
});

describe('parseDay / daysUntil (v1.18.1: local calendar days)', () => {
  it('reads YYYY-MM-DD as local midnight, not UTC', () => {
    const d = parseDay('2026-10-08');
    expect([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours()]).toEqual([2026, 9, 8, 0]);
  });
  it('treats a release dated today as 0 days away', () => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(daysUntil(today)).toBe(0);
  });
  it('still accepts full timestamps', () => {
    expect(parseDay('2026-10-08T15:30:00Z').getTime()).toBe(Date.parse('2026-10-08T15:30:00Z'));
  });
});

describe('coverThumb', () => {
  it('rewrites RAWG game and screenshot covers to the resized variant', () => {
    expect(coverThumb('https://media.rawg.io/media/games/b29/x.jpg')).toBe('https://media.rawg.io/media/resize/420/-/games/b29/x.jpg');
    expect(coverThumb('https://media.rawg.io/media/screenshots/928/y.jpg', 640)).toBe('https://media.rawg.io/media/resize/640/-/screenshots/928/y.jpg');
  });
  it('leaves other URLs and empty values alone', () => {
    expect(coverThumb('https://example.com/a.jpg')).toBe('https://example.com/a.jpg');
    expect(coverThumb('https://media.rawg.io/media/resize/420/-/games/b29/x.jpg')).toBe('https://media.rawg.io/media/resize/420/-/games/b29/x.jpg');
    expect(coverThumb('')).toBe('');
    expect(coverThumb(null)).toBe(null);
  });
});

describe('lsRead migrations (v1.18.1)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

  function stubStorage(initial) {
    const m = new Map(Object.entries(initial));
    vi.stubGlobal('localStorage', { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) });
    return m;
  }

  it('recovers prices that were stored with a decimal comma', async () => {
    const m = stubStorage({ ps5vault_v1: JSON.stringify([{ id: 'a', title: 'X', priceBought: '89,99', priceSold: '1 200,50', extraSpend: '10', source: 'owned', preOrdered: false }]) });
    const { lsRead } = await import('../src/lib/storage.js');
    const [g] = lsRead();
    expect(g.priceBought).toBe('89.99');
    expect(g.priceSold).toBe('1200.5');
    expect(g.extraSpend).toBe('10');
    expect(JSON.parse(m.get('ps5vault_v1'))[0].priceBought).toBe('89.99'); // persisted
  });

  it('keeps a copy of an unreadable collection before starting empty', async () => {
    const m = stubStorage({ ps5vault_v1: '{not json' });
    const { lsRead } = await import('../src/lib/storage.js');
    expect(lsRead()).toEqual([]);
    expect(m.get('ps5vault_v1_unreadable')).toBe('{not json');
  });
});
