(() => {
  'use strict';
  const D=window.REPORT_DATA, G=window.TERRITORY_MAP_DATA||[];
  const $=(s,r=document)=>r.querySelector(s);
  const fmt=n=>new Intl.NumberFormat('es-CO').format(n);
  const pct=n=>`${Number(n).toFixed(1).replace('.',',')}%`;
  let map, layerGroup, currentNames=new Set(D.territories.map(t=>t.sector)), priorityOnly=false;
  const markerBySector=new Map();

  function dataFor(name){return D.territories.find(t=>t.sector===name)}
  function geoFor(name){return G.find(g=>g.sector===name)}
  function priority(t){return (t?.noHab||0)+(t?.destroyed||0)}
  function rate(t){return t?.families?priority(t)/t.families*100:0}
  function markerColor(t){const r=rate(t);return r>=35?'#e43e51':r>=18?'#ff8a33':priority(t)>0?'#f6c442':'#1a8bc8'}

  function popupHTML(g,t){
    const status=g.precision==='verified'?'Referencia cartográfica verificada':'Referencia aproximada';
    const badge=g.precision==='verified'?'verified':'reference';
    return `<div class="map-popup-card">
      <div class="map-popup-top"><span class="map-popup-status ${badge}">${status}</span><span class="map-popup-rate">${pct(rate(t))} prioridad*</span></div>
      <h3>${g.sector}</h3><p class="map-popup-reference">${g.reference}</p>
      <div class="map-popup-grid"><div><strong>${fmt(t.families)}</strong><span>familias</span></div><div><strong>${fmt(t.people)}</strong><span>personas</span></div><div class="warn"><strong>${fmt(priority(t))}</strong><span>prioridad</span></div><div><strong>${fmt(t.noState)}</strong><span>sin estado</span></div></div>
      <div class="map-popup-detail"><span>No habitable <b>${fmt(t.noHab)}</b></span><span>Destruida <b>${fmt(t.destroyed)}</b></span><span>Núcleos vacíos <b>${fmt(t.empty)}</b></span></div>
      <small>${g.source}</small>
      <div class="map-popup-actions"><button type="button" class="map-popup-open" data-map-open-sector="${g.sector}">Abrir ficha territorial →</button><a class="map-popup-osm" href="https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=16/${g.lat}/${g.lng}" target="_blank" rel="noopener">Referencia OSM ↗</a></div>
    </div>`;
  }

  function addMarker(g,t){
    const isRef=g.precision!=='verified';
    const radius=Math.max(8,Math.min(19,7+Math.sqrt(Math.max(1,t.families))*1.2));
    const m=L.circleMarker([g.lat,g.lng],{radius,fillColor:markerColor(t),fillOpacity:.88,color:isRef?'#ffffff':'#073e67',weight:isRef?2.5:3,dashArray:isRef?'5 4':null});
    m.bindTooltip(g.sector,{direction:'top',offset:[0,-radius],className:`territory-map-tooltip ${isRef?'is-reference':''}`,opacity:.96});
    m.bindPopup(popupHTML(g,t),{maxWidth:330,minWidth:275,className:'territory-popup'});
    m.on('popupopen',()=>{
      setTimeout(()=>{
        const btn=[...document.querySelectorAll('[data-map-open-sector]')].find(b=>b.dataset.mapOpenSector===g.sector);
        btn?.addEventListener('click',()=>window.openSectorDrawer?.(g.sector),{once:true});
      },0);
    });
    m.on('click',()=>highlightIndex(g.sector));
    m.addTo(layerGroup); markerBySector.set(g.sector,m);
  }

  function renderMarkers(){
    if(!map)return;
    layerGroup.clearLayers(); markerBySector.clear();
    G.forEach(g=>{
      const t=dataFor(g.sector); if(!t||!currentNames.has(g.sector))return;
      if(priorityOnly&&priority(t)===0)return;
      addMarker(g,t);
    });
    renderIndex();
  }

  function renderIndex(){
    const host=$('#mapReferenceList'); if(!host)return;
    const q=($('#mapSectorSearch')?.value||'').trim().toLowerCase();
    const rows=G.filter(g=>currentNames.has(g.sector)).filter(g=>!priorityOnly||priority(dataFor(g.sector))>0).filter(g=>!q||`${g.sector} ${g.reference}`.toLowerCase().includes(q));
    host.innerHTML=rows.map(g=>{const t=dataFor(g.sector);return `<button class="map-reference-row" data-map-sector="${g.sector}"><i class="map-pin-code ${g.precision==='verified'?'verified':'reference'}"></i><span><b>${g.sector}</b><small>${g.reference}</small></span><em><strong>${fmt(t.families)}</strong><small>fam.</small></em><em class="priority"><strong>${fmt(priority(t))}</strong><small>prio.</small></em></button>`}).join('')||'<div class="map-index-empty">No hay localizaciones que coincidan con los filtros.</div>';
    host.querySelectorAll('[data-map-sector]').forEach(b=>b.addEventListener('click',()=>focusSector(b.dataset.mapSector,true)));
  }

  function highlightIndex(name){
    document.querySelectorAll('.map-reference-row').forEach(b=>b.classList.toggle('active',b.dataset.mapSector===name));
    const active=[...document.querySelectorAll('.map-reference-row[data-map-sector]')].find(b=>b.dataset.mapSector===name); active?.scrollIntoView({block:'nearest',behavior:'smooth'});
  }

  function focusSector(name,open=true){
    const m=markerBySector.get(name),g=geoFor(name); if(!map||!g)return;
    map.flyTo([g.lat,g.lng],Math.max(map.getZoom(),14),{duration:.65});
    highlightIndex(name);
    if(m&&open)setTimeout(()=>m.openPopup(),450);
  }

  function fitAll(){
    if(!map)return; const pts=[...markerBySector.values()].map(m=>m.getLatLng()); if(!pts.length)return;
    map.fitBounds(L.latLngBounds(pts).pad(.12),{animate:true,duration:.65,maxZoom:13});
  }

  function initMap(){
    const host=$('#territoryMap'); if(!host)return;
    if(!window.L){host.innerHTML='<div class="map-fallback"><b>Mapa no disponible sin conexión.</b><span>El índice territorial y el resto del explorador siguen funcionando.</span></div>';return;}
    map=L.map(host,{zoomControl:true,scrollWheelZoom:true,preferCanvas:true}).setView([3.985,-76.215],12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:18,attribution:'&copy; OpenStreetMap contributors'}).addTo(map);
    layerGroup=L.layerGroup().addTo(map);
    renderMarkers(); fitAll();
    $('#mapFitAll')?.addEventListener('click',fitAll);
    $('#mapShowPriority')?.addEventListener('click',e=>{priorityOnly=!priorityOnly;e.currentTarget.classList.toggle('active',priorityOnly);e.currentTarget.textContent=priorityOnly?'Mostrar todos':'Sólo con prioridad';renderMarkers();fitAll()});
    $('#mapSectorSearch')?.addEventListener('input',renderIndex);
    setTimeout(()=>map.invalidateSize(),200);
  }

  window.updateTerritoryMap=(arr)=>{currentNames=new Set((arr||D.territories).map(t=>t.sector));renderMarkers()};
  window.refreshTerritoryMap=()=>{if(map){map.invalidateSize();setTimeout(fitAll,80)}};
  window.focusTerritoryMap=focusSector;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initMap);else initMap();
})();
