# Portal RUFE San Pedro — V6.1 Inmersivo

Reconstrucción limpia de la experiencia pública del Portal RUFE de San Pedro, Valle del Cauca.

Esta versión conserva la arquitectura de datos, Firebase, control de versiones, mapa, administración y publicación de V6, pero rehace la experiencia ciudadana con una lógica **public-first**: primero explica, luego permite explorar y finalmente ofrece el detalle técnico.

## Qué cambia en V6.1

- Hero cinematográfico con fotografía real y línea sísmica animada.
- Scrollytelling restaurado y ampliado para explicar el corte mediante desplazamiento.
- Menú superior tipo XMB/PSP con accesos rápidos.
- Navegación lateral reconstruida por intención ciudadana: conocer, entender y verificar.
- Carrusel “¿Qué quieres consultar?” con rutas claras para población general.
- Paneles horizontales pasables con `scroll-snap` para lectura rápida.
- Rieles internos en Territorio, Vivienda, Población, Calidad, Evolución, Metodología, Informes, Actualizaciones y Fuentes.
- Guías contextuales que explican “qué significa esta sección” antes del detalle técnico.
- Tipografía combinada: Century Gothic / sans geométrica para lectura, condensada para titulares, serif itálica para contraste editorial y cursiva puntual.
- Animaciones de aparición, barras y columnas, respetando `prefers-reduced-motion`.
- Diseño responsive revisado para escritorio y móvil.
- Buscador integrado, no modal y no bloqueante.

## Arquitectura funcional conservada

- Firebase Authentication.
- Roles: editor, validator, admin y super_admin.
- Edición territorial.
- Contenido del corte.
- Validación, aprobación y publicación.
- Histórico de cortes.
- Biblioteca de archivos y evidencias.
- Auditoría.
- Mapa OSM propio sin Leaflet/unpkg.
- Vista imprimible `report.html`.
- PWA con service worker network-first para navegación.

## Publicación en GitHub Pages

1. Haga copia de seguridad del repositorio actual.
2. Reemplace **todo** el contenido RUFE por este paquete; no copie únicamente `index.html`.
3. Conserve `.nojekyll`.
4. Publique los cambios.
5. Haga una recarga forzada del navegador una vez después del despliegue.
6. Ejecute el smoke test descrito en `SMOKE-TEST.md`.

## Firebase

La configuración web del proyecto `rendicion-de-cuentas-6aceb` ya está incluida en `firebase-config.js`. La API key web identifica la aplicación cliente y **no concede privilegios administrativos**. La seguridad depende de Authentication, Firestore Rules, Storage Rules y Cloud Functions.

No sustituya a ciegas las reglas existentes del proyecto Rendicuentas. Utilice los fragmentos de `rules/` y fusiónelos con las reglas actuales.

## QA

Ejecute:

```bash
python qa/run_qa.py
```

La reconstrucción V6.1 cierra con **91/91 controles automatizados aprobados**, más una prueba DOM/render aislada con Chromium para escritorio y móvil. El smoke test final debe hacerse en la URL real de GitHub Pages.
