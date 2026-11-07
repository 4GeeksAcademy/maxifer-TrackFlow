# Progreso

## Preparación de publicación autorizada — 7 de noviembre de 2026

- El usuario confirma que realizó las pruebas en navegador y autoriza commits y publicación en la rama de auditoría. Se registra como comprobación humana, sin atribuir al agente una ejecución ni afirmar cobertura específica no detallada.
- Entrega de las mediciones existentes aceptada por el usuario; se conserva la diferencia conocida de extensiones y la ausencia de mediciones intermedias. No se certifica equivalencia experimental.
- Preparada la corrección de geometría del dashboard para commit independiente. Checks del backoffice ya aprobados en esta sesión de trabajo: 4 suites/15 pruebas, lint y build. No hay cambios nuevos de código desde esos checks. Quedan fuera secretos, datos, .tmp y .vscode. Sin merge ni despliegue manual.

## Revisión de sección 09 — 7 de noviembre de 2026

- El usuario solicita avanzar con el cierre. Confirma condiciones iguales salvo extensiones: after sin extensiones frente a before con tareas de extensiones documentadas. No afirmar comparabilidad controlada ni atribución de mejora al código. REPORT.md incluye matriz de cumplimiento y procedimiento para una nueva pareja aislada con datos sintéticos; AUDIT.md recoge la confirmación vigente.
- Unificados los nombres de las capturas after del dashboard con el patrón before y actualizados sus enlaces. Se conservan las seis capturas y los resultados históricos, sin nuevas mediciones inventadas.
- Repetidos: build:landing aprobado; backoffice 4 suites/15 pruebas, lint y build aprobados. Avisos de caniuse-lite y múltiples lockfiles. Sin Lighthouse ni revisión funcional en navegador durante esta revisión. Pendientes comprobaciones de estados/temas/tamaños, auditorías vigentes, comparación controlada y efecto individual de correcciones. Sin cambios nuevos de producto, secretos o datos; sin commit ni publicación.
- Validación estructural: 34 controles aprobados; --check-branch falla únicamente por exigir la rama histórica feature/agent-memory-bank frente a perf/auditoria-lighthouse. Las 7 pruebas del validador y git diff --check pasan. Comprobados los 18 enlaces de evidencias de REPORT.md: ninguno ausente; seis PNG before y seis after.

## Registro after Backoffice Desktop — 7 de noviembre de 2026

- El usuario aporta dashboard `/` Desktop: Performance/Accessibility/Best Practices/SEO 98/100/100/100; FCP 0.2 s, LCP 0.7 s, TBT 0 ms, CLS 0.083 y Speed Index 0.3 s. Registrado en REPORT.md y AUDIT.md. Frente a la línea base: Performance +11 puntos, Accessibility y Best Practices +4 cada una; CLS de 0.252 a 0.083 y TBT de 25 a 0 ms.
- Están comunicadas las seis combinaciones after. Pendiente verificar evidencias, entorno, repeticiones y rutas provisionales de Home; investigar SEO del dashboard Mobile y Accessibility de Application Desktop con sus reportes. Sin atribución causal ni cierre de errores 500 por puntuaciones. Sin cambios de producto, commit ni publicación.

## Registro after Backoffice Mobile — 7 de noviembre de 2026

- El usuario aporta dashboard `/` Mobile: Performance/Accessibility/Best Practices/SEO 89/100/96/92; FCP 0.8 s, LCP 3.1 s, TBT 250 ms, CLS 0.069 y Speed Index 1.0 s. Registrado en REPORT.md y AUDIT.md. Frente a la línea base: Performance +2, Accessibility +4, SEO −8 puntos; TBT -94.5 ms, LCP de 2.797 a 3.1 s y CLS sin cambios al redondeo registrado.
- Pendiente dashboard Desktop y revisión de evidencias, entorno, repeticiones y motivo de la bajada de SEO. Sin atribución causal ni cierre de errores 500 por puntuaciones. Sin cambios de producto, commit ni publicación.

## Registro after Application Desktop — 7 de noviembre de 2026

