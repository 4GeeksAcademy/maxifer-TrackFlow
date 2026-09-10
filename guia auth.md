# AUTH-01 — Autenticación JWT en FastAPI

En esta entrega vamos a agregar autenticación al backend del proyecto transversal.

Vamos a usar:

- FastAPI
- TinyDB
- JWT
- `OAuth2PasswordBearer`
- `libpass[bcrypt]`
- `uv`

```text
services/api/
├── main.py
├── database.py
├── services.py
├── auth.py
├── users.py
├── profiles.py
├── .env
└── data/
```

---

## 1. Entrá al Codespace de tu monorepo

Repositorio base:

https://github.com/4GeeksAcademy/ai-engineering-company-project-monorepo

Trabajá sobre tu copia del monorepo.

En GitHub:

```text
Code → Codespaces → abrir Codespace
```

---

## 2. Entrá a `services`

Buscá:

```text
services/
```

Creá dentro de `services` la carpeta:

```text
services/api
```

---

## 3. Entrá a la carpeta de la API

En la terminal:

```bash
cd services/api
```

---

## 4. Inicializá el proyecto con `uv`

Ejecutá:

```bash
uv init --no-package
```

Ahora instalá las dependencias:

```bash
uv add fastapi "uvicorn[standard]" tinydb "python-jose[cryptography]" "libpass[bcrypt]" python-dotenv python-multipart
```

---

## 5. Creá la carpeta `data`

Dentro de `services/api` creá:

```text
data/
```

TinyDB va a crear `db.json` automáticamente cuando guardemos el primer usuario.

---

## 6. Creá `.env`

Generá una clave secreta:

```bash
uv run python -c "import secrets; print(secrets.token_hex(32))"
```

Copiá el resultado.

Creá:

```text
.env
```

y escribí:

```env
JWT_SECRET=PEGA_ACA_LA_CLAVE_GENERADA
ACCESS_TOKEN_EXPIRE_MINUTES=30
```


---

# 7. Creá `database.py`

Creá:

```text
database.py
```

y pegá:

```python
from pathlib import Path
from tinydb import TinyDB


BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(exist_ok=True)

db = TinyDB(DATA_DIR / "db.json")

users_table = db.table("users")
profiles_table = db.table("profiles")
```

Acá tenemos las dos tablas que pide la entrega:

```text
users
profiles
```

Los usuarios y perfiles quedan solamente en TinyDB.

No creen tablas `User` o `Profile` en PostgreSQL o Supabase.

---

# 8. Creá `services.py`


Creá:

```text
services.py
```

y pegá:

```python
from tinydb import Query

from database import users_table, profiles_table


User = Query()
Profile = Query()


def get_user_by_id(user_id: str):
    return users_table.get(
        User.id == user_id
    )


def get_user_by_email(email: str):
    return users_table.get(
        User.email == email
    )


def get_all_users():
    return users_table.all()


def create_user(user: dict, profile: dict):
    users_table.insert(user)
    profiles_table.insert(profile)

    return user


def update_user(user_id: str, changes: dict):
    users_table.update(
        changes,
        User.id == user_id
    )

    return get_user_by_id(user_id)


def delete_user(user_id: str):
    users_table.remove(
        User.id == user_id
    )

    profiles_table.remove(
        Profile.user_id == user_id
    )


def get_profile_by_user_id(user_id: str):
    return profiles_table.get(
        Profile.user_id == user_id
    )


def update_profile(user_id: str, changes: dict):
    profiles_table.update(
        changes,
        Profile.user_id == user_id
    )

    return get_profile_by_user_id(user_id)
```

---

# 9. Creá `auth.py`


Creá:

```text
auth.py
```

y pegá:

```python
import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.hash import bcrypt

from services import (
    get_profile_by_user_id,
    get_user_by_email,
    get_user_by_id
)


load_dotenv()


router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)


JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def create_access_token(user_id: str):
    expiration = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": user_id,
        "exp": expiration
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=ALGORITHM
    )


def get_current_user(
    token: str = Depends(oauth2_scheme)
):
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        user = get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=401,
                detail="Usuario no válido"
            )

        return user

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Token inválido o expirado"
        )


@router.post("/login")
def login(
    form: OAuth2PasswordRequestForm = Depends()
):
    # Swagger llama "username" al campo.
    # Nosotros usamos ese campo para enviar el email.

    user = get_user_by_email(form.username)

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos"
        )

    if not bcrypt.verify(
        form.password,
        user["hashed_password"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Email o contraseña incorrectos"
        )

    token = create_access_token(
        user["id"]
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }


@router.get("/me")
def get_me(
    current_user: dict = Depends(get_current_user)
):
    return {
        "id": current_user["id"],
        "email": current_user["email"],
        "role": current_user["role"],
        "profile": get_profile_by_user_id(
            current_user["id"]
        )
    }
```

---

# 10. Creá `users.py`


Creá:

```text
users.py
```

y pegá:

```python
from datetime import datetime, timezone
from enum import Enum
from typing import Optional
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from passlib.hash import bcrypt
from pydantic import BaseModel

from auth import get_current_user
from services import (
    create_user,
    delete_user,
    get_all_users,
    get_profile_by_user_id,
    get_user_by_email,
    get_user_by_id,
    update_user
)


router = APIRouter(
    prefix="/users",
    tags=["users"]
)


class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class UserCreate(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[Role] = None
    is_active: Optional[bool] = None


def public_user(user: dict):
    return {
        "id": user["id"],
        "email": user["email"],
        "is_active": user["is_active"],
        "role": user["role"],
        "created_at": user["created_at"]
    }


def owner_or_admin(
    user_id: str,
    current_user: dict
):
    if (
        current_user["id"] != user_id
        and current_user["role"] != "admin"
    ):
        raise HTTPException(
            status_code=403,
            detail="No tenés permiso"
        )


@router.post("")
def register(data: UserCreate):

    if get_user_by_email(data.email):
        raise HTTPException(
            status_code=400,
            detail="El email ya está registrado"
        )

    user_id = str(uuid4())

    user = {
        "id": user_id,
        "email": data.email,

        # bcrypt genera y guarda el hash.
        "hashed_password": bcrypt.hash(data.password),

        "is_active": True,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat()
    }

    profile = {
        "id": str(uuid4()),
        "user_id": user_id,
        "name": data.name,
        "phone": data.phone,
        "address": data.address
    }

    create_user(
        user,
        profile
    )

    return {
        "user": public_user(user),
        "profile": profile
    }


@router.get("")
def list_users(
    current_user: dict = Depends(get_current_user)
):
    return [
        public_user(user)
        for user in get_all_users()
    ]


@router.get("/{user_id}")
def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    owner_or_admin(
        user_id,
        current_user
    )

    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    return public_user(user)


@router.put("/{user_id}")
def edit_user(
    user_id: str,
    data: UserUpdate,
    current_user: dict = Depends(get_current_user)
):
    owner_or_admin(
        user_id,
        current_user
    )

    changes = data.model_dump(
        exclude_none=True
    )

    if "email" in changes:
        existing_user = get_user_by_email(
            changes["email"]
        )

        if (
            existing_user
            and existing_user["id"] != user_id
        ):
            raise HTTPException(
                status_code=400,
                detail="El email ya está registrado"
            )

    if "password" in changes:
        changes["hashed_password"] = bcrypt.hash(
            changes.pop("password")
        )

    if "role" in changes:

        if current_user["role"] != "admin":
            raise HTTPException(
                status_code=403,
                detail="Solo un admin puede cambiar roles"
            )

        changes["role"] = changes["role"].value

    user = update_user(
        user_id,
        changes
    )

    return public_user(user)


@router.delete("/{user_id}")
def remove_user(
    user_id: str,
    current_user: dict = Depends(get_current_user)
):
    owner_or_admin(
        user_id,
        current_user
    )

    if not get_user_by_id(user_id):
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )

    delete_user(user_id)

    return {
        "message": "Usuario eliminado"
    }
```

---

# 11. Creá `profiles.py`


Creá:

```text
profiles.py
```

y pegá:

```python
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import get_current_user
from services import (
    get_profile_by_user_id,
    update_profile
)


router = APIRouter(
    prefix="/profiles",
    tags=["profiles"]
)


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


@router.get("/me")
def get_my_profile(
    current_user: dict = Depends(get_current_user)
):
    profile = get_profile_by_user_id(
        current_user["id"]
    )

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Perfil no encontrado"
        )

    return profile


@router.put("/me")
def edit_my_profile(
    data: ProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    changes = data.model_dump(
        exclude_none=True
    )

    return update_profile(
        current_user["id"],
        changes
    )
```

Tenemos:

```text
GET /profiles/me
PUT /profiles/me
```

y ambas necesitan JWT.

---

# 12. Creá `main.py`


Creá o reemplazá:

```text
main.py
```

por:

```python
from fastapi import FastAPI

from auth import router as auth_router
from profiles import router as profiles_router
from users import router as users_router


app = FastAPI(
    title="Company API"
)


app.include_router(users_router)
app.include_router(profiles_router)
app.include_router(auth_router)


@app.get("/")
def home():
    return {
        "message": "API funcionando"
    }
```

---

# 13. Levantá la API

Ejecutá:

