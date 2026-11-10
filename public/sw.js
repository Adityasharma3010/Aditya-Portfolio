/*
  Service worker: lets the site install as an app and open offline.
  - navigations: network first, so you always get the latest page; the cached copy is the offline fallback
  - /assets/* (hashed, never change): cache first
  - /api, analytics and other sites are never touched
  BUILD and PRECACHE below are stamped at build time (scripts/vite-seo.mjs), so every deploy gets fresh caches.
*/
const BUILD = "__BUILD__";
const CACHE = `portfolio-${BUILD}`;
const PRECACHE = "__PRECACHE__"; // every page chunk, listed at build time, so any route opens offline

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      const res = await fetch("/", { cache: "reload" });
      await cache.put("/", res.clone());
      // the shell's own scripts and styles, so the first offline visit works
      const html = await res.text();
      const listed = Array.isArray(PRECACHE) ? PRECACHE : [];
      const files = [...new Set([...(html.match(/\/assets\/[^"')\s]+\.(?:js|css)/g) || []), ...listed])];
      await Promise.all(files.map((f) => cache.add(f).catch(() => {})));
    })()
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/_vercel/")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        try {
          const fresh = await fetch(req);
          if (fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        } catch {
          return (await cache.match(req, { ignoreVary: true })) || (await cache.match("/")) || Response.error();
        }
      })()
    );
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(req, { ignoreVary: true }); // module scripts send an Origin header, precached copies did not
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) cache.put(req, res.clone());
        return res;
      })()
    );
  }
});
