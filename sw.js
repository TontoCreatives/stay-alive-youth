const CACHE_NAME = 'stay-alive-v5'; // Bumped version to force cache refresh
const SANITY_CACHE = 'stay-alive-sanity-v1';

const assetsToCache = [
  '/',
  '/index.html',
  '/resources.html'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(assetsToCache);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== SANITY_CACHE) {
            console.log('Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Handles local app shell + Sanity API caching
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Handle Sanity API requests (Cache-first or Stale-while-revalidate)
  if (url.hostname.includes('api.sanity.io')) {
    event.respondWith(
      caches.open(SANITY_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          }).catch(() => {
            return cachedResponse;
          });

          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // 2. Handle normal local assets/pages
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});

// Push notification event listener
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'Stay Alive Update', body: 'New content is available!' };
  
  const options = {
    body: data.body,
    icon: '/Banner images and logo/bible%20study%20logo.png',
    badge: '/Banner images and logo/bible%20study%20logo.png',
    vibrate: [200, 100, 200]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});