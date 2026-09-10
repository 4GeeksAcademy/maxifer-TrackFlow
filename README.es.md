# TrackFlow

TrackFlow es un proyecto de AI Engineering para una empresa de logística de última milla y gestión de almacenes con operaciones en Los Ángeles y Zaragoza.

El repositorio reúne entregables del track de AI Engineering de 4Geeks Academy: landing pública, dashboards internos, backend FastAPI, lógica compartida de análisis, áreas de datos y estructura para futuros agentes, workflows, servidores MCP e infraestructura.

English documentation is available in [README.md](./README.md).

## Qué incluye

| Área | Ruta | Estado |
| --- | --- | --- |
| Landing estática | `index.html`, `application.html` | Disponible |
| Backoffice de incidencias | `uis/backoffice` | Disponible |
| Talent Pipeline Tracker | `uis/talent-pipeline-tracker` | Disponible |
| Servicio FastAPI | `services/api` | Disponible |
| Lógica compartida de incidencias | `packages/incidents_analysis` | Disponible |
| Datos, agentes, workflows, infraestructura | `data/`, `agents/`, `workflows/`, `infra/` | Estructura del proyecto |

## Mapa del repositorio

```text
TrackFlow/
├── README.md
├── README.es.md
├── CONTEXT.md                 # Brief de empresa de TrackFlow
├── TrackFlow.md               # Elección de empresa y reto de automatización
├── index.html                 # Landing pública estática
├── application.html           # Página estática de aplicación/demo
├── assets/                    # Assets de la landing
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
├── uis/                       # Aplicaciones frontend
└── workflows/                 # Flujos de automatización y orquestación
```

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- Python 3.11 o superior
- Un entorno virtual de Python para el servicio FastAPI

## Landing

Desde la raíz del repositorio:

```bash
npm install
npm run build:landing
npx --yes serve -l 3000 .
```

Abrir `http://localhost:3000`.

Scripts útiles en raíz:

| Comando | Para qué sirve |
| --- | --- |
| `npm run build:css` | Genera el CSS de Tailwind usado por la landing estática |
| `npm run optimize:images` | Optimiza imágenes de la landing |
| `npm run test:spanish-copy` | Valida convenciones de copy en español |
| `npm run build:landing` | Ejecuta la validación/build de la landing |

## Backoffice de incidencias

Este flujo tiene dos partes:

- Backend: [services/api](./services/api/README.md)
- Frontend: [uis/backoffice](./uis/backoffice/README.md)

Primero iniciar la API:

```bash
python -m uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Después iniciar la UI:

```bash
cd uis/backoffice
npm install
npm run dev
```

## Talent Pipeline Tracker

El dashboard de reclutamiento vive en [uis/talent-pipeline-tracker](./uis/talent-pipeline-tracker/README.md).

```bash
cd uis/talent-pipeline-tracker
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
