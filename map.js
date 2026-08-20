(function(){
  const TILE=256;
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  function project(lat,lng,z){
    const scale=TILE*Math.pow(2,z);
    const x=(lng+180)/360*scale;
    const sin=Math.sin(lat*Math.PI/180);
    const y=(.5-Math.log((1+sin)/(1-sin))/(4*Math.PI))*scale;
    return {x,y};
  }
  function unproject(x,y,z){
    const scale=TILE*Math.pow(2,z);
    const lng=x/scale*360-180;
    const n=Math.PI-2*Math.PI*y/scale;
    const lat=180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)));
    return {lat,lng};
  }

  class RufeSlippyMap{
    constructor(el,{center={lat:3.985,lng:-76.22},zoom=12,minZoom=10,maxZoom=16,onSelect}={}){
      this.el=el; this.tileLayer=el.querySelector('#mapTiles')||el.querySelector('.tile-layer'); this.markerLayer=el.querySelector('#mapMarkers')||el.querySelector('.marker-layer');
      this.center=center; this.zoom=zoom; this.minZoom=minZoom; this.maxZoom=maxZoom; this.onSelect=onSelect||(()=>{}); this.points=[]; this.selected=null; this.drag=null;
      this.bind(); this.render();
      this.ro=new ResizeObserver(()=>this.render()); this.ro.observe(el);
    }
    bind(){
      this.el.addEventListener('pointerdown',e=>{
        if(e.target.closest('.map-marker,.map-controls')) return;
        this.drag={x:e.clientX,y:e.clientY,center:{...this.center}}; this.el.classList.add('dragging'); this.el.setPointerCapture?.(e.pointerId);
      });
      this.el.addEventListener('pointermove',e=>{
        if(!this.drag) return;
        const p=project(this.drag.center.lat,this.drag.center.lng,this.zoom);
        const nx=p.x-(e.clientX-this.drag.x), ny=p.y-(e.clientY-this.drag.y);
        this.center=unproject(nx,ny,this.zoom); this.render();
      });
      const stop=e=>{if(this.drag){this.drag=null;this.el.classList.remove('dragging')}};
      this.el.addEventListener('pointerup',stop); this.el.addEventListener('pointercancel',stop);
      this.el.addEventListener('wheel',e=>{
        e.preventDefault(); const delta=e.deltaY<0?1:-1; this.setZoom(this.zoom+delta,{x:e.offsetX,y:e.offsetY});
      },{passive:false});
    }
    setZoom(z,anchor){
      z=clamp(z,this.minZoom,this.maxZoom); if(z===this.zoom) return;
      if(anchor){
        const rect=this.el.getBoundingClientRect(), oldP=project(this.center.lat,this.center.lng,this.zoom);
        const before=unproject(oldP.x+(anchor.x-rect.width/2),oldP.y+(anchor.y-rect.height/2),this.zoom);
        this.zoom=z;
        const beforeP=project(before.lat,before.lng,z);
        const centerP={x:beforeP.x-(anchor.x-rect.width/2),y:beforeP.y-(anchor.y-rect.height/2)};
        this.center=unproject(centerP.x,centerP.y,z);
      } else this.zoom=z;
      this.render();
    }
    setCenter(lat,lng,z){this.center={lat,lng}; if(z!=null)this.zoom=clamp(z,this.minZoom,this.maxZoom); this.render();}
    reset(){this.center={lat:3.985,lng:-76.22};this.zoom=12;this.selected=null;this.render();}
    setPoints(points){this.points=Array.isArray(points)?points:[];this.renderMarkers();}
    select(sector,{recenter=true}={}){
      this.selected=sector||null;
      const p=this.points.find(x=>x.sector===sector);
      if(p&&recenter&&Number.isFinite(p.lat)&&Number.isFinite(p.lng))this.setCenter(p.lat,p.lng,Math.max(this.zoom,13));else this.renderMarkers();
    }
    render(){this.renderTiles();this.renderMarkers();}
    renderTiles(){
      if(!this.tileLayer)return;
      const rect=this.el.getBoundingClientRect(), w=rect.width||800,h=rect.height||500;
      const c=project(this.center.lat,this.center.lng,this.zoom);
      const left=c.x-w/2, top=c.y-h/2;
      const minX=Math.floor(left/TILE), maxX=Math.floor((left+w)/TILE), minY=Math.floor(top/TILE),maxY=Math.floor((top+h)/TILE);
      const n=Math.pow(2,this.zoom); const frag=document.createDocumentFragment();
      for(let tx=minX;tx<=maxX;tx++) for(let ty=minY;ty<=maxY;ty++){
        if(ty<0||ty>=n)continue; const wrapped=((tx%n)+n)%n;
        const img=document.createElement('img'); img.alt=''; img.draggable=false; img.loading='eager';
        img.src=`https://tile.openstreetmap.org/${this.zoom}/${wrapped}/${ty}.png`;
        img.style.left=`${tx*TILE-left}px`;img.style.top=`${ty*TILE-top}px`;frag.appendChild(img);
      }
      this.tileLayer.replaceChildren(frag);
    }
    renderMarkers(){
      if(!this.markerLayer)return;
      const rect=this.el.getBoundingClientRect(),w=rect.width||800,h=rect.height||500,c=project(this.center.lat,this.center.lng,this.zoom),left=c.x-w/2,top=c.y-h/2;
      const frag=document.createDocumentFragment();
      this.points.forEach(p=>{
        if(!Number.isFinite(Number(p.lat))||!Number.isFinite(Number(p.lng)))return;
        const pp=project(Number(p.lat),Number(p.lng),this.zoom),x=pp.x-left,y=pp.y-top;
        if(x<-50||x>w+50||y<-50||y>h+50)return;
        const priority=(Number(p.noHab)||0)+(Number(p.destroyed)||0), families=Number(p.families)||0;
        const size=clamp(28+Math.sqrt(families)*2.2,30,50), color=priority>=10?'#d93c45':priority>0?'#f0a11e':p.precision==='verified'?'#0a5be8':'#7655d9';
        const btn=document.createElement('button');btn.type='button';btn.className='map-marker'+(this.selected===p.sector?' active':'');btn.style.left=x+'px';btn.style.top=y+'px';btn.style.setProperty('--size',size+'px');btn.style.setProperty('--marker',color);btn.setAttribute('aria-label',`${p.sector}: ${families} familias`);
        btn.innerHTML=`<span class="marker-pin"><span>${families}</span></span><span class="marker-label">${p.sector}</span>`;
        btn.addEventListener('click',()=>{this.selected=p.sector;this.renderMarkers();this.onSelect(p);});frag.appendChild(btn);
      });
      this.markerLayer.replaceChildren(frag);
    }
  }
  window.RufeSlippyMap=RufeSlippyMap;
})();
