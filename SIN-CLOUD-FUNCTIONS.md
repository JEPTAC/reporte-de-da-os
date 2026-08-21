# Versión sin Cloud Functions

Esta versión no llama `adminCreateRufeUser` ni ninguna Cloud Function.

Cambios técnicos:
- `firebase-service.js` usa Firebase Auth + Firestore directamente.
- Crear usuario usa una app secundaria de Firebase Auth para no cerrar la sesión del administrador.
- Si el correo ya existe en Authentication, se crea/actualiza el perfil RUFE en Firestore por correo.
- Los cambios de rol/estado afectan el perfil RUFE en `/users`, no eliminan ni deshabilitan cuentas de Authentication.
- La publicación RUFE escribe directamente en `rufePublished` con permisos de reglas.

Aplica primero las reglas de `rules/firestore-rufe-sin-functions.rules`.
