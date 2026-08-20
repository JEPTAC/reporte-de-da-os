(() => {
  'use strict';
  const D = window.REPORT_DATA;
  const G = window.TERRITORY_MAP_DATA || [];
  const $ = (s, r=document) => r.querySelector(s);
  const fmt = n => new Intl.NumberFormat('es-CO').format(Number(n || 0));
  const pct = n => `${Number(n || 0).toFixed(1).replace('.', ',')}%`;

  let currentNames = new Set(D.territories.map(t => t.sector));
  let priorityOnly = false;
  let selectedSector = null;
  let currentBounds = null;
  let zoomLevel = 0;
  let iframe, markerHost, popupHost, statusHost;

  const dataFor = name => D.territories.find(t => t.sector === name);
  const geoFor = name => G.find(g => g.sector === name);
  const priority = t => (t?.noHab || 0) + (t?.destroyed || 0);
  const rate = t => t?.families ? priority(t) / t.families * 100 : 0;
  const markerColor = t => {
    const r = rate(t);
    return r >= 35 ? '#E43E51' : r >= 18 ? '#FF8A33' : priority(t) > 0 ? '#F2B82F' : '#1689BF';
  };

  function validRows(){
    return G.filter(g => currentNames.has(g.sector))
      .filter(g => !priorityOnly || priority(dataFor(g.sector)) > 0);
  }

  function boundsFor(rows, padding=.12){
    if (!rows.length) return {minLng:-76.31, minLat:3.90, maxLng:-76.10, maxLat:4.07};
    let minLng=Math.min(...rows.map(g=>g.lng)), maxLng=Math.max(...rows.map(g=>g.lng));
    let minLat=Math.min(...rows.map(g=>g.lat)), maxLat=Math.max(...rows.map(g=>g.lat));
    const lngSpan=Math.max(.018,maxLng-minLng), latSpan=Math.max(.018,maxLat-minLat);
    minLng -= lngSpan*padding; maxLng += lngSpan*padding;
    minLat -= latSpan*padding; maxLat += latSpan*padding;
    return {minLng,minLat,maxLng,maxLat};
  }

  function focusedBounds(g, level=1){
    const scales=[.028,.016,.009,.0055];
    const s=scales[Math.max(0,Math.min(scales.length-1,level))];
    return {minLng:g.lng-s*1.35,minLat:g.lat-s,maxLng:g.lng+s*1.35,maxLat:g.lat+s};
  }

  function shrinkBounds(b, factor=.68){
    const cx=(b.minLng+b.maxLng)/2, cy=(b.minLat+b.maxLat)/2;
    const hw=(b.maxLng-b.minLng)*factor/2, hh=(b.maxLat-b.minLat)*factor/2;
    return {minLng:cx-hw,minLat:cy-hh,maxLng:cx+hw,maxLat:cy+hh};
  }
  function expandBounds(b, factor=1.46){
    const cx=(b.minLng+b.maxLng)/2, cy=(b.minLat+b.maxLat)/2;
    const hw=(b.maxLng-b.minLng)*factor/2, hh=(b.maxLat-b.minLat)*factor/2;
    return {minLng:cx-hw,minLat:cy-hh,maxLng:cx+hw,maxLat:cy+hh};
  }

  function embedUrl(b){
    const bbox=[b.minLng,b.minLat,b.maxLng,b.maxLat].map(n=>n.toFixed(6)).join('%2C');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  }

  function project(g,b){
    const x=((g.lng-b.minLng)/(b.maxLng-b.minLng))*100;
    const y=((b.maxLat-g.lat)/(b.maxLat-b.minLat))*100;
    return {x,y,visible:x>=-3&&x<=103&&y>=-3&&y<=103};
  }

  function popupHTML(g,t){
    const isVerified=g.precision==='verified';
    const status=isVerified?'Referencia cartográfica verificada':'Referencia aproximada';
    return `<button type="button" class="vanilla-map-popup-close" aria-label="Cerrar">×</button>
      <div class="map-popup-card">
        <div class="map-popup-top"><span class="map-popup-status ${isVerified?'verified':'reference'}">${status}</span><span class="map-popup-rate">${pct(rate(t))} prioridad*</span></div>
        <h3>${g.sector}</h3><p class="map-popup-reference">${g.reference}</p>
        <div class="map-popup-grid">
          <div><strong>${fmt(t.families)}</strong><span>familias</span></div>
          <div><strong>${fmt(t.people)}</strong><span>personas</span></div>
          <div class="warn"><strong>${fmt(priority(t))}</strong><span>prioridad</span></div>
          <div><strong>${fmt(t.noState)}</strong><span>sin estado</span></div>
        </div>
        <div class="map-popup-detail"><span>No habitable <b>${fmt(t.noHab)}</b></span><span>Destruida <b>${fmt(t.destroyed)}</b></span><span>Núcleos vacíos <b>${fmt(t.empty)}</b></span></div>
        <small>${g.source}</small>
        <div class="map-popup-actions">
          <button type="button" class="map-popup-open" data-map-open-sector="${g.sector}">Abrir ficha territorial →</button>
          <a class="map-popup-osm" href="https://www.openstreetmap.org/?mlat=${g.lat}&mlon=${g.lng}#map=16/${g.lat}/${g.lng}" target="_blank" rel="noopener">Abrir OSM ↗</a>
        </div>
      </div>`;
  }

  function setBounds(b,{reload=true}={}){
    currentBounds=b;
    if(iframe && reload) iframe.src=embedUrl(b);
    renderMarkers();
    updateStatus();
  }

  function updateStatus(){
    if(!statusHost||!currentBounds)return;
    const count=validRows().filter(g=>project(g,currentBounds).visible).length;
    statusHost.textContent=`${count} referencias visibles · OSM`; 
  }

  function renderMarkers(){
    if(!markerHost||!currentBounds)return;
    markerHost.innerHTML='';
    validRows().forEach(g=>{
      const t=dataFor(g.sector); if(!t)return;
      const p=project(g,currentBounds); if(!p.visible)return;
      const size=Math.max(14,Math.min(25,13+Math.sqrt(Math.max(1,t.families))*1.25));
      const b=document.createElement('button');
      b.type='button';
      b.className=`vanilla-map-marker ${g.precision==='verified'?'verified':'reference'}${selectedSector===g.sector?' active':''}`;
      b.style.setProperty('--x',`${p.x}%`); b.style.setProperty('--y',`${p.y}%`);
      b.style.setProperty('--tone',markerColor(t)); b.style.setProperty('--size',`${size}px`);
      b.setAttribute('aria-label',`${g.sector}: ${t.families} familias, ${priority(t)} casos prioritarios`);
      b.innerHTML=`<span class="marker-label">${g.sector}</span>`;
      b.addEventListener('click',()=>openSector(g.sector,{zoom:false}));
      markerHost.appendChild(b);
    });
    updateStatus();
  }

  function renderIndex(){
    const host=$('#mapReferenceList'); if(!host)return;
    const q=($('#mapSectorSearch')?.value||'').trim().toLowerCase();
    const rows=validRows().filter(g=>!q||`${g.sector} ${g.reference}`.toLowerCase().includes(q));
    host.innerHTML=rows.map(g=>{
      const t=dataFor(g.sector);
      return `<button class="map-reference-row${selectedSector===g.sector?' active':''}" data-map-sector="${g.sector}">
        <i class="map-pin-code ${g.precision==='verified'?'verified':'reference'}"></i>
        <span><b>${g.sector}</b><small>${g.reference}</small></span>
        <em><strong>${fmt(t.families)}</strong><small>fam.</small></em>
        <em class="priority"><strong>${fmt(priority(t))}</strong><small>prio.</small></em>
      </button>`;
    }).join('') || '<div class="map-index-empty">No hay localizaciones que coincidan con los filtros.</div>';
    host.querySelectorAll('[data-map-sector]').forEach(b=>b.addEventListener('click',()=>focusSector(b.dataset.mapSector,true)));
  }

  function highlightIndex(name){
    document.querySelectorAll('.map-reference-row').forEach(b=>b.classList.toggle('active',b.dataset.mapSector===name));
    const active=[...document.querySelectorAll('.map-reference-row[data-map-sector]')].find(b=>b.dataset.mapSector===name);
    active?.scrollIntoView({block:'nearest',behavior:'smooth'});
  }

  function openSector(name,{zoom=false}={}){
    const g=geoFor(name),t=dataFor(name); if(!g||!t||!popupHost)return;
    selectedSector=name;
    if(zoom){ zoomLevel=1; setBounds(focusedBounds(g,1)); }
    else renderMarkers();
    popupHost.innerHTML=popupHTML(g,t);
    popupHost.classList.add('open');
    popupHost.querySelector('.vanilla-map-popup-close')?.addEventListener('click',()=>{
      popupHost.classList.remove('open'); selectedSector=null; renderMarkers(); renderIndex();
    });
    popupHost.querySelector('[data-map-open-sector]')?.addEventListener('click',()=>window.openSectorDrawer?.(name));
    highlightIndex(name); renderIndex();
  }

  function focusSector(name,open=true){
    const g=geoFor(name); if(!g)return;
    selectedSector=name; zoomLevel=1;
    setBounds(focusedBounds(g,1));
    if(open) setTimeout(()=>openSector(name),100);
    highlightIndex(name); renderIndex();
  }

  function fitAll(){
    selectedSector=null; zoomLevel=0;
    popupHost?.classList.remove('open');
    setBounds(boundsFor(validRows(),.14));
    renderIndex();
  }

  function zoomIn(){
    if(!currentBounds)return;
    zoomLevel=Math.min(3,zoomLevel+1); setBounds(shrinkBounds(currentBounds,.64));
  }
  function zoomOut(){
    if(!currentBounds)return;
    zoomLevel=Math.max(0,zoomLevel-1); setBounds(expandBounds(currentBounds,1.55));
  }

  function buildMapShell(host){
    host.innerHTML=`<div class="vanilla-map-shell">
      <iframe class="vanilla-map-frame" title="Mapa base de OpenStreetMap" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div class="vanilla-map-shade" aria-hidden="true"></div>
      <div class="vanilla-map-markers" aria-label="Referencias territoriales"></div>
      <div class="vanilla-map-toolbar" aria-label="Controles del mapa"><button type="button" data-map-zoom="in" aria-label="Acercar">+</button><button type="button" data-map-zoom="out" aria-label="Alejar">−</button><button type="button" data-map-zoom="fit" aria-label="Ver todas las localizaciones">⌂</button></div>
      <div class="vanilla-map-status">Cargando mapa…</div>
      <div class="map-engine-note">Mapa base: © OpenStreetMap contributors · referencias del informe superpuestas localmente</div>
      <div class="vanilla-map-popup" aria-live="polite"></div>
    </div>`;
    iframe=host.querySelector('.vanilla-map-frame');
    markerHost=host.querySelector('.vanilla-map-markers');
    popupHost=host.querySelector('.vanilla-map-popup');
    statusHost=host.querySelector('.vanilla-map-status');
    host.querySelector('[data-map-zoom="in"]')?.addEventListener('click',zoomIn);
    host.querySelector('[data-map-zoom="out"]')?.addEventListener('click',zoomOut);
    host.querySelector('[data-map-zoom="fit"]')?.addEventListener('click',fitAll);
    iframe.addEventListener('load',()=>updateStatus());
  }

  function initMap(){
    const host=$('#territoryMap'); if(!host)return;
    buildMapShell(host);
    currentBounds=boundsFor(validRows(),.14);
    iframe.src=embedUrl(currentBounds);
    renderMarkers(); renderIndex();

    $('#mapFitAll')?.addEventListener('click',fitAll);
    $('#mapShowPriority')?.addEventListener('click',e=>{
      priorityOnly=!priorityOnly;
      e.currentTarget.classList.toggle('active',priorityOnly);
      e.currentTarget.textContent=priorityOnly?'Mostrar todos':'Sólo con prioridad';
      fitAll();
    });
    $('#mapSectorSearch')?.addEventListener('input',renderIndex);
  }

  window.updateTerritoryMap=(arr)=>{
    currentNames=new Set((arr||D.territories).map(t=>t.sector));
    if(selectedSector && !currentNames.has(selectedSector)){
      selectedSector=null; popupHost?.classList.remove('open');
    }
    renderMarkers(); renderIndex();
  };
  window.refreshTerritoryMap=()=>{ renderMarkers(); renderIndex(); };
  window.focusTerritoryMap=focusSector;

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initMap);
  else initMap();
})();
