# TrackFlow API

Backend FastAPI para el backoffice interno de TrackFlow.

Incluye autenticación JWT, usuarios y perfiles, recuperación de contraseña,
proveedores, gestión y análisis CSV de incidencias, inventario y asistente comercial RAG.

## Stack

- FastAPI
- Uvicorn
- TinyDB para usuarios y proveedores; SQLite para incidencias
- SQLModel para inventario; PostgreSQL/Supabase o SQLite según `DATABASE_URL`
- Qdrant y gateway LiteLLM compatible con OpenAI para RAG
- Resend para recuperación de contraseña por correo
- `python-jose` para tokens JWT
- `python-multipart` para subida de archivos

## Requisitos

- Python 3.12 o superior, según `pyproject.toml`
- uv instalado

## Instalación

Desde la raíz del repositorio, sincronizar las dependencias:

```bash
uv sync --frozen
```

## Ejecutar

Desde la raíz del monorepo:

```bash
uv run --frozen uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

La API queda disponible en `http://localhost:8000`.

La documentación interactiva de FastAPI queda disponible en:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Configuración

El servicio lee configuración desde `services/api/.env` cuando existe.
En la primera instalación, copia `services/api/.env.example` a ese archivo y
completa los valores privados. Conserva cualquier configuración existente.

Variables esperadas:

| Variable | Uso |
| --- | --- |
| `JWT_SECRET` | Firma de tokens JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de sesión |
| `DATABASE_URL` | Conexión SQLModel para inventario; PostgreSQL/Supabase o SQLite |
| `DEMO_DATA_ENABLED` | `true` por defecto; `false` desactiva la cuenta de prueba automática y la importación del histórico |
| `FRONTEND_URL` | URL del backoffice usada en los enlaces de recuperación; usar `http://localhost:3001` si se inicia en 3001 |
| `RESEND_API_KEY`, `EMAIL_FROM` | Proveedor y remitente del correo de recuperación |
| `LITELLM_API_BASE`, `LITELLM_API_KEY` | URL y clave privadas del gateway RAG |
| `RAG_EMBEDDING_MODEL`, `RAG_LLM_MODEL` | Aliases autorizados de embeddings y generación, distintos entre sí |
| `QDRANT_URL` | URL de Qdrant accesible desde el proceso API |
| `RAG_COLLECTION_NAME` | Colección RAG; desarrollo usa `trackflow_knowledge` por defecto |

El arranque crea las tablas SQLModel del inventario. Con los datos de demo habilitados, garantiza una sola cuenta de prueba en TinyDB: **`test@test.com`**, contraseña **`test1234`**. Si falta, se crea con su perfil; si existe, se activa y su contraseña se restaura al valor indicado. No requiere configurar una contraseña de prueba en el entorno. No se crea ninguna tabla de usuarios en PostgreSQL.

Estas credenciales son públicas y exclusivas para desarrollo local. Configura `DEMO_DATA_ENABLED=false` antes de desplegar. Desactivar la demo no elimina cuentas ni datos existentes: usa almacenamiento separado en producción y no publiques la cuenta de prueba.

## Datos locales

### Gestor de incidencias

Con `DEMO_DATA_ENABLED=true` (por defecto), cada arranque importa automáticamente
el histórico de `scripts/incidents-trackflow.csv`. Usa `incident_id` para omitir
registros ya importados sin sobrescribir cambios de estado ni duplicarlos. Si falta
el CSV, se registra un aviso y el arranque continúa. También se puede importar
manualmente desde la raíz con `uv run python scripts/seed_incidents.py`, incluso
con la demo deshabilitada. La colección local queda en
`services/api/data/incidents.sqlite3` y se crea automáticamente. Si existe el archivo
local anterior `incidents.json`, sus registros se migran conservando los ID y el
archivo original. El seed informa las
filas inválidas y debe dejar 95 incidencias: 29 abiertas, 52 resueltas y 14
descartadas.

La API del gestor está en `/api/incidents` (POST y GET con filtros por `status`,
`origin`, `branch` y `category`), `/api/incidents/{id}`,
`/api/incidents/{id}/status` (PATCH) y `/api/incidents/summary`.
El backoffice en `/incidents` ofrece formulario, listado y resumen.

Listado y resumen requieren autenticación y usan caché por
proceso de 30 segundos, invalidada por las escrituras del repositorio. Los cambios
SQL externos pueden tardar ese intervalo en aparecer.

### Inventario y RAG

`/inventory/products` permite listar y crear SKU, y `/inventory/products/{product_id}`
consulta uno. `/inventory/orders` lista movimientos; `/inventory/orders/inbound`
y `/inventory/orders/outbound` registran entradas y salidas. El stock se calcula
por SKU y almacén como entradas menos salidas; se rechaza stock negativo.
Los usuarios siguen en TinyDB, sin tabla SQL de usuarios.

`POST /api/rag/query` requiere sesión y recibe `{"question": "..."}`. La respuesta
incluye respuesta y fuentes; configuración o servicio no disponible devuelve 503.
Consulta la [preparación del índice RAG](../../data/pipelines/README.es.md) y el
[contrato de serialización](../../docs/serialization-audit.md).

Los datos locales se guardan en `services/api/data/`.

| Archivo | Contenido |
| --- | --- |
| `auth.json` | Usuarios y datos de autenticación local |
| `suppliers.json` | Proveedores logísticos de demo |
| `incidents.sqlite3` | Incidencias con restricciones de integridad |

Estos datos son locales y de desarrollo. No deben usarse como fuente productiva.

## Módulos principales

| Archivo | Responsabilidad |
| --- | --- |
| `main.py` | App FastAPI, CORS y rutas principales |
| `auth.py` | Utilidades de autenticación |
| `security.py` | Hashing, JWT y dependencias de seguridad |
| `database.py` | Acceso a TinyDB |
| `models.py` | Modelos de dominio |
| `schemas_auth.py` | Schemas relacionados con auth |
| `seed.py` | Carga de datos iniciales |
| `routers/users.py` | Endpoints de usuarios |
| `routers/profiles.py` | Endpoints de perfiles |
| `routers/suppliers.py` | Endpoints de proveedores |
| `routers/incidents.py`, `incident_store.py`, `incident_cache.py` | Gestión, persistencia y caché de incidencias |
| `routers/inventory.py`, `inventory_models.py` | Rutas y modelos SQLModel del inventario |
| `routers/rag.py` | Endpoint autenticado del asistente |
| `schemas_responses.py` | Contratos de salida |
| `password_reset_service.py`, `email_service.py` | Recuperación de contraseña y envío de correo |

## Validación

Desde la raíz, `uv run --frozen pytest -q`. Las pruebas deben usar almacenamiento
aislado y servicios sintéticos, sin cargar datos ni credenciales de producción.

## Frontend relacionado

El consumidor principal es [uis/backoffice](../../uis/backoffice/README.md).
