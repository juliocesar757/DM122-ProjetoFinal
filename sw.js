const cacheName = 'ufo-v1';
const assetsToCache = [
  'https://code.getmdl.io/1.3.0/material.green-pink.min.css',
  'https://fonts.gstatic.com/s/materialicons/v55/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2',
  'https://cdn.jsdelivr.net/npm/dexie@3.0.3/dist/dexie.mjs',
  'http://fonts.googleapis.com/css?family=Roboto:300,400,500,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  './assets/icons/icon-48x48.png',
  './assets/icons/icon-96x96.png',
  './assets/icons/icon-144x144.png',
  './assets/icons/icon-192x192.png',
  './assets/icons/icon-310x310.png',
  './assets/js/material.min.js',
  './assets/js/UfoService.js',   
  './assets/css/style.css',
  './assets/js/app.js',
  './manifest.json',
  './favicon.ico',
  './index.html',
  './'
];

function removeOldCache(key) {
  if (key !== cacheName) {
    console.log(`[Service Worker] Removing old cache: ${key}`);
    return caches.delete(key);
  }
}

async function cacheCleanup() {
  const keyList = await caches.keys();
  return Promise.all(keyList.map(removeOldCache));
}

async function cacheStaticAssets() {
  const cache = await caches.open(cacheName);
  return cache.addAll(assetsToCache);
}

self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(cacheStaticAssets());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(cacheCleanup());
  return self.clients.claim();
});

async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch (error) {
    const cache = await caches.open(cacheName);
    return cache.match(request);
  }
}

async function cacheFirst(request) {
  try {
    const cache = await caches.open(cacheName);
    const response = await cache.match(request);
    return response || fetch(request);
  } catch (error) {
    console.log(error);
  }
}

self.addEventListener('fetch', event => {
  // console.log('[Service Worker] Fetch event: ' + event.request.url);
  event.respondWith(networkFirst(event.request));
});
