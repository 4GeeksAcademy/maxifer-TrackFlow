# Dockerización de TrackFlow

El despliegue automático desde `main` se configura en
[GitHub Actions](./github-actions.md). Esa guía describe los secretos, las
variables, las comprobaciones y la recuperación ante fallos.

## Adaptación del reto

El sitio público vive en `uis/website` y se sirve con Nginx. Las URLs públicas se conservan.

El despliegue estático alternativo de Netlify usa `netlify.toml`: ejecuta
`npm run build:landing` desde la raíz y publica únicamente `uis/website`.
El contenedor `uis` ejecuta las dos aplicaciones Next.js existentes mediante
`uis/start.sh`: backoffice en 3001 y talent-pipeline-tracker en 3002.
La landing conserva el puerto 3000 y FastAPI usa 8000.

La API arranca como `services.api.main:app` desde `/app`. Su contexto de
construcción es la raíz porque importa `packages/` y `scripts/`. Por eso
el `.dockerignore` efectivo del backend es el de la raíz; el de `services/`
documenta también las exclusiones de esa carpeta. El frontend usa contexto
`uis/` y su propio `.dockerignore`.

## Desarrollo

Requisito: Docker Engine con Compose o Docker Desktop con contenedores Linux.
No se necesitan Node, Python ni uv instalados en el host.

1. Copiar `.env.example` a `.env` en la raíz.
2. Definir un `JWT_SECRET` aleatorio y privado. Para generarlo con Docker:

   ```sh
   docker run --rm python:3.12-slim python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```

3. Arrancar desde la raíz:

   ```sh
   docker compose config --quiet
   docker compose up --build -d
   docker compose ps
   docker compose logs -f
   ```

| Aplicación | URL local |
| --- | --- |
| Landing | http://localhost:3000 |
| Backoffice | http://localhost:3001 |
| Talento | http://localhost:3002 |
| API / OpenAPI | http://localhost:8000/docs |

Después de construir las imágenes, `docker compose up` basta. El `.env`
local de esta implementación ya se generó con un secreto aleatorio propio.
No está versionado. Cambiar los puertos en `.env` si están ocupados; actualizar
también `FRONTEND_URL` para que los correos apunten al backoffice correcto.

El backoffice llama a `/backend/...` en su propio origen. Next.js reenvía a
`BACKEND_INTERNAL_URL=http://services:8000`, por DNS de Docker sobre la red
`trackflow-development`. El navegador no necesita resolver `services`.
Los healthchecks usan loopback para comprobar su propio proceso; no son
comunicación entre contenedores.

El archivo `.env` de la raíz es la configuración del backend en Docker;
`PYTHON_DOTENV_DISABLED=1` evita cargar el antiguo `services/api/.env`
desde el bind mount. Solo las variables necesarias llegan a Next.js, para
evitar entregar secretos del backend al contenedor de interfaces.

### Datos y servicios externos

Por defecto el inventario usa SQLite dentro del volumen `api_data`, así el
arranque no depende de PostgreSQL externo. Se puede sustituir `DATABASE_URL`
por una conexión PostgreSQL/Supabase propia. Usuarios, proveedores e incidencias
también persisten en `api_data`; no se copian los datos privados del host.

`DEMO_DATA_ENABLED=true` crea la cuenta local `test@test.com` / `test1234`
e importa las incidencias de ejemplo. Los datos de Docker son independientes
de `services/api/data` en el host.

El tracker necesita una API externa con endpoints `/records` y notas.
El backend de incidencias no implementa esa API. Sin `NEXT_PUBLIC_API_URL`
la página muestra un aviso de servicio no configurado; no inventa datos.
Cuando exista la API, indicar su URL pública en `.env`. Esta variable llega
al navegador y al servidor Next.js, así que no debe contener secretos ni
usar nombres DNS internos de Docker. En producción requiere reconstruir `uis`.

El envío de recuperación de contraseña necesita `RESEND_API_KEY` y un
`EMAIL_FROM` válido. Sin esa configuración el resto del backoffice funciona.

### Recarga y dependencias

