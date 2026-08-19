(() => {
  'use strict';
  const D = window.REPORT_DATA;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const fmt = n => new Intl.NumberFormat('es-CO').format(n);
  const pct = n => `${Number(n).toFixed(1).replace('.', ',')}%`;
  const esc = s => String(s).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const colors = {green:'#2e9d58',orange:'#f27b16',red:'#e53d48',darkred:'#8f1826',blue:'#1269d3',gray:'#93a5b3',violet:'#6946c8',teal:'#009c8c',magenta:'#c62e72',amber:'#ffb51b',cyan:'#08a7c7'};
  const routeNames = {
    resumen:'Resumen ejecutivo', territorio:'Territorio', vivienda:'Vivienda', poblacion:'Población', calidad:'Calidad del dato', metodologia:'Metodología', normativa:'Marco normativo', prioridades:'Prioridades', visual:'Informe visual', documento:'Documento completo'
  };
  let activeRoute='resumen';
  let selectedSectors=new Set();
  let filteredTerritories=[...D.territories];
  let currentVisual=0;
  let toastTimer;

  function toast(msg){
    const el=$('#toast'); el.textContent=msg; el.classList.add('show'); clearTimeout(toastTimer); toastTimer=setTimeout(()=>el.classList.remove('show'),2600);
  }

  function setRoute(route, {scroll=true}={}){
    if(!routeNames[route]) return;
    activeRoute=route;
    $$('.view').forEach(v=>v.classList.toggle('active',v.dataset.view===route));
    $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
    $('#routeLabel').textContent=routeNames[route];
    $('#sidebar').classList.remove('open');
    if(scroll) window.scrollTo({top:0,behavior:'smooth'});
    history.replaceState(null,'',`#${route}`);
    if(route==='documento'){ const f=$('#pdfFrame'); if(f && (f.src.endsWith('about:blank') || f.getAttribute('src')==='about:blank')) f.src=f.dataset.src; }
    if(route==='territorio') setTimeout(()=>window.refreshTerritoryMap?.(),140);
  }

  function initNavigation(){
    $$('.nav-item').forEach(b=>b.addEventListener('click',()=>setRoute(b.dataset.route)));
    $$('[data-route-jump]').forEach(b=>b.addEventListener('click',()=>setRoute(b.dataset.routeJump)));
    $('#menuBtn').addEventListener('click',()=>$('#sidebar').classList.toggle('open'));
    const hash=location.hash.replace('#',''); if(routeNames[hash]) setRoute(hash,{scroll:false});
  }

  function renderSummary(){
    const kpis=[
      ['432','Familias con registro nominal','100% familias nominadas','#2e9d58'],
      ['1.024','Registros nominales de personas','Base operativa','#1269d3'],
      ['1.001','Personas únicas estimadas','Cifra técnica provisional','#08a7c7'],
      ['25','Territorios / sectores','Hojas territoriales únicas','#6946c8'],
      ['392','Familias con estado','90,7% de completitud','#009c8c'],
      ['111','Núcleos preenumerados vacíos','Requieren depuración','#f27b16']
    ];
    $('#summaryKpis').innerHTML=kpis.map(([v,l,s,c])=>`<article class="kpi-card" style="--tone:${c}"><span>${esc(l)}</span><strong>${v}</strong><small>${esc(s)}</small></article>`).join('');
    $('#completenessBars').innerHTML=D.completeness.map(x=>`<div class="metric-row"><label>${esc(x.label)}<small style="display:block;color:var(--muted);font-size:8px">${fmt(x.numerator)} / ${fmt(x.denominator)} ${esc(x.basis)}</small></label><div class="bar-track"><div class="bar-fill" style="width:${x.value}%"></div></div><strong>${pct(x.value)}</strong></div>`).join('');
    $('#componentMiniStatus').innerHTML=D.componentStatus.slice(0,5).map(x=>`<div class="status-row"><i class="status-dot" style="--tone:${statusColor(x.tone)}"></i><div><b>${esc(x.component)}</b><small>${esc(x.progress)}</small></div><small>${esc(x.status.split(';')[0])}</small></div>`).join('');
    $('#executiveSummaryText').innerHTML=D.executiveSummary.map(p=>`<p>${esc(p)}</p>`).join('');
  }
  function statusColor(t){ return ({amber:colors.amber,blue:colors.blue,violet:colors.violet,red:colors.red,teal:colors.teal})[t]||colors.cyan; }

  function priorityCount(t){return t.noHab+t.destroyed}
  function priorityRate(t){return t.families ? priorityCount(t)/t.families*100 : 0}

  function territoryState(){
    return {
      q:$('#sectorSearch').value.trim().toLowerCase(), sort:$('#sortBy').value,
      minFamilies:+$('#minFamilies').value, minPriority:+$('#minPriority').value,
      onlyCritical:$('#onlyCritical').checked, onlyEmpty:$('#onlyEmpty').checked, onlyNoState:$('#onlyNoState').checked
    };
  }
  function filterTerritories(){
    const s=territoryState();
    filteredTerritories=D.territories.filter(t=>{
      if(s.q && !t.sector.toLowerCase().includes(s.q)) return false;
      if(t.families<s.minFamilies || priorityCount(t)<s.minPriority) return false;
      if(s.onlyCritical && priorityCount(t)===0) return false;
      if(s.onlyEmpty && t.empty===0) return false;
      if(s.onlyNoState && t.noState===0) return false;
      return true;
    });
    const sorters={
      'families-desc':(a,b)=>b.families-a.families,
      'priority-desc':(a,b)=>priorityCount(b)-priorityCount(a)||b.families-a.families,
      'rate-desc':(a,b)=>priorityRate(b)-priorityRate(a),
      'people-desc':(a,b)=>b.people-a.people,
      'name-asc':(a,b)=>a.sector.localeCompare(b.sector,'es')
    };
    filteredTerritories.sort(sorters[s.sort]);
    renderTerritoryExplorer();
  }

  function renderTerritoryExplorer(){
    const arr=filteredTerritories;
    const maxVal=Math.max(1,...arr.map(t=>t.families));
    $('#filteredCount').textContent=`${arr.length} sector${arr.length===1?'':'es'}`;
    const totalFamilies=arr.reduce((s,t)=>s+t.families,0), totalPeople=arr.reduce((s,t)=>s+t.people,0), totalPriority=arr.reduce((s,t)=>s+priorityCount(t),0);
    const avgRate=totalFamilies?totalPriority/totalFamilies*100:0;
    $('#territorySummary').innerHTML=[
      [arr.length,'Sectores visibles',colors.cyan],[totalFamilies,'Familias visibles',colors.green],[totalPeople,'Personas visibles',colors.blue],[pct(avgRate),'Tasa prioritaria agregada*',colors.red]
    ].map(([v,l,c])=>`<div class="territory-summary-card" style="--tone:${c}"><strong>${typeof v==='number'?fmt(v):v}</strong><span>${l}</span></div>`).join('');
    $('#territoryRanking').innerHTML=arr.length?arr.map(t=>`<button class="rank-row" data-sector="${esc(t.sector)}"><span class="rank-name">${esc(t.sector)}</span><span class="rank-bar"><i style="width:${t.families/maxVal*100}%"></i></span><strong>${fmt(t.families)}</strong></button>`).join(''):`<div class="compare-empty">No hay sectores que cumplan los filtros actuales.</div>`;
    $('#territoryTableBody').innerHTML=arr.map(t=>`<tr data-sector="${esc(t.sector)}"><td>${esc(t.sector)}</td><td>${fmt(t.families)}</td><td>${fmt(t.people)}</td><td>${fmt(t.noHab)}</td><td>${fmt(t.destroyed)}</td><td class="priority-cell">${fmt(priorityCount(t))}</td><td>${pct(priorityRate(t))}</td><td>${fmt(t.noState)}</td><td>${fmt(t.empty)}</td></tr>`).join('');
    $('#territorialReading').textContent=D.territorialReading;
    $$('[data-sector]').forEach(el=>el.addEventListener('click',()=>openSectorDrawer(el.dataset.sector)));
    renderCompare();
    window.updateTerritoryMap?.(arr);
  }

  function openSectorDrawer(name){
    const t=D.territories.find(x=>x.sector===name); if(!t) return;
    const geo=(window.TERRITORY_MAP_DATA||[]).find(x=>x.sector===name);
    const drawer=$('#sectorDrawer');
    const geoBlock=geo?`<div class="drawer-map-ref"><span>${geo.precision==='verified'?'REFERENCIA CARTOGRÁFICA':'REFERENCIA APROXIMADA'}</span><b>${esc(geo.reference)}</b><small>${geo.lat.toFixed(5)}, ${geo.lng.toFixed(5)} · ${esc(geo.source)}</small></div>`:'';
    $('#drawerContent').innerHTML=`<div class="drawer-title"><span class="eyebrow">FICHA TERRITORIAL</span><h2>${esc(t.sector)}</h2><small>Lectura del consolidado al 18 de agosto de 2026</small></div>${geoBlock}<div class="drawer-grid">
      ${drawerMetric(t.families,'Familias nominales',colors.green)}${drawerMetric(t.people,'Personas',colors.blue)}${drawerMetric(priorityCount(t),'Casos prioritarios',colors.red)}${drawerMetric(pct(priorityRate(t)),'Tasa prioritaria*',colors.red)}${drawerMetric(t.noState,'Sin estado',colors.amber)}${drawerMetric(t.empty,'Núcleos vacíos',colors.violet)}
      ${drawerMetric(t.noHab,'No habitables',colors.red)}${drawerMetric(t.destroyed,'Destruidas',colors.darkred)}
    </div><div class="drawer-note"><b>Lectura exploratoria:</b> ${territoryInterpretation(t)}</div><div class="drawer-actions-v4"><button class="primary-btn" id="drawerCompareBtn">${selectedSectors.has(t.sector)?'Quitar del comparador':'Añadir al comparador'}</button>${geo?'<button class="secondary-btn" id="drawerMapBtn">Ubicar en el mapa</button>':''}</div><p class="footnote">* Métrica calculada por esta micropágina; no constituye clasificación oficial.</p>`;
    $('#drawerCompareBtn').addEventListener('click',()=>toggleCompare(t.sector));
    $('#drawerMapBtn')?.addEventListener('click',()=>{setRoute('territorio',{scroll:false});window.focusTerritoryMap?.(t.sector,true)});
    drawer.classList.add('open'); drawer.setAttribute('aria-hidden','false');
    if(activeRoute==='territorio') window.focusTerritoryMap?.(t.sector,false);
  }
  function drawerMetric(v,l,c){return `<div class="drawer-metric" style="--tone:${c}"><strong>${typeof v==='number'?fmt(v):v}</strong><span>${esc(l)}</span></div>`}
  function territoryInterpretation(t){
    if(priorityRate(t)>=50) return 'Presenta una proporción elevada de casos prioritarios frente a sus familias nominales. Conviene revisar primero la trazabilidad y la verificación de campo.';
    if(t.empty>=10) return 'Presenta un volumen relevante de núcleos preenumerados vacíos; la depuración es clave para evitar sobreestimación territorial.';
    if(t.noState>=10) return 'Tiene una brecha importante de registros sin estado del inmueble, lo que limita la priorización de seguridad habitacional.';
    return 'Su lectura debe combinar volumen censal, casos prioritarios y calidad del dato. El volumen de registros no equivale por sí mismo a severidad sísmica.';
  }
  window.openSectorDrawer=openSectorDrawer;
  function closeDrawer(){ $('#sectorDrawer').classList.remove('open'); $('#sectorDrawer').setAttribute('aria-hidden','true'); }
  function toggleCompare(name){
    if(selectedSectors.has(name)) selectedSectors.delete(name); else if(selectedSectors.size<4) selectedSectors.add(name); else return toast('El comparador admite hasta 4 sectores.');
    renderCompare(); openSectorDrawer(name);
  }
  function renderCompare(){
    const host=$('#compareArea');
    if(!selectedSectors.size){host.innerHTML='<div class="compare-empty">Selecciona sectores desde el ranking, la tabla o una ficha territorial para compararlos.</div>';return;}
    host.innerHTML=[...selectedSectors].map(name=>{const t=D.territories.find(x=>x.sector===name);return `<div class="compare-card"><div class="compare-card-head"><b>${esc(t.sector)}</b><button class="compare-remove" data-remove-compare="${esc(t.sector)}">×</button></div><div class="compare-metrics"><div><strong>${fmt(t.families)}</strong><span>familias</span></div><div><strong>${fmt(t.people)}</strong><span>personas</span></div><div><strong>${fmt(priorityCount(t))}</strong><span>prioridad</span></div><div><strong>${pct(priorityRate(t))}</strong><span>tasa*</span></div></div></div>`}).join('');
    $$('[data-remove-compare]').forEach(b=>b.addEventListener('click',()=>{selectedSectors.delete(b.dataset.removeCompare);renderCompare();}));
  }

  function initTerritoryControls(){
    ['sectorSearch','sortBy','minFamilies','minPriority','onlyCritical','onlyEmpty','onlyNoState'].forEach(id=>$('#'+id).addEventListener(id==='sectorSearch'?'input':'change',()=>{
      $('#minFamiliesValue').textContent=$('#minFamilies').value; $('#minPriorityValue').textContent=$('#minPriority').value; filterTerritories();
    }));
    $('#minFamilies').addEventListener('input',()=>{$('#minFamiliesValue').textContent=$('#minFamilies').value;filterTerritories()});
    $('#minPriority').addEventListener('input',()=>{$('#minPriorityValue').textContent=$('#minPriority').value;filterTerritories()});
    $('#resetFiltersBtn').addEventListener('click',()=>{
      $('#sectorSearch').value='';$('#sortBy').value='families-desc';$('#minFamilies').value=0;$('#minPriority').value=0;$('#onlyCritical').checked=false;$('#onlyEmpty').checked=false;$('#onlyNoState').checked=false;$('#minFamiliesValue').textContent='0';$('#minPriorityValue').textContent='0';filterTerritories();
    });
    $('#clearCompare').addEventListener('click',()=>{selectedSectors.clear();renderCompare()});
    $('#exportCsvBtn').addEventListener('click',exportCsv);
  }
  function exportCsv(){
    const headers=['Sector','Familias','Personas','No habitable','Destruida','Prioridad','Tasa prioritaria calculada','Sin estado','Núcleos vacíos'];
    const rows=filteredTerritories.map(t=>[t.sector,t.families,t.people,t.noHab,t.destroyed,priorityCount(t),priorityRate(t).toFixed(2),t.noState,t.empty]);
    const csv=[headers,...rows].map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(';')).join('\n');
    const blob=new Blob([`\ufeff${csv}`],{type:'text/csv;charset=utf-8'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='san-pedro-sectores-filtrados-18-08-2026.csv'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),500); toast('CSV generado con los filtros actuales.');
  }

  function renderHousing(mode='pct'){
    const base=432;
    const overview=[
      {value:251,pct:58.1,label:'Habitable',desc:'Marca censal registrada',tone:colors.green,icon:'✓'},
      {value:56,pct:13.0,label:'Averiada',desc:'Requiere documentar el daño',tone:colors.orange,icon:'~'},
      {value:92,pct:21.3,label:'Prioridad inicial',desc:'90 no habitable + 2 destruida',tone:colors.red,icon:'!'},
      {value:40,pct:9.3,label:'Sin clasificación',desc:'Pendiente de completar',tone:colors.gray,icon:'?'}
    ];
    $('#housingOverviewCards').innerHTML=overview.map(x=>`<article class="housing-overview-card" style="--tone:${x.tone}"><i>${x.icon}</i><div><strong>${fmt(x.value)}</strong><span>${esc(x.label)}</span><small>${pct(x.pct)} · ${esc(x.desc)}</small></div></article>`).join('');
    $('#housingBars').innerHTML=D.housing.map(x=>`<div class="housing-row-v4" style="--tone:${colors[x.tone]||colors.gray}"><div class="housing-row-head"><span><i></i>${esc(x.label)}</span><strong>${mode==='pct'?pct(x.pct):fmt(x.count)}</strong></div><div class="housing-track-v4"><div class="housing-quarter-grid" aria-hidden="true"><i></i><i></i><i></i></div><div class="housing-fill-v4" style="width:${Math.max(1,x.pct)}%"></div><span>${fmt(x.count)} de ${fmt(base)} familias · ${pct(x.pct)}</span></div></div>`).join('');
    const actions=[
      {level:'SEGUIMIENTO',title:'Habitable',text:'Mantener orientación de autoprotección, monitoreo y cierre documentado. La marca no certifica seguridad estructural.',tone:colors.green,icon:'01'},
      {level:'VERIFICAR',title:'Averiada',text:'Describir el daño, ubicarlo y documentarlo; definir si requiere inspección especializada o medida preventiva.',tone:colors.orange,icon:'02'},
      {level:'PRIORIDAD',title:'No habitable / destruida',text:'Validación prioritaria, control de acceso cuando proceda, alojamiento temporal y trazabilidad de la decisión.',tone:colors.red,icon:'03'}
    ];
    $('#housingActionMatrix').innerHTML=actions.map(x=>`<div class="housing-action-row" style="--tone:${x.tone}"><span class="housing-action-no">${x.icon}</span><div><small>${x.level}</small><b>${x.title}</b><p>${x.text}</p></div></div>`).join('');
    const labels=['Habitable','Averiada','No habitable + destruida','Evacuada fuera de residencia','Marcas múltiples'];
    const tones=[colors.green,colors.orange,colors.red,colors.blue,colors.violet];
    $('#housingInterpretation').innerHTML=D.housingInterpretation.map((x,i)=>`<article class="housing-meaning-item" style="--tone:${tones[i]}"><div class="housing-meaning-tag"><i></i><span>${labels[i]}</span></div><p>${esc(x)}</p></article>`).join('');
    $('#priorityHousingNarrative').textContent=D.priorityHousingNarrative;
  }
  function initHousingMode(){ $$('#housingMode button').forEach(b=>b.addEventListener('click',()=>{$$('#housingMode button').forEach(x=>x.classList.toggle('active',x===b));renderHousing(b.dataset.mode)})); }

  function renderPopulation(){
    const cards=[
      ['566','Mujeres','55,3%',colors.magenta],['450','Hombres','43,9%',colors.blue],['179','Niñas, niños y adolescentes','17,5%',colors.orange],['283','Personas de 60 años o más','27,6%',colors.green],['39','Fechas de nacimiento inválidas/ausentes','3,8%',colors.violet]
    ];
    $('#demographicKpis').innerHTML=cards.map(([v,l,p,c])=>`<article class="demo-card" style="--tone:${c}"><small>${esc(l)}</small><strong>${v}</strong><span>${p}</span></article>`).join('');
    const max=Math.max(...D.lifeCycle.map(x=>x.count));
    $('#ageChart').innerHTML=D.lifeCycle.map((x,i)=>`<div class="age-col"><span class="age-value">${fmt(x.count)}<br><small>${pct(x.pct)}</small></span><div class="age-bar-wrap"><div class="age-bar" style="height:${Math.max(3,x.count/max*100)}%;filter:hue-rotate(${i*15}deg)"></div></div><span class="age-label">${esc(x.label)}</span></div>`).join('');
    let stops=[],acc=0; D.sexDistribution.forEach((x,i)=>{const c=[colors.magenta,colors.blue,colors.gray][i];stops.push(`${c} ${acc}% ${acc+x.pct}%`);acc+=x.pct;});
    $('#sexChart').innerHTML=`<div class="donut" style="background:conic-gradient(${stops.join(',')})"><div class="donut-center"><strong>1.024</strong><span>personas registradas</span></div></div><div class="legend-stack">${D.sexDistribution.map((x,i)=>`<div><i style="background:${[colors.magenta,colors.blue,colors.gray][i]}"></i><span>${esc(x.label)}</span><b>${fmt(x.count)} · ${pct(x.pct)}</b></div>`).join('')}</div>`;
    const maxLoc=Math.max(...D.locationDeclared.map(x=>x.count));
    $('#locationChart').innerHTML=D.locationDeclared.map(x=>`<div class="location-row" style="--tone:${colors[x.tone]||colors.gray}"><span>${esc(x.label)}</span><div class="location-track"><i style="width:${x.count/maxLoc*100}%"></i></div><b>${fmt(x.count)}</b></div>`).join('')+`<p class="footnote">Los 111 núcleos vacíos se mantienen separados y no se incluyen en esta distribución.</p>`;
  }

  function renderQuality(query=''){
    const q=query.trim().toLowerCase();
    const arr=D.qualityIssues.filter(x=>!q||`${x.label} ${x.risk} ${x.treatment}`.toLowerCase().includes(q));
    $('#qualityTopline').innerHTML=[
      [111,'Núcleos vacíos',colors.orange],[23,'Grupos de documentos repetidos',colors.red],[40,'Familias sin estado',colors.red],[189,'Sin zona homologable',colors.violet]
    ].map(([v,l,c])=>`<div class="quality-top-card" style="--tone:${c}"><strong>${fmt(v)}</strong><span>${esc(l)}</span></div>`).join('');
    $('#qualityGrid').innerHTML=arr.length?arr.map(x=>`<article class="quality-card"><span class="quality-count">${fmt(x.count)}</span><h3>${esc(x.label)}</h3><div class="quality-block"><span>Riesgo para la decisión</span><p>${esc(x.risk)}</p></div><div class="quality-block"><span>Tratamiento recomendado</span><p>${esc(x.treatment)}</p></div></article>`).join(''):'<div class="panel">No hay hallazgos que coincidan con el filtro.</div>';
    $('#componentStatusTable').innerHTML=D.componentStatus.map(x=>`<div class="component-row" style="--tone:${statusColor(x.tone)}"><b>${esc(x.component)}</b><span>${esc(x.progress)}</span><span>${esc(x.status)}</span><i></i></div>`).join('');
    $('#qualityPrinciples').innerHTML=D.qualityAssuranceRules.map(x=>`<div class="check-item"><i>✓</i><p>${esc(x)}</p></div>`).join('');
  }

  function renderMethodology(){
    $('#methodTimeline').innerHTML=D.methodology.map(s=>`<div class="method-step"><div class="method-num">${s.step}</div><strong>${esc(s.title)}</strong><span>${esc(s.detail)}</span></div>`).join('');
    $('#appliedRules').innerHTML=D.appliedRules.map(x=>`<li>${esc(x)}</li>`).join('');
    $('#objectiveText').textContent=D.objective;
    $('#scopeList').innerHTML=D.scope.map(x=>`<div class="check-item"><i>✓</i><p>${esc(x)}</p></div>`).join('');
    $('#methodLimitations').innerHTML=D.limitations.map(x=>`<div class="warning-item"><i>!</i><p>${esc(x)}</p></div>`).join('');
  }

  function renderNormative(){
    $('#eventContext').textContent=D.eventContext;
    $('#regulatoryTable').innerHTML=D.regulatoryFramework.map(x=>`<tr><td>${esc(x.axis)}</td><td>${esc(x.application)}</td></tr>`).join('');
    $('#rufeRudText').textContent=D.rufeRud;
  }

  function renderPriorities(){
    $('#priorityActions').innerHTML=D.priorities.map((p,i)=>`<article class="priority-action"><div class="action-num">${i+1}</div><p>${esc(p)}</p></article>`).join('');
    const cs=[colors.red,colors.orange,'#e4ad15',colors.green];
    $('#priorityMatrix').innerHTML=D.prioritizationMatrix.map((m,i)=>`<article class="matrix-card" style="--matrix-color:${cs[i]}"><div class="matrix-level">${esc(m.level)}</div><div class="matrix-body"><span>Criterios verificables</span><p>${esc(m.criteria)}</p><span>Acción</span><p>${esc(m.action)}</p></div></article>`).join('');
    $('#conclusionsList').innerHTML=D.conclusions.map((x,i)=>`<div class="conclusion-item"><b>${i+1}</b><p>${esc(x)}</p></div>`).join('');
  }

  function renderVisualGallery(){
    const host=$('#visualThumbs');
    host.innerHTML=D.visualReports.map((v,i)=>`<button class="visual-thumb ${i===currentVisual?'active':''}" data-visual-index="${i}"><img loading="lazy" src="${esc(v.src)}" alt="Miniatura ${esc(v.title)}"><span><b>${esc(v.title)}</b><small>${esc(v.category)}</small></span></button>`).join('');
    $$('[data-visual-index]').forEach(b=>b.addEventListener('click',()=>selectVisual(+b.dataset.visualIndex)));
    selectVisual(currentVisual,false);
  }
  function selectVisual(i, rerender=true){
    currentVisual=i; const v=D.visualReports[i];
    $('#visualMainImage').src=v.src; $('#visualMainImage').alt=v.title; $('#visualTitle').textContent=v.title; $('#visualCategory').textContent=v.category; $('#visualOpenLink').href=v.src;
    if(rerender) $$('.visual-thumb').forEach((b,idx)=>b.classList.toggle('active',idx===i));
  }

  function renderDocument(){
    renderPageIndex('');
    $('#annexTable').innerHTML=D.annexIndicators.map(x=>`<tr><td>${esc(x.dimension)}</td><td>${esc(x.indicator)}</td><td><b>${esc(x.value)}</b></td></tr>`).join('');
    $('#documentControl').innerHTML=D.documentControl.finalSignatures.map(x=>`<div class="signature-item"><span>${esc(x.role)}</span><b>${esc(x.name)}</b><small>${esc(x.title)}</small></div>`).join('');
    $('#contactBox').innerHTML=`<b>Alcaldía Municipal de San Pedro</b><br>${esc(D.meta.address)} · Tel. ${esc(D.meta.phone)}<br>${esc(D.meta.website)} · ${esc(D.meta.email)} · Código postal ${esc(D.meta.postalCode)}<br><small>Documento: ${esc(D.meta.documentCode)} · Proceso: ${esc(D.meta.process)} · Versión ${esc(D.meta.documentVersion)}</small>`;
  }
  function renderPageIndex(query){
    const q=query.trim().toLowerCase(); const arr=D.pageIndex.filter(x=>!q||`${x.title} ${x.tags}`.toLowerCase().includes(q));
    $('#pageIndex').innerHTML=arr.map(x=>`<button class="page-link" data-page="${x.page}"><b>${String(x.page).padStart(2,'0')}</b><span>${esc(x.title)}</span></button>`).join('') || '<div class="footnote">Sin coincidencias.</div>';
    $$('[data-page]').forEach(b=>b.addEventListener('click',()=>{
      const page=+b.dataset.page; $('#pdfFrame').src=`assets/informe-consolidado-18-agosto-2026.pdf#page=${page}&view=FitH`; $$('.page-link').forEach(x=>x.classList.toggle('active',x===b));
    }));
  }

  function buildSearchEntries(){
    const entries=[];
    Object.entries(routeNames).forEach(([route,label])=>entries.push({label,type:'Sección',route,meta:'Navegación principal'}));
    D.territories.forEach(t=>entries.push({label:t.sector,type:'Territorio',route:'territorio',sector:t.sector,meta:`${t.families} familias · ${priorityCount(t)} prioridad`}));
    D.qualityIssues.forEach(q=>entries.push({label:q.label,type:'Hallazgo',route:'calidad',meta:`${q.count} registros`}));
    D.housing.forEach(h=>entries.push({label:h.label,type:'Vivienda',route:'vivienda',meta:`${h.count} · ${pct(h.pct)}`}));
    D.pageIndex.forEach(p=>entries.push({label:p.title,type:`Página ${p.page}`,route:'documento',page:p.page,meta:p.tags}));
    D.annexIndicators.forEach(a=>entries.push({label:a.indicator,type:'Indicador',route:'documento',meta:`${a.dimension} · ${a.value}`}));
    D.visualReports.forEach((v,i)=>entries.push({label:v.title,type:'Informe visual',route:'visual',visual:i,meta:v.category}));
    D.regulatoryFramework.forEach(r=>entries.push({label:r.axis,type:'Normativa',route:'normativa',meta:r.application.slice(0,80)+'…'}));
    return entries;
  }

  function initGlobalSearch(){
    const wrap=$('.global-search-wrap'), input=$('#globalSearch'), results=$('#globalSearchResults'), clear=$('#clearGlobalSearch');
    const entries=buildSearchEntries(); let current=[]; let active=0;
    function render(){
      const q=input.value.trim().toLowerCase(); wrap.classList.toggle('has-value',!!q);
      if(!q){results.hidden=true;results.innerHTML='';current=[];return;}
      const terms=q.split(/\s+/).filter(Boolean);
      current=entries.filter(e=>terms.every(t=>`${e.label} ${e.type} ${e.meta||''}`.toLowerCase().includes(t))).slice(0,12); active=0;
      results.innerHTML=current.length?current.map((e,i)=>`<button class="search-result ${i===active?'active':''}" data-search-index="${i}"><span><b>${esc(e.label)}</b><small>${esc(e.meta||'')}</small></span><span class="result-type">${esc(e.type)}</span></button>`).join(''):`<div style="padding:16px;color:var(--muted);font-size:12px">No se encontraron coincidencias.</div>`;
      results.hidden=false;
    }
    function choose(i){
      const e=current[i]; if(!e) return; setRoute(e.route); results.hidden=true; input.blur();
      if(e.sector) setTimeout(()=>openSectorDrawer(e.sector),140);
      if(e.page) setTimeout(()=>{ $('#pdfFrame').src=`assets/informe-consolidado-18-agosto-2026.pdf#page=${e.page}&view=FitH`; },140);
      if(Number.isInteger(e.visual)) setTimeout(()=>selectVisual(e.visual),140);
    }
    input.addEventListener('input',render);
    input.addEventListener('focus',()=>{if(input.value.trim())render()});
    clear.addEventListener('click',()=>{input.value='';render();input.focus()});
    results.addEventListener('click',e=>{const b=e.target.closest('[data-search-index]');if(b)choose(+b.dataset.searchIndex)});
    document.addEventListener('click',e=>{if(!wrap.contains(e.target))results.hidden=true});
    document.addEventListener('keydown',e=>{
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();input.focus();input.select();return;}
      if(document.activeElement===input && !results.hidden){
        if(e.key==='Escape'){results.hidden=true;input.blur();}
        if(e.key==='ArrowDown'){e.preventDefault();active=Math.min(active+1,current.length-1);updateActive()}
        if(e.key==='ArrowUp'){e.preventDefault();active=Math.max(active-1,0);updateActive()}
        if(e.key==='Enter'){e.preventDefault();choose(active)}
      }
    });
    function updateActive(){ $$('.search-result',results).forEach((x,i)=>x.classList.toggle('active',i===active)); const el=$$('.search-result',results)[active]; if(el)el.scrollIntoView({block:'nearest'}); }
  }

  function initUtilities(){
    const saved=localStorage.getItem('sp-theme-v2'); if(saved)document.documentElement.dataset.theme=saved;
    $('#themeToggle').addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=next;localStorage.setItem('sp-theme-v2',next)});
    $('#printBtn').addEventListener('click',()=>window.print());
    $('#drawerClose').addEventListener('click',closeDrawer);
    $('#qualitySearch').addEventListener('input',e=>renderQuality(e.target.value));
    $('#pageIndexSearch').addEventListener('input',e=>renderPageIndex(e.target.value));
    $('#copyExecutive').addEventListener('click',async()=>{const text=D.executiveSummary.join('\n\n');try{await navigator.clipboard.writeText(text);toast('Resumen ejecutivo copiado.')}catch{toast('No se pudo copiar automáticamente.')}});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
  }

  function initServiceWorker(){ if('serviceWorker' in navigator) window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{})); }

  function boot(){
    renderSummary(); renderHousing(); renderPopulation(); renderQuality(); renderMethodology(); renderNormative(); renderPriorities(); renderVisualGallery(); renderDocument(); renderTerritoryExplorer();
    initNavigation(); initTerritoryControls(); initHousingMode(); initGlobalSearch(); initUtilities(); initServiceWorker();
  }
  boot();
})();
