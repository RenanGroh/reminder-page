/**
 * Service Worker for Daily Reminder App
 * Provides offline functionality and caching
 */

const CACHE_NAME = "daily-reminder-v1";
const STATIC_CACHE_URLS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("Service Worker: Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Caching static assets");
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log("Service Worker: Installation complete");
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("Service Worker: Installation failed", error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("Service Worker: Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("Service Worker: Deleting old cache", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log("Service Worker: Activation complete");
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Handle different types of requests
  if (event.request.destination === "document") {
    // For HTML documents, use cache-first strategy
    event.respondWith(handleDocumentRequest(event.request));
  } else {
    // For other assets, use cache-first strategy
    event.respondWith(handleAssetRequest(event.request));
  }
});

/**
 * Handle document requests (HTML)
 */
async function handleDocumentRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Service Worker: Serving document from cache");
      return cachedResponse;
    }

    // If not in cache, try network
    const networkResponse = await fetch(request);

    // Cache the response for future use
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());

    console.log("Service Worker: Serving document from network and caching");
    return networkResponse;
  } catch (error) {
    console.error("Service Worker: Document request failed", error);

    // Return a basic offline page if available
    const offlineResponse = await caches.match("./index.html");
    if (offlineResponse) {
      return offlineResponse;
    }

    // Last resort: return a minimal HTML response
    return new Response(
      `<!DOCTYPE html>
            <html>
            <head>
                <title>Daily Reminder - Offline</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                        margin: 0;
                        padding: 2rem;
                        background: #f8f9fa;
                        color: #2c3e50;
                        text-align: center;
                    }
                    .offline-message {
                        max-width: 400px;
                        margin: 4rem auto;
                        padding: 2rem;
                        background: white;
                        border-radius: 8px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    }
                    h1 { color: #dc3545; margin-bottom: 1rem; }
                    p { line-height: 1.6; margin-bottom: 1rem; }
                    button {
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 0.75rem 1.5rem;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    button:hover { background: #0056b3; }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <h1>📝 Daily Reminder</h1>
                    <h2>You're Offline</h2>
                    <p>The app couldn't load properly. Please check your internet connection and try again.</p>
                    <button onclick="window.location.reload()">Retry</button>
                </div>
            </body>
            </html>`,
      {
        headers: { "Content-Type": "text/html" },
      }
    );
  }
}

/**
 * Handle asset requests (CSS, JS, etc.)
 */
async function handleAssetRequest(request) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("Service Worker: Serving asset from cache");
      return cachedResponse;
    }

    // If not in cache, try network
    const networkResponse = await fetch(request);

    // Cache the response for future use
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());

    console.log("Service Worker: Serving asset from network and caching");
    return networkResponse;
  } catch (error) {
    console.error("Service Worker: Asset request failed", error);

    // For critical assets, return a fallback
    if (request.url.includes(".css")) {
      return new Response("/* Offline fallback styles */", {
        headers: { "Content-Type": "text/css" },
      });
    }

    if (request.url.includes(".js")) {
      return new Response(
        '// Offline fallback script\nconsole.log("App running in offline mode");',
        {
          headers: { "Content-Type": "application/javascript" },
        }
      );
    }

    // For other assets, return a 404 response
    return new Response("Asset not available offline", {
      status: 404,
      statusText: "Not Found",
    });
  }
}

// Background sync for future enhancement
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    console.log("Service Worker: Background sync triggered");
    // Could be used for cloud backup in the future
  }
});

// Push notifications for future enhancement
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    console.log("Service Worker: Push message received", data);

    const options = {
      body: data.body || "Don't forget to update your daily reminder!",
      icon: "./icon-192.png",
      badge: "./icon-72.png",
      tag: "reminder-notification",
      requireInteraction: true,
      actions: [
        {
          action: "open",
          title: "Open App",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || "Daily Reminder",
        options
      )
    );
  }
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "open" || !event.action) {
    event.waitUntil(clients.openWindow("./"));
  }
});

// Message handling for communication with main app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

console.log("Service Worker: Script loaded");
