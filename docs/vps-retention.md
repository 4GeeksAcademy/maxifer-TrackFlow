# Retención de imágenes y mantenimiento del VPS

La política conserva la versión activa y dos versiones anteriores completas
verificadas. Además protege imágenes de cualquier contenedor (también detenido)
y la original del tracker, identificada por `trackflow-uis:before-tracker-env-*`.
La protección se aplica al ID: varias etiquetas no equivalen a varias copias.

`scripts/deploy.sh` registra los cuatro IDs realmente activos en
`retention-history.json` después de superar salud, preservación de datos y RAG.
El historial se escribe atómicamente bajo el bloqueo de despliegue. Hasta reunir
tres versiones distintas verificadas con esta política, no elimina imágenes.
No importa registros antiguos suponiendo que un intento de despliegue fue exitoso.
Durante ese arranque puede hacer falta margen adicional de disco; el control de
espacio puede detener un despliegue antes de reunir las tres versiones.

Solo elimina etiquetas `ghcr.io/<organización>/<proyecto>/{landing,uis,services}:<SHA de 40 caracteres>`
del prefijo indicado, aliases `trackflow-rollback-*` de archivos reconocidos y
correcciones `trackflow-uis:tracker-env-*` identificadas en estados de mantenimiento,
si sus IDs ya no están protegidos. Comunica el plan antes de usar
`docker image rm` por referencia, sin `--force`. Revalida ID y uso antes de cada
eliminación. No usa prune ni elimina cachés, archivos de Docker, volúmenes o backups.
Imágenes retenidas ausentes, historial inválido, formatos de rollback desconocidos
o servicios no saludables impiden la limpieza.

Los archivos de rollback dejan de ser protecciones permanentes. Se comparan los
tres IDs de aplicación de cada archivo con las versiones retenidas. Si coinciden
con una versión completa, su estado es `retained`; en caso contrario es `expired`,
incluidas referencias que ya faltaban. El formato admitido es el generado por
`deploy.sh`; un archivo distinto bloquea la limpieza para evitar interpretaciones.

Antes de borrar referencias se publica atómicamente `retention-status.json`, fuera
de los backups, con el estado de cada rollback y el plan de eliminación. Los
archivos de configuración, respaldos de datos y estados de mantenimiento originales
no se modifican. **Consultar ese registro antes de restaurar:** `expired` significa
fuera de la ventana de restauración, aunque alguna imagen siga compartida o una
eliminación haya fallado. El registro es informativo; no intercepta comandos Docker
manuales. Un reintento vuelve a calcular inventario y ventana.

La excepción original del tracker no caduca automáticamente. Los contenedores
detenidos y etiquetas ajenas también pueden retener capas; no hay un techo absoluto
de disco. La caducidad limita las versiones de despliegue gestionadas, no los
respaldos de datos, cachés, imágenes ajenas o volúmenes.

## Simulación y espacio

Con un directorio de aplicación y release ya preparados, añadir un quinto argumento:

```sh
bash scripts/deploy.sh /opt/trackflow "$COMMIT" \
  ghcr.io/4geeksacademy/maxifer-trackflow "$REGISTRY_USER" --dry-run
bash scripts/deploy.sh /opt/trackflow "$COMMIT" \
  ghcr.io/4geeksacademy/maxifer-trackflow "$REGISTRY_USER" --retention-dry-run
```

`--dry-run` comprueba argumentos, archivos requeridos y espacio; describe los pasos
sin login, descarga ni despliegue. No certifica la validez de la configuración,
disponibilidad del registro ni salud futura. `--retention-dry-run` consulta salud,
historial e inventario y muestra referencias candidatas y rollbacks que caducarían,
sin escribir el registro de estado ni eliminarlas. Ambos
toman el bloqueo `.deploy.lock`; no requieren token en stdin.

El despliegue exige como mínimo 2 GiB disponibles antes del login y después del
pull, antes de preparar RAG o detener la API. `TRACKFLOW_MIN_FREE_BYTES` permite
aumentar el umbral (entero decimal, nunca inferior a 2147483648). El umbral es un
margen operativo, no una predicción del tamaño de descarga. Un fallo de retención
posterior al éxito se informa sin revertir los servicios saludables.

Compose de producción limita cada contenedor a tres archivos `json-file` de
10 MB. Solo entra en vigor cuando se recrean los contenedores en un despliegue
posterior autorizado; no rota los logs actuales por modificar este repositorio.

## Limpieza ejecutada el 10 de noviembre de 2026 (Uruguay)

Antes: 24.363.462.656 bytes usados, 1.440.813.056 disponibles, 95 %.
Después: 20.927.016.960 usados, 4.877.258.752 disponibles, 82 %.
Recuperados: **3.436.445.696 bytes (3,44 GB / 3,20 GiB)**, medidos con `df -B1`.

