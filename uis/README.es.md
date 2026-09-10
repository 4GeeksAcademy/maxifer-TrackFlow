# Interfaces de usuario

Esta carpeta contiene las aplicaciones frontend construidas para TrackFlow.

## Aplicaciones

| App | Ruta | Propósito | Stack |
| --- | --- | --- | --- |
| Backoffice | `uis/backoffice` | Dashboard interno para cargar y analizar CSV de incidencias | Next.js, React, TypeScript, Tailwind CSS |
| Talent Pipeline Tracker | `uis/talent-pipeline-tracker` | Dashboard de pipeline de candidaturas para procesos de selección de TrackFlow | Next.js, React, TypeScript, Tailwind CSS |

## Convenciones

- Cada app mantiene sus propias dependencias, scripts y README.
- Mantener el copy de dominio en español salvo que una feature requiera inglés.
- Documentar URLs de APIs externas, variables de entorno y pasos de ejecución local en el README de cada app.
- El código frontend reutilizable debe moverse a `packages/` solo cuando dos o más apps lo necesiten.

English version: [README.md](./README.md).
