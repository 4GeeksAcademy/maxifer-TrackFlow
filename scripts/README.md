# `scripts` folder

This folder contains **helper scripts** for the monorepo: development automation, maintenance utilities, repetitive tasks (setup, lint, migrations, data generation, etc.), and internal tooling.

- **Main purpose**: group support tools that do not belong to a specific app, agent, or pipeline but make the team’s work easier.
- **Recommendation**: document each script (what it does, parameters, requirements, usage examples) and keep them reproducible (and safe) across environments.

> _Spanish version: [README.es.md](./README.es.md)._

Landing helpers read and write public files in `uis/website`.
Run `npm run build:landing` from the repository root.
AI setup validation is available through `npm run validate:ai-setup` and
`npm run test:ai-setup`; its implementation belongs to `.agents/skills/validate-ai-setup`.
