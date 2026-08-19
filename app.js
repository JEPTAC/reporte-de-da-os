(() => {
  'use strict';

  const D = window.REPORT_DATA;
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => [...root.querySelectorAll(sel)];
  const fmt = n => Number(n).toLocaleString('es-CO');
  const pct = n => `${Number(n).toFixed(1).replace('.', ',')}%`;
  const esc = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));

  const routeNames = {
    resumen:'Resumen ejecutivo', territorio:'Explorador territorial', vivienda:'Vivienda y afectación',
    poblacion:'Caracterización poblacional', calidad:'Calidad y depuración', metodologia:'Metodología',
    prioridades:'Prioridades de respuesta', fuentes:'Fuentes y limitaciones'
  };

  let currentRoute = 'resumen';
  let territoryMetric = 'families';
  let selectedSectors = new Set();
  let filteredTerritories = [...D.territories];

  const colors = {
    green:'#29945b', orange:'#f2a31e', red:'#d8393f', darkred:'#8d1e27', blue:'#0b6fc2', gray:'#9aa8b6',
    teal:'#0a918b', purple:'#6347b8', cyan:'#08a9c5', pink:'#cf2f72'
  };

  function toast(msg){
    const el = $('#toast');
    el.textContent = msg; el.hidden = false;
    clearTimeout(toast.t); toast.t = setTimeout(() => el.hidden = true, 2400);
  }

  function setRoute(route, updateHash=true){
    if (!routeNames[route]) route = 'resumen';
    currentRoute = route;
    $$('.view').forEach(v => v.classList.toggle('active', v.dataset.view === route));
    $$('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.route === route));
    $('#routeLabel').textContent = routeNames[route];
    if (updateHash) history.replaceState(null, '', `#${route}`);
    window.scrollTo({top:0, behavior:'smooth'});
    $('#sidebar').classList.remove('open');
  }

  function initNavigation(){
    $$('.nav-item').forEach(btn => btn.addEventListener('click', () => setRoute(btn.dataset.route)));
    $$('[data-route-jump]').forEach(btn => btn.addEventListener('click', () => setRoute(btn.dataset.routeJump)));
    window.addEventListener('hashchange', () => setRoute(location.hash.slice(1), false));
    const start = location.hash.slice(1) || 'resumen'; setRoute(start, false);
    $('#menuBtn').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  }

  function renderSummary(){
    const kpis = [
      ['Familias con registro nominal', D.kpis.families, 'Núcleos con ≥1 persona', '#29945b'],
      ['Registros nominales', D.kpis.nominalPeople, 'Personas registradas', '#0b6fc2'],
      ['Personas únicas estimadas', D.kpis.uniquePeopleEstimated, 'Cifra técnica provisional', '#0a918b'],
      ['Territorios / sectores', D.kpis.territories, 'Hojas territoriales únicas', '#6347b8'],
      ['Núcleos preenumerados vacíos', D.kpis.emptyPreEnumerated, 'Requieren depuración', '#f2a31e']
    ];
    $('#summaryKpis').innerHTML = kpis.map(([label,val,small,color]) => `
      <article class="kpi-card" style="--kpi-color:${color}">
        <div class="kpi-top"><span class="kpi-label">${esc(label)}</span><span aria-hidden="true">●</span></div>
        <strong>${fmt(val)}</strong><small>${esc(small)}</small>
      </article>`).join('');
    $('#completenessBars').innerHTML = D.completeness.map(x => `
      <div class="metric-row"><label>${esc(x.label)}</label><div class="track"><div class="fill" style="width:${x.value}%"></div></div><strong>${pct(x.value)}</strong></div>`).join('');
  }

  function getTerritoryFilters(){
    return {
      q: $('#sectorSearch').value.trim().toLowerCase(),
      sort: $('#sortBy').value,
      minFamilies: +$('#minFamilies').value,
      minPriority: +$('#minPriority').value,
      onlyPriority: $('#onlyPriority').checked,
      onlyDestroyed: $('#onlyDestroyed').checked,
      onlyEmpty: $('#onlyEmpty').checked,
      onlyNoState: $('#onlyNoState').checked
    };
  }

  function priorityCount(t){ return t.noHab + t.destroyed; }
  function priorityRate(t){ return t.families ? (priorityCount(t) / t.families * 100) : 0; }

  function applyTerritoryFilters(){
    const f = getTerritoryFilters();
    let arr = D.territories.filter(t => {
      const p = priorityCount(t);
      return (!f.q || t.sector.toLowerCase().includes(f.q)) &&
        t.families >= f.minFamilies && p >= f.minPriority &&
        (!f.onlyPriority || p > 0) && (!f.onlyDestroyed || t.destroyed > 0) &&
        (!f.onlyEmpty || t.empty > 0) && (!f.onlyNoState || t.noState > 0);
    });
    const sorters = {
      'families-desc': (a,b)=>b.families-a.families,
      'priority-desc': (a,b)=>priorityCount(b)-priorityCount(a),
      'rate-desc': (a,b)=>priorityRate(b)-priorityRate(a),
      'people-desc': (a,b)=>b.people-a.people,
      'name-asc': (a,b)=>a.sector.localeCompare(b.sector,'es')
    };
    arr.sort(sorters[f.sort] || sorters['families-desc']);
    filteredTerritories = arr;
    renderTerritoryExplorer();
  }

  function renderTerritoryExplorer(){
    const arr = filteredTerritories;
    $('#filteredCount').textContent = arr.length;
    $('#filteredFamilies').textContent = fmt(arr.reduce((s,t)=>s+t.families,0));
    $('#filteredPeople').textContent = fmt(arr.reduce((s,t)=>s+t.people,0));
    $('#filteredPriority').textContent = fmt(arr.reduce((s,t)=>s+priorityCount(t),0));
    $('#filteredEmpty').textContent = fmt(arr.reduce((s,t)=>s+t.empty,0));

    const values = arr.map(t => territoryMetric === 'families' ? t.families : territoryMetric === 'priority' ? priorityCount(t) : priorityRate(t));
    const max = Math.max(...values, 1);
    const titles = {families:'Familias con registro nominal', priority:'Casos de mayor prioridad (no habitable + destruida)', rate:'Tasa prioritaria calculada'};
    $('#territoryChartTitle').textContent = titles[territoryMetric];
    $('#territoryChart').innerHTML = arr.length ? arr.map(t => {
      const value = territoryMetric === 'families' ? t.families : territoryMetric === 'priority' ? priorityCount(t) : priorityRate(t);
      const label = territoryMetric === 'rate' ? pct(value) : fmt(value);
      return `<div class="bar-row"><button data-open-sector="${esc(t.sector)}" title="Abrir ficha de ${esc(t.sector)}">${esc(t.sector)}</button><div class="bar-bg"><div class="bar-fill ${territoryMetric}" style="width:${Math.max(2,value/max*100)}%"></div></div><span class="bar-value">${label}</span></div>`;
    }).join('') : `<div class="data-note">No hay sectores que coincidan con los filtros actuales.</div>`;

    $('#territoryTable tbody').innerHTML = arr.map(t => {
      const p = priorityCount(t), r = priorityRate(t);
      return `<tr>
        <td><input class="compare-check" type="checkbox" data-compare-sector="${esc(t.sector)}" ${selectedSectors.has(t.sector)?'checked':''} aria-label="Comparar ${esc(t.sector)}"></td>
        <td>${esc(t.sector)}</td><td>${fmt(t.families)}</td><td>${fmt(t.people)}</td><td>${fmt(t.noHab)}</td><td>${fmt(t.destroyed)}</td>
        <td class="priority-num">${fmt(p)}</td><td class="rate-pill">${pct(r)}</td><td>${fmt(t.noState)}</td><td>${fmt(t.empty)}</td>
        <td><button class="row-action" data-open-sector="${esc(t.sector)}">Ver ficha</button></td></tr>`;
    }).join('');
    renderCompare();
  }

  function initTerritoryControls(){
    ['sectorSearch','sortBy','minFamilies','minPriority','onlyPriority','onlyDestroyed','onlyEmpty','onlyNoState'].forEach(id => {
      $(`#${id}`).addEventListener(id.includes('Search') ? 'input' : 'change', () => {
        $('#minFamiliesValue').textContent = $('#minFamilies').value;
        $('#minPriorityValue').textContent = $('#minPriority').value;
        applyTerritoryFilters();
      });
    });
    $('#minFamilies').addEventListener('input', () => { $('#minFamiliesValue').textContent = $('#minFamilies').value; applyTerritoryFilters(); });
    $('#minPriority').addEventListener('input', () => { $('#minPriorityValue').textContent = $('#minPriority').value; applyTerritoryFilters(); });
    $('#resetFiltersBtn').addEventListener('click', () => {
      $('#sectorSearch').value=''; $('#sortBy').value='families-desc'; $('#minFamilies').value=0; $('#minPriority').value=0;
      ['onlyPriority','onlyDestroyed','onlyEmpty','onlyNoState'].forEach(id => $(`#${id}`).checked=false);
      $('#minFamiliesValue').textContent='0'; $('#minPriorityValue').textContent='0'; applyTerritoryFilters();
    });
    $$('#chartMetricSwitch button').forEach(btn => btn.addEventListener('click', () => {
      territoryMetric = btn.dataset.metric; $$('#chartMetricSwitch button').forEach(b=>b.classList.toggle('active',b===btn)); renderTerritoryExplorer();
    }));
    $('#territoryChart').addEventListener('click', e => { const b=e.target.closest('[data-open-sector]'); if(b) openSectorDrawer(b.dataset.openSector); });
    $('#territoryTable').addEventListener('click', e => {
      const open=e.target.closest('[data-open-sector]'); if(open) openSectorDrawer(open.dataset.openSector);
      const cb=e.target.closest('[data-compare-sector]'); if(cb){
        const s=cb.dataset.compareSector;
        if(cb.checked){
          if(selectedSectors.size>=4){cb.checked=false; toast('Puedes comparar hasta 4 sectores.'); return;}
          selectedSectors.add(s);
        } else selectedSectors.delete(s);
        renderCompare();
      }
    });
    $('#clearCompareBtn').addEventListener('click', () => { selectedSectors.clear(); renderTerritoryExplorer(); });
    $('#exportCsvBtn').addEventListener('click', exportTerritoryCsv);
  }

  function renderCompare(){
    const panel=$('#comparePanel');
    if(!selectedSectors.size){panel.hidden=true; return;}
    panel.hidden=false;
    const list=[...selectedSectors].map(s=>D.territories.find(t=>t.sector===s)).filter(Boolean);
    $('#compareGrid').innerHTML=list.map(t=>`<div class="compare-card"><h4>${esc(t.sector)}</h4><div class="compare-stats">
      <div><strong>${fmt(t.families)}</strong><span>familias</span></div><div><strong>${fmt(t.people)}</strong><span>personas</span></div>
      <div><strong>${fmt(priorityCount(t))}</strong><span>prioridad</span></div><div><strong>${pct(priorityRate(t))}</strong><span>tasa calc.</span></div>
    </div></div>`).join('');
  }

  function openSectorDrawer(name){
    const t=D.territories.find(x=>x.sector===name); if(!t) return;
    $('#drawerTitle').textContent=t.sector;
    const p=priorityCount(t), r=priorityRate(t);
    $('#drawerBody').innerHTML=`
      <div class="drawer-hero">
        <div class="drawer-stat"><strong>${fmt(t.families)}</strong><span>familias nominales</span></div>
        <div class="drawer-stat"><strong>${fmt(t.people)}</strong><span>personas</span></div>
        <div class="drawer-stat"><strong style="color:var(--red)">${fmt(p)}</strong><span>casos prioritarios</span></div>
        <div class="drawer-stat"><strong style="color:var(--purple)">${pct(r)}</strong><span>tasa calculada*</span></div>
      </div>
      <div class="drawer-section"><h4>Detalle de afectación</h4>
        <div class="priority-list"><div><span>No habitable</span><strong>${fmt(t.noHab)}</strong></div><div><span>Destruida</span><strong>${fmt(t.destroyed)}</strong></div><div><span>Sin estado*</span><strong>${fmt(t.noState)}</strong></div><div><span>Núcleos vacíos</span><strong>${fmt(t.empty)}</strong></div></div>
      </div>
      <div class="drawer-section"><h4>Lectura exploratoria</h4><div class="warning-box"><p>${p>0?`El sector registra ${fmt(p)} caso(s) en las categorías “no habitable” o “destruida”.`:'No registra casos en las categorías “no habitable” o “destruida” en este corte.'} La priorización final requiere validación técnica y aplicación de los criterios del informe.</p></div></div>
      <div class="drawer-section"><button class="primary-btn" id="drawerCompareBtn">${selectedSectors.has(t.sector)?'Quitar de comparación':'Agregar a comparación'}</button></div>
      <div class="data-note">*La tasa prioritaria es un cálculo de interfaz. “Sin estado” debe interpretarse junto con núcleos vacíos.</div>`;
    $('#sectorDrawer').classList.add('open'); $('#sectorDrawer').setAttribute('aria-hidden','false'); $('#drawerBackdrop').hidden=false;
    $('#drawerCompareBtn').addEventListener('click',()=>{
      if(selectedSectors.has(t.sector)) selectedSectors.delete(t.sector);
      else if(selectedSectors.size<4) selectedSectors.add(t.sector); else return toast('Puedes comparar hasta 4 sectores.');
      renderTerritoryExplorer(); openSectorDrawer(t.sector);
    });
  }

  function closeDrawer(){ $('#sectorDrawer').classList.remove('open'); $('#sectorDrawer').setAttribute('aria-hidden','true'); $('#drawerBackdrop').hidden=true; }

  function exportTerritoryCsv(){
    const headers=['Sector','Familias','Personas','No habitable','Destruida','Prioridad','Tasa prioritaria calculada','Sin estado','Núcleos vacíos'];
    const rows=filteredTerritories.map(t=>[t.sector,t.families,t.people,t.noHab,t.destroyed,priorityCount(t),priorityRate(t).toFixed(2),t.noState,t.empty]);
    const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob=new Blob([`\ufeff${csv}`],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a');
    a.href=URL.createObjectURL(blob); a.download='san-pedro-sectores-filtrados-18-08-2026.csv'; a.click(); URL.revokeObjectURL(a.href); toast('CSV generado con los filtros actuales.');
  }

  function renderHousing(){
    const classified=392, unclassified=40;
    $('#housingDonut').style.background=`conic-gradient(${colors.teal} 0 ${classified/432*100}%, ${colors.gray} ${classified/432*100}% 100%)`;
    $('#housingDonut .donut-center').innerHTML=`<strong>${pct(classified/432*100)}</strong><span>con estado registrado</span>`;
    const legend=$('#housingLegend');
    function draw(mode='pct'){
      legend.innerHTML=D.housing.map(h=>`<div class="legend-row"><i class="legend-dot" style="background:${colors[h.tone]||h.tone}"></i><strong>${esc(h.label)}</strong><span>${mode==='pct'?pct(h.pct):fmt(h.count)}</span><span>${mode==='pct'?fmt(h.count):pct(h.pct)}</span></div>`).join('') + `<div class="data-note">Las marcas de estado no son totalmente excluyentes: nueve familias tienen más de una marca; por ello los porcentajes de categorías no deben interpretarse como partes de un único total.</div>`;
    }
    draw();
    $$('#housingMode button').forEach(btn=>btn.addEventListener('click',()=>{ $$('#housingMode button').forEach(b=>b.classList.toggle('active',b===btn)); draw(btn.dataset.mode); }));
  }

  function renderPopulation(){
    const max=Math.max(...D.lifeCycle.map(x=>x.count));
    $('#ageChart').innerHTML=D.lifeCycle.map((x,i)=>`<div class="age-col"><span class="age-value">${fmt(x.count)}<br><small>${pct(x.pct)}</small></span><div class="age-bar-wrap"><div class="age-bar" style="height:${Math.max(3,x.count/max*100)}%;filter:hue-rotate(${i*13}deg)"></div></div><span class="age-label">${esc(x.label)}</span></div>`).join('');
    const total=D.locationDeclared.reduce((s,x)=>s+x.count,0), a=D.locationDeclared;
    const p1=a[0].count/total*100, p2=p1+a[1].count/total*100;
    $('#locationChart').innerHTML=`<div class="ring-wrap"><div class="ring" style="background:conic-gradient(${colors.green} 0 ${p1}%, ${colors.blue} ${p1}% ${p2}%, ${colors.gray} ${p2}% 100%)"><div class="ring-center"><strong>${fmt(total)}</strong><span>familias</span></div></div><div class="ring-legend">${a.map((x,i)=>`<div><i style="background:${[colors.green,colors.blue,colors.gray][i]}"></i><span>${esc(x.label)} · <strong>${fmt(x.count)}</strong></span></div>`).join('')}</div></div>`;
  }

  function renderQuality(query=''){
    const q=query.trim().toLowerCase();
    const arr=D.qualityIssues.filter(x=>!q||`${x.label} ${x.risk} ${x.treatment}`.toLowerCase().includes(q));
    $('#qualityGrid').innerHTML=arr.length?arr.map(x=>`<article class="quality-card"><span class="quality-count">${fmt(x.count)}</span><h3>${esc(x.label)}</h3><div class="quality-block"><span>Riesgo para la decisión</span><p>${esc(x.risk)}</p></div><div class="quality-block"><span>Tratamiento recomendado</span><p>${esc(x.treatment)}</p></div></article>`).join(''):`<div class="data-note">No hay hallazgos que coincidan con la búsqueda.</div>`;
  }

  function renderQualityPrinciples(){
    const rules=[
      'Identificador interno único por familia, independiente del consecutivo de cada hoja.',
      'Documento almacenado como texto para preservar ceros y evitar notación científica.',
      'Catálogos controlados para sexo, parentesco, pertenencia étnica, tenencia, ubicación y estado del inmueble.',
      'Fechas en formato AAAA-MM-DD y validación contra la fecha del evento.',
      'Una sola categoría principal de habitabilidad, con campos separados para observaciones, evacuación y urgencia.',
      'Registro de quién captura, quién verifica, fecha de visita, soporte y motivo de cada modificación.',
      'Copia maestra protegida, versiones fechadas y bitácora de cambios.'
    ];
    $('#qualityPrinciples').innerHTML=rules.map(r=>`<div class="principle"><b>✓</b><span>${esc(r)}</span></div>`).join('');
  }

  function renderMethodology(){
    $('#methodTimeline').innerHTML=D.methodology.map(s=>`<div class="method-step"><div class="method-num">${s.step}</div><div><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></div></div>`).join('');
    $('#appliedRules').innerHTML=D.appliedRules.map(r=>`<li>${esc(r)}</li>`).join('');
  }

  function renderPriorities(){
    $('#priorityActions').innerHTML=D.priorities.map((p,i)=>`<article class="priority-action"><div class="action-num">${i+1}</div><p>${esc(p)}</p></article>`).join('');
    const matrixColors=['#d8393f','#ef7b1a','#e4ad15','#29945b'];
    $('#priorityMatrix').innerHTML=D.prioritizationMatrix.map((m,i)=>`<div class="matrix-card" style="--matrix-color:${matrixColors[i]}"><div class="matrix-level">${esc(m.level)}</div><div class="matrix-body"><span>Criterios verificables</span><p>${esc(m.criteria)}</p><span>Acción</span><p>${esc(m.action)}</p></div></div>`).join('');
  }

  function renderSources(){
    $('#limitationsList').innerHTML=D.limitations.map(x=>`<div class="limitation"><span>!</span><div>${esc(x)}</div></div>`).join('');
  }

  function initSearch(){
    const overlay=$('#commandOverlay'), input=$('#commandInput'), results=$('#commandResults');
    let active=0, current=[];
    const entries=[
      ...Object.entries(routeNames).map(([route,label])=>({type:'Sección',label,route})),
      ...D.territories.map(t=>({type:'Territorio',label:t.sector,route:'territorio',sector:t.sector})),
      ...D.qualityIssues.map(q=>({type:'Hallazgo',label:q.label,route:'calidad'}))
    ];
    function open(){ overlay.hidden=false; input.value=''; active=0; render(''); setTimeout(()=>input.focus(),20); }
    function close(){ overlay.hidden=true; }
    function render(q){
      const s=q.trim().toLowerCase(); current=entries.filter(x=>!s||`${x.label} ${x.type}`.toLowerCase().includes(s)).slice(0,16);
      if(active>=current.length) active=0;
      results.innerHTML=current.map((x,i)=>`<button class="command-item ${i===active?'active':''}" data-cmd-index="${i}"><span>${esc(x.label)}</span><small>${esc(x.type)}</small></button>`).join('') || `<div class="data-note">Sin resultados.</div>`;
    }
    function choose(i){ const x=current[i]; if(!x) return; close(); setRoute(x.route); if(x.sector) setTimeout(()=>openSectorDrawer(x.sector),180); }
    $('#searchTrigger').addEventListener('click',open); input.addEventListener('input',()=>{active=0;render(input.value)}); results.addEventListener('click',e=>{const b=e.target.closest('[data-cmd-index]');if(b)choose(+b.dataset.cmdIndex)});
    overlay.addEventListener('click',e=>{if(e.target===overlay)close()});
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault(); overlay.hidden?open():close(); return;}
      if(!overlay.hidden){ if(e.key==='Escape')close(); if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,current.length-1);render(input.value)} if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);render(input.value)} if(e.key==='Enter'){e.preventDefault();choose(active)} return; }
      if(!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement.tagName) && /^[1-8]$/.test(e.key)){ setRoute(Object.keys(routeNames)[+e.key-1]); }
    });
  }

  function initUtilities(){
    $('#themeToggle').addEventListener('click',()=>{
      const html=document.documentElement; const next=html.dataset.theme==='dark'?'light':'dark'; html.dataset.theme=next; localStorage.setItem('sp-theme',next);
    });
    const saved=localStorage.getItem('sp-theme'); if(saved) document.documentElement.dataset.theme=saved;
    $('#printBtn').addEventListener('click',()=>window.print());
    $('#copySummaryBtn').addEventListener('click',async()=>{
      const text=`Emergencia sísmica — San Pedro, Valle del Cauca. Corte 18 de agosto de 2026: ${fmt(D.kpis.families)} familias con registro nominal, ${fmt(D.kpis.nominalPeople)} registros nominales de personas, ${fmt(D.kpis.uniquePeopleEstimated)} personas únicas estimadas y ${D.kpis.territories} territorios/sectores. Se registran 90 marcas “no habitable” y 2 “destruida”. La información es preliminar y requiere validación, depuración y cierre documentado.`;
      try{await navigator.clipboard.writeText(text);toast('Resumen copiado al portapapeles.')}catch{toast('No fue posible copiar automáticamente.');}
    });
    $('#drawerClose').addEventListener('click',closeDrawer); $('#drawerBackdrop').addEventListener('click',closeDrawer);
  }

  function initQualitySearch(){ $('#qualitySearch').addEventListener('input',e=>renderQuality(e.target.value)); }

  function initServiceWorker(){ if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }

  function boot(){
    renderSummary(); renderHousing(); renderPopulation(); renderQuality(); renderQualityPrinciples(); renderMethodology(); renderPriorities(); renderSources();
    renderTerritoryExplorer(); initNavigation(); initTerritoryControls(); initQualitySearch(); initSearch(); initUtilities(); initServiceWorker();
  }

  boot();
})();
