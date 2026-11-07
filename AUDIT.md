# AUDIT — Auditoría inicial

## Entorno de medición

- Fecha: 7 de noviembre de 2026, 17:31–17:43 de Uruguay (UTC−03:00), extraída de `fetchTime`.
- Navegador: Google Chrome confirmado por el usuario; el hostUserAgent declara Chrome 157.0.0.0 sobre Windows 10 x64. No se verificó la versión completa en «Acerca de Chrome».
- Modo de ejecución: website `build:landing` + `serve`; backoffice `build` + `start`, según confirmación del usuario de que siguió la guía. No se ejecutaron nuevas mediciones en esta revisión.
- URLs medidas: `http://localhost:3000/`, `http://localhost:3000/application` y `http://localhost:3001/`; requestedUrl y finalDisplayedUrl coinciden. El formulario corresponde a `uis/website/application.html`, pero la URL medida no lleva extensión. El dashboard medido es `/`, no `/incidents`; los nodos y capturas integradas muestran «Backoffice operativo», no el login. Falta medir `/incidents` para cubrir literalmente la selección de la guía.
- Dispositivos simulados: Mobile y Desktop (configSettings.formFactor). Mobile: 412 × 823, DPR 1.75, RTT 150 ms, 1638.4 Kbps, CPU ×4. Desktop: RTT 40 ms, 10240 Kbps, CPU ×1; screenEmulation.disabled=true, por lo que el tamaño móvil residual de ese objeto no describe el viewport Desktop. El dashboard Desktop conserva tarjetas apiladas en su captura.
- Versiones: Lighthouse 13.5.0, canal DevTools, throttlingMethod=simulate. Node y serve utilizados al medir: no registrados. En esta revisión posterior, Node local v26.13.0 y npm 11.20.0; no se atribuyen retrospectivamente a las mediciones.
- Commit y rama: código revisado sobre `2a23e48`, rama `perf/auditoria-lighthouse`. Commit exacto medido: no consta en los reportes. El usuario autorizó expresamente el primer commit local en esta rama; la exigencia de `feature/agent-memory-bank` pertenece al hito anterior. No se cambia de rama ni se altera el validador.
- Cantidad de incidencias y filtros: el dashboard muestra 95 incidencias (29 abiertas, 0 en curso y 52 resueltas; no se inventa el estado de las 14 restantes). Home llama a getIncidents({}), sin filtros explícitos, ordena por fecha y muestra cinco recientes. El origen sintético de los datos no está confirmado. No se consultaron bases ni se modificaron datos.
- Caché/almacenamiento: los seis reportes advierten de IndexedDB existente. disableStorageReset=false; clearStorageTypes incluye file_systems, shader_cache, service_workers y cache_storage, pero no local_storage. Hay scripts chrome-extension:// en tareas y diagnósticos JavaScript: no es un perfil limpio.
- Número de repeticiones y valores individuales: una ejecución por combinación, registrada abajo. No hay medianas ni evidencia de variabilidad o mejora antes/después.
- Evidencias: el usuario dejó los reportes en audit/after y confirmó que corresponden a las puntuaciones registradas. Se conservan copias idénticas en audit/before con nombres de línea base para este diagnóstico, preservando los originales. Esto no prueba ausencia de cambios previos ni constituye una segunda medición comparable.

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