- El usuario aporta `/application` Desktop: Performance/Accessibility/Best Practices/SEO 100/96/100/92; FCP 0.2 s, LCP 0.3 s, TBT 0 ms, CLS 0 y Speed Index 0.3 s. Registrado en REPORT.md y AUDIT.md. Las cuatro puntuaciones se mantienen; TBT pasa de 25 a 0 ms. Accessibility 96 requiere revisar el reporte after para identificar el fallo vigente; no se da por resuelto el hallazgo inicial.
- Pendientes dashboard Mobile y Desktop, además de verificar evidencias, entorno y repeticiones. Sin cambios de producto, commit ni publicación.

## Registro after Application Mobile — 7 de noviembre de 2026

- El usuario aporta `/application` Mobile: Performance/Accessibility/Best Practices/SEO 100/100/100/92; FCP 1.0 s, LCP 1.0 s, TBT 0 ms, CLS 0 y Speed Index 1.0 s. Registrado en REPORT.md y AUDIT.md. Frente a la línea base: Performance +4 puntos y TBT -246.5 ms; FCP y Speed Index pasan de 0.883 a 1.0 s. Sin atribución causal ni equivalencia de entorno comprobada.
- Pendientes formulario Desktop y dashboard en ambos dispositivos, además de verificar evidencias, entorno y repeticiones. Sin cambios de producto, commit ni publicación.

## Registro after Mobile — 7 de noviembre de 2026

- El usuario aporta website Mobile: Performance/Accessibility/Best Practices/SEO 100/100/100/92; FCP 0.8 s, LCP 1.7 s, TBT 20 ms, CLS 0 y Speed Index 0.8 s. Registrado en REPORT.md y AUDIT.md, conservando Desktop. Home es la ruta provisional. Frente a Home Mobile inicial: Performance +6 puntos y TBT -264 ms; sin atribución causal ni equivalencia de entorno comprobada.
- Pendientes los after de formulario y dashboard en ambos dispositivos, y verificar evidencias y entorno. Sin cambios de producto, commit ni publicación.

## Registro after comunicado ? 7 de noviembre de 2026

- El usuario aporta website Desktop (dispositivo corregido por el usuario): Performance/Accessibility/Best Practices/SEO 100/100/100/92; FCP 0.3 s, LCP 0.4 s, TBT 0 ms, CLS 0 y Speed Index 0.3 s. Registrados en REPORT.md y referenciados desde AUDIT.md. Home `/` es una interpretaci?n provisional; ruta exacta, entorno y repeticiones pendientes de confirmar. Sin JSON o captura adjuntos, sin medici?n ejecutada por el agente ni atribuci?n causal de mejora.
- Validaci?n documental: 34 controles estructurales y 7 pruebas aprobados; git diff --check aprobado. --check-branch falla solo por la rama perf/auditoria-lighthouse frente al hito hist?rico. Sin builds de producto por tratarse de documentaci?n.
- Pendiente: evidencias after y otras cinco combinaciones. Esta actualizaci?n documental sustituye el estado anterior de ausencia total de valores after; no modifica la l?nea base. Sin cambios de producto, commit ni publicaci?n.

## Organización de evidencias — 7 de noviembre de 2026

- El usuario aclara que todas las capturas y reportes iniciales son del antes. Se conservan los 12 archivos de línea base en audit/before y se retiran sus duplicados de audit/after tras comprobar igualdad SHA-256 de cada pareja. Esta corrección sustituye la decisión anterior de preservar duplicados en after; no se altera el contenido de los reportes.
- AUDIT.md refleja la ubicación corregida. audit/after queda vacía hasta obtener nuevas mediciones posteriores a las correcciones; no hay resultados del después todavía.
- Validación: 34 controles estructurales y 7 pruebas aprobados; git diff --check aprobado. --check-branch falla únicamente por la rama perf/auditoria-lighthouse frente al hito histórico. Sin cambios de producto, commit ni publicación.

## Alcance confirmado de auditoría

