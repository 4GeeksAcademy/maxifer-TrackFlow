# Plan y resultados de pruebas

## Ejecución

Desde la raíz del repositorio, instala el grupo de desarrollo y ejecuta la suite backend:

```bash
uv sync --group dev
uv run pytest
uv run pytest --cov=services.api.auth --cov-report=term-missing
```

Para medir también seguridad, recuperación de contraseña y usuarios:

```bash
uv run pytest --cov=services.api.auth --cov=services.api.security --cov=services.api.password_reset_service --cov=services.api.routers.users --cov-report=term-missing
```

Para verificar API-042, incluyendo el umbral por router:

```bash
uv run pytest --cov=services.api.routers.incidents --cov=services.api.routers.inventory --cov-report=term-missing
```

En el backoffice, desde la raíz:

```bash
npm ci --prefix uis/backoffice
npm --prefix uis/backoffice test -- --coverage
```

Las pruebas backend llaman directamente a las funciones de negocio y usan TinyDB temporal; los servicios externos se aíslan con mocks. No se verifica la serialización HTTP ni el funcionamiento interno de FastAPI.

## Suites

- `services/api/tests/test_auth_endpoints.py`: login, perfil, solicitud y cambio de contraseña, errores de credenciales/email, reutilización de tokens y validación de payloads.
- `services/api/tests/test_auth_security.py`: hashing y verificación de contraseñas, secreto JWT, claims, expiración y rechazo de tokens o usuarios no válidos.
- `services/api/tests/test_password_reset_service.py`: almacenamiento hasheado, vencimiento, consumo único, tokens anteriores e invalidación.
- `services/api/tests/test_users_routes.py`: registro y CRUD de usuarios, campos públicos, contraseñas, duplicados y permisos owner/admin.
- `services/api/tests/test_incidents_routes.py`: creación/validación, filtros, resumen, detalle y transiciones de estado sobre SQLite temporal.
- `services/api/tests/test_inventory_routes.py`: listado, stock calculado, productos, entradas/salidas y movimientos sobre SQLite en memoria.
- `uis/backoffice/src/lib/__tests__/auth.test.ts`: almacenamiento de sesión, eventos, suscripción del hook, encabezado bearer y respuesta 401.
- `uis/backoffice/src/lib/__tests__/incidents.test.ts`: consulta de incidencias, filtros vacíos, errores de API y desconexión.
- `uis/backoffice/src/lib/__tests__/inventory.test.ts`: parseo de errores, listado de productos, payload inválido y formato de stock.
- Las suites existentes de incidencias, startup y scripts se mantienen dentro de `uv run pytest` como regresión.

## Casos planeados

| Endpoint o módulo | Camino feliz | Límite | Fallo |
| --- | --- | --- | --- |
| `POST /auth/login` | Credenciales correctas y token bearer | Usuario/contraseña vacíos | Usuario desconocido o contraseña incorrecta |
| `GET /auth/me` | Usuario público y perfil asociado | Cuenta ausente o inactiva | Token inválido, expirado o sin `sub` |
| `POST /auth/forgot-password` | Email enviado para una cuenta registrada | Email desconocido conserva respuesta genérica; formato inválido | El servicio de correo falla sin revelar la cuenta |
| `POST /auth/reset-password` | Cambia la contraseña y consume el token | Token de un solo uso | Token desconocido, vencido, repetido o asociado a usuario inexistente |
| `POST /auth/change-password` | Cambia contraseña e invalida resets activos | Límites de longitud del payload | Contraseña actual incorrecta |
| `POST /users` | Crea usuario y perfil con password hasheado | Email inválido o contraseña corta | Email duplicado |
| `GET /users` | Devuelve campos públicos | Colección vacía | Acceso autenticado representado mediante el usuario de contexto; no se prueba el pipeline de dependencias |
| `GET /users/{id}` | Owner y admin pueden consultar | Usuario inexistente | Otro usuario recibe prohibición |
| `PUT /users/{id}` | Actualiza email/password; admin cambia rol | Usuario inexistente | Email duplicado, rol cambiado por no admin o acceso ajeno |
| `DELETE /users/{id}` | Elimina usuario y perfil | Usuario inexistente | Otro usuario no puede eliminarlo |
| Utilidades de auth | Hash/JWT, token y sesión válidos | Datos ausentes o vacíos | Hash no coincidente, secreto ausente, token alterado/expirado o respuesta 401 |

### API-042: Incidencias e inventario

| Grupo | Camino feliz | Caso límite | Modo de fallo |
| --- | --- | --- | --- |
| Incidencias | Crear/listar, resumir y obtener un incidente; transición permitida | Filtros sin resultados y store vacío | Payload/filtro inválido, transición prohibida e ID inexistente |
| Inventario | Crear producto, registrar entradas/salidas y listar movimientos con stock neto | Listas vacías y stock cero | SKU duplicado, producto ausente, almacén incompatible, stock insuficiente o usuario sin ID |

### FE-019: Helpers frontend

| Función | Camino feliz | Caso límite | Modo de fallo |
| --- | --- | --- | --- |
| `readApiError` | Extrae mensajes anidados de validación | Lista de errores con varios mensajes | JSON inválido usa mensaje genérico |
| `getInventoryProducts` | Devuelve los productos recibidos | Payload válido que no es una lista devuelve `[]` | Respuesta HTTP fallida produce el mensaje de API |
| `getIncidents` | Devuelve resultados y serializa filtros | Filtros vacíos no generan query string | Error HTTP o de conexión se convierte en `IncidentApiError` |

## Resultados

Verificación local:

- `uv run pytest --cov=services.api.routers.incidents --cov=services.api.routers.inventory --cov-report=term-missing`: **71 passed**; `incidents.py` e `inventory.py`: **100%** de cobertura cada uno.
- La medición AUTH-088 cubrió `auth.py`, `security.py`, `password_reset_service.py` y `routers/users.py` al **100%** cada uno.
- `npm --prefix uis/backoffice test -- --coverage`: **15 passed**; `auth.ts`: 92,23% de líneas, `incidents.ts`: 100%, `inventory.ts`: 58,82%.
- La ejecución backend emite tres advertencias deprecadas provenientes de Starlette/FastAPI (`BlockingPortal` y `on_event`); no afectan los resultados.

## Revisión asistida y hallazgos

El análisis asistido destacó dos escenarios fáciles de omitir: un token de reset anterior debe dejar de servir al emitir uno nuevo, y consumir un token vencido no debe permitir cambiar la contraseña. También se incluyeron los permisos para que un usuario no admin no pueda modificar roles. Las pruebas verifican estos comportamientos; **no se detectaron bugs de producto que requirieran cambios en la lógica de producción**.