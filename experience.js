const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>[...r.querySelectorAll(s)];

const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let revealObserver=null,storyObserver=null;

const chapterConfig={
  territorio:{
    note:['⌖','Empieza por el mapa','Selecciona un sector para ver su ficha. Después puedes comparar el volumen de registros, revisar prioridad y consultar la tabla completa.'],
    items:[['Mapa','Ubica tu sector','.map-layout'],['Ranking','Compara concentración','.territory-analytics'],['Base territorial','Revisa todos los sectores','.table-panel'],['Filtros','Segmenta la consulta','.territory-toolbar']]
  },
  vivienda:{
    note:['⌂','Primero entiende la categoría','“Habitable”, “averiada”, “no habitable” y “destruida” son marcas consignadas en el censo. La lectura técnica debe hacerse junto con verificación de campo.'],
    items:[['Resumen','Universo y prioridad','.housing-lead'],['Clasificación','Lee cada marca','.housing-chart-card'],['Qué significa','Interpretación sencilla','.housing-meaning-grid'],['Brechas','Qué falta resolver','.housing-detail-grid']]
  },
  poblacion:{
    note:['◎','Una lectura sobre personas','La caracterización ayuda a orientar la respuesta según edad, ubicación y condiciones diferenciales; no reemplaza una valoración individual del hogar.'],
    items:[['Sexo','Distribución registrada','#sexChart'],['Edad','Ciclo de vida','#lifeCycleChart'],['Ubicación','Rural y urbana','#locationChart'],['Enfoque','Grupos diferenciales','#differentialKpis']]
  },
  calidad:{
    note:['✓','Qué tan confiable es el corte','Aquí puedes ver qué campos están completos, qué inconsistencias siguen abiertas y qué tareas de depuración deben resolverse antes de un cierre oficial.'],
    items:[['Completitud','Campos críticos','.quality-layout'],['Hallazgos','Cola de depuración','#qualityIssues'],['Reglas','Aseguramiento del dato','.rules-panel']]
  },
  evolucion:{
    note:['↻','Cada corte conserva su historia','Una nueva publicación no borra la anterior. El histórico permite verificar cómo evolucionaron las cifras y qué cambió entre versiones.'],
    items:[['Histórico','Cortes publicados','.timeline-hero'],['Comparar','Diferencias entre cortes','.compare-box'],['Resultados','Variaciones clave','#compareResults']]
  },
  metodologia:{
    note:['→','Cómo se convierte un censo en información pública','El proceso separa captura, control, depuración, validación institucional y publicación para mantener trazabilidad.'],
    items:[['Flujo','Paso a paso','#methodFlow'],['Objeto','Qué cubre el informe','#objectiveScope'],['Límites','Qué no concluye','#limitationsList'],['Reglas','Cómo se consolidó','#appliedRules']]
  },
  informes:{
    note:['▤','Documentos que respaldan el portal','Consulta el informe técnico, piezas visuales y archivos públicos. Usa la búsqueda o filtra por tipo de documento.'],
    items:[['Biblioteca','Buscar y filtrar','.document-toolbar'],['Documentos','Archivos publicados','#documentGrid'],['Informe fuente','Documento completo','.pdf-panel']]
  },
  actualizaciones:{
    note:['↻','Qué cambió y cuándo','Las actualizaciones públicas permiten conocer la fecha, versión y nota de cambio de cada publicación, sin sobrescribir la historia del portal.'],
    items:[['Cambios','Línea de tiempo','#publicTimeline'],['Proceso','Cómo se publica','.updates-layout aside']]
  },
  fuentes:{
    note:['§','Cómo leer el portal con contexto','Esta sección explica el evento, la relación entre RUFE y RUD, el marco normativo, las conclusiones y los responsables del documento.'],
    items:[['Contexto','Evento y alcance','#eventContext'],['RUFE / RUD','Qué acredita','#rufeRud'],['Normativa','Marco aplicable','#regulatoryFramework'],['Conclusiones','Lectura institucional','#conclusionsList']]
  }
};

function setupReadingProgress(){
  const bar=$('#readingProgress span'); if(!bar)return;
  const update=()=>{
    const doc=document.documentElement;
    const max=Math.max(1,doc.scrollHeight-innerHeight);
    bar.style.width=`${Math.min(100,scrollY/max*100)}%`;
    $('#topbar')?.classList.toggle('compact-bar',scrollY>24);
    if(!prefersReduced){
      const hero=$('#inicioHero');
      if(hero && $('#view-inicio')?.classList.contains('active')){
        const y=Math.min(1,scrollY/Math.max(1,innerHeight));
        hero.style.setProperty('--hero-scroll',y.toFixed(3));
      }
    }
  };
  addEventListener('scroll',update,{passive:true}); update();
}

