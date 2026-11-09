# TrackFlow

TrackFlow is an AI Engineering project for a last-mile logistics and warehouse operations company with teams in Los Angeles and Zaragoza.

The repository combines several deliverables for the 4Geeks Academy AI Engineering Track: a public website, internal dashboards, a FastAPI backend, shared analysis logic, data areas, and placeholders for future agents, workflows, MCP servers, and infrastructure.

Spanish documentation is available in [README.es.md](./README.es.md).

## What Is Included

| Area | Path | Status |
| --- | --- | --- |
| Public website | `uis/website` | Next.js static export |
| Incidents backoffice | `uis/backoffice` | Available |
| Talent pipeline tracker | `uis/backoffice/talent-pipeline-tracker` | Available |
| FastAPI service | `services/api` | Available |
| Commercial RAG assistant | `uis/backoffice`, `data/pipelines` | LiteLLM and Qdrant; indexing required |
| Shared incidents logic | `packages/incidents_analysis` | Available |
| Data, agents, workflows, infra | `data/`, `agents/`, `workflows/`, `infra/` | Project structure |

## Repository Map

```text
TrackFlow/
├── README.md
├── README.es.md
├── AGENTS.md                  # Protocolo del asistente
├── memory-bank/               # Contexto de negocio, técnico y progreso
├── .agents/                   # Reglas y skills del asistente
├── CONTEXT.md                 # TrackFlow company brief
├── TrackFlow.md               # Company choice and selected automation challenge
├── agents/                    # Agent prototypes, templates and tools
├── data/                      # Raw, processed, pipeline and evaluation data
├── docs/                      # Architecture and project documentation
├── infra/                     # Deployment and infrastructure definitions
├── internal/                  # Internal developer utilities
├── mcps/                      # Model Context Protocol servers
├── packages/                  # Shared packages and domain logic
├── scripts/                   # Automation and utility scripts
├── services/                  # Backend services
├── shared/                    # Shared resources that are not packages
├── skills/                    # Reusable agent skills
├── uis/                       # website, backoffice (tracker anidado)
└── workflows/                 # Automation and orchestration flows
```

## Requirements

- Docker Engine with Docker Compose, or Docker Desktop using Linux containers
- Node.js 22 or newer
- npm 9 or newer
- Python 3.12 or newer
- uv for Python dependency and environment management

The host requirements for Node.js, npm, Python and uv apply to local development.
Docker Compose builds and runs the services in containers.

## Run the Full Stack with Docker

For a first installation, copy `.env.example` to `.env` from the repository root.
If `.env` already exists, keep it and add only the missing variables:

```powershell
Copy-Item .env.example .env
```

On macOS or Linux, use `cp .env.example .env`. Keep `.env` private and do not
commit it. Set a private `JWT_SECRET` in `.env`; Docker can generate one with:

```sh
docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_urlsafe(48))"
```

Paste the generated value into `JWT_SECRET`. Make sure `.env` also defines
`DATABASE_URL` and these Compose ports: `LANDING_PORT=3000`,
`BACKOFFICE_PORT=3001`, `TALENT_PORT=3002` and `API_PORT=8000`. The example
configuration uses SQLite in a Docker volume, so PostgreSQL is not required for
a local run. To use a different database, set its connection URL in `.env`
before starting.

For RAG, also set `LITELLM_API_BASE`, `LITELLM_API_KEY`, `RAG_EMBEDDING_MODEL`
and `RAG_LLM_MODEL` using your OpenAI-compatible LiteLLM proxy URL, key and
authorized model aliases. Embedding and generation models must be different.
The stack can start without these values, but RAG will not work.
Compose automatically sets `QDRANT_URL=http://qdrant:6333` for the API.

Validate the configuration and build/start the services. This builds the Next.js
website as a static export served by Nginx, plus the backoffice, tracker, API
and Qdrant:

```sh
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Once the API and Qdrant are healthy, index the corpus on the first run:

```sh
docker compose exec services python -m data.pipelines.setup_rag
```

The current corpus contains four documents and twenty chunks. Indexing calls
the embedding provider and may incur charges. Repeat it when changing the corpus
or embedding model: it replaces the knowledge collection. You do not need to
reindex on every startup; the index persists in `qdrant_data`.

To follow service logs, run `docker compose logs -f`; press Ctrl+C to stop
following logs without stopping the services.

Open the services at:

| Service | URL |
| --- | --- |
| Public website | http://localhost:3000 |
| Incidents backoffice | http://localhost:3001 |
| RAG assistant (sign-in required) | http://localhost:3001/assistant |
| Talent pipeline tracker | http://localhost:3002 |
| API / OpenAPI | http://localhost:8000/docs |

Use the port values in `.env` if those defaults are occupied. If you change the
backoffice port, update `FRONTEND_URL` in `.env` as well. The development API
enables demo data by default: `test@test.com` / `test1234`. These credentials
are for local development only; set `DEMO_DATA_ENABLED=false` before any
production deployment. The API data persists in the `api_data` Docker volume.
Use `docker compose stop` to stop containers while preserving data and the RAG
index; start them again with `docker compose up -d`.
`docker compose down` also preserves volumes; **do not use
`docker compose down -v`** unless you deliberately want to delete its data.

The tracker needs a separate API with `/records` and notes endpoints; the
included FastAPI service does not provide those endpoints. Without
`NEXT_PUBLIC_API_URL`, the tracker shows that its service is not configured.
Password-reset email delivery also needs `RESEND_API_KEY` and a valid
`EMAIL_FROM`; the rest of the backoffice can run without email.

For service configuration, data, troubleshooting and VPS deployment, see
[Docker setup and deployment](./docs/docker.md).

Production deployments from `main` include persistent Qdrant and automatic RAG
indexing. Before merging, configure the four LiteLLM/model variables in the VPS
private `.env`; see the [Actions guide](./docs/github-actions.md).
## Installation

From the repository root, install `uv` if it is not already available:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Then install all project dependencies:

```bash
# Python API and local tooling. Creates or updates .venv.
uv sync

# Public website (Next.js static export)
npm ci --prefix uis/website

# Incidents backoffice
cd uis/backoffice
npm ci

# Talent pipeline tracker
cd talent-pipeline-tracker
npm ci

# Return to the repository root
cd ../../..
```

Before starting the API, create its local configuration if it does not exist:

```bash
cp services/api/.env.example services/api/.env
```

Set `JWT_SECRET` and `DATABASE_URL` (the inventory PostgreSQL/Supabase connection) in `services/api/.env`. This file is ignored by Git and must not be committed.

### Automatic Development Data

When the API starts, `DEMO_DATA_ENABLED=true` is enabled by default:

- A single test account is ensured: **`test@test.com`**, password **`test1234`**. It is stored in TinyDB; every startup restores its password and activates it without duplicating it. No test password environment setting is required.
- `scripts/incidents-trackflow.csv` is automatically imported into SQLite. Previously imported records are skipped by identifier, preserving any changes. The bundled CSV contains 95 valid incidents; invalid rows are reported and skipped. If the file is missing, a warning is logged and the API still starts.

No manual seed command is required. For an explicit import or to repeat it:

```bash
uv run python scripts/seed_incidents.py
```

These credentials are public and strictly for local development. **Before deploying, set `DEMO_DATA_ENABLED=false`** to disable both automatic test account setup and imports. This does not delete existing data or accounts: use separate production storage and never deploy an account with these credentials.

## Landing Page

From the repository root:

```bash
npm ci --prefix uis/website
npm run build:landing
npx --yes serve -l 3000 uis/website/out
```

Open `http://localhost:3000`.

Useful root scripts:

| Command | Purpose |
| --- | --- |
| `npm run optimize:images` | Optimizes website images |
| `npm run test:spanish-copy` | Checks Spanish copy conventions |
| `npm run build:landing` | Checks Spanish copy and creates the Next.js static export |

## Incidents Backoffice

This flow has two parts:

- Backend: [services/api](./services/api/README.md)
- Frontend: [uis/backoffice](./uis/backoffice/README.md)

Start the API first:

```bash
uv sync
uv run uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Then start the UI:

```bash
cd uis/backoffice
npm install
npm run dev
```

## Talent Pipeline Tracker

The recruiting dashboard lives in [uis/backoffice/talent-pipeline-tracker](./uis/backoffice/talent-pipeline-tracker/README.md).

```bash
cd uis/backoffice/talent-pipeline-tracker
npm install
npm run dev
```

## Documentation Conventions

- Keep each folder-level README focused on responsibility, contents, and how to run or extend that area.
- Add project-specific details as features become real; avoid leaving generic template text behind.
- Link from the root README to the component README instead of duplicating long instructions.
- Do not commit secrets or real personal/customer data. Use synthetic or anonymized examples for data and demos.

## Context

TrackFlow's core challenge is to modernize fragmented logistics operations: carrier tracking, incident analysis, returns, customer support, warehouse visibility, and executive reporting.

The current selected automation challenge is documented in [TrackFlow.md](./TrackFlow.md).
