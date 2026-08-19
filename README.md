# Emergencia Sísmica · San Pedro — Micropágina interactiva

Micrositio estático, sin dependencias y compatible con **GitHub Pages**. Visualiza el Informe técnico consolidado del avance RUFE y censo de familias afectadas por el sismo del 10 de agosto de 2026, con corte al 18 de agosto de 2026.

## Funcionalidades

- Navegación SPA por hash, sin framework y sin proceso de build.
- Explorador territorial con búsqueda, filtros, ordenamiento y segmentación.
- Comparador de hasta 4 sectores.
- Ficha lateral por territorio.
- Exportación CSV de la vista filtrada.
- Indicadores, barras, anillos y gráficas construidas en HTML/CSS/JS puro.
- Módulos de vivienda, población, calidad, metodología, prioridades y fuentes.
- Buscador global / paleta de comandos con `Ctrl + K`.
- Atajos `1` a `8` para navegación.
- Tema claro/oscuro.
- Impresión / guardar como PDF desde el navegador.
- PWA básica con service worker para navegación offline después de la primera carga.
- Responsive para escritorio, tablet y móvil.

## Estructura

```text
san-pedro-sismo-microsite/
├── index.html
├── styles.css
├── app.js
├── manifest.json
├── service-worker.js
├── 404.html
├── data/
│   └── report-data.js
└── assets/
    ├── logo-san-pedro.png
    ├── iglesia-afectada.jpeg
    └── alcaldia.jpeg
```

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub, por ejemplo `emergencia-sismica-san-pedro`.
2. Sube **todo el contenido de esta carpeta a la raíz del repositorio**.
3. En GitHub ve a **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)`.
6. Guarda. GitHub publicará el sitio en la URL de Pages del repositorio.

No requiere npm, Node, React, Vite ni CDN externos.

## Fuente y precisión

Las cifras y textos del sitio se derivan del informe técnico consolidado suministrado. La micropágina mantiene la advertencia de que la información es preliminar y no sustituye evaluación estructural ni validación oficial del RUD.

La **tasa prioritaria** del explorador territorial es un cálculo auxiliar de interfaz: `(no habitable + destruida) / familias nominales`. Se presenta explícitamente como indicador exploratorio y no como nivel oficial de riesgo.