function setupReveal(){
  revealObserver?.disconnect();
  if(prefersReduced){$$('.reveal,.view.active .panel,.view.active .page-hero').forEach(x=>x.classList.add('in-view'));return}
  revealObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');revealObserver.unobserve(e.target)}}),{threshold:.08,rootMargin:'0px 0px -8% 0px'});
  $$('.view.active .reveal,.view.active .panel,.view.active .page-hero,.view.active .table-panel,.view.active .housing-chart-card,.view.active .meaning-card,.view.active .doc-card,.view.active .issue-card,.view.active .framework-card').forEach((el,i)=>{
    el.classList.add('reveal');
    el.style.transitionDelay=`${Math.min(i%6,5)*45}ms`;
    revealObserver.observe(el);
  });
}

function setupCarousels(){
  $$('[data-carousel-controls]').forEach(ctrl=>{
    if(ctrl.dataset.bound)return; ctrl.dataset.bound='1';
    const target=$(`#${ctrl.dataset.carouselControls}`); if(!target)return;
    $$('button',ctrl).forEach(btn=>btn.addEventListener('click',()=>target.scrollBy({left:Number(btn.dataset.dir||1)*Math.min(target.clientWidth*.78,420),behavior:'smooth'})));
  });
  const deck=$('#dashboardDeck');
  $('[data-deck-prev]')?.addEventListener('click',()=>deck?.scrollBy({left:-Math.min(deck.clientWidth*.82,760),behavior:'smooth'}));
  $('[data-deck-next]')?.addEventListener('click',()=>deck?.scrollBy({left:Math.min(deck.clientWidth*.82,760),behavior:'smooth'}));
  $$('.scroll-snap,.xmb-nav,.chapter-rail').forEach(el=>enableDragScroll(el));
}

function enableDragScroll(el){
  if(!el||el.dataset.dragBound)return; el.dataset.dragBound='1';
  let down=false,startX=0,startLeft=0,moved=false;
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse'&&e.button!==0)return;down=true;moved=false;startX=e.clientX;startLeft=el.scrollLeft;el.setPointerCapture?.(e.pointerId)});
  el.addEventListener('pointermove',e=>{if(!down)return;const dx=e.clientX-startX;if(Math.abs(dx)>5)moved=true;el.scrollLeft=startLeft-dx});
  el.addEventListener('pointerup',e=>{down=false;if(moved&&e.target.closest('a'))e.preventDefault()});
  el.addEventListener('pointercancel',()=>down=false);
}

function storyMeta(index,number){
  const items=[
    {k:'PANORAMA DEL CENSO',title:'familias con registro nominal',text:'Son núcleos familiares que cuentan con al menos una persona identificada en la base consolidada del corte.',link:'#territorio',label:'Explorar dónde están →',img:'assets/photos/photo-04.jpg'},
    {k:'VERIFICACIÓN PRIORITARIA',title:'casos iniciales para verificar',text:'Corresponden a marcas censales “no habitable” o “destruida”. Orientan la prioridad, pero no reemplazan una inspección estructural.',link:'#vivienda',label:'Entender la vivienda →',img:'assets/photos/photo-11.jpg'},
    {k:'ENFOQUE DIFERENCIAL',title:'personas en grupos de edad priorizados',text:'La suma de menores de edad y personas de 60 años o más ayuda a orientar medidas de asistencia y acompañamiento.',link:'#poblacion',label:'Ver caracterización →',img:'assets/photos/photo-06.jpg'},
    {k:'CALIDAD DEL DATO',title:'núcleos preenumerados vacíos',text:'Deben confirmarse como filas de plantilla, completarse o excluirse mediante una depuración documentada para evitar sobreestimaciones.',link:'#calidad',label:'Ver qué falta depurar →',img:'assets/photos/photo-03.jpg'}
  ];
  return {...items[index]||items[0],number};
}

