<div align="center">
  <br />
  <img src="./public/trackflow-logo.svg" alt="TrackFlow Logo" width="72" height="72" />
  <h1 align="center">TrackFlow · Talent Pipeline Tracker</h1>
  <p align="center">
    Gestión de candidaturas para procesos de selección en TrackFlow
    <br />
    <strong>Hito 3</strong> — 4Geeks Academy · AI Engineering Track
  </p>
  <br />
</div>

## 📋 Descripción

**Talent Pipeline Tracker** es una herramienta interna del equipo **TrackFlow Tech** para gestionar el proceso de selección de personal de TrackFlow, una empresa de logística de última milla y gestión de almacenes con operaciones en Los Ángeles y Zaragoza.

Permite al equipo de Recursos Humanos y Operations:

- Visualizar todas las candidaturas con nombre, puesto, estado y etapa de un vistazo.
- Filtrar por estado y etapa, y buscar por nombre o email sin recargar la página.
- Acceder al detalle de cada candidato para cambiar su estado o etapa.
- Añadir y eliminar notas internas después de llamadas y entrevistas.
- Dar de alta nuevos candidatos y editar sus datos.

> **Contexto real:** Esta herramienta fue solicitada por **Ana Whitfield**, Head of Warehouse Operations, para gestionar las +100 candidaturas recibidas para el puesto de **Asistente de Dirección** en la sede de Zaragoza.

---

## 🚀 Tecnologías

| Tecnología        | Versión   |
| ----------------- | --------- |
| [Next.js](https://nextjs.org/) | 16.2.10   |
| [React](https://react.dev/)    | 19.2.4    |
| [TypeScript](https://www.typescriptlang.org/) | ^5        |
| [Tailwind CSS](https://tailwindcss.com/) | ^4        |
| [Lucide React](https://lucide.dev/) | ^1.23.0   |

---

## 🛠️ Empezar

### Requisitos

- **Node.js** >= 22 (versión de referencia del proyecto)
- **npm** >= 9

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/4GeeksAcademy/maxifer-TrackFlow.git
cd maxifer-TrackFlow/uis/backoffice/talent-pipeline-tracker

# Instalar dependencias
npm ci

# Iniciar servidor de desarrollo
npm run dev -- --port 3002
```

Abrir [http://localhost:3002](http://localhost:3002) en el navegador.
Sin `--port`, Next.js usa 3000, reservado al website en la distribución del proyecto.

Antes de iniciar, define `NEXT_PUBLIC_API_URL` con la URL base de la API externa
de candidaturas, sin barra final, por ejemplo en `.env.local` de esta aplicación.
La URL debe ser accesible tanto desde el servidor Next.js como desde el navegador;
las peticiones del navegador requieren que la API permita su origen mediante CORS.
Es una variable pública: no incluyas claves ni credenciales en ella. Configúrala
antes del build para las operaciones cliente y mantenla disponible al arrancar el
servidor. Sin ella, la página muestra que el servicio no está disponible.

### Scripts disponibles

| Comando           | Descripción                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Inicia el servidor de desarrollo    |
| `npm run build`   | Compila la aplicación para producción |
| `npm run start`   | Inicia el servidor de producción    |
| `npm run lint`    | Ejecuta el linter (ESLint)          |

---

## 🧱 Estructura del proyecto

```
uis/backoffice/talent-pipeline-tracker/
├── app/
│   ├── layout.tsx          # Layout raíz con AppShell y fuente Inter
│   ├── page.tsx            # Página principal (Pipeline de candidatos)
│   ├── candidates/
│   │   └── [id]/           # Página de detalle de candidato
│   ├── globals.css         # Estilos globales
│   ├── loading.tsx         # Estado de carga
│   └── error.tsx           # Manejo de errores
├── components/
│   ├── candidates/         # Componentes específicos de candidatos
│   ├── layout/             # Componentes de layout (AppShell, sidebar, header)
│   └── ui/                 # Componentes de UI reutilizables
├── hooks/
│   └── use-candidate-notes.ts  # Hook para gestión de notas
├── lib/
│   ├── candidates.ts       # Lógica de fetching de candidatos
│   └── candidate-record-form.ts  # Lógica de formularios
├── types/
│   └── candidates.ts       # Tipos TypeScript del dominio
└── public/
    └── trackflow-logo.svg  # Logo de TrackFlow
```

---

## 🗂️ Dominio

### Estados de candidatura (`status`)

| API            | UI                   |
| -------------- | -------------------- |
| `received`     | Recibida             |
| `in_progress`  | En proceso           |
| `selected`     | Seleccionada         |
| `discarded`    | Descartada           |

### Etapas del proceso (`stage`)

| API                  | UI                     |
| -------------------- | ---------------------- |
| `pending`            | Pendiente de revisión  |
| `review`             | En revisión            |
| `personal_interview` | Entrevista personal    |
| `technical_interview`| Entrevista técnica     |
| `offer_presented`    | Oferta presentada      |

---

## 🔌 API

La aplicación consume una API REST externa configurada con `NEXT_PUBLIC_API_URL`.
El FastAPI de este repositorio no implementa estos endpoints. Las rutas relativas
a la URL base usadas por `lib/candidates.ts` son:

| Método | Endpoint                                    | Descripción                 |
| ------ | ------------------------------------------- | --------------------------- |
| `GET` | `/records?page=1&limit=100` | Listar candidaturas con paginación |
| `GET` | `/records/:id` | Detalle de candidato |
| `POST` | `/records` | Crear candidatura |
| `PATCH` | `/records/:id` | Cambiar estado o etapa |
| `PUT` | `/records/:id` | Guardar los datos editados |
| `GET` | `/records/:id/notes` | Obtener notas |
| `POST` | `/records/:id/notes` | Añadir nota |
| `DELETE` | `/records/:id/notes/:noteId` | Eliminar nota |

El listado espera `{ data, total, limit }` y recupera todas las páginas para
filtrar localmente. Las notas admiten un array o `{ data: [...] }`.

La aplicación mantiene dependencias y lockfile propios. Ejecuta `npm run lint`
y `npm run build` en esta carpeta; el build necesita acceso a Google Fonts para
la fuente Inter. El tracker queda fuera de las comprobaciones del backoffice padre.

---

## 📄 Licencia

Este proyecto forma parte del programa **AI Engineering Track** de [4Geeks Academy](https://4geeks.com/).
