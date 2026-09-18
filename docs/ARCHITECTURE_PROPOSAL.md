# Propuesta de Arquitectura de Backend para TrackFlow

## 1. Contexto y Objetivo

TrackFlow necesita construir un backend que sirva como base comun para sus operaciones logisticas: tracking de envios, gestion de transportistas, devoluciones, atencion al cliente, reportes operativos y futuros agentes de IA. La empresa opera en Estados Unidos y Espana, trabaja con multiples transportistas y hoy depende de procesos manuales, sistemas desconectados y datos poco estructurados.

El objetivo de esta propuesta es definir una arquitectura inicial para el backend antes de comenzar a implementar endpoints. La prioridad no es sobredisenar, sino crear una base clara, escalable y facil de entender para un equipo que probablemente ira incorporando nuevos dominios de negocio en sprints sucesivos.

## 2. Patron Arquitectonico Propuesto

Propongo una **arquitectura modular orientada a dominios, apoyada en capas internas por responsabilidad**.

Esto significa que el backend se organizara principalmente por dominios de negocio, por ejemplo `shipments`, `carriers`, `returns`, `customers`, `support` y `analytics`, pero dentro de cada dominio se mantendra una separacion tecnica clara entre rutas HTTP, esquemas Pydantic, logica de aplicacion, modelos de persistencia e integraciones externas.

No recomiendo empezar con microservicios ni serverless por dominio. TrackFlow todavia esta en una etapa de consolidacion tecnica: primero necesita criterios comunes, visibilidad operativa y contratos de API estables. Separar prematuramente cada area en servicios independientes podria aumentar la complejidad de despliegue, observabilidad, autenticacion y versionado sin que el equipo haya validado aun los limites reales de cada dominio.

Tampoco recomiendo un MVC clasico puro. MVC funciona bien como referencia mental para separar entrada, logica y datos, pero el problema de TrackFlow no es solo renderizar vistas o CRUD simple. La empresa necesita modelar procesos operativos: seleccionar transportistas, agregar estados de tracking, aprobar devoluciones, generar alertas y alimentar dashboards. Esos flujos se expresan mejor con modulos de negocio y servicios de aplicacion que con controladores grandes por recurso.

La eleccion encaja con TrackFlow por estas razones:

- **Naturaleza del negocio:** los procesos logisticos tienen limites de dominio bastante claros. Un envio, una devolucion, un transportista, una incidencia y un ticket de soporte evolucionan con reglas distintas.
- **Operaciones distribuidas:** Los Angeles y Zaragoza pueden compartir la misma API, pero necesitaran filtrar por pais, almacen, transportista y cliente. Una estructura modular permite agregar reglas regionales sin mezclar toda la logica en un unico archivo.
- **Volumen y criticidad de datos:** tracking, incidencias y devoluciones generan eventos continuos. Aunque al inicio el volumen sea moderado, el diseno debe permitir pasar de consultas simples a eventos, agregaciones y analitica sin reescribir toda la API.
- **Flujos criticos de usuario:** el equipo de operaciones necesita respuestas rapidas sobre estado de envio, incidencias y rendimiento; el equipo de CX necesita consultar datos confiables para responder a clientes; direccion necesita KPIs consistentes. Separar dominios reduce el riesgo de que una regla de devoluciones afecte accidentalmente al tracking o a los reportes.

## 3. Convenciones Base de FastAPI

La propuesta se basa en convenciones documentadas por FastAPI para aplicaciones medianas o grandes:

