# REPORT — Mejoras de rendimiento

## Resumen

- Frontends auditados: website público y backoffice de TrackFlow.
- Páginas medidas: Home del website (`/`), formulario (`/application`) y dashboard del backoffice (`/`), en Mobile y Desktop. El usuario confirma que las seis capturas after corresponden a las páginas y modos indicados. La URL exacta final del formulario sigue pendiente de comprobar: el archivo estático es `/application.html` y la línea base midió `/application`.
- Cambios principales: reserva de espacio durante la carga/error de los resúmenes del dashboard, separación de colores de texto y acciones en el backoffice y corrección del nombre accesible de la marca del website.
- Componente extraído: `MetricCard`, compartido por Home y SuppliersPage.
- Fecha de registro de los resultados after: 7 de noviembre de 2026. Los valores fueron comunicados por el usuario; no se ejecutó una nueva medición durante la redacción de este informe.

El diagnóstico inicial y sus causas comprobadas e hipótesis se conservan en [AUDIT.md](AUDIT.md). Este informe documenta el estado del trabajo; quedan verificaciones pendientes antes de cerrar la auditoría.

## Correcciones aplicadas

### Corrección 1 — Geometría de los resúmenes del dashboard

- Problema original: cambios de altura al sustituir skeletons por métricas o mensajes de error; CLS Desktop de 0.252.
- Causa raíz: el skeleton original no conservaba la geometría del contenido final. Lighthouse señala desplazamientos en la sección de proveedores, aunque falta aislar la secuencia completa y no se atribuye todo el CLS a ella.
- Archivos modificados: [page.tsx](uis/backoffice/src/app/page.tsx). Reutiliza [MetricCard.tsx](uis/backoffice/src/components/MetricCard.tsx).
- Cambio realizado: conservar etiquetas, columnas y tarjetas durante la carga; en error, mantener el grid invisible y fuera del árbol accesible para reservar espacio, con el aviso en la misma celda.
- Verificación funcional: el registro de esta corrección documenta lint, build y 4 suites/15 pruebas del backoffice aprobados. Pendiente comprobación visual con carga demorada, éxito, vacío y error, en ambos temas y tamaños. Estas comprobaciones no se repitieron al redactar el informe.
- Commit: `c81ba64` — `perf(backoffice): conservar geometria de los resumenes al cargar`.
- Medición antes: dashboard Desktop CLS 0.252 y Performance 87; Mobile CLS 0.069 y Performance 87.
- Medición después: Desktop CLS 0.083 y Performance 98; Mobile CLS 0.069 y Performance 89. Son mediciones globales, sin aislamiento del efecto de esta corrección ni equivalencia de entorno comprobada.

### Corrección 2 — Contraste del backoffice

- Problema original: Accessibility 96 en ambos modos; contraste insuficiente en textos de estado y acciones del tema oscuro.
- Causa raíz: el mismo color de acento se utilizaba como texto sobre fondos oscuros y como fondo de acciones con texto blanco.
- Archivos modificados: [globals.css](uis/backoffice/src/app/globals.css) y [AppShell.tsx](uis/backoffice/src/components/AppShell.tsx).
- Cambio realizado: separar `--accent` para texto y `--action` para fondos; usar un acento más claro en tema oscuro y conservar un fondo de acción oscuro para el texto blanco. Botones y navegación activa usan `bg-action`.
- Verificación funcional: separación de tokens y consumidores comprobada en el diff. Pendiente consolidar evidencia específica de contraste y revisión visual de ambos temas, hover y foco; la puntuación global no verifica todos los consumidores del CSS.
- Commit: `f57285a` — `fix(backoffice): separar colores de texto y acciones`.
- Medición antes: Accessibility 96 en dashboard Mobile y Desktop.
- Medición después: Accessibility 100 en ambos modos. Falta el detalle del reporte after para confirmar qué auditorías cambiaron.

### Corrección 3 — Nombre accesible de la marca del website

- Problema original: `label-content-name-mismatch` en las páginas públicas; Application Desktop tenía Accessibility 96.
- Causa raíz: los `aria-label` de la marca sustituían el nombre derivado del contenido y omitían parte del texto visible.
- Archivos modificados: [index.html](uis/website/index.html), [application.html](uis/website/application.html) e [i18n.js](uis/website/i18n.js).
- Cambio realizado: retirar los nombres incompletos y evitar que la traducción de Home los reintroduzca en el enlace con logo; el nombre se deriva del contenido.
- Verificación funcional: build de landing aprobado según el registro previo, con aviso de caniuse-lite desactualizado. Pendiente revisión de navegación, idioma, nombre accesible y lector de pantalla. No se repitió el build al redactar el informe.
- Commit: `28cf504` — `fix(website): derivar nombre accesible de la marca visible`.
- Medición antes: Accessibility Home 100/100 y Application 100/96 (Mobile/Desktop).
- Medición después: las mismas puntuaciones. Application Desktop continúa en 96; falta revisar la auditoría concreta antes de cerrar el hallazgo.

