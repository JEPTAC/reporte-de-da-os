# Arquitectura — Portal RUFE San Pedro V6 Final

## 1. Principio de diseño

El portal deja de tratar el PDF como base maestra. Los datos estructurados son la fuente de trabajo; las gráficas, tablas, mapa y reportes son vistas derivadas.

```text
                 ┌──────────────────┐
                 │ Firebase Auth    │
                 └────────┬─────────┘
                          │ roles
                          ▼
┌──────────────┐   ┌──────────────────┐   ┌──────────────────┐
│ Editor mapa  │ → │ Borrador RUFE    │ → │ Validación       │
│ y contenido  │   │ + territorios    │   │ / aprobación     │
└──────────────┘   └────────┬─────────┘   └────────┬─────────┘
                            │                       │
                            └──────────┬────────────┘
                                       ▼
                              ┌──────────────────┐
                              │ Cloud Function   │
                              │ de publicación   │
                              └────────┬─────────┘
                                       │
                         ┌─────────────┴─────────────┐
                         ▼                           ▼
              ┌──────────────────┐        ┌──────────────────┐
              │ Snapshot vigente│        │ Histórico público│
              └────────┬─────────┘        └──────────────────┘
                       ▼
              Portal / mapa / gráficas /
              tablas / informe imprimible
```

## 2. Capa pública

`rufePublished/san-pedro-sismo-2026` contiene el snapshot ciudadano vigente.

Cada publicación también conserva un snapshot completo en:

```text
rufePublished/{eventId}/releases/{releaseId}
```

Estos documentos son de solo lectura pública y solo las Cloud Functions con Admin SDK pueden escribirlos.

El portal mantiene una copia local inicial del corte 18/08/2026 como contingencia. Cuando Firebase está disponible, el snapshot publicado prevalece y la interfaz muestra el estado de sincronización correspondiente.

## 3. Capa de trabajo privada

```text
rufeEvents/{eventId}
  drafts/current
  territories/{territoryId}
  workflow/state
  media/{mediaId}
  releases/{releaseId}
  editorActivity/{activityId}
```

Los editores nunca escriben directamente en `rufePublished`.

## 4. Auditoría

```text
rufeAudit/{logId}
```

Las operaciones privilegiadas registran actor, rol, acción, evento, fecha y metadatos relevantes. La bitácora no admite escritura desde el cliente.

## 5. Usuarios

```text
users/{uid}
```

Campos mínimos:

```json
{
  "uid": "UID",
  "email": "usuario@dominio.gov.co",
  "displayName": "Nombre",
  "role": "super_admin",
  "active": true,
  "rufeAccess": true
}
```

Se mantiene lectura temporal de perfiles antiguos cuyo documento fue identificado por correo. La administración definitiva se realiza por UID.

## 6. Flujo editorial

Estados funcionales:

```text
draft / changes → in_review → approved → published
```

- Guardar cambios incrementa `revision`.
- Guardar cambios establece `approvedRevision = null`.
- Enviar a revisión valida primero el borrador.
- Aprobar exige que `submittedRevision == revision`.
- Publicar exige `approvedRevision == revision`.
- La publicación vuelve a validar y derivar datos en backend.

## 7. Publicación

`publishRufeSnapshot`:

1. valida integridad territorial;
2. verifica aprobación de la revisión actual;
3. recalcula totales territoriales;
4. verifica sexo, ciclo de vida y ubicación;
5. deriva completitud y brechas;
6. versiona archivos públicos seleccionados;
7. escribe el snapshot ciudadano vigente;
8. escribe un snapshot histórico público completo;
9. conserva el release interno;
10. actualiza la cronología pública;
11. registra auditoría.

## 8. Mapa

El mapa es un slippy map propio en JavaScript puro. Usa teselas OpenStreetMap únicamente como imágenes y superpone marcadores propios.

No depende de Leaflet, Mapbox, MapLibre ni CDN JavaScript cartográfico. Esto evita el problema CORS que presentó la implementación anterior.

Las ubicaciones de precisión `reference` se identifican como **referencias cartográficas aproximadas**, no como georreferenciación oficial de cada afectación.

## 9. Informe automático

`report.html` consume el mismo snapshot público que el portal.

- Sin parámetro: muestra el corte vigente.
- `report.html?release=<releaseId>`: carga el snapshot histórico público de ese corte.
- Permite exportar JSON y usar la impresión del navegador para generar PDF.

## 10. Resiliencia

- Navegación y documentos: estrategia network-first.
- Recursos locales: stale-while-revalidate.
- Firebase, Google y OSM no son interceptados por el service worker.
- Si Firebase falla, el portal permanece consultable en modo **Copia local**, sin afirmar sincronización en vivo.
