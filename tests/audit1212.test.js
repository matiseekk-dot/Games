// v1.21.2 - fixes from the full audit (October 2026)
import { describe, it, expect, afterEach, vi } from 'vitest';
import { parsePlaynitePaste } from '../src/lib/playnite-import.js';
import { parseNum } from '../src/lib/util.js';
import { computeLongestStreak, collectSessions } from '../src/lib/sessions.js';
import { ACHIEVEMENTS } from '../src/lib/achievements.js';
import { PLATFORMS, READY_LANGS } from '../src/constants.js';

function memoryStorage(init = {}) {
  const m = new Map(Object.entries(init));
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe('Playnite import', () => {
  const row = (status, platform) => parsePlaynitePaste(JSON.stringify([
    { Name: 'G', CompletionStatus: { Name: status }, Platforms: [{ Name: platform || 'PC' }] },
  ])).rows[0];

  it('maps "Not Played" to Planning, not Playing', () => {
    expect(row('Not Played').explicitStatus).toBe('planuje');
    expect(row('Played').explicitStatus).toBe('gram');
    expect(row('Playing').explicitStatus).toBe('gram');
  });
  it('uses platform names from PLATFORMS', () => {
    expect(row('Beaten', 'Nintendo Switch').platform).toBe('Nintendo Switch');
    expect(PLATFORMS).toContain(row('Beaten', 'Nintendo Switch').platform);
    expect(row('Beaten', 'Sony PlayStation 3').platform).toBe('Other');
    expect(row('Beaten', 'Sony PlayStation 5').platform).toBe('PS5');
  });
});

describe('parseNum with thousands separators', () => {
  it('reads European and English grouping', () => {
    expect(parseNum('1.299,99')).toBe(1299.99);
    expect(parseNum('1,299.99')).toBe(1299.99);
    expect(parseNum("1'299.99")).toBe(1299.99);
    expect(parseNum('2,000')).toBe(2000);
    expect(parseNum('59,99')).toBe(59.99);
    expect(parseNum('0,999')).toBe(0.999);
  });
});

describe('play streaks and sessions', () => {
  it('counts consecutive local days (was always 1 west of UTC)', () => {
    const days = new Map([['2026-10-05', [1]], ['2026-10-06', [1]], ['2026-10-07', [1]], ['2026-10-09', [1]]]);
    expect(computeLongestStreak(days)).toBe(3);
  });
  it('sorts sessions newest first', () => {
    const list = collectSessions([{ id: 'a', sessions: [
      { startedAt: '2026-10-01T10:00:00Z', hours: 1 }, { startedAt: '2026-10-05T10:00:00Z', hours: 1 },
    ] }]);
    expect(list[0].startedAt).toBe('2026-10-05T10:00:00Z');
  });
});

describe('achievements', () => {
  it('have a title and description in every app language', () => {
    for (const a of ACHIEVEMENTS) for (const l of READY_LANGS) {
      expect(a.title[l], `${a.id} title ${l}`).toBeTruthy();
      expect(a.desc[l], `${a.id} desc ${l}`).toBeTruthy();
    }
  });
});

describe('stored data clean-up', () => {
  it('drops broken entries instead of the whole collection, stores numbers and known platforms', async () => {
    vi.stubGlobal('localStorage', memoryStorage({ ps5vault_v1: JSON.stringify([
      null,
      { id: 'a', title: 'A', hours: '12,5', rating: '8', targetHours: '', platform: 'Switch' },
    ]) }));
    const { lsRead } = await import('../src/lib/storage.js');
    const [g, ...rest] = lsRead();
    expect(rest).toEqual([]);
    expect([g.hours, g.rating, g.targetHours, g.platform]).toEqual([12.5, 8, 0, 'Nintendo Switch']);
  });
});

describe('money format', () => {
  it('puts the euro sign after the amount except in English', async () => {
    vi.stubGlobal('localStorage', memoryStorage({ ps5vault_currency: 'EUR' }));
    const { pln, plnExact } = await import('../src/lib/format.js');
    expect(pln(328, 'de')).toBe('328 €');
    expect(plnExact(4.99, 'fr')).toBe('4,99 €');
    expect(pln(328, 'en')).toBe('€328');
  });
  it('keeps złoty and dollar as before', async () => {
    vi.stubGlobal('localStorage', memoryStorage({ ps5vault_currency: 'PLN' }));
    expect((await import('../src/lib/format.js')).pln(1311, 'pl')).toBe('1311 zł');
    vi.resetModules();
    vi.stubGlobal('localStorage', memoryStorage({ ps5vault_currency: 'USD' }));
    expect((await import('../src/lib/format.js')).pln(355, 'en')).toBe('$355');
  });
});

describe('t() placeholders', () => {
  it('replaces every occurrence and the new keys exist in all languages', async () => {
    vi.stubGlobal('localStorage', memoryStorage());
    const { t } = await import('../src/i18n.js');
    for (const l of READY_LANGS) {
      expect(t(l, 'budgetOverToast', { spent: 'X', budget: 'Y' })).toMatch(/X.*Y/);
      expect(t(l, 'expHoursDesc', { title: 'G', cph: '1', limit: '2' })).not.toContain('{limit}');
      expect(t(l, 'rawgOffline')).not.toBe('rawgOffline');
    }
  });
});
