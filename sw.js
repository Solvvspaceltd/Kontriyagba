/* KontriYagba offline cache. The page is always fetched fresh when there is a network (so updates show at once);
   voices, songs, icons and the 3D engine are kept after the first play, so the game opens fast and works on a weak signal. */
const CACHE = 'ky-20';
const KEEP = /\/(voice|music)\/|icon-\d+\.png$|share\.jpg$|manifest\.webmanifest$|three\.min\.js$/;
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  if (r.mode === 'navigate') {
    // the page: network first, the cached copy only when offline
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(r, c)); return res; }).catch(() => caches.match(r).then(m => m || caches.match('./'))));
    return;
  }
  if (KEEP.test(new URL(r.url).pathname) && !r.headers.get('range')) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { if (res.ok && res.status === 200) { const c = res.clone(); caches.open(CACHE).then(ca => ca.put(r, c)); } return res; })));
  }
});
