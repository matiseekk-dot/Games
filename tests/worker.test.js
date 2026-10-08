import { describe, it, expect, beforeAll, beforeEach, afterEach, vi } from 'vitest';
import worker, { _resetForTests } from '../worker/src/index.js';

const PLAY = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/com.skudev.ps5vault/purchases/products/pro_lifetime/tokens/';
const TOKEN = 'abcdefghijklmnopqrstuvwxyz.AO-J1Oz_token-123';

let env, publicKey;

beforeAll(async () => {
  const pair = await crypto.subtle.generateKey(
    { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
    true, ['sign', 'verify']);
  publicKey = pair.publicKey;
  const der = new Uint8Array(await crypto.subtle.exportKey('pkcs8', pair.privateKey));
  const b64 = Buffer.from(der).toString('base64').match(/.{1,64}/g).join('\n');
  env = { GOOGLE_SA_JSON: JSON.stringify({ client_email: 'billing@test.iam.gserviceaccount.com', private_key: `-----BEGIN PRIVATE KEY-----\n${b64}\n-----END PRIVATE KEY-----\n` }) };
});

// Routes fetch calls to a fake Google: OAuth token endpoint + Play Developer API.
function fakeGoogle({ purchase, getStatus = 200, ackStatus = 200, afterAck = null }) {
  const calls = [];
  let current = purchase;
  const fetchMock = vi.fn(async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url) === 'https://oauth2.googleapis.com/token') {
      return new Response(JSON.stringify({ access_token: 'access-1', expires_in: 3600 }), { status: 200 });
    }
    if (String(url).endsWith(':acknowledge')) {
      if (ackStatus === 200 && current) current = { ...current, acknowledgementState: 1 };
      if (afterAck) current = afterAck;
      return new Response('', { status: ackStatus });
    }
    if (String(url).startsWith(PLAY)) {
      if (getStatus !== 200) return new Response('{}', { status: getStatus });
      return new Response(JSON.stringify(current), { status: 200 });
    }
    throw new Error('unexpected fetch ' + url);
  });
  vi.stubGlobal('fetch', fetchMock);
  return { calls };
}

function post(body) {
  return new Request('https://ps5vault-billing.test/verify', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://matiseekk-dot.github.io' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

beforeEach(() => _resetForTests());
afterEach(() => vi.unstubAllGlobals());

describe('billing worker /verify', () => {
  it('acknowledges a fresh purchase and reports it owned', async () => {
    const { calls } = fakeGoogle({ purchase: { purchaseState: 0, acknowledgementState: 0 } });
    const res = await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ owned: true });
    expect(calls.some(c => c.url.endsWith(':acknowledge') && c.init.method === 'POST')).toBe(true);
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe('https://matiseekk-dot.github.io');
  });

  it('signs a valid RS256 service-account JWT for the androidpublisher scope', async () => {
    const { calls } = fakeGoogle({ purchase: { purchaseState: 0, acknowledgementState: 1 } });
    await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    const assertion = new URLSearchParams(String(calls[0].init.body)).get('assertion');
    const [h, p, s] = assertion.split('.');
    const fromB64url = x => Buffer.from(x.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
    const ok = await crypto.subtle.verify('RSASSA-PKCS1-v1_5', publicKey, fromB64url(s), new TextEncoder().encode(h + '.' + p));
    expect(ok).toBe(true);
    const claims = JSON.parse(fromB64url(p).toString());
    expect(claims).toMatchObject({ iss: 'billing@test.iam.gserviceaccount.com', scope: 'https://www.googleapis.com/auth/androidpublisher', aud: 'https://oauth2.googleapis.com/token' });
  });

  it('does not acknowledge twice', async () => {
    const { calls } = fakeGoogle({ purchase: { purchaseState: 0, acknowledgementState: 1 } });
    const res = await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(await res.json()).toEqual({ owned: true });
    expect(calls.some(c => c.url.endsWith(':acknowledge'))).toBe(false);
  });

  it('reuses the access token across requests', async () => {
    const { calls } = fakeGoogle({ purchase: { purchaseState: 0, acknowledgementState: 1 } });
    await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(calls.filter(c => c.url.includes('oauth2')).length).toBe(1);
  });

  it('reports pending payments', async () => {
    fakeGoogle({ purchase: { purchaseState: 2, acknowledgementState: 0 } });
    const res = await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(await res.json()).toEqual({ owned: false, pending: true });
  });

  it('reports refunded or cancelled purchases as not owned', async () => {
    fakeGoogle({ purchase: { purchaseState: 1, acknowledgementState: 1 } });
    const res = await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(await res.json()).toEqual({ owned: false });
  });

  it('treats an unknown token as not owned', async () => {
    fakeGoogle({ purchase: null, getStatus: 404 });
    const res = await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(await res.json()).toEqual({ owned: false });
  });

  it('accepts a race where another call acknowledged first', async () => {
    fakeGoogle({ purchase: { purchaseState: 0, acknowledgementState: 0 }, ackStatus: 400, afterAck: { purchaseState: 0, acknowledgementState: 1 } });
    const res = await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(await res.json()).toEqual({ owned: true });
  });

  it('returns 502 when Google fails, so the app retries later', async () => {
    fakeGoogle({ purchase: null, getStatus: 500 });
    const res = await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: TOKEN }), env);
    expect(res.status).toBe(502);
  });

  it('rejects unknown products and malformed tokens without calling Google', async () => {
    const { calls } = fakeGoogle({ purchase: { purchaseState: 0, acknowledgementState: 1 } });
    expect((await worker.fetch(post({ productId: 'other', purchaseToken: TOKEN }), env)).status).toBe(400);
    expect((await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: 'short' }), env)).status).toBe(400);
    expect((await worker.fetch(post({ productId: 'pro_lifetime', purchaseToken: 'x'.repeat(30) + '/../' }), env)).status).toBe(400);
    expect((await worker.fetch(post('not json'), env)).status).toBe(400);
    expect(calls.length).toBe(0);
  });

  it('answers CORS preflight and 404s other routes', async () => {
    const pre = await worker.fetch(new Request('https://x.test/verify', { method: 'OPTIONS' }), env);
    expect(pre.status).toBe(204);
    expect(pre.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    const other = await worker.fetch(new Request('https://x.test/', { method: 'GET' }), env);
    expect(other.status).toBe(404);
  });
});
