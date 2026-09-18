# Auditoría de gestión de errores — TrackFlow

Alcance: `/scripts`, `/services/api`, `/uis` (backoffice y talent-pipeline-tracker).

Leyenda de categorías:
1. Try/catch ausente · 2. Catch demasiado amplio · 3. Fallos silenciosos · 4. Exposición de errores en crudo · 5. Filtración de datos sensibles · 6. Estados de carga/error ausentes en UI · 7. Sin llamada a la acción para el usuario · 8. Sin `sys.exit` en fallo de script.

---

## CRÍTICO

Ningún hallazgo alcanza el nivel crítico (no se detectaron secretos hardcodeados, inyección de errores explotable, ni caídas de servicio garantizadas en producción). Los dos ítems de mayor riesgo se listan como ALTO.

---

## ALTO

| # | Archivo / líneas | Categoría | Problema | Corrección sugerida |
|---|---|---|---|---|
| 1 | [services/api/incident_store.py](services/api/incident_store.py#L61-L70) | 1 | La migración de datos legacy (`json.loads(LEGACY_FILE_PATH.read_text())`) no tiene try/except; un JSON legado corrupto tumba el arranque completo de la API. | Envolver en `try/except (OSError, json.JSONDecodeError)`, loguear y decidir si abortar o continuar sin migrar. |
| 2 | [services/api/security.py](services/api/security.py#L17) | 1 | `JWT_SECRET = os.getenv("JWT_SECRET")` no se valida al arrancar la app; si falta, el fallo (`RuntimeError`) solo aparece en tiempo de petición, provocando errores 500 intermitentes en producción. | Validar `JWT_SECRET` en el arranque (`main.py`) y abortar el proceso si falta. |
| 3 | [uis/backoffice/src/lib/auth.ts](uis/backoffice/src/lib/auth.ts#L20-L29) | 5 | El token de autenticación se guarda en `localStorage`, accesible desde cualquier script y vulnerable a robo vía XSS. | Migrar a cookies `httpOnly` + `Secure` + `SameSite` gestionadas por el backend. |

---

## MEDIO

| # | Archivo / líneas | Categoría | Problema | Corrección sugerida |
|---|---|---|---|---|
| 4 | [scripts/analyze.py](scripts/analyze.py#L130-L145) | 1 | La escritura del CSV de resultados (`result_path.write_text(...)`) no maneja errores de disco/permisos. | Envolver en `try/except OSError` e informar al usuario. |
| 5 | [scripts/seed_incidents.py](scripts/seed_incidents.py#L36-L49) | 1, 2 | El `try/except` solo cubre `transform`/`insert_seed_incident`; `open()` y `csv.DictReader` (fichero corrupto/ausente) quedan sin manejar. | Envolver `open()` en `try/except OSError` propio y salir con código de error. |
| 6 | [scripts/seed_incidents.py](scripts/seed_incidents.py#L36-L54) (nivel script) | 8 | Si `seed()` lanza excepción no capturada (p. ej. `sqlite3.OperationalError`), no hay `sys.exit(1)` explícito en el bloque principal. | Envolver la llamada a `seed()` en `try/except Exception` + `sys.exit(1)` con mensaje claro. |
| 7 | [scripts/optimize-hero.mjs](scripts/optimize-hero.mjs) | 1 | Las llamadas `await sharp(...).toFile(...)` no tienen try/catch; un fallo de `sharp` o archivo de entrada ausente termina con stack trace crudo de Node. | Envolver en `try/catch`, loguear mensaje claro y `process.exit(1)`. |
| 8 | [services/api/auth.py](services/api/auth.py#L69-L72) | 2, 3, 5 | `except Exception as error: print(...)` en `forgot_password`: fallo silencioso (solo `print`, sin logging estructurado ni alerta), catch amplio, y puede incluir el email del usuario (PII) en logs de consola. | Usar `logging.getLogger(__name__).exception(...)`, registrar solo `user["id"]` (no el email), y acotar el catch a la llamada de envío de email. |
| 9 | [services/api/database.py](services/api/database.py#L14-L19) y [L44-L49](services/api/database.py#L44-L49) | 1 | `TinyDB(DB_FILE_PATH)` sin manejo de errores si falla la creación del directorio o la apertura del JSON (permisos, disco lleno, corrupción). | Envolver en `try/except OSError`, loguear con mensaje claro y re-lanzar. |
| 10 | [services/api/email_service.py](services/api/email_service.py#L26-L38) | 1 | `resend.Emails.send(...)` (llamada de red externa) no tiene try/except local; toda la responsabilidad recae en el llamador. | Capturar excepciones de la librería `resend` (timeouts, errores HTTP) dentro de la función y relanzar una excepción de dominio. |
| 11 | [services/api/password_reset_service.py](services/api/password_reset_service.py#L44-L50) | 1 | `datetime.fromisoformat(reset_token["expires_at"])` sin try/except; un campo corrupto o ausente produce `KeyError`/`ValueError` no controlado (500 sin contexto). | Capturar y tratar como token inválido (respuesta 400 controlada). |
| 12 | [services/api/security.py](services/api/security.py#L61-L77) | 2 | `get_current_user`: el `try/except JWTError` envuelve también la consulta a `get_user_by_id` y la lógica de negocio; un fallo real de persistencia se enmascararía como "token inválido". | Acotar el `try/except JWTError` solo a `jwt.decode`; manejar aparte errores de `get_user_by_id`. |
| 13 | [uis/backoffice/src/app/account/profile/page.tsx](uis/backoffice/src/app/account/profile/page.tsx#L30-L58) | 6 | No hay estado de "loading" explícito mientras se carga el perfil; si la carga tarda, el formulario aparece vacío sin indicar progreso. | Añadir estado `isLoadingProfile` y renderizar un `LoadingSkeleton`. |
| 14 | [uis/talent-pipeline-tracker/app/error.tsx](uis/talent-pipeline-tracker/app/error.tsx#L17) | 4 | `<p>{error.message}</p>` muestra el mensaje de excepción crudo (incluyendo códigos HTTP embebidos por `lib/candidates.ts`) directamente en la UI de producción. | Mapear a un mensaje genérico para el usuario; loguear el error real en un sistema de observabilidad. |
| 15 | [uis/backoffice/src/app/suppliers/page.tsx](uis/backoffice/src/app/suppliers/page.tsx#L95-L160) | 4 | `parseErrorDetail(data?.detail)` reenvía a la UI el detalle crudo del backend (incluye arrays de errores Pydantic con `msg`/`loc`), pudiendo filtrar nombres de campos internos. | Sanitizar/whitelisting de mensajes esperados antes de mostrarlos. |

---

## BAJO

| # | Archivo / líneas | Categoría | Problema | Corrección sugerida |
|---|---|---|---|---|
| 16 | [scripts/analyze.py](scripts/analyze.py#L60-L95) | 2 | Un solo `try/except` agrupa lectura de fichero y parseo de negocio, mezclando responsabilidades. | Separar en dos `try` con mensajes específicos por operación. |
| 17 | [scripts/analyze.py](scripts/analyze.py) (nivel script) | 8 | Sin `sys.exit(1)` explícito si falla la escritura de `results.csv`. | Capturar y llamar `sys.exit(1)` en el camino de fallo. |
| 18 | [scripts/seed_incidents.py](scripts/seed_incidents.py#L46) y [L54](scripts/seed_incidents.py#L54) | 5 | Se imprimen filas completas del CSV (potencial PII) en stdout al fallar el parseo. | Loguear solo identificadores/número de línea, no el contenido completo de la fila. |
| 19 | [scripts/check-spanish-copy.mjs](scripts/check-spanish-copy.mjs#L1-L10) | 1 | `fs.readFileSync(file, "utf8")` sin manejo de `ENOENT` u otros errores de lectura. | Envolver en `try/catch`, imprimir mensaje claro y `process.exit(1)`. |
| 20 | [scripts/check-spanish-copy.mjs](scripts/check-spanish-copy.mjs#L79-L80) | 1 | `vm.runInContext(i18nSource, ...)` sin try/catch; un error de sintaxis en `i18n.js` no se reporta con contexto. | Envolver en `try/catch` con mensaje descriptivo. |
| 21 | [services/api/email_service.py](services/api/email_service.py#L12-L14) | 4 | El `RuntimeError` por falta de `RESEND_API_KEY` podría filtrar detalles de configuración si se propaga fuera del catch actual de `auth.py`. | Mantener el mensaje genérico para el cliente y detallar solo en logs de servidor. |
| 22 | [services/api/incident_store.py](services/api/incident_store.py#L49-L58) | 2 | `except Exception: connection.rollback(); raise` es más amplio de lo necesario (podría enmascarar errores de programación). | Capturar `sqlite3.Error` específicamente. |
| 23 | [services/api/main.py](services/api/main.py#L36-L40) | 1 | `exc.errors()[0]` en el manejador de validación puede lanzar `IndexError` no controlado si la lista viene vacía. | Usar `exc.errors()[0] if exc.errors() else {}`. |
| 24 | [services/api/routers/profiles.py](services/api/routers/profiles.py#L21-L23) | 1 | `update_profile` puede devolver `None` y el endpoint lo serializaría como `200 null` en vez de `404`. | Comprobar `None` y lanzar `HTTPException(404)`. |
| 25 | [services/api/routers/suppliers.py](services/api/routers/suppliers.py#L45-L150) | 2 | No hay try/except real alrededor de `table.insert`/`table.update`; fallos de I/O reales darían un 500 genérico sin contexto. | Envolver las escrituras en TinyDB en `try/except OSError` específico. |
| 26 | [services/api/seed.py](services/api/seed.py#L145-L165) | 1, 8 | Sin manejo de errores en apertura de BD/inserciones ni `try/except`+`sys.exit(1)` explícito a nivel de `main`. | Envolver `main()` en `try/except Exception` con `sys.exit(1)` y mensaje descriptivo. |
| 27 | [services/api/user_service.py](services/api/user_service.py#L20-L24) | 1 | `get_users_table().get(...)` sin manejo de errores de TinyDB (fichero corrupto/bloqueado). | Capturar errores de acceso y propagar con contexto. |
| 28 | [uis/talent-pipeline-tracker/lib/candidates.ts](uis/talent-pipeline-tracker/lib/candidates.ts#L88-L103) | 1 | `fetch` en `fetchRecordsPage` sin try/catch propio; se delega al error boundary de Next. | Confirmar el patrón intencionalmente o normalizar el error antes de lanzarlo. |
| 29 | [uis/talent-pipeline-tracker/lib/candidates.ts](uis/talent-pipeline-tracker/lib/candidates.ts) (varias líneas: 96, 134, 151, 164, 180, 196, 222, 235) | 4 | Los mensajes de error incluyen el código HTTP crudo (`Error al obtener candidaturas (${status})`) que se renderiza tal cual. | Usar mensajes genéricos para el usuario; loguear el código internamente. |
| 30 | [uis/talent-pipeline-tracker/lib/candidates.ts](uis/talent-pipeline-tracker/lib/candidates.ts#L79-L82) | 4, 5 | Si falta `NEXT_PUBLIC_API_URL`, el mensaje de error puede llegar al `error.tsx` del cliente revelando detalles de configuración. | Mensaje genérico al usuario; detalle solo en logs de servidor. |
| 31 | [uis/talent-pipeline-tracker/app/page.tsx](uis/talent-pipeline-tracker/app/page.tsx#L1-L11) | 1 | `await fetchAllCandidates()` sin try/catch propio en el Server Component. | Documentar/confirmar que se delega intencionalmente al `error.tsx`. |
| 32 | [uis/talent-pipeline-tracker/app/error.tsx](uis/talent-pipeline-tracker/app/error.tsx) | 7 | Solo ofrece botón "Reintentar", sin enlace al inicio ni contacto de soporte. | Añadir navegación de vuelta y/o enlace de soporte. |
| 33 | [uis/talent-pipeline-tracker/app/candidates/[id]/page.tsx](uis/talent-pipeline-tracker/app/candidates/%5Bid%5D/page.tsx#L14) | 1, 6 | `Promise.all([fetchCandidateById(id), fetchCandidateNotes(id)])` sin try/catch; un fallo en notas tira toda la página en vez de degradar parcialmente. | Manejar cada fetch por separado para permitir degradación parcial. |
| 34 | [uis/talent-pipeline-tracker/hooks/use-candidate-notes.ts](uis/talent-pipeline-tracker/hooks/use-candidate-notes.ts#L42-L45) y [L58-L61](uis/talent-pipeline-tracker/hooks/use-candidate-notes.ts#L58-L61) | 3, 7 | Catch vacío que descarta el error real (sin `console.error` ni reporte); sin botón de reintento explícito. | Loguear el error (sin datos sensibles) antes de mostrar el mensaje genérico; añadir acción de reintento. |
| 35 | [uis/talent-pipeline-tracker/components/candidates/CandidateProcessModal.tsx](uis/talent-pipeline-tracker/components/candidates/CandidateProcessModal.tsx#L72-L74) | 3 | Catch silencioso, no se loguea el error real. | Añadir `console.error`/reporte a monitoreo antes de setear el mensaje. |
| 36 | [uis/talent-pipeline-tracker/components/candidates/CandidateDetailsCard.tsx](uis/talent-pipeline-tracker/components/candidates/CandidateDetailsCard.tsx#L95-L99) | 3 | Mismo patrón de catch vacío sin logging. | Igual que arriba. |
| 37 | [uis/talent-pipeline-tracker/components/candidates/CandidateRecordForm.tsx](uis/talent-pipeline-tracker/components/candidates/CandidateRecordForm.tsx#L52-L55) | 3 | Catch vacío; no distingue errores de validación (400) de errores de red/servidor. | Diferenciar tipos de error para dar feedback específico por campo. |
| 38 | [uis/backoffice/src/lib/incidents.ts](uis/backoffice/src/lib/incidents.ts#L16) | 4 | `data?.message` del backend se reenvía sin sanitizar a la UI. | Whitelisting de mensajes esperados o sanitización básica. |
| 39 | [uis/backoffice/src/app/login/page.tsx](uis/backoffice/src/app/login/page.tsx#L37) | 4 | `data?.detail` del backend se muestra directo en la UI. | Mapear a mensajes controlados por el frontend. |
| 40 | [uis/backoffice/src/app/register/page.tsx](uis/backoffice/src/app/register/page.tsx#L68-L118) | 2, 4 | Un solo `try` cubre dos llamadas de red distintas (`/backend/users` y `/backend/auth/login`); `data.detail`/`loginData.detail` se muestran sin sanitizar. | Separar en dos bloques try/catch con mensajes por operación; sanitizar mensajes mostrados. |
| 41 | [uis/backoffice/src/app/incidents/page.tsx](uis/backoffice/src/app/incidents/page.tsx#L38-L46) | 3 | Catches vacíos en `loadList`/`loadSummary` que descartan el error real. | Añadir logging antes de setear el estado de error visible. |
| 42 | [uis/backoffice/src/app/suppliers/page.tsx](uis/backoffice/src/app/suppliers/page.tsx#L140-L153) | 3 | Catch no loguea el error real antes de descartarlo. | Igual que arriba. |
| 43 | [uis/backoffice/src/app/account/profile/page.tsx](uis/backoffice/src/app/account/profile/page.tsx#L52-L56) | 7 | El error de carga de perfil no ofrece botón de "Reintentar". | Añadir acción de reintento junto al mensaje. |
| 44 | [uis/backoffice/src/app/forgot-password/page.tsx](uis/backoffice/src/app/forgot-password/page.tsx#L19-L29) | 3 | Catch vacío sin loguear el error real (aunque el mensaje genérico al usuario es correcto por diseño anti-enumeración). | Loguear el error real internamente sin afectar el mensaje anti-enumeración mostrado. |
| 45 | [uis/backoffice/src/app/reset-password/page.tsx](uis/backoffice/src/app/reset-password/page.tsx#L44) | 4 | `data?.detail` del backend mostrado directo en la UI. | Mapear a mensaje controlado por el frontend. |

---

## Buenas prácticas observadas (no requieren corrección)

- [services/api/main.py](services/api/main.py#L46-L50): el manejador global de excepciones usa `logging.getLogger(__name__).exception(...)` y no expone el error crudo al cliente.
- [services/api/routers/incidents.py](services/api/routers/incidents.py#L54-L58): usa excepciones de dominio (`IncidentValidationError`) en vez de reenviar `str(e)`.
- [uis/backoffice/src/app/incidents/page.tsx](uis/backoffice/src/app/incidents/page.tsx): implementa `LoadingSkeleton` + botón "Reintentar" — patrón a replicar en el resto de páginas.
- [uis/backoffice/src/app/forgot-password/page.tsx](uis/backoffice/src/app/forgot-password/page.tsx): usa un mensaje genérico independiente de si el email existe, evitando enumeración de usuarios.
- [uis/backoffice/src/lib/incidents.ts](uis/backoffice/src/lib/incidents.ts#L15-L16): try/catch acotado específicamente a la llamada de red, con error normalizado (`IncidentApiError`).

---

## Resumen ejecutivo

| Severidad | Nº de hallazgos |
|---|---|
| CRÍTICO | 0 |
| ALTO | 3 |
| MEDIO | 12 |
| BAJO | 30 |

**Top 3 a resolver primero:**
1. Validar `JWT_SECRET` al arrancar la API ([services/api/security.py](services/api/security.py#L17)) — evita errores 500 intermitentes en producción.
2. Migrar el token de sesión de `localStorage` a cookie `httpOnly` en el backoffice ([uis/backoffice/src/lib/auth.ts](uis/backoffice/src/lib/auth.ts#L20-L29)) — reduce superficie de ataque XSS.
3. Blindar la migración de datos legacy en el arranque de la API ([services/api/incident_store.py](services/api/incident_store.py#L61-L70)) — evita que un JSON corrupto tumbe todo el servicio.
</content>
