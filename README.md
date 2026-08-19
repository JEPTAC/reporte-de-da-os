# Emergencia Sísmica · San Pedro — Micrositio interactivo v2

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
- `data/report-data.js`: datos estructurados del informe.
- `assets/informe-consolidado-18-agosto-2026.pdf`: documento fuente.
- `assets/visual-*.png`: informe visual.

> La “tasa prioritaria” mostrada en el explorador territorial es una métrica calculada por la micropágina para exploración y no una clasificación oficial del informe.
