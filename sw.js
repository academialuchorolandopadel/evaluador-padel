const CACHE_NAME = 'padel-categorizacion-v1';
const urlsToCache = [
  'index.html',
  'styles.css',
  'data.js',
  'ejercicios.js',
  'app.js',
  '1000001630.png',
  'manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
