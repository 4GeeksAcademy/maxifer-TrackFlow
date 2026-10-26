# Despliegue automático de TrackFlow

El workflow `.github/workflows/deploy.yml` comprueba las PR hacia `main` y
despliega únicamente los commits de `main`. La rama por defecto del repositorio
es `dev`, pero el disparador de producción sigue siendo `main`.

El disparador manual también está definido. GitHub exige que el archivo del
workflow exista en la rama por defecto para habilitar `workflow_dispatch`.
Mientras `dev` permanezca sin este archivo, usar la actualización de `main`
como disparador. Si en el futuro se habilita la ejecución manual, seleccionar
`main`; ejecutar otra rama solo valida y construye, sin desplegar.

Las pruebas se ejecutan en contenedores con Python 3.12 y Node 22. Incluyen
la API, la recuperación de datos, los controles de despliegue/rollback, los
tests del backoffice, el lint de talento y las comprobaciones de la landing.
Después se construyen las tres imágenes y se prueba el stack de producción
con almacenamiento SQLite aislado del VPS. Un fallo impide el despliegue.

## Configuración única en GitHub

En **Settings → Secrets and variables → Actions**, crear estos secretos:

| Secreto | Contenido |
| --- | --- |
| `VPS_SSH_PRIVATE_KEY` | Clave privada OpenSSH exclusiva para Actions, completa y sin passphrase |
| `VPS_SSH_KNOWN_HOSTS` | Clave pública del servidor obtenida de un `known_hosts` previamente verificado |

Crear estas variables en la pestaña **Variables**:

| Variable | Valor actual / comportamiento |
| --- | --- |
| `VPS_HOST` | `67.205.167.151` (obligatoria) |
| `VPS_USER` | `root` (valor por defecto) |
| `VPS_PORT` | `22` (valor por defecto) |
| `VPS_PATH` | `/opt/trackflow` (valor por defecto) |
| `NEXT_PUBLIC_API_URL` | Dejar vacía mientras talento no tenga API externa |

La clave pública correspondiente debe estar instalada en
`/root/.ssh/authorized_keys` del VPS. La conexión usa verificación estricta de
la identidad del servidor; el workflow no acepta automáticamente claves nuevas.

GitHub Actions debe estar habilitado y la organización debe permitir publicar
paquetes en GHCR desde este repositorio. El workflow publica con
`GITHUB_TOKEN` y permiso `packages: write`; el job de despliegue utiliza su
token temporal con `packages: read`. No se necesita un token personal para
este flujo. La primera publicación crea los paquetes; comprobar que siguen
vinculados al repositorio si se cambian sus permisos.

Los paquetes son:

```text
ghcr.io/4geeksacademy/maxifer-trackflow/landing:<commit>
ghcr.io/4geeksacademy/maxifer-trackflow/uis:<commit>
ghcr.io/4geeksacademy/maxifer-trackflow/services:<commit>
```

La URL pública de talento se incorpora durante la compilación y debe coincidir
con `NEXT_PUBLIC_API_URL` del `.env` del VPS. El backend interno de las imágenes
es `http://services:8000`. La discrepancia se detecta antes de detener la API.
Credenciales de PostgreSQL, JWT y correo permanecen en el `.env` del servidor.

## Qué cambia en el VPS

El runner copia solo el Compose de producción, los scripts y el manifiesto
de la versión a `/opt/trackflow/releases/<commit>/`. No copia el `.env`, datos
locales ni código fuente para compilar en el servidor.

El script de despliegue:

1. Obtiene un bloqueo exclusivo y valida la configuración y el disco libre.
2. Guarda la configuración anterior y conserva las imágenes anteriores con
   etiquetas locales de rollback.
3. Comprueba las rutas actuales y registra los IDs existentes y las huellas
   de la conexión de datos y del JWT, sin imprimir credenciales.
4. Descarga todas las imágenes con el token temporal de GHCR. Un fallo de
   descarga deja los contenedores actuales funcionando.
5. Pausa únicamente la API para respaldar de forma consistente su volumen.
6. Actualiza los contenedores y espera los healthchecks de API, landing y
   ambas aplicaciones Next.js.
7. Comprueba las rutas a través de Next.js, la cuenta existente cuando la hay,
   y la conservación de IDs de usuarios, proveedores, incidencias e inventario.
8. Guarda las referencias exactas de las imágenes en el Compose activo y
   registra el commit en `/opt/trackflow/current-release`.

Se conservan el proyecto `trackflow-prod`, el volumen `trackflow-prod_api_data`,
la red `trackflow-production`, el `.env` y la base PostgreSQL original. No se
ejecutan semillas ni comandos que eliminen volúmenes. La API se pausa brevemente
durante el respaldo y la sustitución de su contenedor; no es un despliegue sin
interrupciones.

## Fallos y recuperación

Un fallo después de detener la API activa la restauración de la configuración
y las imágenes anteriores. El workflow permanece fallido para que el error
sea visible. Si el rollback también falla, el log indica el directorio de
recuperación. No se usa `latest` para elegir una versión de producción.

Los respaldos quedan en `/opt/trackflow/backups/deploy-<fecha>-<commit>/` con
permisos privados. Incluyen el `.env` anterior, Compose, etiquetas de las
imágenes anteriores, estado de referencia y copia del volumen. No se suben
como artefactos de GitHub.

El rollback vuelve a las imágenes anteriores y conserva los datos actuales;
no restaura automáticamente el volumen ni revierte cambios de esquema o
datos en PostgreSQL. Antes de introducir migraciones de base de datos,
preparar un respaldo PostgreSQL y una estrategia de compatibilidad específica.

Las primeras ejecuciones requieren al menos 2 GiB libres en el VPS. Los
respaldos y las versiones anteriores se conservan para recuperación y deben
revisarse periódicamente; este workflow no hace una limpieza global de Docker.

## Verificaciones locales

```sh
python -m unittest scripts.test_deployment scripts.test_restore_business_data -v
bash -n scripts/deploy.sh
docker compose -f docker-compose.prod.yml config --quiet
```

Los tests de control de datos funcionan en Windows. Las pruebas que ejecutan
el script real con un Docker simulado requieren Linux y se ejecutan en CI;
cubren éxito, fallo al descargar, fallo de arranque y fallo de verificación.

Referencias: [publicación de imágenes en GitHub Actions](https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images),
[secrets de Actions](https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets),
[actualizaciones con Compose](https://docs.docker.com/reference/cli/docker/compose/up/).
