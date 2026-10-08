// PS5 Vault billing Worker (Cloudflare Workers, free plan is plenty).
//
// The TWA's Digital Goods API cannot acknowledge purchases, and Google Play refunds any
// one-time purchase that is not acknowledged within 3 days. This Worker is the missing
// server step: POST /verify { productId, purchaseToken } asks the Google Play Developer
// API about the token, acknowledges it if needed, and answers { owned, pending? }.
// Idempotent: the app calls it on every start, an acknowledged token just re-confirms.
//
// Secret (set with `wrangler secret put GOOGLE_SA_JSON`): the JSON key of a Google Cloud
// service account that has access to this app in Play Console. It never leaves the Worker.

const PACKAGE_NAME = 'com.skudev.ps5vault';
const PRODUCTS = new Set(['pro_lifetime']);
const APP_ORIGIN = 'https://matiseekk-dot.github.io';
const TOKEN_RE = /^[A-Za-z0-9._-]{20,4096}$/;
const SCOPE = 'https://www.googleapis.com/auth/androidpublisher';
const OAUTH_URL = 'https://oauth2.googleapis.com/token';

let cachedAccess = null; // { token, exp } reused while the isolate lives

export function _resetForTests() {
  cachedAccess = null;
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': APP_ORIGIN,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

function json(body, status) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders() } });
}

function base64url(bytes) {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToDer(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out.buffer;
}

async function getAccessToken(env, now = Date.now()) {
  if (cachedAccess && cachedAccess.exp - 60_000 > now) return cachedAccess.token;
  const sa = JSON.parse(env.GOOGLE_SA_JSON);
  const iat = Math.floor(now / 1000);
  const enc = obj => base64url(new TextEncoder().encode(JSON.stringify(obj)));
  const unsigned = enc({ alg: 'RS256', typ: 'JWT' }) + '.' +
    enc({ iss: sa.client_email, scope: SCOPE, aud: OAUTH_URL, iat, exp: iat + 3600 });
  const key = await crypto.subtle.importKey('pkcs8', pemToDer(sa.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', key, new TextEncoder().encode(unsigned));
  const res = await fetch(OAUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: unsigned + '.' + base64url(new Uint8Array(sig)),
    }),
  });
  if (!res.ok) throw new Error('oauth ' + res.status);
  const data = await res.json();
  cachedAccess = { token: data.access_token, exp: now + (data.expires_in || 3600) * 1000 };
  return cachedAccess.token;
}

export async function verifyPurchase(env, productId, purchaseToken) {
  const access = await getAccessToken(env);
  const url = 'https://androidpublisher.googleapis.com/androidpublisher/v3/applications/' +
    `${PACKAGE_NAME}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(purchaseToken)}`;
  const auth = { Authorization: 'Bearer ' + access };

  const getPurchase = async () => {
    const res = await fetch(url, { headers: auth });
    if (res.status === 400 || res.status === 404 || res.status === 410) return null; // unknown or expired token
    if (!res.ok) throw new Error('play ' + res.status);
    return res.json();
  };

  const p = await getPurchase();
  if (!p) return { owned: false };
  // purchaseState: 0 purchased, 1 cancelled/refunded, 2 pending
  if (p.purchaseState === 2) return { owned: false, pending: true };
  if (p.purchaseState !== 0) return { owned: false };

  if (p.acknowledgementState === 0) {
    const ack = await fetch(url + ':acknowledge', {
      method: 'POST',
      headers: { ...auth, 'Content-Type': 'application/json' },
      body: '{}',
    });
    if (!ack.ok) {
      // A parallel call (two app starts) may have acknowledged it first; re-check.
      const again = await getPurchase();
      if (!again || again.acknowledgementState !== 1) throw new Error('acknowledge ' + ack.status);
    }
  }
  return { owned: true };
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
    const { pathname } = new URL(request.url);
    if (pathname !== '/verify' || request.method !== 'POST') return json({ error: 'not found' }, 404);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'bad json' }, 400); }
    const { productId, purchaseToken } = body || {};
    if (!PRODUCTS.has(productId) || typeof purchaseToken !== 'string' || !TOKEN_RE.test(purchaseToken)) {
      return json({ error: 'bad request' }, 400);
    }
    try {
      return json(await verifyPurchase(env, productId, purchaseToken), 200);
    } catch {
      // The app treats any non-200 as "server unreachable" and retries on the next start.
      return json({ error: 'upstream' }, 502);
    }
  },
};
