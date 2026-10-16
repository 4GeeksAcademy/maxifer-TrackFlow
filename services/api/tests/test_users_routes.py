import pytest
from fastapi import HTTPException
from pydantic import ValidationError

from services.api import user_service
from services.api.routers import users
from services.api.schemas_auth import Role, UserCreate, UserUpdate
from services.api.security import verify_password


def test_register_user_creates_account_and_profile(auth_db):
    response = users.register_user(
        UserCreate(
            email="new-user@example.com",
            password="long-enough-password",
            name="New User",
            phone="555-0100",
        )
    )

    created = user_service.get_user_by_email("new-user@example.com")
    assert response["user"]["id"] == created["id"]
    assert "hashed_password" not in response["user"]
    assert verify_password("long-enough-password", created["hashed_password"])
    assert response["profile"]["name"] == "New User"
    assert response["profile"]["phone"] == "555-0100"


def test_register_user_rejects_duplicate_email(create_test_user):
    create_test_user(email="duplicate@example.com")

    with pytest.raises(HTTPException) as error:
        users.register_user(
            UserCreate(email="duplicate@example.com", password="long-enough-password")
        )

    assert error.value.status_code == 400


def test_user_create_payload_rejects_invalid_email_and_short_password():
    with pytest.raises(ValidationError):
        UserCreate(email="invalid-email", password="short")


def test_list_users_returns_public_fields(create_test_user):
    create_test_user(email="first@example.com")
    create_test_user(email="second@example.com")

    result = users.list_users(current_user={"id": "first", "role": "user"})

    assert {user["email"] for user in result} == {"first@example.com", "second@example.com"}
    assert all("hashed_password" not in user for user in result)


def test_list_users_returns_empty_collection_when_no_users_exist(auth_db):
    assert users.list_users(current_user={"id": "admin", "role": "admin"}) == []


def test_get_user_allows_owner_and_admin(create_test_user):
    owner = create_test_user(email="owner@example.com")
    target = create_test_user(email="target@example.com")
    admin = create_test_user(email="admin@example.com", role="admin")

    assert users.get_user(owner["id"], owner)["id"] == owner["id"]
    assert users.get_user(target["id"], admin)["id"] == target["id"]


def test_get_user_rejects_other_user_and_missing_owner(create_test_user):
    owner = create_test_user(email="owner@example.com")
    other = create_test_user(email="other@example.com")

    with pytest.raises(HTTPException) as forbidden:
        users.get_user(other["id"], owner)
    assert forbidden.value.status_code == 403

    with pytest.raises(HTTPException) as missing:
        users.get_user("missing-user", {"id": "missing-user", "role": "user"})
    assert missing.value.status_code == 404


def test_edit_user_updates_email_and_hashes_new_password(create_test_user):
    owner = create_test_user(email="before@example.com", password="old-password")

    result = users.edit_user(
        owner["id"],
        UserUpdate(email="after@example.com", password="new-password"),
        owner,
    )

    updated = user_service.get_user_by_id(owner["id"])
    assert result["email"] == "after@example.com"
    assert verify_password("new-password", updated["hashed_password"])
    assert not verify_password("old-password", updated["hashed_password"])


def test_edit_user_rejects_duplicate_email(create_test_user):
    owner = create_test_user(email="owner@example.com")
    create_test_user(email="taken@example.com")

    with pytest.raises(HTTPException) as error:
        users.edit_user(owner["id"], UserUpdate(email="taken@example.com"), owner)

    assert error.value.status_code == 400


def test_edit_user_allows_role_change_only_for_admin(create_test_user):
    owner = create_test_user(email="owner@example.com")
    admin = create_test_user(email="admin@example.com", role="admin")

    with pytest.raises(HTTPException) as forbidden:
        users.edit_user(owner["id"], UserUpdate(role=Role.manager), owner)
    assert forbidden.value.status_code == 403

    result = users.edit_user(owner["id"], UserUpdate(role=Role.manager), admin)
    assert result["role"] == Role.manager.value


def test_edit_user_rejects_missing_target():
    missing_owner = {"id": "missing-user", "role": "user"}

    with pytest.raises(HTTPException) as error:
        users.edit_user("missing-user", UserUpdate(is_active=False), missing_owner)

    assert error.value.status_code == 404


def test_delete_user_removes_account_and_profile(create_test_user):
    owner = create_test_user(email="delete@example.com")

    result = users.remove_user(owner["id"], owner)

    assert result == {"deleted": True, "id": owner["id"]}
    assert user_service.get_user_by_id(owner["id"]) is None
    assert user_service.get_profile_by_user_id(owner["id"]) is None


def test_delete_user_rejects_other_user_and_missing_target(create_test_user):
    owner = create_test_user(email="owner@example.com")
    other = create_test_user(email="other@example.com")

    with pytest.raises(HTTPException) as forbidden:
        users.remove_user(other["id"], owner)
    assert forbidden.value.status_code == 403

    with pytest.raises(HTTPException) as missing:
        users.remove_user("missing-user", {"id": "missing-user", "role": "user"})
    assert missing.value.status_code == 404