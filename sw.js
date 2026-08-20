
const CACHE_NAME = "fanuc-macro-reference-v14";
const APP_SHELL = [
  "./?v=14",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  const request = event.request;
  const page = request.mode === "navigate" ||
               request.destination === "document" ||
               request.url.endsWith("/index.html");

  if (page) {
    event.respondWith(
      fetch(request, {cache:"no-store"})
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(cached =>
          cached || caches.match("./?v=14") || caches.match("./index.html")
        ))
    );
  } else {
    event.respondWith(
      caches.match(request).then(cached =>
        cached || fetch(request).then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
      )
    );
  }
});
