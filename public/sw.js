/* ==============================================================================
 * SHREE MAHAVEER COLLECTIONS — PRODUCTION PROGRESSIVE WEB APP SERVICE WORKER
 * Version: 1.0.0
 * Multi-Tiered Strategy: Cache-First (Assets) | Stale-While-Revalidate (Media) |
 * Network-First (Navigation) | Strictly Network-Only (Checkout, Auth & Payments)
 * ============================================================================== */

const VERSION = 'smc-v1.0.0';
const CACHE_STATIC = `${VERSION}-static`;
const CACHE_IMAGES = `${VERSION}-images`;
const CACHE_PAGES = `${VERSION}-pages`;

const MAX_IMAGE_ENTRIES = 120;

// Essential app shell to precache on installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest.json',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/maskable-icon-512x512.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png'
];

// Sensitive URLs that must NEVER be cached under any circumstances
const SENSITIVE_URL_PATTERNS = [
  /\/checkout/i,
  /\/api\/payment/i,
  /\/api\/checkout/i,
  /\/api\/auth/i,
  /\/api\/user/i,
  /\/orders\/create/i,
  /razorpay/i,
  /stripe/i,
  /paypal/i
];

/**
 * Check if a request URL matches any sensitive non-cacheable routes
 */
function isSensitiveRequest(url) {
  return SENSITIVE_URL_PATTERNS.some((pattern) => pattern.test(url));
}

/**
 * Trim cache to maintain size boundaries (LRU purge)
 */
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      await trimCache(cacheName, maxItems);
    }
  } catch (err) {
    console.warn('[PWA SW] Cache trim error:', err);
  }
}

// -----------------------------------------------------------------------------
// LIFECYCLE: INSTALL
// -----------------------------------------------------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      console.log('[PWA SW] Installing Shree Mahaveer Collections Service Worker version:', VERSION);
      const cache = await caches.open(CACHE_STATIC);
      try {
        await cache.addAll(PRECACHE_ASSETS);
      } catch (err) {
        console.warn('[PWA SW] Precache partial error (ignored for non-critical assets):', err);
      }
      return self.skipWaiting();
    })()
  );
});

// -----------------------------------------------------------------------------
// LIFECYCLE: ACTIVATE (CACHE ROTATION & CLEANUP)
// -----------------------------------------------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      console.log('[PWA SW] Activating Shree Mahaveer Collections Service Worker...');
      const allowedCaches = [CACHE_STATIC, CACHE_IMAGES, CACHE_PAGES];
      const cacheKeys = await caches.keys();

      await Promise.all(
        cacheKeys.map((key) => {
          if (!allowedCaches.includes(key)) {
            console.log('[PWA SW] Deleting obsolete cache bucket:', key);
            return caches.delete(key);
          }
          return null;
        })
      );

      // Take immediate control of all open clients
      await self.clients.claim();
      console.log('[PWA SW] Clients claimed and active.');
    })()
  );
});

// -----------------------------------------------------------------------------
// RUNTIME FETCH DISPATCHER
// -----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Strict Security Rule: Never touch non-GET requests (POST, PUT, DELETE, etc.)
  if (request.method !== 'GET') {
    return;
  }

  // 2. Strict Security Rule: Never cache payment, checkout, or auth endpoints
  if (isSensitiveRequest(url.pathname) || isSensitiveRequest(url.href)) {
    return;
  }

  // 3. Navigation Requests (HTML Pages): Network-First with Offline Fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Attempt network fetch
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_PAGES);
            cache.put(request, networkResponse.clone());
            return networkResponse;
          }
          return networkResponse;
        } catch (err) {
          console.log('[PWA SW] Navigation offline, checking cache for:', request.url);
          // Try cached version of this exact page
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }

          // Try cached index.html for Single Page App client-side routing
          const cachedIndex = await caches.match('/index.html');
          if (cachedIndex) {
            return cachedIndex;
          }

          // Fallback to custom branded offline page
          const offlineFallback = await caches.match('/offline.html');
          if (offlineFallback) {
            return offlineFallback;
          }

          return new Response('Network offline', { status: 503, statusText: 'Service Unavailable' });
        }
      })()
    );
    return;
  }

  // 4. Product, Banner and Brand Images
  const isImageRequest =
    request.destination === 'image' ||
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|gif|avif)$/i);

  if (isImageRequest) {
    event.respondWith(
      (async () => {
        // Stale-While-Revalidate: Return cached image immediately, refresh in background
        const cachedImage = await caches.match(request);
        const fetchPromise = fetch(request)
          .then(async (networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const cache = await caches.open(CACHE_IMAGES);
              await cache.put(request, networkResponse.clone());
              trimCache(CACHE_IMAGES, MAX_IMAGE_ENTRIES);
            }
            return networkResponse;
          })
          .catch(() => null);

        return cachedImage || fetchPromise;
      })()
    );
    return;
  }

  // 5. Static Assets (Vite CSS, JS chunks, Web Fonts)
  const isStaticAsset =
    url.pathname.startsWith('/assets/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.match(/\.(js|css|woff2?|ttf|eot)$/i);

  if (isStaticAsset) {
    event.respondWith(
      (async () => {
        // Cache-First with Network Revalidation
        const cachedAsset = await caches.match(request);
        if (cachedAsset) {
          // Revalidate in background without blocking render
          fetch(request)
            .then(async (networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                const cache = await caches.open(CACHE_STATIC);
                cache.put(request, networkResponse);
              }
            })
            .catch(() => {});
          return cachedAsset;
        }

        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            const cache = await caches.open(CACHE_STATIC);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return new Response('', { status: 408, statusText: 'Asset Fetch Failed' });
        }
      })()
    );
    return;
  }

  // Default passthrough with standard network attempt
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request);
    })
  );
});

// -----------------------------------------------------------------------------
// WORKER MESSAGE BUS (SKIP_WAITING & CACHE_CLEAR)
// -----------------------------------------------------------------------------
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[PWA SW] Skipping waiting and taking control on demand.');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_OLD_CACHES') {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (!key.startsWith(VERSION)) {
          caches.delete(key);
        }
      });
    });
  }
});