Se montan `uis/`, `services/`, `packages/` y `scripts/` desde el host.
Los `node_modules` de Linux y las carpetas `.next` viven en volúmenes separados.
Next.js usa Webpack con polling para Docker Desktop; Uvicorn usa `--reload`
y `WATCHFILES_FORCE_POLLING=true`. La landing monta HTML y assets en lectura.
Modificar fuentes no requiere reconstrucción. Si se cambia Tailwind de la
landing, hay que regenerar `assets/tailwind.min.css` con el script ya existente.

Si cambian dependencias del frontend:

```sh
docker compose exec uis npm ci --prefix /app/uis/backoffice
docker compose exec uis npm ci --prefix /app/uis/backoffice/talent-pipeline-tracker
docker compose restart uis
docker compose build uis
```

Las dependencias Python están fijadas con hashes en `services/requirements.txt`,
exportadas desde `uv.lock`. Para actualizarlas tras modificar el proyecto Python:

```sh
uv lock
uv export --frozen --no-dev --no-emit-project --format requirements-txt --output-file services/requirements.txt
docker compose up -d --build services
```

`docker compose down` conserva datos. `docker compose down -v` elimina
también todos los volúmenes y sus datos; usarlo solo para un reinicio deliberado.

## Producción en VPS

Usar el archivo independiente `docker-compose.prod.yml`, sin combinarlo con
el de desarrollo. Ejecuta `next start` y Uvicorn sin reload, no monta fuentes,
usa usuarios sin privilegios en API/Next, reinicia los servicios automáticamente
y fuerza `DEMO_DATA_ENABLED=false`. La API no publica puerto al host; el
backoffice accede a ella dentro de `trackflow-production`.

Crear `.env` directamente en el servidor con permisos `600`, un JWT privado,
la conexión de datos de producción y las URLs públicas. Para desplegar un
proyecto con datos existentes, respaldar y migrar incidencias y proveedores,
y configurar la conexión PostgreSQL original del inventario. Conservar el
archivo de usuarios del destino si ya se crearon cuentas en el VPS.
Transferir las credenciales necesarias por SSH y mantenerlas fuera de Git.
`DEMO_DATA_ENABLED=false` controla la semilla automática; no sustituye la
migración de datos ni desactiva cuentas registradas manualmente.

```sh
docker compose -f docker-compose.prod.yml config --quiet
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail 100
```

Para un VPS con poca RAM se pueden construir las imágenes en otra máquina
Linux amd64 (incluido Docker Desktop), transferirlas con `docker save`/`scp`,
cargarlas con `docker load` y ejecutar `up -d --no-build`. Los nombres que
Compose asigna son `trackflow-prod-landing`, `trackflow-prod-uis` y
`trackflow-prod-services`. Mantener el mismo archivo Compose y proyecto.

La instalación inicial usa HTTP por IP y puertos separados. Para un dominio
con HTTPS, colocar un proxy inverso con certificados delante de esos puertos
y actualizar `FRONTEND_URL`. Hacer copias del volumen `trackflow-prod_api_data`
y de cualquier base PostgreSQL externa antes de actualizar el despliegue.

