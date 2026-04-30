self.__WB_DISABLE_DEV_LOGS = true;

const APP_VERSION = "vedam-pwa-v1";
const APP_SHELL_CACHE = `${APP_VERSION}-shell`;
const APP_RUNTIME_CACHE = `${APP_VERSION}-runtime`;
const APP_SHELL_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/vite.svg",
];

const isSuccessfulResponse = (response) =>
  Boolean(response && response.ok && response.type !== "opaque");

const isStaticAssetRequest = (request, url) =>
  request.destination === "style" ||
  request.destination === "script" ||
  request.destination === "worker" ||
  request.destination === "font" ||
  url.pathname.startsWith("/assets/");

const isImageRequest = (request) => request.destination === "image";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then((cache) => cache.addAll(APP_SHELL_URLS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== APP_SHELL_CACHE &&
              cacheName !== APP_RUNTIME_CACHE
            ) {
              return caches.delete(cacheName);
            }

            return Promise.resolve(false);
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (isSuccessfulResponse(response)) {
            const responseClone = response.clone();
            caches
              .open(APP_RUNTIME_CACHE)
              .then((cache) => cache.put(request, responseClone))
              .catch(() => {});
          }

          return response;
        })
        .catch(async () => {
          const cachedResponse =
            (await caches.match(request)) || (await caches.match("/index.html"));

          if (cachedResponse) {
            return cachedResponse;
          }

          throw new Error("Offline and no cached page available");
        })
    );
    return;
  }

  if (isStaticAssetRequest(request, url)) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (isSuccessfulResponse(response)) {
              const responseClone = response.clone();
              caches
                .open(APP_RUNTIME_CACHE)
                .then((cache) => cache.put(request, responseClone))
                .catch(() => {});
            }

            return response;
          })
          .catch(() => cachedResponse);

        return cachedResponse || networkFetch;
      })
    );
    return;
  }

  if (isImageRequest(request)) {
    event.respondWith(
      caches.match(request).then(async (cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        const response = await fetch(request);

        if (isSuccessfulResponse(response)) {
          const responseClone = response.clone();
          caches
            .open(APP_RUNTIME_CACHE)
            .then((cache) => cache.put(request, responseClone))
            .catch(() => {});
        }

        return response;
      })
    );
    return;
  }

  event.respondWith(
    fetch(request).catch(async () => {
      const cachedResponse = await caches.match(request);
      return (
        cachedResponse ||
        new Response("Offline content is not available for this request.", {
          status: 503,
          statusText: "Offline",
          headers: {
            "Content-Type": "text/plain",
          },
        })
      );
    })
  );
});

self.addEventListener("push", (event) => {
  let payload = {};

  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = {};
  }

  const title = payload.title || "Vedam";
  const options = {
    body: payload.body || "You have a new update",
    icon: payload.icon || "/vite.svg",
    badge: payload.icon || "/vite.svg",
    tag: payload.tag || "vedam-notification",
    data: payload.data || {},
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const relativeUrl = event.notification.data?.url || "/";
  const targetUrl = new URL(relativeUrl, self.location.origin).toString();

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(
      (clients) => {
        const matchingClient = clients.find((client) => {
          try {
            return new URL(client.url).pathname === new URL(targetUrl).pathname;
          } catch {
            return false;
          }
        });

        if (matchingClient) {
          matchingClient.focus();
          if ("navigate" in matchingClient) {
            return matchingClient.navigate(targetUrl);
          }
          return undefined;
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }

        return undefined;
      }
    )
  );
});
