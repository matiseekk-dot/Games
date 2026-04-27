// Browser platform integrations: service worker registration, Notification permission,
// and posting messages to the SW for release-date checks.
// No project imports — all native browser APIs.

export async function registerSW() {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.register('/Games/sw.js');
    // Force update check on every load
    reg.update();
    // If new SW is waiting, activate immediately
    if (reg.waiting) { reg.waiting.postMessage({ type:'SKIP_WAITING' }); }
    // Listen for updates
    reg.addEventListener('updatefound', () => {
      const nw = reg.installing;
      if (nw) {
        nw.addEventListener('statechange', () => {
          if (nw.state === 'installed' && navigator.serviceWorker.controller) {
            // New SW available — reload once to use it
            window.location.reload();
          }
        });
      }
    });
  } catch (e) { console.log('SW register error:', e); }
}

export async function requestNotifPerm() {
  if (!('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  return await Notification.requestPermission();
}

export async function checkReleases(games, lang) {
  if (!('serviceWorker' in navigator)) return;
  try {
    const reg = await navigator.serviceWorker.ready;
    reg.active?.postMessage({ type:'CHECK_RELEASES', games, lang:lang || 'pl' });
  } catch {}
}

// v1.7.0: share via native share sheet, with clipboard + alert fallbacks.
// Returns one of: 'shared' | 'copied' | 'cancelled' | 'failed'.
//
// `navigator.share` requires a user-gesture handler (button click) — caller must
// invoke this from inside an onClick, not inside a setTimeout/promise chain.
// AbortError is thrown when user dismisses the OS share sheet — we treat that as
// 'cancelled' (not a real failure) so callers don't toast an error toast.
export async function shareText({ title, text, url }) {
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      return 'shared';
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
      // Fall through to clipboard on other share failures (rare — usually permissions).
    }
  }
  // Clipboard fallback. The full text + url combined so the user has everything in one paste.
  const combined = url ? `${text}\n${url}` : text;
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(combined);
      return 'copied';
    } catch {}
  }
  return 'failed';
}

