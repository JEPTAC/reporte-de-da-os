# Seguridad y privacidad — Portal RUFE

## 1. Principio

El portal ciudadano no debe convertirse en una vía de exposición de los registros nominales del RUFE. La publicación se diseña sobre información **agregada**.

## 2. Información pública

`rufePublished/*` y `rufe-public/*` pueden ser consultados por visitantes. Por ello solo deben contener:

- indicadores agregados;
- territorios y referencias cartográficas públicas;
- narrativas institucionales;
- informes y evidencias previamente seleccionados para publicación;
- históricos de cortes publicados.

## 3. Información interna

`rufeEvents/*`, `rufeAudit/*` y `rufe-drafts/*` requieren Authentication y roles.

No incorporar a los snapshots públicos:

- números de documento;
- teléfonos particulares;
- nombres nominales de damnificados;
- direcciones individualizadas asociadas a personas;
- información médica o diferencial individual;
- soportes no aprobados para publicación.

## 4. Roles

- Editor: edición de borrador/territorios.
- Validador: revisión institucional.
- Administrador: edición + validación.
- Super Admin: usuarios, archivos y publicación.

Las operaciones de publicación y administración de cuentas se ejecutan con Cloud Functions, no con permisos administrativos en el navegador.

## 5. Usuarios

El Super Admin puede:

- crear cuentas;
- cambiar roles;
- activar/desactivar;
- enviar recuperación de contraseña;
- eliminar cuentas distintas de la propia.

La función bloquea la eliminación, desactivación o degradación accidental de la propia cuenta Super Admin.

## 6. Archivos

- Tamaño máximo definido por reglas: 40 MB.
- Rutas de borrador: solo acceso interno.
- Rutas públicas: escritura bloqueada desde cliente.
- La Cloud Function copia únicamente archivos marcados para publicación.

## 7. Firebase Web API key

La API key incluida identifica la Web App y puede existir en el frontend de Firebase. **No sustituye controles de acceso**. No deben incluirse contraseñas, service-account JSON, claves privadas ni secretos administrativos en GitHub.

## 8. Reglas compartidas

El proyecto Firebase también puede servir otras aplicaciones. Los archivos de `rules/` son fragmentos RUFE para **fusionar** con las reglas existentes. No deben sustituirse ciegamente las reglas completas del proyecto.

## 9. Publicación

Antes de publicar un corte:

1. ejecutar comprobación de consistencia;
2. revisar archivos marcados como públicos;
3. verificar que no haya información nominal en narrativas o anexos;
4. aprobar la revisión vigente;
5. publicar;
6. comprobar el resultado como visitante no autenticado.
