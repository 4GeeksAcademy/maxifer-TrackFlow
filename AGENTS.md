# Protocolo de agentes de TrackFlow

## Inicio obligatorio de cada sesión
Leer [projectbrief](memory-bank/projectbrief.md), [techContext](memory-bank/techContext.md),
[progress](memory-bank/progress.md) y [BRIEFING](BRIEFING.md). Aplicar la
[regla de arquitectura](.agents/rules/architecture.md) y leer los AGENTS.md locales
antes de intervenir en una aplicación. Los manifiestos y código ejecutable describen
el estado técnico real; el briefing define el negocio. Registrar contradicciones,
sin resolverlas inventando información.

## Flujo obligatorio antes de cualquier commit
1. Revisar solicitud, rama, `git status --short` y `git diff`; limitar el cambio al alcance autorizado.
2. Contrastar los archivos afectados con las zonas protegidas y comprobar autorización humana vigente.
3. Actualizar el banco de memoria con decisiones, progreso y siguientes pasos comprobados.
4. Ejecutar `npm run validate:ai-setup`, `npm run test:ai-setup` y las comprobaciones del área modificada descritas en techContext. Añadir `-- --check-branch` al validador al entregar este hito. Registrar resultados reales y bloqueos; no presentar comprobaciones omitidas como aprobadas.
5. Revisar secretos y datos personales en el diff y ejecutar `git diff --check`; corregir problemas introducidos.
6. Añadir únicamente los archivos del trabajo con rutas explícitas; revisar `git diff --cached --check` y `git diff --cached` antes de crear el commit. Nunca incorporar cambios ajenos automáticamente.

## Zonas protegidas
Requieren confirmación explícita del desarrollador humano antes de modificarlas:
- `.env`, `.env.*` salvo ejemplos sin secretos, claves, certificados y credenciales.
- `services/api/data/`, datos reales en `data/`, bases de datos, backups y volúmenes persistentes; nunca ejecutar limpiezas o seeds contra producción.
- `BRIEFING.md`, `RETO.md`, `CONTEXT*.md` y `TrackFlow.md`, fuentes de requisitos y negocio.
- `.github/workflows/`, `infra/`, Dockerfiles, archivos Compose y `scripts/deploy.sh`: infraestructura y despliegue.

La solicitud de este hito autoriza incorporar BRIEFING.md y adaptar rutas en Docker,
Compose y CI para la migración acordada. No autoriza fusionar la PR, desplegar,
alterar secretos o modificar datos de producción. Para cambios futuros, comprobar
la autorización de la sesión; no repetir preguntas por acciones ya autorizadas.

## Arquitectura y entrega
El producto público vive en `uis/website`, las interfaces internas en `uis/backoffice`
(tracker independiente en su subcarpeta `talent-pipeline-tracker`) y el backend en
`services`. No crear árboles paralelos. `.agents/` configura al asistente;
`agents/` contiene agentes de producto, y `skills/` no sustituye `.agents/skills/`.

Para este hito usar `feature/agent-memory-bank`. Publicar PR hacia `main` de
`4GeeksAcademy/maxifer-TrackFlow`, enlazar AGENTS.md de la rama y adjuntar resultados.
No fusionar ni desplegar. La skill [validate-ai-setup](.agents/skills/validate-ai-setup/SKILL.md)
automatiza la revisión estructural, pero no sustituye la revisión del contexto de negocio.
