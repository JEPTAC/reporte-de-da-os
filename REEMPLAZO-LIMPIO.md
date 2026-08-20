# Reemplazo limpio — Portal RUFE V6.1

Esta entrega se publica como **reconstrucción completa de la experiencia**, no como parche encima de V6.

## Procedimiento

1. Descargar y conservar una copia de la versión publicada actual.
2. Vaciar los archivos RUFE del repositorio, salvo elementos externos que pertenezcan a otros proyectos.
3. Copiar todo el contenido de este paquete en la raíz del sitio RUFE.
4. Verificar que existan `index.html`, `styles.css`, `experience.js`, `app.js`, `map.js`, `firebase-service.js`, `service-worker.js`, `data/`, `assets/`, `functions/` y `rules/`.
5. Publicar en GitHub.
6. Forzar recarga una vez para que el nuevo service worker elimine la caché anterior.
7. Ejecutar `SMOKE-TEST.md`.

## No hacer

- No copiar únicamente el CSS nuevo.
- No mezclar `index.html` de V6 con `experience.js` de V6.1.
- No conservar un service worker antiguo.
- No sustituir todas las reglas del proyecto Firebase sin fusionar primero las reglas RUFE con las reglas de Rendicuentas.
