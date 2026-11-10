# Caching y optimización de TrackFlow

Fecha: 10 de noviembre de 2026. Base: `origin/main` (`e005162`).
Aplicaciones modificadas: API FastAPI y backoffice principal.

## 1. Decisiones en el frontend

Los formularios de creación de incidencias y proveedores pasan a componentes
cliente separados, importados mediante `next/dynamic` y montados al solicitarlos.
El listado y los filtros siguen disponibles mientras se descarga el formulario.
Su validación, estado de envío y manejo de errores pertenecen ahora al componente
diferido. Se mantienen avisos de éxito y recarga en la página principal, apertura
por hash, estado de carga accesible, foco dentro del diálogo y Escape.

Son vistas secundarias: consultar o editar un listado no necesita cargar el código
de creación. Chrome headless sobre builds de producción confirma que sus chunks
se solicitan después del clic, no durante la navegación inicial.

| Recorrido | JS antes de abrir, original | JS antes de abrir, optimizado | JS descargado al abrir |
| --- | ---: | ---: | ---: |
| Incidencias | 508.303 B | 509.701 B | 3.696 B |
| Proveedores | 519.593 B | 521.607 B | 5.143 B |

Estas cifras son bytes JS descomprimidos de recursos Next observados desde el
acceso sintético hasta la ruta, incluidos recursos compartidos y prefetch. Cada
recorrido empieza con una navegación nueva y caché HTTP desactivada. La referencia
se compiló desde las páginas de `origin/main` en una copia temporal, con las mismas
dependencias instaladas. No son tamaños gzip ni métricas de carga de producción.
**El JS inicial total no disminuye** en estos recorridos: aumenta 1.398 B y
2.014 B por el coste de separación y carga dinámica. La mejora demostrada es
aplazar el código de los formularios y sus renders; no se afirma una mejora de LCP.

En proveedores, `useMemo(() => prepareSuppliers(suppliers), [suppliers])` prepara
el conjunto completo: copia las filas, deriva las etiquetas de categorías y agrega
los estados en una pasada O(n). Editar una tarifa provisional o cambiar el estado
del formulario no vuelve a preparar miles de filas. Una mutación confirmada cambia
`suppliers`, por lo que sí recalcula filas y contadores. El render de la tabla sigue
teniendo coste: esta optimización no introduce virtualización.

Con 5.000 proveedores, 200 ejecuciones del cálculo real en Node arrojan una mediana
de 1,63 ms y p95 de 2,16 ms. Evitar 100 cálculos equivalentes ahorraría alrededor de
163 ms de CPU acumulados: es una estimación a partir del cálculo aislado, no una
medición de interacción completa ni del ahorro en cada equipo. Una prueba React
verifica que editar una tarifa reutiliza el resultado y suspender al proveedor lo
recalcula. La elección de moneda USA/USD o Spain/EUR es una expresión directa:
se retiró su `useMemo` trivial.

## 2. Decisiones en el backend

### Instrumentación y datos

El middleware de `main.py` utiliza `perf_counter` y el logger `api.timing` a nivel
INFO. Registra método, plantilla de ruta, estado y milisegundos, también ante una
excepción. El colector de logs debe habilitar INFO para ese logger. Las rutas no
reconocidas se identifican como `<unmatched>`; no se registran parámetros, valores
de identificadores, cabeceras, tokens ni cuerpos.

`scripts/benchmark_caching.py` crea y elimina un directorio temporal nuevo. Su
seeder determinista genera 10.000 incidencias, 5.000 proveedores, 1.000 SKU y
20.000 movimientos relacionados (10.000 entradas y 10.000 salidas, sin stock
negativo). Las relaciones se insertan con los modelos SQL existentes; no hay
migraciones. Desactiva dotenv y demo, configura SQLite sintético antes de importar
la API y no ejecuta startup. Nunca utiliza las bases del proyecto ni un proveedor
externo. El modo control `--uncached` omite únicamente la caché de incidencias.

La frecuencia de producción no está disponible. Las frecuencias de la auditoría
son estimaciones cualitativas basadas en consumidores y código, no telemetría
inventada. La carga medida usa 20 peticiones por escenario, secuenciales o con
cuatro hilos. El calentamiento queda fuera del muestreo. Se miden HTTP ASGI con
TestClient, validación, serialización y autenticación; no red ni TLS.

Durante una ejecución concurrente se observó una carrera previa en el cursor del
archivo TinyDB de autenticación (`JSONDecodeError` al leer). El benchmark utiliza
TinyDB MemoryStorage para la identidad sintética tanto en control como con caché;
mantiene validación JWT y búsqueda de usuario en cada solicitud. No modifica el
almacenamiento de autenticación de la aplicación. El benchmark concurrente no
certifica la concurrencia del archivo TinyDB real; esa limitación queda pendiente
fuera de esta feature.

