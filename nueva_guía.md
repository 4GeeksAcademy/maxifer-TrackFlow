# Nueva guia AUTH-01 para este monorepo TrackFlow

Esta guia combina lo que pide `RETO.md` con la guia de auth del profe, pero adaptada al estado real de este repositorio. La idea es cumplir el ticket `AUTH-01` al 100% sin pisar lo que ya funciona en `services/api`.

## Diagnostico rapido

El proyecto ya tiene una API FastAPI en:

```text
services/api/
+-- main.py
+-- database.py
+-- models.py
+-- seed.py
+-- data/suppliers.json
+-- routers/suppliers.py
```

Tambien tiene rutas existentes que deben seguir funcionando:

```text
GET  /
POST /api/incidents/analyze
GET  /api/incidents/results/export
POST /suppliers
GET  /suppliers
GET  /suppliers/{supplier_id}
PATCH /suppliers/{supplier_id}/rate
PATCH /suppliers/{supplier_id}/status
DELETE /suppliers/{supplier_id}
```

La guia del profe asume una carpeta `services/api` vacia y propone reemplazar `main.py` y `database.py`. En este repo eso no conviene. La adaptacion correcta es:

- No crear un repo nuevo.
- No borrar ni reemplazar la API actual.
- No romper `suppliers.json` ni el seeder.
- Agregar auth en modulos separados.
- Extender `database.py` sin cambiar su comportamiento actual.
- Registrar routers nuevos en `main.py`.
- Proteger al menos 5 rutas existentes con `Depends(get_current_user)`.

## Objetivo de implementacion

Al terminar, deben existir:

```text
services/api/
+-- auth.py                 # router /auth
+-- security.py             # JWT, bcrypt, get_current_user
+-- user_service.py         # CRUD User/Profile en TinyDB
+-- schemas_auth.py         # modelos Pydantic para auth/users/profiles
+-- routers/
|   +-- users.py            # router /users
|   +-- profiles.py         # router /profiles
|   +-- suppliers.py        # rutas existentes protegidas
+-- database.py             # extendido, no reemplazado
+-- main.py                 # incluye routers existentes y nuevos
```

## Paso 1: rama de trabajo

Desde la raiz del monorepo:

```bash
git switch -c feature/auth-api
```

Si la rama ya existe:

```bash
git switch feature/auth-api
```

## Paso 2: dependencias con uv

El reto prohibe `pip install` y `pipenv`. Usar `uv`.

En este repo ya existe un `pyproject.toml` en la raiz. Para no crear proyectos Python paralelos dentro de `services/api`, instalar desde la raiz:

```bash
uv add fastapi "uvicorn[standard]" tinydb "python-jose[cryptography]" "libpass[bcrypt]" python-dotenv python-multipart email-validator
```

Nota importante: aunque se instala `libpass[bcrypt]`, el import se mantiene como:

```python
from passlib.hash import bcrypt
```

Opcionalmente, actualizar `services/api/requirements.txt` para que documente las dependencias de la API:

```text
fastapi
uvicorn[standard]
python-multipart
tinydb
python-jose[cryptography]
libpass[bcrypt]
python-dotenv
email-validator
```

## Paso 3: variables de entorno

Crear `services/api/.env`:

```env
SECRET_KEY=CAMBIAR_POR_UN_SECRETO_GENERADO
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

Generar el secreto con:

```bash
uv run python -c "import secrets; print(secrets.token_hex(32))"
```

Agregar al `.gitignore` de la raiz:

```gitignore
.env
services/api/.env
services/api/data/auth.json
```

No subir `.env` ni la base local de usuarios.

## Paso 4: extender `services/api/database.py`

No reemplazar el archivo. Actualmente maneja proveedores en `suppliers.json`. Solo agregar una segunda TinyDB para auth.

Dejar lo existente y sumar:

```python
AUTH_DB_FILE_PATH = Path(__file__).resolve().parent / "data" / "auth.json"
USERS_TABLE_NAME = "users"
PROFILES_TABLE_NAME = "profiles"

_AUTH_DB_INSTANCE: TinyDB | None = None


