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

- **Node.js** >= 18
- **npm** >= 9

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/4GeeksAcademy/maxifer-TrackFlow.git
cd maxifer-TrackFlow/uis/talent-pipeline-tracker

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

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
uis/talent-pipeline-tracker/
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

La aplicación consume una API REST mock desplegada de forma centralizada. Los endpoints principales:

| Método | Endpoint                                    | Descripción                 |
| ------ | ------------------------------------------- | --------------------------- |
| `GET`  | `/api/v1/candidates`                        | Listar candidaturas         |
| `GET`  | `/api/v1/candidates/:id`                    | Detalle de candidato        |
| `POST` | `/api/v1/candidates`                        | Crear candidatura           |
| `PATCH`| `/api/v1/candidates/:id`                    | Actualizar candidatura      |
| `GET`  | `/api/v1/candidates/:id/notes`              | Obtener notas               |
| `POST` | `/api/v1/candidates/:id/notes`              | Añadir nota                 |
| `DELETE`| `/api/v1/candidates/:id/notes/:noteId`     | Eliminar nota               |

---

## 📄 Licencia

Este proyecto forma parte del programa **AI Engineering Track** de [4Geeks Academy](https://4geeks.com/).