El canonical relativo del website continúa pendiente por falta de dominio público aprobado. Tampoco se da por resuelta la causa de los errores HTTP 500 iniciales: las puntuaciones after no sustituyen la comprobación de Network y logs.

## Refactorización

- Casos de duplicación identificados: **2**, documentados en [AUDIT.md](AUDIT.md).
- Caso 1: lógica de menú móvil repetida en Home y Application. Se propone una inicialización compartida; no se ha extraído.
- Caso 2: marcado de tarjetas de métricas repetido en Home y SuppliersPage.
- Abstracción implementada: [MetricCard](uis/backoffice/src/components/MetricCard.tsx), con etiqueta, valor, tono y estado de carga. Los cálculos y peticiones permanecen en cada página.
- Archivos que ahora la reutilizan: [Home](uis/backoffice/src/app/page.tsx) y [SuppliersPage](uis/backoffice/src/app/suppliers/page.tsx).
- Commit: `720f272` — `docs(audit): registrar mediciones iniciales y extraer MetricCard`.
- Prueba de que sigue funcionando: lint, build y 4 suites/15 pruebas existentes aprobados al realizar la extracción, según AUDIT.md. Pendientes comprobaciones visuales y filtros/escrituras en navegador. La refactorización mejora mantenibilidad; no se le atribuye una mejora de Performance.

## Comparación Lighthouse

### Performance y métricas de carga

LCP, FCP y Speed Index se expresan en segundos; TBT en milisegundos. La diferencia de Performance se expresa en puntos.

| Frontend / ruta / modo | Perf. antes | Perf. después | Diferencia | LCP antes | LCP después | CLS antes | CLS después |
|---|---:|---:|---:|---:|---:|---:|---:|
| Website / Home / Mobile | 94 | 100 | +6 | 1.657 | 1.7 | 0 | 0 |
| Website / Home / Desktop | 100 | 100 | 0 | 0.405 | 0.4 | 0 | 0 |
| Website / Application / Mobile | 96 | 100 | +4 | 1.056 | 1.0 | 0 | 0 |
| Website / Application / Desktop | 100 | 100 | 0 | 0.252 | 0.3 | 0 | 0 |
| Backoffice / dashboard `/` / Mobile | 87 | 89 | +2 | 2.797 | 3.1 | 0.069 | 0.069 |
| Backoffice / dashboard `/` / Desktop | 87 | 98 | +11 | 0.656 | 0.7 | 0.252 | 0.083 |

### Accessibility, Best Practices y SEO

Cada celda muestra **antes → después**.

| Página / modo | Accessibility | Best Practices | SEO |
|---|---:|---:|---:|
| Home / Mobile | 100 → 100 | 100 → 100 | 92 → 92 |
| Home / Desktop | 100 → 100 | 100 → 100 | 92 → 92 |
| Application / Mobile | 100 → 100 | 100 → 100 | 92 → 92 |
| Application / Desktop | 96 → 96 | 100 → 100 | 92 → 92 |
| Dashboard / Mobile | 96 → 100 | 96 → 96 | 100 → 92 |
| Dashboard / Desktop | 96 → 100 | 96 → 100 | 100 → 100 |

### Métricas complementarias

Cada celda muestra **antes → después**.

| Página / modo | FCP (s) | TBT (ms) | Speed Index (s) |
|---|---:|---:|---:|
| Home / Mobile | 0.846 → 0.8 | 284 → 20 | 0.846 → 0.8 |
| Home / Desktop | 0.219 → 0.3 | 27 → 0 | 0.314 → 0.3 |
| Application / Mobile | 0.883 → 1.0 | 246.5 → 0 | 0.883 → 1.0 |
| Application / Desktop | 0.223 → 0.2 | 25 → 0 | 0.308 → 0.3 |
| Dashboard / Mobile | 0.833 → 0.8 | 344.5 → 250 | 1.144 → 1.0 |
| Dashboard / Desktop | 0.218 → 0.2 | 25 → 0 | 0.380 → 0.3 |

### Evidencias y límites de comparación

