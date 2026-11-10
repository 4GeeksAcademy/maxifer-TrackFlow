from fastapi import APIRouter, Depends, HTTPException

from services.api.schemas_auth import ProfilePublic, ProfileUpdate
from services.api.security import get_current_user
from services.api.user_service import get_profile_by_user_id, update_profile


router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfilePublic)
def get_my_profile(current_user: dict = Depends(get_current_user)):
    profile = get_profile_by_user_id(current_user["id"])

    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")

    return profile


@router.put("/me", response_model=ProfilePublic)
def edit_my_profile(payload: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    changes = payload.model_dump(exclude_none=True)
    profile = update_profile(current_user["id"], changes)
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado.")
    return profile
