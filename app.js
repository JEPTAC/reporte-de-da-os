
(() => {
  const data = window.RUFE_DATA;
  const summary = data.summary;
  const sectors = data.sectors.map(s => ({...s, priority: s.noHab + s.destroyed, rate: (s.noHab + s.destroyed) / Math.max(s.families, 1)}));

  const fmt = n => new Intl.NumberFormat('es-CO').format(n);
  const q = sel => document.querySelector(sel);
  const qa = sel => [...document.querySelectorAll(sel)];
  const maxPriority = Math.max(...sectors.map(s => s.priority));
  const state = { selected: null, view: 'cards', filter: '', sort: 'families', onlyPriority: false };

  function revealSections(){
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('visible'); });
    }, {threshold: .12});
    qa('.reveal').forEach(el => observer.observe(el));
  }

  function initHero(){
    const cards = [
      ['Familias nominales', summary.families, 'Núcleos familiares con registro nominal'],
      ['Personas únicas', summary.people, 'Estimación consolidada del corte'],
      ['Con estado', summary.withStatus, 'Familias con marca del inmueble'],
      ['Prioridad', summary.housing.noHab + summary.housing.destroyed, 'No habitable + destruida']
    ];
    q('#heroSummaryGrid').innerHTML = cards.map(([label, value, desc]) => `<article class="hero-mini-kpi"><small>${label}</small><strong>${fmt(value)}</strong><span>${desc}</span></article>`).join('');
  }

  function filterSectors(){
    return sectors
      .filter(s => s.name.toLowerCase().includes(state.filter.toLowerCase()))
      .filter(s => !state.onlyPriority || s.priority > 0)
      .sort((a,b) => {
        if(state.sort==='name') return a.name.localeCompare(b.name, 'es');
        if(state.sort==='people') return b.people - a.people;
        if(state.sort==='priority') return b.priority - a.priority || b.families - a.families;
        return b.families - a.families;
      });
  }

  function selectTerritory(name){
    state.selected = sectors.find(s => s.name === name) || null;
    renderTerritoryFocus();
    renderMap();
    renderTerritoryCards();
    renderTerritoryTable();
  }

  function renderMap(){
    q('#schematicMap').innerHTML = filterSectors().map(s => {
      const priorityClass = s.priority >= 8 ? 'priority' : '';
      const selectedClass = state.selected && state.selected.name === s.name ? 'is-selected' : '';
      return `<div class="map-marker ${priorityClass} ${selectedClass}" style="left:${s.x}%; top:${s.y}%"><button type="button" aria-label="${s.name}" data-select-territory="${s.name}"></button><span>${s.name}</span></div>`;
    }).join('');
    qa('[data-select-territory]').forEach(btn => btn.addEventListener('click', () => selectTerritory(btn.dataset.selectTerritory)));
  }

  function renderTerritoryFocus(){
    const el = q('#territoryFocus');
    if(!state.selected){
      el.innerHTML = `<div class="focus-empty"><div><span>⌖</span><h3>Selecciona un territorio</h3><p>Haz clic en un punto del mapa, una tarjeta o una fila para ver su ficha territorial ampliada.</p></div></div>`;
      return;
    }
    const s = state.selected;
    el.innerHTML = `
      <div class="territory-detail-card">
        <span class="eyebrow">FICHA TERRITORIAL</span>
        <h3>${s.name}</h3>
        <div class="tag-line"><span class="tag">${s.zone}</span><span class="tag">Prioridad ${fmt(s.priority)}</span></div>
        <div class="detail-kpis">
          <div><small>Familias</small><b>${fmt(s.families)}</b></div>
          <div><small>Personas</small><b>${fmt(s.people)}</b></div>
          <div><small>Sin estado</small><b>${fmt(s.unset)}</b></div>
          <div><small>No habitable</small><b>${fmt(s.noHab)}</b></div>
          <div><small>Destruida</small><b>${fmt(s.destroyed)}</b></div>
          <div><small>Núcleos vacíos</small><b>${fmt(s.empty)}</b></div>
        </div>
        <div class="detail-rate"><small>TASA RELATIVA DE PRIORIDAD</small><strong>${(s.rate*100).toFixed(1)}%</strong><span>sobre familias nominales del sector</span></div>
      </div>`;
  }

  function renderTerritorySummary(){
    const topByPriority = [...sectors].sort((a,b) => b.priority - a.priority)[0];
    const topByFamilies = [...sectors].sort((a,b) => b.families - a.families)[0];
    const zeroPriority = sectors.filter(s => s.priority === 0).length;
    const cards = [
      ['Sectores', sectors.length, 'territorios o sectores consolidados'],
      ['Mayor prioridad', topByPriority.name, `${topByPriority.priority} casos priorizados`],
      ['Mayor volumen', topByFamilies.name, `${topByFamilies.families} familias nominales`],
      ['Sin prioridad', zeroPriority, 'sectores sin no habitable o destruida']
    ];
    q('#territorySummaryGrid').innerHTML = cards.map(([label, value, desc]) => `<article class="summary-card"><small>${label}</small><strong>${value}</strong><span>${desc}</span></article>`).join('');
  }

  function renderTerritoryCards(){
    q('#territoryCardGrid').innerHTML = filterSectors().map(s => {
      const selectedClass = state.selected && state.selected.name === s.name ? 'is-selected' : '';
      const meterClass = s.priority >= 8 ? 'high' : '';
      return `<article class="territory-card ${selectedClass}" data-card-territory="${s.name}">
        <div class="tag-line"><span class="tag">${s.zone}</span><span class="tag">Prioridad ${fmt(s.priority)}</span></div>
        <h4>${s.name}</h4>
        <div class="priority-meter ${meterClass}"><span style="width:${(s.priority/maxPriority)*100}%"></span></div>
        <div class="meta">
          <div><small>Familias</small><b>${fmt(s.families)}</b></div>
          <div><small>Personas</small><b>${fmt(s.people)}</b></div>
          <div><small>Sin estado</small><b>${fmt(s.unset)}</b></div>
        </div>
      </article>`;
    }).join('');
    qa('[data-card-territory]').forEach(card => card.addEventListener('click', () => selectTerritory(card.dataset.cardTerritory)));
  }

  function renderTerritoryTable(){
    q('#territoryTableBody').innerHTML = filterSectors().map(s => `
      <tr data-row-territory="${s.name}">
        <td><b>${s.name}</b></td>
        <td>${fmt(s.families)}</td>
        <td>${fmt(s.people)}</td>
        <td>${fmt(s.noHab)}</td>
        <td>${fmt(s.destroyed)}</td>
        <td>${fmt(s.unset)}</td>
        <td>${fmt(s.empty)}</td>
        <td><b>${fmt(s.priority)}</b></td>
      </tr>`).join('');
    qa('[data-row-territory]').forEach(row => row.addEventListener('click', () => selectTerritory(row.dataset.rowTerritory)));
  }

  function bindTerritoryControls(){
    q('#territorySearch').addEventListener('input', e => { state.filter = e.target.value; renderTerritory(); });
    q('#territorySort').addEventListener('change', e => { state.sort = e.target.value; renderTerritory(); });
    q('#onlyPriority').addEventListener('change', e => { state.onlyPriority = e.target.checked; renderTerritory(); });
    q('#resetTerritoryFilters').addEventListener('click', () => {
      state.filter = ''; state.sort = 'families'; state.onlyPriority = false; q('#territorySearch').value=''; q('#territorySort').value='families'; q('#onlyPriority').checked=false; renderTerritory();
    });
    qa('[data-territory-view]').forEach(btn => btn.addEventListener('click', () => {
      state.view = btn.dataset.territoryView;
      qa('[data-territory-view]').forEach(b => b.classList.toggle('is-active', b===btn));
      qa('[data-territory-container]').forEach(box => box.hidden = box.dataset.territoryContainer !== state.view);
    }));
  }

  function renderTerritory(){ renderMap(); renderTerritorySummary(); renderTerritoryCards(); renderTerritoryTable(); renderTerritoryFocus(); }

  function renderHousing(){
    q('#priorityUniverse').textContent = fmt(summary.housing.noHab + summary.housing.destroyed);
    q('#priorityNoHab').textContent = fmt(summary.housing.noHab);
    q('#priorityDestroyed').textContent = fmt(summary.housing.destroyed);
    q('#priorityEvacuated').textContent = fmt(summary.housing.evacuated);
    q('#priorityMultiple').textContent = fmt(summary.housing.multiple);
    const bars = [
      ['Habitable', summary.housing.habitable, 'default'],
      ['Averiada', summary.housing.damaged, 'warn'],
      ['No habitable', summary.housing.noHab, 'danger'],
      ['Destruida', summary.housing.destroyed, 'dark'],
      ['Sin estado', summary.withoutStatus, 'default']
    ];
    q('#housingBars').innerHTML = bars.map(([label, value, cls]) => `<div class="meter-item"><div class="label"><b>${label}</b><span>${fmt(value)} · ${((value/summary.families)*100).toFixed(1)}%</span></div><div class="meter ${cls}"><span style="width:${(value/summary.families)*100}%"></span></div></div>`).join('');
    const mini = [
      ['Sin estado', summary.withoutStatus, 'Dificulta priorizar la seguridad habitacional y exige revisión de campo.'],
      ['Núcleos vacíos', summary.empty, 'No deben confundirse con familias efectivas del censo.'],
      ['Marcas múltiples', summary.housing.multiple, 'Generan ambigüedad y deben resolverse antes del cierre.'],
      ['Evacuadas', summary.housing.evacuated, 'Apoyan la lectura de riesgo y las medidas de protección.']
    ];
    q('#housingAlerts').innerHTML = mini.map(([label,val,text]) => `<article class="mini-issue"><small>${label}</small><b>${fmt(val)}</b><p>${text}</p></article>`).join('');
  }

  function renderSimpleCharts(){
    const chart = (target, items, total) => {
      q(target).innerHTML = items.map(([label, value]) => `<div class="bar-row"><b>${label}</b><div class="bar-track"><span style="width:${(value/total)*100}%"></span></div><div class="bar-value">${fmt(value)} · ${((value/total)*100).toFixed(1)}%</div></div>`).join('');
    }
    chart('#sexChart', summary.sex, summary.people);
    chart('#ageChart', summary.ages, summary.people);
    chart('#locationChart', summary.location, summary.families);
  }

  function renderQuality(){
    q('#completenessGrid').innerHTML = summary.completeness.map(([label, count, total]) => `<div class="meter-item"><div class="label"><b>${label}</b><span>${fmt(count)} / ${fmt(total)} · ${((count/total)*100).toFixed(1)}%</span></div><div class="meter"><span style="width:${(count/total)*100}%"></span></div></div>`).join('');
    q('#qualityIssueGrid').innerHTML = summary.qualityIssues.map(([title, count, risk, treatment]) => `<article class="issue-card"><small>${fmt(count)} casos</small><h4>${title}</h4><p><b>Riesgo:</b> ${risk}</p><p><b>Tratamiento:</b> ${treatment}</p></article>`).join('');
  }

  function renderDeck(target, items, prefix){
    q(target).innerHTML = items.map((text, i) => `<article class="deck-card" draggable="true"><small>${prefix} ${String(i+1).padStart(2,'0')}</small><p>${text}</p></article>`).join('');
    enableDeckDnD(q(target));
  }

  function enableDeckDnD(deck){
    let dragged = null;
    [...deck.children].forEach(card => {
      card.addEventListener('dragstart', () => { dragged = card; card.classList.add('dragging'); });
      card.addEventListener('dragend', () => { card.classList.remove('dragging'); dragged = null; });
      card.addEventListener('dragover', e => e.preventDefault());
      card.addEventListener('drop', e => {
        e.preventDefault();
        if(dragged && dragged !== card){
          const nodes = [...deck.children];
          const draggedIndex = nodes.indexOf(dragged);
          const targetIndex = nodes.indexOf(card);
          if(draggedIndex < targetIndex) deck.insertBefore(dragged, card.nextSibling); else deck.insertBefore(dragged, card);
        }
      });
    });
  }

  function shuffleDeck(selector){
    const deck = q(selector);
    const items = [...deck.children];
    items.sort(() => Math.random() - .5).forEach(el => deck.appendChild(el));
  }

  function renderMethod(){
    renderDeck('#objectiveDeck', summary.methodObjective, 'A');
    renderDeck('#limitationsDeck', summary.limitations, 'L');
    q('#appliedRules').innerHTML = summary.appliedRules.map(t => `<li>${t}</li>`).join('');
    q('#shuffleObjective').addEventListener('click', () => shuffleDeck('#objectiveDeck'));
    q('#shuffleLimitations').addEventListener('click', () => shuffleDeck('#limitationsDeck'));
  }

  function renderTimeline(){
    q('#timelineList').innerHTML = summary.updates.map(item => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content">
          <div class="meta"><b>${item.date}</b><span>${item.version}</span><span class="status">${item.status}</span></div>
          <h4>${item.title}</h4>
          <p>${item.note}</p>
        </div>
      </div>`).join('');
  }

  function renderDocuments(){
    q('#documentGrid').innerHTML = summary.documents.map(([title,type,text]) => `<article class="document-card"><small>${type}</small><h3>${title}</h3><p>${text}</p></article>`).join('');
  }

  function renderAdmin(){
    const adminKpis = [
      ['Familias nominales', summary.families], ['Casos prioritarios', summary.housing.noHab + summary.housing.destroyed], ['Sin estado', summary.withoutStatus], ['Núcleos vacíos', summary.empty]
    ];
    q('#adminKpis').innerHTML = adminKpis.map(([label,val]) => `<article class="admin-kpi"><small>${label}</small><strong>${fmt(val)}</strong></article>`).join('');
    q('#adminTerritoryQueue').innerHTML = `<ol>${[...sectors].sort((a,b) => b.priority-a.priority).slice(0,8).map(s => `<li><b>${s.name}</b> · prioridad ${s.priority}</li>`).join('')}</ol>`;
    qa('#adminTabs [data-admin]').forEach(btn => btn.addEventListener('click', () => {
      qa('#adminTabs [data-admin]').forEach(b => b.classList.toggle('is-active', b===btn));
      qa('[data-admin-panel]').forEach(panel => panel.classList.toggle('is-active', panel.dataset.adminPanel === btn.dataset.admin));
    }));
  }

  function initSearch(){
    const search = q('#globalSearch');
    const results = q('#searchResults');
    const docs = [
      {title:'Inicio', target:'#inicio', desc:'Portada institucional reconstruida'},
      {title:'Base territorial', target:'#territorio', desc:'Mapa, tarjetas y tabla clara'},
      {title:'Universo de verificación', target:'#vivienda', desc:'No habitable, destruida y lectura operativa'},
      {title:'Población', target:'#poblacion', desc:'Sexo, edad y ubicación declarada'},
      {title:'Calidad', target:'#calidad', desc:'Completitud y brechas'},
      {title:'Metodología', target:'#metodologia', desc:'Alcance, limitaciones y reglas'},
      {title:'Actualizaciones', target:'#actualizaciones', desc:'Bitácora pública'},
      {title:'Panel admin', target:'#admin', desc:'Gestión interna'}
    ];
    search.addEventListener('input', () => {
      const term = search.value.trim().toLowerCase();
      if(!term){ results.hidden = true; results.innerHTML=''; return; }
      const hits = docs.filter(item => (item.title + ' ' + item.desc).toLowerCase().includes(term));
      results.hidden = hits.length === 0;
      results.innerHTML = hits.map(item => `<a href="${item.target}"><b>${item.title}</b><small>${item.desc}</small></a>`).join('');
      qa('#searchResults a').forEach(a => a.addEventListener('click', () => { results.hidden=true; search.value=''; }));
    });
    document.addEventListener('click', e => {
      if(!results.contains(e.target) && e.target !== search) results.hidden = true;
    });
  }

  function initTheme(){
    q('#themeToggle').addEventListener('click', () => document.body.classList.toggle('light-mode'));
  }

  function initNavSpy(){
    const sections = qa('main section[id]');
    const navLinks = qa('.main-nav a');
    const spy = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          navLinks.forEach(link => link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { threshold:.3 });
    sections.forEach(sec => spy.observe(sec));
  }

  initHero();
  bindTerritoryControls();
  renderTerritory();
  renderHousing();
  renderSimpleCharts();
  renderQuality();
  renderMethod();
  renderTimeline();
  renderDocuments();
  renderAdmin();
  initSearch();
  initTheme();
  initNavSpy();
  revealSections();
})();
