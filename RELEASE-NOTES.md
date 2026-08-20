# Release notes — Portal RUFE V6.1 Inmersivo

## Dirección de producto

V6.1 reconstruye la capa pública del portal. El objetivo deja de ser “mostrar un dashboard” y pasa a ser “guiar a la población para entender la información”.

## Experiencia nueva

### 1. Inicio narrativo
El inicio recupera el scrollytelling y lo amplía. El desplazamiento cambia cifra, narrativa, imagen y enlace relacionado para presentar progresivamente familias, vivienda prioritaria, enfoque diferencial y calidad del dato.

### 2. Navegación tipo XMB/PSP
La barra superior funciona como acceso rápido y la navegación lateral agrupa los contenidos según intención de consulta. En móvil se conserva una barra inferior simplificada.

### 3. Menús pasables
Las rutas ciudadanas y paneles clave utilizan carruseles horizontales con scroll-snap, botones anterior/siguiente y gesto de arrastre.

### 4. Capítulos internos
Cada módulo público recibe accesos internos y una explicación breve antes de sus gráficas o tablas.

### 5. Sistema tipográfico
- Lectura institucional: Century Gothic y fallbacks geométricos.
- Titulares: familias condensadas/anchas disponibles en el sistema.
- Contraste editorial: serif itálica.
- Acentos emocionales puntuales: cursiva de sistema.

### 6. Accesibilidad de movimiento
Todas las animaciones quedan reducidas o desactivadas cuando el dispositivo solicita `prefers-reduced-motion`.

## Backend y administración

No se eliminó la arquitectura V6: Firebase, roles, edición, revisión, publicación, histórico, archivos y auditoría continúan funcionando sobre la misma fuente de datos.
