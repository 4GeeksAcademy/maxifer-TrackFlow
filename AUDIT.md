# AUDIT — Auditoría inicial

## Actualización de verificación — 7 de noviembre de 2026

El usuario confirma posteriormente las pruebas en navegador y autoriza commits y publicación de la auditoría con los resultados existentes. Se registra confirmación humana general sin desglose de casos; no cambia la diferencia conocida de extensiones ni acredita mediciones intermedias. Correcciones en commits c81ba64 (geometría), f57285a (contraste) y 28cf504 (nombre accesible). El diagnóstico inicial y sus hipótesis pendientes se conservan como registro histórico.

El usuario confirma condiciones iguales salvo extensiones: las mediciones después se hicieron sin ellas; las iniciales contienen tareas de extensiones. No se acredita una comparación controlada del efecto del código. Las seis capturas after están presentes; sus nombres del dashboard se unifican con el patrón before. El estado detallado de los requisitos de la sección 09 y el procedimiento pendiente se registran en REPORT.md. Esta actualización prevalece sobre las notas históricas que todavía indican ausencia de confirmación de condiciones o capturas.

## Registro after comunicado

El usuario aporta dashboard del backoffice Desktop: Performance 98, Accessibility 100, Best Practices 100, SEO 100; FCP 0.2 s, LCP 0.7 s, TBT 0 ms, CLS 0.083 y Speed Index 0.3 s. Comparativa en [REPORT.md](REPORT.md): Performance +11 puntos, Accessibility y Best Practices +4 cada una; CLS de 0.252 a 0.083. Con este registro están comunicadas las seis combinaciones after. Evidencias y equivalencia del entorno pendientes de verificar; sin atribución causal ni cierre de hallazgos solo por puntuaciones.

El usuario aporta dashboard del backoffice Mobile: Performance 89, Accessibility 100, Best Practices 96, SEO 92; FCP 0.8 s, LCP 3.1 s, TBT 250 ms, CLS 0.069 y Speed Index 1.0 s. Comparativa en [REPORT.md](REPORT.md): Performance +2 puntos, Accessibility +4, SEO −8; LCP aumenta y CLS se mantiene. Revisar el reporte after para investigar SEO y verificar contenido, entorno y errores; sin atribución causal ni cierre de hallazgos a partir de puntuaciones.

El usuario aporta `/application` Desktop: Performance 100, Accessibility 96, Best Practices 100, SEO 92; FCP 0.2 s, LCP 0.3 s, TBT 0 ms, CLS 0 y Speed Index 0.3 s. Comparativa en [REPORT.md](REPORT.md). Las cuatro puntuaciones coinciden con la línea base; Accessibility permanece en 96. No se identifica el fallo actual sin revisar el reporte after. Entorno, repeticiones y evidencias pendientes de verificar.

El usuario aporta `/application` Mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 92; FCP 1.0 s, LCP 1.0 s, TBT 0 ms, CLS 0 y Speed Index 1.0 s. Comparativa con la línea base en [REPORT.md](REPORT.md). Entorno, repeticiones y evidencias pendientes de verificar.

El usuario aporta además website Mobile: Performance 100, Accessibility 100, Best Practices 100, SEO 92; FCP 0.8 s, LCP 1.7 s, TBT 20 ms, CLS 0 y Speed Index 0.8 s. Registrado junto con Desktop en [REPORT.md](REPORT.md), interpretando Home como ruta provisional. Entorno y evidencias de esta ejecución pendientes de verificar.

El usuario confirma que la medicion after corresponde a website Desktop: Performance 100, Accessibility 100, Best Practices 100, SEO 92; FCP 0.3 s, LCP 0.4 s, TBT 0 ms, CLS 0 y Speed Index 0.3 s. Comparativa parcial en [REPORT.md](REPORT.md), con Home como ruta provisional. No corresponde a Mobile.

## Cierre del diagnóstico — sección 04

Alcance acordado el 7 de noviembre de 2026: investigar website y backoffice con las seis evidencias existentes, instalar y utilizar skills, sin implementar correcciones. Los datos son sintéticos según confirmación del usuario. Cierre documental del análisis disponible; las causas que necesitan trazas o logs siguen abiertas.