def get_auth_db() -> TinyDB:
    global _AUTH_DB_INSTANCE

    if _AUTH_DB_INSTANCE is None:
        AUTH_DB_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        _AUTH_DB_INSTANCE = TinyDB(AUTH_DB_FILE_PATH)

    return _AUTH_DB_INSTANCE


def get_users_table() -> Table:
    return get_auth_db().table(USERS_TABLE_NAME)


def get_profiles_table() -> Table:
    return get_auth_db().table(PROFILES_TABLE_NAME)
```

Por que asi:

- `suppliers.json` queda intacto.
- `User` y `Profile` quedan exclusivamente en TinyDB.
- No se crean tablas de usuarios en PostgreSQL/Supabase.
- Si mas adelante hay PostgreSQL para otros modulos, auth sigue separada.

## Paso 5: crear `services/api/schemas_auth.py`

Este archivo concentra los modelos de auth para no mezclar usuarios con proveedores.

```python
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=8)
    name: str | None = None
    phone: str | None = None
    address: str | None = None


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=8)
    role: Role | None = None
    is_active: bool | None = None


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)

    name: str | None = None
    phone: str | None = None
    address: str | None = None


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    is_active: bool
    role: Role
    created_at: datetime


class ProfilePublic(BaseModel):
    id: str
    user_id: str
    name: str | None = None
    phone: str | None = None
    address: str | None = None
```

`email-validator` ya queda incluido porque `EmailStr` lo necesita para validar emails correctamente.

## Paso 6: crear `services/api/user_service.py`

Este servicio cumple el requisito de CRUD aislado y evita meter logica de TinyDB en los routers.

```python
from datetime import datetime, timezone
from uuid import uuid4

from tinydb import Query

from services.api.database import get_profiles_table, get_users_table


UserQuery = Query()
ProfileQuery = Query()


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "is_active": user["is_active"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


def get_user_by_id(user_id: str) -> dict | None:
    return get_users_table().get(UserQuery.id == user_id)


def get_user_by_email(email: str) -> dict | None:
    return get_users_table().get(UserQuery.email == email)


def get_all_users() -> list[dict]:
    return get_users_table().all()


def create_user_with_profile(email: str, hashed_password: str, profile_data: dict | None = None) -> tuple[dict, dict]:
    user_id = str(uuid4())
    profile_data = profile_data or {}

    user = {
        "id": user_id,
        "email": email,
        "hashed_password": hashed_password,
        "is_active": True,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    profile = {
        "id": str(uuid4()),
        "user_id": user_id,
        "name": profile_data.get("name"),
        "phone": profile_data.get("phone"),
        "address": profile_data.get("address"),
    }

    get_users_table().insert(user)
    get_profiles_table().insert(profile)

    return user, profile


def update_user(user_id: str, changes: dict) -> dict | None:
    get_users_table().update(changes, UserQuery.id == user_id)
    return get_user_by_id(user_id)


def delete_user(user_id: str) -> None:
    get_users_table().remove(UserQuery.id == user_id)
    get_profiles_table().remove(ProfileQuery.user_id == user_id)


def get_profile_by_user_id(user_id: str) -> dict | None:
    return get_profiles_table().get(ProfileQuery.user_id == user_id)


def update_profile(user_id: str, changes: dict) -> dict | None:
    get_profiles_table().update(changes, ProfileQuery.user_id == user_id)
    return get_profile_by_user_id(user_id)
```

## Paso 7: crear `services/api/security.py`

Este archivo contiene JWT, bcrypt y la dependencia `get_current_user`.

```python
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.hash import bcrypt

from services.api.user_service import get_user_by_id


load_dotenv(Path(__file__).resolve().parent / ".env")

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token invalido o expirado.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def hash_password(password: str) -> str:
    return bcrypt.hash(password)


def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.verify(password, hashed_password)


def create_access_token(user_id: str) -> str:
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY no esta configurado.")

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expires_at}

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    if not SECRET_KEY:
        raise RuntimeError("SECRET_KEY no esta configurado.")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")

        if not user_id:
            raise _credentials_exception()

        user = get_user_by_id(user_id)

        if not user or not user.get("is_active", True):
            raise _credentials_exception()

        return user

    except JWTError as error:
        raise _credentials_exception() from error
```

## Paso 8: crear `services/api/auth.py`

`/auth/login` usa formulario OAuth2 porque Swagger lo entiende bien. El campo `username` se usa como email.

```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from services.api.security import create_access_token, get_current_user, verify_password
from services.api.user_service import get_profile_by_user_id, get_user_by_email, public_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = get_user_by_email(form.username)

    if not user or not verify_password(form.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contrasena incorrectos.",
        )

    return {
        "access_token": create_access_token(user["id"]),
        "token_type": "bearer",
    }


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {
        "user": public_user(current_user),
        "profile": get_profile_by_user_id(current_user["id"]),
    }
```

## Paso 9: crear `services/api/routers/users.py`

Cumple `/users`: registro publico, listado protegido, detalle protegido, update protegido y delete protegido.

```python
from fastapi import APIRouter, Depends, HTTPException, status

from services.api.schemas_auth import UserCreate, UserUpdate
from services.api.security import get_current_user, hash_password
from services.api.user_service import (
    create_user_with_profile,
    delete_user,
    get_all_users,
    get_user_by_email,
    get_user_by_id,
    public_user,
    update_user,
)


router = APIRouter(prefix="/users", tags=["users"])


def require_owner_or_admin(user_id: str, current_user: dict) -> None:
    if current_user["id"] != user_id and current_user["role"] != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tenes permiso para acceder a este recurso.",
        )


