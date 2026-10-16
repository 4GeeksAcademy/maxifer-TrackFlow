import os

os.environ.setdefault("JWT_SECRET", "test-jwt-secret")

import pytest
from tinydb import TinyDB

from services.api import database, security, user_service


@pytest.fixture
def auth_db(tmp_path, monkeypatch):
    instance = TinyDB(tmp_path / "auth.json")
    monkeypatch.setattr(database, "_AUTH_DB_INSTANCE", instance)
    yield instance
    instance.close()


@pytest.fixture
def create_test_user(auth_db):
    def create(email="user@example.com", password="test-password", role="user", profile_data=None):
        user, _ = user_service.create_user_with_profile(
            email,
            security.hash_password(password),
            profile_data or {"name": "Test User"},
        )
        if role != "user":
            user = user_service.update_user(user["id"], {"role": role})
        return user_service.get_user_by_id(user["id"])

    return create