- El usuario confirma el dashboard de inicio `/` para comparar antes/después. Se actualizan la guía local, AUDIT.md y este registro; evidencias con nombres backoffice-dashboard. Sin cambios de producto.

## Corrección acotada de accesibilidad — problema 5, 7 de noviembre de 2026

- Eliminados los aria-label incompletos de los dos enlaces de marca del website; su nombre se deriva del contenido. i18n omite el enlace con logo al asignar homeAria para no reintroducir el fallo en Home al cargar o cambiar idioma. Se conservan destinos, clases, texto y traducción del alt.
- build:landing aprobado (aviso de caniuse-lite desactualizado); 34 controles estructurales y 7 pruebas del validador aprobados. --check-branch falla solo por la rama perf/auditoria-lighthouse frente al hito histórico. git diff --check aprobado. Sin Lighthouse ni comprobación visual interactiva ejecutados; pendientes en ambas páginas, tamaños e idiomas. Sin commit ni publicación; cambios previos preservados.
- Problema 4 pendiente por decisión del usuario: sin dominio público aprobado, conservar canonical actuales; ruta preferida futura del formulario /application.

## Corrección acotada de CLS — problema 2, 7 de noviembre de 2026

- Solo se modifica la presentación de los dos resúmenes de Home: MetricCard con loading conserva etiquetas, columnas y geometría del estado con datos. En error, el grid invisible y aria-hidden reserva espacio y el aviso ocupa la misma celda del contenedor. No se cambian peticiones, cálculos, autenticación, estilos globales ni otros consumidores del skeleton.
- Lint, 4 suites/15 pruebas y build del backoffice aprobados; persiste el aviso de múltiples lockfiles. Validador: 34 controles estructurales aprobados; --check-branch falla exclusivamente por la rama perf/auditoria-lighthouse frente a la exigencia histórica. Las 7 pruebas del validador y git diff --check pasan.
- Pendiente: Lighthouse comparable y comprobación visual de carga/éxito/vacío/error en ambos temas y tamaños, con API sintética y respuestas demoradas. No se afirma una reducción medida del CLS ni se corrigen los 500 (problema 1), AuthGuard o las secciones inferiores. Sin commit ni publicación; se preservan los cambios previos del usuario.

## Diagnóstico con skills — sección 04, 7 de noviembre de 2026

- Alcance confirmado: cerrar diagnóstico de ambos frontends con evidencias existentes; sin correcciones. El usuario confirma datos sintéticos y acepta las limitaciones de las mediciones actuales.
- Instaladas localmente core-web-vitals y performance en `.agents/skills`, desde main de addyosmani/web-quality-skills mediante skill-installer. Ambas declaran versión 2.0; sin SHA upstream registrado. Leídas y aplicadas sus referencias de medición, LCP, CLS e INP; evidencia de uso y prioridades en AUDIT.md.
- Revisión adicional: dos SidebarContent ejecutan carga de perfil; Home publica los tres resultados después de Promise.allSettled y descarga listas para resumir/recortar. Son oportunidades verificadas en fuente, sin mejora temporal demostrada ni causa del 500 confirmada. Proveedores puede ser víctima de desplazamiento; no atribuirle todo el CLS.
- No se ejecutaron nuevas mediciones ni consultas de datos. No se modificó código de producto, infraestructura, secretos o datos. Próximo paso: elegir una corrección específica; priorizar investigar 500 y estabilizar geometría, manteniendo separadas las hipótesis de hidratación y TBT. Dominio canonical sigue pendiente.
- Validación de esta sección: 34 comprobaciones estructurales y 7 pruebas aprobadas con npm.cmd; git diff --check aprobado. Con --check-branch pasan las 34 estructurales y falla solo la rama histórica exigida. El intento inicial con npm.ps1 fue bloqueado por la política de ejecución de PowerShell; npm.cmd completó los controles sin modificar esa política. Sin builds ni tests de producto porque solo se instalaron instrucciones y se actualizó documentación; sin commit ni publicación.

## Auditoría inicial de rendimiento — 7 de noviembre de 2026

