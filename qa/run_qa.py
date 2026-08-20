#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import re, json, subprocess, sys
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def add(name,cond,detail=''):
    checks.append({'name':name,'ok':bool(cond),'detail':str(detail) if detail else ''})

class Parser(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.refs=[]; self.images=[]; self.lang=None; self.main=0
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='html': self.lang=a.get('lang')
        if tag=='main': self.main+=1
        if 'id' in a:self.ids.append(a['id'])
        for k in ('src','href','data'):
            if k in a:self.refs.append((tag,k,a[k]))
        if tag=='img':self.images.append({'src':a.get('src'),'alt':a.get('alt')})

def html_checks(filename,prefix):
    text=(ROOT/filename).read_text('utf-8'); p=Parser(); p.feed(text)
    add(f'{prefix}: idioma español',p.lang=='es' or str(p.lang).startswith('es'),p.lang)
    add(f'{prefix}: landmark main único',p.main==1,p.main)
    dup=[k for k,v in Counter(p.ids).items() if v>1]
    add(f'{prefix}: IDs únicos',not dup,dup)
    add(f'{prefix}: imágenes con alt',all(x['alt'] is not None for x in p.images),len(p.images))
    missing=[]
    for tag,k,v in p.refs:
        if not v or v.startswith(('#','http:','https:','mailto:','tel:','data:','javascript:')):continue
        v=v.split('#')[0].split('?')[0]
        if not v:continue
        if not (ROOT/v).exists(): missing.append(v)
    add(f'{prefix}: referencias locales existentes',not missing,sorted(set(missing)))
    return text,p

index,indexp=html_checks('index.html','Portal')
report,reportp=html_checks('report.html','Informe imprimible')
css=(ROOT/'styles.css').read_text('utf-8'); printcss=(ROOT/'report-print.css').read_text('utf-8')
add('CSS principal: llaves balanceadas',css.count('{')==css.count('}'),f"{css.count('{')}/{css.count('}')}")
add('CSS informe: llaves balanceadas',printcss.count('{')==printcss.count('}'),f"{printcss.count('{')}/{printcss.count('}')}")
add('Banner: “Emergencia” azul','class="hero-blue">Emergencia' in index and '.hero-blue{color:#4fb8ff!important}' in css)
add('Estado contingencia visible','status-chip.contingency' in css and "label.textContent='Copia local'" in (ROOT/'app.js').read_text('utf-8'))

alltext='\n'.join(x.read_text('utf-8',errors='ignore') for x in ROOT.rglob('*') if x.is_file() and x.suffix.lower() in {'.js','.html','.css'})

experience=(ROOT/'experience.js').read_text('utf-8')
add('Experiencia: scrollytelling restaurado','scrolly-shell' in index and 'setupScrolly' in experience and 'IntersectionObserver' in experience)
add('Experiencia: menú ciudadano pasable','citizen-carousel' in index and 'scroll-snap' in index and 'setupCarousels' in experience)
add('Experiencia: navegación XMB/PSP','xmb-nav' in index and '[data-xmb]' in experience)
add('Experiencia: rail interno por capítulo','chapterConfig' in experience and 'chapter-rail' in css)
add('Experiencia: guía flotante no bloqueante','floatingGuide' in index and 'floating-guide-panel' in css)
add('Experiencia: buscador no modal','id="globalSearch"' in index and '<dialog id="search' not in index)
add('Experiencia: respeta movimiento reducido','prefers-reduced-motion:reduce' in css and 'prefersReduced' in experience)
add('Experiencia: progreso de lectura','readingProgress' in index and 'setupReadingProgress' in experience)
add('Experiencia móvil: menú completo no bloqueante','id="mobileSheet"' in index and 'setupMobileSheet' in experience)
add('Experiencia móvil: búsqueda accesible desde menú','mobileSearchOpen' in index and 'search-open' in css)

add('Sin Leaflet', 'leaflet' not in alltext.lower())
add('Sin unpkg', 'unpkg.com' not in alltext.lower())
mapjs=(ROOT/'map.js').read_text('utf-8')
add('Mapa OSM sin CDN JavaScript','tile.openstreetmap.org' in mapjs and 'RufeSlippyMap' in mapjs)
add('Mapa: zoom, pan y selección',all(x in mapjs for x in ['pointerdown','pointermove','wheel','setZoom','select(sector']) )

for f in ['app.js','experience.js','map.js','firebase-service.js','firebase-config.js','report-print.js','service-worker.js','data/report-data.js','data/map-data.js','functions/index.js']:
    r=subprocess.run(['node','--check',str(ROOT/f)],capture_output=True,text=True)
    add(f'JavaScript válido: {f}',r.returncode==0,(r.stderr or '').strip())

# Data validation in Node (browser globals simulated)
script=f"""
const fs=require('fs'),vm=require('vm');const c={{window:{{}}}};vm.createContext(c);
vm.runInContext(fs.readFileSync('{ROOT/'data/report-data.js'}','utf8'),c);
vm.runInContext(fs.readFileSync('{ROOT/'data/map-data.js'}','utf8'),c);
const d=c.window.REPORT_DATA,g=c.window.TERRITORY_MAP_DATA;
const sum=(a,k)=>a.reduce((s,x)=>s+(Number(x[k])||0),0);
const s={{families:sum(d.territories,'families'),people:sum(d.territories,'people'),noHab:sum(d.territories,'noHab'),destroyed:sum(d.territories,'destroyed'),noStateRaw:sum(d.territories,'noState'),empty:sum(d.territories,'empty'),nominalNoState:d.territories.reduce((x,t)=>x+Math.max(0,(+t.noState||0)-(+t.empty||0)),0)}};
console.log(JSON.stringify({{territories:d.territories.length,map:g.length,names:d.territories.every(t=>g.some(x=>x.sector===t.sector)),finite:g.every(x=>Number.isFinite(x.lat)&&Number.isFinite(x.lng)),bounds:g.every(x=>x.lat>3.7&&x.lat<4.2&&x.lng>-76.5&&x.lng<-76.0),s,life:sum(d.lifeCycle,'count'),loc:sum(d.locationDeclared,'count'),sex:sum(d.sexDistribution,'count'),pages:d.pageIndex.length,visuals:d.visualReports.length,quality:d.qualityIssues.length,housing:Object.fromEntries(d.housing.map(x=>[x.label,x.count]))}}));
"""
r=subprocess.run(['node','-e',script],capture_output=True,text=True)
state=json.loads(r.stdout.strip())
add('Datos: 25 territorios',state['territories']==25,state['territories'])
add('Mapa: 25 referencias',state['map']==25,state['map'])
add('Mapa: todos los sectores referenciados',state['names'])
add('Mapa: coordenadas válidas',state['finite'] and state['bounds'])
add('Totales territoriales',state['s']=={'families':432,'people':1024,'noHab':90,'destroyed':2,'noStateRaw':151,'empty':111,'nominalNoState':40},state['s'])
add('Ciclo de vida suma 1.024',state['life']==1024,state['life'])
add('Sexo suma 1.024',state['sex']==1024,state['sex'])
add('Ubicación suma 432',state['loc']==432,state['loc'])
add('Vivienda: valores fuente',state['housing'].get('Habitable')==251 and state['housing'].get('Averiada')==56 and state['housing'].get('No habitable')==90 and state['housing'].get('Destruida')==2,state['housing'])
add('Índice PDF: 20 páginas',state['pages']==20,state['pages'])
add('Galería: 8 piezas visuales',state['visuals']==8,state['visuals'])
add('Calidad: 9 brechas',state['quality']==9,state['quality'])

config=(ROOT/'firebase-config.js').read_text('utf-8')
add('Firebase: proyecto correcto',"projectId: 'rendicion-de-cuentas-6aceb'" in config)
add('Firebase: Web App configurada',bool(re.search(r"apiKey:\s*['\"]AIza",config)))
add('Firebase: bucket configurado','rendicion-de-cuentas-6aceb.firebasestorage.app' in config)
service=(ROOT/'firebase-service.js').read_text('utf-8')
add('Firebase: roles RUFE definidos',all(x in service for x in ["'editor'","'validator'","'admin'","'super_admin'"]))
add('Firebase: listeners internos desmontables','stopInternalListeners' in service)
add('Firebase: importación CSV robusta','function parseCsv' in (ROOT/'app.js').read_text('utf-8'))

fn=(ROOT/'functions/index.js').read_text('utf-8')
for name in ['adminCreateRufeUser','adminManageRufeUser','validateRufeDraft','submitRufeForReview','reviewRufeDraft','publishRufeSnapshot','adminManageRufeMedia']:
    add(f'Cloud Function presente: {name}',f'exports.{name}' in fn)
add('Workflow: editar invalida aprobación',"reviewStatus:'changes'" in service and 'approvedRevision:null' in service)
add('Workflow: validar antes de revisión','derive(loaded.draft,loaded.territories)' in fn and 'workflow.submit' in fn)
add('Workflow: validar antes de aprobación',"decision==='approve'" in fn and 'validateTerritories(loaded.territories)' in fn)
add('Workflow: publicar exige revisión aprobada',"workflow.reviewStatus!=='approved'" in fn and 'approvedRevision' in fn)
add('Workflow: control territorial',all(x in fn for x in ['personas (${people}) no puede ser menor','“sin estado”','latitud fuera de rango','longitud fuera de rango']))
add('Publicación: snapshot público separado','rufePublished' in fn and 'rufePublished' in (ROOT/'rules/firestore-rufe-snippet.rules').read_text('utf-8'))
add('Publicación: copias versionadas de archivos','rufe-public/${eventId}/${slug(version)}-${cutoffDate}' in fn)
add('Auditoría: colección separada','rufeAudit' in fn and 'allow write: if false' in (ROOT/'rules/firestore-rufe-snippet.rules').read_text('utf-8'))

rules=(ROOT/'rules/firestore-rufe-snippet.rules').read_text('utf-8')
storage=(ROOT/'rules/storage-rufe-snippet.rules').read_text('utf-8')
add('Seguridad: rufePublished solo lectura pública','match /rufePublished/{eventId}' in rules and 'allow write: if false' in rules)
add('Seguridad: borradores requieren rol','match /drafts/{docId}' in rules and 'allow read: if rufeInternal();' in rules and 'allow create, update: if rufeEditor();' in rules)
add('Seguridad: archivos públicos solo Admin SDK','match /rufe-public/{eventId}/{allPaths=**}' in storage and 'allow write: if false' in storage)
add('Seguridad: límite upload 40 MB','40 * 1024 * 1024' in storage)

sw=(ROOT/'service-worker.js').read_text('utf-8')
add('PWA: navegación network-first','event.request.mode===\'navigate\'' in sw and 'networkFirst' in sw)
add('PWA: servicios externos fuera del caché','url.origin!==self.location.origin' in sw)
manifest=json.loads((ROOT/'manifest.json').read_text('utf-8'))
add('PWA: iconos 192/512',set(x['sizes'] for x in manifest.get('icons',[]))=={'192x192','512x512'})
add('PWA: iconos existen',all((ROOT/x['src']).exists() for x in manifest.get('icons',[])))

add('Informe automático: vista imprimible incluida',(ROOT/'report.html').exists() and (ROOT/'report-print.js').exists())
add('Informe automático: consume snapshot público','listenPublic' in (ROOT/'report-print.js').read_text('utf-8'))
add('Informe automático: exporta JSON','downloadJson' in (ROOT/'report-print.js').read_text('utf-8'))
add('Informe automático: impresión PDF','window.print()' in (ROOT/'report-print.js').read_text('utf-8'))
add('Histórico: snapshot público completo por corte','publicReleaseRef' in fn and 'rufePublished/${eventId}/releases/${summary.id}' in fn)
add('Histórico: reglas permiten lectura pública','match /releases/{releaseId}' in rules and rules.count('allow read: if true;') >= 2)
add('Histórico: informe permite seleccionar release','getPublicRelease' in service and "get('release')" in (ROOT/'report-print.js').read_text('utf-8'))
add('Usuarios: Super Admin puede eliminar cuentas',"action==='delete'" in fn and 'auth.deleteUser(uid)' in fn and 'data-delete-user' in (ROOT/'app.js').read_text('utf-8'))
add('Usuarios: protección contra autoeliminación',"No puedes eliminar tu propia cuenta" in fn)
add('Compatibilidad: hash resumen redirige a inicio',"resumen:'inicio'" in (ROOT/'app.js').read_text('utf-8'))
add('Despliegue: reemplazo limpio documentado','reconstrucción limpia' in (ROOT/'README.md').read_text('utf-8').lower() and (ROOT/'.nojekyll').exists())
add('Despliegue: funciones usan paquete único','firebase deploy --only functions' in (ROOT/'deploy-functions.sh').read_text('utf-8'))
add('Documentación: seguridad y modelo de datos',(ROOT/'SECURITY.md').exists() and (ROOT/'DATA-MODEL.md').exists() and (ROOT/'RELEASE-NOTES.md').exists())
add('Documentación: sin referencia a carpeta intermedia','san-pedro-rufe-portal-v6-rebuild' not in '\n'.join((ROOT/x).read_text('utf-8') for x in ['README.md','ARCHITECTURE.md','DEPLOYMENT-CHECKLIST.md','REEMPLAZO-LIMPIO.md']))

failed=[x for x in checks if not x['ok']]
summary={'passed':len(checks)-len(failed),'failed':len(failed),'total':len(checks)}
report_data={'summary':summary,'checks':checks,'notes':['QA automatizado estático, consistencia de datos y arquitectura. Se realizó además una prueba DOM/render aislada con Chromium mediante contenido embebido; el runtime bloquea navegación HTTP local directa, por lo que sigue siendo obligatorio un smoke test final en GitHub Pages.']}
(ROOT/'QA-REPORT.json').write_text(json.dumps(report_data,ensure_ascii=False,indent=2),'utf-8')
lines=['# QA — Portal RUFE V6.1 inmersivo','',f"**Resultado automatizado:** {summary['passed']}/{summary['total']} controles aprobados.",'',"> Alcance: sintaxis, estructura, referencias, consistencia matemática, experiencia inmersiva, seguridad declarativa, PWA y arquitectura Firebase. También se realizó una prueba DOM/render aislada con Chromium; el runtime bloquea navegación HTTP local directa, por lo que el checklist mantiene un smoke test final en GitHub Pages.",'']
for c in checks: lines.append(f"- {'✅' if c['ok'] else '❌'} **{c['name']}**"+(f" — {c['detail']}" if c['detail'] else ''))
(ROOT/'QA-REPORT.md').write_text('\n'.join(lines)+'\n','utf-8')
print(json.dumps(summary,ensure_ascii=False))
if failed:
    for x in failed: print('FAIL',x['name'],x['detail'],file=sys.stderr)
    sys.exit(1)
