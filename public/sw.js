// PS5 Vault — Service Worker
// Sprawdza daty premier przy otwarciu apki i wysyła powiadomienia

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));

// Odbiera wiadomość z apki z listą gier do sprawdzenia
self.addEventListener("message", async (event) => {
  if (event.data?.type !== "CHECK_RELEASES") return;

  const games = event.data.games || [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const game of games) {
    if (!game.releaseDate || !game.notifyEnabled) continue;

    const release = new Date(game.releaseDate);
    release.setHours(0, 0, 0, 0);
    const diffMs   = release - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // Klucz unikalny dla każdej gry + dnia — żeby nie pokazywać dwa razy
    const notifKey = `${game.id}_${game.releaseDate}_${diffDays}`;
    const shown    = await getShown(notifKey);
    if (shown) continue;

    if (diffDays === 0) {
      await self.registration.showNotification("🎮 Premiera dziś!", {
        body: `${game.title} jest już dostępne!`,
        icon: "/Games/icon.svg",
        badge: "/Games/icon.svg",
        tag: notifKey,
        data: { gameId: game.id },
      });
      await markShown(notifKey);
    } else if (diffDays > 0 && diffDays <= 3) {
      await self.registration.showNotification(`⏳ ${diffDays} dni do premiery`, {
        body: `${game.title} — premiera ${formatDate(release)}`,
        icon: "/Games/icon.svg",
        badge: "/Games/icon.svg",
        tag: notifKey,
        data: { gameId: game.id },
      });
      await markShown(notifKey);
    }
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then(clients => {
      if (clients.length) return clients[0].focus();
      return self.clients.openWindow("/Games/");
    })
  );
});

// ── helpers ──────────────────────────────────────────────────────────────────
function formatDate(d) {
  return d.toLocaleDateString("pl-PL", { day:"numeric", month:"long" });
}

async function getShown(key) {
  try {
    const cache = await caches.open("ps5vault-notifs");
    const r = await cache.match("/" + key);
    return !!r;
  } catch { return false; }
}

async function markShown(key) {
  try {
    const cache = await caches.open("ps5vault-notifs");
    await cache.put("/" + key, new Response("1"));
  } catch {}
}
