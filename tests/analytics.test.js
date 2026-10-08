import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Minimal Web Storage stand-in for the node test environment.
function memoryStorage() {
  const m = new Map();
  return {
    getItem: k => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: k => m.delete(k),
    clear: () => m.clear(),
  };
}

function stubBrowser({ hostname = 'matiseekk-dot.github.io', referrer = '' } = {}) {
  vi.stubGlobal('localStorage', memoryStorage());
  vi.stubGlobal('sessionStorage', memoryStorage());
  vi.stubGlobal('location', { hostname });
  vi.stubGlobal('document', { referrer, head: { appendChild: () => {} }, createElement: () => ({ dataset: {} }) });
  vi.stubGlobal('matchMedia', () => ({ matches: false }));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.doUnmock('../src/constants.js');
});

describe('analytics, switched off (no website ID)', () => {
  beforeEach(() => stubBrowser());

  it('never calls umami, even on the production host', async () => {
    const umami = { track: vi.fn() };
    vi.stubGlobal('window', { umami });
    const { track, trackOnce } = await import('../src/lib/analytics.js');
    track('import_done', { source: 'steam' });
    trackOnce('first_open');
    expect(umami.track).not.toHaveBeenCalled();
  });

  it('still records one-time events, so turning it on later does not replay them', async () => {
    vi.stubGlobal('window', {});
    const { trackOnce } = await import('../src/lib/analytics.js');
    expect(trackOnce('first_open')).toBe(true);
    expect(trackOnce('first_open')).toBe(false);
    expect(JSON.parse(localStorage.getItem('ps5vault_evt_once'))).toEqual(['first_open']);
  });
});

describe('analytics, switched on', () => {
  async function load(opts) {
    stubBrowser(opts);
    vi.doMock('../src/constants.js', () => ({ UMAMI_WEBSITE_ID: 'test-site-id' }));
    const umami = { track: vi.fn() };
    vi.stubGlobal('window', { umami });
    const mod = await import('../src/lib/analytics.js');
    return { ...mod, umami };
  }

  it('sends events with the platform attached', async () => {
    const { track, umami } = await load();
    track('import_done', { source: 'playnite', size: '200+' });
    expect(umami.track).toHaveBeenCalledWith('import_done', { platform: 'web', source: 'playnite', size: '200+' });
  });

  it('tags launches from the Play app as platform "play"', async () => {
    const { track, umami } = await load({ referrer: 'android-app://com.skudev.ps5vault' });
    track('first_open');
    expect(umami.track).toHaveBeenCalledWith('first_open', { platform: 'play' });
  });

  it('stays silent off the production host (dev, preview, localhost)', async () => {
    const { track, umami } = await load({ hostname: 'localhost' });
    track('first_open');
    expect(umami.track).not.toHaveBeenCalled();
  });

  it('fires a one-time event only once', async () => {
    const { trackOnce, umami } = await load();
    trackOnce('finance_opened');
    trackOnce('finance_opened');
    expect(umami.track).toHaveBeenCalledTimes(1);
  });

  it('never throws when the tracker itself throws', async () => {
    const { track, umami } = await load();
    umami.track.mockImplementation(() => { throw new Error('blocked'); });
    expect(() => track('first_open')).not.toThrow();
  });
});

describe('countBucket', () => {
  it('buckets import sizes coarsely', async () => {
    const { countBucket } = await import('../src/lib/analytics.js');
    expect([1, 9, 10, 49, 50, 199, 200, 712].map(countBucket))
      .toEqual(['1-9', '1-9', '10-49', '10-49', '50-199', '50-199', '200+', '200+']);
  });
});
