from datetime import datetime, timezone
from uuid import uuid4

from tinydb import Query

from services.api.database import get_profiles_table, get_users_table


UserQuery = Query()
ProfileQuery = Query()


def public_user(user: dict) -> dict:
    return {
        "id": user["id"],
        "email": user["email"],
        "is_active": user["is_active"],
        "role": user["role"],
        "created_at": user["created_at"],
    }


def get_user_by_id(user_id: str) -> dict | None:
    return get_users_table().get(UserQuery.id == user_id)


def get_user_by_email(email: str) -> dict | None:
    return get_users_table().get(UserQuery.email == email)


def get_all_users() -> list[dict]:
    return get_users_table().all()


def create_user_with_profile(email: str, hashed_password: str, profile_data: dict | None = None) -> tuple[dict, dict]:
    user_id = str(uuid4())
    profile_data = profile_data or {}

    user = {
        "id": user_id,
        "email": email,
        "hashed_password": hashed_password,
        "is_active": True,
        "role": "user",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    profile = {
        "id": str(uuid4()),
        "user_id": user_id,
        "name": profile_data.get("name"),
        "phone": profile_data.get("phone"),
        "address": profile_data.get("address"),
    }

    get_users_table().insert(user)
    get_profiles_table().insert(profile)

    return user, profile


def update_user(user_id: str, changes: dict) -> dict | None:
    get_users_table().update(changes, UserQuery.id == user_id)
    return get_user_by_id(user_id)


def delete_user(user_id: str) -> None:
    get_users_table().remove(UserQuery.id == user_id)
    get_profiles_table().remove(ProfileQuery.user_id == user_id)


def get_profile_by_user_id(user_id: str) -> dict | None:
    return get_profiles_table().get(ProfileQuery.user_id == user_id)


def update_profile(user_id: str, changes: dict) -> dict | None:
    get_profiles_table().update(changes, ProfileQuery.user_id == user_id)
    return get_profile_by_user_id(user_id)
