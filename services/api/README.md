# TrackFlow API

Backend FastAPI para el backoffice interno de TrackFlow.

Actualmente cubre autenticación básica, gestión de usuarios/perfiles, proveedores logísticos y análisis de archivos CSV de incidencias.

## Stack

- FastAPI
- Uvicorn
- TinyDB para persistencia local en JSON
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

TinyDB guarda archivos JSON en `services/api/data/`.

| Archivo | Contenido |
| --- | --- |
| `auth.json` | Usuarios y datos de autenticación local |
| `suppliers.json` | Proveedores logísticos de demo |

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
