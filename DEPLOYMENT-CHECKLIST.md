# DEPLOYMENT-CHECKLIST

Versión sin Cloud Functions.

El portal no llama `adminCreateRufeUser`, `adminManageRufeUser` ni funciones `httpsCallable`.
La administración usa Firebase Auth del cliente y Firestore, controlado por las reglas de `rules/firestore-rufe-sin-functions.rules`.

Antes de publicar, pega esas reglas en Firestore.
