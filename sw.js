// The Warded House — Service Worker
// Caches app shell for fast repeat loads and basic offline support
const CACHE = 'warded-house-v1';
const SHELL = [
  '/warded-house/',
  '/warded-house/index.html',
];

// Install: cache the app shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

// Activate: clean up old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fall back to cache for navigation requests
self.addEventListener('fetch', e => {
  // Only handle same-origin requests
  if (!e.request.url.startsWith(self.location.origin)) return;

  // For navigation (page loads): network first, cache fallback
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          // Update cache with fresh response
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match('/warded-house/index.html'))
    );
    return;
  }

  // For other requests: cache first (fonts, etc)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
