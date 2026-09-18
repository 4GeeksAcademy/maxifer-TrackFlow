import os
import hashlib
import secrets
from datetime import datetime, timedelta, timezone
from pathlib import Path

from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.hash import bcrypt

from services.api.user_service import get_user_by_id


load_dotenv(Path(__file__).resolve().parent / ".env")

JWT_SECRET = os.getenv("JWT_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))


def validate_jwt_secret() -> str:
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET no esta configurado.")
    return JWT_SECRET


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


def create_reset_token() -> str:
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(user_id: str) -> str:
    secret = validate_jwt_secret()

    expires_at = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expires_at}

    return jwt.encode(payload, secret, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme)) -> dict:
    secret = validate_jwt_secret()

    try:
        payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    except JWTError as error:
        raise _credentials_exception() from error

    user_id = payload.get("sub")
    if not user_id:
        raise _credentials_exception()

    user = get_user_by_id(user_id)
    if not user or not user.get("is_active", True):
        raise _credentials_exception()

    return user
