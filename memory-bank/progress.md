# Progreso

## Acciones Docker con Node.js 24 — 9 de noviembre de 2026

Con autorización explícita del desarrollador para modificar el workflow protegido,
se actualizan en `.github/workflows/deploy.yml` las referencias de
`docker/setup-buildx-action` a v4.4.1 (SHA
`f87e5991a6d7451dcb8d9637bfbc97413f497069`) y `docker/build-push-action` a
v7.4.0 (SHA `c3c9e263c25d99ce0380d002d59b67737d91b0dc`, tres builds).
Los SHA se contrastan con las releases oficiales y sus action.yml declaran
`runs.using: node24`. Las notas de las versiones mayores requieren runner
v2.327.1 o posterior; los jobs usan `ubuntu-latest`. No se utilizan los parámetros
retirados en las versiones mayores. Se conserva el Node 22 de los contenedores.

Validación: YAML parseado con PyYAML y comparación semántica con HEAD confirman
que solo cambian esas cuatro referencias; parámetros, triggers, permisos y
condiciones de despliegue se conservan. Las 40 comprobaciones AI y siete pruebas
aprueban mediante `npm.cmd` (PowerShell bloquea el wrapper npm.ps1).
Diff revisado sin secretos ni datos personales nuevos y `git diff --check` limpio.
El desarrollador autoriza commit y push en `feature/serialization-audit`;
se prepara la publicación de estos dos archivos con las comprobaciones AI
repetidas y aprobadas. Sin merge ni despliegue.
Pendiente ejecutar GitHub Actions tras publicar el cambio para comprobar los
builds y la desaparición del aviso en el runner; no se presenta CI remoto como
verificado. Archivos ajenos de `.tmp/` y `.vscode/` fuera del trabajo.

## Ajuste documental de auditoría — 9 de noviembre de 2026

Por solicitud del desarrollador, se eliminan las referencias al archivo local
de requisitos en `docs/serialization-audit.md`. Se conserva el contenido técnico
y los resultados de las tres fases. Se prepara commit local en la rama
`feature/serialization-audit`; sin cambios de código ni de fuentes protegidas.
Validación: 40 comprobaciones AI y siete pruebas aprobadas; búsqueda de referencias
al archivo retirado sin coincidencias y `git diff --check` limpio. Diff sin secretos
ni datos personales nuevos. No se repiten suites de aplicación sin cambios de código.

## Entrega de auditoría de serialización — 9 de noviembre de 2026

