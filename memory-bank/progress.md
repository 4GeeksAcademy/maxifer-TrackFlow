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
