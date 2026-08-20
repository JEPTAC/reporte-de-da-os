# Smoke test de publicación — V6.1

Ejecutar después de publicar en GitHub Pages.

## Inicio
- [ ] “Emergencia” aparece en azul y “Sísmica” en blanco.
- [ ] Las dos fotografías reales cargan.
- [ ] La línea sísmica se anima.
- [ ] El carrusel “¿Qué quieres consultar?” se puede desplazar.
- [ ] El scrollytelling cambia cifra y narrativa al avanzar.
- [ ] En móvil el título completo cabe sin corte horizontal.

## Navegación
- [ ] Barra XMB superior abre Panorama, Mapa, Vivienda, Población e Informes.
- [ ] Sidebar muestra correctamente la sección activa.
- [ ] Buscador devuelve resultados sin abrir modal.
- [ ] Los rieles internos llevan a cada bloque de la sección.

## Territorio
- [ ] El mapa muestra teselas OSM.
- [ ] Se renderizan 25 marcadores.
- [ ] Clic en marcador abre ficha del sector.
- [ ] Zoom +/− y restablecer funcionan.
- [ ] Los filtros actualizan mapa, ranking y tabla.

## Vivienda y población
- [ ] Las barras de vivienda muestran las seis marcas del corte.
- [ ] La advertencia técnica permanece visible.
- [ ] Sexo, ciclo de vida y ubicación se renderizan.

## Informes
- [ ] Biblioteca filtra por tipo.
- [ ] PDF fuente abre en el visor o mediante enlace alterno.
- [ ] `report.html` genera la vista del corte.

## Firebase
- [ ] Sin autenticación, la consulta pública funciona.
- [ ] Si Firebase no responde, aparece “Copia local”.
- [ ] Super Admin puede iniciar sesión.
- [ ] Guardar un territorio incrementa revisión.
- [ ] Validar / aprobar / publicar respeta el workflow.

## Consola
- [ ] No hay errores CORS de Leaflet/unpkg.
- [ ] No hay referencias locales 404.
- [ ] No hay excepciones JavaScript.
