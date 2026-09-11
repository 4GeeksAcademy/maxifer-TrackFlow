# TrackFlow

TrackFlow is an AI Engineering project for a last-mile logistics and warehouse operations company with teams in Los Angeles and Zaragoza.

The repository combines several deliverables for the 4Geeks Academy AI Engineering Track: a public landing page, internal dashboards, a FastAPI backend, shared analysis logic, data areas, and placeholders for future agents, workflows, MCP servers, and infrastructure.

Spanish documentation is available in [README.es.md](./README.es.md).

## What Is Included

| Area | Path | Status |
| --- | --- | --- |
| Static landing | `index.html`, `application.html` | Available |
| Incidents backoffice | `uis/backoffice` | Available |
| Talent pipeline tracker | `uis/talent-pipeline-tracker` | Available |
| FastAPI service | `services/api` | Available |
| Shared incidents logic | `packages/incidents_analysis` | Available |
| Data, agents, workflows, infra | `data/`, `agents/`, `workflows/`, `infra/` | Project structure |

## Repository Map

```text
TrackFlow/
├── README.md
├── README.es.md
├── CONTEXT.md                 # TrackFlow company brief
├── TrackFlow.md               # Company choice and selected automation challenge
├── index.html                 # Static public landing page
├── application.html           # Static application/demo page
├── assets/                    # Landing assets
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
├── uis/                       # Frontend applications
└── workflows/                 # Automation and orchestration flows
```

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- Python 3.11 or newer
- A Python virtual environment for the FastAPI service

## Landing Page

From the repository root:

```bash
npm install
npm run build:landing
npx --yes serve -l 3000 .
```

Open `http://localhost:3000`.

Useful root scripts:

| Command | Purpose |
| --- | --- |
| `npm run build:css` | Builds the Tailwind CSS file used by the static landing |
| `npm run optimize:images` | Optimizes landing images |
| `npm run test:spanish-copy` | Checks Spanish copy conventions |
| `npm run build:landing` | Runs the landing validation/build pipeline |

## Incidents Backoffice

This flow has two parts:

- Backend: [services/api](./services/api/README.md)
- Frontend: [uis/backoffice](./uis/backoffice/README.md)

Start the API first:

```bash
python -m uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Then start the UI:

```bash
cd uis/backoffice
npm install
npm run dev
```

## Talent Pipeline Tracker

The recruiting dashboard lives in [uis/talent-pipeline-tracker](./uis/talent-pipeline-tracker/README.md).

```bash
cd uis/talent-pipeline-tracker
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
