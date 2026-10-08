import { describe, it, expect, afterEach, vi } from 'vitest';

function memoryStorage() {
  const m = new Map();
  return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k) };
}

// Fake Play Billing as Chrome exposes it inside the TWA.
function fakePlay({ purchases = [], token = 'tok-123', showError = null, price = { currency: 'PLN', value: '19.99' } } = {}) {
  const service = {
    listPurchases: vi.fn(async () => purchases),
    getDetails: vi.fn(async ids => ids.map(itemId => ({ itemId, price }))),
  };
  const complete = vi.fn(async () => {});
  class FakePaymentRequest {
    constructor(methods) { this.methods = methods; }
    async show() {
      if (showError) throw showError;
      return { details: { purchaseToken: token }, complete };
    }
  }
  return { service, complete, FakePaymentRequest };
}

async function load({ play = null, serverReply = { owned: true }, serverStatus = 200, serverDown = false } = {}) {
  vi.stubGlobal('localStorage', memoryStorage());
  const win = {};
  if (play) win.getDigitalGoodsService = vi.fn(async () => play.service);
  vi.stubGlobal('window', win);
  if (play) vi.stubGlobal('PaymentRequest', play.FakePaymentRequest);
  const fetchMock = vi.fn(async () => {
    if (serverDown) throw new TypeError('Failed to fetch');
    return { ok: serverStatus === 200, status: serverStatus, json: async () => serverReply };
  });
  vi.stubGlobal('fetch', fetchMock);
  vi.doMock('../src/constants.js', () => ({ PRO_ENABLED: true, PRO_SKU: 'pro_lifetime', BILLING_API: 'https://billing.test' }));
  const mod = await import('../src/lib/pro.js');
  return { ...mod, fetchMock };
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
  vi.doUnmock('../src/constants.js');
});

describe('refreshEntitlement', () => {
  it('returns null outside the Play app, keeping whatever is cached', async () => {
    const { refreshEntitlement } = await load();
    expect(await refreshEntitlement()).toBe(null);
  });

  it('turns Pro off when Play lists no purchase (never bought or refunded)', async () => {
    const play = fakePlay({ purchases: [] });
    const { refreshEntitlement, readCachedPro } = await load({ play });
    localStorage.setItem('ps5vault_pro', JSON.stringify({ owned: true }));
    expect(await refreshEntitlement()).toBe(false);
    expect(readCachedPro()).toBe(false);
  });

  it('verifies an existing purchase with the server (which acknowledges it)', async () => {
    const play = fakePlay({ purchases: [{ itemId: 'pro_lifetime', purchaseToken: 'tok-9' }] });
    const { refreshEntitlement, readCachedPro, fetchMock } = await load({ play });
    expect(await refreshEntitlement()).toBe(true);
    expect(readCachedPro()).toBe(true);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://billing.test/verify');
    expect(JSON.parse(init.body)).toEqual({ productId: 'pro_lifetime', purchaseToken: 'tok-9' });
  });

  it('keeps Pro when Play lists the purchase but the server is unreachable', async () => {
    const play = fakePlay({ purchases: [{ itemId: 'pro_lifetime', purchaseToken: 'tok-9' }] });
    const { refreshEntitlement } = await load({ play, serverDown: true });
    expect(await refreshEntitlement()).toBe(true);
  });

  it('respects the server saying the payment is still pending', async () => {
    const play = fakePlay({ purchases: [{ itemId: 'pro_lifetime', purchaseToken: 'tok-9' }] });
    const { refreshEntitlement } = await load({ play, serverReply: { owned: false, pending: true } });
    expect(await refreshEntitlement()).toBe(false);
  });

  it('ignores purchases of other products', async () => {
    const play = fakePlay({ purchases: [{ itemId: 'something_else', purchaseToken: 'x' }] });
    const { refreshEntitlement } = await load({ play });
    expect(await refreshEntitlement()).toBe(false);
  });
});

describe('buyPro', () => {
  it('is unavailable outside the Play app', async () => {
    const { buyPro } = await load();
    expect(await buyPro()).toEqual({ status: 'unavailable' });
  });

  it('completes the sheet with success and caches Pro after server verification', async () => {
    const play = fakePlay();
    const { buyPro, readCachedPro } = await load({ play });
    expect(await buyPro()).toEqual({ status: 'owned' });
    expect(play.complete).toHaveBeenCalledWith('success');
    expect(readCachedPro()).toBe(true);
  });

  it('reports a cancelled sheet without touching the server', async () => {
    const play = fakePlay({ showError: Object.assign(new Error('closed'), { name: 'AbortError' }) });
    const { buyPro, fetchMock } = await load({ play });
    expect(await buyPro()).toEqual({ status: 'cancelled' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('grants Pro and retries later when payment went through but the server is down', async () => {
    const play = fakePlay();
    const { buyPro, readCachedPro } = await load({ play, serverDown: true });
    expect((await buyPro()).status).toBe('owned_retry');
    expect(readCachedPro()).toBe(true);
  });

  it('reports pending payments and does not unlock', async () => {
    const play = fakePlay();
    const { buyPro, readCachedPro } = await load({ play, serverReply: { owned: false, pending: true } });
    expect((await buyPro()).status).toBe('pending');
    expect(play.complete).toHaveBeenCalledWith('fail');
    expect(readCachedPro()).toBe(false);
  });
});

describe('getProPrice', () => {
  it('formats the Play catalog price for the locale', async () => {
    const play = fakePlay();
    const { getProPrice } = await load({ play });
    const price = await getProPrice('pl-PL');
    expect(price).toMatch(/19,99/);
    expect(price).toMatch(/zł/);
  });
});