### Cachés seleccionadas

| Operación | Coste y frecuencia estimada | TTL | Clave e invalidación |
| --- | --- | ---: | --- |
| `GET /api/incidents` | Lee, valida y ordena el histórico; lo consultan panel y listado con filtros | 30 s | Tipo de lectura, UUID autenticado y filtros validados/ordenados; invalidación global tras escritura confirmada |
| `GET /api/incidents/summary` | Lee y valida todo el histórico y agrega cuatro dimensiones; panel, pantalla y refresco tras mutaciones | 30 s | Tipo de lectura y UUID autenticado; misma invalidación |

Las dos lecturas pasan a exigir sesión: solicitudes anónimas, tokens inválidos o
cuentas desactivadas reciben 401 incluso con caché caliente. OpenAPI declara la
seguridad y el esquema 401. Las rutas, filtros y respuestas 200 permanecen iguales;
el backoffice ya envía el bearer token mediante `apiFetch`.

La caché reside por proceso, usa reloj monotónico y LRU con máximo de 128 entradas.
Elimina entradas vencidas al acceder. Guarda copias independientes de los datos,
sin sesiones SQL, objetos ORM ni referencias mutables compartidas. Los errores no
se guardan. Un bloqueo reentrante coordina cargas y escrituras: una lectura en
curso termina antes del commit e invalidación de la escritura; nunca vuelve a
publicar un valor antiguo después de esa invalidación.

La invalidación se encuentra en `insert_incident`, `insert_seed_incident` y
`update_status`, después de salir del contexto que confirma la transacción.
Vacía todas las claves de ambos endpoints, de todos los usuarios y filtros. Una
validación fallida, transición inválida o rollback no publica cambios ni invalida
la entrada válida. Las escrituras HTTP y las inserciones directas quedan cubiertas.

### Resultados HTTP

Las cifras finales y sus comandos se registran tras la comparación secuencial
control/caché. Los SELECT contados pertenecen al repositorio de incidencias;
la autenticación en memoria sigue ejecutándose y no es un SELECT SQL.

| Endpoint | Escenario | p50 sin caché | p95 sin caché | p50 caliente | p95 caliente | SELECT sin/con |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| Listado | Secuencial | 202,15 ms | 266,17 ms | 114,87 ms | 126,59 ms | 20 / 0 |
| Listado | 4 concurrentes | 1.048,40 ms | 1.393,61 ms | 481,37 ms | 519,20 ms | 20 / 0 |
| Resumen | Secuencial | 168,47 ms | 184,81 ms | 4,47 ms | 5,48 ms | 20 / 0 |
| Resumen | 4 concurrentes | 850,93 ms | 1.013,44 ms | 13,99 ms | 17,25 ms | 20 / 0 |

En esta muestra, la mediana secuencial mejora aproximadamente un 43% en el listado
y un 97% en el resumen. No son objetivos de servicio ni resultados de producción.
El control y la caché se ejecutaron uno después del otro, sin suites simultáneas.

El tamaño de respuesta se mantiene: 2.512.785 B para el listado y 159 B para el
resumen. La caché no comprime ni pagina la respuesta. La reducción mayor aparece
en el resumen; el listado conserva costes de copia, validación y serialización.

### Auditoría completa de operaciones

Costes cualitativos deducidos del código. Frecuencia alta = lectura recurrente al
navegar; media = interacción puntual o refresco; baja = acción explícita poco
frecuente. Ninguna frecuencia representa un conteo de producción. Solo los dos
endpoints seleccionados tienen mediciones comparativas en esta entrega.

