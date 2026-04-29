// The Warded House — Service Worker v1777473520
const CACHE = 'warded-house-1777487536';
const SHELL = ['/warded-house/', '/warded-house/index.html'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (!e.request.url.startsWith(self.location.origin)) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then(res => { caches.open(CACHE).then(c => c.put(e.request, res.clone())); return res; }).catch(() => caches.match('/warded-house/index.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request)));
});

// ── Push Notifications ────────────────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  let data;
  try { data = e.data.json(); } catch { data = { title: 'The Warded House', body: e.data.text() }; }
  e.waitUntil(
    self.registration.showNotification(data.title || 'The Warded House', {
      body: data.body || '',
      icon: '/warded-house/icon-192.svg',
      badge: '/warded-house/icon-192.svg',
      tag: data.tag || 'warded-house',
      renotify: true,
      data: { url: data.url || '/warded-house/' }
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const client of list) {
        if (client.url.includes('/warded-house/') && 'focus' in client) return client.focus();
      }
      return clients.openWindow('/warded-house/');
    })
  );
});
