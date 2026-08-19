const CACHE_NAME = 'stay-alive-v1';
const assetsToCache = [
  '/',
  '/index.html',
  '/prayer.html',
  '/resources.html',
  '/style.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});