self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('calculadora-store').then((cache) => cache.addAll([
      'index.html',
      'manifest.json',
      'icon-192x192.png',
      'icon-512x512.png'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});