Se comprobaron procesos, ejecutables, cwd, mapas de memoria y descriptores antes
de retirar únicamente estas rutas explícitas:

- `/root/.vscode-server/cli/servers/Stable-261c84cb1eddf11235f9e2c921425e9663fbe556` (1.144.1).
- `/root/.vscode-server/cli/servers/Stable-a717861c07586a53d83b80d742cd3f59b20a6273` (1.145.0).
- `/root/.vscode-server/cli/servers/Stable-6bab64e2d12b04d04c0d99c27ff166023efd1dda` (1.145.1).
- `/root/.vscode-server/cli/servers/Stable-c4453f8ea430795f941c1b2ff6c9321135a74a02` (1.145.2).
- `/root/.npm/_cacache`.
- `/var/cache/apt/pkgcache.bin` y `/var/cache/apt/srcpkgcache.bin`.

Se conservó VS Code 1.145.3 (`Stable-dcd3ad6e368fbe19d03f37054a40dbaf40d676f4`),
sus procesos CLI, extensiones y configuración. No se tocaron archivos `.deb`,
logs, herramientas ajenas, backups ni volúmenes. Los hashes de `.env`, backups y
mantenimiento coinciden antes/después; los cuatro IDs de contenedor no cambiaron.

### Imágenes conservadas

| Versión | Landing | UIS | API |
| --- | --- | --- | --- |
| Activa: `dd1b99618189f5858113fa9e20c5fc18b6cf013f` con tracker corregido | `42c0752ba20e` | `33677808dcc1` | `121a54a32f70` |
| Anterior: `e005162b29360c72643677458d4168e9c8749efa` | `1b0523bc9472` | `14a7cbf8d126` | `370a56232781` |
| Anterior: `91350ab3b0f149d9cf5ddd0008337a566f7c3bcc` | `2acf3347d0b3` | `2bff2b15bb4b` | `0beefd36be98` |

Qdrant común: `qdrant/qdrant:v1.15.3`, ID `31407c0e8e32`.
UIS activa: `trackflow-uis:tracker-env-20261110t233827z-compact`.
Original del tracker: `7abc9ef884b8`, con etiquetas
`trackflow-uis:before-tracker-env-20261110t233154z` y
`trackflow-uis:before-tracker-env-20261110t233827z`, además de la etiqueta GHCR
`uis:dd1b99618189f5858113fa9e20c5fc18b6cf013f`.

Las dos versiones anteriores tienen sus imágenes disponibles, etiquetas de rollback
resolubles y registros JSON de verificación de sus despliegues exitosos. No se
arrancaron versiones antiguas contra datos reales ni se ensayó una restauración.
Sus archivos de rollback son los de los despliegues del 10 de noviembre a las
21:19:27 y 22:18:22 UTC, respectivamente para `91350ab` y `e005162`.

**No se eliminaron imágenes:** las antiguas adicionales estaban referenciadas por
rollback. Se mantienen las 17 imágenes y sus etiquetas; los 6,3 GB que Docker
anunciaba como recuperables no eran íntegramente eliminables bajo esta política.
Los rollbacks del 23 y 27 de octubre ya referenciaban seis etiquetas ausentes antes
de la limpieza. El estado de compactación también conserva una referencia a la
imagen intermedia retirada en la sesión anterior; la original sigue disponible.

Al finalizar, los cuatro servicios estaban `healthy`. HEAD público devolvió 200 en
`http://67.205.167.151/`, `http://67.205.167.151:3001/login` y
`http://67.205.167.151:3002/`, sin descargar cuerpos ni datos de candidatos.
La PR #36 estaba abierta y sin fusionar; el arreglo activo del VPS no implica que
esté incorporado en `main`. La automatización de esta entrega no se desplegó.

## Validación de la propuesta

- 27 pruebas Linux de despliegue y retención aprobadas, con Docker simulado y
  almacenamiento temporal; incluye fallos de salud, rollback, espacio insuficiente,
  historial inválido, IDs compartidos, caducidad de rollback, integridad de backups,
  simulación sin escritura, fallo/reintento de eliminación y exclusión de otros proyectos.
- Sintaxis Bash y ambos Compose válidos con entorno de ejemplo y valores sintéticos.
- Tres imágenes construidas; smoke local con Qdrant real y gateway sintético
  aprobado antes/después de reiniciar el Qdrant temporal. El proyecto exclusivo
  `trackflow-rag-ci-846bc35b9b0f`, sus contenedores y volúmenes se retiraron al acabar.
- `docker inspect` confirmó `max-size=10m` y `max-file=3` en los cuatro servicios
  temporales. Los servicios del VPS no se recrearon.
- 40 comprobaciones AI, siete pruebas del validador y `git diff --check` aprobados.

Persisten los avisos ya documentados de dependencias UI y de versiones Qdrant
cliente 1.20.0/servidor 1.15.3. No se modifican dependencias en esta entrega.
