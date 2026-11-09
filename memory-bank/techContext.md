# Contexto técnico

## Arquitectura comprobada
- Público: Next.js 16.4.3, React 19.2.8, TypeScript 5 y Tailwind CSS 3 en `uis/website`, con exportación estática y `trailingSlash: true`. Las rutas `/` y `/application/` se renderizan desde componentes React en `app/`; los módulos cliente de idioma, navegación y formulario se empaquetan con Next y se inicializan tras montar el contenido. Los antiguos HTML y scripts públicos no son fuentes ni dependencias del build. Nginx sirve `uis/website/out`; Docker y Netlify redirigen con 301 `/index.html` y `/application.html` a las rutas sin extensión.
- Backoffice: Next.js 16.3.1, React 19.2.8, TypeScript 5 y Tailwind CSS 4 en `uis/backoffice`.
- Tracker de contratación: Next.js 16.2.10 y React 19.2.4 en `uis/backoffice/talent-pipeline-tracker`; aplicación independiente con lockfile propio. Excluir su árbol del TypeScript, ESLint y Jest del padre.
- Backend: FastAPI, Python >=3.12, uv y uv.lock; rutas en `services/api`. Autenticación y usuarios en TinyDB, contraseñas hasheadas y JWT; incidencias en SQLite; inventario con SQLModel y PostgreSQL/Supabase (SQLite aislado en pruebas).
- Lógica compartida de incidencias en `packages/incidents_analysis`; no duplicarla en interfaces.
- RAG comercial: pipeline en `data/pipelines/rag.py` y transporte/cachés en
  `data/pipelines/rag_runtime.py`. HTTPX asíncrono consume el mismo gateway LiteLLM
  y aliases OpenAI-compatible, sin reintentos locales; el endpoint sigue síncrono.
  Presupuesto de consulta 30 s, etapas de embedding/búsqueda/generación 10/5/20 s
  limitadas al restante. Cachés por proceso de 256 entradas: embeddings 15 min y
  respuestas 5 min; la respuesta depende del contexto recuperado actual. Qdrant se
  consulta en cada pregunta. No se cambian modelos ni parámetros de generación.
- RAG en producción: imagen API con módulos mínimos y corpus, Qdrant `v1.15.3`
  privado con volumen propio y alias `trackflow_knowledge_prod` seleccionado por
  `RAG_COLLECTION_NAME` (desarrollo conserva `trackflow_knowledge`). Preparación
  idempotente en `data/pipelines/production_rag.py`, índices inmutables por huella,
  activación atómica durante la pausa API y restauración del alias en rollback.
  Requiere las cuatro variables privadas de proveedor/modelos y cuenta activa
  existente en el VPS. CI usa Qdrant real y gateway sintético; no mide Recall.
- Docker usa Node 22. Puertos públicos de desarrollo: landing 3000, backoffice 3001, tracker 3002, API configurable (habitualmente 8000). Mantener contratos HTTP y rewrites `/backend`.
- Netlify tiene una integración de previews de PR: `netlify.toml` instala las dependencias de `uis/website`, ejecuta el build de la raíz y publica solo `uis/website/out`. No ejecutar despliegues manuales al entregar este hito.

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
Instalación: `npm ci --prefix uis/website`, `npm ci`, `npm ci --prefix uis/backoffice`,
`npm ci --prefix uis/backoffice/talent-pipeline-tracker`, `uv sync --frozen`.
- Infraestructura IA: `npm run validate:ai-setup` y `npm run test:ai-setup`, en cualquier rama o checkout detached. La opción heredada `--check-branch` se acepta sin efecto por compatibilidad.
- Website: `npm run build:landing`; servir con `npx serve -l 3000 uis/website/out`.
- Backend: `uv run --frozen pytest -q` con almacenamiento aislado y sin servicios externos reales.
- Backoffice: `npm --prefix uis/backoffice test -- --runInBand`, `npm --prefix uis/backoffice run lint`, `npm --prefix uis/backoffice run build`.
- Tracker: `npm --prefix uis/backoffice/talent-pipeline-tracker run lint` y `npm --prefix uis/backoffice/talent-pipeline-tracker run build`.
- Contenedores: validar ambos Compose y construir imágenes. Ejecutar smoke tests de landing/assets/login/tracker con proyecto Compose y datos temporales exclusivos; jamás limpiar volúmenes existentes.

No hay cambios de API pública por esta migración. Las interfaces nuevas de tooling
son comandos npm de validación y el CLI documentado en la skill.
