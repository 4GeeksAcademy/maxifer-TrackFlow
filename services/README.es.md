# Servicios

Esta carpeta contiene los servicios backend de TrackFlow.

## Servicios disponibles

| Servicio | Ruta | Propósito | Stack |
| --- | --- | --- | --- |
| TrackFlow API | `services/api` | Endpoints de auth, proveedores y análisis de incidencias usados por el backoffice interno | FastAPI, TinyDB |

## Convenciones

- Cada servicio debe incluir un README con setup, comandos de ejecución, configuración, endpoints y notas de almacenamiento.
- Mantener el código importable desde la raíz del repositorio siempre que sea posible.
- La lógica de negocio compartida debe vivir en `packages/` cuando también la usan scripts, jobs u otros servicios.
- No commitear secretos de producción ni datos operativos reales.

English version: [README.md](./README.md).
