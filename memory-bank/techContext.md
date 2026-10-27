# Contexto técnico

## Arquitectura comprobada
- Público: HTML, JavaScript y assets estáticos en `uis/website`, Tailwind CSS 3 y optimización con sharp. Nginx sirve las mismas URLs públicas.
- Backoffice: Next.js 16.3.1, React 19.2.8, TypeScript 5 y Tailwind CSS 4 en `uis/backoffice`.
- Tracker de contratación: Next.js 16.2.10 y React 19.2.4 en `uis/backoffice/talent-pipeline-tracker`; aplicación independiente con lockfile propio. Excluir su árbol del TypeScript, ESLint y Jest del padre.
- Backend: FastAPI, Python >=3.12, uv y uv.lock; rutas en `services/api`. Autenticación y usuarios en TinyDB, contraseñas hasheadas y JWT; incidencias en SQLite; inventario con SQLModel y PostgreSQL/Supabase (SQLite aislado en pruebas).
- Lógica compartida de incidencias en `packages/incidents_analysis`; no duplicarla en interfaces.
- Docker usa Node 22. Puertos públicos de desarrollo: landing 3000, backoffice 3001, tracker 3002, API configurable (habitualmente 8000). Mantener contratos HTTP y rewrites `/backend`.
- Netlify tiene una integración de previews de PR: `netlify.toml` construye desde raíz y publica solo `uis/website`. No ejecutar despliegues manuales al entregar este hito.

Los manifiestos y lockfiles prevalecen sobre mínimos desactualizados del README.
El briefing describe necesidades del negocio, no impone un stack nuevo. No cambiar
frameworks ni bases de datos para completar este hito.

## Restricciones
Código público únicamente en `uis/website`, interfaces internas bajo
`uis/backoffice`, backend en `services`. No crear carpetas paralelas. El tracker
anidado conserva ejecución, navegación y autenticación independientes.
Leer los AGENTS.md locales y las guías Next.js instaladas antes de tocar su código.
`.agents/` es configuración de asistencia; `agents/` es código de agentes de producto.
Credenciales, datos reales y volúmenes de producción están protegidos por
[AGENTS.md](../AGENTS.md). Usar datos sintéticos y almacenamiento temporal para pruebas.

Inventario calcula stock por SKU/almacén como entradas menos salidas, rechaza
stock negativo y mantiene usuarios en TinyDB; no crear usuarios SQL. Esta entrega
no modifica estas reglas de negocio ni endpoints existentes.

## Comprobaciones reproducibles (desde raíz)
Instalación: `npm ci`, `npm ci --prefix uis/backoffice`,
`npm ci --prefix uis/backoffice/talent-pipeline-tracker`, `uv sync --frozen`.
- Infraestructura IA: `npm run validate:ai-setup -- --check-branch` y `npm run test:ai-setup`. En CI/main omitir `--check-branch`.
- Landing: `npm run build:landing`; servir con `npx serve -l 3000 uis/website`.
- Backend: `uv run --frozen pytest -q` con almacenamiento aislado y sin servicios externos reales.
- Backoffice: `npm --prefix uis/backoffice test -- --runInBand`, `npm --prefix uis/backoffice run lint`, `npm --prefix uis/backoffice run build`.
- Tracker: `npm --prefix uis/backoffice/talent-pipeline-tracker run lint` y `npm --prefix uis/backoffice/talent-pipeline-tracker run build`.
- Contenedores: validar ambos Compose y construir imágenes. Ejecutar smoke tests de landing/assets/login/tracker con proyecto Compose y datos temporales exclusivos; jamás limpiar volúmenes existentes.

No hay cambios de API pública por esta migración. Las interfaces nuevas de tooling
son comandos npm de validación y el CLI documentado en la skill.
