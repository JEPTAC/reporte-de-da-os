# Integración Firebase — Portal RUFE V6 Final

## Proyecto

```text
rendicion-de-cuentas-6aceb
```

La configuración Web App ya está incorporada en `firebase-config.js` y reutiliza el proyecto de Rendición de Cuentas.

## Qué debe existir en Firebase

- Authentication con el método elegido habilitado.
- Firestore.
- Storage.
- Al menos un perfil `users/{uid}` con rol `super_admin` activo.
- Reglas RUFE fusionadas con las reglas existentes.
- Cloud Functions del paquete desplegadas.

## Funciones incluidas

```text
adminCreateRufeUser
adminManageRufeUser
validateRufeDraft
submitRufeForReview
reviewRufeDraft
publishRufeSnapshot
adminManageRufeMedia
```

## Operaciones privilegiadas

La creación/eliminación de cuentas y la publicación no dependen de permisos del navegador. Se ejecutan mediante Admin SDK dentro de Cloud Functions.

## Publicación

Un corte aprobado genera:

```text
rufePublished/{eventId}                         ← vigente
rufePublished/{eventId}/releases/{releaseId}   ← histórico público
rufeEvents/{eventId}/releases/{releaseId}      ← histórico interno
```

Los archivos seleccionados para publicación se copian a una ruta versionada en Storage.

## Reglas

Los archivos bajo `rules/` son fragmentos. El proyecto `rendicion-de-cuentas-6aceb` se comparte con otros desarrollos, por lo que deben fusionarse y probarse; no se deben pegar reemplazando reglas ajenas sin revisión.

## Dominio GitHub Pages

En Firebase Authentication → Settings → Authorized domains debe existir:

```text
jeptac.github.io
```

Si después se adopta un dominio institucional, añadirlo allí también.
