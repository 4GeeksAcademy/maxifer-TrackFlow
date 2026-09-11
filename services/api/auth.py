from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from services.api.email_service import send_password_reset_email
from services.api.password_reset_service import (
    consume_password_reset_token,
    create_password_reset_token,
    invalidate_user_reset_tokens,
)
from services.api.schemas_auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    MessageResponse,
    ResetPasswordRequest,
)
from services.api.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from services.api.user_service import (
    get_profile_by_user_id,
    get_user_by_email,
    get_user_by_id,
    public_user,
    update_user,
)


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


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest):
    generic_message = "Si esa direccion esta registrada, recibiras un enlace en breve."
    user = get_user_by_email(payload.email)

    if not user:
        return {"message": generic_message}

    raw_token = create_password_reset_token(user["id"])

    try:
        send_password_reset_email(user["email"], raw_token)
    except Exception as error:
        print("Error enviando email de reset:", error)

    return {"message": generic_message}


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest):
    user_id = consume_password_reset_token(payload.token)

    if not user_id:
        raise HTTPException(status_code=400, detail="Token invalido o expirado.")

    user = get_user_by_id(user_id)

    if not user:
        raise HTTPException(status_code=400, detail="Token invalido o expirado.")

    update_user(user_id, {"hashed_password": hash_password(payload.new_password)})
    invalidate_user_reset_tokens(user_id)

    return {"message": "Contrasena actualizada correctamente."}


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current_user: dict = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user["hashed_password"]):
        raise HTTPException(status_code=400, detail="La contrasena actual es incorrecta.")

    update_user(
        current_user["id"],
        {"hashed_password": hash_password(payload.new_password)},
    )
    invalidate_user_reset_tokens(current_user["id"])

    return {"message": "Contrasena actualizada correctamente."}
