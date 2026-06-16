// Facciolini Mobility - Service Worker v6.0
const CACHE_NAME = 'fm-v6-0';
const ASSETS = ['./', './index.html', './manifest.json'];

// Installation - mise en cache
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // Active immédiatement la nouvelle version
});

// Activation - supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim()) // Prend le contrôle de tous les onglets
  );
});

// Fetch - network first, cache fallback
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre à jour le cache avec la nouvelle version
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Message de mise à jour
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
