# Contexto técnico

## Retención de despliegues — 10 de noviembre de 2026

En `feature/vps-image-retention`, `scripts/deploy.sh` incorpora simulación de
preflight (`--dry-run`) y de limpieza (`--retention-dry-run`) como quinto argumento.
Exige al menos 2 GiB antes del login y después del pull; el umbral puede aumentarse
con `TRACKFLOW_MIN_FREE_BYTES`. Tras verificar salud, datos y RAG registra los IDs
reales de los cuatro servicios en `retention-history.json`. Solo limpia etiquetas
GHCR del proyecto con SHA completo cuando dispone de activa y dos versiones
anteriores distintas verificadas. Protege cualquier contenedor y la original del
tracker (`trackflow-uis:before-tracker-env-*`) por ID compartido. Los rollbacks que
no coinciden con una versión retenida completa caducan en `retention-status.json`,
escrito antes de eliminar referencias; no modifica los backups. También retira
aliases obsoletos de rollback y correcciones temporales reconocidas en mantenimiento.
La simulación muestra las caducidades sin escribirlas. Consultar el registro antes
de restauraciones manuales. Historial/formatos inválidos detienen la limpieza.
No establece un techo absoluto de disco ni elimina respaldos de datos o volúmenes.
Compose de producción añade logs `json-file`, 10 MB × 3 por contenedor, efectivos
en futuras recreaciones. La automatización no está desplegada en esta sesión.

Operación y evidencia detalladas en `docs/vps-retention.md`. Pruebas aisladas:
`python3 -m unittest scripts.test_deployment scripts.test_retention -v` en Linux;
Docker simulado y directorios temporales. La retención queda embebida en el shell
para conservar el artefacto autónomo que transfiere el workflow actual.

## Caching de incidencias y backoffice — 10 de noviembre de 2026

En `feature/caching-optimisation`, desde `origin/main` (`e005162`), las lecturas
`GET /api/incidents` y `GET /api/incidents/summary` exigen usuario autenticado
(cambio de acceso autorizado; 401 declarado en OpenAPI). Conservan filtros y
cuerpos 200. Caché por proceso con TTL 30 s, reloj monotónico, máximo 128 entradas
LRU, claves por UUID y filtros normalizados, copias defensivas y bloqueo de cargas
y escrituras. El repositorio invalida todas las variantes tras commits de altas,
seeds y cambios de estado; rollback y errores no publican datos nuevos.
La configuración actual ejecuta un proceso API; escalar exige invalidación
compartida. Los cambios SQL externos pueden verse hasta 30 s después.

El middleware `api.timing` registra a nivel INFO método, plantilla de ruta, estado
y milisegundos, sin query, identificadores ni cuerpos. El colector debe habilitar
ese nivel. Los formularios de incidencias/proveedores se cargan bajo demanda con
`next/dynamic`; `useMemo([suppliers])` prepara filas y contadores, sin memoizar
la elección trivial de moneda. Cancelar y reabrir inicia un formulario nuevo.

Evidencia y auditoría de las 33 operaciones en `CACHING_REPORT.md` (raíz).
Benchmark aislado: `uv run --frozen python -m scripts.benchmark_caching --uncached`
y el mismo comando sin `--uncached`; seeder determinista en TemporaryDirectory,
dotenv/demo desactivados y auth sintética MemoryStorage. Se observó una carrera
previa del cursor JSON de TinyDB auth al leer concurrentemente: no se modifica
su almacenamiento y no se certifica con el benchmark su concurrencia real.
Medición UI: `node scripts/benchmark_supplier_view.mjs`; smoke Chrome/Windows:
`uv run --frozen python -m scripts.check_caching_browser --port 3103`, contra
backoffice de producción temporal en ese puerto y con backend sintético.
No hay dependencias, migraciones, cambios de stock, secretos ni infraestructura.

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

## Auditoría de serialización — tres fases, 9 de noviembre de 2026

