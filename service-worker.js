const CACHE_NAME = "moodly-mobile-app-ui-v23";
const ASSETS = ["./","./index.html","./style.css","./app.js?v=23","./manifest.webmanifest","./icons/icon-192.png","./icons/icon-512.png"];
self.addEventListener("install", e => {e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS))); self.skipWaiting();});
self.addEventListener("activate", e => {e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))); self.clients.claim();});
self.addEventListener("fetch", e => {if(e.request.method !== "GET") return; e.respondWith(caches.match(e.request).then(c => c || fetch(e.request)));});
