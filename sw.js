const CACHE_NAME = 'padel-categorizacion-v3';
const urlsToCache = [
  'index.html',
  'styles.css',
  'data.js',
  'ejercicios.js',
  'app.js',
  'auth-ui.js',
  'firebase-config.js',
  '1000001630.png',
  'manifest.json'
];

self.addEventListener('install', event => {
  // Forzar activación inmediata sin esperar tabs viejas
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  // Borrar todos los caches viejos
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
