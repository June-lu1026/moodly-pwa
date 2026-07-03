const CACHE_NAME = "moodly-ai-final-v1";
const ASSETS = ["./", "./index.html", "./style.css", "./app.js", "./manifest.json"];

self.addEventListener("install", function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.addAll(ASSETS); }));
  self.skipWaiting();
});

self.addEventListener("activate", function(event) {
  event.waitUntil(caches.keys().then(function(keys) {
    return Promise.all(keys.map(function(key) { return key !== CACHE_NAME ? caches.delete(key) : null; }));
  }));
  self.clients.claim();
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(function(cached) {
    return cached || fetch(event.request);
  }));
});
