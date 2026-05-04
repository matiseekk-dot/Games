// PS5 Vault — Service Worker v1.13.11 (NETWORK-FIRST + i18n notifications + tab-aware click + correct icon paths)
const CACHE = "ps5vault-v22";
const OFFLINE_URLS = ["/Games/", "/Games/index.html"];

const NOTIF_I18N = {
  pl: {
    todayTitle: "🎮 Premiera dzisiaj!",
    todayBody: t => `${t} jest już dostępne!`,
    weekTitle: "⏳ Tydzień do premiery!",
    weekBody: t => `${t} — za 7 dni!`,
    monthTitle: "📅 Miesiąc do premiery",
    monthBody: t => `${t} — za miesiąc!`,
    daysTitle: d => `⏳ ${d} dni do premiery`,
    daysBody: t => `${t}`
  },
  en: {
    todayTitle: "🎮 Released today!",
    todayBody: t => `${t} is now available!`,
    weekTitle: "⏳ One week to release!",
    weekBody: t => `${t} — in 7 days!`,
    monthTitle: "📅 One month to release",
    monthBody: t => `${t} — in one month!`,
    daysTitle: d => `⏳ ${d} days to release`,
    daysBody: t => `${t}`
  }
};

self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_URLS)).catch(() => {})
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    Promise.all([
      caches.keys().then(keys =>
        Promise.all(keys.filter(k => k !== CACHE && k !== "ps5vault-notifs").map(k => caches.delete(k)))
      ),
      self.clients.claim()
    ])
  );
});

// NETWORK-FIRST strategy: always try network, fallback to cache
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  if (!e.request.url.startsWith("https://")) return;
  if (e.request.url.includes("api.rawg.io")) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Always update cache with latest response
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener("message", async event => {
  if (event.data?.type === "SKIP_WAITING") { self.skipWaiting(); return; }
  if (event.data?.type !== "CHECK_RELEASES") return;
  const games = event.data.games || [];
  const lang = event.data.lang === "en" ? "en" : "pl";
  const i18n = NOTIF_I18N[lang];
  const today = new Date(); today.setHours(0,0,0,0);
  for (const game of games) {
    if (!game.releaseDate || !game.notifyEnabled) continue;
    const rel = new Date(game.releaseDate); rel.setHours(0,0,0,0);
    if (isNaN(rel)) continue;
    const diff = Math.round((rel - today) / 86400000);
    const key = `${game.id}_${game.releaseDate}_${diff}`;
    let shown = false;
    try { const c = await caches.open("ps5vault-notifs"); shown = !!(await c.match("/"+key)); } catch {}
    if (shown) continue;
    const opts = base => ({ body: base, icon:"/Games/icons/icon-192.png", badge:"/Games/icons/icon-192.png", tag:key });
    if (diff === 0) {
      await self.registration.showNotification(i18n.todayTitle, opts(i18n.todayBody(game.title)));
    } else if (diff === 7) {
      await self.registration.showNotification(i18n.weekTitle, opts(i18n.weekBody(game.title)));
    } else if (diff === 30) {
      await self.registration.showNotification(i18n.monthTitle, opts(i18n.monthBody(game.title)));
    } else if (diff > 0 && diff <= 3) {
      await self.registration.showNotification(i18n.daysTitle(diff), opts(i18n.daysBody(game.title)));
    }
    try { const c = await caches.open("ps5vault-notifs"); await c.put("/"+key, new Response("1")); } catch {}
  }
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  // v1.10.0 — Honor data.tab from notification payload (weekly summary uses tab='st').
  // The app reads ?tab=... from the URL on mount and switches accordingly.
  const data = e.notification.data || {};
  const tab = data.tab;
  const targetUrl = tab ? `/Games/?tab=${encodeURIComponent(tab)}` : "/Games/";
  e.waitUntil(self.clients.matchAll({type:"window"}).then(cls => {
    if (cls.length) {
      // Focus existing tab. If it has a tab-switch hook exposed, use postMessage; else just focus.
      const c = cls[0];
      if (tab) {
        try { c.postMessage({ type: "SWITCH_TAB", tab }); } catch {}
      }
      return c.focus();
    }
    return self.clients.openWindow(targetUrl);
  }));
});