| Operación | Coste | Consumidor / frecuencia estimada | Cambio de datos | Decisión |
| --- | --- | --- | --- | --- |
| `GET /` | Constante | Health/manual; media | Solo despliegue | Sin caché: coste trivial |
| `POST /auth/login` | Alto: bcrypt y TinyDB | Login; media | Identidad y credenciales | Sin caché: sesión |
| `GET /auth/me` | Bajo/medio: usuario y perfil | Cabecera/cuenta; alta | Perfil y estado activo | Sin caché: identidad vigente |
| `POST /auth/forgot-password` | Alto: token y correo | Recuperación; baja | Token nuevo por operación | Sin caché: mutación sensible |
| `POST /auth/reset-password` | Alto: bcrypt y consumo de token | Recuperación; baja | Credenciales y token | Sin caché: mutación sensible |
| `POST /auth/change-password` | Alto: bcrypt | Cuenta; baja | Credenciales | Sin caché: mutación sensible |
| `POST /users` | Alto: bcrypt y escritura | Registro; baja | Usuario nuevo | Sin caché: mutación |
| `GET /users` | O(usuarios), TinyDB | Gestión; media | Altas, bajas y cambios | Sin caché: datos de identidad |
| `GET /users/{user_id}` | Búsqueda TinyDB y permisos | Gestión/cuenta; media | Usuario variable | Sin caché: permisos y privacidad |
| `PUT /users/{user_id}` | Escritura y posible bcrypt | Cuenta/gestión; baja | Identidad y rol | Sin caché: mutación |
| `DELETE /users/{user_id}` | Escritura TinyDB | Gestión; baja | Baja de identidad | Sin caché: mutación |
| `GET /profiles/me` | Búsqueda TinyDB | Perfil; media | Cambios del usuario | Sin caché: personalización |
| `PUT /profiles/me` | Escritura TinyDB | Perfil; baja | Perfil modificado | Sin caché: mutación |
| `GET /suppliers` | O(proveedores), filtros y proyección | Panel/directorio; alta | Cambios manuales de tarifas/estado | Candidato futuro, sin nueva caché |
| `POST /suppliers` | Escritura TinyDB | Formulario; baja | Alta de proveedor | Sin caché: mutación |
| `GET /suppliers/{supplier_id}` | Búsqueda y proyección | API/manual; baja | Cambios manuales | Descartado: sin lectura UI recurrente |
| `PATCH /suppliers/{supplier_id}/rate` | Lectura y escritura TinyDB | Directorio; media | Tarifa modificada | Sin caché: mutación |
| `PATCH /suppliers/{supplier_id}/status` | Lectura y escritura TinyDB | Directorio; media | Estado modificado | Sin caché: mutación |
| `DELETE /suppliers/{supplier_id}` | Lectura y escritura TinyDB | API/manual; baja | Baja de proveedor | Sin caché: mutación |
| `GET /inventory/products` | Alto: N+1, dos SUM por SKU | Inventario; alta | Movimientos cambian stock | Descartado: frescura y acceso |
| `GET /inventory/products/{product_id}` | Dos SUM y lectura SKU | Formularios de movimientos; media | Stock variable | Sin caché: stock actual |
| `POST /inventory/products` | Escritura SQL y cálculo de stock | Inventario; baja | SKU nuevo | Sin caché: mutación |
| `GET /inventory/orders` | Dos joins, proyección y ordenación | Historial; media | Nuevos movimientos | Sin caché: datos operativos y acceso |
| `POST /inventory/orders/inbound` | Escritura SQL | Recepción; media | Stock cambia | Sin caché: mutación |
| `POST /inventory/orders/outbound` | SUM, bloqueo y escritura | Expedición; media | Stock cambia | Sin caché: valida stock real |
| `GET /api/incidents` | Alto: histórico, ordenación y modelos | Panel/listado; alta | Altas y cambios de estado | TTL 30 s por usuario y filtros |
| `GET /api/incidents/summary` | Alto: histórico y cuatro agregaciones | Panel/incidencias; alta | Altas y cambios de estado | TTL 30 s por usuario |
| `GET /api/incidents/{incident_id}` | Lectura por PK y modelo | API/manual; media | Estado variable | Sin nueva caché: lectura pequeña |
| `POST /api/incidents` | Validación y escritura SQLite | Registro; media | Incidencia nueva | Invalida ambas cachés tras commit |
| `PATCH /api/incidents/{incident_id}/status` | Transición y escritura SQLite | Gestión; media | Estado actualizado | Invalida ambas cachés tras commit |
| `POST /api/incidents/analyze` | Alto: parseo y agregación CSV | API/manual; baja | Depende del archivo subido | Sin caché: entrada variable |
| `GET /api/incidents/results/export` | Serialización CSV | API/manual; baja | Depende del último análisis | Sin caché: estado global previo |
| `POST /api/rag/query` | Alto: embedding, Qdrant y generación | Asistente; media | Corpus y pregunta/contexto | Conserva cachés existentes |

Las cuatro rutas automáticas de documentación (`/openapi.json`, `/docs`,
`/docs/oauth2-redirect` y `/redoc`) tienen coste bajo/moderado de esquema o HTML,
frecuencia baja de desarrollo y cambian con el código; no se añade caché de negocio.

## 3. Intercambios reconocidos

- Dentro del proceso, las mutaciones del repositorio invalidan inmediatamente
  las lecturas posteriores al commit. Cambios externos por SQL o procesos ajenos
  pueden tardar hasta 30 segundos en reflejarse. Se tolera ese límite para consultas
  operativas y sus resúmenes; la validación de stock no usa esta caché.
- Se eligió memoria para evitar dependencias e infraestructura nuevas. La
  configuración revisada ejecuta un proceso Uvicorn. Con varios procesos o réplicas,
  cada uno conservaría su propia caché hasta expirar: antes de escalar se necesita
  invalidación compartida, por ejemplo Redis o eventos entre procesos.
