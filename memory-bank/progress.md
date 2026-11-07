# Progreso

## Auditoría inicial de rendimiento — 7 de noviembre de 2026

- Sección 03 de la guía local: diagnóstico documentado en `AUDIT.md`, con seis mediciones extraídas de los JSON aportados y nueve hallazgos vinculados al código, diferenciando causas comprobadas e hipótesis. Se usa una referencia textual porque las pruebas del validador copian únicamente los archivos de configuración a una raíz temporal, sin el informe de auditoría.
- URLs reales: home, formulario `/application` y dashboard principal `/` del backoffice. Falta medir `/incidents` para cubrir literalmente la guía. Una ejecución por caso; extensiones activas e IndexedDB limitan las comparaciones. No hay nuevas mediciones ni mejoras de rendimiento demostradas.
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
