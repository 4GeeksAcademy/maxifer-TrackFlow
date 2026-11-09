# TrackFlow

TrackFlow es un proyecto de AI Engineering para una empresa de logística de última milla y gestión de almacenes con operaciones en Los Ángeles y Zaragoza.

El repositorio reúne entregables del track de AI Engineering de 4Geeks Academy: landing pública, dashboards internos, backend FastAPI, lógica compartida de análisis, áreas de datos y estructura para futuros agentes, workflows, servidores MCP e infraestructura.

English documentation is available in [README.md](./README.md).

## Qué incluye

| Área | Ruta | Estado |
| --- | --- | --- |
| Sitio público | `uis/website` | Exportación estática de Next.js |
| Backoffice de incidencias | `uis/backoffice` | Disponible |
| Talent Pipeline Tracker | `uis/backoffice/talent-pipeline-tracker` | Disponible |
| Servicio FastAPI | `services/api` | Disponible |
| Asistente comercial RAG | `uis/backoffice`, `data/pipelines` | LiteLLM y Qdrant; requiere indexación |
| Lógica compartida de incidencias | `packages/incidents_analysis` | Disponible |
| Datos, agentes, workflows, infraestructura | `data/`, `agents/`, `workflows/`, `infra/` | Estructura del proyecto |

## Mapa del repositorio

```text
TrackFlow/
├── README.md
├── README.es.md
├── AGENTS.md                  # Protocolo del asistente
├── memory-bank/               # Contexto de negocio, técnico y progreso
├── .agents/                   # Reglas y skills del asistente
├── CONTEXT.md                 # Brief de empresa de TrackFlow
├── TrackFlow.md               # Elección de empresa y reto de automatización
├── agents/                    # Prototipos, templates y tools de agentes
├── data/                      # Datos raw, procesados, pipelines y evaluación
├── docs/                      # Documentación de arquitectura y proyecto
├── infra/                     # Definiciones de despliegue e infraestructura
├── internal/                  # Utilidades internas de desarrollo
├── mcps/                      # Servidores Model Context Protocol
├── packages/                  # Paquetes compartidos y lógica de dominio
├── scripts/                   # Scripts de automatización y soporte
├── services/                  # Servicios backend
├── shared/                    # Recursos compartidos que no son paquetes
├── skills/                    # Skills reutilizables para agentes
├── uis/                       # website, backoffice (tracker anidado)
└── workflows/                 # Flujos de automatización y orquestación
```

## Requisitos

- Docker Engine con Docker Compose, o Docker Desktop usando contenedores Linux
- Node.js 22 o superior
- npm 9 o superior
- Python 3.12 o superior
- uv para gestionar las dependencias y el entorno de Python

Los requisitos de Node.js, npm, Python y uv aplican al desarrollo local. Docker
Compose construye y ejecuta los servicios en contenedores.

## Levantar todo el proyecto con Docker

En la primera instalación, copia `.env.example` a `.env` desde la raíz. Si ya
tienes `.env`, consérvalo y añade únicamente las variables que te falten:

```powershell
Copy-Item .env.example .env
```

En macOS o Linux, usa `cp .env.example .env`. Mantén `.env` privado y no lo
subas al repositorio. Define un `JWT_SECRET` privado; puedes generar uno con
Docker:

```sh
docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Pega el valor generado en `JWT_SECRET`. Comprueba también que `.env` defina
`DATABASE_URL` y estos puertos de Compose: `LANDING_PORT=3000`,
`BACKOFFICE_PORT=3001`, `TALENT_PORT=3002` y `API_PORT=8000`. La configuración
de ejemplo usa SQLite dentro de un volumen Docker, así que no necesitas
PostgreSQL para una ejecución local. Si vas a usar otra base de datos, define
su URL de conexión en `.env` antes de iniciar.

Para usar el RAG, completa también `LITELLM_API_BASE`, `LITELLM_API_KEY`,
`RAG_EMBEDDING_MODEL` y `RAG_LLM_MODEL` con la URL, clave y aliases autorizados
de tu proxy LiteLLM compatible con OpenAI. Los modelos de embeddings y generación
deben ser distintos. Sin esas variables el stack arranca, pero el RAG no funciona.
Compose configura automáticamente `QDRANT_URL=http://qdrant:6333` para la API.

Valida la configuración y construye e inicia los servicios. El comando construye
el website Next.js como exportación estática servida por Nginx, además del
backoffice, tracker, API y Qdrant:

