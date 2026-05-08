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

// v1.15.2 — Web Share API with a generated file. Used by Wrapped image share.
// Returns 'shared' / 'cancelled' / 'downloaded' (fallback). Caller must invoke from
// inside a user-gesture handler. The blob is wrapped into a File so canShare({files})
// works on Chrome/Android (89+); other browsers fall through to download via blob URL.
export async function shareFile({ title, text, blob, filename }) {
  // Try Web Share API with file
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function' && typeof navigator.canShare === 'function') {
    try {
      const file = new File([blob], filename, { type: blob.type || 'image/png' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return 'shared';
      }
    } catch (e) {
      if (e && e.name === 'AbortError') return 'cancelled';
      // Fall through to download
    }
  }
  // Fallback: trigger download
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 200);
    return 'downloaded';
  } catch {
    return 'failed';
  }
}
