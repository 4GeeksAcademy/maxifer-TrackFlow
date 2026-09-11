# TrackFlow Backoffice

Panel interno para operaciones de TrackFlow.

Permite cargar archivos CSV de incidencias, visualizar métricas operativas y descargar resultados procesados. También consume endpoints del backend para proveedores y datos internos.

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- ESLint

## Requisitos

- Node.js 18 o superior
- npm 9 o superior
- API FastAPI corriendo en `http://localhost:8000`

## Ejecutar en local

Primero iniciar la API desde la raíz del monorepo:

```bash
python -m uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

Después iniciar el frontend:

```bash
cd uis/backoffice
npm install
npm run dev
```

Abrir `http://localhost:3000`.

Si el puerto 3000 está ocupado, Next.js ofrecerá otro puerto.

## Scripts

| Comando | Para qué sirve |
| --- | --- |
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila la app para producción |
| `npm run start` | Ejecuta la build de producción |
| `npm run lint` | Ejecuta ESLint |

## Estructura

```text
uis/backoffice/
├── src/app/
│   ├── page.tsx             # Vista principal
│   ├── incidents/           # Flujo de análisis de incidencias
│   ├── suppliers/           # Gestión/consulta de proveedores
│   ├── layout.tsx           # Layout raíz
│   └── globals.css          # Estilos globales
├── public/                  # Assets estáticos
├── package.json             # Scripts y dependencias
└── README.md
```

## Backend relacionado

Ver [services/api](../../services/api/README.md).