```bash
uv run uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

En Codespaces abrí:

```text
PORTS
```

Buscá el puerto:

```text
8000
```

y entrá a:

```text
/docs
```

---

# 14. Registrá un usuario

Probá:

```text
POST /users
```

Body:

```json
{
  "email": "alumno@test.com",
  "password": "12345678",
  "name": "Alumno",
  "phone": "1122334455",
  "address": "Buenos Aires"
}
```

Después de ejecutarlo debería aparecer:

```text
data/db.json
```

---

# 15. Revisá `data/db.json`

Dentro de `User` debería existir algo parecido a:

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

Dentro de `Profile`:

```json
{
  "id": "...",
  "user_id": "...",
  "name": "Alumno",
  "phone": "1122334455",
  "address": "Buenos Aires"
}
```

Importante:

```text
name
phone
address
```

van en `Profile`.

No en `User`.

Y la contraseña original:

```text
12345678
```

no debe aparecer guardada.

---

# 16. Hacé login

Probá:

```text
POST /auth/login
```

Swagger muestra:

```text
username
password
```

Usá:

```text
username: alumno@test.com
password: 12345678
```

Para nosotros:

```text
username = email
```

La respuesta tiene que ser:

```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

---

# 17. Probá una ruta protegida

Arriba de Swagger hacé click en:

```text
Authorize
```

Ingresá el email y password.

Después probá:

```text
GET /auth/me
```

y:

```text
GET /profiles/me
```

También:

```text
GET /users
```

Deben funcionar.

---

# 18. Probá el `401`

Hacé logout desde Swagger.

Intentá nuevamente:

```text
GET /users
```

Tiene que responder:

```text
401 Unauthorized
```

También debe devolver `401` si:

```text
el token está roto
el token está vencido
el token no existe
```

---

# 19. Probá el `403`

Creá dos usuarios.

Logueate con el usuario 1.

Intentá modificar al usuario 2:

```text
PUT /users/ID_DEL_USUARIO_2
```

Debe responder:

```text
403 Forbidden
```

La diferencia es:

```text
401
↓
no estás autenticado correctamente


403
↓
estás autenticado,
pero no tenés permiso
```

---

# 20. Protegé las rutas que ya tenías


Si tenías:

```python
@router.get("/orders")
def get_orders():
    return orders
```

agregale:

```python
from fastapi import Depends
from auth import get_current_user
```

y dejala así:

```python
@router.get("/orders")
def get_orders(
    current_user: dict = Depends(get_current_user)
):
    return orders
```

Eso obliga a mandar un JWT válido.

Hacé esto en **al menos 5 rutas existentes fuera de `/users` y `/auth`**.

---

# 21. Probá la expiración

En `.env` cambiá temporalmente:

```env
ACCESS_TOKEN_EXPIRE_MINUTES=1
```

Reiniciá la API.

Hacé login.

Esperá un poco más de un minuto.

Intentá entrar a una ruta protegida.

Debe devolver:

```text
401 Unauthorized
```

Después volvé a:

```env
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

# 22. Revisá `.gitignore`

Asegurate de no subir:

```text
.env
data/db.json
```

En `.gitignore` podés agregar:

```gitignore
.env
data/db.json
.venv/
__pycache__/
```

---

# 23. Checklist final

Antes de entregar revisá:

- [ ] `User` está guardado en TinyDB.
- [ ] `Profile` está guardado en TinyDB.
- [ ] `User` tiene `id`, `email`, `hashed_password`, `is_active`, `role` y `created_at`.
- [ ] `Profile` tiene `id`, `user_id`, `name`, `phone` y `address`.
- [ ] `name`, `phone` y `address` no están dentro de `User`.
- [ ] Los usuarios nuevos tienen `role = user`.
- [ ] `role` solamente acepta `admin`, `manager` o `user`.
- [ ] La contraseña se hashea con bcrypt.
- [ ] La contraseña original nunca se guarda.
- [ ] `POST /users` crea `User` y `Profile`.
- [ ] Existe CRUD de usuarios.
- [ ] Al borrar un usuario también se borra su perfil.
- [ ] Existe `GET /profiles/me`.
- [ ] Existe `PUT /profiles/me`.
- [ ] Existe `POST /auth/login`.
- [ ] Login devuelve un JWT.
- [ ] El JWT guarda el ID del usuario en `sub`.
- [ ] Existe `get_current_user`.
- [ ] Existe `GET /auth/me`.
- [ ] Las rutas protegidas sin token devuelven `401`.
- [ ] Un usuario autenticado intentando acceder a otro usuario recibe `403`.
- [ ] `JWT_SECRET` está en `.env`.
- [ ] La expiración está configurada desde `.env`.
- [ ] Hay al menos 5 rutas existentes protegidas.
- [ ] No se crearon tablas `User` o `Profile` en PostgreSQL/Supabase.

---

# 24. Subí la entrega

Creá la rama:

```bash
git switch -c feature/auth-api
```

Después:

```bash
git add .
git commit -m "feat: add JWT authentication"
git push -u origin feature/auth-api
```

Abrí el Pull Request contra:

```text
main
```

---

# Flujo completo

```text
POST /users
↓
bcrypt.hash(password)
↓
User + Profile en TinyDB
↓
POST /auth/login
↓
bcrypt.verify(password, hashed_password)
↓
JWT con user_id en sub
↓
Authorization: Bearer TOKEN
↓
get_current_user
↓
busca al usuario en TinyDB
↓
entra a la ruta protegida
```

