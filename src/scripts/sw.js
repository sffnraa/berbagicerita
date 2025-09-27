import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BASE_URL } from './config';

// Do precaching
const manifest = self.__WB_MANIFEST;
precacheAndRoute(manifest);

// Runtime caching
registerRoute(
  ({ url }) => {
    return url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';
  },
  new CacheFirst({
    cacheName: 'google-fonts',
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin === 'https://cdnjs.cloudflare.com' || url.origin.includes('fontawesome');
  },
  new CacheFirst({
    cacheName: 'fontawesome',
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin === 'https://ui-avatars.com';
  },
  new CacheFirst({
    cacheName: 'avatars-api',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination !== 'image';
  },
  new NetworkFirst({
    cacheName: 'story-api',
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL(BASE_URL);
    return baseUrl.origin === url.origin && request.destination === 'image';
  },
  new StaleWhileRevalidate({
    cacheName: 'story-api-images',
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin.includes('maptiler');
  },
  new CacheFirst({
    cacheName: 'maptiler-api',
  }),
);

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // Cek permintaan untuk API Dicoding
  if (url.origin === 'https://story-api.dicoding.dev') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        if (cachedResponse) {
          console.log("Service Worker: Mengambil dari cache:", request.url);
          return cachedResponse;
        }
        console.log("Service Worker: Mengambil dari network:", request.url);
        try {
          const networkResponse = await fetch(request);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          console.error("Service Worker: Gagal mengambil dari network.", error);
          throw error; 
        }
      })
    );
    return; 
  }
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request);
    })
  );
});

self.addEventListener('push', (event) => {
  console.log('Push event diterima');

  const data = event.data.json();
  const title = data.title || 'Berbagi Cerita';
  const options = {
    body: data.options?.body || 'Ada cerita baru untukmu!',
    icon: '/icons/icon-x192.png',
    badge: '/icons/icon-x72.png',
    data: {
      url: data.options?.url || '/', 
    },
    actions: [
      { action: 'open_detail', title: 'Lihat Detail' },
      { action: 'dismiss', title: 'Tutup' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'open_detail') {
    // buka halaman detail terkait
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  } else {
    // default klik notif
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});