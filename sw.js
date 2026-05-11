const CACHE_NAME = 'padel-categorizacion-v5';

// Solo cacheamos archivos estáticos que no cambian
const urlsToCache = [
  '1000001630.png',
  'manifest.json'
];

// Archivos que SIEMPRE se piden frescos a la red
const noCache = [
  'index.html',
  'styles.css',
  'app.js',
  'auth-ui.js',
  'firebase-config.js',
  'data.js',
  'ejercicios.js',
  'sw.js'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  const filename = url.pathname.split('/').pop();

  // Archivos que nunca se cachean: siempre red
  if (noCache.some(f => filename === f || url.pathname.endsWith(f))) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // El resto: cache first
  event.respondWith(
    caches.match(event.request).then(r => r || fetch(event.request))
  );
});
