# User Interfaces

This folder contains the frontend applications built for TrackFlow.

## Applications

| App | Path | Purpose | Stack |
| --- | --- | --- | --- |
| Backoffice | `uis/backoffice` | Internal dashboard for uploading and analyzing incidents CSV files | Next.js, React, TypeScript, Tailwind CSS |
| Talent Pipeline Tracker | `uis/talent-pipeline-tracker` | Recruiting pipeline dashboard for TrackFlow hiring processes | Next.js, React, TypeScript, Tailwind CSS |

## Conventions

- Each app owns its dependencies, scripts and README.
- Keep domain copy in Spanish unless a specific feature requires English.
- Document external API URLs, required environment variables and local startup steps in the app README.
- Reusable frontend code should move to `packages/` only when two or more apps need it.

Spanish version: [README.es.md](./README.es.md).