- Sección 03 de la guía local: diagnóstico documentado en `AUDIT.md`, con seis mediciones extraídas de los JSON aportados y nueve hallazgos vinculados al código, diferenciando causas comprobadas e hipótesis. Se usa una referencia textual porque las pruebas del validador copian únicamente los archivos de configuración a una raíz temporal, sin el informe de auditoría.
- URLs reales: home, formulario `/application` y dashboard principal `/` del backoffice. El usuario confirma el dashboard `/` como alcance; no queda pendiente medir otra ruta interna. Una ejecución por caso; extensiones activas e IndexedDB limitan las comparaciones. No hay nuevas mediciones ni mejoras de rendimiento demostradas.
- Evidencias copiadas sin alterar bytes desde `audit/after` a `audit/before` con nombres de línea base; originales preservados. El usuario confirmó que son los reportes de las puntuaciones registradas y que siguió el modo de ejecución de la guía. No confirmó el origen sintético de los datos; no se accedió a bases ni se modificaron datos. Revisión de JSON sin correos ni tokens JWT/Bearer detectados y capturas de resultados sin datos personales visibles; capturas finales integradas del dashboard muestran agregados operativos.
- Dos candidatos de reutilización: menú móvil del website y tarjetas de métricas del backoffice. Se extrae MetricCard, usado por Home y SuppliersPage, conservando marcado, carga, cálculos y estilos; no se aplican correcciones de rendimiento.
- Validación: backoffice 4 suites/15 pruebas, lint y build aprobados; aviso no bloqueante de múltiples lockfiles de Turbopack. Sin comprobación visual interactiva ni pruebas de filtros/escrituras. Validador normal: 34 comprobaciones aprobadas; tests del validador: 7 aprobados. Modo `--check-branch`: 34 aprobadas y fallo exclusivo por exigir la rama del hito anterior.
- El usuario confirma `perf/auditoria-lighthouse` y autoriza el primer commit local; no autoriza publicación, PR, merge ni despliegue para esta tarea. La política de rama del hito AI-ready se conserva como antecedente, sin alterar el validador.
- Siguientes pasos: repetir línea base sin extensiones con sesión/datos controlados; investigar logs de los 500; confirmar dominio canonical antes de corregirlo; comprobar visualmente la extracción; corregir contraste y geometría en commits dirigidos con mediciones comparables. El error 500 no tiene causa de servidor confirmada.

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

## Informe final — sección 07, 7 de noviembre de 2026

- REPORT.md reorganizado con resumen, tres correcciones comprobadas en el diff, refactorización MetricCard (commit 720f272), comparativas de las seis combinaciones, uso del agente y conclusión. Conserva todas las métricas comunicadas y enlaza las seis capturas after existentes; sin JSON after ni cotejo visual en esta redacción.
- Se distinguen validaciones históricas de controles actuales, correcciones sin commit, límites de comparabilidad y pendientes funcionales. No se atribuye causalidad ni cierre de errores 500 a las puntuaciones. Mayor mejora observada: dashboard Desktop +11 puntos y CLS 0.252 a 0.083; quedan LCP/SEO Mobile y Accessibility de Application Desktop por investigar.
- Cambio exclusivamente documental, sin commit ni publicación. Validaciones actuales: 34 controles estructurales y 7 pruebas aprobados; git diff --check aprobado. --check-branch falla únicamente por la rama perf/auditoria-lighthouse frente a feature/agent-memory-bank del hito histórico. Sin builds de producto por ser una actualización documental.

## Confirmación de capturas after — 7 de noviembre de 2026

- El usuario confirma que las seis capturas corresponden a las páginas y modos correctos, sus puntuaciones coinciden con el informe y el dashboard muestra el contenido esperado. REPORT.md registra el cotejo como completado por confirmación humana, sin inspección visual independiente del agente.
- La confirmación no acredita condiciones equivalentes, URL final exacta del formulario, detalle de auditorías fallidas, cotejo específico de tiempos/CLS ni pruebas funcionales adicionales. Esos pendientes se conservan. Sin cambios de producto, commit ni publicación.
