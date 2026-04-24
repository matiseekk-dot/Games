// PS5 Vault — Service Worker v1.4 (NETWORK-FIRST)
const CACHE = "ps5vault-v12";
const OFFLINE_URLS = ["/Games/", "/Games/index.html"];

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
  const today = new Date(); today.setHours(0,0,0,0);
  for (const game of games) {
    if (!game.releaseDate || !game.notifyEnabled) continue;
    const rel = new Date(game.releaseDate); rel.setHours(0,0,0,0);
    const diff = Math.round((rel - today) / 86400000);
    const key = `${game.id}_${game.releaseDate}_${diff}`;
    let shown = false;
    try { const c = await caches.open("ps5vault-notifs"); shown = !!(await c.match("/"+key)); } catch {}
    if (shown) continue;
    if (diff === 0) {
      await self.registration.showNotification("🎮 Premiera dzisiaj!", { body:`${game.title} jest już dostępne!`, icon:"/Games/icon-192.png", badge:"/Games/icon-192.png", tag:key });
    } else if (diff === 7) {
      await self.registration.showNotification("⏳ Tydzień do premiery!", { body:`${game.title} — za 7 dni!`, icon:"/Games/icon-192.png", badge:"/Games/icon-192.png", tag:key });
    } else if (diff === 30) {
      await self.registration.showNotification("📅 Miesiąc do premiery", { body:`${game.title} — za miesiąc!`, icon:"/Games/icon-192.png", badge:"/Games/icon-192.png", tag:key });
    } else if (diff > 0 && diff <= 3) {
      await self.registration.showNotification(`⏳ ${diff} dni do premiery`, { body:`${game.title}`, icon:"/Games/icon-192.png", badge:"/Games/icon-192.png", tag:key });
    }
    try { const c = await caches.open("ps5vault-notifs"); await c.put("/"+key, new Response("1")); } catch {}
  }
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window"}).then(cls => { if(cls.length)return cls[0].focus(); return self.clients.openWindow("/Games/"); }));
});
