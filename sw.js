/* ====================================================================
   DIGITAL CLASSES - SERVICE WORKER
   Handles: Notifications, Caching, Offline Support
   ==================================================================== */

const CACHE_NAME = "digital-classes-v1.0.0";

// Files to cache on install
const CACHE_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* ====================================================================
   INSTALL EVENT
   ==================================================================== */
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CACHE_FILES).catch(err => {
        console.warn("Cache addAll warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

/* ====================================================================
   ACTIVATE EVENT
   ==================================================================== */
self.addEventListener("activate", (event) => {
  console.log("✅ Service Worker Activated");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🗑️ Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ====================================================================
   FETCH EVENT (Network first, fallback to cache)
   ==================================================================== */
self.addEventListener("fetch", (event) => {
  // Skip non-GET and Firebase requests
  if (event.request.method !== "GET") return;
  const url = event.request.url;
  if (url.includes("firebase") || url.includes("googleapis") || url.includes("gstatic")) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful responses
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone).catch(() => {});
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match("./index.html");
        });
      })
  );
});

/* ====================================================================
   PUSH NOTIFICATION EVENT (FCM)
   ==================================================================== */
self.addEventListener("push", (event) => {
  console.log("🔔 Push received:", event);

  let data = {
    title: "Digital Classes",
    body: "You have a new notification",
    icon: "https://raw.githubusercontent.com/Dev-AmmarAhmed/DIGITAL-CLASSES/a4a25f244fa56db83e669d00a5b3023296ab67a6/icon.png",
    badge: "https://raw.githubusercontent.com/Dev-AmmarAhmed/DIGITAL-CLASSES/a4a25f244fa56db83e669d00a5b3023296ab67a6/icon.png",
    data: { url: "./index.html" }
  };

  try {
    if (event.data) {
      const payload = event.data.json();
      data.title = payload.title || data.title;
      data.body = payload.body || data.body;
      data.data.url = payload.url || data.data.url;
      data.data.type = payload.type || "general";
    }
  } catch (e) {
    console.warn("Push parse error:", e);
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    tag: data.data.type || "dc-notification",
    renotify: true,
    data: data.data,
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Dismiss" }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

/* ====================================================================
   NOTIFICATION CLICK EVENT
   ==================================================================== */
self.addEventListener("notificationclick", (event) => {
  console.log("👆 Notification clicked:", event.action);
  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : "./index.html";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // Check if app already open
      for (let client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

/* ====================================================================
   MESSAGE EVENT (from main app)
   ==================================================================== */
self.addEventListener("message", (event) => {
  console.log("💬 Message from app:", event.data);

  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body, tag, data } = event.data.payload;
    self.registration.showNotification(title, {
      body: body,
      icon: "https://raw.githubusercontent.com/Dev-AmmarAhmed/DIGITAL-CLASSES/a4a25f244fa56db83e669d00a5b3023296ab67a6/icon.png",
      badge: "https://raw.githubusercontent.com/Dev-AmmarAhmed/DIGITAL-CLASSES/a4a25f244fa56db83e669d00a5b3023296ab67a6/icon.png",
      vibrate: [200, 100, 200],
      tag: tag || "dc-msg",
      renotify: true,
      data: data || { url: "./index.html" }
    });
  }

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

/* ====================================================================
   SYNC EVENT (background sync - future use)
   ==================================================================== */
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync:", event.tag);
  if (event.tag === "sync-notifications") {
    event.waitUntil(Promise.resolve());
  }
});

console.log("🚀 Digital Classes Service Worker Loaded");
