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
