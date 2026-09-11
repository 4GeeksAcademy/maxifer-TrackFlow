from datetime import datetime, timedelta, timezone

from tinydb import Query

from services.api.database import get_reset_tokens_table
from services.api.security import create_reset_token, hash_reset_token


ResetTokenQuery = Query()
RESET_TOKEN_MINUTES = 30


def create_password_reset_token(user_id: str) -> str:
    table = get_reset_tokens_table()

    active_tokens = table.search(
        (ResetTokenQuery.user_id == user_id)
        & (ResetTokenQuery.used == False)
    )

    for token in active_tokens:
        table.update({"used": True}, doc_ids=[token.doc_id])

    now = datetime.now(timezone.utc)
    raw_token = create_reset_token()

    table.insert(
        {
            "user_id": user_id,
            "token_hash": hash_reset_token(raw_token),
            "expires_at": (now + timedelta(minutes=RESET_TOKEN_MINUTES)).isoformat(),
            "created_at": now.isoformat(),
            "used": False,
        }
    )

    return raw_token


def consume_password_reset_token(raw_token: str) -> str | None:
    table = get_reset_tokens_table()
    token_hash = hash_reset_token(raw_token)
    matches = table.search(ResetTokenQuery.token_hash == token_hash)

    if not matches:
        return None

    reset_token = matches[0]

    if reset_token.get("used") is True:
        return None

    expires_at = datetime.fromisoformat(reset_token["expires_at"])
    if expires_at < datetime.now(timezone.utc):
        table.update({"used": True}, doc_ids=[reset_token.doc_id])
        return None

    table.update({"used": True}, doc_ids=[reset_token.doc_id])
    return reset_token["user_id"]


def invalidate_user_reset_tokens(user_id: str) -> None:
    table = get_reset_tokens_table()
    active_tokens = table.search(
        (ResetTokenQuery.user_id == user_id)
        & (ResetTokenQuery.used == False)
    )

    for token in active_tokens:
        table.update({"used": True}, doc_ids=[token.doc_id])