// v1.11.0 — Notification diagnostic helper.
//
// Walks the entire notification path step-by-step, returning a structured report
// describing exactly which prerequisite is missing or which step failed. Used by
// Settings → "Test notification" button to debug issues like "Android doesn't show
// notifications" — the report tells the user (and us) what to fix.
//
// Returns an object with:
//   ok:          boolean — overall green light (all prerequisites met)
//   userAgent:   string — navigator.userAgent (for triage)
//   platform:    'ios' | 'android' | 'desktop' | 'unknown'
//   isStandalone: boolean — true if running as installed PWA (vs. browser tab)
//   steps:       Array<{ label, status: 'ok'|'warn'|'fail'|'skip', detail }>
//
// Steps walked:
//   1. Browser supports Notification API
//   2. Browser supports Service Worker
//   3. Service Worker is registered & active
//   4. Notification.permission state
//   5. iOS-specific: PWA standalone mode required for notifications (iOS 16.4+)
//   6. Battery optimization / Doze mode hints (Android)
export async function diagnoseNotifications() {
  const report = {
    ok: false,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '(no navigator)',
    platform: 'unknown',
    isStandalone: false,
    steps: [],
  };

  // Detect platform from UA — rough heuristic; not perfect but useful for triage.
  const ua = report.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) report.platform = 'ios';
  else if (/android/.test(ua)) report.platform = 'android';
  else if (/macintosh|windows|linux/.test(ua)) report.platform = 'desktop';

  // Detect standalone (PWA-installed) mode. Two methods because iOS uses navigator.standalone
  // while Android/desktop use the matchMedia query.
  try {
    const mm = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(display-mode: standalone)').matches
      : false;
    const iosStandalone = typeof navigator !== 'undefined' && navigator.standalone === true;
    report.isStandalone = mm || iosStandalone;
  } catch {}

  const push = (label, status, detail) => report.steps.push({ label, status, detail });

  // Step 1 — Notification API support
  if (typeof Notification === 'undefined') {
    push('Notification API', 'fail', 'window.Notification is undefined — this browser does not support notifications at all.');
    return report;
  }
  push('Notification API', 'ok', 'window.Notification available');

  // Step 2 — Service Worker support
  if (!('serviceWorker' in navigator)) {
    push('Service Worker', 'fail', 'navigator.serviceWorker undefined — running in a context that does not support SW (incognito on some browsers, very old browser).');
    return report;
  }
  push('Service Worker', 'ok', 'navigator.serviceWorker available');

  // Step 3 — SW registration & active state
  let reg = null;
  try {
    reg = await navigator.serviceWorker.getRegistration('/Games/');
    if (!reg) {
      push('SW registered', 'fail', 'No registration for scope /Games/. Try reloading the page.');
      return report;
    }
    if (!reg.active) {
      push('SW active', 'warn', `SW state: installing=${!!reg.installing} waiting=${!!reg.waiting} active=${!!reg.active}. Reload the page once to activate.`);
    } else {
      push('SW active', 'ok', `Active SW found, scope: ${reg.scope}`);
    }
  } catch (e) {
    push('SW registered', 'fail', `getRegistration threw: ${e.message || e}`);
    return report;
  }

  // Step 4 — Notification permission
  const perm = Notification.permission;
  if (perm === 'denied') {
    push('Permission', 'fail',
      report.platform === 'android'
        ? 'Permission denied. Android: Chrome settings → Site settings → Notifications → find this site → Allow. Or uninstall and reinstall the PWA.'
        : report.platform === 'ios'
        ? 'Permission denied. iOS: Settings → Notifications → PS5 Vault → enable. Or remove the home screen icon and re-add via Share → Add to Home Screen.'
        : 'Permission denied. Browser settings → Site permissions → find this site → reset.');
    return report;
  }
  if (perm === 'default') {
    push('Permission', 'warn', 'Permission not yet granted. Tap "Włącz powiadomienia" / "Enable notifications" in the app, or grant via browser prompt.');
    // Don't bail — we can still run further checks even without permission.
  } else {
    push('Permission', 'ok', 'granted');
  }

  // Step 5 — iOS-specific: standalone mode required
  if (report.platform === 'ios' && !report.isStandalone) {
    push('iOS: Standalone mode', 'fail', 'iOS only delivers PWA notifications when the app is launched from a home-screen icon. Currently running in Safari tab. Tap Share → Add to Home Screen, then open from the home screen icon.');
    return report;
  }
  if (report.platform === 'ios') {
    push('iOS: Standalone mode', 'ok', 'Running as installed PWA (iOS 16.4+ required for notifications)');
  }

  // Step 6 — Try firing a test notification (only if all gates pass)
  if (perm === 'granted' && reg && reg.active) {
    try {
      await reg.showNotification('PS5 Vault — test', {
        body: 'Notifications work! 🎮',
        icon: '/Games/icons/icon-192.png',
        badge: '/Games/icons/icon-192.png',
        tag: 'ps5vault-test',
        data: { type: 'test' },
      });
      push('Test notification', 'ok', 'Fired via SW.showNotification — should appear in your notification tray within 1-2 seconds. If you don\'t see it, check OS-level settings (Android: Battery → unrestricted; iOS: Focus modes off).');
      report.ok = true;
    } catch (e) {
      push('Test notification', 'fail', `showNotification threw: ${e.message || e}. Falling back to local Notification...`);
      try {
        new Notification('PS5 Vault — test', { body: 'Notifications work (local fallback)!' });
        push('Test notification (fallback)', 'ok', 'Fired via local Notification API. SW path is broken but legacy path works.');
        report.ok = true;
      } catch (e2) {
        push('Test notification (fallback)', 'fail', `Local Notification threw: ${e2.message || e2}`);
      }
    }
  } else {
    push('Test notification', 'skip', 'Skipped — prerequisites not all green.');
  }

  return report;
}