Referencias: [rewrites de Next.js](https://nextjs.org/docs/app/api-reference/config/next-config-js/rewrites),
[contextos e ignores de Docker](https://docs.docker.com/build/concepts/context/),
[instalación oficial de Docker en Ubuntu](https://docs.docker.com/engine/install/ubuntu/).

## Verificación del reto — 17 de octubre de 2026

- [x] Compose de desarrollo validado y stack levantado con `docker compose up -d --build`.
- [x] Dos procesos Next.js en `uis`, puertos 3001 y 3002, iniciados por `start.sh`.
- [x] Landing estática en 3000; FastAPI saludable en 8000.
- [x] Recarga de FastAPI y de ambas interfaces comprobada mediante cambios temporales, posteriormente restaurados.
- [x] Login y perfil autenticado a través de `/backend`, con destino `services:8000`.
- [x] Login desde navegador y panel con 95 incidencias cargadas.
- [x] Un contenedor nuevo lee usuarios e incidencias desde el volumen persistente.
- [x] Backoffice: 4 suites y 15 tests aprobados dentro del contenedor.
- [x] Tracker: lint aprobado; ambas apps compilan para producción.
- [x] Imágenes de producción probadas localmente con `next start`, incluyendo login por proxy.
- [x] `.env` ignorado, ausente del índice y del historial Git consultado; ignores de Docker configurados.
- [x] VPS desplegado y accesible; API saludable, sin puerto publicado y cuenta demo rechazada con HTTP 401.

Despliegue actual en `bc-vps-216`, directorio `/opt/trackflow`:

| Servicio | URL pública verificada (HTTP 200) |
| --- | --- |
| Landing | http://67.205.167.151 |
| Backoffice | http://67.205.167.151:3001/login |
| Tracker | http://67.205.167.151:3002 |

El VPS recibió Docker Engine y Compose desde el repositorio oficial. Fue
necesario completar una operación anterior de `dpkg` que estaba interrumpida.
Las imágenes se construyeron con Docker Desktop y se cargaron en el servidor
para evitar compilar Next.js en sus aproximadamente 1 GB de RAM.

El despliegue inicial generó el `.env` en el servidor con un JWT distinto del
de desarrollo, permisos `600`, SQLite persistente y semilla demo desactivada.
Ese almacenamiento inicial estaba vacío. La recuperación de los datos del
proyecto y la configuración definitiva se documentan a continuación.

Quedan sin configurar la API externa de candidaturas, Resend y un dominio con
HTTPS. El tracker muestra el aviso de configuración pendiente. Los gestores
reportaron avisos de auditoría en dependencias npm existentes; esta tarea no
actualizó sus versiones ni ejecutó correcciones incompatibles.

## Recuperación de los datos existentes — 17 de octubre de 2026

El despliegue definitivo conserva el archivo de usuarios registrado en el VPS.
Las incidencias y los proveedores se recuperaron de las fuentes locales
existentes; el inventario se reconectó al PostgreSQL original cambiando solo
`DATABASE_URL` en el `.env` del servidor. El JWT y las demás variables se
conservaron, al igual que `DEMO_DATA_ENABLED=false`.

Datos comprobados mediante solicitudes autenticadas a través del backoffice:

| Datos | Registros |
| --- | ---: |
| Incidencias | 97, incluidas las 2 creadas manualmente |
| Proveedores | 15 |
| Productos en PostgreSQL | 6 |
| Entradas | 5 |
| Salidas | 4 |

La comparación verificó los campos de las incidencias y los proveedores, y
todos los registros de inventario antes y después de reconectar, incluidos los
UUID de sus autores. La importación no encontró conflictos. El archivo
`auth.json` del VPS permaneció idéntico al respaldo: se conservaron cuenta,
contraseña y perfil, sin importar usuarios locales ni ejecutar semillas.
Estas comprobaciones se repitieron correctamente después de reiniciar la API.

La cuenta registrada manualmente en el VPS utiliza las mismas credenciales
que la antigua demo. Su acceso se conserva por decisión del usuario;
`DEMO_DATA_ENABLED=false` desactiva la creación automática, no una cuenta
registrada manualmente. La comprobación distingue estas dos situaciones.

Respaldos privados de la recuperación:

- VPS: `/opt/trackflow/backups/20261017T205024Z-retry2/`, con configuración
  anterior, datos del volumen, fuentes importadas e informes de verificación.
- Equipo local: `C:\Users\maxif\.trackflow-backups\20261017T205024Z\`, con
  snapshots de las fuentes, copia del respaldo del VPS y volcado PostgreSQL.
  El archivo PostgreSQL se comprobó con `pg_restore --list`.

El importador `scripts/restore_business_data.py` funciona con la API detenida
y un respaldo previo. Recibe `--source` y `--target`, no modifica usuarios y
conserva los registros del destino ante diferencias. Identifica incidencias
por `source_id` o por título y fecha para altas manuales; proveedores por
nombre y país. Conserva IDs libres y asigna nuevos cuando hay colisiones.
Imprime un informe JSON con inserciones, omisiones y conflictos. Si se repite
con las mismas fuentes, no duplica registros. Admite archivos TinyDB vacíos.

Pruebas del importador:

```sh
python -m unittest scripts.test_restore_business_data -v
```

Los dos casos verifican destinos vacíos, colisiones de IDs, conflictos,
conservación de cuentas y tablas adicionales, e importaciones repetidas.
