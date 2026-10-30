const VERSION = 'balance-v7'

self.addEventListener('install', e => {
  self.skipWaiting()
})

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== VERSION).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  // Solo cachear recursos propios; dejar pasar requests a APIs externas sin interferir
  if (!e.request.url.startsWith(self.location.origin)) return

  e.respondWith(
    caches.open(VERSION).then(cache =>
      fetch(e.request)
        .then(res => {
          if (res.ok) cache.put(e.request, res.clone())
          return res
        })
        .catch(() => cache.match(e.request))
    )
  )
})
