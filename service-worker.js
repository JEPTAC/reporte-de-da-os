const CACHE='san-pedro-sismo-v1';
const ASSETS=['./','./index.html','./styles.css','./app.js','./data/report-data.js','./assets/logo-san-pedro.png','./assets/iglesia-afectada.jpeg','./assets/alcaldia.jpeg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match('./index.html')))));
