const CACHE_PREFIX = 'celebrationslink-static-'
const CACHE_NAME = `${CACHE_PREFIX}v2`

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(
      keys
        .filter((key) => key === 'celebrationslink-v1' || (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME))
        .map((key) => caches.delete(key)),
    )
    await self.clients.claim()
  })())
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Never intercept non-GET, cross-origin, authentication, or API traffic.
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/rest/') ||
    url.pathname.startsWith('/functions/') ||
    url.pathname.startsWith('/storage/')
  ) {
    return
  }

  // Always ask the server for the latest app shell; never serve cached HTML.
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(fetch(request))
    return
  }

  // Only cache versioned build assets. Other files always go to the network.
  if (!url.pathname.startsWith('/assets/')) return

  event.respondWith((async () => {
    try {
      const response = await fetch(request)
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME)
        await cache.put(request, response.clone())
      }
      return response
    } catch (error) {
      const cached = await caches.match(request)
      if (cached) return cached
      throw error
    }
  })())
})
