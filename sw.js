const V = "cd-v1-202611241250";
const SHELL = [
  "./",
  "./index.html",
  "./app.js",
  "./styles.css",
  "./manifest.webmanifest",
  "./foods.svg",
  "./chefs-banner.jpg",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./fonts/fredoka.woff2",
  "./fonts/cinzel-decorative.woff2"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(V).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("cd-") && k !== V).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener("fetch", (e) => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  if (!u.pathname.startsWith("/christmas-dinner/")) return;
  e.respondWith(
    caches.open(V).then((c) =>
      c.match(r, { ignoreSearch: true }).then((m) => {
        const net = fetch(r)
          .then((n) => {
            if (n.ok) c.put(r, n.clone());
            return n;
          })
          .catch(() => m);
        return m || net;
      })
    )
  );
});
