# 4Geeks Academy | Auditoría y mejora de rendimiento de TrackFlow

> **Proyecto:** optimización del sitio corporativo y el backoffice de la empresa.\
> **Repositorio:** `maxifer-TrackFlow`, tu proyecto actual.\
> **Terminal:** PowerShell. Ejecutá los comandos desde la raíz salvo indicación expresa.\
> **Método de trabajo:** **medir → analizar → corregir → volver a medir**.

---

## 00.0 — ¿Qué vamos a hacer?

La empresa ya tiene dos aplicaciones frontend:

- **Sitio corporativo:** la web pública que visitan los clientes. Nos interesa su velocidad, experiencia de usuario y SEO.
- **Backoffice:** el panel interno que usa el personal. Nos interesa que el dashboard, las tablas y los formularios respondan bien.

El objetivo **no es rediseñar ni reconstruir** las aplicaciones. Vamos a buscar problemas concretos de rendimiento, corregirlos sin romper funcionalidades y **demostrar con mediciones** que mejoraron.

### 00.1 — ¿Qué deberías tener al terminar?

1. Un informe de Lighthouse **antes y después** para los dos frontends.
2. Capturas guardadas en `audit/before/` y `audit/after/`.
3. Un `AUDIT.md` que explique problemas y sus **causas raíz**.
4. Un `REPORT.md` con los cambios realizados y sus resultados.
5. **Dos casos de código repetido identificados** y, como mínimo, **un componente reutilizable o Custom Hook extraído**.
6. Commits de los cambios y todo subido al **mismo repositorio de empresa**.

### 00.2 — Conceptos que vamos a usar

**Lighthouse:** herramienta de Chrome que examina **una página por vez** y muestra cuatro puntuaciones, de 0 a 100:

| Puntuación | ¿Qué evalúa? |
|---|---|
| **Performance** | Qué tan rápido se carga y se muestra la página. |
| **Accessibility** | Si la interfaz puede ser utilizada por personas con distintas necesidades de accesibilidad. |
| **Best Practices** | Si sigue buenas prácticas técnicas y de seguridad del navegador. |
| **SEO** (*Search Engine Optimization*) | Si una página pública está preparada para que los buscadores la interpreten. |

**Core Web Vitals** significa *métricas web esenciales*. Son indicadores de experiencia real:

| Sigla | Nombre | ¿Qué mide? | Objetivo de referencia |
|---|---|---|---|
| **LCP** | *Largest Contentful Paint* | Cuánto tarda en aparecer el contenido principal. | **≤ 2,5 segundos** |
| **CLS** | *Cumulative Layout Shift* | Cuánto se mueve inesperadamente la página durante la carga y el uso. | **≤ 0,1** |
| **INP** | *Interaction to Next Paint* | Cuánto tarda la interfaz en responder visualmente a una interacción. | **≤ 200 ms** |

Otras métricas útiles:

- **TTFB** (*Time to First Byte*): tiempo hasta recibir el primer byte de respuesta del servidor.
- **FCP** (*First Contentful Paint*): tiempo hasta que aparece el primer contenido visible.
- **TBT** (*Total Blocking Time*): tiempo durante el cual las tareas de JavaScript mantienen ocupado el navegador. Nos ayuda a investigar problemas de interactividad.

> **Importante:** los tres Core Web Vitals actuales son **LCP, CLS e INP**. La antigua métrica **FID** fue reemplazada por INP. Lighthouse, en una auditoría habitual de carga, muestra **TBT** como referencia de laboratorio para investigar posibles problemas de interactividad: **no esperes ver siempre un valor INP en ese reporte**. Para medir INP se necesitan interacciones reales o instrumentos adecuados. No confundas las cuatro *puntuaciones de Lighthouse* con los tres *Core Web Vitals*.

**Referencia de Performance:** 90 o más es una buena meta, pero **sacar 100 no es requisito**. Lo que se evalúa es que detectes, corrijas y documentes mejoras medibles.

---

## 01.0 — Preparar nuestro monorepo

### 01.1 — Abrir TrackFlow y comprobar la rama

Abrí el proyecto en VS Code y una terminal PowerShell. Copiá:

```powershell
Set-Location C:\Users\Equipo\Desktop\Bootcamp\maxifer-TrackFlow
Get-Location
git status --short
git branch --show-current
```

**Qué deberías ver:** la raíz de TrackFlow y la rama `perf/auditoria-lighthouse`, que ya creaste. No vuelvas a crearla si ya estás en ella. Revisá los cambios pendientes antes de continuar; no los borres ni los incluyas automáticamente en tus commits.

Tu proyecto está organizado así:

```text
maxifer-TrackFlow/
├── uis/
│   ├── website/                         # HTML estático: home y formulario
│   └── backoffice/                      # Next.js: incidencias e inventario
│       └── talent-pipeline-tracker/      # Otra app independiente
├── services/api/                        # API FastAPI
├── packages/                            # Lógica compartida
└── package.json                         # Build de la landing y controles
```

En esta auditoría vas a trabajar con **website y backoffice de incidencias**. No necesitás arrancar el tracker de contratación.

### 01.2 — Instalar las dependencias

