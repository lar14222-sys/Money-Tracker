const CACHE_NAME = 'money-tracker-v2';
const assetsToCache = [
    'index.html',
    'manifest.json',
    'i18n.js',
    'catedit.js',
    'features.js'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(assetsToCache);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request);
        })
    );
});
