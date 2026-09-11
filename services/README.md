# Services

This folder contains backend services for TrackFlow.

## Available Services

| Service | Path | Purpose | Stack |
| --- | --- | --- | --- |
| TrackFlow API | `services/api` | Auth, suppliers and incidents analysis endpoints used by the internal backoffice | FastAPI, TinyDB |

## Conventions

- Each service must include a README with setup, run commands, configuration, endpoints and data storage notes.
- Keep service code importable from the repository root when possible.
- Shared business logic should live in `packages/` when it is also used by scripts, jobs or other services.
- Do not commit production secrets or real operational data.

Spanish version: [README.es.md](./README.es.md).
