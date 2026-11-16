
const CACHE_NAME = 'gi-smart-pond-v10';
const APP_SHELL = [
  './',
  './index.html'
];

// Install service worker and cache the app shell.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      for (const url of APP_SHELL) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn('App shell cache skipped:', url, error);
        }
      }
    })
  );

  self.skipWaiting();
});

// Activate and remove old application caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name.startsWith('gi-smart-pond-'))
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );

  self.clients.claim();
});

// Handle same-origin navigation and static asset requests.
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Only handle GET requests from this application origin.
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Navigation: network first, cached app shell as fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put('./index.html', copy);
            });
          }

          return response;
        })
        .catch(async () => {
          return (
            await caches.match('./index.html')
          ) || Response.error();
        })
    );

    return;
  }

  // Static assets: cache first, then network.
  const isStaticAsset =
    url.pathname.includes('/assets/') ||
    /\.(css|js|svg|png|jpg|jpeg|webp|woff2?)$/i.test(
      url.pathname
    );

  if (!isStaticAsset) {
    return;
  }

  // Network first so new deployments replace stale CSS/JS immediately.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, copy);
          });
        }
        return response;
      })
      .catch(async () => {
        return (await caches.match(request)) || Response.error();
      })
  );
});
