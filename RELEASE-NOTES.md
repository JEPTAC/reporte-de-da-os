# Release Notes — Portal RUFE V6 Final

**Fecha de compilación:** 20 de agosto de 2026  
**Tipo:** reconstrucción completa / reemplazo limpio

## Núcleo público

- Navegación editorial reconstruida.
- Banner institucional con palabra “Emergencia” azul.
- Buscador global no modal.
- Mapa propio sin Leaflet/unpkg, con 25 referencias.
- Territorio con filtros, ranking, tabla, comparación y CSV.
- Vivienda reestructurada con interpretación técnica y base común.
- Población, calidad, metodología y fuentes.
- Evolución de cortes.
- Centro documental y galería.
- Vista imprimible/JSON del corte vigente e histórico.
- PWA con estrategia de caché orientada a evitar HTML obsoleto.

## Gestión

- Firebase Auth con usuarios existentes.
- Roles Editor / Validador / Administrador / Super Admin.
- Crear, cambiar rol, activar, desactivar, recuperar contraseña y eliminar usuarios.
- Edición territorial y de contenido.
- Importación CSV robusta.
- Carga de archivos.
- Validación previa a revisión y aprobación.
- Publicación protegida por revisión aprobada de la misma revisión.
- Auditoría.
- Copia versionada de archivos.
- Snapshot público vigente + snapshot histórico completo por corte.

## Seguridad

- Separación de borrador interno y publicación ciudadana.
- Escritura pública bloqueada.
- Administración de cuentas mediante Admin SDK/Cloud Functions.
- Límite de archivos de 40 MB.
- Modelo ciudadano agregado, sin campos nominales del RUFE.

## QA

El paquete incluye una suite automatizada en `qa/run_qa.py`. El reporte final está en `QA-REPORT.md` y `QA-REPORT.json`.
