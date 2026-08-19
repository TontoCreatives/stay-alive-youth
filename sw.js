const CACHE_NAME = 'stay-alive-v3'; // Bumped version to clear old broken cache
const assetsToCache = [
  '/',
  '/index.html',
  '/prayer.html',
  '/resources.html',
  '/style.css'
];

// Install event - caches core files and forces skip waiting
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event - instantly wipes out old bugged caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Always try network first for live code updates, fallback to cache if offline
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests or cross-origin calls (like Sanity/Google APIs)
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // If network succeeds, return the fresh file
        return networkResponse;
      })
      .catch(() => {
        // If offline or network fails, safely fall back to the cache
        return caches.match(event.request);
      })
  );
});

// Push notification event listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Stay Alive Update', body: 'New content is available!' };
  
  const options = {
    body: data.body,
    icon: '/manifest.json',
    badge: '/manifest.json',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click (opens the app when tapped)
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});