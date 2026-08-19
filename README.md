# Emergencia Sísmica · San Pedro — Micrositio interactivo v3 — experiencia inmersiva

Micrositio estático para GitHub Pages basado en el **Informe Técnico Consolidado — Avance del diligenciamiento RUFE y censo de familias afectadas**, corte **18 de agosto de 2026**.

## Qué contiene

- Resumen ejecutivo y KPIs.
- Completitud de campos críticos y estado por componente.
- Explorador territorial de los **25 sectores**, con búsqueda, rangos, filtros, ordenamiento, tabla, ranking, comparador y exportación CSV.
- Clasificación registrada de vivienda y lectura prioritaria.
- Caracterización poblacional por sexo, ciclo de vida y ubicación declarada.
- Calidad y depuración de datos con los nueve hallazgos del informe.
- Objeto, alcance, limitaciones, metodología y reglas aplicadas.
- Contexto del evento, Ley 1523 de 2012, RUFE y RUD.
- Prioridades, matriz de priorización y conclusiones.
- Galería de 8 piezas visuales institucionales.
- PDF original de 20 páginas integrado con índice navegable.
- Anexo de indicadores y control documental.
- Buscador global **no modal**: nunca bloquea la página.
- Modo audiencia / pantalla completa para presentaciones.
- Scrollytelling fotográfico con capítulos activados por desplazamiento.
- Gráfico de dispersión territorial interactivo (familias × tasa prioritaria exploratoria).
- Animaciones de entrada, barras, contadores, seismógrafo, transición entre vistas y revelado por scroll.
- Sistema tipográfico combinado: Century Gothic (o equivalentes), Archivo Black, Cormorant Garamond, Allura e IBM Plex Mono.
- Tema claro/oscuro, responsive, impresión, PWA y cache offline progresivo.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube **todo el contenido de esta carpeta** a la raíz del repositorio.
3. En GitHub abre `Settings` → `Pages`.
4. En `Build and deployment`, selecciona `Deploy from a branch`.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda. GitHub publicará la URL del micrositio.

No requiere Node.js, npm, compilación, base de datos ni frameworks externos.

## Archivos principales

- `index.html`: estructura y módulos.
- `styles.css`: diseño visual responsive.
- `app.js`: navegación, filtros, búsqueda, comparación, exportación y visualizaciones.
- `experience.js`: scrollytelling, modo audiencia, animaciones, gráfico territorial y microinteracciones.
- `data/report-data.js`: datos estructurados del informe.
- `assets/informe-consolidado-18-agosto-2026.pdf`: documento fuente.
- `assets/visual-*.png`: informe visual.

> La “tasa prioritaria” mostrada en el explorador territorial es una métrica calculada por la micropágina para exploración y no una clasificación oficial del informe.

## V4 — mapa territorial y panel de vivienda

- El módulo **Territorio** incorpora un mapa Leaflet/OpenStreetMap con las 25 localizaciones del consolidado, buscador, leyenda, sincronización con filtros, popups y ficha territorial.
- Los puntos con referencia cartográfica abierta verificable se diferencian visualmente de las **referencias aproximadas**. Estas últimas son sólo una ayuda de navegación y deben reemplazarse por georreferenciación oficial cuando el Municipio disponga de ella.
- El módulo **Vivienda** fue reestructurado para evitar una lectura errónea: cada barra usa directamente el denominador común de 432 familias (escala 0–100%), porque las categorías del censo no son totalmente excluyentes.
- El banner de **Resumen** se rediseñó como portada editorial/técnica e incorpora fotografía, sello SITREP, métricas clave, fecha del evento y corte analítico.
- Para cargar el mapa base y las fuentes web se requiere conexión a Internet en la primera visita. El resto del micrositio y sus activos principales quedan disponibles mediante el service worker.
