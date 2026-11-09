# Sitio público TrackFlow

Website construido con Next.js y exportación estática. Las URLs públicas son
`/`, `/application/` y `/assets/...`. Docker y Netlify redirigen las direcciones
antiguas `/index.html` y `/application.html` a las nuevas rutas. El contenido de ambas
páginas está implementado como componentes React en `app/`; el cambio de idioma,
la navegación y la validación del formulario se empaquetan con Next.js.

Desde la raíz del repositorio:

```bash
npm ci --prefix uis/website
npm run build:landing
npx --yes serve -l 3000 uis/website/out
```

Para desarrollo interactivo, ejecuta `npm run dev --prefix uis/website` y abre
`http://localhost:3000`. Las dependencias y el lockfile de Next.js son propios
de esta aplicación. Tailwind procesa los componentes y módulos de `app/`.

El Dockerfile genera el export estático y Nginx lo sirve en el puerto 80. Netlify
también publica `uis/website/out`.
