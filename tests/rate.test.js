import { describe, it, expect, afterEach, vi } from 'vitest';
import { shouldAskRating, PLAY_REVIEW_URL } from '../src/lib/rate.js';

const NOW = Date.parse('2026-10-20T12:00:00Z');
const daysAgo = d => new Date(NOW - d * 864e5).toISOString();
const lib = (n, addedDaysAgo = 10) => Array.from({ length: n }, (_, i) => ({ id: 'g' + i, title: 'G' + i, addedAt: daysAgo(addedDaysAgo) }));

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

describe('rating prompt (v1.20.0)', () => {
  it('asks a settled user with a real collection', () => {
    expect(shouldAskRating({}, lib(5), NOW)).toBe(true);
  });

  it('waits for 5 real games and 3 days of use', () => {
    expect(shouldAskRating({}, lib(4), NOW)).toBe(false);
    expect(shouldAskRating({}, lib(8, 1), NOW)).toBe(false);
    const demosOnly = lib(8).map(g => ({ ...g, _demo: true }));
    expect(shouldAskRating({}, demosOnly, NOW)).toBe(false);
  });

  it('respects the 60 day pause, the 3 ask limit and both opt-outs', () => {
    expect(shouldAskRating({ askedAt: daysAgo(30), asks: 1 }, lib(9), NOW)).toBe(false);
    expect(shouldAskRating({ askedAt: daysAgo(61), asks: 1 }, lib(9), NOW)).toBe(true);
    expect(shouldAskRating({ askedAt: daysAgo(200), asks: 3 }, lib(9), NOW)).toBe(false);
    expect(shouldAskRating({ rated: true }, lib(9), NOW)).toBe(false);
    expect(shouldAskRating({ never: true }, lib(9), NOW)).toBe(false);
  });

  it('counts asks in storage', async () => {
    const m = new Map();
    vi.stubGlobal('localStorage', { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) });
    const mod = await import('../src/lib/rate.js');
    mod.markAsked(NOW);
    const s = mod.markAsked(NOW + 1000);
    expect(s.asks).toBe(2);
    expect(mod.readRate().askedAt).toBe(new Date(NOW + 1000).toISOString());
  });

  it('opens the Play Store app with a web fallback', () => {
    expect(PLAY_REVIEW_URL.startsWith('intent://details?id=com.skudev.ps5vault#Intent;scheme=market;')).toBe(true);
    expect(decodeURIComponent(PLAY_REVIEW_URL)).toContain('https://play.google.com/store/apps/details?id=com.skudev.ps5vault');
  });
});
