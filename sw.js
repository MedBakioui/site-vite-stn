// STN Service Worker — Smart Caching Strategy
// v2 — Network-first for HTML, Cache-first for static assets

const VERSION = 'v3-2026-05';
const STATIC_CACHE = `stn-static-${VERSION}`;
const RUNTIME_CACHE = `stn-runtime-${VERSION}`;

// Pre-cache critical assets on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/script.js',
    '/Gemini_Generated_Image_twog1rtwog1rtwog.png',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
            .catch(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
                .map((k) => caches.delete(k))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    if (req.method !== 'GET') return;

    const url = new URL(req.url);

    // Cross-origin: cache-first for fonts/leaflet tiles, network otherwise
    if (url.origin !== self.location.origin) {
        if (url.host.includes('fonts.') || url.host.includes('basemaps.cartocdn.com') || url.host.includes('unpkg.com')) {
            event.respondWith(cacheFirst(req, RUNTIME_CACHE));
        }
        return;
    }

    // HTML pages: network-first (so updates are picked up fast)
    if (req.mode === 'navigate' || req.destination === 'document') {
        event.respondWith(networkFirst(req, RUNTIME_CACHE));
        return;
    }

    // CSS, JS, images, fonts: cache-first (instant after first load)
    if (['style', 'script', 'image', 'font'].includes(req.destination)) {
        event.respondWith(cacheFirst(req, STATIC_CACHE));
        return;
    }

    // Default: network-first with cache fallback
    event.respondWith(networkFirst(req, RUNTIME_CACHE));
});

async function cacheFirst(req, cacheName) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        if (res && res.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(req, res.clone());
        }
        return res;
    } catch (e) {
        return cached || new Response('Offline', { status: 503 });
    }
}

async function networkFirst(req, cacheName) {
    try {
        const res = await fetch(req);
        if (res && res.status === 200) {
            const cache = await caches.open(cacheName);
            cache.put(req, res.clone());
        }
        return res;
    } catch (e) {
        const cached = await caches.match(req);
        return cached || new Response('Offline', { status: 503 });
    }
}
