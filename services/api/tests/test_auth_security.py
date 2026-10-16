from datetime import datetime, timedelta, timezone

import pytest
from fastapi import HTTPException
from jose import jwt

from services.api import security


def test_hash_password_verifies_only_the_original_password():
    hashed_password = security.hash_password("correct-horse-82")

    assert security.verify_password("correct-horse-82", hashed_password)
    assert not security.verify_password("wrong-password", hashed_password)


def test_validate_jwt_secret_requires_configuration(monkeypatch):
    monkeypatch.setattr(security, "JWT_SECRET", None)

    with pytest.raises(RuntimeError, match="JWT_SECRET"):
        security.validate_jwt_secret()


def test_create_access_token_contains_subject_and_expiration():
    token = security.create_access_token("user-123")
    payload = jwt.decode(token, security.validate_jwt_secret(), algorithms=[security.ALGORITHM])

    assert payload["sub"] == "user-123"
    assert datetime.fromtimestamp(payload["exp"], timezone.utc) > datetime.now(timezone.utc)


def test_get_current_user_accepts_active_user(monkeypatch):
    user = {"id": "user-123", "is_active": True}
    token = security.create_access_token(user["id"])
    monkeypatch.setattr(security, "get_user_by_id", lambda user_id: user if user_id == user["id"] else None)

    assert security.get_current_user(token=token) is user


@pytest.mark.parametrize("user", [None, {"id": "user-123", "is_active": False}])
def test_get_current_user_rejects_missing_or_inactive_user(monkeypatch, user):
    token = security.create_access_token("user-123")
    monkeypatch.setattr(security, "get_user_by_id", lambda _user_id: user)

    with pytest.raises(HTTPException) as error:
        security.get_current_user(token=token)

    assert error.value.status_code == 401


def test_get_current_user_rejects_invalid_token():
    with pytest.raises(HTTPException) as error:
        security.get_current_user(token="not-a-jwt")

    assert error.value.status_code == 401


def test_get_current_user_rejects_expired_token():
    token = jwt.encode(
        {
            "sub": "user-123",
            "exp": datetime.now(timezone.utc) - timedelta(seconds=1),
        },
        security.validate_jwt_secret(),
        algorithm=security.ALGORITHM,
    )

    with pytest.raises(HTTPException) as error:
        security.get_current_user(token=token)

    assert error.value.status_code == 401


def test_get_current_user_rejects_token_without_subject():
    token = jwt.encode({}, security.validate_jwt_secret(), algorithm=security.ALGORITHM)

    with pytest.raises(HTTPException) as error:
        security.get_current_user(token=token)

    assert error.value.status_code == 401