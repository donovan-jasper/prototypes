// Service Worker for PWA functionality
const CACHE_NAME = 'codecapsule-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/bundle.js',
  '/manifest.json',
  '/icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available, otherwise fetch from network
        return response || fetch(event.request);
      })
  );
});
