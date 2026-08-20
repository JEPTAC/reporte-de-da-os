# Smoke test local — Portal RUFE V6 Final

Prueba HTTP local ejecutada sobre el paquete final antes de empaquetar.

Respuestas `200 OK` verificadas para:

- `/`
- `/index.html`
- `/report.html`
- `/styles.css`
- `/app.js`
- `/map.js`
- `/firebase-service.js`
- `/data/report-data.js`
- `/assets/informe-consolidado-18-agosto-2026.pdf`
- `/manifest.json`

La navegación automática con Chromium headless no puede ejecutarse en este runtime por política del entorno. Debe completarse el smoke test de interfaz indicado en `DEPLOYMENT-CHECKLIST.md` una vez publicado en GitHub Pages.
