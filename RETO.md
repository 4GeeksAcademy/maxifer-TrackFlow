# RETO: Asegurando la API - Autenticación y Restricción de Rutas en FastAPI (AUTH-01)

## Contexto y Objetivo

La API de la empresa está creciendo. Actualmente, cualquier cliente puede acceder a todos los endpoints sin restricción. El objetivo de este ticket (`AUTH-01`) es implementar una capa completa de autenticación mediante **JWT stateless** en FastAPI, protegiendo todas las rutas que expongan o modifiquen datos sensibles.

> **Importante:** Este trabajo se realiza dentro del monorepo existente del proyecto transversal en una nueva rama (`feature/auth-api`). No se debe crear un repositorio nuevo.

---

## Instrucciones de Inicio e Instalación

1. Trabajar sobre el repositorio del proyecto transversal de backend.
2. Crear y cambiar a una nueva rama:

   ```bash
   git switch -c feature/auth-api
   ```

3. Instalar las dependencias únicamente usando `uv` (prohibido usar `pip install` o `pipenv`):

   ```bash
   uv add "python-jose[cryptography]" "libpass[bcrypt]"
   ```

> **Nota:** Se debe utilizar `libpass[bcrypt]` en lugar del paquete `passlib` (el cual está descontinuado). La importación en Python se mantiene como `from passlib.hash import bcrypt`.

---

## Requisitos de Implementación (Ticket AUTH-01)

### 1. Base de Datos y Almacenamiento

- **TinyDB exclusivo para usuarios:** Los modelos `User` y `Profile` deben almacenarse **únicamente en TinyDB** (incluso si en fases posteriores se integra Supabase/PostgreSQL).
- **Identificadores:** El JWT debe contener el ID del usuario en TinyDB. Los módulos externos o tablas en PostgreSQL harán referencia a este como `user_uuid`.
- **Prohibición:** No usar sesiones ni cookies. Usar exclusivamente autenticación JWT *stateless*.

### 2. Modelo de Datos y Módulo `users` (`/users`)

#### Modelo `User` (en TinyDB)

- Campos obligatorios: `id`, `email`, `hashed_password`, `is_active`, `role`, `created_at`.
- **Separación de responsabilidades:** `User` gestiona *únicamente* credenciales. **No** almacenar nombre ni datos de contacto en `User`.
- **Rol:** El campo `role` debe ser un `Enum` o tener validación estricta para aceptar exclusivamente los valores: `admin`, `manager` o `user`.

#### Endpoints REST en `/users`

- `POST /users`: Registro de nuevo usuario.
  - Hashea la contraseña con `bcrypt` antes de guardar (nunca almacenar ni comparar en texto plano).
  - Asigna por defecto `role = "user"`.
  - Acepta campos opcionales de perfil inicial (`name`, `phone`, `address`) y crea el objeto `Profile` vinculado en la misma operación.
- `GET /users`: Listar todos los usuarios. *(Ruta protegida)*
- `GET /users/{id}`: Obtener usuario por ID. *(Ruta protegida)*
- `PUT /users/{id}`: Actualizar credenciales (`email`, y `role` solo si quien llama es `admin`). *(Ruta protegida: solo el propio usuario o un admin)*
- `DELETE /users/{id}`: Eliminar usuario. *(Ruta protegida: también debe eliminar el `Profile` vinculado)*

#### Capa de Servicios

Implementar funciones aisladas para el CRUD completo de usuarios:

- Crear usuario.
- Obtener usuario por ID.
- Obtener usuario por email.
- Actualizar usuario.
- Eliminar usuario.

### 3. Modelo de Datos y Módulo `profiles` (`/profiles`)

#### Modelo `Profile` (en TinyDB)

- Relación uno a uno con `User` mediante `user_id`.
- Campos mínimos: `id`, `user_id`, `name`, `phone`, `address`.

#### Endpoints REST en `/profiles`

- `GET /profiles/me`: Devuelve el perfil del usuario autenticado. *(Ruta protegida)*
- `PUT /profiles/me`: Actualiza `name`, `phone` y `address` del usuario autenticado. *(Ruta protegida: solo el dueño del perfil puede modificarlo)*

### 4. Endpoints de Autenticación (`/auth`)