function setupScrolly(){
  storyObserver?.disconnect();
  const steps=$$('#storySteps .story-step'); if(!steps.length)return;
  const activate=index=>{
    steps.forEach((s,i)=>s.classList.toggle('active',i===index));
    const number=steps[index]?.querySelector('b')?.textContent?.trim()||'—';
    const m=storyMeta(index,number);
    const visual=$('#scrollyVisual');
    visual?.classList.add('swap');
    setTimeout(()=>{
      if($('#scrollyNumber'))$('#scrollyNumber').textContent=m.number;
      if($('#scrollyKicker'))$('#scrollyKicker').textContent=m.k;
      if($('#scrollyTitle'))$('#scrollyTitle').textContent=m.title;
      if($('#scrollyText'))$('#scrollyText').textContent=m.text;
      if($('#scrollyLink')){$('#scrollyLink').href=m.link;$('#scrollyLink').textContent=m.label}
      if($('#scrollyImage') && !$('#scrollyImage').src.endsWith(m.img))$('#scrollyImage').src=m.img;
      if($('#scrollyProgress'))$('#scrollyProgress').style.width=`${(index+1)/steps.length*100}%`;
      visual?.classList.remove('swap');
    },prefersReduced?0:170);
  };
  activate(0);
  storyObserver=new IntersectionObserver(entries=>{
    const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
    if(visible)activate(steps.indexOf(visible.target));
  },{threshold:[.3,.5,.7],rootMargin:'-22% 0px -22% 0px'});
  steps.forEach(step=>storyObserver.observe(step));
}

function addChapterRails(){
  Object.entries(chapterConfig).forEach(([route,cfg])=>{
    const view=$(`#view-${route}`); if(!view||view.querySelector('.chapter-rail'))return;
    const hero=view.querySelector('.page-hero,.admin-hero'); if(!hero)return;
    const rail=document.createElement('div');rail.className='chapter-rail';rail.setAttribute('aria-label','Accesos dentro de esta sección');
    cfg.items.forEach(([title,desc,selector],i)=>{
      const a=document.createElement('a');a.href='javascript:void(0)';a.innerHTML=`<small>0${i+1}</small><b>${title}</b><span>${desc}</span>`;
      a.addEventListener('click',()=>{const target=view.querySelector(selector)||document.querySelector(selector);target?.scrollIntoView({behavior:prefersReduced?'auto':'smooth',block:'start'})});rail.appendChild(a);
    });
    hero.insertAdjacentElement('afterend',rail);
    const [icon,title,text]=cfg.note;
    const note=document.createElement('aside');note.className='section-explainer reveal';note.innerHTML=`<i aria-hidden="true">${icon}</i><div><b>${title}</b><p>${text}</p></div>`;
    rail.insertAdjacentElement('afterend',note);
  });
}


function setupMobileSheet(){
  const sheet=$('#mobileSheet'),close=$('#mobileSheetClose'),searchBtn=$('#mobileSearchOpen');if(!sheet)return;
  close?.addEventListener('click',()=>sheet.hidden=true);
  $$('#mobileSheet a').forEach(a=>a.addEventListener('click',()=>sheet.hidden=true));
  searchBtn?.addEventListener('click',()=>{sheet.hidden=true;$('#topbar')?.classList.add('search-open');setTimeout(()=>$('#globalSearch')?.focus(),40)});
}

function setupFloatingGuide(){
  const btn=$('#floatingGuideToggle'),panel=$('#floatingGuidePanel');if(!btn||!panel||btn.dataset.bound)return;btn.dataset.bound='1';
  btn.addEventListener('click',()=>{const open=panel.hidden;panel.hidden=!open;btn.setAttribute('aria-expanded',String(open))});
  document.addEventListener('click',e=>{if(!e.target.closest('#floatingGuide')){panel.hidden=true;btn.setAttribute('aria-expanded','false')}});
  $$('a',panel).forEach(a=>a.addEventListener('click',()=>panel.hidden=true));
}

function updateRouteChrome(){
  const route=(location.hash||'#inicio').slice(1).split('?')[0]||'inicio';
  $$('[data-xmb]').forEach(a=>a.classList.toggle('active',a.dataset.xmb===route));
  setupReveal();
  requestAnimationFrame(()=>$$('.chapter-rail').forEach(enableDragScroll));
}

function enhanceDynamicContent(){
  setupScrolly();
  setupReveal();
  // Animate newly rendered value bars only when they enter the viewport.
  $$('.meter-track span,.housing-track span,.rank-bar i b,.location-row i b').forEach(el=>{el.style.willChange='transform'});
}

setupReadingProgress();
addChapterRails();
setupCarousels();
setupFloatingGuide();
setupMobileSheet();
updateRouteChrome();

window.addEventListener('rufe:render',enhanceDynamicContent);
window.addEventListener('rufe:route',updateRouteChrome);
window.addEventListener('hashchange',updateRouteChrome);

// app.js can render from the local fallback before this module executes.
queueMicrotask(()=>{enhanceDynamicContent();setupCarousels()});
