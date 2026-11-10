# Auditoría de serialización del backend

## Estado y método

Tres fases completadas el 9 de noviembre de 2026, con autorización del desarrollador
para avanzar después de cada revisión. Base: `main`, commit `91350ab3b0f149d9cf5ddd0008337a566f7c3bcc`
(merge de la PR #32 de RAG). Rama: `feature/serialization-audit`.
Requisitos: archivo local `RETO.md` (fuente protegida, no incorporada a esta PR).

En fase 1 se inspeccionaron `services/api/main.py`, sus siete routers registrados, los
esquemas, servicios de persistencia, pipeline RAG, analizador CSV, tests existentes
y consumidores del backoffice. No se arrancó la API, importó la aplicación,
consultó el gateway ni accedió a bases de datos. El inventario es estático; las
respuestas descritas proceden del código, no de solicitudes HTTP de esta fase.

El estado original tenía **33 operaciones de negocio**: **10 ✅ ya serializadas**, **4 ⚠️ parcialmente
serializadas** y **19 ❌ sin serializar** según el criterio de `RETO.md`. El grupo
sin serializar incluye una descarga CSV que necesita documentación de transporte,
no conversión a JSON. No se encontraron retornos directos de entidades SQLModel:
inventario ya las convierte a esquemas. Predominan diccionarios sin contrato de
salida explícito; que un helper filtre campos no sustituye `response_model`.

En las tablas, «—» significa ausencia de `response_model` en el decorador.
Las tablas siguientes conservan el estado y las propuestas de la fase 1 como
registro histórico. La sección «Implementación de fase 2» registra los contratos
aplicados y las comprobaciones. La columna de estado final marca las 33 operaciones
como ✅ tras la verificación de fase 3; CSV conserva su excepción de transporte.

## Inventario completo: autenticación, usuarios y perfiles

| Método y ruta | Propósito / entrada actual | Respuesta original y `response_model` | Estado original | Propuesta de fase 2 |
| --- | --- | --- | --- | --- |
| POST `/auth/login` | Login; formulario `OAuth2PasswordRequestForm` | `dict` con `access_token`, `token_type`; — | ❌ | `TokenResponse`; conservar el token de acceso público, sin email ni tokens internos. |
| GET `/auth/me` | Cuenta autenticada; sin cuerpo | `dict {user, profile}`; usuario filtrado por `public_user`, perfil TinyDB directo o `None`; — | ❌ | `AccountResponse` con usuario público y perfil acotado nullable; conservar email propio. |
| POST `/auth/forgot-password` | Solicitar recuperación; `ForgotPasswordRequest` | `dict {message}` genérico; `MessageResponse` | ✅ | Conservar modelo y respuesta indistinguible para emails existentes/inexistentes. |
| POST `/auth/reset-password` | Restablecer contraseña; `ResetPasswordRequest` | `dict {message}`; `MessageResponse` | ✅ | Conservar; nunca devolver token de recuperación ni email. |
| POST `/auth/change-password` | Cambiar contraseña propia; `ChangePasswordRequest` | `dict {message}`; `MessageResponse` | ✅ | Conservar contrato y autenticación. |
| POST `/users` | Registro público; `UserCreate` | `dict {user, profile}`; `public_user` incluye email y perfil directo incluye `user_id`; — | ❌ | `RegistrationResponse` con usuario sin email y perfil explícito sin FK redundante; mantener 201. |
| GET `/users` | Listar usuarios, requiere sesión; sin cuerpo | `list[dict]` filtrados con id, email, is_active, role, created_at; — | ❌ | `list[UserListItem]` plano; conservar esos campos por contrato existente comprobado en tests, sin perfiles ni hashes. |
| GET `/users/{user_id}` | Consultar usuario, propietario/admin; sin cuerpo | `dict` de `public_user`; — | ❌ | `UserPublic` explícito; conservar campos y permisos. |
| PUT `/users/{user_id}` | Editar usuario, propietario/admin; `UserUpdate` | `dict` de `public_user`; — | ❌ | `UserPublic` como salida; conservar entrada separada y control de roles. |
| DELETE `/users/{user_id}` | Eliminar usuario, propietario/admin; sin cuerpo | `dict {deleted, id}`; — | ❌ | `UserDeleteResponse`; mantener 200 y cuerpo actual. |
| GET `/profiles/me` | Consultar perfil propio; sin cuerpo | Documento TinyDB con id, user_id, name, phone, address; — | ❌ | Proyección `ProfileResponse` con id, name, phone, address; excluir FK al usuario ya identificado por la sesión. |
| PUT `/profiles/me` | Editar perfil propio; `ProfileUpdate` | Documento TinyDB actualizado o `None`; — | ❌ | Mismo `ProfileResponse`; resolver perfil ausente con 404 explícito antes de validar salida. |

## Inventario completo: proveedores e inventario

| Método y ruta | Propósito / entrada actual | Respuesta original y `response_model` | Estado original | Propuesta de fase 2 |
| --- | --- | --- | --- | --- |
| POST `/suppliers` | Crear proveedor autenticado; `SupplierCreate` | Instancia `SupplierResponse`; `SupplierResponse` | ✅ | Conservar detalle y 201; entrada distinta de salida. |
| GET `/suppliers` | Listar con filtros country/category; sin cuerpo | Instancias completas; `list[SupplierResponse]`, incluye contacto, notas, zona y fecha no leídos por la tabla | ⚠️ | `list[SupplierListItem]`: id, name, country, categories, rate_per_shipment, currency, status. |
| GET `/suppliers/{supplier_id}` | Detalle autenticado; sin cuerpo | Instancia `SupplierResponse`; `SupplierResponse` | ✅ | Conservar campos de detalle. |
| PATCH `/suppliers/{supplier_id}/rate` | Cambiar tarifa; `SupplierRateUpdate` | Instancia `SupplierResponse`; `SupplierResponse` | ✅ | Conservar entrada separada y salida de detalle. |
| PATCH `/suppliers/{supplier_id}/status` | Cambiar estado; `SupplierStatusUpdate` | Instancia `SupplierResponse`; `SupplierResponse` | ✅ | Conservar entrada separada y salida de detalle. |
| DELETE `/suppliers/{supplier_id}` | Eliminar proveedor autenticado; sin cuerpo | `dict {deleted, id}` con id string; — | ❌ | `SupplierDeleteResponse`; mantener 200 y tipo de id. |
| GET `/inventory/products` | Listar productos y stock calculado; sin cuerpo | Instancias `SKUResponse`; `list[SKUResponse]` | ✅ | Conservar: todos sus campos son utilizados por la pantalla de productos/formularios. |
| POST `/inventory/products` | Crear producto autenticado; `SKUCreate` | Instancia `SKUResponse`; `SKUResponse` | ✅ | Conservar 201 y campos; separar bases comunes si se reorganizan esquemas. |
| GET `/inventory/products/{product_id}` | Detalle y stock calculado; sin cuerpo | Instancia `SKUResponse`; `SKUResponse` | ✅ | Conservar. |
| POST `/inventory/orders/inbound` | Registrar entrada autenticada; `StockEntryCreate` | `StockEntryResponse.model_validate(order)`; `StockEntryResponse`, expone sku_id y user_uuid | ⚠️ | Salida independiente con movimiento y producto proyectado; sustituir sku_id por `sku: {id, name, sku}`. Conservar user_uuid usado como atribución operativa. |
| POST `/inventory/orders/outbound` | Registrar salida autenticada; `StockExitCreate` | `StockExitResponse.model_validate(order)`; `StockExitResponse`, expone sku_id y user_uuid | ⚠️ | Misma proyección SKU; conservar campos específicos, validación de stock y 201. |
| GET `/inventory/orders` | Listar movimientos; sin cuerpo | Instancias `OrderResponse`; `list[OrderResponse]`, SKU completo anidado y user_uuid | ⚠️ | SKU acotado a id, name, sku; conservar campos del movimiento y user_uuid leído por la tabla; evitar recalcular stock para esta proyección. |

## Inventario completo: incidencias, análisis, RAG y salud

| Método y ruta | Propósito / entrada actual | Respuesta original y `response_model` | Estado original | Propuesta de fase 2 |
| --- | --- | --- | --- | --- |
| POST `/api/incidents` | Crear incidencia; `IncidentCreate` | `dict` del repositorio validado internamente por `Incident`, incluye source_id; — | ❌ | `IncidentResponse` público sin source_id; mantener 201 y errores existentes. |
| GET `/api/incidents` | Listar con filtros status/origin/branch/category; sin cuerpo | Lista de diccionarios del repositorio, incluye source_id; — | ❌ | `list[IncidentListItem]` sin source_id; conservar descripción usada como tooltip. |
| GET `/api/incidents/summary` | Resumen por estado/categoría/origen/sede; sin cuerpo | `dict {total, by_status, by_category, by_origin, by_branch}`; — | ❌ | `IncidentSummaryResponse` con conteos tipados. |
| GET `/api/incidents/{incident_id}` | Detalle de incidencia; sin cuerpo | `dict` del repositorio o `JSONResponse` 404; — | ❌ | `IncidentResponse` sin source_id; conservar 404. |
| PATCH `/api/incidents/{incident_id}/status` | Transición de estado; `IncidentStatusUpdate` | `dict` del repositorio o `JSONResponse` de error; — | ❌ | `IncidentResponse`; conservar reglas de transición y errores. |
| POST `/api/incidents/analyze` | Analizar CSV autenticado; archivo multipart `UploadFile` | `dict` de `analyze_csv_text`; — | ❌ | `IncidentAnalysisResponse` y modelos de desglose/satisfacción fieles al analizador. No cambiar entrada a JSON. |
| GET `/api/incidents/results/export` | Descargar último análisis, autenticado; sin cuerpo | `Response` con `text/csv` y Content-Disposition; — | ❌ | `response_model=None` explícito, `response_class=Response` y `responses` con esquema string `text/csv`; conservar descarga. Excepción al modelo Pydantic JSON. |
| POST `/api/rag/query` | Preguntar a la base comercial autenticada; `RAGQueryRequest` | `dict {answer, sources, retrieved_count, abstained}`; — | ❌ | `RAGQueryResponse`, fuentes con source_document y section; entrada rechaza extras; conservar abstención y 503. |
| GET `/` | Salud básica; sin cuerpo | `dict {message}`; — | ❌ | Modelo de mensaje explícito; conservar contenido. |

Las rutas automáticas de FastAPI `GET /openapi.json`, `GET /docs`,
`GET /docs/oauth2-redirect` y `GET /redoc` no son endpoints de negocio declarados
por el proyecto. Se registran aquí para completar la cobertura: FastAPI genera
JSON OpenAPI o HTML; no se les imponen esquemas Pydantic de negocio ni se alteran.
La verificación manual de fase 3 utilizará `/docs`.

## Hallazgos y decisiones propuestas

### Seguridad y entradas

- **Registro público:** `POST /users` devuelve actualmente el email del nuevo
  usuario. Incumple el reto aunque `public_user` ya excluye hashed_password.
  La pantalla de registro usa solo el estado HTTP de éxito y después hace login
  con el email del formulario: retirar el email de la respuesta no exige cambiar
  ese flujo. Mantener user.id y profile.name/phone conserva las expectativas de
  los tests actuales sin publicar email ni contraseñas.
- **Perfiles:** hoy se devuelven documentos TinyDB sin whitelist de salida. Los
  esquemas `UserPublic` y `ProfilePublic` existen pero no están conectados a las
  rutas. El perfil de `/auth/me` puede ser null; la pantalla ya lo contempla.
- **Token de acceso:** access_token es el resultado público necesario del login;
  no se interpreta la prohibición de «tokens internos» como eliminación del JWT
  de acceso. Nunca se devuelven tokens de recuperación, credenciales de proveedor
  ni hashed_password. El email del propio usuario se conserva en `/auth/me`.
- **Escritura:** auth, usuarios, perfiles, proveedores e incidencias ya usan
  entradas separadas con `extra="forbid"`; inventario acepta clases Create,
  aunque sus respuestas heredan de ellas. No se pasa una clase Response como
  entrada en estas rutas. Separar bases compartidas de entrada/salida al corregir
  movimientos; añadir rechazo de extras a `RAGQueryRequest`. Login conserva el
  formulario OAuth2 y análisis conserva multipart.
- No ampliar permisos ni rediseñar autenticación en este hito. La enumeración de
  usuarios para cualquier sesión y las rutas públicas de incidencias/inventario
  se anotan como comportamiento previo; endurecer autorización es otro trabajo.

### Relaciones y tamaño de respuesta

- **Cuenta:** mantener `{user, profile}` como proyecciones acotadas, sin perfil
  completo de persistencia ni profile.user_id redundante. Perfil independiente
  también identifica al propietario mediante sesión, sin FK en salida.
- **Usuarios:** listado plano sin perfiles. No hay consumidor UI encontrado de
  GET `/users`, pero los tests verifican emails; mantener sus cinco campos
  públicos actuales evita un recorte arbitrario sin evidencia de uso.
- **Proveedores:** la tabla y el resumen del inicio consumen siete campos. Contacto,
  notas y zona aparecen en el formulario de creación, no en el listado mostrado;
  conservarlos en detalle y excluirlos del listado, junto a updated_at.
- **Inventario:** hay una relación SKU disponible; devolver proyección anidada
  `{id, name, sku}`, sin FK sku_id duplicada ni colecciones entries/exits. La tabla
  de movimientos usa sku.name y sku.sku; no necesita cliente, categoría ni stock.
  user_uuid es la atribución del operario mostrada por la UI y no tiene una
  relación ORM a usuario (usuarios viven en TinyDB): conservar solo ese ID,
  documentado, sin añadir consultas a TinyDB ni exponer perfiles ajenos.
- **Incidencias:** source_id sirve para idempotencia de importación; no es usado
  por el consumidor UI y debe quedar interno. Conservar description en el listado
  por el tooltip y mantener fechas para compatibilidad del tipo compartido.
- **RAG:** fuentes como proyección documental, sin chunks, embeddings, payload
  completo, scores internos ni configuración del gateway.

### Contratos especiales, errores y compatibilidad

- El CSV es una respuesta de transporte deliberada. `response_model=None` cumple
  declaración explícita, pero no valida el cuerpo: probar cabecera, media type y
  contenido. No fingir un modelo JSON para satisfacer una lista de aceptación.
- Incidencias devuelve `JSONResponse` en errores; estos objetos omiten validación
  de `response_model`. Documentar los esquemas de error en `responses` y probarlos,
  manteniendo las formas actuales: validation_error con field/message,
  invalid_status_transition y not_found. Mantener también `HTTPException.detail`,
  el handler global de validación 400 y el 500 genérico sin datos internos.
- El análisis CSV devuelve company, source_file, total_records, valid_records,
  invalid_records, invalid_breakdown, by_category, by_status, by_country y
  satisfaction (closed_cases, scored_cases, average nullable, scores). Modelar
  también las estructuras internas reales antes de declarar el contrato.
- Al recortar proveedores y SKU de movimientos, ajustar los tipos TypeScript del
  consumidor para reflejar listado/detalle. El cliente de registro no necesita
  cambios de comportamiento. Revisar fixtures/tests que esperen campos retirados;
  conservar las pruebas de reglas de negocio, permisos y stock.
- No se añaden endpoints, migraciones ni dependencias; no se cambian persistencia,
  corpus, modelos RAG, secretos, Docker, CI ni despliegue.

## Implementación de fase 2

Las 33 operaciones tienen `response_model` explícito en su decorador: 32 modelos
JSON y una descarga con `response_model=None`, `response_class=Response` y
contenido `text/csv` documentado en OpenAPI. La comparación estática confirma
33/33 declaraciones, sin omisiones. Los modelos finales y cambios aplicados son:

| Método y ruta | Estado final | Modelo final explícito / cambio aplicado |
| --- | --- | --- |
| POST `/auth/login` | ✅ | `TokenResponse`; solo access_token y token_type. |
| GET `/auth/me` | ✅ | `AccountResponse`; usuario público con email propio y `ProfilePublic` nullable sin user_id. |
| POST `/auth/forgot-password` | ✅ | `MessageResponse`; conservado, mensaje genérico sin email/token. |
| POST `/auth/reset-password` | ✅ | `MessageResponse`; conservado sin email/token. |
| POST `/auth/change-password` | ✅ | `MessageResponse`; conservado. |
| POST `/users` | ✅ | `RegistrationResponse`; `RegisteredUser` sin email y perfil acotado sin user_id; whitelist aplicada también antes del retorno. |
| GET `/users` | ✅ | `list[UserListItem]`; cinco campos públicos planos, sin perfiles. |
| GET `/users/{user_id}` | ✅ | `UserPublic`; whitelist explícita. |
| PUT `/users/{user_id}` | ✅ | `UserPublic`; `UserUpdate` sigue separado. |
| DELETE `/users/{user_id}` | ✅ | `UserDeleteResponse`; deleted e id. |
| GET `/profiles/me` | ✅ | `ProfilePublic`; se reutiliza el esquema de salida existente, retirando user_id. |
| PUT `/profiles/me` | ✅ | `ProfilePublic`; 404 explícito si el perfil no existe. |
| POST `/suppliers` | ✅ | `SupplierResponse`; conservado. |
| GET `/suppliers` | ✅ | `list[SupplierListItem]`; siete campos, sin contacto/notas/zona/fecha. |
| GET `/suppliers/{supplier_id}` | ✅ | `SupplierResponse`; detalle conservado. |
| PATCH `/suppliers/{supplier_id}/rate` | ✅ | `SupplierResponse`; detalle conservado. |
| PATCH `/suppliers/{supplier_id}/status` | ✅ | `SupplierResponse`; detalle conservado. |
| DELETE `/suppliers/{supplier_id}` | ✅ | `SupplierDeleteResponse`; deleted e id string. |
| GET `/inventory/products` | ✅ | `list[SKUResponse]`; contrato conservado. |
| POST `/inventory/products` | ✅ | `SKUResponse`; base común `SKUFields`, Create y Response separados. |
| GET `/inventory/products/{product_id}` | ✅ | `SKUResponse`; contrato conservado. |
| POST `/inventory/orders/inbound` | ✅ | `StockEntryResponse`; salida independiente de entrada, SKUReference con id/name/sku, sin sku_id. |
| POST `/inventory/orders/outbound` | ✅ | `StockExitResponse`; salida independiente de entrada, misma proyección SKU. |
| GET `/inventory/orders` | ✅ | `list[OrderResponse]`; SKUReference, sin agregados de stock innecesarios; user_uuid conservado. |
| POST `/api/incidents` | ✅ | `IncidentResponse`; source_id filtrado en HTTP. |
| GET `/api/incidents` | ✅ | `list[IncidentListItem]`; source_id filtrado, descripción conservada para tooltip. |
| GET `/api/incidents/summary` | ✅ | `IncidentSummaryResponse`; conteos tipados. |
| GET `/api/incidents/{incident_id}` | ✅ | `IncidentResponse`; source_id filtrado. |
| PATCH `/api/incidents/{incident_id}/status` | ✅ | `IncidentResponse`; transiciones y errores conservados. |
| POST `/api/incidents/analyze` | ✅ | `IncidentAnalysisResponse`; desgloses y satisfacción tipados, promedio nullable, multipart conservado. |
| GET `/api/incidents/results/export` | ✅ | `None` explícito; CSV y Content-Disposition conservados, esquema text/csv string en OpenAPI. |
| POST `/api/rag/query` | ✅ | `RAGQueryResponse`; fuentes acotadas, rechazo de campos extra en entrada, 503 documentado. |
| GET `/` | ✅ | `MessageResponse`; mensaje original conservado. |

Los esquemas públicos nuevos de incidencias, análisis, RAG y errores están en
`services/api/schemas_responses.py`. Auth mantiene sus esquemas en schemas_auth;
inventario y proveedores extienden sus módulos existentes. Se documentan errores
400/500 globales, 400/404 de incidencias, 404 de exportación y 503 de RAG; las
respuestas de error conservan su forma y no se convierten en respuestas de éxito.
Los tipos TypeScript de proveedores y SKU de movimientos reflejan las proyecciones
reducidas. No se cambian los flujos de las pantallas.

### Evidencia automática de fase 2

- `uv run --frozen pytest -q -p no:cacheprovider --basetemp .tmp/serialization-phase2-full`:
  **137 pruebas y 11 subtests aprobados**, **6 omitidas en Windows**, tres avisos
  de deprecación existentes (TestClient/anyio y startup on_event). Se desactiva
  dotenv, se fija DATABASE_URL SQLite en memoria, JWT sintético y demo desactivada.
  Se usan fixtures temporales, sin correo ni llamadas reales a proveedores.
- Nueva suite HTTP `services/api/tests/test_serialization_contracts.py`: 20 casos
  parametrizados, cubriendo filtrado desde persistencia, registro/login/recuperación,
  perfil ausente, usuario propio, listados, movimientos, errores, análisis CSV con
  promedio presente/ausente y filas inválidas, exportación, RAG con abstención y
  campos internos inyectados, escritura no permitida y OpenAPI de las 33 operaciones.
- El test existente de listado de movimientos verifica ahora la proyección SKU y
  comprueba stock mediante el cálculo de dominio; no exige stock en cada SKU listado.
- Backoffice: **17 pruebas aprobadas**, lint y build aprobados. Permanece el aviso
  de múltiples lockfiles existente. No se cambiaron dependencias.
- Configuración AI: 40 comprobaciones de `validate:ai-setup` y siete pruebas de
  `test:ai-setup` aprobadas; diff y archivos nuevos revisados sin secretos ni datos
  personales nuevos, `git diff --check` limpio.
- Estas comprobaciones HTTP son automatizadas con TestClient; **no sustituyen**
  las tres verificaciones manuales mediante `/docs`, realizadas después en fase 3.
  No se afirma medición de rendimiento real.

## Verificación y siguientes fases

Fase 1: inventario estático de decoradores y registro de routers; revisión de
consumidores y tests. Comparación AST: 33/33 operaciones, sin omisiones ni extras.
`npm run validate:ai-setup`: 40 comprobaciones aprobadas; `npm run test:ai-setup`:
siete pruebas aprobadas; `git diff --check`: limpio. No se ejecutó la suite de
backend, ya que no se modificó código ejecutable. No hay pruebas HTTP manuales
ni evidencia de rendimiento en esta fase.

La fase 2 aplica las propuestas y añade por operación el modelo final y cambio,
conservando la clasificación original. Las pruebas HTTP incorporadas comprueban
la serialización de FastAPI, que no se verifica llamando solo a las funciones.

### Fase 3 — resultados finales

La suite completa se repite en esta fase mediante
`uv run --frozen pytest -q -rs -p no:cacheprovider --basetemp .tmp/serialization-phase3-full`:
**137 pruebas y 11 subtests aprobados**, **6 omitidas**, tres avisos de deprecación
existentes, en 39,45 s. Se desactiva dotenv, se usa SQLite en memoria, JWT sintético
y demo desactivada, sin credenciales ni proveedores reales. Las seis omisiones son
los casos de `scripts/test_deployment.py` que exigen Linux/Bash/flock; no son pruebas
fallidas de serialización. No se ejecutan en Linux en esta fase: el daemon Docker
local no está disponible. La suite del backoffice, lint y build aprobados en fase 2
siguen siendo aplicables porque no se vuelve a modificar código de las interfaces.

### Pruebas interactivas en `/docs`

Se abre la documentación Swagger real en `http://127.0.0.1:8765/docs` mediante
Chrome headless con perfil temporal propio. Es un recorrido manual asistido por
el agente mediante comandos CDP individuales: abrir operación, pulsar **Try it out**,
editar entrada, pulsar **Execute** y leer la respuesta mostrada por Swagger. No es
una ejecución de TestClient ni una petición HTTP que sustituya los controles de UI.
La autorización se realiza mediante el diálogo **Authorize** de Swagger.

La API usa TinyDB en un directorio temporal exclusivo dentro de
`.tmp/serialization-phase3`, inventario SQLite en memoria, dotenv y seeds
desactivados y credenciales sintéticas. No se usan la API de desarrollo existente,
el VPS, datos persistentes del proyecto ni servicios de correo/gateway.

| Operación ejecutada desde Swagger | Estado observado | Campos observados y coincidencia de esquema |
| --- | --- | --- |
| POST `/users` | 201 | `RegistrationResponse`: user con id/is_active/role/created_at; profile con id/name/phone/address. Sin email, password, hashed_password ni user_id en la respuesta. |
| POST `/auth/login` | 200 | `TokenResponse`: exactamente access_token y token_type; token_type bearer. Sin email ni contraseñas. El JWT no se copia al informe. |
| GET `/auth/me` | 200 | `AccountResponse`: user con id/email/is_active/role/created_at y profile con id/name/phone/address. Se conserva el email de la cuenta sintética autenticada; sin hashed_password ni profile.user_id. |

En los tres casos se contrastan las respuestas visibles con los modelos del
OpenAPI servido por esa misma API: campos requeridos presentes y ningún campo
superior fuera del esquema. También se inspeccionan las proyecciones anidadas
de usuario y perfil. Swagger muestra las 33 operaciones del inventario.
Se cierran el navegador temporal y el proceso de API de comprobación al terminar.
No se guardan JWT ni contraseñas en la evidencia versionada.

### Criterios de aceptación

- [x] 33/33 operaciones con declaración explícita de respuesta, con excepción CSV justificada.
- [x] Entrada y salida separadas; rechazo de campos no escribibles en pruebas HTTP.
- [x] Listados acotados y relaciones justificadas; SKU proyectado y UUID operativo conservado.
- [x] Auth pública sin email/contraseñas, perfil propio con email y campos internos filtrados.
- [x] Auditoría completa con estado original, cambio aplicado y estado final por operación.
- [x] Suite existente y pruebas nuevas aprobadas, con seis omisiones de plataforma registradas.
- [x] Tres operaciones verificadas interactivamente desde `/docs` con datos sintéticos.

Entrega final tras las tres fases: commit con rutas explícitas, push y PR contra
`main` en `4GeeksAcademy/maxifer-TrackFlow`, título exacto
`feat: serialization audit and implementation`, enlace a AGENTS.md de la rama y
resultados reales. No fusionar ni desplegar. La fase 3 deja la entrega preparada
para publicar según estas instrucciones; las limitaciones anteriores se adjuntan
a la PR sin presentar pruebas omitidas como aprobadas.
