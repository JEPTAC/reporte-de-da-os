# Lista de despliegue institucional — Portal RUFE V6 Final

## A. Reemplazo limpio

- [ ] Crear una copia/branch del portal actual.
- [ ] Vaciar la carpeta publicada del portal RUFE anterior.
- [ ] Copiar **todo** el contenido de `portal-rufe-san-pedro-v6-final` a la raíz del repositorio.
- [ ] No conservar `app.js`, `styles.css`, `map.js`, `firebase-service.js`, service workers ni assets de versiones anteriores.
- [ ] Confirmar que `.nojekyll` también fue copiado.

## B. GitHub Pages

- [ ] Confirmar estructura relativa de `index.html`, `report.html`, CSS, JS, `data/` y `assets/`.
- [ ] Publicar desde la rama configurada para Pages.
- [ ] Abrir la URL pública en una ventana privada.
- [ ] Hacer una recarga forzada la primera vez.
- [ ] Si un service worker antiguo sigue controlando la ruta, retirarlo desde DevTools → Application → Service Workers y volver a cargar.

## C. Firebase Authentication

- [ ] Proyecto `rendicion-de-cuentas-6aceb`.
- [ ] Email/Password habilitado si se usará.
- [ ] Google habilitado si se usará.
- [ ] `jeptac.github.io` agregado en Authorized domains.
- [ ] Existe al menos un `users/{uid}` con `role: super_admin`, `active: true`, `rufeAccess: true`.

## D. Firestore y Storage

- [ ] Fusionar `rules/firestore-rufe-snippet.rules` con las reglas existentes.
- [ ] Fusionar `rules/storage-rufe-snippet.rules` con las reglas existentes.
- [ ] No eliminar reglas de otras micropáginas.
- [ ] Publicar reglas.
- [ ] Confirmar lectura anónima de `rufePublished/{eventId}`.
- [ ] Confirmar lectura anónima de `rufePublished/{eventId}/releases/{releaseId}`.
- [ ] Confirmar que visitantes no leen `rufeEvents/*` ni `rufeAudit/*`.

## E. Cloud Functions

- [ ] Instalar Firebase CLI si no está disponible.
- [ ] Ejecutar `firebase login`.
- [ ] Ejecutar `firebase use rendicion-de-cuentas-6aceb`.
- [ ] Ejecutar `firebase deploy --only functions`.
- [ ] Confirmar en Firebase Console las 7 funciones RUFE.
- [ ] Probar creación de un usuario temporal de prueba y luego eliminarlo.

## F. Primer corte Firebase

- [ ] Entrar a `#administracion` como Super Admin.
- [ ] Inicializar/sincronizar la base solo si el evento aún no existe.
- [ ] Revisar 25 territorios.
- [ ] Revisar caracterización y contenido institucional.
- [ ] Pulsar **Comprobar consistencia**.
- [ ] Enviar a revisión.
- [ ] Aprobar la revisión vigente.
- [ ] Publicar.
- [ ] Confirmar que el portal público cambia sin editar HTML.
- [ ] Abrir `report.html` y comprobar que refleja el corte publicado.
- [ ] Abrir un corte desde Evolución y verificar `report.html?release=...`.

## G. QA ciudadano

- [ ] Banner: “Emergencia” azul.
- [ ] Buscador global no bloquea la pantalla.
- [ ] Mapa carga y contiene 25 puntos.
- [ ] Zoom, pan y selección funcionan.
- [ ] Filtros afectan mapa, ranking y tabla.
- [ ] Las referencias aproximadas están identificadas como referencias, no como georreferenciación oficial.
- [ ] Vivienda usa base común de 432 familias para porcentajes.
- [ ] Se muestra la advertencia de que la categoría censal no constituye dictamen estructural.
- [ ] Población, calidad, metodología y evolución cargan.
- [ ] PDF, infografías y documentos abren.
- [ ] El informe imprimible se puede guardar como PDF.
- [ ] Tema claro/oscuro funciona.
- [ ] Responsive en móvil y tableta.
- [ ] No hay datos nominales/sensibles en la vista pública.

## H. QA administrativo

- [ ] Editor puede modificar, pero no publicar.
- [ ] Validador puede aprobar/rechazar, pero no publicar.
- [ ] Super Admin puede crear, desactivar, reactivar y eliminar usuarios.
- [ ] No es posible eliminar/desactivar/degradar la cuenta Super Admin propia.
- [ ] Guardar un cambio invalida la aprobación anterior.
- [ ] Un borrador inconsistente no puede enviarse/aprobarse/publicarse.
- [ ] Publicar crea snapshot vigente + histórico público + release interno + auditoría.
- [ ] Los archivos públicos quedan versionados.
