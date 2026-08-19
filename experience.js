(() => {
  'use strict';
  const D = window.REPORT_DATA;
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const ns = 'http://www.w3.org/2000/svg';
  const fmt = n => new Intl.NumberFormat('es-CO').format(n);
  const pct = n => `${Number(n).toFixed(1).replace('.', ',')}%`;

  function setMouseGlow(){
    let raf=0;
    window.addEventListener('pointermove', e => {
      if(raf) return;
      raf=requestAnimationFrame(()=>{
        document.documentElement.style.setProperty('--mx', `${e.clientX}px`);
        document.documentElement.style.setProperty('--my', `${e.clientY}px`);
        raf=0;
      });
    }, {passive:true});
  }

  function setScrollProgress(){
    const bar=$('#scrollProgress'); if(!bar) return;
    const update=()=>{
      const max=document.documentElement.scrollHeight-innerHeight;
      const v=max>0 ? Math.min(100,Math.max(0,scrollY/max*100)) : 0;
      bar.style.width=`${v}%`;
    };
    addEventListener('scroll',update,{passive:true}); addEventListener('resize',update,{passive:true}); update();
  }

  function initReveal(){
    const selectors=['.panel','.kpi-card','.quick-strip button','.demo-card','.quality-card','.method-step','.priority-action','.matrix-card','.territory-summary-card'];
    const nodes=$$(selectors.join(',')).filter(n=>!n.closest('.story-visual'));
    nodes.forEach(n=>n.classList.add('reveal-node'));
    if(!('IntersectionObserver' in window)){nodes.forEach(n=>n.classList.add('in-view'));return;}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{
      if(e.isIntersecting){e.target.classList.add('in-view');io.unobserve(e.target)}
    }),{threshold:.08,rootMargin:'0px 0px -5% 0px'});
    nodes.forEach(n=>io.observe(n));
  }

  function parseDisplayNumber(text){
    const raw=(text||'').trim();
    if(!/[0-9]/.test(raw)) return null;
    const isPct=raw.includes('%');
    let clean=raw.replace(/[^0-9,.-]/g,'');
    if(clean.includes('.') && !clean.includes(',')) clean=clean.replace(/\./g,'');
    clean=clean.replace(',','.');
    const n=Number(clean);
    if(!Number.isFinite(n)) return null;
    return {n,isPct,decimals:isPct&&raw.includes(',')?1:0,raw};
  }
  function animateValue(el){
    if(el.dataset.counted==='1') return;
    const parsed=parseDisplayNumber(el.textContent); if(!parsed) return;
    el.dataset.counted='1';
    const {n,isPct,decimals}=parsed; const dur=850; const start=performance.now();
    const render=v=>{
      if(isPct) el.textContent=`${v.toFixed(decimals).replace('.',',')}%`;
      else el.textContent=fmt(Math.round(v));
    };
    render(0);
    const tick=t=>{
      const p=Math.min(1,(t-start)/dur); const ease=1-Math.pow(1-p,4); render(n*ease);
      if(p<1) requestAnimationFrame(tick);
    }; requestAnimationFrame(tick);
  }
  function initCountUps(){
    const targets=$$('.kpi-card strong,.quick-strip b,.story-number,.focus-number,.demo-card strong,.quality-top-card strong,.territory-summary-card strong');
    if(!('IntersectionObserver' in window)){targets.forEach(animateValue);return;}
    const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){animateValue(e.target);io.unobserve(e.target)}}),{threshold:.35});
    targets.forEach(t=>io.observe(t));
  }

  function initAudienceMode(){
    const btn=$('#audienceMode'); if(!btn) return;
    let active=false;
    const paint=()=>{btn.innerHTML=active?'<span>◉</span> Salir de audiencia':'<span>◉</span> Modo audiencia';btn.setAttribute('aria-pressed',String(active));};
    btn.addEventListener('click', async()=>{
      active=!active; document.body.classList.toggle('audience-mode',active); paint();
      try{
        if(active && !document.fullscreenElement && document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
        else if(!active && document.fullscreenElement && document.exitFullscreen) await document.exitFullscreen();
      }catch{}
    });
    document.addEventListener('fullscreenchange',()=>{
      if(!document.fullscreenElement && active){active=false;document.body.classList.remove('audience-mode');paint()}
    });
    paint();
  }

  const storyData=[
    {chapter:'CAPÍTULO 01 · ALCANCE',metric:'432',headline:'familias con registro nominal',body:'El censo consolida información nominal de hogares distribuidos en 25 territorios o sectores.',alt:false},
    {chapter:'CAPÍTULO 02 · PRIORIDAD',metric:'92',headline:'casos iniciales de verificación prioritaria',body:'90 marcas “no habitable” y 2 “destruida” orientan el primer frente de verificación en campo.',alt:false},
    {chapter:'CAPÍTULO 03 · PERSONAS',metric:'462',headline:'personas con enfoque diferencial por edad',body:'179 menores de edad y 283 personas de 60 años o más requieren una lectura sensible a edad, apoyo y alojamiento.',alt:true},
    {chapter:'CAPÍTULO 04 · CALIDAD',metric:'111',headline:'núcleos vacíos aún por depurar',body:'La calidad del registro condiciona el cierre: además hay 23 grupos de documentos repetidos y 40 familias sin estado.',alt:true}
  ];
  function initScrollytelling(){
    const visual=$('#storyVisual'); const steps=$$('.story-step'); if(!visual||!steps.length) return;
    const chapter=$('#storyChapter'), metric=$('#storyMetric'), headline=$('#storyHeadline'), body=$('#storyBody'), indices=$$('.story-index i');
    indices.forEach((i,idx)=>i.classList.toggle('active',idx===0));
    let current=0;
    function activate(i){
      if(i===current && steps[i].classList.contains('is-active')) return;
      current=i; steps.forEach((s,j)=>s.classList.toggle('is-active',j===i)); indices.forEach((n,j)=>n.classList.toggle('active',j===i));
      const d=storyData[i]; visual.classList.toggle('alt',d.alt);
      [chapter,metric,headline,body].forEach(el=>{el.animate([{opacity:.15,transform:'translateY(9px)'},{opacity:1,transform:'none'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'})});
      chapter.textContent=d.chapter; metric.textContent=d.metric; headline.textContent=d.headline; body.textContent=d.body;
    }
    if('IntersectionObserver' in window){
      const io=new IntersectionObserver(entries=>{
        entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio).slice(0,1).forEach(e=>activate(+e.target.dataset.storyStep));
      },{threshold:[.35,.55,.75],rootMargin:'-15% 0px -38% 0px'});
      steps.forEach(s=>io.observe(s));
    }
    steps.forEach(s=>s.addEventListener('click',()=>activate(+s.dataset.storyStep)));
  }

  function svgEl(tag, attrs={}){
    const el=document.createElementNS(ns,tag); Object.entries(attrs).forEach(([k,v])=>el.setAttribute(k,String(v))); return el;
  }
  function getFilteredTerritories(){
    if(!D?.territories) return [];
    const q=($('#sectorSearch')?.value||'').trim().toLowerCase();
    const minF=+($('#minFamilies')?.value||0); const minP=+($('#minPriority')?.value||0);
    const onlyCritical=$('#onlyCritical')?.checked; const onlyEmpty=$('#onlyEmpty')?.checked; const onlyNoState=$('#onlyNoState')?.checked;
    return D.territories.filter(t=>{
      const priority=t.noHab+t.destroyed;
      if(q&&!t.sector.toLowerCase().includes(q))return false;
      if(t.families<minF||priority<minP)return false;
      if(onlyCritical&&priority===0)return false;
      if(onlyEmpty&&t.empty===0)return false;
      if(onlyNoState&&t.noState===0)return false;
      return true;
    });
  }
  function renderBubblePlot(){
    const svg=$('#territoryBubblePlot'); if(!svg) return;
    const tooltip=$('#bubbleTooltip'); const arr=getFilteredTerritories(); svg.innerHTML='';
    const W=1000,H=420,m={l:65,r:28,t:30,b:55},iw=W-m.l-m.r,ih=H-m.t-m.b;
    const maxF=Math.max(75,...arr.map(t=>t.families));
    const rates=arr.map(t=>t.families?(t.noHab+t.destroyed)/t.families*100:0); const maxRate=Math.max(70,Math.ceil(Math.max(0,...rates)/10)*10);
    const x=v=>m.l+iw*(v/maxF); const y=v=>m.t+ih*(1-v/maxRate);
    const xTicks=[0,15,30,45,60,75].filter(v=>v<=maxF); const yTicks=[]; for(let v=0;v<=maxRate;v+=10)yTicks.push(v);
    yTicks.forEach(v=>{const yy=y(v);svg.appendChild(svgEl('line',{x1:m.l,x2:W-m.r,y1:yy,y2:yy,class:'grid'}));const tx=svgEl('text',{x:m.l-12,y:yy+4,'text-anchor':'end',class:'axis-label'});tx.textContent=`${v}%`;svg.appendChild(tx)});
    xTicks.forEach(v=>{const xx=x(v);svg.appendChild(svgEl('line',{x1:xx,x2:xx,y1:m.t,y2:H-m.b,class:'grid'}));const tx=svgEl('text',{x:xx,y:H-m.b+25,'text-anchor':'middle',class:'axis-label'});tx.textContent=v;svg.appendChild(tx)});
    const xt=svgEl('text',{x:m.l+iw/2,y:H-9,'text-anchor':'middle',class:'axis-title'});xt.textContent='Familias nominales registradas';svg.appendChild(xt);
    const yt=svgEl('text',{x:16,y:m.t+ih/2,transform:`rotate(-90 16 ${m.t+ih/2})`,'text-anchor':'middle',class:'axis-title'});yt.textContent='Tasa prioritaria exploratoria*';svg.appendChild(yt);
    const topNames=new Set([...arr].sort((a,b)=>b.families-a.families).slice(0,6).map(t=>t.sector));
    arr.forEach(t=>{
      const priority=t.noHab+t.destroyed; const rate=t.families?priority/t.families*100:0; const cx=x(t.families),cy=y(rate); const r=Math.max(6,Math.min(22,5+Math.sqrt(t.people)*1.2));
      const fill=rate>=30?'#ff5d67':rate>=15?'#ffb52e':'#2b86ff'; const circle=svgEl('circle',{cx,cy,r,fill,'fill-opacity':.76,stroke:'#fff','stroke-width':2,class:'bubble','data-sector':t.sector});
      svg.appendChild(circle);
      if(topNames.has(t.sector)||rate>=30){const label=svgEl('text',{x:cx+r+6,y:cy+3,class:'bubble-label'});label.textContent=t.sector.length>21?t.sector.slice(0,19)+'…':t.sector;svg.appendChild(label)}
      const show=e=>{
        if(!tooltip)return; const rect=svg.getBoundingClientRect(); const px=(e.clientX||rect.left+cx/W*rect.width)-rect.left+12; const py=(e.clientY||rect.top+cy/H*rect.height)-rect.top-12;
        tooltip.innerHTML=`<b>${t.sector}</b><span>${fmt(t.families)} familias · ${fmt(t.people)} personas<br>${fmt(priority)} casos prioritarios · ${pct(rate)}*</span>`;tooltip.hidden=false;tooltip.style.left=`${Math.min(px,rect.width-235)}px`;tooltip.style.top=`${Math.max(8,py)}px`;
      };
      circle.addEventListener('pointerenter',show);circle.addEventListener('pointermove',show);circle.addEventListener('pointerleave',()=>{if(tooltip)tooltip.hidden=true});
      circle.addEventListener('click',()=>{const sel=CSS.escape?CSS.escape(t.sector):t.sector.replace(/"/g,'\\"');const row=document.querySelector(`.rank-row[data-sector="${sel}"]`);if(row)row.click()});
    });
    if(!arr.length){const t=svgEl('text',{x:W/2,y:H/2,'text-anchor':'middle',class:'axis-title'});t.textContent='No hay sectores que coincidan con los filtros actuales.';svg.appendChild(t)}
  }
  function initBubblePlot(){
    renderBubblePlot();
    ['sectorSearch','sortBy','minFamilies','minPriority','onlyCritical','onlyEmpty','onlyNoState'].forEach(id=>{
      const el=$('#'+id); if(!el)return; el.addEventListener('input',()=>requestAnimationFrame(renderBubblePlot));el.addEventListener('change',()=>requestAnimationFrame(renderBubblePlot));
    });
    $('#resetFiltersBtn')?.addEventListener('click',()=>setTimeout(renderBubblePlot,0));
    $('#themeToggle')?.addEventListener('click',()=>setTimeout(renderBubblePlot,20));
  }

  function enhanceSearch(){
    const wrap=$('.global-search-wrap'),input=$('#globalSearch'),results=$('#globalSearchResults'); if(!wrap||!input||!results)return;
    input.setAttribute('placeholder','Buscar en el informe — sector, cifra, capítulo, hallazgo…');
    results.setAttribute('aria-label','Resultados de búsqueda en línea');
    // Nunca crea overlay ni bloquea el resto de la interfaz.
    results.addEventListener('wheel',e=>e.stopPropagation(),{passive:true});
  }

  function initRouteFlourish(){
    $$('.nav-item').forEach((b,i)=>b.style.setProperty('--nav-index',i));
    document.addEventListener('click',e=>{
      const nav=e.target.closest('.nav-item,[data-route-jump]'); if(!nav)return;
      setTimeout(()=>{window.scrollTo({top:0,behavior:'smooth'});initReveal();initCountUps();},40);
    });
  }

  function boot(){
    setMouseGlow(); setScrollProgress(); initReveal(); initCountUps(); initAudienceMode(); initScrollytelling(); initBubblePlot(); enhanceSearch(); initRouteFlourish();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
