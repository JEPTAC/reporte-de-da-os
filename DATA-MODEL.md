# Modelo de datos — Portal RUFE

## Separación fundamental

El sistema separa **datos de trabajo** de **datos publicados**. Esto evita exponer información interna por accidente y permite conservar trazabilidad entre cortes.

## 1. Evento

Identificador actual:

```text
san-pedro-sismo-2026
```

Agrupa borrador, territorios, workflow, archivos y releases.

## 2. Territorios

`rufeEvents/{eventId}/territories/{territoryId}`

Campos operativos del portal:

```text
sector
families
people
noHab
destroyed
noState
empty
lat
lng
precision
reference
source
```

`noState` conserva el valor territorial bruto del informe. El cálculo municipal de familias nominales sin estado descuenta los núcleos vacíos para evitar duplicidad conceptual.

## 3. Borrador consolidado

`rufeEvents/{eventId}/drafts/current`

Contiene las dimensiones agregadas y narrativas institucionales: resumen ejecutivo, alcance, limitaciones, contexto, marco normativo, vivienda, población, calidad, metodología, prioridades, conclusiones y control documental.

Los totales que dependen del territorio se vuelven a derivar en backend antes de publicar.

## 4. Workflow

`rufeEvents/{eventId}/workflow/state`

Campos clave:

```text
revision
reviewStatus
submittedRevision
approvedRevision
submittedBy
approvedBy
publishedRevision
```

Una edición posterior a una aprobación incrementa `revision` y elimina la aprobación previa.

## 5. Archivos

Metadatos privados:

```text
rufeEvents/{eventId}/media/{mediaId}
```

Bytes de trabajo:

```text
rufe-drafts/{eventId}/...
```

Al publicar, los archivos seleccionados se copian a una ruta versionada:

```text
rufe-public/{eventId}/{version-corte}/...
```

La publicación histórica conserva la URL de esa copia, de modo que retirar un archivo del siguiente corte no destruye la evidencia de un corte anterior.

## 6. Snapshot ciudadano vigente

```text
rufePublished/{eventId}
```

Incluye exclusivamente información agregada y contenido institucional apto para publicación.

## 7. Histórico público

```text
rufePublished/{eventId}/releases/{releaseId}
```

Cada documento conserva el snapshot completo publicado en ese corte y es inmutable desde el cliente.

## 8. Histórico interno

```text
rufeEvents/{eventId}/releases/{releaseId}
```

Conserva el release para control institucional y validadores.

## 9. Usuarios

```text
users/{uid}
```

Roles reconocidos:

```text
editor
validator
admin
super_admin
```

El Super Admin crea y elimina cuentas mediante Cloud Functions; los clientes no reciben privilegios de Firebase Admin SDK.

## 10. Auditoría

```text
rufeAudit/{logId}
```

Registra acciones privilegiadas: usuarios, validación, revisión, publicación y archivos.
