# Portal RUFE San Pedro — V6 Final

Portal público + sistema de gestión interna para el seguimiento del RUFE y del censo de familias afectadas por el sismo del 10 de agosto de 2026.

## Reconstrucción completa

Esta entrega es una **reconstrucción limpia**. No depende de CSS, JavaScript, mapas, service workers ni estructuras HTML de V4/V5/V6 anteriores. Debe sustituir por completo la carpeta publicada del portal RUFE.

La fuente de verdad queda organizada así:

```text
Borrador interno → validación → aprobación → publicación → snapshot ciudadano
                         ↓
                 histórico inmutable
```

Una actualización territorial no obliga a editar gráficas manualmente. Los consolidados se derivan de los datos estructurados y se recalculan antes de revisión, aprobación y publicación.

## Portal público

- Inicio editorial e institucional con estado del corte publicado.
- Buscador global no modal.
- Mapa territorial interactivo de 25 sectores, sin Leaflet ni `unpkg`.
- Filtros sincronizados con mapa, ranking, tabla y comparación.
- Vivienda con denominador común y advertencias técnicas explícitas.
- Población, ciclo de vida y ubicación declarada.
- Calidad del dato y brechas de depuración.
- Evolución entre cortes y acceso al informe histórico de cada publicación.
- Metodología, limitaciones, RUFE/RUD y marco normativo.
- Centro documental con PDF, infografías, fotografías y archivos publicados.
- Historial de actualizaciones.
- Vista imprimible/generable como PDF a partir del snapshot publicado.
- Descarga JSON de la información pública del corte.
- Tema claro/oscuro, responsive y PWA.
- Estado de contingencia **Copia local** cuando Firebase no está disponible; nunca presenta la copia local como sincronización en vivo.

## Gestión interna

Ruta: `#administracion`

### Roles

- `editor`: modifica territorios y contenido y envía a revisión.
- `validator`: verifica y aprueba/rechaza revisiones.
- `admin`: edición + validación.
- `super_admin`: todo lo anterior + usuarios, archivos y publicación.

### Capacidades

- Edición territorial desde el mismo modelo que alimenta mapa y analítica.
- Importación CSV.
- Edición de narrativas, metodología, calidad, prioridades y control documental.
- Comprobación de consistencia antes de tramitar un corte.
- Flujo `Editar → Revisar → Aprobar → Publicar`.
- Una edición posterior a la aprobación invalida `approvedRevision`.
- Creación, cambio de rol, activación/desactivación, recuperación de contraseña y eliminación de usuarios por Super Admin.
- Carga y administración de PDF, imágenes, anexos y datasets.
- Copia versionada de archivos al publicar para preservar evidencia histórica.
- Auditoría de operaciones privilegiadas.
- Snapshots históricos públicos de cada corte, además del snapshot vigente.

## Firebase

Proyecto configurado: `rendicion-de-cuentas-6aceb`.

La Web App está definida en `firebase-config.js`. La configuración web de Firebase **no es una credencial administrativa**. La autorización real se controla mediante Authentication, Firestore Rules, Storage Rules y Cloud Functions.

Colecciones RUFE principales:

```text
users/{uid}
rufeEvents/{eventId}/drafts/current
rufeEvents/{eventId}/territories/{territoryId}
rufeEvents/{eventId}/workflow/state
rufeEvents/{eventId}/media/{mediaId}
rufeEvents/{eventId}/releases/{releaseId}
rufeAudit/{logId}
rufePublished/{eventId}
rufePublished/{eventId}/releases/{releaseId}
```

Los snapshots públicos contienen exclusivamente información agregada y contenido institucional. El modelo de publicación no incluye nombres, números de documento, teléfonos ni direcciones individualizadas de familias.

## Despliegue

### 1. GitHub Pages

Reemplazar completamente el contenido publicado del repositorio por esta carpeta. No copiar encima de archivos anteriores.

### 2. Firebase Authentication

Verificar:

- Email/Password, si se utilizará.
- Google, si se utilizará.
- `jeptac.github.io` en **Authorized domains**.
- al menos un `users/{uid}` con `role: "super_admin"`, `active: true` y `rufeAccess: true`.

### 3. Reglas

Fusionar, **sin borrar reglas de otras aplicaciones del mismo proyecto**:

- `rules/firestore-rufe-snippet.rules`
- `rules/storage-rufe-snippet.rules`

### 4. Cloud Functions

Desde la raíz del paquete:

```bash
firebase login
firebase use rendicion-de-cuentas-6aceb
firebase deploy --only functions
```

O ejecutar `deploy-functions.sh` / `deploy-functions.cmd`.

### 5. Primer corte

1. Ingresar como Super Admin.
2. Inicializar/sincronizar la base solo si el evento RUFE todavía no existe.
3. Revisar territorios y contenido.
4. Ejecutar **Comprobar consistencia**.
5. Enviar a revisión.
6. Aprobar la misma revisión.
7. Publicar el corte.
8. Confirmar que el portal ciudadano se actualiza sin modificar HTML.

## QA

Ejecutar:

```bash
python3 qa/run_qa.py
```

Resultados incluidos en:

- `QA-REPORT.md`
- `QA-REPORT.json`

La validación automatizada cubre estructura, sintaxis, referencias, cálculos, mapa, Firebase, flujo editorial, seguridad declarativa, PWA e informe imprimible. El entorno de construcción no permite navegación Chromium headless, por lo que el smoke test final debe ejecutarse sobre la URL real de GitHub Pages.

## Documentación

- `ARCHITECTURE.md` — arquitectura técnica.
- `DATA-MODEL.md` — modelo y responsabilidades de los datos.
- `SECURITY.md` — separación público/privado y controles.
- `DEPLOYMENT-CHECKLIST.md` — publicación institucional paso a paso.
- `REEMPLAZO-LIMPIO.md` — cómo retirar la versión anterior.
- `RELEASE-NOTES.md` — alcance de esta entrega final.
