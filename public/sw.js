// Service Worker for PWA - Party OS v2
// Enhanced offline support for crowded Wi-Fi environments

const CACHE_NAME = 'party-os-v2';
const STATIC_CACHE = 'party-os-static-v2';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/manifest.json',
  '/favicon.svg',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/apple-touch-icon.svg',
  '/sounds/silent.mp3',
  '/sounds/unlock.mp3',
  '/sounds/winner.mp3',
];

// Routes to cache
const ROUTES_TO_CACHE = [
  '/',
  '/join',
  '/party/join',
  '/party/dashboard',
];

// Install event - cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(STATIC_ASSETS.filter(url => !url.startsWith('/sounds/'))).catch(() => {
          console.log('Some static assets not available yet');
        });
      }),
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(ROUTES_TO_CACHE).catch(() => {
          console.log('Some routes not available yet');
        });
      }),
    ])
  );
  // Force the waiting service worker to become active
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Take control of all pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - Network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes and external requests
  if (url.pathname.startsWith('/api/') || url.origin !== location.origin) {
    return;
  }

  // For static assets, use cache-first strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // For pages, use network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request).then((cached) => {
          if (cached) return cached;
          // Return offline page if available
          return caches.match('/').then((home) => home || new Response('Offline', { status: 503 }));
        });
      })
  );
});

// Helper to check if request is for static asset
function isStaticAsset(pathname) {
  return (
    pathname.startsWith('/icons/') ||
    pathname.startsWith('/sounds/') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname === '/manifest.json' ||
    pathname === '/favicon.svg'
  );
}
});
