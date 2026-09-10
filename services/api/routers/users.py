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