- Las claves por usuario evitan compartir datos privados. A cambio duplican
  resultados equivalentes y reducen la tasa de aciertos. El máximo de entradas
  limita su número, no sus bytes; listados grandes multiplicados por muchos
  usuarios pueden consumir memoria significativa. TTL corto y expulsión acotan
  duración y cantidad, pero no sustituyen paginación ni un límite por bytes.
- El bloqueo global garantiza coherencia y una sola carga concurrente, pero
  serializa cargas, copias y escrituras de incidencias. Un fallo de carga libera el
  bloqueo sin cachear el error. No se garantiza escalabilidad ilimitada.
- Lazy loading añade espera al primer registro y un pequeño coste de runtime.
  Hay indicador accesible de carga. El formulario desmontado libera su estado;
  cancelar y volver a abrir inicia un formulario nuevo. Las pruebas cubren el
  comportamiento operativo, no cambios de diseño.

## 4. Qué no se cacheó y por qué

- Inventario: el catálogo calcula stock con consultas agregadas por SKU (patrón
  N+1). Es un candidato costoso, pero cachearlo sin revisar seguridad y frescura
  ampliaría el cambio. La autorización de una salida siempre consulta stock real.
- Identidad, perfiles, contraseñas y sesiones: requieren validación vigente y
  contienen información sensible; no se añaden cachés de respuestas.
- Detalle de proveedor: ya tiene autenticación, pero el backoffice no lo consulta
  como lectura recurrente. El listado de proveedores es candidato futuro; esta
  entrega prioriza las dos lecturas de incidencias respaldadas por mediciones.
- RAG: ya tiene TTL de embeddings/respuestas y consulta Qdrant en cada pregunta.
  No se duplica ni modifica ese sistema, los modelos ni sus parámetros.
- Análisis CSV, exportación y mutaciones: tienen entrada variable o estado
  cambiante. La exportación conserva su comportamiento previo; no se añade una
  caché sobre el estado global `LAST_ANALYSIS`.
- Inferencia de moneda: cálculo trivial; el coste de memoizarlo no se justifica.

## 5. Reproducción y validación

Desde la raíz, en un entorno con dependencias instaladas:

```text
uv run --frozen python -m scripts.benchmark_caching --uncached
uv run --frozen python -m scripts.benchmark_caching
node scripts/benchmark_supplier_view.mjs
npm --prefix uis/backoffice run build
npm --prefix uis/backoffice run start -- --port 3103
uv run --frozen python -m scripts.check_caching_browser --port 3103
```

El smoke de navegador requiere Chrome en Windows y websockets del entorno uv;
lanza un perfil temporal y sustituye las llamadas backend por respuestas
sintéticas. No abre el perfil personal ni envía credenciales reales. `--baseline`
permite comprobar una compilación anterior sin exigir nuevos chunks al abrir.

Para pytest, configurar `PYTHON_DOTENV_DISABLED=1`, `DEMO_DATA_ENABLED=false`,
`DATABASE_URL=sqlite://` y un `JWT_SECRET` sintético antes de importar módulos:

```text
uv run --frozen pytest -q -p no:cacheprovider --basetemp .tmp/caching-final
npm --prefix uis/backoffice test -- --runInBand
npm --prefix uis/backoffice run lint
npm --prefix uis/backoffice run build
npm run validate:ai-setup
npm run test:ai-setup
git diff --check
```

- Línea base: 138 pruebas backend y once subtests aprobados; seis omisiones Linux.
  Backoffice: 17 pruebas y build aprobados antes de modificar las aplicaciones.
- Final: 146 pruebas backend y once subtests aprobados; seis pruebas de scripts
  de despliegue omitidas en Windows. Persisten tres avisos previos de deprecación.
- Backoffice: 21 pruebas aprobadas, lint sin errores ni avisos nuevos y build
  aprobado; persiste el aviso previo de múltiples lockfiles de Next.
- Caché: reloj controlado, expiración, copia defensiva, expulsión, errores no
  almacenados, claves por usuario/filtro, cuentas desactivadas, 401/OpenAPI,
  commit/rollback, invalidación global, carrera lectura/escritura y una sola
  carga para lectores concurrentes. Contratos 200 conservados en frío y caliente.
- React: validación y errores de incidencias, guardado de ambos formularios,
  moneda derivada y recomputación del listado solo al cambiar proveedores.
- Chrome: los dos chunks ausentes antes de abrir, descarga al primer clic,
  foco dentro del diálogo, Escape y reapertura por hash comprobados.
- Configuración AI: 40 comprobaciones y siete pruebas aprobadas. Diff revisado
  sin secretos ni datos personales nuevos y `git diff --check` limpio.
- No se construyeron contenedores ni se ejecutaron pruebas Linux; no se modificó
  infraestructura ni se presenta un despliegue o CI remoto como verificado.