| Caso | JSON antes | Captura antes | Captura después |
|---|---|---|---|
| Home Mobile | [JSON](audit/before/website-home-mobile.json) | [PNG](audit/before/website-home-mobile.png) | [PNG](audit/after/website-home-mobile.png) |
| Home Desktop | [JSON](audit/before/website-home-desktop.json) | [PNG](audit/before/website-home-desktop.png) | [PNG](audit/after/website-home-desktop.png) |
| Application Mobile | [JSON](audit/before/website-application-mobile.json) | [PNG](audit/before/website-application-mobile.png) | [PNG](audit/after/website-application-mobile.png) |
| Application Desktop | [JSON](audit/before/website-application-desktop.json) | [PNG](audit/before/website-application-desktop.png) | [PNG](audit/after/website-application-desktop.png) |
| Dashboard Mobile | [JSON](audit/before/backoffice-dashboard-mobile.json) | [PNG](audit/before/backoffice-dashboard-mobile.png) | [PNG](audit/after/backoffice-dashboard-mobile.png) |
| Dashboard Desktop | [JSON](audit/before/backoffice-dashboard-desktop.json) | [PNG](audit/before/backoffice-dashboard-desktop.png) | [PNG](audit/after/backoffice-dashboard-desktop.png) |

Las seis capturas after están presentes y enlazadas. El usuario confirma que cada captura corresponde a la página y modo correctos, que las puntuaciones coinciden con el informe y que el dashboard muestra el contenido esperado. Se da por completado ese cotejo mediante confirmación del usuario, sin revisión visual independiente del agente. Las métricas de tiempos y CLS conservan los valores y el redondeo comunicados previamente; esta confirmación no añade un cotejo específico de esas métricas. No hay JSON after en la carpeta.

La línea base contiene una ejecución por caso, extensiones activas y advertencias de almacenamiento. Hubo respuestas de API distintas entre modos. El usuario confirma las mismas condiciones salvo extensiones, desactivadas en el after. Faltan los metadatos exportados del after, su hora y número de repeticiones, además de la URL final exacta del formulario. No hay una pareja controlada con el mismo estado de extensiones ni una mediana de ejecuciones. Estas diferencias describen resultados observados, sin demostrar causalidad de los cambios de código. INP no se midió; TBT no se presenta como INP.

## Verificación de la sección 09 — 7 de noviembre de 2026

El usuario confirma que realizó las pruebas en navegador y autoriza la publicación con las mediciones existentes. La verificación funcional se registra como confirmación humana general: no se aportó un desglose de casos ni se afirma que el agente los haya ejecutado. Esta confirmación actualiza las notas de verificación pendientes de las correcciones. Las limitaciones metodológicas siguientes se conservan para la entrega y no bloquean la publicación autorizada.

El usuario confirma las mismas condiciones de medición salvo las extensiones: el después se ejecutó sin extensiones, mientras que los JSON iniciales contienen tareas de extensiones. Por tanto, las diferencias registradas son observaciones válidas de esas ejecuciones, pero no una comparación controlada del efecto del código. Esta confirmación sustituye la incertidumbre anterior sobre las condiciones comunicadas; las versiones y ajustes exactos del after no tienen un registro exportado.

| Requisito | Estado verificable |
|---|---|
| Monorepo actual | Cumplido: se conserva la estructura de TrackFlow. |
| Lighthouse antes/después en ambos frontends | Documentado con seis casos antes y seis capturas después aportados por el usuario. |
| Home, Application y dashboard en móvil/escritorio | Cumplido; URL final exacta de Application pendiente de cotejo. |
| Cuatro puntuaciones por caso | Cumplido en las tablas de este informe. |
| Capturas antes/después | Cumplido; nombres del dashboard after unificados con before. |
| Diagnóstico con causas | Cumplido en AUDIT.md, con hipótesis diferenciadas. |
| Dos duplicaciones y propuestas | Cumplido: menú móvil y tarjetas de métricas. |
| Componente reutilizado | Cumplido: MetricCard en Home y SuppliersPage. |
| Recomendaciones y skills documentadas | Cumplido en AUDIT.md y este informe. |
| Cambios pequeños, commits independientes y mediciones intermedias | Parcial: tres correcciones en commits independientes; sin mediciones intermedias históricas. |
| Funcionalidades y regresiones | Controles automáticos aprobados y pruebas en navegador confirmadas por el usuario, sin desglose de casos. |
| Comparación e identificación de la corrección de mayor impacto | Parcial: mayor mejora observada identificada; efecto individual sin aislar. |
| Mejora por frontend con condiciones comparables | Pendiente: resultados superiores registrados, con diferencia de extensiones entre antes y después. |
| Publicación en GitHub | Cumplido: rama perf/auditoria-lighthouse publicada en origin. Crear PR mediante la integración devuelve HTTP 403 por falta de permisos; PR pendiente. |

