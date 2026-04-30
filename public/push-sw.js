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
