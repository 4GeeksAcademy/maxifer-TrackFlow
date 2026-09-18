# TrackFlow API

Backend FastAPI para el backoffice interno de TrackFlow.

Actualmente cubre autenticación básica, gestión de usuarios/perfiles, proveedores logísticos y análisis de archivos CSV de incidencias.

## Stack

- FastAPI
- Uvicorn
- TinyDB para usuarios y proveedores; SQLite para incidencias
- `python-jose` para tokens JWT
- `python-multipart` para subida de archivos

## Requisitos

- Python 3.11 o superior
- Entorno virtual creado desde la raíz del monorepo

## Instalación

Desde la raíz del repositorio:

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r services/api/requirements.txt
```

En macOS/Linux:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r services/api/requirements.txt
```

## Ejecutar

Desde la raíz del monorepo:

```bash
python -m uvicorn services.api.main:app --host 0.0.0.0 --port 8000 --reload
```

La API queda disponible en `http://localhost:8000`.

La documentación interactiva de FastAPI queda disponible en:

- `http://localhost:8000/docs`
- `http://localhost:8000/redoc`

## Configuración

El servicio lee configuración desde `services/api/.env` cuando existe.

Variables esperadas:

| Variable | Uso |
| --- | --- |
| `SECRET_KEY` | Firma de tokens JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de sesión |

## Datos locales

### Gestor de incidencias

Desde la raíz del repositorio, ejecutar `python scripts/seed_incidents.py` para cargar
el histórico de `scripts/incidents-trackflow.csv`. Se puede repetir: usa `incident_id`
para omitir registros ya importados. La colección local queda en
`services/api/data/incidents.sqlite3` y se crea automáticamente. Si existe el archivo
local anterior `incidents.json`, sus registros se migran conservando los ID y el
archivo original. El seed informa las
filas inválidas y debe dejar 95 incidencias: 29 abiertas, 52 resueltas y 14
descartadas.

La API del gestor está en `/api/incidents` (POST y GET con filtros por `status`,
`origin`, `branch` y `category`), `/api/incidents/{id}`,
`/api/incidents/{id}/status` (PATCH) y `/api/incidents/summary`.
El backoffice en `/incidents` ofrece formulario, listado y resumen.

Los datos locales se guardan en `services/api/data/`.

| Archivo | Contenido |
| --- | --- |
| `auth.json` | Usuarios y datos de autenticación local |
| `suppliers.json` | Proveedores logísticos de demo |
| `incidents.sqlite3` | Incidencias con restricciones de integridad |

Estos datos son locales y de desarrollo. No deben usarse como fuente productiva.

## Módulos principales

| Archivo | Responsabilidad |
| --- | --- |
| `main.py` | App FastAPI, CORS y rutas principales |
| `auth.py` | Utilidades de autenticación |
| `security.py` | Hashing, JWT y dependencias de seguridad |
| `database.py` | Acceso a TinyDB |
| `models.py` | Modelos de dominio |
| `schemas_auth.py` | Schemas relacionados con auth |
| `seed.py` | Carga de datos iniciales |
| `routers/users.py` | Endpoints de usuarios |
| `routers/profiles.py` | Endpoints de perfiles |
| `routers/suppliers.py` | Endpoints de proveedores |

## Frontend relacionado

El consumidor principal es [uis/backoffice](../../uis/backoffice/README.md).
