/* eslint-disable no-undef */
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.8.1/firebase-messaging-compat.js");

const CACHE_NAME = "langochung-v1";

const PRECACHE_URLS = [
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/apple-touch-icon.png",
];

let messagingReady = false;

self.addEventListener("message", (event) => {
  if (event.data?.type === "FIREBASE_CONFIG" && !messagingReady) {
    firebase.initializeApp(event.data.config);
    const messaging = firebase.messaging();

    messaging.onBackgroundMessage((payload) => {
      const title = payload.data?.title || "langochungdev";
      const body = payload.data?.body || "";
      const image = payload.data?.image;

      const options = {
        body,
        icon: "/icon-192x192.png",
        badge: "/icon-192x192.png",
        data: payload.data || {},
      };
      if (image) options.image = image;

      self.registration.showNotification(title, options);
    });

    messagingReady = true;
  }
});

self.addEventListener("push", (event) => {
  if (messagingReady) return;
  if (!event.data) return;

  try {
    const payload = event.data.json();
    const title = payload.data?.title || payload.notification?.title || "langochungdev";
    const body = payload.data?.body || payload.notification?.body || "";
    const image = payload.data?.image || payload.notification?.image;

    const options = {
      body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: payload.data || {},
    };
    if (image) options.image = image;

    event.waitUntil(
      self.registration.showNotification(title, options),
    );
  } catch (_) {}
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin/")) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response.ok && url.origin === self.location.origin) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