- `POST /auth/login`: Acepta `email` y `password`, valida credenciales contra el hash almacenado y devuelve un token de acceso JWT firmado.
- `GET /auth/me`: Devuelve la información del usuario autenticado (`email`, `role`) junto con su `Profile` vinculado (`name`, datos de contacto). *(Ruta protegida)*

### 5. Configuración de Seguridad, Token y Dependencia

- **Librerías:** Utilizar `OAuth2PasswordBearer` de FastAPI y `python-jose` para firmar y verificar tokens.
- **Variables de entorno:**
  - Clave secreta de firma guardada en `.env` (nunca hardcodear).
  - Tiempo de expiración del token configurable vía variable de entorno (ej. `ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Dependencia `get_current_user`:**
  - Extrae la cabecera `Authorization: Bearer <token>`.
  - Decodifica y valida la firma y vigencia del JWT.
  - Recupera el usuario desde TinyDB.
  - Lanza `HTTPException(401)` si la firma es inválida, el token ha expirado o el usuario no existe.
- **Manejo de errores de permisos:**
  - Devolver `401 Unauthorized` para solicitudes sin autenticación o con token inválido/expirado.
  - Devolver `403 Forbidden` cuando un usuario autenticado intente acceder o modificar un recurso/perfil que no le pertenece.

### 6. Protección Global de Rutas Existentes

Aplicar `get_current_user` a:

- Todos los endpoints de `/users` (excepto `POST /users`).
- Endpoint `GET /auth/me` y endpoints de `/profiles`.
- **Al menos 5 rutas preexistentes** en la API del monorepo (fuera de los módulos `/users` y `/auth`) que manejen o modifiquen datos sensibles.

---

## Pasos de Verificación Manual

1. Abrir Swagger / Docs interactivos (`/docs`).
2. Probar el flujo completo:
   - Registrar usuario con `POST /users`.
   - Iniciar sesión en `POST /auth/login`.
   - Copiar token.
   - Autorizar en la UI con el token.
   - Consumir una ruta protegida.
3. Verificar que llamar a una ruta protegida sin token devuelva un status code `401`.
4. Verificar que usar un token expirado o malformado devuelva un status code `401`.
5. Verificar que intentar editar datos de otro usuario devuelva un status code `403`.

---

## Criterios de Evaluación (Checklist)

- [ ] **CRUD de Usuarios:** El CRUD de usuarios está completamente implementado y accesible a través de la API.
- [ ] **Modelo Profile Desacoplado:** Cada `User` tiene un `Profile` vinculado; `name`, `phone` y `address` se almacenan en `Profile`, no en `User`.
- [ ] **Restricción de Roles:** El campo `role` acepta únicamente `admin`, `manager` o `user`; los usuarios nuevos creados vía `POST /users` usan `user` por defecto.
- [ ] **Hasheo Seguro de Contraseñas:** Las contraseñas se hashean al crear el usuario y se comparan correctamente en el login. El texto plano nunca toca la base de datos.
- [ ] **Generación JWT:** El endpoint `/auth/login` devuelve un token JWT válido y firmado.
- [ ] **Dependencia `get_current_user`:** La dependencia decodifica correctamente el token e identifica al usuario activo.
- [ ] **Respuesta 401 (Unauthorized):** Las rutas protegidas devuelven `401` al ser llamadas sin un token o con un token inválido/expirado.
- [ ] **Respuesta 403 (Forbidden):** Un usuario que accede o actualiza el perfil o las credenciales de otro usuario recibe `403 Forbidden`.
- [ ] **Variables de Entorno:** La expiración del token y la clave de firma (`SECRET_KEY`) se leen desde `.env`, no están hardcodeadas.
- [ ] **Estructura de Rutas:** Rutas organizadas bajo `/auth`, `/users` y `/profiles`.
- [ ] **Protección de Rutas del Monorepo:** Al menos 5 rutas existentes fuera de `/users` y `/auth` requieren un token válido.
- [ ] **Persistencia en TinyDB:** `User` y `Profile` permanecen en TinyDB tras introducir Supabase/PostgreSQL, sin tablas de usuario en PostgreSQL.
- [ ] **Sin Regresiones:** Las rutas protegidas preexistentes del monorepo siguen funcionando correctamente al enviar un token valido.
