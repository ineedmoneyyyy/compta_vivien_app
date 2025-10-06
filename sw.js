const CACHE_NAME = "inr-saisie-v3"; // ⬅️ change le numéro à chaque fois
const ASSETS = [
  "./",
  "index.html",
  "app.js",
  "manifest.webmanifest",
  "logo1.png",
  "go.gif"
];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", e=>{
  const req = e.request;
  e.respondWith(
    caches.match(req).then(res=> res || fetch(req))
  );
});
