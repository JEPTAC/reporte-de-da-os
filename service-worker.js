const CACHE='rufe-san-pedro-v6-2-admin-tabs-readable-20260820-1705';
const CORE=[
  './','./index.html','./report.html','./styles.css?v=admin-tabs-readable-20260820-1705','./styles.css','./report-print.css','./app.js','./experience.js','./report-print.js','./map.js',
  './firebase-config.js','./firebase-service.js','./manifest.json','./data/report-data.js','./data/map-data.js',
  './assets/logo-san-pedro.jpg','./assets/icon-192.png','./assets/icon-512.png','./assets/alcaldia.jpg','./assets/iglesia-afectada.jpg'
];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
async function networkFirst(request){const cache=await caches.open(CACHE);try{const response=await fetch(request,{cache:'no-store'});if(response&&response.ok)cache.put(request,response.clone());return response}catch(_){return (await cache.match(request))||(await cache.match('./index.html'))}}
async function staleWhileRevalidate(request){const cache=await caches.open(CACHE),cached=await cache.match(request);const fresh=fetch(request).then(response=>{if(response&&response.ok)cache.put(request,response.clone());return response}).catch(()=>null);return cached||await fresh||Response.error()}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return; // Firebase/Google/OSM no son interceptados.
  if(event.request.mode==='navigate'||event.request.destination==='document'){event.respondWith(networkFirst(event.request));return}
  event.respondWith(staleWhileRevalidate(event.request));
});
