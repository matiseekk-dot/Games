// v1.18.0 - PS5 Vault Pro: one-time purchase through Google Play Billing.
//
// Inside the TWA, Chrome exposes the Digital Goods API (catalog + entitlements) and the
// Payment Request API (checkout). The Digital Goods API has NO way to acknowledge a
// purchase, and Play refunds unacknowledged purchases after 3 days, so every purchase
// token goes to our billing Worker (worker/), which verifies it with the Google Play
// Developer API and acknowledges it. The Worker is idempotent: calling it again for an
// already-acknowledged token just re-confirms ownership.
//
// Entitlement source of truth is Play's own purchase list, re-read on every app start.
// localStorage only caches the answer for offline starts and the plain-browser version.
import { PRO_ENABLED, PRO_SKU, BILLING_API } from '../constants.js';

export const PLAY_BILLING_METHOD = 'https://play.google.com/billing';
const LS_PRO = 'ps5vault_pro';

export function proGateActive() {
  return PRO_ENABLED;
}

export function readCachedPro() {
  try {
    const o = JSON.parse(localStorage.getItem(LS_PRO) || 'null');
    return !!(o && o.owned);
  } catch {
    return false;
  }
}

function writeCachedPro(owned) {
  try {
    localStorage.setItem(LS_PRO, JSON.stringify({ owned: !!owned, checkedAt: new Date().toISOString() }));
  } catch {}
}

export async function getBillingService() {
  if (typeof window === 'undefined' || !('getDigitalGoodsService' in window)) return null;
  try {
    return await window.getDigitalGoodsService(PLAY_BILLING_METHOD);
  } catch {
    // Throws when the TWA was built without the Play Billing module (older APK) or the
    // provider isn't Chrome.
    return null;
  }
}

// Localized price string straight from Play ("19,99 zł"), or null if unavailable.
export async function getProPrice(locale) {
  const service = await getBillingService();
  if (!service) return null;
  try {
    const [item] = await service.getDetails([PRO_SKU]);
    if (!item || !item.price) return null;
    return new Intl.NumberFormat(locale, { style: 'currency', currency: item.price.currency }).format(Number(item.price.value));
  } catch {
    return null;
  }
}

async function verifyWithServer(purchaseToken) {
  if (!BILLING_API) throw new Error('billing api not configured');
  const res = await fetch(BILLING_API + '/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ productId: PRO_SKU, purchaseToken }),
  });
  if (!res.ok) throw new Error('verify failed: ' + res.status);
  return res.json(); // { owned: boolean, pending?: boolean }
}

// Reconcile with Play on startup. Returns true/false, or null when Play can't be asked
// (plain browser, older APK, non-Chrome provider): the caller then keeps the cached value.
export async function refreshEntitlement() {
  const service = await getBillingService();
  if (!service) return null;
  let purchases;
  try {
    purchases = await service.listPurchases();
  } catch {
    return null;
  }
  const purchase = (purchases || []).find(p => p.itemId === PRO_SKU);
  if (!purchase) {
    writeCachedPro(false); // never bought, or refunded/revoked
    return false;
  }
  try {
    const result = await verifyWithServer(purchase.purchaseToken);
    writeCachedPro(result.owned);
    return !!result.owned;
  } catch {
    // Worker unreachable (offline, outage). Play itself lists the item, so honour it and
    // retry the acknowledgement on the next start; Play allows 3 days.
    writeCachedPro(true);
    return true;
  }
}

// Full checkout. Resolves to one of:
//   { status: 'owned' }        verified and acknowledged
//   { status: 'owned_retry' }  paid, Worker unreachable; acknowledged on a later start
//   { status: 'pending' }      payment pending (e.g. cash at a shop)
//   { status: 'cancelled' }    user closed the sheet
//   { status: 'unavailable' }  no Play Billing here (browser, old APK)
//   { status: 'error', error }
export async function buyPro() {
  const service = await getBillingService();
  if (!service || typeof PaymentRequest === 'undefined') return { status: 'unavailable' };

  let response;
  try {
    const request = new PaymentRequest(
      [{ supportedMethods: PLAY_BILLING_METHOD, data: { sku: PRO_SKU } }],
      // Required by the Payment Request API; Play ignores it and charges the catalog price.
      { total: { label: 'Total', amount: { currency: 'USD', value: '0' } } },
    );
    response = await request.show();
  } catch (e) {
    if (e && e.name === 'AbortError') return { status: 'cancelled' };
    return { status: 'error', error: String((e && e.message) || e) };
  }

  const token = response.details && response.details.purchaseToken;
  if (!token) {
    try { await response.complete('fail'); } catch {}
    return { status: 'error', error: 'no purchase token' };
  }

  try {
    const result = await verifyWithServer(token);
    try { await response.complete(result.owned ? 'success' : 'fail'); } catch {}
    if (result.owned) {
      writeCachedPro(true);
      return { status: 'owned' };
    }
    return { status: result.pending ? 'pending' : 'error', error: 'not owned' };
  } catch {
    try { await response.complete('success'); } catch {}
    writeCachedPro(true);
    return { status: 'owned_retry' };
  }
}
