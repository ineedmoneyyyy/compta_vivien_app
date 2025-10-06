const CACHE = "inr-saisie-v1";
const ASSETS = ["./","./index.html","./app.js","./manifest.webmanifest","./logo1.png","./go.gif"];

self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});

self.addEventListener("fetch", e=>{
  const {request} = e;
  // Réseau d'abord pour l'API; Cache d'abord pour les assets
  if (request.url.includes("/exec")) return; // laisse passer Apps Script
  e.respondWith(caches.match(request).then(res=>res || fetch(request)));
});
