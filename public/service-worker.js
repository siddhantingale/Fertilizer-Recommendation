const CACHE_NAME = "fertilizerpro-v1"
const STATIC_ASSETS = ["/", "/dashboard", "/farms", "/soil-test", "/disease-scanner", "/calculator", "/offline.html"]

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[v0] Service Worker installing...")
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[v0] Caching static assets")
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log("[v0] Cache addAll error:", err)
        // Continue even if some assets fail to cache
        return Promise.resolve()
      })
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[v0] Service Worker activating...")
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("[v0] Deleting old cache:", cacheName)
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== "GET") {
    return
  }

  // Skip external API calls (weather, location, etc.)
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response for failed API calls
        return new Response(JSON.stringify({ error: "Offline - API unavailable" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      }),
    )
    return
  }

  // Cache-first strategy for static assets
  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style" ||
    request.destination === "script"
  ) {
    event.respondWith(
      caches.match(request).then((response) => {
        return (
          response ||
          fetch(request).then((response) => {
            // Cache successful responses
            if (response.ok) {
              const cache = caches.open(CACHE_NAME)
              cache.then((c) => c.put(request, response.clone()))
            }
            return response
          })
        )
      }),
    )
    return
  }

  // Network-first strategy for HTML pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (response.ok) {
          const cache = caches.open(CACHE_NAME)
          cache.then((c) => c.put(request, response.clone()))
        }
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then((response) => {
          return response || new Response("Offline - Page not available", { status: 503 })
        })
      }),
  )
})

// Background sync for offline data
self.addEventListener("sync", (event) => {
  console.log("[v0] Background sync triggered:", event.tag)
  if (event.tag === "sync-disease-scans") {
    event.waitUntil(syncDiseaseScans())
  }
})

async function syncDiseaseScans() {
  try {
    // Get offline disease scans from IndexedDB or localStorage
    const offlineScans = JSON.parse(localStorage.getItem("offline_disease_scans") || "[]")

    if (offlineScans.length > 0) {
      console.log("[v0] Syncing", offlineScans.length, "offline disease scans")
      // Send to server
      for (const scan of offlineScans) {
        await fetch("/api/disease-scans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(scan),
        })
      }
      // Clear offline scans after successful sync
      localStorage.removeItem("offline_disease_scans")
      console.log("[v0] Disease scans synced successfully")
    }
  } catch (error) {
    console.log("[v0] Background sync error:", error)
    throw error
  }
}

// Message handler for client communication
self.addEventListener("message", (event) => {
  console.log("[v0] Service Worker received message:", event.data)

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    caches.delete(CACHE_NAME).then(() => {
      console.log("[v0] Cache cleared")
    })
  }
})
