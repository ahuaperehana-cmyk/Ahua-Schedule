const CACHE_NAME = 'ahua-schedule-v1';
const ASSETS = [
  '/Ahua-Schedule/ahua-schedule-1.html',
  '/Ahua-Schedule/clock.html',
  '/Ahua-Schedule/manifest.json',
  '/Ahua-Schedule/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  // Activate worker immediately after installation
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first strategy: respond from cache, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Optionally cache fetched assets for future use (only GET requests)
        if (event.request.method === 'GET' && response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => {
        // If both cache and network fail, return fallback page
        return caches.match('/Ahua-Schedule/ahua-schedule-1.html');
      });
    })
  );
});
