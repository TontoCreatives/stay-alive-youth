const CACHE_NAME = 'stay-alive-v7'; // Bumped version for offline UI update
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
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If offline and navigating to a page, render animated offline screen
          if (event.request.mode === 'navigate') {
            return new Response(
              `<!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Stay Alive - Offline Mode</title>
                <script src="https://cdn.tailwindcss.com"></script>
              </head>
              <body class="bg-zinc-950 text-white flex items-center justify-center h-screen p-4 selection:bg-emerald-500 selection:text-white">
                <div class="text-center space-y-5 max-w-sm w-full bg-zinc-900/90 border border-zinc-800/80 p-8 rounded-3xl shadow-2xl backdrop-blur-xl relative overflow-hidden">
                  
                  <!-- Subtle background ambient glow -->
                  <div class="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

                  <!-- Animated Icon Container -->
                  <div class="relative w-16 h-16 mx-auto flex items-center justify-center">
                    <div class="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping"></div>
                    <div class="relative w-16 h-16 rounded-2xl bg-zinc-950 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
                      📡
                    </div>
                  </div>

                  <div class="space-y-2">
                    <h2 class="font-bold text-lg tracking-tight text-white">You're Offline</h2>
                    <p class="text-xs text-zinc-400 leading-relaxed">
                      No active internet connection detected. Your cached study materials and saved preferences will reappear automatically once you're back online.
                    </p>
                  </div>

                  <button onclick="window.location.reload()" class="w-full py-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold rounded-xl text-xs transition-all shadow-lg shadow-emerald-900/20 cursor-pointer">
                    Retry Connection
                  </button>
                  
                  <p class="text-[10px] text-zinc-600 tracking-wider uppercase font-medium">Stay Alive Bible Study</p>
                </div>
              </body>
              </html>`,
              { headers: { 'Content-Type': 'text/html' } }
            );
          }
        });
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