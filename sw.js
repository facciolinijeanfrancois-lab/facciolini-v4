// Facciolini Mobility - Service Worker v6.1
const CACHE_NAME = 'fm-v6-1';
const ASSETS = ['./', './index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

// Notifications push
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Facciolini Mobility', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-96.png',
      tag: data.tag || 'fm-notif',
      data: data.url || '/',
      vibrate: [200, 100, 200]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data || '/'));
});

self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
  // Planifier les notifications locales
  if(e.data?.type === 'schedule-notifs'){
    scheduleNotifications(e.data.courses, e.data.settings);
  }
});

// Notification locale via setTimeout (fonctionne en arrière-plan)
async function scheduleNotifications(courses, settings){
  // Cette fonction est appelée depuis l'app principale
  // Les notifs sont gérées côté client avec Notification API
}
