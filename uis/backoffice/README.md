# TrackFlow Backoffice

Panel interno para operaciones de TrackFlow.

Permite gestionar y analizar incidencias, cargar CSV y descargar resultados, consultar proveedores, gestionar inventario y movimientos de entrada/salida, y usar el asistente comercial RAG. Incluye registro, inicio de sesión, perfil y recuperación de contraseña.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- ESLint

## Requisitos

- Node.js 22 o superior (versión de referencia del proyecto)
- npm 9 o superior
- API FastAPI corriendo en `http://localhost:8000`

## Ejecutar en local

Primero iniciar la API desde la raíz del monorepo:

```bash
uv sync --frozen
uv run --frozen uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Después iniciar el frontend:

```bash
cd uis/backoffice
npm ci
npm run dev -- --port 3001
```

Abrir `http://localhost:3001`.

Sin `--port`, Next.js usa 3000, reservado al website en la distribución del proyecto.

La UI envía las peticiones a `/backend`; `next.config.ts` las reescribe hacia
`BACKEND_INTERNAL_URL`, con valor por defecto `http://127.0.0.1:8000`.
Configura la API siguiendo su [README](../../services/api/README.md). Para los
enlaces de recuperación, define `FRONTEND_URL=http://localhost:3001` en la
configuración de la API; el envío requiere Resend y un remitente válido.
El asistente en `/assistant` requiere sesión, proveedor LiteLLM y Qdrant indexado;
consulta [los pipelines RAG](../../data/pipelines/README.es.md).

## Scripts

| Comando | Para qué sirve |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la app para producción |
| `npm run start` | Ejecuta la build de producción |
| `npm run lint` | Ejecuta ESLint |
| `npm test -- --runInBand` | Ejecuta las pruebas Jest |

## Estructura

```text
uis/backoffice/
├── src/app/
│   ├── page.tsx             # Vista principal
│   ├── incidents/           # Flujo de análisis de incidencias
│   ├── suppliers/           # Gestión/consulta de proveedores
│   ├── inventory/           # Productos y movimientos de stock
│   ├── assistant/           # Asistente comercial RAG
│   ├── account/             # Perfil y contraseña
│   ├── login/               # Inicio de sesión
│   ├── layout.tsx           # Layout raíz
│   └── globals.css          # Estilos globales
├── public/                  # Assets estáticos
├── package.json             # Scripts y dependencias
└── README.md
```

`talent-pipeline-tracker/` es una aplicación independiente con dependencias y
lockfile propios; se excluye del TypeScript, ESLint y Jest del backoffice.

## Backend relacionado

Ver [services/api](../../services/api/README.md).
