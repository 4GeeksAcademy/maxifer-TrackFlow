# Progreso

## Estado base
Existen landing pública, backoffice de incidencias e inventario, autenticación,
tracker de contratación, pruebas y despliegue Docker/CI. Sus capacidades se
describen en [README](../README.md) y [TESTING](../TESTING.md).

## Hito AI-ready — 27 de octubre de 2026
Implementados: banco de memoria, protocolo AGENTS.md, regla de arquitectura,
skill verificable y migración de interfaces a rutas canónicas. Se incorpora el
briefing local y se preservan los contratos y puertos de las aplicaciones.

Validaciones realizadas:
- Validador: 35 comprobaciones aprobadas, incluyendo rama de entrega; 7 pruebas del validador aprobadas.
- `quick_validate.py` de skill-creator: skill válida.
- `npm run build:landing`: texto español, Tailwind y optimización sharp aprobados.
- Smoke HTTP estático: `/`, `/application.html`, `/i18n.js`, `/validation.js`, CSS, logo y hero WebP devuelven 200 con contenido.
- Backend con configuración aislada: 76 passed, 3 skipped, 7 subtests passed. El primer intento encontró permisos inválidos en el temporal compartido de pytest; el reintento con `--basetemp` nuevo pasó. Persisten tres avisos de deprecación de FastAPI/Starlette.
- Ambos Compose: `config --quiet` aprobado. Build y smoke de contenedores bloqueados localmente: Docker Desktop no expone el pipe `dockerDesktopLinuxEngine` tras el intento de inicio. No se modificaron datos de producción.
- Backoffice: 4 suites y 15 pruebas aprobadas, lint y build Next.js aprobados. Tracker: lint y build Next.js aprobados. Las APIs reales de TypeScript y ESLint confirman la exclusión del tracker en el padre (33 archivos propios de TypeScript).
- Los primeros intentos locales encontraron ejecutables ausentes/permisos del sandbox e instalaciones concurrentes; se detuvieron y se completaron instalaciones limpias antes de obtener los resultados anteriores.
- [CI del commit inicial](https://github.com/4GeeksAcademy/maxifer-TrackFlow/actions/runs/40596259118): jobs `tests` e `images` aprobados. Construcción de las tres imágenes y smoke tests de producción con datos aislados aprobados; `deploy` omitido por tratarse de una PR. Esto verifica contenedores pese al bloqueo del Docker local.

En Windows, si el temporal compartido de pytest presenta permisos inválidos, usar
`--basetemp .tmp/pytest-ai-<identificador-nuevo>` con una ruta nueva por ejecución,
`PYTHON_DOTENV_DISABLED=1`, `DEMO_DATA_ENABLED=false` y `DATABASE_URL=sqlite://`.
No reutilizar un temporal que contenga datos de otra ejecución.

## Siguientes pasos
1. Revisar la PR y sus comprobaciones automáticas tras cada nueva subida; no fusionar ni desplegar en este hito.
2. Mantener banco, reglas y skill sincronizados con futuros cambios de arquitectura.
3. Aclarar el nombre contradictorio del CEO en el briefing con el responsable.
4. Priorizar integraciones de tracking, devoluciones y soporte descritas en el briefing en hitos futuros; no considerarlas ya implementadas.

## Entrega
Commit inicial `72341e7` publicado en `feature/agent-memory-bank` y
[PR #27](https://github.com/4GeeksAcademy/maxifer-TrackFlow/pull/27) abierta hacia main,
con enlace directo a AGENTS.md. CI inicial aprobada; cada subida vuelve a validarse. La integración Netlify detectada
al abrir la PR requiere publicar `uis/website`; se incorpora `netlify.toml` para
alinear el hosting estático. No se fusionó la PR ni se ejecutó un despliegue manual.

## Migración del website a Next.js — 31 de octubre de 2026

Implementado en `feature/website-nextjs-migration`, rama nueva basada en
`feature/agent-memory-bank` a petición del desarrollador. El website se construye
con Next.js 16.4.3 y se exporta de forma estática dentro de `uis/website`.
El contenido y estilos están en componentes React/CSS de `app/`; Next genera
las rutas estáticas `/`, `/index.html` y `/application.html`. Los HTML fuente y
los endpoints públicos de scripts fueron retirados. Idioma, navegación y
formulario se cargan como módulos cliente después de montar el contenido React.
Las imágenes se preparan en `public/` durante los comandos Next.

Netlify publica `uis/website/out`; el contenedor landing genera el mismo export
y Nginx lo sirve en el puerto existente. Se quitaron los bind mounts de HTML y
assets en Compose de desarrollo porque ya no son los archivos servidos por el
contenedor.
La lectura de la guía local de Next.js fue denegada por la política de exclusión
de contenido; no se intentó acceder a ella por otra vía.

Verificación realizada:
- `npm run build:landing`: copy español y build/export de Next aprobados.
- `npm audit --prefix uis/website --omit=dev`: cero vulnerabilidades conocidas.
- Smoke HTTP al export: páginas, scripts y assets principales devolvieron 200.
- `docker compose build landing`: imagen construida. Smoke test con contenedor
  aislado y puerto temporal: `/`, `/index.html`, `/application.html`, ambos
  scripts y los assets logo/hero devolvieron HTTP 200; el contenedor temporal se
  detuvo y eliminó al terminar. No se levantó Compose completo ni se tocaron
  volúmenes o datos.
- El contexto de Docker excluyó el lockfile del website; debido a la política de
  acceso al archivo, la imagen instala dependencias desde `package.json` con
  `npm install --package-lock=false`, en vez de instalación reproducible con
  `npm ci`.
- Revisión correctiva en navegador sobre la imagen previa: el cambio de idioma
  dejaba las tarjetas de servicios en español y las selecciones del paso 2 no
  habilitaban «Siguiente». Se corrigió el selector de tarjetas y se procesa el
  evento `change` del formulario; las etiquetas accesibles del stepper también
  se actualizan con el idioma.
- `npm run build:landing` pasó después de retirar `index.html` y
  `application.html`; el export sigue produciendo las rutas `.html` requeridas.
- `docker compose config --quiet` y `docker compose build landing` pasaron con
  el Dockerfile sin copiar HTML ni scripts antiguos.
- `npm run validate:ai-setup` y `npm run test:ai-setup`: aprobados tras actualizar
  el validador para requerir entradas App Router y rechazar las fuentes antiguas.
- La prueba de navegador posterior al cambio quedó bloqueada: la política de
  contenido denegó el ejecutable local de Next.js al intentar iniciar el servidor
  de desarrollo. No se intentó leer el export restringido por otra vía.
- `git diff --check`: aprobado. No se ejecutó el modo `--check-branch`, porque
  exige `feature/agent-memory-bank` y el desarrollador pidió esta rama nueva.

## URLs sin extensión del website — 31 de octubre de 2026

A petición del desarrollador, se sustituye la conservación de URLs `.html`
documentada en la migración anterior: la navegación y las URLs canónicas ahora
usan `/` y `/application/`. `trailingSlash: true` genera el formulario como
`out/application/index.html`. Se ajustan datos estructurados, selectores de
idioma y rutas de imágenes a las nuevas direcciones.

Nginx y Netlify tienen redirecciones 301 para `/index.html` y
`/application.html`; Nginx también normaliza `/application/index.html`.
Las redirecciones Nginx conservan parámetros y usan destinos relativos para
respetar el puerto publicado por Docker. El smoke de despliegue incluye la ruta
nueva del formulario y mantiene las antiguas para comprobar compatibilidad.

Verificación realizada:
- `npm run build:landing`: copy español, TypeScript y export de Next aprobados.
- `npm run validate:ai-setup` y `npm run test:ai-setup`: aprobados, siete pruebas.
  El primer intento encontró EPERM del sandbox; el reintento autorizado pasó.
- `docker compose config --quiet`, build de landing y `nginx -t`: aprobados.
- HTTP en contenedor temporal aislado: páginas nuevas, logo, hero y assets
  referenciados por ambas páginas devuelven 200. No hay enlaces de navegación
  `.html` en el HTML generado y ambas páginas tienen su canonical nuevo.
  Las URLs antiguas, `/application` y `/application/index.html` devuelven 301
  hacia los destinos correctos, sin bucles; los parámetros `?lang=en` se
  conservan. Una ruta inexistente devuelve 404.
- No se verificaron las redirecciones en un hosting Netlify publicado ni se
  ejecutó una prueba de interacción en navegador.
- Contenedor temporal detenido y eliminado automáticamente; landing local
  iniciada con la imagen nueva mediante `docker compose up -d --no-deps landing`.
  Acceso HTTP en puerto 3000 aprobado para ambas páginas y URLs antiguas.
- No se crea commit ni PR en esta corrección; se mantiene la rama existente
  `feature/website-nextjs-migration`, con los cambios previos del desarrollador.

## Preparación de entrega de la migración — 31 de octubre de 2026

El desarrollador confirmó que probó el proyecto y funciona correctamente, y
autorizó commit, push y PR hacia `main`. Se mantiene
`feature/website-nextjs-migration`; las referencias remotas actualizadas no
muestran commits de esta rama pendientes respecto de `origin/main` antes de
incorporar la migración. Se revisa únicamente el conjunto de cambios del website,
su integración Docker/Netlify, documentación y validador. No se incluyen secretos,
datos persistentes ni cambios del backend o las interfaces internas.

Comprobaciones previas al commit:
- `npm run build:landing`: aprobado, incluidas comprobación de copy,
  compilación, TypeScript y exportación estática.
- `npm run validate:ai-setup`: aprobado; `npm run test:ai-setup`: siete pruebas
  aprobadas.
- La invocación npm con `-- --check-branch` no transmitió la opción en este
  entorno. La ejecución directa de `node .../validate.mjs --root . --check-branch`
  confirmó un único fallo: exige `feature/agent-memory-bank`. Se documenta la
  excepción porque la rama nueva fue solicitada para esta migración; no se
  cambia de rama ni se presenta esta comprobación como aprobada.
- Ambos Compose (`docker-compose.yml` y `docker-compose.prod.yml`) pasan
  `config --quiet`. El build Docker, `nginx -t` y smoke HTTP del website ya
  aprobados en esta sesión siguen siendo aplicables; no se modificó su código.
- El desarrollador validó manualmente el proyecto tras la corrección de rutas.
  No se repiten las suites de backend/backoffice/tracker sin cambios; sus
  comprobaciones automáticas y smoke del stack completo quedan a cargo de CI.
- Próximo paso: publicar la rama y abrir PR a `main`, adjuntando resultados y
  el enlace a AGENTS.md. No fusionar ni desplegar; el proyecto local fue detenido
  a petición del desarrollador.
