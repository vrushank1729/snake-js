const CACHE_NAME = 'snake-game-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',   // add if you have CSS file
  '/js/game.js',   // your main JS file name
  // add other assets you want cached (images, fonts, etc.)
];

// Cache files on install
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