Tres fases completadas en `feature/serialization-audit`, commit de implementación
`ec6a286`. Rama publicada y [PR #33](https://github.com/4GeeksAcademy/maxifer-TrackFlow/pull/33)
abierta contra `main` con el título exacto `feat: serialization audit and implementation`,
enlace a AGENTS.md de la rama, auditoría y resultados. El conector GitHub permitió
lectura pero rechazó crear la PR con 403 por permisos de integración; se creó
mediante la autenticación Git existente sin imprimir ni guardar credenciales.

Validación final: backend con 137 pruebas y once subtests aprobados, seis omisiones
Linux documentadas; backoffice con 17 pruebas, lint y build aprobados; configuración
AI con 40 comprobaciones y siete pruebas aprobadas. Tres operaciones comprobadas
desde Swagger real, con API y navegador temporales ya cerrados. Diff revisado,
whitespace limpio y sin secretos nuevos; solo veinte rutas del trabajo incluidas.
Este registro de entrega actualiza únicamente documentación. Siguiente paso:
revisión humana de la PR y de sus comprobaciones CI. No fusionar ni desplegar.

## Auditoría de serialización — fase 3, 9 de noviembre de 2026

El desarrollador autoriza seguir con fase 3 en `feature/serialization-audit`.
La suite completa repetida con uv, dotenv desactivado, SQLite en memoria, JWT
sintético y demo desactivada termina con 137 pruebas y once subtests aprobados,
seis omisiones de plataforma y tres avisos de deprecación, en 39,45 s. Los seis
casos omitidos pertenecen a scripts/test_deployment.py y requieren Linux/Bash/flock;
Docker local no tiene daemon disponible, por lo que no se presentan como probados.
Los 17 tests, lint y build de backoffice de fase 2 siguen vigentes sin cambios UI.

Verificación interactiva asistida en Swagger real `/docs` con Chrome headless y
perfil temporal mediante CDP, usando Try it out, Execute y el diálogo Authorize:
POST /users devuelve 201, sin email/password/hash ni profile.user_id;
POST /auth/login devuelve 200 con solo access_token y token_type bearer;
GET /auth/me devuelve 200 con email propio y perfil acotado, sin campos internos.
Se contrastan campos requeridos y permitidos contra el OpenAPI de la API aislada.
Se usa TinyDB temporal, inventario en memoria, seeds y dotenv desactivados, sin
gateway ni correo. No se copian JWT ni contraseñas a evidencia versionada.
Se cierran los procesos temporales de API y navegador tras la comprobación.

Auditoría final con clasificaciones originales preservadas, contrato aplicado y
estado final en las 33 operaciones; CSV mantiene su excepción de transporte.
Se registran los resultados interactivos y las limitaciones de plataforma.
Validaciones finales: 40 comprobaciones AI y siete pruebas aprobadas;
`git diff --check` limpio. Revisión del diff y archivos nuevos sin secretos ni
datos personales nuevos. Main remoto sigue en `91350ab3`, sin cambios de base.
Procesos de prueba cerrados; perfil Chrome y almacenamiento sintético exclusivos
de fase 3 eliminados tras verificar su ruta dentro del workspace.
Siguiente paso de entrega: comprobaciones documentales finales, revisión de
secretos/diff, commit de rutas explícitas, push y PR contra main con el título
exacto del reto y enlace a AGENTS.md. No fusionar ni desplegar. Los archivos
ajenos de `.tmp/` y `.vscode/` quedan fuera de la entrega.

## Auditoría de serialización — fase 2, 9 de noviembre de 2026

El desarrollador autoriza comenzar fase 2 en `feature/serialization-audit`.
Se implementan contratos explícitos para las 33 operaciones (32 JSON, una CSV
con response_model=None y esquema text/csv en OpenAPI). Registro sin email,
perfil acotado sin user_id, email propio en `/auth/me`, usuarios planos,
proveedores reducidos en listado y SKUReference id/name/sku en movimientos.
Se conserva user_uuid para atribución operativa. Entradas y salidas separadas;
RAG rechaza extras. Se tipan análisis CSV, desgloses, satisfacción y fuentes RAG,
y se documentan errores sin alterar su forma. Perfil ausente en PUT devuelve 404.

Se retiran del listado de movimientos las dos consultas agregadas de stock
innecesarias con la proyección nueva, conservando cálculo de productos y rechazo
de salidas sin stock. Se ajustan los tipos de proveedores y movimientos del
backoffice. Sin dependencias, migraciones, zonas protegidas ni datos reales.

Nueva suite HTTP con veinte casos parametrizados y TestClient: filtrado de
campos internos, auth pública sin email/hash, cuenta propia, listados y CRUD,
SKU proyectado, errores, CSV, abstención RAG, rechazo de campos no escribibles
y esquemas OpenAPI para las 33 operaciones. El test existente de movimientos
comprueba proyección y stock de dominio, en lugar del stock anidado retirado.

Validaciones: suite completa `uv run --frozen pytest -q -p no:cacheprovider
--basetemp .tmp/serialization-phase2-full`, con dotenv desactivado, SQLite en
memoria, JWT sintético y demo desactivada: 137 pruebas y once subtests aprobados,
seis pruebas Linux omitidas en Windows y tres avisos de deprecación existentes.
uv se ejecuta fuera del sandbox con autorización. Tests del backoffice: 17
aprobados; lint y build aprobados, persiste aviso previo de múltiples lockfiles.
Inspección estática: 33/33 decoradores con response_model explícito.

Validación documental con skill validate-ai-setup: 40 comprobaciones y siete
pruebas aprobadas. Revisión del diff y archivos nuevos sin secretos ni datos
personales nuevos; `git diff --check` limpio.

Auditoría actualizada con estado original preservado, contrato final por operación
y evidencia automática; fase 3 y pruebas manuales de `/docs` pendientes. No se
marca todo el inventario como completado ni se afirma mejora de latencia medida.
Siguiente paso: revisión humana de fase 2 antes de comenzar fase 3. Sin commit,
push, PR, merge ni despliegue. Archivos ajenos de `.tmp/` y `.vscode/` intactos.

## Auditoría de serialización — fase 1, 9 de noviembre de 2026

Por solicitud del desarrollador se actualiza `origin/main` y se crea `main` local
con seguimiento, seguido de `feature/serialization-audit` desde `91350ab3`.
GitHub confirma el merge RAG por PR #32; la referencia local previa estaba
desactualizada. Fetch y creación de ramas requieren ejecución autorizada fuera
del sandbox, completada correctamente. Los archivos ajenos de `.tmp/` y `.vscode/`
permanecen fuera del trabajo; no se cambia `.gitignore`.

Creado `docs/serialization-audit.md`: 33 operaciones de negocio con ruta, método,
propósito, entrada, respuesta y modelo originales, clasificación y propuesta.
Diez ya serializadas, cuatro parciales y diecinueve sin contrato explícito,
incluida descarga CSV. Comparación estática AST contra el documento: 33/33,
sin omisiones ni operaciones adicionales. Se registran aparte cuatro rutas
automáticas de documentación/OpenAPI. Hallazgos: email en registro público,
perfiles TinyDB sin whitelist, listados sobredimensionados y proyección SKU;
JWT público de login y UUID del operario se conservan con justificación.

Solo cambios documentales; sin implementación, arranque API, bases de datos,
correo, gateway, secretos ni infraestructura. Se corrige la afirmación obsoleta
de merge RAG pendiente en projectbrief; no se afirma configuración o despliegue
verificados en VPS. Se mantiene la discrepancia del nombre del CEO del briefing.

Validaciones de fase 1: 40 comprobaciones de `npm run validate:ai-setup` y siete
pruebas de `npm run test:ai-setup` aprobadas; `git diff --check` limpio. Revisión
de los cambios documentales sin secretos ni datos personales nuevos. No se
ejecutan tests del backend ni builds de interfaces al no modificar código.

Siguiente paso: revisión humana de fase 1 antes de implementar fase 2; nueva
revisión al cerrar implementación y después fase 3 con tests y tres pruebas
manuales mediante `/docs`. Sin commit, push ni PR en esta revisión intermedia.

## Integración RAG en producción — 9 de noviembre de 2026

Implementada en `feature/rag-knowledge-base` por solicitud explícita del
desarrollador, incluyendo autorización para Dockerfile, Compose y workflow.
La API incorpora únicamente módulos RAG y corpus canónico; Qdrant `v1.15.3`
permanece privado con volumen propio. Se mantienen gateway, modelos, contratos,
autenticación, cachés y presupuestos de consulta existentes. No se lee ni cambia
el `.env` local ni se accede al VPS o a datos de producción.

Preparación idempotente mediante huella de corpus/procesamiento/gateway/modelo
de embeddings, colecciones nuevas y alias `trackflow_knowledge_prod`.
Se verifican UUID, payload, cantidad y dimensiones antes de publicar; los
índices previos e incompletos se conservan. El despliegue valida configuración
y cuenta activa, prepara el índice antes de detener la API (máximo 180 s),
guarda estado del alias, lo publica durante la pausa y exige consulta real
autenticada con fuentes a través de Next.js. Ante fallos posteriores restaura
alias e imágenes; si falla la restauración del alias mantiene la API detenida.
El comando destructivo de desarrollo rechaza el alias de producción.

Validaciones realizadas: backend aislado con 116 pruebas y once subtests
aprobados, seis pruebas Linux omitidas en Windows y tres avisos de deprecación
existentes. Las once pruebas de verificación/despliegue/rollback pasan en Linux
con Docker simulado. Las doce pruebas de indexación de producción pasan tras
añadir el caso de cambio de corpus. Ambos Compose válidos usando entorno
ejemplo y JWT sintético; sintaxis Bash aprobada. Tres imágenes de producción
construidas. Smoke completo con Qdrant real y gateway sintético: indexación,
reutilización y consulta autenticada con fuentes antes y después de reiniciar
Qdrant aprobadas; sus contenedores y volúmenes exclusivos se eliminan al terminar.
El primer smoke falló por codificación del stdin en Windows; se fija UTF-8 y
la repetición verifica el flujo completo. Validación AI: 40 comprobaciones y
siete pruebas aprobadas. Revisión del diff sin secretos nuevos y whitespace limpio.

Limitaciones conservadas: aviso cliente Qdrant `1.20.0`/servidor `1.15.3`,
compatibilidad funcional comprobada por smoke; Recall@3 histórico 70% frente
al objetivo 80%, sin nueva evaluación ni afirmación de mejora; los builds de
interfaces avisan de vulnerabilidades existentes (backoffice: dos altas y una
crítica; tracker: una moderada, cuatro altas y una crítica). No se actualizan
dependencias en esta integración.

Siguiente paso: finalizar revisión y comprobaciones de entrega, publicar rama
y PR hacia `main` con enlace a AGENTS.md y resultados. Antes del merge, el
responsable debe configurar las cuatro variables privadas LiteLLM/modelos en
el VPS y disponer de una cuenta activa. No se fusiona ni despliega esta entrega.

## Commit local de optimización RAG — 8 de noviembre de 2026

El desarrollador confirma que sus pruebas muestran una mejora y solicita un
commit en la rama actual `feature/rag-knowledge-base`. Se incluyen transporte
cancelable, límites, cachés, pruebas, dependencia HTTPX y documentación/mediciones
de esta tarea. Se excluyen `.tmp/` y `.vscode/`; no se modifican zonas protegidas.
Esta autorización es para el commit local; no se hace push, PR ni despliegue.
Validaciones repetidas antes del commit: 40 comprobaciones AI y siete pruebas
aprobadas; backend aislado con 103 pruebas y siete subtests aprobados, tres
pruebas omitidas y tres avisos de deprecación existentes. `git diff --check`
limpio; revisión del diff sin secretos ni datos personales nuevos. No se repiten
comprobaciones de interfaces sin cambios, consultas remotas, indexación ni
nuevas pruebas manuales contra el gateway.
La limitación conocida del proveedor y los cuatro timeouts de la medición se
conservan en el informe; la confirmación manual no sustituye esos resultados.
Siguiente paso: conservar seguimiento de latencia y preparar una futura entrega
cuando el desarrollador la solicite.

## Límites y cachés RAG implementados — 8 de noviembre de 2026

Se mantienen los modelos asignados y el mismo gateway/entorno. El pipeline usa
HTTPX asíncrono OpenAI-compatible sin el SDK LiteLLM para evitar sus reintentos
implícitos; se declara HTTPX directamente y se sincronizan lockfile/requirements
sin actualizar versiones. Presupuesto por consulta 30 s; embedding 10 s,
Qdrant 5 s y generación 20 s reducidos al restante, con cancelación del transporte.
El endpoint sigue síncrono y responde 503 con mensaje de timeout accionable.
Los lotes de indexación conservan 45 s. No se cambia el prompt ni la generación.

Cachés en memoria por proceso, 256 entradas cada una: embeddings de preguntas
15 minutos y respuestas 5 minutos. La respuesta incluye en su clave pregunta,
contexto efectivo del índice, prompt y configuración. Se consulta Qdrant cada
vez para detectar cambios del contenido indexado. No se cachean fallos, vacíos
ni truncamientos; la indexación local limpia las cachés. No se consolidan llamadas
simultáneas ni se comparte caché entre procesos.

La revisión automática bloqueó inicialmente consultas remotas por el envío del
corpus al gateway. El desarrollador autorizó explícitamente seis consultas con
las preguntas y fragmentos existentes. Resultado: dos respuestas (3,00 y 10,76 s)
y cuatro cancelaciones de embedding a 10,01 s. El límite está verificado, pero
es restrictivo para el proveedor actual. No hubo aciertos de caché remotos en
esa tanda: los primeros cuatro intentos fallaron. La caché repetida se valida
localmente contando llamadas, sin afirmar una latencia remota no medida.

Validación final de backend aislado: 103 pruebas y siete subtests aprobados,
tres pruebas omitidas y tres avisos de deprecación existentes. Se prueban cierre
de socket local por cancelación, un único intento HTTP ante errores, presupuesto
compartido, TTL/capacidad/invalidación, orden de embeddings y HTTP 503. Una
ejecución intermedia encontró que la carga de certificados en Windows agotaba
el plazo breve del test antes de enviar datos; se prepara ese transporte antes
del plazo de prueba y la suite completa posterior pasa.

API de desarrollo reiniciada sin reindexar ni borrar volúmenes; salud HTTP 200.
Se actualizan diseño RAG, guía Docker e informe de latencia. No se modifican
`.env`, modelos, infraestructura ni datos del corpus. Sin commit ni push.
Siguiente paso: contrastar timeouts con disponibilidad del proveedor; medir
aciertos reales de caché cuando haya respuestas iniciales y repetir evaluación
de recuperación antes de la entrega futura. Validaciones AI tras actualizar el
banco: 40 comprobaciones y siete pruebas aprobadas; `git diff --check` limpio.

## Medición de latencia RAG — 8 de noviembre de 2026

Diez consultas reales secuenciales desde el contenedor API, sin reindexar ni
modificar datos: mediana total 5,51 s, rango 1,57–92,96 s. Embedding 0,41–78,22 s,
Qdrant 4–8 ms y generación 0,80–14,73 s. Las pilas de una consulta lenta muestran
espera HTTP/TLS de respuesta remota; el pico también aparece en una segunda
consulta, por lo que no se explica únicamente por arranque. No se mide aquí
navegador, autenticación o proxy ni se evalúa calidad de respuesta.

El adaptador instalado usa `max_retries` y un fallback a dos reintentos; el
`num_retries=0` del pipeline no garantiza desactivar esa capa. Los 45 s efectivos
del transporte se comprobaron en una consulta rápida, pero no son un límite total.
No se contaron los intentos HTTP de los picos; su causa interna en gateway/red/
proveedor sigue pendiente. Se propone presupuesto total con cancelación real,
verificar reintentos, investigar proveedor, caché versionada y menor razonamiento.
Informe y reproducción: `docs/rag/latency-2026-11-08.md`,
script `scripts/benchmark_rag.py`. No se aplican optimizaciones funcionales.

Validación: ejecución real del script y ayuda aprobadas; 40 comprobaciones AI y
siete pruebas aprobadas tras actualizar memoria; `git diff --check` limpio.
La primera repetición de tests falló porque su fixture no copia el nuevo informe
enlazado desde memoria; se usa su ruta en texto y la repetición pasa.
No se repiten suites de aplicación sin cambios. Sin commit ni push.
Contradicción documental pendiente: projectbrief y los siguientes pasos históricos
todavía describen RAG como futuro, aunque el pipeline y estas consultas lo prueban.

## Commit local de correcciones RAG — 8 de noviembre de 2026

El desarrollador autoriza únicamente un commit en `feature/rag-knowledge-base`,
sin push, PR ni despliegue. Se incluyen las correcciones de proveedor y timeouts,
documentación de arranque, ejemplo de entorno y validador independiente de rama.
Se excluyen `.tmp/` y `.vscode/`; no se modifican secretos ni datos persistentes.
La integración RAG de producción sigue pendiente: Qdrant persistente sin puertos
públicos, conexión de la API, pipeline y corpus en la imagen, variables privadas
del VPS e indexación inicial. No se modifica infraestructura en esta entrega.

Validaciones repetidas antes del commit: 40 comprobaciones AI y siete pruebas
aprobadas; backend aislado con 92 pruebas y siete subtests aprobados, tres pruebas
omitidas y tres avisos de deprecación; backoffice con 17 pruebas, lint y build
aprobados. Persiste el aviso de múltiples lockfiles. En Windows se usa `npm.cmd`
porque PowerShell bloquea `npm.ps1`; uv requiere ejecución autorizada fuera del
sandbox. No se repiten consultas remotas, indexación ni builds de contenedores.
Siguiente paso: preparar la integración de producción en un trabajo posterior.

## Documentación Docker y ejemplo de entorno RAG — 8 de noviembre de 2026

Revisados README español/inglés, guía Docker y `.env.example` contra Compose y
el pipeline. Faltaban las cuatro variables LiteLLM/modelos en el ejemplo y el
paso de indexación en las guías de arranque. Se añaden campos vacíos sin secretos,
aliases a completar por el desarrollador, indexación inicial, persistencia del
índice, acceso autenticado al asistente y comandos de parada/reanudación.
Se consolidan las dos secciones Docker duplicadas en cada README, conservando
sus instrucciones en una única sección. La guía distingue desarrollo de producción,
explica recarga del pipeline/entorno y registra el aviso Qdrant pendiente.
No se modifica `.env`, Compose ni datos; el proyecto permanece detenido.
Validaciones: 40 comprobaciones estructurales y siete pruebas aprobadas;
`git diff --check` limpio. Compose acepta `.env.example` con un JWT sintético
proporcionado solo al proceso de validación, sin arrancar contenedores. No se
validan credenciales ni aliases remotos: el ejemplo los deja vacíos deliberadamente.
Siguiente paso: completar los valores privados al instalar y seguir la guía;
la sesión actual ya había verificado indexación y consulta real. Sin commit.

## Margen de espera para consultas RAG — 8 de noviembre de 2026

El desarrollador volvió a observar el error genérico y confirmó que una consulta
de devoluciones terminó funcionando tras más de treinta segundos. El proxy de
Next instalado limita por defecto las peticiones a 30 segundos; sus logs muestran
`socket hang up`/`ECONNRESET`. Se configura `experimental.proxyTimeout=120000` en
backoffice y cada llamada LiteLLM del pipeline usa timeout de 45 segundos sin
reintentos automáticos. Así el proxy dispone de margen para embeddings y generación
y el proveedor tiene esperas acotadas. Reiniciados API e interfaces conservando datos.

Pruebas reales autenticadas a través del backoffice: pregunta de ventana estándar
de devolución HTTP 200 en 15,0 segundos, pregunta de cobertura rural HTTP 200 en
1,2 segundos; ambas con respuesta y fuentes. No se simuló una respuesta de más de
30 segundos en esta verificación. Quince pruebas de pipeline/endpoint y diecisiete
del backoffice aprobadas; lint, build de backoffice y `git diff --check` aprobados.
Persisten avisos existentes de deprecación, múltiples lockfiles y versiones Qdrant.
Siguiente paso: continuar optimización de latencia y recuperación; sin commit.

## Consulta RAG por backoffice verificada — 8 de noviembre de 2026

El desarrollador confirmó indexación de cuatro documentos y veinte chunks.
La consulta desde la UI fallaba con mensaje genérico; los logs del proxy Next
mostraban `ECONNRESET` y HTTP 500. El pipeline ejecutado directamente en el
contenedor respondió en 10,8 segundos. Se retiró del endpoint la instalación
del adaptador global LiteLLM: la configuración del proveedor ya reside en el
pipeline, tanto para CLI como para API. Se reinició únicamente la API para
cargar el código actual y descartar peticiones bloqueadas; no se reindexó ni
se eliminaron volúmenes. No se aisló si el reinicio por sí solo habría bastado.

Verificación real autenticada usando la cuenta demo local, a través de
`http://uis:3001/backend/api/rag/query`: HTTP 200 en 18,4 segundos, respuesta
generada, tres fragmentos recuperados y dos fuentes. Quince pruebas aisladas
del endpoint y pipeline aprobadas; tres avisos de deprecación existentes.
El aviso de versiones de Qdrant sigue pendiente, pero no impide esta consulta.
Sin cambios de timeout ni cambios en el backoffice. Corrección sin commit.

## Corrección de indexación RAG por CLI — 8 de noviembre de 2026

La salida Docker aportada por el desarrollador confirma build del website y
arranque de los cuatro servicios, con API y Qdrant saludables. La indexación
falló porque el CLI no inicializaba el adaptador LiteLLM del endpoint: el alias
del modelo no incluía un proveedor reconocido. El pipeline ahora especifica
el proveedor OpenAI-compatible y retira el prefijo opcional `litellm/` en las
llamadas de embeddings y generación, también fuera de FastAPI. No se toca `.env`.

Pruebas aisladas del pipeline: 12 aprobadas, incluidos aliases con/sin prefijo
y configuración del proveedor en generación. Validador AI y sus siete pruebas
aprobados; `git diff --check` limpio. No se repite indexación real ni se valida
una respuesta del proveedor remoto en esta corrección. Persiste el aviso de
versiones Qdrant (cliente 1.20.0, servidor 1.15.3); no fue la causa del fallo
mostrado y su alineación queda pendiente. Siguiente paso: repetir el comando
de indexación en el contenedor y probar una consulta autenticada. Sin commit.

## Validador independiente de la rama — 8 de noviembre de 2026

Se retira la exigencia histórica de `feature/agent-memory-bank` a petición del
desarrollador. AGENTS.md, techContext y la skill indican ahora usar la rama
acordada para cada trabajo. El validador no consulta Git; `--check-branch` sigue
aceptándose sin efecto para conservar comandos existentes. Las referencias de
entregas anteriores en este registro se mantienen como historial.

Validación normal y con la opción heredada: 40 comprobaciones aprobadas.
Siete pruebas aprobadas, incluyendo ramas main/RAG/otra, checkout detached,
directorio sin Git y detección de errores estructurales con la opción heredada.
`git diff --check` aprobado. Cambios sin commit ni push; los README y archivos
locales del desarrollador quedan fuera de esta corrección. Siguiente paso:
continuar la optimización RAG en la rama actual.

## Integración de main en la rama RAG — 8 de noviembre de 2026

A petición del desarrollador se integra `origin/main` (`1717ccc`) en
`feature/rag-knowledge-base`, conservando el RAG de `5e71bb0` y la migración
del website a Next.js. Merge automático sin conflictos; Compose conserva Qdrant
y usa la imagen del website migrado. Backend, pipelines y backoffice permanecen
sin cambios respecto de la rama RAG. No se modifica `.env` ni datos persistentes.

Validaciones de esta integración: build/export del website, copy español,
validador estructural (40 comprobaciones), siete pruebas del validador y ambos
Compose con `config --quiet` aprobados. Docker muestra avisos de acceso a su
configuración local; no se construyen imágenes ni se ejecuta el stack completo.
`--check-branch` falla únicamente porque exige la antigua rama
`feature/agent-memory-bank`; se conserva la rama RAG solicitada. No se repiten
las suites de backend/backoffice sin cambios. Revisión del diff sin secretos ni
datos personales nuevos; comprobaciones de whitespace aprobadas.

Los cambios locales de ambos README se guardan temporalmente para el merge y
se restauran después; los archivos locales no seguidos quedan fuera del commit.
Siguiente paso: optimizar la recuperación RAG y repetir su evaluación antes de
preparar la futura PR hacia main. Esta integración es local, sin push ni despliegue.

## Hito RAG comercial — 29 de octubre de 2026

Implementado el pipeline RAG con `setup`, `embed`, `retrieve`, `generate_answer` y `query`, endpoint FastAPI autenticado y UI de consulta para account managers. Qdrant se añade al Compose de desarrollo. En este Codespace, el bridge de Docker no resuelve DNS externo; el override `docker-compose.rag-host.yml` usa la red del host para la API, conserva Qdrant solo en loopback y se documenta como solución de desarrollo local.

La configuración LiteLLM consume las variables del `.env` raíz. El adaptador API elimina el prefijo `litellm/` de los aliases autorizados y fija el provider OpenAI-compatible. Prueba real desde el contenedor: login HTTP 200, `POST /api/rag/query` HTTP 200, respuesta generada y dos fuentes. No se modificó `.env`.

Validaciones: backend 93 passed, 9 subtests; backoffice 17 tests, lint y build aprobados; validador AI 35 checks y 7 tests aprobados; ambos Compose válidos; `git diff --check` limpio. Evaluación del corpus: Recall@3 = 70%, por debajo del umbral requerido de 80%; no marcar el KPI como aprobado. Siguiente paso: mejorar chunking/recuperación y repetir la evaluación con el modelo y umbral calibrados.

## Estado base
Existen landing pública, backoffice de incidencias e inventario, autenticación,
tracker de contratación, pruebas y despliegue Docker/CI. Sus capacidades se
describen en [README](../README.md) y [TESTING](../TESTING.md).

## Hito AI-ready — 27 de octubre de 2026
Implementados: banco de memoria, protocolo AGENTS.md, regla de arquitectura,
skill verificable y migración de interfaces a rutas canónicas. Se incorpora el
briefing local y se preservan los contratos y puertos de las aplicaciones.

Validaciones realizadas:
- Validador: 35 comprobaciones aprobadas, incluyendo rama de entrega; 7 pruebas del validador aprobadas.
- `quick_validate.py` de skill-creator: skill válida.
- `npm run build:landing`: texto español, Tailwind y optimización sharp aprobados.
- Smoke HTTP estático: `/`, `/application.html`, `/i18n.js`, `/validation.js`, CSS, logo y hero WebP devuelven 200 con contenido.
- Backend con configuración aislada: 76 passed, 3 skipped, 7 subtests passed. El primer intento encontró permisos inválidos en el temporal compartido de pytest; el reintento con `--basetemp` nuevo pasó. Persisten tres avisos de deprecación de FastAPI/Starlette.
- Ambos Compose: `config --quiet` aprobado. Build y smoke de contenedores bloqueados localmente: Docker Desktop no expone el pipe `dockerDesktopLinuxEngine` tras el intento de inicio. No se modificaron datos de producción.
- Backoffice: 4 suites y 15 pruebas aprobadas, lint y build Next.js aprobados. Tracker: lint y build Next.js aprobados. Las APIs reales de TypeScript y ESLint confirman la exclusión del tracker en el padre (33 archivos propios de TypeScript).
- Los primeros intentos locales encontraron ejecutables ausentes/permisos del sandbox e instalaciones concurrentes; se detuvieron y se completaron instalaciones limpias antes de obtener los resultados anteriores.
- [CI del commit inicial](https://github.com/4GeeksAcademy/maxifer-TrackFlow/actions/runs/40596259118): jobs `tests` e `images` aprobados. Construcción de las tres imágenes y smoke tests de producción con datos aislados aprobados; `deploy` omitido por tratarse de una PR. Esto verifica contenedores pese al bloqueo del Docker local.

En Windows, si el temporal compartido de pytest presenta permisos inválidos, usar
`--basetemp .tmp/pytest-ai-<identificador-nuevo>` con una ruta nueva por ejecución,
`PYTHON_DOTENV_DISABLED=1`, `DEMO_DATA_ENABLED=false` y `DATABASE_URL=sqlite://`.
No reutilizar un temporal que contenga datos de otra ejecución.

## Siguientes pasos
1. Revisar la PR y sus comprobaciones automáticas tras cada nueva subida; no fusionar ni desplegar en este hito.
2. Mantener banco, reglas y skill sincronizados con futuros cambios de arquitectura.
3. Aclarar el nombre contradictorio del CEO en el briefing con el responsable.
4. Priorizar integraciones de tracking, devoluciones y soporte descritas en el briefing en hitos futuros; no considerarlas ya implementadas.

## Entrega
Commit inicial `72341e7` publicado en `feature/agent-memory-bank` y
[PR #27](https://github.com/4GeeksAcademy/maxifer-TrackFlow/pull/27) abierta hacia main,
con enlace directo a AGENTS.md. CI inicial aprobada; cada subida vuelve a validarse. La integración Netlify detectada
al abrir la PR requiere publicar `uis/website`; se incorpora `netlify.toml` para
alinear el hosting estático. No se fusionó la PR ni se ejecutó un despliegue manual.

## Migración del website a Next.js — 31 de octubre de 2026

Implementado en `feature/website-nextjs-migration`, rama nueva basada en
`feature/agent-memory-bank` a petición del desarrollador. El website se construye
con Next.js 16.4.3 y se exporta de forma estática dentro de `uis/website`.
El contenido y estilos están en componentes React/CSS de `app/`; Next genera
las rutas estáticas `/`, `/index.html` y `/application.html`. Los HTML fuente y
los endpoints públicos de scripts fueron retirados. Idioma, navegación y
formulario se cargan como módulos cliente después de montar el contenido React.
Las imágenes se preparan en `public/` durante los comandos Next.

Netlify publica `uis/website/out`; el contenedor landing genera el mismo export
y Nginx lo sirve en el puerto existente. Se quitaron los bind mounts de HTML y
assets en Compose de desarrollo porque ya no son los archivos servidos por el
contenedor.
La lectura de la guía local de Next.js fue denegada por la política de exclusión
de contenido; no se intentó acceder a ella por otra vía.

Verificación realizada:
- `npm run build:landing`: copy español y build/export de Next aprobados.
- `npm audit --prefix uis/website --omit=dev`: cero vulnerabilidades conocidas.
- Smoke HTTP al export: páginas, scripts y assets principales devolvieron 200.
- `docker compose build landing`: imagen construida. Smoke test con contenedor
  aislado y puerto temporal: `/`, `/index.html`, `/application.html`, ambos
  scripts y los assets logo/hero devolvieron HTTP 200; el contenedor temporal se
  detuvo y eliminó al terminar. No se levantó Compose completo ni se tocaron
  volúmenes o datos.
- El contexto de Docker excluyó el lockfile del website; debido a la política de
  acceso al archivo, la imagen instala dependencias desde `package.json` con
  `npm install --package-lock=false`, en vez de instalación reproducible con
  `npm ci`.
- Revisión correctiva en navegador sobre la imagen previa: el cambio de idioma
  dejaba las tarjetas de servicios en español y las selecciones del paso 2 no
  habilitaban «Siguiente». Se corrigió el selector de tarjetas y se procesa el
  evento `change` del formulario; las etiquetas accesibles del stepper también
  se actualizan con el idioma.
- `npm run build:landing` pasó después de retirar `index.html` y
  `application.html`; el export sigue produciendo las rutas `.html` requeridas.
- `docker compose config --quiet` y `docker compose build landing` pasaron con
  el Dockerfile sin copiar HTML ni scripts antiguos.
- `npm run validate:ai-setup` y `npm run test:ai-setup`: aprobados tras actualizar
  el validador para requerir entradas App Router y rechazar las fuentes antiguas.
- La prueba de navegador posterior al cambio quedó bloqueada: la política de
  contenido denegó el ejecutable local de Next.js al intentar iniciar el servidor
  de desarrollo. No se intentó leer el export restringido por otra vía.
- `git diff --check`: aprobado. No se ejecutó el modo `--check-branch`, porque
  exige `feature/agent-memory-bank` y el desarrollador pidió esta rama nueva.

## URLs sin extensión del website — 31 de octubre de 2026

A petición del desarrollador, se sustituye la conservación de URLs `.html`
documentada en la migración anterior: la navegación y las URLs canónicas ahora
usan `/` y `/application/`. `trailingSlash: true` genera el formulario como
`out/application/index.html`. Se ajustan datos estructurados, selectores de
idioma y rutas de imágenes a las nuevas direcciones.

Nginx y Netlify tienen redirecciones 301 para `/index.html` y
`/application.html`; Nginx también normaliza `/application/index.html`.
Las redirecciones Nginx conservan parámetros y usan destinos relativos para
respetar el puerto publicado por Docker. El smoke de despliegue incluye la ruta
nueva del formulario y mantiene las antiguas para comprobar compatibilidad.

Verificación realizada:
- `npm run build:landing`: copy español, TypeScript y export de Next aprobados.
- `npm run validate:ai-setup` y `npm run test:ai-setup`: aprobados, siete pruebas.
  El primer intento encontró EPERM del sandbox; el reintento autorizado pasó.
- `docker compose config --quiet`, build de landing y `nginx -t`: aprobados.
- HTTP en contenedor temporal aislado: páginas nuevas, logo, hero y assets
  referenciados por ambas páginas devuelven 200. No hay enlaces de navegación
  `.html` en el HTML generado y ambas páginas tienen su canonical nuevo.
  Las URLs antiguas, `/application` y `/application/index.html` devuelven 301
  hacia los destinos correctos, sin bucles; los parámetros `?lang=en` se
  conservan. Una ruta inexistente devuelve 404.
- No se verificaron las redirecciones en un hosting Netlify publicado ni se
  ejecutó una prueba de interacción en navegador.
- Contenedor temporal detenido y eliminado automáticamente; landing local
  iniciada con la imagen nueva mediante `docker compose up -d --no-deps landing`.
  Acceso HTTP en puerto 3000 aprobado para ambas páginas y URLs antiguas.
- No se crea commit ni PR en esta corrección; se mantiene la rama existente
  `feature/website-nextjs-migration`, con los cambios previos del desarrollador.

## Preparación de entrega de la migración — 31 de octubre de 2026

El desarrollador confirmó que probó el proyecto y funciona correctamente, y
autorizó commit, push y PR hacia `main`. Se mantiene
`feature/website-nextjs-migration`; las referencias remotas actualizadas no
muestran commits de esta rama pendientes respecto de `origin/main` antes de
incorporar la migración. Se revisa únicamente el conjunto de cambios del website,
su integración Docker/Netlify, documentación y validador. No se incluyen secretos,
datos persistentes ni cambios del backend o las interfaces internas.

Comprobaciones previas al commit:
- `npm run build:landing`: aprobado, incluidas comprobación de copy,
  compilación, TypeScript y exportación estática.
- `npm run validate:ai-setup`: aprobado; `npm run test:ai-setup`: siete pruebas
  aprobadas.
- La invocación npm con `-- --check-branch` no transmitió la opción en este
  entorno. La ejecución directa de `node .../validate.mjs --root . --check-branch`
  confirmó un único fallo: exige `feature/agent-memory-bank`. Se documenta la
  excepción porque la rama nueva fue solicitada para esta migración; no se
  cambia de rama ni se presenta esta comprobación como aprobada.
- Ambos Compose (`docker-compose.yml` y `docker-compose.prod.yml`) pasan
  `config --quiet`. El build Docker, `nginx -t` y smoke HTTP del website ya
  aprobados en esta sesión siguen siendo aplicables; no se modificó su código.
- El desarrollador validó manualmente el proyecto tras la corrección de rutas.
  No se repiten las suites de backend/backoffice/tracker sin cambios; sus
  comprobaciones automáticas y smoke del stack completo quedan a cargo de CI.
- Próximo paso: publicar la rama y abrir PR a `main`, adjuntando resultados y
  el enlace a AGENTS.md. No fusionar ni desplegar; el proyecto local fue detenido
  a petición del desarrollador.
