const CACHE_NAME = "pulse-of-kigezi-v6";
const OFFLINE_URL = "/";

const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/placeholder-news.svg",
  "/placeholder-tourism.svg",
];

// Install - Precache critical assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
  self.skipWaiting();
});

// Activate - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch - Network first with cache fallback
self.addEventListener("fetch", (event) => {
  // Never cache Next build artifacts (they change frequently and cause ChunkLoadError)
  if (event.request.url.includes("/_next/")) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Navigation requests - network only, no fallbacks
  if (event.request.mode === "navigate") {
    return;
  }

  // API requests - network only with timeout
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({ error: "Offline - content unavailable" }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // Static assets - cache first, network fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update cache in background
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse.clone());
              });
            }
          })
          .catch(() => {});
        return cachedResponse;
      }

      // Not in cache - fetch from network
      return fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Return offline placeholder for images
          if (event.request.destination === "image") {
            return caches.match("/placeholder-news.svg");
          }
        });
    })
  );
});

// ============================================
// PUSH NOTIFICATIONS
// ============================================

// Handle push events (notifications from server)
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || "New article available!",
    icon: data.icon || "/android-chrome-192x192.png",
    badge: data.badge || "/android-chrome-192x192.png",
    tag: data.tag || "new-article",
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: "open",
        title: "Read Now",
      },
      {
        action: "close",
        title: "Dismiss",
      },
    ],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || "Pulse of Kigezi",
      options
    )
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  const url = notificationData.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url === url && "focus" in client) {
            return client.focus();
          }
        }
        // Open new window if none exists
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

// Handle notification close (for analytics)
self.addEventListener("notificationclose", (event) => {
  // Could send analytics here
  console.log("Notification closed", event.notification.tag);
});

// ============================================
// PERIODIC BACKGROUND SYNC (for fresh content)
// ============================================

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "fetch-latest-news") {
    event.waitUntil(fetchLatestNews());
  }
});

async function fetchLatestNews() {
  try {
    const response = await fetch("/api/v1/articles/?limit=5");
    const data = await response.json();

    // Store in cache for offline access
    const cache = await caches.open(CACHE_NAME);
    await cache.put(
      "/api/v1/articles/",
      new Response(JSON.stringify(data))
    );

    // Notify clients about new content
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "NEW_CONTENT_AVAILABLE",
        articles: data.results || data,
      });
    });
  } catch (error) {
    console.error("Failed to fetch latest news:", error);
  }
}

// ============================================
// MESSAGE HANDLING (from main thread)
// ============================================

self.addEventListener("message", (event) => {
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "CHECK_FOR_UPDATES") {
    // Trigger update check
    self.registration.update();
  }
});