Controles repetidos durante esta revisión: `npm.cmd run build:landing`, tests del backoffice (4 suites/15 pruebas), lint y build del backoffice aprobados. Persisten los avisos de caniuse-lite desactualizado y de múltiples lockfiles. No se ejecutó Lighthouse ni se comprobó la interfaz en navegador en esta revisión.

Validación del repositorio: 34 controles estructurales y 7 pruebas del validador aprobados; `git diff --check` aprobado. `--check-branch` falla únicamente porque exige `feature/agent-memory-bank` y la auditoría utiliza `perf/auditoria-lighthouse`. Los 18 enlaces de evidencias de este informe apuntan a archivos existentes.

Para cerrar la comparación, conservar las evidencias históricas y crear una pareja nueva de mediciones sin extensiones, con las mismas versiones, servidor de producción, ruta final, tema, viewport, throttling, caché y sesión/datos sintéticos. Ejecutar tres veces por caso y registrar mediana y rango. La línea base debe usar una copia aislada anterior a las correcciones, sin revertir el árbol actual ni conectar datos reales. Medir sucesivamente cada corrección permite estudiar su efecto individual; no reconstruye las mediciones históricas ausentes.

Como referencia de cobertura funcional se conserva la lista: navegación e idiomas de ambas páginas públicas, validación del formulario sin envío real, login y protección de rutas, navegación/listados/filtros, y resúmenes del dashboard con carga demorada, éxito, vacío y error en ambos temas y tamaños. La confirmación general del usuario no detalla estos casos. Revisar los errores 500 y las auditorías after de SEO Mobile y Accessibility de Application Desktop sigue siendo una recomendación de seguimiento; no se cierran estos hallazgos únicamente por la puntuación global.

## Uso del agente (si corresponde)

- Skills utilizadas en el diagnóstico: `core-web-vitals` y `performance`, instaladas en `.agents/skills/`, versión declarada 2.0. No se registró SHA upstream.
- Hallazgos comprobados: geometría distinta entre carga y contenido del dashboard, reutilización del color de acento con contraste insuficiente, nombres accesibles incompletos, canonical relativo y tareas de extensiones en las mediciones iniciales. Las causas de los 500 y la contribución de hidratación al LCP siguen sin confirmar.
- Cambios propuestos: estabilizar placeholders, separar tokens de contraste, derivar el nombre accesible del contenido, repetir mediciones sin interferencias e investigar errores de API. Canonical requiere dominio aprobado; otros cambios de rendimiento requieren perfil adicional.
- Cambios realmente aplicados: las tres correcciones descritas y la extracción de MetricCard. No se modificaron dominio canonical, autenticación ni lógica del backend para cerrar este informe.
- El agente consolidó las mediciones comunicadas por el usuario y revisó el diff; no ejecutó Lighthouse ni generó valores after.

## Conclusión

La mayor mejora observada corresponde al dashboard Desktop: Performance pasa de **87 a 98 (+11 puntos)** y CLS de **0.252 a 0.083**, por debajo de la referencia 0.1 de la guía. La corrección de geometría aborda una causa comprobada, pero no hay mediciones intermedias comparables que permitan identificar con certeza qué corrección tuvo mayor impacto. En el website, Home Mobile pasa de 94 a 100 y Application Mobile de 96 a 100.

Los resultados también muestran pendientes: el LCP del dashboard Mobile sube de 2.797 a 3.1 s, su SEO baja de 100 a 92 y su TBT sigue en 250 ms. Application Desktop conserva Accessibility 96 y el website SEO 92. El CLS Mobile del dashboard permanece en 0.069. Las pequeñas diferencias de tiempos deben interpretarse considerando el distinto redondeo y la variabilidad del entorno.

Medir antes de corregir permitió distinguir problemas propios del producto de interferencias de extensiones y evitar atribuir mejoras de rendimiento a una refactorización de mantenibilidad. El usuario confirma las pruebas en navegador y autoriza entregar los resultados existentes con sus límites. Las tres correcciones tienen commits independientes. La comparación controlada y el análisis de auditorías que siguen fallando quedan como seguimiento documentado; no se afirma cumplimiento experimental completo de la sección 09.
