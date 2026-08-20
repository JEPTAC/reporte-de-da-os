# Reemplazo limpio — no parches

Esta entrega debe **reemplazar** la micropágina anterior. No está diseñada para copiar archivos sueltos encima de V4/V5/V6 previos.

## Procedimiento

1. Crear un backup o branch de la versión actualmente publicada.
2. Vaciar la raíz publicada del portal RUFE.
3. Copiar completa la carpeta `portal-rufe-san-pedro-v6-final`.
4. No recuperar CSS, JavaScript, mapa ni service worker del portal anterior.
5. Fusionar únicamente las reglas Firebase RUFE con las reglas existentes del proyecto compartido.
6. Desplegar las Cloud Functions incluidas.
7. Publicar GitHub Pages.
8. Retirar cualquier service worker antiguo que continúe controlando la ruta.
9. Ejecutar el smoke test de `DEPLOYMENT-CHECKLIST.md`.

## Por qué

El reemplazo limpio evita:

- reglas CSS heredadas;
- scripts duplicados;
- cachés incompatibles;
- dependencias CORS eliminadas;
- componentes de mapa incompatibles;
- listeners repetidos;
- estados Firebase mezclados entre versiones.

La única integración deliberada con infraestructura previa es el proyecto Firebase existente y sus usuarios/roles compatibles.
