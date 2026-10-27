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
- Interfaces: reinstalación de dependencias y comprobaciones en curso. Los primeros intentos encontraron ejecutables ausentes/permisos del sandbox; hubo instalaciones concurrentes que se detuvieron antes de reinstalar. No se consideran checks aprobados. CI realizará tests y builds con instalaciones limpias.

En Windows, si el temporal compartido de pytest presenta permisos inválidos, usar
`--basetemp .tmp/pytest-ai-<identificador-nuevo>` con una ruta nueva por ejecución,
`PYTHON_DOTENV_DISABLED=1`, `DEMO_DATA_ENABLED=false` y `DATABASE_URL=sqlite://`.
No reutilizar un temporal que contenga datos de otra ejecución.

## Siguientes pasos
1. Completar validaciones de estructura, regresión y contenedores aislados.
2. Publicar la rama `feature/agent-memory-bank` y abrir PR hacia `main` con enlace a AGENTS.md; no fusionar ni desplegar.
3. Aclarar el nombre contradictorio del CEO en el briefing con el responsable.
4. Priorizar integraciones de tracking, devoluciones y soporte descritas en el briefing en hitos futuros; no considerarlas ya implementadas.