@router.post("", status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate):
    if get_user_by_email(str(payload.email)):
        raise HTTPException(status_code=400, detail="El email ya esta registrado.")

    user, profile = create_user_with_profile(
        email=str(payload.email),
        hashed_password=hash_password(payload.password),
        profile_data={
            "name": payload.name,
            "phone": payload.phone,
            "address": payload.address,
        },
    )

    return {"user": public_user(user), "profile": profile}


@router.get("")
def list_users(current_user: dict = Depends(get_current_user)):
    return [public_user(user) for user in get_all_users()]


@router.get("/{user_id}")
def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    require_owner_or_admin(user_id, current_user)

    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    return public_user(user)


@router.put("/{user_id}")
def edit_user(user_id: str, payload: UserUpdate, current_user: dict = Depends(get_current_user)):
    require_owner_or_admin(user_id, current_user)

    if not get_user_by_id(user_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    changes = payload.model_dump(exclude_none=True)

    if "email" in changes:
        existing = get_user_by_email(str(changes["email"]))
        if existing and existing["id"] != user_id:
            raise HTTPException(status_code=400, detail="El email ya esta registrado.")
        changes["email"] = str(changes["email"])

    if "password" in changes:
        changes["hashed_password"] = hash_password(changes.pop("password"))

    if "role" in changes:
        if current_user["role"] != "admin":
            raise HTTPException(status_code=403, detail="Solo un admin puede cambiar roles.")
        changes["role"] = changes["role"].value

    updated = update_user(user_id, changes)
    return public_user(updated)


@router.delete("/{user_id}")
def remove_user(user_id: str, current_user: dict = Depends(get_current_user)):
    require_owner_or_admin(user_id, current_user)

    if not get_user_by_id(user_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")

    delete_user(user_id)
    return {"deleted": True, "id": user_id}
```

## Paso 10: crear `services/api/routers/profiles.py`

El perfil se accede solamente como `/profiles/me`, asi se evita que un usuario toque perfiles ajenos.

```python
from fastapi import APIRouter, Depends, HTTPException

from services.api.schemas_auth import ProfileUpdate
from services.api.security import get_current_user
from services.api.user_service import get_profile_by_user_id, update_profile


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
def get_my_profile(current_user: dict = Depends(get_current_user)):
    profile = get_profile_by_user_id(current_user["id"])

    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")

    return profile


@router.put("/me")
def edit_my_profile(payload: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    changes = payload.model_dump(exclude_none=True)
    return update_profile(current_user["id"], changes)
```

## Paso 11: actualizar `services/api/main.py`

No reemplazar `main.py`. Solo importar routers nuevos e incluirlos.

Agregar imports:

```python
from services.api.auth import router as auth_router
from services.api.routers.profiles import router as profiles_router
from services.api.routers.users import router as users_router
from services.api.security import get_current_user
from fastapi import Depends
```

Registrar routers junto al router existente de suppliers:

```python
app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(auth_router)
app.include_router(suppliers_router)
```

Proteger las dos rutas existentes de incidentes:

```python
@app.post("/api/incidents/analyze")
async def analyze_incidents(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
```

```python
@app.get("/api/incidents/results/export")
def export_results(
    current_user: dict = Depends(get_current_user),
):
```

La ruta `GET /` puede quedar publica porque no expone datos sensibles.

## Paso 12: actualizar `services/api/routers/suppliers.py`

Este archivo ya tiene 6 rutas preexistentes. Protegerlas cumple de sobra el requisito de "al menos 5 rutas existentes fuera de `/users` y `/auth`".

Agregar imports:

```python
from fastapi import Depends
from services.api.security import get_current_user
```

Luego sumar `current_user` en cada handler:

```python
def create_supplier(
    payload: SupplierCreate,
    current_user: dict = Depends(get_current_user),
):
```

```python
def list_suppliers(
    country: SupplierCountry | None = Query(default=None),
    category: SupplierCategory | None = Query(default=None),
    current_user: dict = Depends(get_current_user),
):
```

```python
def get_supplier_by_id(
    supplier_id: int,
    current_user: dict = Depends(get_current_user),
):
```

```python
def update_supplier_rate(
    supplier_id: int,
    payload: SupplierRateUpdate,
    current_user: dict = Depends(get_current_user),
):
```

```python
def update_supplier_status(
    supplier_id: int,
    payload: SupplierStatusUpdate,
    current_user: dict = Depends(get_current_user),
):
```

```python
def delete_supplier(
    supplier_id: int,
    current_user: dict = Depends(get_current_user),
):
```

Con eso quedan protegidas estas rutas existentes:

- `POST /suppliers`
- `GET /suppliers`
- `GET /suppliers/{supplier_id}`
- `PATCH /suppliers/{supplier_id}/rate`
- `PATCH /suppliers/{supplier_id}/status`
- `DELETE /suppliers/{supplier_id}`

Y ademas quedan protegidas:

- `POST /api/incidents/analyze`
- `GET /api/incidents/results/export`

## Paso 13: levantar la API

Desde la raiz:

```bash
uv run uvicorn services.api.main:app --reload --host 0.0.0.0 --port 8000
```

Abrir:

```text
http://localhost:8000/docs
```

## Paso 14: flujo manual en Swagger

1. Crear usuario en `POST /users`:

```json
{
  "email": "alumno@test.com",
  "password": "12345678",
  "name": "Alumno",
  "phone": "1122334455",
  "address": "Buenos Aires"
}
```

2. Confirmar que se creo `services/api/data/auth.json`.

3. Revisar que `users` tenga:

```json
{
  "id": "...",
  "email": "alumno@test.com",
  "hashed_password": "$2b$...",
  "is_active": true,
  "role": "user",
  "created_at": "..."
}
```

4. Revisar que `profiles` tenga:

```json
{
  "id": "...",
  "user_id": "...",
  "name": "Alumno",
  "phone": "1122334455",
  "address": "Buenos Aires"
}
```

5. Confirmar que `name`, `phone` y `address` no estan dentro de `User`.

6. Login en `POST /auth/login`:

```text
username: alumno@test.com
password: 12345678
```

7. La respuesta debe ser:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

8. Click en `Authorize` y pegar el token como Bearer.

9. Probar:

```text
GET /auth/me
GET /profiles/me
GET /users
GET /suppliers
POST /api/incidents/analyze
```

## Paso 15: pruebas de 401 y 403

Sin token:

```text
GET /users
GET /profiles/me
GET /suppliers
```

Debe devolver:

```text
401 Unauthorized
```

Con token invalido o expirado:

```text
401 Unauthorized
```

Para probar expiracion:

1. Cambiar temporalmente `ACCESS_TOKEN_EXPIRE_MINUTES=1`.
2. Reiniciar la API.
3. Hacer login.
4. Esperar mas de 1 minuto.
5. Llamar una ruta protegida.
6. Debe responder `401`.
7. Volver a `ACCESS_TOKEN_EXPIRE_MINUTES=30`.

Para probar `403`:

1. Crear usuario A.
2. Crear usuario B.
3. Hacer login con usuario A.
4. Intentar:

```text
PUT /users/ID_DEL_USUARIO_B
```

Debe devolver:

```text
403 Forbidden
```

## Paso 16: checklist de cumplimiento 100%

- [ ] Se trabaja en `feature/auth-api`.
- [ ] Se instalaron dependencias con `uv`.
- [ ] No se uso `pip install` ni `pipenv`.
- [ ] `SECRET_KEY` esta en `services/api/.env`.
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` esta en `services/api/.env`.
- [ ] `User` se guarda solamente en TinyDB.
- [ ] `Profile` se guarda solamente en TinyDB.
- [ ] No hay tablas de usuario en PostgreSQL/Supabase.
- [ ] `User` tiene `id`, `email`, `hashed_password`, `is_active`, `role`, `created_at`.
- [ ] `User` no tiene `name`, `phone` ni `address`.
- [ ] `Profile` tiene `id`, `user_id`, `name`, `phone`, `address`.
- [ ] `role` acepta solamente `admin`, `manager`, `user`.
- [ ] `POST /users` crea usuario con `role = user`.
- [ ] `POST /users` crea tambien el perfil vinculado.
- [ ] La contrasena se guarda hasheada con bcrypt.
- [ ] La contrasena en texto plano no aparece en `auth.json`.
- [ ] Existe CRUD completo de usuarios.
- [ ] `DELETE /users/{id}` elimina tambien el perfil.
- [ ] Existe `POST /auth/login`.
- [ ] Login devuelve JWT firmado.
- [ ] El JWT guarda el ID TinyDB del usuario en `sub`.
- [ ] Existe `GET /auth/me`.
- [ ] Existe `GET /profiles/me`.
- [ ] Existe `PUT /profiles/me`.
- [ ] Existe `get_current_user`.
- [ ] `get_current_user` valida firma, expiracion y existencia del usuario.
- [ ] Rutas protegidas sin token devuelven `401`.
- [ ] Token invalido o expirado devuelve `401`.
- [ ] Usuario autenticado sin permiso recibe `403`.
- [ ] Todas las rutas `/users` estan protegidas excepto `POST /users`.
- [ ] `/auth/me` esta protegido.
- [ ] `/profiles/me` esta protegido.
- [ ] Al menos 5 rutas preexistentes estan protegidas.
- [ ] Las rutas existentes siguen funcionando cuando se envia un token valido.
- [ ] `.env` y `services/api/data/auth.json` no se suben al repo.

## Paso 17: comandos de verificacion recomendados

Revisar sintaxis:

```bash
uv run python -m compileall services/api
```

Levantar servidor:

```bash
uv run uvicorn services.api.main:app --reload --host 0.0.0.0 --port 8000
```

Ver docs:

```text
http://localhost:8000/docs
```

Revisar cambios:

```bash
git status
git diff
```

## Paso 18: entrega

Cuando todo este verificado:

```bash
git add .
git commit -m "feat: add JWT authentication"
git push -u origin feature/auth-api
```

Abrir Pull Request contra `main`.

## Regla de oro para no romper el monorepo

No seguir la guia del profe como "copiar y reemplazar". Usarla como base conceptual. En este repo, la implementacion correcta es incremental:

- agregar archivos nuevos para auth,
- extender `database.py`,
- registrar routers en `main.py`,
- proteger rutas existentes,
- conservar el analizador de incidentes,
- conservar el CRUD de suppliers,
- conservar `services/api/data/suppliers.json`.

Asi se cumple `AUTH-01` y se evita perder trabajo ya hecho.