- FastAPI recomienda separar aplicaciones grandes en multiples archivos y usar `APIRouter` para agrupar operaciones relacionadas, evitando concentrar todo en `main.py`. Referencia: [FastAPI - Bigger Applications, Multiple Files](https://fastapi.tiangolo.com/tutorial/bigger-applications/).
- FastAPI promueve el uso de modelos Pydantic para validar datos de entrada y salida, lo que ayuda a mantener contratos claros entre frontend y backend. Referencia: [FastAPI - Body, Pydantic Models](https://fastapi.tiangolo.com/tutorial/body/).
- Para configuracion por entorno, FastAPI documenta el uso de variables de entorno y `pydantic-settings`, separando secretos y valores variables del codigo fuente. Referencia: [FastAPI - Settings and Environment Variables](https://fastapi.tiangolo.com/advanced/settings/).
- Para comunicacion entre frontend y backend en origenes distintos, FastAPI documenta `CORSMiddleware` y recomienda declarar explicitamente los origenes permitidos cuando hay credenciales o tokens. Referencia: [FastAPI - CORS](https://fastapi.tiangolo.com/tutorial/cors/).

## 4. Estructura Conceptual de Carpetas

La ubicacion propuesta para el backend dentro del monorepo es `services/api`.

```text
services/
  api/
    app/
      __init__.py
      main.py
      core/
        __init__.py
        config.py
        security.py
        logging.py
        errors.py
      db/
        __init__.py
        session.py
        migrations/
      api/
        __init__.py
        deps.py
        v1/
          __init__.py
          router.py
          endpoints/
            __init__.py
            auth.py
            shipments.py
            carriers.py
            tracking.py
            returns.py
            support.py
            analytics.py
      domains/
        __init__.py
        shipments/
          __init__.py
          models.py
          schemas.py
          service.py
          repository.py
        carriers/
          __init__.py
          models.py
          schemas.py
          service.py
          repository.py
          integrations.py
        returns/
          __init__.py
          models.py
          schemas.py
          service.py
          repository.py
          rules.py
        support/
          __init__.py
          models.py
          schemas.py
          service.py
          repository.py
        analytics/
          __init__.py
          schemas.py
          service.py
      integrations/
        __init__.py
        carriers/
          __init__.py
          ups.py
          fedex.py
          dhl.py
          mrw.py
          seur.py
        email.py
        ticketing.py
      tests/
        __init__.py
        test_health.py
        test_shipments.py
        test_returns.py
    requirements.txt
    README.md
```

### Criterio de Separacion

La separacion principal es por **dominio de negocio** dentro de `domains/`. Cada dominio agrupa lo que necesita para expresar sus reglas: modelos, schemas, servicios y repositorios. Esto evita que el backend se convierta en una coleccion de archivos genericos como `models.py`, `schemas.py` y `services.py` que crecen sin limite.

La separacion secundaria es por **responsabilidad tecnica**:

- `app/main.py`: crea la instancia de FastAPI, configura middlewares globales e incluye el router versionado.
- `core/`: configuracion, seguridad, logging y manejo de errores compartido.
- `api/v1/endpoints/`: define la capa HTTP. Aqui viven los routers de FastAPI, delgados y orientados a request/response.
- `domains/*/service.py`: contiene casos de uso y reglas de negocio.
- `domains/*/repository.py`: encapsula acceso a datos para que la logica de negocio no dependa directamente del motor de persistencia.
- `integrations/`: encapsula APIs externas, especialmente transportistas y canales de soporte.
- `db/`: configuracion de conexion, sesiones y migraciones.

Con este criterio, un endpoint no deberia tener logica de negocio compleja. El router valida entrada, llama al servicio correspondiente y devuelve una respuesta tipada. La logica queda en servicios; la persistencia queda en repositorios; las llamadas a terceros quedan en integraciones.

## 5. Organizacion de Routers y Endpoints

Los endpoints se agruparan con `APIRouter` por dominio o modulo funcional. El archivo `api/v1/router.py` actuara como agregador:

```text
api/v1/router.py
  include_router(auth.router, prefix="/auth", tags=["auth"])
  include_router(shipments.router, prefix="/shipments", tags=["shipments"])
  include_router(carriers.router, prefix="/carriers", tags=["carriers"])
  include_router(tracking.router, prefix="/tracking", tags=["tracking"])
  include_router(returns.router, prefix="/returns", tags=["returns"])
  include_router(support.router, prefix="/support", tags=["support"])
  include_router(analytics.router, prefix="/analytics", tags=["analytics"])
```

Rutas iniciales propuestas:

### `auth`

- `POST /api/v1/auth/login`: autenticar usuarios internos.
- `POST /api/v1/auth/refresh`: renovar token.
- `GET /api/v1/auth/me`: obtener perfil del usuario autenticado.

### `shipments`

- `GET /api/v1/shipments`: listar envios con filtros por cliente, pais, almacen, estado y fecha.
- `POST /api/v1/shipments`: crear o registrar un envio.
- `GET /api/v1/shipments/{shipment_id}`: consultar detalle operativo de un envio.
- `PATCH /api/v1/shipments/{shipment_id}`: actualizar datos editables del envio.
- `GET /api/v1/shipments/{shipment_id}/events`: consultar historial de eventos.

### `carriers`

- `GET /api/v1/carriers`: listar transportistas disponibles.
- `GET /api/v1/carriers/{carrier_id}`: consultar configuracion y cobertura.
- `POST /api/v1/carriers/recommendations`: recomendar transportista segun destino, peso, urgencia, coste y rendimiento historico.
- `GET /api/v1/carriers/performance`: consultar metricas de entrega, incidencias y costes.

### `tracking`

- `GET /api/v1/tracking/{tracking_number}`: obtener estado normalizado desde cualquier transportista.
- `POST /api/v1/tracking/sync`: disparar sincronizacion de estados para envios pendientes.
- `GET /api/v1/tracking/{tracking_number}/public`: endpoint publico limitado para portal de destinatarios.

### `returns`

- `GET /api/v1/returns`: listar devoluciones con filtros por cliente, estado y pais.
- `POST /api/v1/returns`: iniciar solicitud de devolucion.
- `GET /api/v1/returns/{return_id}`: consultar detalle de una devolucion.
- `POST /api/v1/returns/{return_id}/approve`: aprobar devolucion manual o automaticamente.
- `POST /api/v1/returns/{return_id}/label`: generar etiqueta e instrucciones.
- `POST /api/v1/returns/{return_id}/inspection`: registrar inspeccion del producto devuelto.

### `support`

- `GET /api/v1/support/tickets`: listar tickets o conversaciones.
- `POST /api/v1/support/tickets`: crear ticket desde email, WhatsApp u otro canal.
- `GET /api/v1/support/tickets/{ticket_id}`: consultar detalle.
- `POST /api/v1/support/assistant/reply`: generar respuesta asistida usando estado de envio, devolucion o base de conocimiento.

### `analytics`

- `GET /api/v1/analytics/operations`: KPIs operativos por pais, almacen y periodo.
- `GET /api/v1/analytics/carriers`: rendimiento comparativo de transportistas.
- `GET /api/v1/analytics/returns`: tasa de devoluciones y motivos principales.
- `GET /api/v1/analytics/executive-summary`: resumen ejecutivo para direccion.

Esta organizacion permite que cada area crezca sin saturar `main.py`. Tambien mejora la documentacion automatica de OpenAPI porque cada router puede tener `prefix`, `tags`, dependencias y respuestas comunes.

## 6. Coexistencia Frontend y Backend

### Estrategia de Repositorios

Recomiendo comenzar con **monorepo**. TrackFlow esta construyendo varios entregables relacionados: landing, dashboards internos, backend, paquetes compartidos, scripts, agentes e infraestructura. Mantenerlos en un mismo repositorio facilita:

- compartir tipos, utilidades y documentacion;
- coordinar cambios entre API y frontend en una misma rama;
- versionar contratos de API junto a los consumidores;
- mantener una estructura clara para el equipo academico y tecnico.

La desventaja es que el monorepo exige convenciones: cada area debe tener README, comandos claros y limites de responsabilidad. Si en el futuro el backend crece con equipos independientes, SLAs distintos o despliegues muy separados, se podria extraer a un repositorio propio. Para el inicio, el monorepo reduce friccion.

### Comunicacion Mediante API

El frontend y el backend deben tratarse como sistemas separados. El frontend no debe importar codigo interno del backend ni leer archivos de datos directamente. Debe consumir una API HTTP/REST con JSON.

El contrato sera:

- backend expone rutas bajo `/api/v1`;
- frontend configura una URL base como `NEXT_PUBLIC_API_BASE_URL` o equivalente;
- los schemas de entrada y salida se documentan con OpenAPI generado por FastAPI;
- errores se devuelven con una estructura consistente, por ejemplo `code`, `message` y `details`.

Esto permite que el backoffice, el portal publico de tracking y futuros agentes consuman el mismo backend sin acoplarse a detalles internos.

### Variables de Entorno

La configuracion no debe quedar hardcodeada. Variables recomendadas:

Backend:

- `APP_ENV`: `development`, `staging` o `production`.
- `DATABASE_URL`: conexion a base de datos.
- `SECRET_KEY`: firma de tokens.
- `ACCESS_TOKEN_EXPIRE_MINUTES`: duracion de sesion.
- `CORS_ALLOWED_ORIGINS`: lista de origenes permitidos.
- `UPS_API_KEY`, `FEDEX_API_KEY`, `DHL_API_KEY`, etc.: credenciales de transportistas.
- `LOG_LEVEL`: nivel de logs.

Frontend:

- `NEXT_PUBLIC_API_BASE_URL`: URL base del backend.
- `NEXT_PUBLIC_TRACKING_PORTAL_URL`: URL publica del portal de seguimiento, si aplica.

En FastAPI, estas variables deberian centralizarse en `core/config.py` usando `pydantic-settings`, para convertir strings en tipos validos y fallar temprano si falta configuracion critica.

### CORS

Como frontend y backend pueden correr en origenes distintos, por ejemplo `http://localhost:3000` y `http://localhost:8000`, el backend debe configurar CORS.

La politica recomendada es:

- en desarrollo, permitir explicitamente origenes locales usados por el equipo;
- en produccion, permitir solo dominios reales de TrackFlow;
- evitar `allow_origins=["*"]` si se usan credenciales, cookies o headers de autorizacion;
- mantener los origenes en variables de entorno para no editar codigo por ambiente.

Esto protege la API de solicitudes no esperadas desde navegadores y reduce errores comunes al conectar el dashboard con el backend.

## 7. Decisiones Tecnicas Iniciales

- **Framework:** FastAPI por su tipado, documentacion automatica OpenAPI, soporte async y buen encaje con APIs modernas.
- **Versionado:** prefijo `/api/v1` desde el inicio para permitir evolucion futura sin romper consumidores.
- **Validacion:** Pydantic para request y response schemas.
- **Persistencia:** iniciar con una base relacional si el alcance incluye entidades operativas conectadas como envios, clientes, devoluciones y transportistas. PostgreSQL seria una opcion natural para produccion. Para demos o prototipos, se puede usar almacenamiento local, pero sin mezclarlo con la logica de negocio.
- **Autenticacion:** JWT para usuarios internos, con roles basicos por area: operaciones, CX, administracion y direccion.
- **Observabilidad:** logs estructurados desde el inicio, incluyendo `request_id`, usuario, endpoint, transportista y pais cuando aplique.
- **Integraciones externas:** encapsular cada transportista en adaptadores propios para normalizar respuestas y errores.
- **Testing:** tests unitarios para servicios de negocio y tests de API para routers criticos.

## 8. Riesgos y Puntos de Atencion

### Riesgo 1: concentrar todo en `main.py`

Si el equipo coloca endpoints, validaciones, llamadas a transportistas y reglas de negocio en un unico archivo, el backend sera rapido de empezar pero dificil de mantener. Cada cambio de tracking, devoluciones o soporte tendra riesgo de romper areas no relacionadas. Tambien se volvera mas dificil escribir tests pequenos y entender la propiedad de cada modulo.

Consecuencia probable: el equipo terminara duplicando logica, mezclando conceptos y demorando mas en cada sprint.

### Riesgo 2: mezclar modelos de base de datos con schemas de API

Los modelos de persistencia y los schemas de entrada/salida no deberian ser lo mismo. La base de datos puede contener campos internos, auditoria, claves externas o estados tecnicos que el frontend no debe enviar ni recibir. Si se mezclan, se filtran detalles internos y se vuelve mas dificil cambiar la base sin romper contratos publicos.

Consecuencia probable: cambios internos pequenos se transforman en breaking changes para el frontend.

### Riesgo 3: no aislar integraciones con transportistas

Cada transportista tendra formatos, tiempos de respuesta, errores y reglas diferentes. Si los routers llaman directamente a UPS, FedEx, MRW o SEUR, la API quedara acoplada a proveedores concretos y sera dificil agregar nuevos transportistas o simular respuestas en tests.

Consecuencia probable: una caida o cambio de API externa afectara directamente a endpoints internos y al dashboard operativo.

### Riesgo 4: CORS y variables de entorno tratados como detalle menor

En un sistema con frontend y backend separados, la mala configuracion de CORS o URLs base puede bloquear el desarrollo, exponer la API a origenes no deseados o provocar errores distintos entre desarrollo y produccion.

Consecuencia probable: integraciones fragiles, credenciales mal manejadas y bugs que solo aparecen al desplegar.

## 9. Checklist de Aceptacion

- [x] El archivo esta ubicado en `docs/ARCHITECTURE_PROPOSAL.md`.
- [x] El patron arquitectonico esta justificado segun las necesidades de TrackFlow.
- [x] La estructura de carpetas refleja separacion por dominios y responsabilidades tecnicas.
- [x] Se referencian convenciones oficiales de FastAPI: `APIRouter`, multiples archivos, Pydantic, settings y CORS.
- [x] Los routers y endpoints estan agrupados por dominio.
- [x] Se explica la integracion entre frontend y backend como sistemas separados.
- [x] Se incluyen riesgos tecnicos y consecuencias de no respetar la estructura.
- [x] Se explica el que, el por que y las consecuencias de las decisiones.

## 10. Conclusion

La recomendacion es comenzar con un backend FastAPI modular dentro del monorepo, organizado por dominios de negocio y con capas internas claras. Esta arquitectura permite avanzar rapido en los primeros endpoints sin sacrificar claridad, deja espacio para integrar transportistas y agentes de IA, y crea un contrato estable para los frontends actuales y futuros de TrackFlow.
