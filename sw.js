
const CACHE_NAME = "fanuc-macro-reference-v67";
const SHELL = [
  "./?v=67",
  "./index.html",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const req = event.request;
  const page = req.mode === "navigate" || req.destination === "document" || req.url.endsWith("/index.html");
  if (page) {
    event.respondWith(
      fetch(req, {cache:"no-store"})
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(c => c || caches.match("./?v=67") || caches.match("./index.html")))
    );
  } else {
    event.respondWith(caches.match(req).then(c => c || fetch(req)));
  }
});
