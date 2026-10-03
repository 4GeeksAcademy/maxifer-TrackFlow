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
- uv para gestionar las dependencias y el entorno de Python

## Instalación

Desde la raíz del repositorio, instalar `uv` si todavía no está disponible:

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

Después, instalar todas las dependencias del proyecto:

```bash
# API Python y herramientas locales. Crea o actualiza .venv.
uv sync

# Landing estática
npm ci

# Backoffice de incidencias
cd uis/backoffice
npm ci

# Talent pipeline tracker
cd ../talent-pipeline-tracker
npm ci

# Volver a la raíz del repositorio
cd ../..
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