Primero comprobá las herramientas:

```powershell
node --version
npm.cmd --version
uv --version
```

**Si aparece «uv no se reconoce»**, instalalo con WinGet en PowerShell:

```powershell
winget install --id=astral-sh.uv -e
```

Esperá a que termine. Cerrá **todas las ventanas de VS Code** y volvé a abrir el proyecto para que sus terminales reciban el PATH actualizado. Abrí una terminal nueva y comprobá:

```powershell
uv --version
```

Debería mostrar la versión de uv. Si todavía no lo encuentra, no sigas con `uv sync`: comprobá el mensaje del instalador y que la instalación haya terminado correctamente. Este método está documentado en la [guía oficial de uv](https://docs.astral.sh/uv/getting-started/installation/#winget).

Una vez que las herramientas funcionan, instalá las dependencias desde la raíz:

```powershell
Set-Location C:\Users\Equipo\Desktop\Bootcamp\maxifer-TrackFlow
npm.cmd ci
npm.cmd ci --prefix uis/backoffice
uv sync --frozen
```

Esperá a que termine cada comando. Necesitás Node 22 o superior, Python 3.12 o superior y uv. Si ya instalaste las dependencias y los comandos funcionan, no hace falta reinstalarlas para cada medición.

**¿Por qué usamos `npm.cmd`?** PowerShell puede bloquear `npm.ps1` y `npx.ps1`. Las variantes `.cmd` permiten ejecutar los mismos comandos sin cambiar la política de ejecución.

### 01.3 — Levantar el sitio corporativo

Abrí una terminal que vas a dejar ejecutándose, llamada **Terminal A**:

```powershell
Set-Location C:\Users\Equipo\Desktop\Bootcamp\maxifer-TrackFlow
npm.cmd run build:landing
npx.cmd --yes serve -l 3000 .\uis\website
```

Cuando termine el build y aparezca la dirección del servidor, abrí:

- **Home:** http://localhost:3000/
- **Formulario:** http://localhost:3000/application.html

**Qué deberías ver:** la landing de TrackFlow y su formulario, con estilos e imágenes.

> En TrackFlow, `uis/website` es HTML estático: **no tiene script `dev`**. No ejecutes `npm.cmd run dev` para la landing. El build se ejecuta desde el `package.json` de la raíz y prepara Tailwind e imágenes.

**Si aparece Not found:** detené el servidor con Ctrl+C, copiá el bloque completo anterior y volvé a abrir la URL. El comando supone que estás en la raíz. Si estás dentro de `uis/website`, se sirve con `npx.cmd --yes serve -l 3000 .`.

**Si el puerto está ocupado:** detené el servidor anterior en su terminal y volvé a arrancar. Verificá la dirección que imprime `serve` para no medir otro servidor.

### 01.4 — Levantar la API que necesita el backoffice

El backoffice necesita la API para iniciar sesión y mostrar incidencias. Antes de arrancarla, comprobá que estás usando **configuración local y datos sintéticos de desarrollo**.

La API requiere `JWT_SECRET` y `DATABASE_URL` configurados localmente. Si ya usabas el backoffice, conservá esa configuración. Si faltan, seguí la sección de configuración de [README.md](README.md) con el responsable del entorno; no publiques secretos ni modifiques `.env` sin la autorización exigida por [AGENTS.md](AGENTS.md).

> El arranque crea tablas de inventario y, con la demo habilitada, carga incidencias y crea o actualiza la cuenta de prueba. TinyDB y las incidencias se guardan en rutas fijas de `services/api/data/`: cambiar `DATABASE_URL` no aísla todos los datos. Si tu copia contiene datos reales o apunta a producción, prepará primero un entorno de desarrollo aislado aprobado. No borres bases ni ejecutes seeds manuales para seguir esta guía.

Abrí otra terminal, **Terminal B**:

```powershell
Set-Location C:\Users\Equipo\Desktop\Bootcamp\maxifer-TrackFlow
uv run --frozen uvicorn services.api.main:app --host 127.0.0.1 --port 8000
```

Abrí http://localhost:8000/docs.

**Qué deberías ver:** la documentación interactiva de la API, sin un error de arranque en la terminal. Dejala abierta mientras trabajás con el backoffice.

**Si aparece `sqlite3.OperationalError: unable to open database file`:** la API no pudo abrir el archivo SQLite de inventario configurado. Puede faltar su carpeta o la ruta no ser válida desde la raíz. Para esta auditoría, podés usar un archivo nuevo de inventario local, sin editar `.env` ni reemplazar la base existente. En la Terminal B, desde la raíz, ejecutá:

```powershell
New-Item -ItemType Directory -Force .tmp | Out-Null
$auditInventoryFile = 'inventory-audit-' + [guid]::NewGuid().ToString('N') + '.sqlite3'
$env:DATABASE_URL = 'sqlite:///.tmp/' + $auditInventoryFile
uv run --frozen uvicorn services.api.main:app --host 127.0.0.1 --port 8000
```

Esta variable vale para esa terminal y prevalece sobre la configuración cargada desde `.env`. El inventario nuevo comienza vacío; la vista medida es el dashboard de inicio. **Esto solo aísla el inventario**: autenticación e incidencias conservan sus rutas de `services/api/data/`, por lo que sigue siendo necesario usar datos locales de desarrollo aprobados. Conservá la misma terminal y variable para todas las mediciones; no generes otro archivo entre el antes y el después. No añadas `.tmp` a Git.

### 01.5 — Levantar el backoffice compilado

Para medir vamos a usar la versión compilada, similar a producción. Abrí una tercera terminal, **Terminal C**:

```powershell
Set-Location C:\Users\Equipo\Desktop\Bootcamp\maxifer-TrackFlow
$env:BACKEND_INTERNAL_URL = 'http://127.0.0.1:8000'
npm.cmd --prefix uis/backoffice run build
```

**Si el build termina correctamente**, ejecutá en esa misma terminal:

```powershell
npm.cmd --prefix uis/backoffice run start -- --port 3001
```

1. Abrí http://localhost:3001/login.
2. Iniciá sesión con tu cuenta local de pruebas. Si la demo está habilitada, la cuenta documentada es `test@test.com`, contraseña `test1234`, exclusivamente para desarrollo.
3. Abrí http://localhost:3001/.
4. Comprobá que se ven los resúmenes de incidencias y proveedores y las incidencias recientes.

**No avances si ves un error, una pantalla vacía o el login en lugar del dashboard.** Revisá primero la Terminal B y las peticiones de Network. El backoffice envía `/backend/...` a la API de 8000 mediante su configuración existente.

La URL interna que vamos a medir es **`/`**, el dashboard de inicio del backoffice. En este proyecto no hay que inventar una ruta `/dashboard`.

### 01.6 — Fijar las condiciones de medición

Antes de abrir Lighthouse:

- Mantené las tres terminales encendidas: website 3000, API 8000 y backoffice 3001.
- Usá el mismo Chrome, equipo, URLs, dispositivos y condiciones de red antes y después.
- Mantené la misma cantidad de incidencias sintéticas y los mismos filtros.
- Cerrá aplicaciones pesadas y evitá extensiones que alteren las páginas.
- No ejecutes builds ni tests mientras corre Lighthouse.
- Registrá las versiones de Node, Chrome, Lighthouse y del servidor `serve` usado.

La landing se mide después de `build:landing`; el backoffice, con **build + start**. Usá exactamente ese procedimiento también después de corregir.

Si necesitás modo desarrollo para programar, detené primero el backoffice con Ctrl+C y ejecutá `npm.cmd --prefix uis/backoffice run dev -- --port 3001`. Antes de medir, detené `dev` y repetí el paso 01.5. No mezcles mediciones de desarrollo con producción.

---
## 02.0 — Primera medición: Lighthouse ANTES de corregir

**No modifiques el código todavía.** Primero hay que saber qué está funcionando mal.

### 02.1 — Elegir las páginas

Como mínimo vamos a medir:

1. **Website:** home de TrackFlow: `http://localhost:3000/`.
2. **Website:** formulario: `http://localhost:3000/application.html`.
3. **Backoffice:** dashboard de inicio: `http://localhost:3001/`, con sesión iniciada.

Para una comparación más completa, hacé **móvil y escritorio en cada una**: son **seis combinaciones de página y dispositivo como mínimo**. Lighthouse audita una URL cada vez, no todo el frontend de una sola pasada.

### 02.2 — Ejecutar Lighthouse paso a paso

Para **cada página**:

1. Abrí la URL en **Chrome** (o Brave, si tenés disponible la pestaña Lighthouse).
2. Presioná **F12** o **Ctrl + Shift + I** para abrir las herramientas de desarrollador.
3. Entrá en la pestaña **Lighthouse**.
4. Seleccioná **Navigation** o análisis de carga de página, si aparece esa opción.
5. Elegí **Mobile** y marcá las categorías **Performance, Accessibility, Best Practices y SEO**.
6. Ejecutá **Analyze page load** (analizar carga de página).
7. Esperá el resultado, registrá las cuatro puntuaciones y las métricas relevantes (LCP, CLS, TBT, FCP, TTFB si aparecen). En el dashboard, evitá borrar el almacenamiento de sesión y comprobá que el reporte siga mostrando la vista autenticada; mantené esa configuración antes y después.
8. Guardá una captura de pantalla del resultado. En Windows podés usar **Windows + Shift + S**.
9. Repetí para **Desktop**.
10. Hacé lo mismo con las otras URLs seleccionadas.

> Si el dashboard es privado, iniciá sesión y verificá que Lighthouse **no haya terminado auditando la pantalla de login** por una redirección. El SEO de una vista interna protegida no se interpreta igual que el de una página pública: no hay que forzar la indexación del backoffice para subir su puntuación.

### 02.3 — Registrar las puntuaciones

Completá una tabla en `AUDIT.md` (los valores de abajo son espacios para completar, **no son resultados reales**):

| Página | Modo | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Website / | Mobile | — | — | — | — | — | — | — |
| Website / | Desktop | — | — | — | — | — | — | — |
| Website /application.html | Mobile | — | — | — | — | — | — | — |
| Website /application.html | Desktop | — | — | — | — | — | — | — |
| Backoffice / | Mobile | — | — | — | — | — | — | — |
| Backoffice / | Desktop | — | — | — | — | — | — | — |

Estas son las rutas reales que vas a medir en TrackFlow. Si una métrica no está disponible, escribí **N/D**, en lugar de inventarla.

### 02.4 — Guardar evidencias

Volvé a la **raíz del repositorio** y creá las carpetas:

```powershell
New-Item -ItemType Directory -Force -Path ".\audit\before", ".\audit\after" | Out-Null
```

Guardá las capturas iniciales con nombres claros:

```text
audit/
├── before/
│   ├── website-home-mobile.png
│   ├── website-home-desktop.png
│   ├── website-application-mobile.png
│   ├── website-application-desktop.png
│   ├── backoffice-dashboard-mobile.png
│   └── backoffice-dashboard-desktop.png
└── after/                   # Por ahora queda vacía
```

Exportá también los reportes completos en HTML o JSON con el mismo nombre: te permitirán investigar las advertencias después. Guardá únicamente datos sintéticos; revisá que las capturas y reportes no expongan tokens ni datos personales.

Para empezar rápido, hacé una pasada de las seis combinaciones. Para una comparación más fiable, repetí cada combinación tres veces antes y después y compará las medianas, conservando los valores individuales. Si hacés una sola corrida, registrá esa limitación.

---

## 03.0 — Analizar los problemas y revisar el código

### 03.1 — No alcanza con copiar advertencias

Lighthouse puede decir: *“Reduce el tamaño de las imágenes”*. Eso es una **observación**. Para el archivo `AUDIT.md` necesitamos ir un paso más allá: identificar **qué archivo, componente o recurso causa el problema**.

Ejemplo:

| Resultado observado | Posible causa raíz | Corrección propuesta |
|---|---|---|
| LCP lento en la home | Imagen principal demasiado pesada. | Optimizar formato, dimensiones y carga de la imagen. |
| CLS alto al abrir el catálogo | Las imágenes no reservan espacio antes de cargar. | Definir dimensiones o proporción del contenedor. |
| TBT elevado en el dashboard | Se cargan gráficos pesados apenas entra el usuario. | Diferir carga de componentes que todavía no necesita. |
| Advertencia de hidratación | El HTML generado por servidor no coincide con el primer render del navegador. | Revisar contenido variable que se renderiza antes de hidratar. |

**Estos son ejemplos frecuentes, no diagnósticos de tu proyecto.** Verificá cada hipótesis con el reporte, las herramientas del navegador y el código real.

### 03.2 — Encontrar código repetido

Revisá `uis/website` y `uis/backoffice` para detectar **al menos dos casos**:

- Dos archivos que repiten tarjetas, badges, encabezados o formularios similares.
- Dos componentes que repiten la lógica de filtros, búsqueda, paginación o peticiones.

Tenés dos maneras de mejorar:

**Componente reutilizable:** extraer una parte visual que aparece repetida. Ejemplos: `StatusBadge`, `ProductCard`, `LoadingSpinner`.

**Custom Hook:** extraer lógica de React para reutilizarla. Ejemplos: `useDebounce`, `usePagination`, `useFetchData`.

> **Acordate:** un Custom Hook es una función que empieza por `use` y utiliza o coordina lógica de hooks de React. No es simplemente una función común renombrada.

En `AUDIT.md` documentá **dos candidatos**, indicando:

1. **Dónde** está la repetición (rutas de archivos reales).
2. **Qué** se repite.
3. **Por qué** conviene extraerlo.
4. **Cómo** quedaría el componente o Custom Hook compartido.

Después, **implementá al menos uno**. Puede ser una reutilización dentro de uno de los frontends. Si ambos frontends realmente comparten código, considerá un paquete en `packages/` **solo si la infraestructura de tu monorepo ya lo soporta**. No es necesario reestructurar todo el proyecto.

### 03.3 — Crear `AUDIT.md`

En la **raíz del monorepo**, creá el archivo `AUDIT.md` con esta estructura:

```md
# AUDIT — Auditoría inicial

## Entorno de medición
- Fecha:
- Navegador:
- Modo de ejecución: website build:landing + serve; backoffice build + start.
- URLs medidas:
- Dispositivos simulados: Mobile y Desktop
- Versiones de Node, Lighthouse y serve; commit y rama:
- Cantidad de incidencias, filtros y condiciones de caché/almacenamiento:
- Número de repeticiones y valores individuales:

## Puntuaciones iniciales
[Pegar aquí la tabla con las 6 mediciones]

## Problemas detectados

### Problema 1
- Frontend y URL:
- Indicador afectado:
- Evidencia de Lighthouse:
- Archivo o componente involucrado:
- Causa raíz comprobada (o hipótesis a verificar):
- Solución propuesta:

### Problema 2
- Frontend y URL:
- Indicador afectado:
- Evidencia de Lighthouse:
- Archivo o componente involucrado:
- Causa raíz comprobada (o hipótesis a verificar):
- Solución propuesta:

## Código duplicado

### Caso 1
- Archivos:
- Código repetido:
- Abstracción propuesta:

### Caso 2
- Archivos:
- Código repetido:
- Abstracción propuesta:
```

No pongas causas inventadas: si todavía no sabés la causa exacta, escribí **hipótesis pendiente de validar**.

### 03.4 — Hacer el primer commit

Antes de cada commit, seguí AGENTS.md: revisá el diff, actualizá el banco de memoria con resultados reales, ejecutá los controles del área y los del repositorio indicados en 05.4, y revisá secretos y datos personales. Añadí las actualizaciones de memoria propias con rutas explícitas. Revisá también `git diff --cached --check` y `git diff --cached` antes de confirmar.

Cuando ya guardaste las capturas y completaste el diagnóstico inicial:

```powershell
git add AUDIT.md audit/before
git diff --cached --stat
git commit -m "docs(audit): registrar mediciones iniciales"
```

A esta altura **todavía no debería haber correcciones de rendimiento**.

---

## 04.0 — Skills de agente: ayuda para investigar y corregir

Una **skill de agente** es un conjunto de instrucciones especializadas que una herramienta de IA para programación (por ejemplo, Cursor, Codex o Claude Code) puede utilizar para analizar una tarea.

**No es un plugin que optimiza tu página mágicamente**, ni reemplaza las mediciones. La IA ayuda a diagnosticar y proponer cambios; vos revisás y comprobás los resultados.

### 04.1 — Skills disponibles

El CTO habilitó estas opciones:

- [core-web-vitals](https://www.skills.sh/addyosmani/web-quality-skills/core-web-vitals): foco en LCP, CLS e INP.
- [performance](https://www.skills.sh/addyosmani/web-quality-skills/performance): análisis de carga, recursos y optimización general.
- [web-perf (Cloudflare)](https://www.skills.sh/cloudflare/skills/web-perf): auditoría de rendimiento con herramientas de navegador; para el flujo completo de trazas necesita **Chrome DevTools MCP** (*Model Context Protocol*, protocolo que conecta un agente con herramientas externas).

**La instalación es opcional cuando no resulte necesaria**, tal como indica la consigna. Si instalás alguna, tenés que dejar evidencia de su uso.

### 04.2 — Instalarlas, si corresponde

Desde la **raíz del monorepo**, con Node.js y `npx` disponibles, podés ejecutar:

```powershell
# Opción 1: Core Web Vitals
npx.cmd skills add addyosmani/web-quality-skills --skill core-web-vitals

# Opción 2: Rendimiento general
npx.cmd skills add addyosmani/web-quality-skills --skill performance

# Opción 3: Web Performance de Cloudflare
npx.cmd skills add cloudflare/skills --skill web-perf
```

El instalador puede preguntarte **en qué agente** querés instalar la skill y si será local al proyecto. Seleccioná el agente que usás en clase. **No hace falta instalar las tres**: elegí las que te ayuden a resolver problemas detectados. Revisá qué archivos agrega antes de hacer commit.

Si una skill no aparece dentro de tu agente, verificá la carpeta de instalación y su compatibilidad. La skill de Cloudflare puede necesitar configurar **Chrome DevTools MCP** por separado para medir trazas automáticamente.

### 04.3 — Pedirle al agente un diagnóstico útil

Abrí tu agente con acceso al proyecto y utilizá un pedido como este:

> Estoy auditando TrackFlow. Leé AGENTS.md y el contexto obligatorio antes de investigar. Revisá `uis/website` y `uis/backoffice` utilizando la skill de rendimiento si hay una instalada; si no, investigá con los reportes y el código. Tengo capturas en `audit/before/` y conclusiones en `AUDIT.md`. Identificá problemas verificables de LCP, CLS, TBT, cargas innecesarias e hidratación. Para cada problema indicá: archivo exacto, causa probable, evidencia necesaria, corrección mínima y riesgo de regresión. **No cambies archivos todavía**. Priorizá por impacto y no propongas reescribir la arquitectura.

Después podés pedir que implemente **una corrección específica por vez**:

> Aplicá solamente la corrección del problema 1 de `AUDIT.md`. Mostrame el diff y explicá por qué resuelve la causa raíz. No modifiques otras funcionalidades ni la arquitectura. Indicá cómo comprobarla con Lighthouse y cómo probar que no rompió la pantalla.

**Usá el agente para los dos frontends.** Guardá en `AUDIT.md` las recomendaciones que efectivamente verificaste y en `REPORT.md` cuáles aplicaste. Una sugerencia del agente **no es automáticamente una falla real**. Aplicá las correcciones que el análisis sustentado en evidencia clasifique como necesarias, no todos los consejos genéricos.

---

## 05.0 — Corregir un problema por vez

### 05.1 — Elegir el orden de trabajo

Empezá por los problemas de mayor impacto:

1. **LCP:** imagen principal muy pesada, respuesta lenta, recursos que bloquean el render.
2. **CLS:** imágenes sin espacio reservado, bloques que aparecen y empujan contenido.
3. **Interactividad:** demasiado JavaScript al cargar, tareas pesadas, renders innecesarios. En Lighthouse, mirá especialmente **TBT**; para INP real necesitás medición de interacción.
4. **TTFB:** servidor, caché, API o renderizado que tarda en responder.
5. Después, las demás oportunidades de Performance, Accessibility, Best Practices y SEO.

No ignores accesibilidad o seguridad grave por perseguir una puntuación: priorizá con criterio. En el backoffice, buscá especialmente fluidez en tareas habituales.

### 05.2 — Ejemplo concreto: corregir una imagen que mueve el layout

En la landing estática de TrackFlow, primero buscá la imagen señalada por Lighthouse en `uis/website/index.html` o `application.html`. Si no reserva espacio, comprobá sus dimensiones reales y añadí atributos HTML `width` y `height` que respeten esa proporción; conservá el comportamiento responsive. No pegues componentes React en esos archivos HTML.

El siguiente ejemplo con `next/image` aplica solamente al backoffice Next.js y solo si allí detectás ese problema. No es una corrección obligatoria ni un hallazgo ya confirmado.

**Antes** (ejemplo de una aplicación Next.js):

```tsx
export default function Banner() {
  return <img src="/banner.jpg" alt="Promoción" />;
}
```

Si el navegador no conoce las dimensiones, el contenido puede desplazarse cuando aparece la imagen, empeorando **CLS**.

**Después** (si tu proyecto usa Next.js y la imagen existe en `public/`):

```tsx
import Image from "next/image";

export default function Banner() {
  return (
    <Image
      src="/banner.jpg"
      alt="Promoción"
      width={1200}
      height={600}
    />
  );
}
```

**¿Qué cambió?** Definimos dimensiones explícitas y utilizamos el componente de imágenes de Next.js, que puede optimizar su entrega según la configuración del proyecto. Las dimensiones deben corresponder a la **proporción real** de la imagen. Si es un elemento principal de la página, también revisá su prioridad de carga según la versión de Next.js.

Esto es **un ejemplo didáctico**. Solo aplicalo si Lighthouse y el código de tu empresa justifican el cambio.

### 05.3 — Ejemplo concreto: extraer un componente repetido

Supongamos que dos pantallas muestran exactamente el mismo indicador de estado:

```tsx
<span className="rounded bg-green-100 px-2 py-1 text-green-800">
  Activo
</span>
```

En lugar de repetirlo, creá un componente `StatusBadge.tsx` en una carpeta de componentes compartidos **del frontend que lo necesita**:

```tsx
type StatusBadgeProps = {
  status: "activo" | "inactivo";
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const active = status === "activo";

  return (
    <span
      className={
        active
          ? "rounded bg-green-100 px-2 py-1 text-green-800"
          : "rounded bg-gray-100 px-2 py-1 text-gray-800"
      }
    >
      {active ? "Activo" : "Inactivo"}
    </span>
  );
}
```

Y reemplazá la duplicación en las pantallas correspondientes:

```tsx
<StatusBadge status="activo" />
```

**¿Qué ganamos?** Un solo lugar para mantener estilo y comportamiento. Este cambio mejora **mantenibilidad**, aunque **no garantiza subir Lighthouse**. El proyecto evalúa tanto rendimiento como refactorización: no atribuyas mejoras de Performance a un componente compartido sin evidencia.

### 05.4 — Repetir el ciclo después de cada corrección
En TrackFlow, ejecutá estos controles desde la raíz según el área modificada.

**Si cambiaste el website:**

```powershell
npm.cmd run build:landing
```

Abrí la home y el formulario. Probá navegación, cambio de idioma, imágenes y validación con datos sintéticos, sin enviar información a integraciones reales. El build prepara CSS e imágenes: no lo omitas al volver a medir.

**Si cambiaste el backoffice:**

```powershell
npm.cmd --prefix uis/backoffice test -- --runInBand
npm.cmd --prefix uis/backoffice run lint
npm.cmd --prefix uis/backoffice run build
```

Comprobá login, resumen, listado, filtros y navegación. Antes de modificar código Next.js, leé el AGENTS.md local y la documentación instalada, como exige el proyecto. Para medir el cambio, detené el servidor y repetí build + start del paso 01.5; no midas una compilación anterior. Probá cualquier escritura solo sobre datos sintéticos aprobados.

**Antes de cada commit, también:**

```powershell
npm.cmd run validate:ai-setup
npm.cmd run test:ai-setup
git diff --check
```

El validador comprueba estructura del repositorio, no rendimiento. Si modificás backend o lógica compartida, añadí las comprobaciones con almacenamiento aislado descritas en [techContext](memory-bank/techContext.md) y [TESTING.md](TESTING.md). No necesitás tocar esas áreas sin una causa comprobada.


Para **cada problema**:

1. Confirmá la causa raíz o ajustá la hipótesis.
2. Aplicá **un cambio dirigido**.
3. Verificá visualmente y probá las funciones afectadas.
4. Ejecutá los tests, el lint o la compilación **si existen en ese proyecto**.
5. Repetí Lighthouse sobre **la misma URL, dispositivo y entorno**.
6. Anotá el antes/después y si el cambio ayudó, no cambió nada o empeoró.
7. Si el resultado se sostiene, hacé un commit específico.

Ejemplo de comandos (desde la raíz, revisando primero los archivos modificados):

```powershell
git status
git diff
git add RUTA_DEL_ARCHIVO_MODIFICADO
git diff --cached --stat
git commit -m "perf(website): reservar espacio para banner"
```

**Reemplazá `RUTA_DEL_ARCHIVO_MODIFICADO` por las rutas reales de tu cambio:** comprobá que no incluya `.env`, secretos, builds, dependencias o archivos ajenos a la tarea. Para otro problema, otro commit.

Si un cambio empeora el resultado o rompe una pantalla, investigá y corregilo antes de avanzar. **No persigas puntuaciones sacrificando funcionalidades.**

---

## 06.0 — Segunda medición: Lighthouse DESPUÉS

Primero ejecutá `npm.cmd run build:landing`. Para el backoffice, detené el servidor y repetí el paso 01.5. Conservá la API encendida y volvé a iniciar sesión si venció. No cambies los datos ni los filtros entre comparaciones.

Cuando terminaste las correcciones:

1. Volvé a levantar **ambos frontends** en las mismas condiciones que al inicio.
2. Repetí Lighthouse en las **mismas seis combinaciones** de URL y dispositivo.
3. Volvé a registrar las cuatro puntuaciones y las métricas disponibles.
4. Tomá capturas nuevas y guardalas en `audit/after/`.
5. Usá **exactamente el mismo patrón de nombres** que en `audit/before/`.

El resultado debería verse así:

```text
audit/
├── before/
│   ├── website-home-mobile.png
│   ├── website-home-desktop.png
│   ├── website-application-mobile.png
│   ├── website-application-desktop.png
│   ├── backoffice-dashboard-mobile.png
│   └── backoffice-dashboard-desktop.png
└── after/
    ├── website-home-mobile.png
    ├── website-home-desktop.png
    ├── website-application-mobile.png
    ├── website-application-desktop.png
    ├── backoffice-dashboard-mobile.png
    └── backoffice-dashboard-desktop.png
```

> **Consejo:** las puntuaciones de Lighthouse pueden variar entre ejecuciones, incluso sin modificar el código. Si podés, corré cada caso más de una vez y compará valores representativos (por ejemplo, la mediana de tres mediciones), registrando el procedimiento. Una diferencia mínima en una única ejecución **no prueba por sí sola** que el cambio haya mejorado la experiencia real.

---

## 07.0 — Crear el informe final: `REPORT.md`

En la **raíz del monorepo**, creá `REPORT.md`:

```md
# REPORT — Mejoras de rendimiento

## Resumen
- Frontends auditados: website y backoffice.
- Páginas medidas:
- Cambios principales:
- Componente o Custom Hook extraído:

## Correcciones aplicadas

### Corrección 1
- Problema original:
- Causa raíz:
- Archivos modificados:
- Cambio realizado:
- Verificación funcional:
- Commit:
- Medición antes:
- Medición después:

### Corrección 2
- Problema original:
- Causa raíz:
- Archivos modificados:
- Cambio realizado:
- Verificación funcional:
- Commit:
- Medición antes:
- Medición después:

## Refactorización
- Casos de duplicación identificados: 2
- Abstracción implementada:
- Archivos que ahora la reutilizan:
- Prueba de que sigue funcionando:

## Comparación Lighthouse
[Pegar tabla de todas las URLs y modos: antes / después]

## Uso del agente (si corresponde)
- Skill utilizada:
- Hallazgo comprobado:
- Cambios que propuso:
- Cambios que realmente aplicamos:

## Conclusión
- ¿Cuál fue la mejora de mayor impacto?
- ¿Qué métrica no mejoró o quedó pendiente?
- ¿Qué aprendimos de medir antes de corregir?
```

Para la comparativa podés usar esta tabla (completala con **tus resultados reales**):

| Frontend / URL / Modo | Perf. antes | Perf. después | Diferencia | LCP antes | LCP después | CLS antes | CLS después |
|---|---:|---:|---:|---:|---:|---:|---:|
| Website / / Mobile | — | — | — | — | — | — | — |
| Website / / Desktop | — | — | — | — | — | — | — |
| Website / application.html / Mobile | — | — | — | — | — | — | — |
| Website / application.html / Desktop | — | — | — | — | — | — | — |
| Backoffice / / Mobile | — | — | — | — | — | — | — |
| Backoffice / / Desktop | — | — | — | — | — | — | — |

**No te olvides:** además de Performance, registrá la comparación de **Accessibility, Best Practices y SEO**, en la misma tabla ampliada o en otra tabla equivalente. La consigna pide las **cuatro puntuaciones** por página y modo.

**Cómo calcular la diferencia de Performance:** `puntuación después - puntuación antes`. Por ejemplo, pasar de 62 a 76 representa **+14 puntos** (no +14 %). Si querés informar porcentajes relativos, identificalos como tales.

En la conclusión identificá **qué corrección tuvo mayor impacto**, apoyándote en las mediciones intermedias. Puede ocurrir que algunos indicadores no mejoren; explicalos sin ocultarlos.

---

## 08.0 — Entrega final en GitHub

> **Antes de publicar:** AGENTS.md conserva instrucciones del hito anterior: rama `feature/agent-memory-bank` y PR hacia `main`. Esta auditoría está en `perf/auditoria-lighthouse`. Confirmá con el responsable la rama y destino de esta entrega; no cambies de rama ni abras otra PR automáticamente. El control `--check-branch` exige la rama anterior y esa discrepancia debe registrarse. No fusiones ni despliegues.

Verificá que el repositorio incluya:

```text
maxifer-TrackFlow/
├── AUDIT.md
├── REPORT.md
├── audit/
│   ├── before/
│   └── after/
├── uis/
│   ├── website/
│   └── backoffice/
└── ...
```

Realizá el commit final de la documentación y las capturas:

```powershell
git status
git add AUDIT.md REPORT.md audit/before audit/after
git diff --cached --stat
git commit -m "docs(audit): comparar resultados antes y despues"
```

Subí tu rama a **tu repositorio**:

```powershell
git push -u origin perf/auditoria-lighthouse
```

El comando supone que creaste la rama sugerida en el paso 01.1; si estás en otra rama, usá el nombre real (`git branch --show-current`) y seguí la política de entrega de tu curso.

**Entrega:** compartí la **URL de tu repositorio de empresa** en GitHub, con las mejoras y las evidencias incluidas. No hace falta crear un repositorio separado.

---

## 09.0 — Lista de comprobación antes de entregar

- [ ] Trabajé sobre mi monorepo actual, no sobre una plantilla nueva.
- [ ] Ejecuté Lighthouse **antes y después** en website y backoffice.
- [ ] Medí como mínimo la home, otra vista corporativa y el dashboard, tanto móvil como escritorio.
- [ ] Registré **Performance, Accessibility, Best Practices y SEO** por página/modo.
- [ ] Guardé las capturas de antes en `audit/before/` y las de después en `audit/after/`.
- [ ] `AUDIT.md` explica problemas reales y causas raíz, no solo advertencias copiadas.
- [ ] Identifiqué **dos casos de código duplicado** y documenté cómo abstraerlos.
- [ ] Extraje e integré **al menos un componente reutilizable o Custom Hook**.
- [ ] Revisé las recomendaciones del agente y, si instalé skills, documenté su uso.
- [ ] Hice cambios pequeños, con commits independientes y mediciones intermedias.
- [ ] Comprobé que las funcionalidades siguen funcionando y no hay regresiones.
- [ ] `REPORT.md` compara resultados y explica cuál fue el cambio de mayor impacto.
- [ ] **Al menos una puntuación de Lighthouse mejoró en cada frontend**, sustentada por mediciones comparables.
- [ ] Subí código, `AUDIT.md`, `REPORT.md` y capturas a GitHub.

### 09.1 — Problemas frecuentes

**“No veo Lighthouse en Chrome.”**\
Abrí DevTools con F12, buscá la pestaña en el menú `>>` de herramientas o en el menú de más herramientas de DevTools.

**“El backoffice muestra login en vez de dashboard.”**\
Iniciá sesión primero. Confirmá después que el reporte corresponde a la URL y al contenido del dashboard, no a la pantalla de autenticación.

**“No encuentro INP en Lighthouse.”**\
Es esperable en una auditoría de carga. Revisá TBT para investigar bloqueo del hilo principal y utilizá herramientas de interacción o datos de usuarios reales si necesitás medir INP.

**“La puntuación subió sin tocar código.”**\
Puede variar por red, caché, CPU, extensiones, carga de la API o ejecución en desarrollo. Repetí mediciones bajo condiciones equivalentes y registrá la variación.

**“¿Dónde investigo los hallazgos en TrackFlow?”**\
Home: `uis/website/index.html` y `assets/`. Formulario: `uis/website/application.html`, `validation.js` e `i18n.js`. Dashboard de inicio: `uis/backoffice/src/app/page.tsx`, `src/components/` y `src/lib/`. Son puntos de inspección, no fallos confirmados. No crees carpetas paralelas ni conviertas la landing a React para cumplir la consigna.

**“La refactorización no mejora Performance.”**\
No es un error: reutilizar código busca principalmente **mantenibilidad**. Las mejoras de Lighthouse deben venir de correcciones de rendimiento demostrables.

---

## Referencias para consultar

- [Monorepo base de 4Geeks Academy](https://github.com/4GeeksAcademy/ai-engineering-company-project-monorepo)
- [Lighthouse en Chrome DevTools](https://developer.chrome.com/docs/lighthouse/overview)
- [Core Web Vitals y sus métricas oficiales](https://web.dev/articles/vitals?hl=es-419)
- [Skills: core-web-vitals](https://www.skills.sh/addyosmani/web-quality-skills/core-web-vitals)
- [Skills: performance](https://www.skills.sh/addyosmani/web-quality-skills/performance)
- [Skills: web-perf de Cloudflare](https://www.skills.sh/cloudflare/skills/web-perf)

> **Idea central de la práctica:** en un proyecto profesional no alcanza con decir “optimicé el frontend”. Tenemos que poder mostrar **qué problema encontramos, por qué ocurría, qué cambiamos y cuánto mejoró**. Ese es el ciclo completo de una auditoría técnica.