```sh
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Cuando la API y Qdrant estén saludables, indexa el corpus en la primera ejecución:

```sh
docker compose exec services python -m data.pipelines.setup_rag
```

El corpus actual contiene cuatro documentos y veinte fragmentos. La indexación
usa el proveedor de embeddings y puede tener coste. Repite el comando si cambias
el corpus o el modelo de embeddings: reemplaza la colección de conocimiento.
No hace falta reindexar en cada arranque; el índice persiste en `qdrant_data`.

Para seguir los logs de los servicios, ejecuta `docker compose logs -f`. Pulsa
Ctrl+C para dejar de seguirlos sin detener los servicios.

Abre los servicios en estas direcciones:

| Servicio | URL |
| --- | --- |
| Website público | http://localhost:3000 |
| Backoffice de incidencias | http://localhost:3001 |
| Asistente RAG (requiere iniciar sesión) | http://localhost:3001/assistant |
| Talent Pipeline Tracker | http://localhost:3002 |
| API / OpenAPI | http://localhost:8000/docs |

Si esos puertos están ocupados, cámbialos en `.env`. Si cambias el puerto del
backoffice, actualiza también `FRONTEND_URL`. La API habilita datos demo por
defecto: `test@test.com` / `test1234`. Son credenciales solo para desarrollo
local; configura `DEMO_DATA_ENABLED=false` antes de cualquier despliegue de
producción. Los datos de la API persisten en el volumen Docker `api_data`.
Para detener los contenedores conservando los datos y el índice RAG, usa
`docker compose stop`; para iniciarlos de nuevo, `docker compose up -d`.
`docker compose down` también conserva los volúmenes; **no uses
`docker compose down -v`** salvo que quieras eliminar deliberadamente sus datos.

El tracker necesita una API independiente con endpoints `/records` y notas;
FastAPI, tal como está incluido, no ofrece esos endpoints. Sin
`NEXT_PUBLIC_API_URL`, el tracker muestra que su servicio no está configurado.
El envío de correos de recuperación de contraseña también necesita
`RESEND_API_KEY` y un `EMAIL_FROM` válido; el resto del backoffice funciona sin
correo.

Para configuración de servicios, datos, solución de problemas y despliegue en
VPS, consulta [Dockerización y despliegue](./docs/docker.md).

En producción, el despliegue de `main` incluye Qdrant persistente e indexación
RAG automática. Antes del merge, configura las cuatro variables LiteLLM/modelos
en el `.env` privado del VPS; consulta la [guía de Actions](./docs/github-actions.md).
## Instalación

Desde la raíz del repositorio, instalar `uv` si todavía no está disponible:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Después, instalar todas las dependencias del proyecto:

```bash
# API Python y herramientas locales. Crea o actualiza .venv.
uv sync

# Website público (exportación estática de Next.js)
npm ci --prefix uis/website

# Backoffice de incidencias
cd uis/backoffice
npm ci

# Talent pipeline tracker
cd talent-pipeline-tracker
npm ci

# Volver a la raíz del repositorio
cd ../../..
```

Antes de iniciar la API, crear su configuración local si no existe:

```bash
cp services/api/.env.example services/api/.env
```

Definir `JWT_SECRET` y `DATABASE_URL` (conexión PostgreSQL/Supabase del inventario) en `services/api/.env`. Este archivo está ignorado por Git y no se debe subir.

### Datos de desarrollo automáticos

Al iniciar la API, `DEMO_DATA_ENABLED=true` está habilitado por defecto:

- Se garantiza una única cuenta de prueba: **`test@test.com`**, contraseña **`test1234`**. Se guarda en TinyDB; cada arranque restaura su contraseña y la activa sin duplicarla. No requiere configurar una contraseña de prueba en el entorno.
- Se importa automáticamente `scripts/incidents-trackflow.csv` a SQLite. Los registros ya importados se omiten por identificador, sin sobrescribir sus cambios. El CSV incluido contiene 95 incidencias válidas; las filas inválidas se notifican y se omiten. Si falta el archivo, se registra un aviso y la API sigue arrancando.

No es necesario ejecutar el cargador manualmente. Para una importación explícita o para repetirla:

```bash
uv run python scripts/seed_incidents.py
```

Estas credenciales son públicas y exclusivas para desarrollo local. **Antes de desplegar, configura `DEMO_DATA_ENABLED=false`** para desactivar tanto la cuenta de prueba automática como la importación. Esto no borra los datos ni las cuentas existentes: usa un almacenamiento separado para producción y no despliegues una cuenta con estas credenciales.

## Landing

Desde la raíz del repositorio:

```bash
npm ci --prefix uis/website
npm run build:landing
npx --yes serve -l 3000 uis/website/out
```

Abrir `http://localhost:3000`.

Scripts útiles en raíz:

| Comando | Para qué sirve |
| --- | --- |
| `npm run optimize:images` | Optimiza imágenes del website |
| `npm run test:spanish-copy` | Valida convenciones de copy en español |
| `npm run build:landing` | Valida el copy y genera la exportación estática de Next.js |

## Backoffice de incidencias

Este flujo tiene dos partes:

- Backend: [services/api](./services/api/README.md)
- Frontend: [uis/backoffice](./uis/backoffice/README.md)

Primero iniciar la API:

```bash
uv sync
uv run uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Después iniciar la UI:

```bash
cd uis/backoffice
npm install
npm run dev
```

## Talent Pipeline Tracker

El dashboard de reclutamiento vive en [uis/backoffice/talent-pipeline-tracker](./uis/backoffice/talent-pipeline-tracker/README.md).

```bash
cd uis/backoffice/talent-pipeline-tracker
npm install
npm run dev
```

## Convenciones de documentación

- Cada README de carpeta debe explicar responsabilidad, contenido y cómo ejecutar o extender esa parte.
- Conviene sumar detalles específicos a medida que las features existen; evitar texto genérico de plantilla.
- El README raíz debe enlazar a los README técnicos en vez de duplicar instrucciones largas.
- No subir secretos ni datos reales de personas/clientes. Usar ejemplos sintéticos o anonimizados.

## Contexto

El reto central de TrackFlow es modernizar operaciones logísticas fragmentadas: tracking con transportistas, análisis de incidencias, devoluciones, atención al cliente, visibilidad de almacén y reporting ejecutivo.

El reto de automatización elegido está documentado en [TrackFlow.md](./TrackFlow.md).
