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
// ============================================================
// OFFLINE ACTION QUEUE — IndexedDB + Background Sync
// ============================================================

const OFFLINE_DB_NAME = 'gang-gear-offline-v1';
const OFFLINE_STORE = 'action-queue';

function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(OFFLINE_DB_NAME, 1);
    req.onupgradeneeded = function (e) {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(OFFLINE_STORE)) {
        const store = db.createObjectStore(OFFLINE_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('queuedAt', 'queuedAt', { unique: false });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

async function enqueueOfflineAction(action) {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, 'readwrite');
    tx.objectStore(OFFLINE_STORE).add({ ...action, queuedAt: Date.now(), retries: 0 });
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
  });
}

async function flushOfflineQueue() {
  const db = await openOfflineDB();

  const actions = await new Promise((resolve, reject) => {
    const tx = db.transaction(OFFLINE_STORE, 'readwrite');
    const store = tx.objectStore(OFFLINE_STORE);
    const req = store.getAll();
    req.onsuccess = function () {
      store.clear();
      tx.oncomplete = function () { resolve(req.result); };
    };
    req.onerror = function () { reject(req.error); };
  });

  const failed = [];

  for (const action of actions) {
    try {
      const res = await fetch(action.url, {
        method: action.method || 'POST',
        headers: { 'Content-Type': 'application/json', ...(action.headers || {}) },
        body: JSON.stringify(action.payload),
      });

      if (!res.ok && action.retries < 3) {
        failed.push({ ...action, retries: (action.retries || 0) + 1 });
      }
    } catch {
      if (action.retries < 3) {
        failed.push({ ...action, retries: (action.retries || 0) + 1 });
      }
    }
  }

  // Re-queue failed actions that haven't exceeded retry limit
  if (failed.length > 0) {
    const db2 = await openOfflineDB();
    await new Promise((resolve, reject) => {
      const tx = db2.transaction(OFFLINE_STORE, 'readwrite');
      const store = tx.objectStore(OFFLINE_STORE);
      failed.forEach(function (a) { store.add(a); });
      tx.oncomplete = function () { resolve(); };
      tx.onerror = function () { reject(tx.error); };
    });
  }

  // Notify all open pages that sync completed
  self.clients.matchAll().then(function (clients) {
    clients.forEach(function (client) {
      client.postMessage({ type: 'SYNC_COMPLETE', synced: actions.length - failed.length });
    });
  });
}

// Background Sync handler
self.addEventListener('sync', function (event) {
  if (event.tag === 'gang-gear-sync') {
    event.waitUntil(flushOfflineQueue());
  }
});

// Message handler — pages call this to queue actions while offline
self.addEventListener('message', function (event) {
  if (!event.data) return;

  if (event.data.type === 'QUEUE_ACTION') {
    event.waitUntil(
      enqueueOfflineAction(event.data.action).then(function () {
        // Attempt immediate sync if online
        if (navigator.onLine) {
          return flushOfflineQueue();
        }
      })
    );
  }

  if (event.data.type === 'SYNC_NOW') {
    event.waitUntil(flushOfflineQueue());
  }
});

// ============================================================
// WEB PUSH NOTIFICATION HANDLERS
// ============================================================

// Web Push notification event handlers
self.addEventListener('push', function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Gang Gear Alert';
  const options = {
    body: data.body || 'You have a new squad update.',
    icon: '/icon512_maskable.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200, 100, 200, 100, 200],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
