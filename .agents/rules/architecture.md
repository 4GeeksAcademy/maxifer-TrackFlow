---
description: Rutas de producto y separación de responsabilidades de TrackFlow.
alwaysApply: true
---

# Arquitectura obligatoria

Alcance: siempre activa en todo el monorepo. Leer esta regla desde AGENTS.md aunque
el cliente no interprete automáticamente el frontmatter de reglas.

- Público: `uis/website`; interfaces internas: `uis/backoffice`; APIs: `services`.
- El tracker independiente vive en `uis/backoffice/talent-pipeline-tracker`, con puerto 3002 y dependencias propias. No incluirlo en compilación, lint o pruebas del padre.
- No crear otro árbol de aplicaciones en raíz ni duplicar el producto en `src/`, `apps/` o una nueva UI hermana. Extender los módulos existentes.
- Conservar lógica compartida en `packages/` y datos fuera del código de presentación.
- `.agents/rules/` y `.agents/skills/` gobiernan al asistente. `agents/` contiene agentes de producto; son responsabilidades distintas.
- Los requisitos de negocio están en [BRIEFING.md](../../BRIEFING.md); consultar [techContext](../../memory-bank/techContext.md) para decisiones vigentes y zonas protegidas de [AGENTS.md](../../AGENTS.md).
- Mantener stock calculado y usuarios TinyDB; esta regla no autoriza migraciones de datos ni cambios de contratos.
