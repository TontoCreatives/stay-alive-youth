const CACHE_NAME = 'stay-alive-v12';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/about.html',
  '/series.html',
  '/insights.html',
  '/resources.html',
  '/events.html',
  '/prayer.html',
  '/style.css',
  '/global-offline.js',
  '/manifest.json',
  '/Banner images and logo/bible%20study%20logo.png'
];

// Install Event: Cache the app shell and force immediate activation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Helper: is this a request for our own static shell files
// (HTML/JS/images/fonts on our own domain)? CSS is deliberately
// excluded here — style fixes need to apply immediately, not wait
// for a background cache revalidation cycle.
function isStaticAsset(request) {
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false; // only our own files
  return (
    request.destination === 'document' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font'
  );
}

// Fetch Event:
// - Our own static files (HTML/CSS/JS/images): CACHE-FIRST for an instant,
//   snappy feel — shows the cached version immediately, then quietly
//   fetches a fresh copy in the background to update the cache for next time.
// - Everything else (Sanity, Supabase, any external API): NETWORK-FIRST
//   as before, so devotionals/events/articles always stay fresh, with the
//   cache only used as an offline fallback.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  if (isStaticAsset(event.request)) {
    // CACHE-FIRST with background revalidation (stale-while-revalidate)
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseClone);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse); // if network fails, fall back silently

        // Return the cached version immediately if we have one (instant feel),
        // otherwise wait for the network just this first time.
        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // NETWORK-FIRST for everything else (Sanity, Supabase, external APIs)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200 && (response.type === 'basic' || response.type === 'cors')) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }
          return new Response('', { status: 404, statusText: 'Not Found' });
        });
      })
  );
});

// Push Notification Event Listener
self.addEventListener('push', (event) => {
  let data = { title: 'Stay Alive Fellowship', body: 'New update is ready.' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: '/Banner images and logo/bible%20study%20logo.png',
    badge: '/Banner images and logo/bible%20study%20logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click Event Listener
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});