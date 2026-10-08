// v1.17.7 - Funnel analytics via Umami Cloud (cookieless, no consent banner needed).
//
// Why Umami and not Firebase/GA4: GA4 stores a client identifier, so in the EU it needs a
// consent banner before the first event, and that banner would sit exactly at first launch,
// the weakest step of the funnel. Umami sets no cookies and no local identifiers.
//
// Off by default: nothing loads or sends until UMAMI_WEBSITE_ID (constants.js) is set,
// and never outside the production host, so dev/preview runs stay silent.
// Never throws: analytics must not be able to break the app.
import { UMAMI_WEBSITE_ID } from '../constants.js';

const PROD_HOST = 'matiseekk-dot.github.io';
const SCRIPT_SRC = 'https://cloud.umami.is/script.js';
const LS_ONCE = 'ps5vault_evt_once';
const SS_PLATFORM = 'ps5vault_platform';
const TWA_REFERRER = 'android-app://com.skudev.ps5vault';
const MAX_QUEUE = 30;

let queue = [];
let initialized = false;

function enabled() {
  return !!UMAMI_WEBSITE_ID && typeof location !== 'undefined' && location.hostname === PROD_HOST;
}

// 'play'  = launched from the Google Play app (TWA sets an android-app:// referrer on the first load)
// 'pwa'   = installed to the home screen from the browser
// 'web'   = plain browser tab
export function getPlatform() {
  try {
    const cached = sessionStorage.getItem(SS_PLATFORM);
    if (cached) return cached;
    let p = 'web';
    if (typeof document !== 'undefined' && document.referrer.startsWith(TWA_REFERRER)) p = 'play';
    else if (typeof matchMedia === 'function' && matchMedia('(display-mode: standalone)').matches) p = 'pwa';
    sessionStorage.setItem(SS_PLATFORM, p);
    return p;
  } catch {
    return 'web';
  }
}

function flush() {
  const umami = typeof window !== 'undefined' ? window.umami : null;
  if (!umami || typeof umami.track !== 'function') return;
  const pending = queue;
  queue = [];
  for (const [name, data] of pending) {
    try { umami.track(name, data); } catch {}
  }
}

export function initAnalytics() {
  if (initialized) return;
  initialized = true;
  getPlatform(); // capture the TWA referrer before any in-app navigation can change it
  if (!enabled()) return;
  try {
    const s = document.createElement('script');
    s.defer = true;
    s.src = SCRIPT_SRC;
    s.dataset.websiteId = UMAMI_WEBSITE_ID;
    s.dataset.domains = PROD_HOST;
    s.dataset.doNotTrack = 'true';
    s.onload = flush;
    document.head.appendChild(s);
  } catch {}
}

export function track(name, data = {}) {
  if (!enabled()) return;
  const payload = { platform: getPlatform(), ...data };
  const umami = window.umami;
  if (umami && typeof umami.track === 'function') {
    try { umami.track(name, payload); } catch {}
  } else if (queue.length < MAX_QUEUE) {
    queue.push([name, payload]);
  }
}

// Fires at most once per install. The "done" mark is stored even while analytics is off,
// so switching it on later does not replay first-time events for long-time users.
export function trackOnce(name, data) {
  try {
    const done = JSON.parse(localStorage.getItem(LS_ONCE) || '[]');
    if (done.includes(name)) return false;
    done.push(name);
    localStorage.setItem(LS_ONCE, JSON.stringify(done));
  } catch {
    return false;
  }
  track(name, data);
  return true;
}

// Coarse size bucket so a 712-game import doesn't become a unique, fingerprint-like number.
export function countBucket(n) {
  if (n < 10) return '1-9';
  if (n < 50) return '10-49';
  if (n < 200) return '50-199';
  return '200+';
}
