// Offline support.
// - Pages (HTML): network-first, so a new deployment shows up immediately; cache is the offline fallback.
// - Built assets (/assets/*, content-hashed filenames) and gallery images (/bg/*): cache-first. Never change a /bg/ file in place:
//   give changed images a new path (and bump CACHE), or browsers keep the old picture.
const CACHE = 'huangli-v6';
self.addEventListener('install', (e) => { self.skipWaiting(); e.waitUntil(caches.open(CACHE).then((c) => c.addAll(['/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png']))); });
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  const put = (res) => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); } return res; };
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/bg/')) {
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then(put)));
  } else {
    e.respondWith(fetch(req).then(put).catch(() => caches.match(req).then((hit) => hit || caches.match('/'))));
  }
});