### Skills utilizadas y evidencia de uso

Instaladas localmente desde [addyosmani/web-quality-skills](https://github.com/addyosmani/web-quality-skills), rama `main`, mediante el helper de `skill-installer` con destino `.agents/skills`:

```powershell
python C:/Users/Equipo/.codex/skills/.system/skill-installer/scripts/install-skill-from-github.py --repo addyosmani/web-quality-skills --path skills/core-web-vitals skills/performance --dest .agents/skills
```

- [core-web-vitals](.agents/skills/core-web-vitals/SKILL.md), metadata versión 2.0: aplicada a LCP, CLS y ausencia de INP medido. Leídas sus referencias LCP, CLS e INP. Resultado: priorizar estabilidad del dashboard; distinguir elemento desplazado de causa y retraso de texto de descarga de imágenes.
- [performance](.agents/skills/performance/SKILL.md), metadata versión 2.0, y [MEASUREMENT](.agents/skills/performance/references/MEASUREMENT.md): aplicadas a tareas largas, reflow y peticiones. Resultado: separar interferencia externa, trabajo propio e hipótesis de carga; no aplicar presupuestos genéricos como requisitos del negocio.
- Instalación confirmada por el helper y lectura directa de los archivos en esta sesión. La descarga se hizo desde una rama mutable; no se registró un SHA upstream y la versión declarada no equivale a una revisión inmutable. Los archivos locales conservan las instrucciones utilizadas.

No se ejecutaron nuevas navegaciones, trazas, Lighthouse ni consultas CrUX/RUM. No hay datos de campo disponibles en esta revisión ni p75 que permita afirmar el estado de Core Web Vitals de usuarios reales. Se conserva la limitación de extensiones, IndexedDB y una ejecución por caso por decisión del usuario. TBT no sustituye INP.

### Priorización y decisiones

La evidencia cuantitativa detallada y los enlaces a reportes están en los nueve problemas de este documento. Esta tabla define corrección mínima candidata, evidencia faltante y riesgo; todas las correcciones quedan propuestas.

| Orden | Hallazgo y archivos exactos | Estado y causa | Siguiente corrección o investigación mínima | Evidencia pendiente y riesgo de regresión |
|---|---|---|---|---|
| 1 | Errores 500: `uis/backoffice/src/components/AppShell.tsx`, `uis/backoffice/next.config.ts`, `services/api/routers/suppliers.py` | Fallos medidos; causa de servidor desconocida. Impiden comparar estados equivalentes. | Correlacionar solicitudes de perfil/proveedores con logs API y proxy en entorno aislado; corregir únicamente la causa reproducida. | Falta traceback y reproducción. No ocultar el fallo ni cambiar autenticación o contratos por conjetura. |
| 2 | CLS: `uis/backoffice/src/app/page.tsx`, `uis/backoffice/src/components/LoadingSkeleton.tsx`, `uis/backoffice/src/app/globals.css` | Desktop 0.251940; Mobile 0.068999. Geometría de placeholder y contenido distinta. El nodo proveedores desplazado no prueba que origine todo el movimiento. | Igualar estructura responsive del placeholder a cuatro métricas de incidencias y tres de proveedores; reservar espacio en error. | Aislar desplazamientos y estados carga/éxito/error/vacío. Riesgo de huecos, overflow y contenido recortado; evitar altura rígida sin verificar. |
| 3 | Contraste: `uis/backoffice/src/app/globals.css`, `uis/backoffice/src/components/IncidentStatusBadge.tsx` | Fallo medido; accent compartido para texto y fondo produce combinaciones insuficientes. | Separar color de texto de color de acción y revisar ambos selectores de tema oscuro. | Validar claro/oscuro, hover, foco, badges y sidebar. Aclarar un único accent puede empeorar botones blancos. |
| 4 | LCP/hidratación: `uis/backoffice/src/components/AuthGuard.tsx`, `uis/backoffice/src/lib/auth.ts`, `uis/backoffice/src/app/page.tsx` | LCP Mobile 2.797 s de un párrafo. Snapshot servidor de token nulo y transición a contenido comprobados en fuente; contribución temporal no demostrada. No hay evidencia de error de hidratación. | Perfilar recuperación de sesión, hidratación y aparición de cabecera antes de elegir un cambio. | Traza limpia con sesión válida, ausente y expirada. Riesgo de redirecciones o exposición de contenido privado si se altera guard sin prueba. |
| 5 | Reflow home: `uis/website/index.html`, `getHeaderOffset` y `updateActiveNavLink` | Lectura geométrica identificada por Lighthouse: 40.804 ms Mobile / 47.242 ms Desktop; escritura desencadenante sin aislar. | Evaluar lecturas agrupadas, una actualización por frame y altura cacheada con invalidación por resize/cambio de idioma. | Perfil de scroll, anclas, FAQ y menú. Riesgo de offset incorrecto, enlace activo atrasado o caché obsoleta. Ya existe requestAnimationFrame en clic de ancla; añadirlo allí sin más no resuelve la causa. |
| 6 | Nombre accesible: `uis/website/index.html`, `uis/website/application.html` | Fallo medido; aria-label omite parte del texto visible. | Derivar nombre del contenido o incluir texto completo y traducción. | Verificar árbol accesible, navegación de marca y español/inglés; riesgo de etiquetas duplicadas o traducción inconsistente. |
| 7 | Canonical: `uis/website/index.html`, `uis/website/application.html` | Fallo medido por URL relativa. | Usar URL absoluta cuando se confirme dominio público y URL preferida del formulario. | Dominio pendiente; riesgo de consolidar SEO hacia un host equivocado. No implementar con localhost. |
| 8 | TBT/cargas: scripts inline del website y componentes cliente del backoffice | Tareas de extensiones y propias medidas. No hay función propia identificada que justifique dividir bundles o memoizar componentes ahora. | Perfilar tareas propias e iniciadores de peticiones; mantener extensiones fuera de una futura comparación de código. | INP e interacción sin medir. Riesgo de romper orden de inicialización, idioma o formularios al diferir scripts sin causalidad. |
| 9 | Hero/CSS/caché: `uis/website/index.html`, `scripts/optimize-hero.mjs` | Hero AVIF ya priorizado y con dimensiones; CLS del website 0. Ahorro estimado de imagen 35932 bytes; TTL local no describe producción. | Evaluar variantes/compresión con revisión visual si se prioriza transferencia; comprobar hosting antes de cambiar caché. | Riesgo de degradar recorte/calidad, generar doble descarga o flashes al diferir CSS. No se justifican infraestructura nueva ni lazy loading del hero. |

### Cargas y coordinación: ampliación verificada en fuente

- `AppShell.tsx` renderiza dos instancias de `SidebarContent`, una móvil y otra de escritorio, y cada una ejecuta su efecto de `/backend/auth/me`. Ocultar por CSS no evita ejecutar el efecto. Los JSON de ambos modos contienen cuatro solicitudes al perfil; la doble instancia explica una oportunidad concreta de compartir la lectura, pero no prueba por sí sola el origen de las cuatro ni del 500. Propuesta posterior: cargar el perfil una vez en un propietario común manteniendo actualización por `trackflow-profile-state`, cambio de token y logout. Verificar Network e iniciadores antes/después; riesgo de datos obsoletos entre sesiones.
- `Home` usa `await Promise.allSettled` para resumen, lista y proveedores; solo después actualiza los tres paneles. Las solicitudes empiezan en paralelo, pero la publicación de resultados queda ligada a la más lenta. Es un acoplamiento comprobado en código, con impacto temporal pendiente. Si una traza demuestra espera perceptible, resolver cada panel al terminar su solicitud conservando cancelación lógica y errores independientes. Riesgo: estados parciales incoherentes; no se atribuye este punto al párrafo LCP, que no depende de esos datos.
- `Home` descarga la lista de incidencias, la copia, ordena y recorta a cinco; también descarga proveedores completos para contar estados. Es trabajo comprobado, sin cuello de botella demostrado con este volumen. No se propone cambiar endpoints o añadir virtualización: solo se pintan cinco filas recientes. Medir tamaño, duración y CPU con volumen representativo antes de ampliar alcance al backend.
- Los JSON incluyen peticiones `_rsc` a rutas enlazadas y dos solicitudes de proveedores en Desktop. No bastan para calificar el prefetch de desperdicio ni para atribuir una doble llamada a una única ejecución del efecto de Home. Se necesitan iniciadores y secuencia de navegación/montaje.

### Comprobación posterior prevista

Para una futura corrección: conservar build de producción, misma URL, viewport, throttling, tema, sesión y datos sintéticos; comprobar carga, éxito, error y vacío. Registrar al menos tres navegaciones equivalentes con mediana y rango si se decide por una métrica. La nueva línea base limpia deberá medirse antes de tocar código; compararla con estos reportes contaminados solo aporta contexto. Repetir la medición del dashboard `/`, la vista interna seleccionada para esta auditoría. Probar navegación, filtros, formulario, menú/FAQ, idioma y sesión según el archivo afectado. Las comprobaciones visuales, lector de pantalla y trazas siguen pendientes.

No se crea un informe de mejoras aplicadas: en este alcance no hay correcciones ni mediciones después. Las recomendaciones quedan listas para seleccionar una intervención concreta.

## Entorno de medición

- Fecha: 7 de noviembre de 2026, 17:31–17:43 de Uruguay (UTC−03:00), extraída de `fetchTime`.
- Navegador: Google Chrome confirmado por el usuario; el hostUserAgent declara Chrome 157.0.0.0 sobre Windows 10 x64. No se verificó la versión completa en «Acerca de Chrome».
- Modo de ejecución: website `build:landing` + `serve`; backoffice `build` + `start`, según confirmación del usuario de que siguió la guía. No se ejecutaron nuevas mediciones en esta revisión.
- URLs medidas: `http://localhost:3000/`, `http://localhost:3000/application` y `http://localhost:3001/`; requestedUrl y finalDisplayedUrl coinciden. El formulario corresponde a `uis/website/application.html`, pero la URL medida no lleva extensión. El dashboard medido es `/`; los nodos y capturas integradas muestran «Backoffice operativo», no el login. El usuario confirma el dashboard `/` como alcance; no queda pendiente medir otra ruta interna.
- Dispositivos simulados: Mobile y Desktop (configSettings.formFactor). Mobile: 412 × 823, DPR 1.75, RTT 150 ms, 1638.4 Kbps, CPU ×4. Desktop: RTT 40 ms, 10240 Kbps, CPU ×1; screenEmulation.disabled=true, por lo que el tamaño móvil residual de ese objeto no describe el viewport Desktop. El dashboard Desktop conserva tarjetas apiladas en su captura.
- Versiones: Lighthouse 13.5.0, canal DevTools, throttlingMethod=simulate. Node y serve utilizados al medir: no registrados. En esta revisión posterior, Node local v26.13.0 y npm 11.20.0; no se atribuyen retrospectivamente a las mediciones.
- Commit y rama: código revisado sobre `2a23e48`, rama `perf/auditoria-lighthouse`. Commit exacto medido: no consta en los reportes. El usuario autorizó expresamente el primer commit local en esta rama; la exigencia de `feature/agent-memory-bank` pertenece al hito anterior. No se cambia de rama ni se altera el validador.
- Cantidad de incidencias y filtros: el dashboard muestra 95 incidencias (29 abiertas, 0 en curso y 52 resueltas; no se inventa el estado de las 14 restantes). Home llama a getIncidents({}), sin filtros explícitos, ordena por fecha y muestra cinco recientes. El usuario confirmó el 7 de noviembre de 2026 que los datos son sintéticos. No se consultaron bases ni se modificaron datos.
- Caché/almacenamiento: los seis reportes advierten de IndexedDB existente. disableStorageReset=false; clearStorageTypes incluye file_systems, shader_cache, service_workers y cache_storage, pero no local_storage. Hay scripts chrome-extension:// en tareas y diagnósticos JavaScript: no es un perfil limpio.
- Número de repeticiones y valores individuales: una ejecución por combinación, registrada abajo. No hay medianas ni evidencia de variabilidad o mejora antes/después.
- Evidencias: el usuario confirmó que las capturas y reportes guardados inicialmente en audit/after corresponden al antes. La línea base queda en audit/before con los nombres enlazados abajo; se retiraron de audit/after los 12 duplicados tras verificar igualdad SHA-256. audit/after queda vacía, reservada para nuevas mediciones posteriores a las correcciones. Esto no prueba ausencia de cambios previos ni constituye una segunda medición comparable.

## Puntuaciones iniciales

Extraídas de categories.*.score ×100 y audits.*.numericValue. Los decimales explican diferencias frente al redondeo comunicado inicialmente.

| Página | Modo | Performance | Accessibility | Best Practices | SEO | FCP (s) | LCP (s) | CLS | TBT (ms) | Speed Index (s) | Respuesta documento (ms) |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Website / | Mobile | 94 | 100 | 100 | 92 | 0.846 | 1.657 | 0 | 284 | 0.846 | 3 |
| Website / | Desktop | 100 | 100 | 100 | 92 | 0.219 | 0.405 | 0 | 27 | 0.314 | 5 |
| Website /application | Mobile | 96 | 100 | 100 | 92 | 0.883 | 1.056 | 0 | 246.5 | 0.883 | 3 |
| Website /application | Desktop | 100 | 96 | 100 | 92 | 0.223 | 0.252 | 0 | 25 | 0.308 | 3 |
| Backoffice / | Mobile | 87 | 96 | 96 | 100 | 0.833 | 2.797 | 0.069 | 344.5 | 1.144 | 2 |
| Backoffice / | Desktop | 87 | 96 | 96 | 100 | 0.218 | 0.656 | 0.252 | 25 | 0.380 | 2 |

Respuesta documento corresponde a server-response-time.numericValue, no al TTFB completo de navegación. El desglose LCP aporta tiempos de traza distintos de las métricas simuladas (por ejemplo, TTFB 5.698 ms en backoffice Mobile). INP: N/D; no se deduce de TBT.

| Página / modo | Hora Uruguay | Reporte completo | Captura |
|---|---|---|---|
| Home Mobile | 17:31:11 | [JSON](audit/before/website-home-mobile.json) | [PNG](audit/before/website-home-mobile.png) |
| Home Desktop | 17:34:52 | [JSON](audit/before/website-home-desktop.json) | [PNG](audit/before/website-home-desktop.png) |
| Formulario Mobile | 17:37:06 | [JSON](audit/before/website-application-mobile.json) | [PNG](audit/before/website-application-mobile.png) |
| Formulario Desktop | 17:39:26 | [JSON](audit/before/website-application-desktop.json) | [PNG](audit/before/website-application-desktop.png) |
| Dashboard Mobile | 17:41:40 | [JSON](audit/before/backoffice-dashboard-mobile.json) | [PNG](audit/before/backoffice-dashboard-mobile.png) |
| Dashboard Desktop | 17:43:32 | [JSON](audit/before/backoffice-dashboard-desktop.json) | [PNG](audit/before/backoffice-dashboard-desktop.png) |

## Problemas detectados

### Problema 1 — Errores al cargar proveedores y perfil

- Frontend y URL: backoffice `http://localhost:3001/`, ambos modos.
- Indicador afectado: Best Practices 96 y fiabilidad funcional.
- Evidencia de Lighthouse: errors-in-console registra HTTP 500 en /backend/auth/me (Mobile) y dos entradas en /backend/suppliers (Desktop). La captura Desktop muestra «No se pudieron cargar los proveedores»; Mobile llegó a mostrar 13 proveedores activos. Las respuestas no fueron equivalentes.
- Archivo o componente involucrado: [Home](uis/backoffice/src/app/page.tsx), [SidebarContent](uis/backoffice/src/components/AppShell.tsx), [apiFetch](uis/backoffice/src/lib/auth.ts), [rewrites](uis/backoffice/next.config.ts), [endpoint de proveedores](services/api/routers/suppliers.py).
- Causa raíz comprobada (o hipótesis a verificar): petición y fallo comprobados; causa del servidor pendiente. El rewrite dirige /backend a la API y el endpoint transforma registros a SupplierResponse, pero no hay traceback para atribuirlo a validación, almacenamiento, autenticación o conectividad. Dos entradas de consola no prueban dos llamadas de Home.
- Solución propuesta: reproducir con cuenta/datos de prueba, correlacionar Network con logs API/Next y corregir la causa comprobada. Repetir con todos los servicios sanos; no ocultar errores ni alterar datos persistentes.

### Problema 2 — Cambios de altura durante la carga

- Frontend y URL: backoffice `/`, especialmente Desktop.
- Indicador afectado: CLS 0.251940 Desktop y 0.068999 Mobile; Performance 87.
- Evidencia de Lighthouse: layout-shifts y cls-culprits-insight atribuyen 0.164093 a section.card de proveedores; otro desplazamiento de 0.087847 no identifica nodo. No se atribuye todo el CLS a esa tarjeta.
- Archivo o componente involucrado: [Home](uis/backoffice/src/app/page.tsx), [LoadingSkeleton](uis/backoffice/src/components/LoadingSkeleton.tsx), [globals.css](uis/backoffice/src/app/globals.css).
- Causa raíz comprobada (o hipótesis a verificar): skeleton summary contiene una línea y cuatro tarjetas con min-height:7rem; Home lo sustituye por tres/cuatro metricPanel, o un párrafo de error, sin altura equivalente. La discrepancia geométrica y el movimiento de proveedores están comprobados; falta aislar la secuencia de cada desplazamiento con una traza. AuthGuard también cambia su contenido al recuperar la sesión; su contribución no está cuantificada.
- Solución propuesta: ajustar placeholders al diseño final y reservar espacio coherente en carga, éxito y error; comprobar ambos tamaños. Resolver el 500 por separado y medir cada cambio.

### Problema 3 — Contraste insuficiente en tema oscuro

- Frontend y URL: backoffice `/`, ambos modos.
- Indicador afectado: Accessibility 96.
- Evidencia de Lighthouse: color-contrast indica 3.28:1 en «Resueltas» (#059669 sobre #113b32), 3.76:1 en acciones (blanco sobre #059669) y 2.57:1 en badge «Resuelta» (#059669 sobre #064e3b), frente a 4.5:1 requerido por el reporte.
- Archivo o componente involucrado: [globals.css](uis/backoffice/src/app/globals.css), [Home](uis/backoffice/src/app/page.tsx), [IncidentStatusBadge](uis/backoffice/src/components/IncidentStatusBadge.tsx).
- Causa raíz comprobada (o hipótesis a verificar): --accent:#059669 se usa como fondo de botones blancos y como texto sobre fondos oscuros; tone-success y text-accent heredan esas combinaciones. Las dos definiciones de tema oscuro comparten el valor.
- Solución propuesta: separar colores de texto/enlace y fondo de acción, comprobar hover/foco y ambos temas. Aclarar globalmente accent puede empeorar el contraste del texto blanco de botones.

### Problema 4 — Canonical relativo

- Frontend y URL: website `/` y `/application`, ambos modos.
- Indicador afectado: SEO 92 en las cuatro ejecuciones públicas.
- Evidencia de Lighthouse: canonical falla con «Is not an absolute URL (index.html)» y «Is not an absolute URL (application.html)»; es el audit SEO fallido de cada JSON.
- Archivo o componente involucrado: head de [index.html](uis/website/index.html) y [application.html](uis/website/application.html).
- Causa raíz comprobada (o hipótesis a verificar): ambos link rel=canonical usan href relativo.
- Solución propuesta: URLs absolutas con dominio público aprobado y decisión de URL preferida del formulario. Dominio pendiente de confirmar antes de implementar; no inventarlo ni fijar localhost como canonical de producción. SEO 100 de backoffice no justifica indexar una vista privada.

### Problema 5 — Nombre accesible de la marca incompleto

- Frontend y URL: website `/` y `/application`, ambos modos.
- Indicador afectado: label-content-name-mismatch; formulario Desktop tiene Accessibility 96, aunque otros casos con este hallazgo puntúan 100.
- Evidencia de Lighthouse: el enlace muestra «TrackFlow / Last-mile operations» y su nombre accesible omite parte del texto visible. El audit falla en los cuatro JSON, sin asumir el mismo peso en todas las categorías/modos.
- Archivo o componente involucrado: enlaces de marca en [index.html](uis/website/index.html) y [application.html](uis/website/application.html).
- Causa raíz comprobada (o hipótesis a verificar): aria-label «TrackFlow inicio» y «Volver a TrackFlow» sustituyen el nombre derivado del contenido y omiten el subtítulo.
- Solución propuesta: derivar el nombre del contenido o incluir el texto visible completo, conservando navegación y traducción. Verificar con Lighthouse y lector de pantalla.

### Problema 6 — TBT con interferencia de extensiones

- Frontend y URL: las tres páginas, especialmente Mobile.
- Indicador afectado: TBT 284 ms home, 246.5 ms formulario y 344.5 ms dashboard.
- Evidencia de Lighthouse: long-tasks identifica chrome-extension://…/bubble_compiled.js con tareas de 294, 287 y 292 ms respectivamente. En home unused-javascript estima 557464 bytes ahorrables íntegramente en extensiones. Hay también tareas propias: documento home 239 y 90 ms; dashboard documento 227 ms y chunks de 99 y 60 ms.
- Archivo o componente involucrado: scripts inyectados externos al repositorio; puntos de investigación propios: scripts inline de [index.html](uis/website/index.html), [application.html](uis/website/application.html) y componentes cliente del backoffice.
- Causa raíz comprobada (o hipótesis a verificar): las extensiones participan en el trabajo del hilo principal. No se atribuye todo el TBT a ellas ni a TrackFlow, ni se resta su duración para inventar un TBT limpio. Los chunks requieren perfil adicional para identificar funciones fuente.
- Solución propuesta: repetir línea base sin extensiones, registrar sesión/almacenamiento y conservar ese procedimiento para el después. Un antes contaminado frente a un después limpio no prueba una mejora de código. Investigar las tareas propias restantes con Performance.

### Problema 7 — LCP móvil del dashboard

- Frontend y URL: backoffice `/`, Mobile.
- Indicador afectado: LCP simulado 2.797 s, superior a la referencia 2.5 s de la guía.
- Evidencia de Lighthouse: lcp-breakdown-insight identifica el párrafo «Resumen actual de incidencias y proveedores de TrackFlow», no una imagen ni un gráfico. Traza: elementRenderDelay=401.754 ms, TTFB=5.698 ms; no se suman para reconstruir el LCP simulado.
- Archivo o componente involucrado: cabecera de [Home](uis/backoffice/src/app/page.tsx), [AuthGuard](uis/backoffice/src/components/AuthGuard.tsx), [useAuthToken](uis/backoffice/src/lib/auth.ts).
- Causa raíz comprobada (o hipótesis a verificar): la vista es cliente y el snapshot servidor de useAuthToken es null; AuthGuard muestra «Cargando sesión…» antes de recuperar el token. Es una hipótesis para el retraso de aparición del contenido; falta aislarla de extensiones e hidratación con una traza limpia. No hay evidencia de gráficos pesados.
- Solución propuesta: perfilar transición de sesión y render de cabecera antes de cambiar autenticación; conservar la protección de ruta.

### Problema 8 — Reflow en navegación de home

- Frontend y URL: website `/`, ambos modos.
- Indicador afectado: trabajo de layout; contribución concreta al TBT no demostrada.
- Evidencia de Lighthouse: forced-reflow-insight señala línea de traza 873, con 40.804 ms Mobile y 47.242 ms Desktop, correspondiente a la lectura getBoundingClientRect().height de getHeaderOffset (líneas de traza desde cero).
- Archivo o componente involucrado: navegación inline de [index.html](uis/website/index.html), getHeaderOffset, updateActiveNavLink y scrollToAnchor.
- Causa raíz comprobada (o hipótesis a verificar): lectura geométrica que fuerza layout con estilos pendientes; el script también actualiza clases y atributos. Falta perfilar qué escritura invalida el layout antes de la lectura.
- Solución propuesta: agrupar lecturas antes de escrituras, evaluar cachear altura con invalidación al redimensionar y coordinar scroll con requestAnimationFrame. Verificar anclas, menú e idioma.

### Problema 9 — Imagen y caché: oportunidades secundarias

- Frontend y URL: website `/` (imagen) y páginas públicas (caché/CSS).
- Indicador afectado: transferencia y visitas repetidas; home ya registra LCP 1.657 s Mobile y CLS 0.
- Evidencia de Lighthouse: image-delivery-insight estima ahorro de 35932 bytes sobre hero AVIF de 116173 bytes. cache-insight indica TTL 0 en hero, i18n, CSS y logo (134272 bytes de transferencia en home). render-blocking-insight señala CSS de 7509 bytes y 153 ms Mobile; no garantiza una mejora equivalente.
- Archivo o componente involucrado: picture de [index.html](uis/website/index.html), [optimize-hero.mjs](scripts/optimize-hero.mjs), assets/tailwind.min.css y servidor estático local.
- Causa raíz comprobada (o hipótesis a verificar): ya hay AVIF, dimensiones explícitas y fetchpriority=high; el generador usa calidad 58 sin variantes de tamaño. La oportunidad es compresión/variantes, no convertir PNG a WebP ni añadir lazy loading al hero. TTL local no demuestra un problema del hosting público.
- Solución propuesta: evaluar calidad visual y variantes adaptadas al recorte móvil. Revisar cabeceras reales antes de proponer cambios en infraestructura protegida; mantener CSS bloqueante hasta demostrar alternativa sin flashes de estilos.

## Código duplicado

### Caso 1 — Menú móvil del website

- Archivos: [index.html](uis/website/index.html) y [application.html](uis/website/application.html), scripts inline de navegación.
- Código repetido: getMenuLabel, setMobileMenu, aria-expanded, aria-hidden, inert, clases de apertura y animación de las tres líneas. Los listeners difieren: formulario añade cierre por clic exterior y media query.
- Por qué extraerlo: evita divergencias de accesibilidad y traducción entre páginas y centraliza correcciones del menú.
- Abstracción propuesta: `uis/website/navigation.js` con initMobileMenu(root) y configuración opcional de cierre, cargado con defer en las dos páginas. Anclas y FAQ permanecen específicas de home. Es JavaScript del sitio estático, no un Custom Hook.
- Verificación prevista: apertura/cierre, teclado, enlaces, clic exterior, resize e idioma en ambas páginas. No atribuir mejora de Lighthouse a la extracción sin medir.

### Caso 2 — Tarjetas de métricas del backoffice

- Archivos: [Home](uis/backoffice/src/app/page.tsx) y [SuppliersPage](uis/backoffice/src/app/suppliers/page.tsx).
- Código repetido: tuplas etiqueta/valor/tono mapeadas a div.metricPanel, span y strong; Home lo repite en sus dos resúmenes. Proveedores incorpora el estado skeleton en el mismo patrón.
- Por qué extraerlo: unifica marcado y estados de carga y permite aplicar futuras correcciones de contraste/espacio en un sitio. Los cálculos siguen en cada página: las métricas de proveedores de su página corresponden a su lista filtrada.
- Abstracción propuesta: MetricCard({ label, value, tone, loading }) en `uis/backoffice/src/components/MetricCard.tsx`, con tonos tipados y placeholder opcional. Las páginas conservan grids, cálculos y peticiones; no duplicar IncidentStatusBadge ni LoadingSkeleton, que ya existen.
- Verificación prevista: valores/etiquetas, filtros de proveedores, carga/error/vacío y ambos temas.

Abstracción implementada en esta sección: [MetricCard](uis/backoffice/src/components/MetricCard.tsx), integrada en los dos resúmenes de Home y en SuppliersPage. Conserva clases, etiquetas, valores y placeholder originales; los cálculos permanecen en las páginas. Es una refactorización de mantenibilidad, sin correcciones de rendimiento ni nuevas mediciones. El menú compartido queda como segundo candidato.

Validación: 4 suites y 15 pruebas existentes aprobadas, lint y build del backoffice aprobados. El build advierte de múltiples lockfiles al inferir la raíz de Turbopack; no bloquea la compilación. No se realizó una verificación visual interactiva ni se probaron filtros/escrituras en el navegador; esos controles quedan pendientes y no se presentan como aprobados. No se añadieron tests que reproduzcan el marcado de esta extracción.

Controles del repositorio: validate:ai-setup aprueba 34 comprobaciones y test:ai-setup aprueba 7 pruebas. Con --check-branch aprueban las 34 comprobaciones estructurales y falla exclusivamente la rama histórica exigida; el usuario confirmó perf/auditoria-lighthouse para esta entrega. Se mantiene visible esta discrepancia, sin modificar AGENTS.md ni su validador.
