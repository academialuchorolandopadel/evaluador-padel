const CACHE_NAME = 'padel-categorizacion-v4';
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
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
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
    fetch(event.request)
      .then(response => {
        // Actualizar la caché con la nueva respuesta
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Si no hay conexión, usar la caché
        return caches.match(event.request);
      })
  );
});
