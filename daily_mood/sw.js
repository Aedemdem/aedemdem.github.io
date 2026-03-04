// Service Worker for Focus Dashboard Pro - PWA with Persistent Notifications
const CACHE_NAME = 'focus-dashboard-v3';
const OFFLINE_URL = './index.html';

const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './styles.css',
    './app.js'
];

// Install - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith('http')) return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                    .then((cache) => {
                        cache.put(event.request, responseToCache);
                    });

                return response;
            })
            .catch(() => {
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('Serving from cache:', event.request.url);
                            return cachedResponse;
                        }

                        if (event.request.mode === 'navigate') {
                            return caches.match(OFFLINE_URL);
                        }

                        return new Response('Offline', { status: 503 });
                    });
            })
    );
});

// Handle messages from main app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    // Handle notification click
    if (event.data && event.data.type === 'NOTIFICATION_CLICKED') {
        event.waitUntil(
            clients.openWindow(event.data.url || './index.html')
        );
    }
});

// Notification click handler - opens app when notification is clicked
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    event.waitUntil(
        clients.matchAll({ type: 'window' })
            .then((windowClients) => {
                // Check if there's already a window open
                for (let client of windowClients) {
                    if (client.url === event.notification.data?.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Open new window if none exists
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data?.url || './index.html');
                }
            })
    );
});

// Background sync for mood entries (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-mood') {
        event.waitUntil(syncMoodData());
    }
});

async function syncMoodData() {
    console.log('Syncing mood data...');
}

// Push notification handler for future push capabilities
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'New notification',
        icon: './manifest.json',
        badge: './manifest.json',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        tag: 'focus-dashboard-notification',
        requireInteraction: true
    };

    event.waitUntil(
        self.registration.showNotification('Focus Dashboard', options)
    );
});
