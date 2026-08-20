const CACHE='san-pedro-sismo-v4-2-20260820';
const CORE=[
  './','./index.html','./styles.css','./app.js','./experience.js','./map.js',
  './data/report-data.js','./data/map-data.js','./manifest.json',
  './assets/logo-san-pedro.jpg','./assets/iglesia-afectada.jpg','./assets/alcaldia.jpg',
  './assets/visual-01-portada.png','./assets/visual-02-panorama.png','./assets/visual-03-vivienda.png','./assets/visual-04-territorio.png',
  './assets/visual-05-poblacion.png','./assets/visual-06-calidad.png','./assets/visual-07-metodologia.png','./assets/visual-08-prioridades.png'
];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const url=new URL(e.request.url);
  if(url.origin!==self.location.origin)return; // no interceptar OpenStreetMap, Google Fonts u otros recursos externos
  e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{
    const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request,copy)); return res;
  }).catch(()=>e.request.mode==='navigate'?caches.match('./index.html'):undefined)));
});
