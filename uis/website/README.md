# Sitio público TrackFlow

Landing estática, formulario, traducciones y assets públicos. Las URLs siguen
siendo `/`, `/application.html`, `/i18n.js`, `/validation.js` y `/assets/...`.

Desde la raíz del repositorio: `npm ci`, `npm run build:landing` y
`npx serve -l 3000 uis/website`. Tailwind usa configuración y contenido relativos
a esta carpeta. Los scripts auxiliares se mantienen en `scripts/`.

Docker sirve este directorio con Nginx mediante `infra/landing/Dockerfile`.