Inventario estático en `docs/serialization-audit.md`, sobre `main` actualizado
(`91350ab3`, incluye RAG), rama `feature/serialization-audit`: 33 operaciones de
negocio, diez serializadas, cuatro parcialmente serializadas y diecinueve sin
contrato explícito (incluye CSV) en su estado original. Fase 2 implementada:
33 decoradores con response_model explícito, 32 contratos JSON y una descarga CSV
con None/Response y text/csv documentado. Registro sin email, perfiles sin user_id,
listados acotados y SKUReference id/name/sku en movimientos, sin sku_id de salida.
Se mantienen email propio en `/auth/me`, JWT de acceso y user_uuid operativo;
no se introducen usuarios SQL. Modelos de entrada/salida separados; RAG rechaza
extras. Se eliminan agregados de stock del listado de movimientos, conservando
cálculo de stock de productos y validación de salidas. Los tipos UI se ajustan.
Esquemas de incidencias, análisis, RAG y errores en schemas_responses.py. Las rutas
automáticas de documentación/OpenAPI se registran separadas del inventario de negocio.
Suite aislada: 137 pruebas y once subtests aprobados, seis omitidas en Windows;
backoffice: 17 pruebas, lint y build aprobados. Fase 3 autorizada y verificada:
la suite completa repite los mismos resultados; tres operaciones ejecutadas
interactivamente en Swagger mediante Chrome headless/CDP (registro 201, login 200,
cuenta propia 200) coinciden con OpenAPI. API y perfil de navegador temporales,
sin seeds, dotenv ni datos del proyecto. Se conserva la excepción CSV. Los seis
tests de despliegue requieren Linux; no se ejecutan allí porque Docker no está
disponible. Auditoría con estado original y 33 estados finales registrados.

## Restricciones
Código público únicamente en `uis/website`, interfaces internas bajo
`uis/backoffice`, backend en `services`. No crear carpetas paralelas. El tracker
anidado conserva ejecución, navegación y autenticación independientes.
Leer los AGENTS.md locales y las guías Next.js instaladas antes de tocar su código.
`.agents/` es configuración de asistencia; `agents/` es código de agentes de producto.
Credenciales, datos reales y volúmenes de producción están protegidos por
[AGENTS.md](../AGENTS.md). Usar datos sintéticos y almacenamiento temporal para pruebas.

Inventario calcula stock por SKU/almacén como entradas menos salidas, rechaza
stock negativo y mantiene usuarios en TinyDB; no crear usuarios SQL. La auditoría
conserva estas reglas y las rutas existentes; los cambios de forma de respuesta
se documentan en `docs/serialization-audit.md`.

## Comprobaciones reproducibles (desde raíz)
Instalación: `npm ci --prefix uis/website`, `npm ci`, `npm ci --prefix uis/backoffice`,
`npm ci --prefix uis/backoffice/talent-pipeline-tracker`, `uv sync --frozen`.
- Infraestructura IA: `npm run validate:ai-setup` y `npm run test:ai-setup`, en cualquier rama o checkout detached. La opción heredada `--check-branch` se acepta sin efecto por compatibilidad.
- Website: `npm run build:landing`; servir con `npx serve -l 3000 uis/website/out`.
- Backend: `uv run --frozen pytest -q` con almacenamiento aislado y sin servicios externos reales.
- Backoffice: `npm --prefix uis/backoffice test -- --runInBand`, `npm --prefix uis/backoffice run lint`, `npm --prefix uis/backoffice run build`.
- Tracker: `npm --prefix uis/backoffice/talent-pipeline-tracker run lint` y `npm --prefix uis/backoffice/talent-pipeline-tracker run build`.
- Contenedores: validar ambos Compose y construir imágenes. Ejecutar smoke tests de landing/assets/login/tracker con proyecto Compose y datos temporales exclusivos; jamás limpiar volúmenes existentes.

Las interfaces de tooling son comandos npm de validación y el CLI documentado
en la skill. La auditoría de serialización acota campos de respuesta y declara
sus contratos sin añadir rutas ni cambiar métodos HTTP.
