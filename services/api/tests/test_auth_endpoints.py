import pytest
from fastapi import HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import ValidationError

from services.api import auth, user_service
from services.api.schemas_auth import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from services.api.security import verify_password


GENERIC_RESET_MESSAGE = "Si esa direccion esta registrada, recibiras un enlace en breve."


def test_login_returns_access_token_for_valid_credentials(create_test_user):
    user = create_test_user(email="login@example.com", password="valid-password")

    response = auth.login(
        OAuth2PasswordRequestForm(username=user["email"], password="valid-password")
    )

    assert response["access_token"]
    assert response["token_type"] == "bearer"


@pytest.mark.parametrize(
    ("email", "password"),
    [("missing@example.com", "valid-password"), ("login@example.com", "wrong-password")],
)
def test_login_rejects_unknown_user_or_wrong_password(create_test_user, email, password):
    create_test_user(email="login@example.com", password="valid-password")

    with pytest.raises(HTTPException) as error:
        auth.login(OAuth2PasswordRequestForm(username=email, password=password))

    assert error.value.status_code == 401


def test_login_rejects_empty_credentials():
    with pytest.raises(HTTPException) as error:
        auth.login(OAuth2PasswordRequestForm(username="", password=""))

    assert error.value.status_code == 401


def test_get_me_returns_public_user_and_profile(create_test_user):
    user = create_test_user(
        email="profile@example.com",
        profile_data={"name": "Test Person", "phone": "555-0100"},
    )

    response = auth.get_me(user)

    assert response["user"]["id"] == user["id"]
    assert "hashed_password" not in response["user"]
    assert response["profile"]["name"] == "Test Person"


def test_forgot_password_sends_token_for_registered_email(create_test_user, monkeypatch):
    user = create_test_user(email="reset@example.com")
    sent_emails = []
    monkeypatch.setattr(auth, "send_password_reset_email", lambda email, token: sent_emails.append((email, token)))

    response = auth.forgot_password(ForgotPasswordRequest(email=user["email"]))

    assert response["message"] == GENERIC_RESET_MESSAGE
    assert len(sent_emails) == 1
    assert sent_emails[0][0] == user["email"]
    assert sent_emails[0][1]


def test_forgot_password_keeps_response_generic_for_unknown_email(monkeypatch):
    send_email = pytest.MonkeyPatch()
    send_email.setattr(auth, "send_password_reset_email", lambda *_args: pytest.fail("unexpected email"))
    try:
        response = auth.forgot_password(ForgotPasswordRequest(email="unknown@example.com"))
    finally:
        send_email.undo()

    assert response["message"] == GENERIC_RESET_MESSAGE


def test_forgot_password_keeps_generic_response_when_email_service_fails(create_test_user, monkeypatch):
    user = create_test_user(email="mail-failure@example.com")
    monkeypatch.setattr(
        auth,
        "send_password_reset_email",
        lambda *_args: (_ for _ in ()).throw(RuntimeError("email service unavailable")),
    )

    response = auth.forgot_password(ForgotPasswordRequest(email=user["email"]))

    assert response["message"] == GENERIC_RESET_MESSAGE


def test_reset_password_updates_password_and_rejects_token_reuse(create_test_user):
    user = create_test_user(email="reset-success@example.com", password="old-password")
    from services.api.password_reset_service import create_password_reset_token

    token = create_password_reset_token(user["id"])
    response = auth.reset_password(ResetPasswordRequest(token=token, new_password="new-password"))

    updated = user_service.get_user_by_id(user["id"])
    assert response["message"] == "Contrasena actualizada correctamente."
    assert verify_password("new-password", updated["hashed_password"])
    with pytest.raises(HTTPException) as error:
        auth.reset_password(ResetPasswordRequest(token=token, new_password="another-password"))
    assert error.value.status_code == 400


def test_reset_password_rejects_token_for_deleted_user(auth_db):
    from services.api.password_reset_service import create_password_reset_token

    token = create_password_reset_token("deleted-user")

    with pytest.raises(HTTPException) as error:
        auth.reset_password(ResetPasswordRequest(token=token, new_password="new-password"))

    assert error.value.status_code == 400


def test_change_password_updates_password_and_invalidates_reset_tokens(create_test_user):
    user = create_test_user(email="change@example.com", password="old-password")
    from services.api.password_reset_service import create_password_reset_token

    token = create_password_reset_token(user["id"])
    response = auth.change_password(
        ChangePasswordRequest(current_password="old-password", new_password="new-password"),
        user,
    )

    assert response["message"] == "Contrasena actualizada correctamente."
    assert verify_password("new-password", user_service.get_user_by_id(user["id"])["hashed_password"])
    with pytest.raises(HTTPException) as error:
        auth.reset_password(ResetPasswordRequest(token=token, new_password="third-password"))
    assert error.value.status_code == 400


def test_change_password_rejects_incorrect_current_password(create_test_user):
    user = create_test_user(email="change-failure@example.com", password="old-password")

    with pytest.raises(HTTPException) as error:
        auth.change_password(
            ChangePasswordRequest(current_password="wrong-password", new_password="new-password"),
            user,
        )

    assert error.value.status_code == 400
    assert verify_password("old-password", user_service.get_user_by_id(user["id"])["hashed_password"])


@pytest.mark.parametrize(
    "payload",
    [
        (ForgotPasswordRequest, {"email": "not-an-email"}),
        (ResetPasswordRequest, {"token": "short", "new_password": "12345678"}),
        (ChangePasswordRequest, {"current_password": "", "new_password": "short"}),
    ],
)
def test_auth_payloads_reject_malformed_or_boundary_values(payload):
    model, values = payload

    with pytest.raises(ValidationError):
        model(**values)