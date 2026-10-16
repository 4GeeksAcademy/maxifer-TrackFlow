from datetime import datetime, timedelta, timezone

from services.api import password_reset_service as reset_service
from services.api.security import hash_reset_token


def test_reset_token_is_stored_hashed_and_can_be_consumed_once(auth_db):
    token = reset_service.create_password_reset_token("user-123")
    stored = auth_db.table("reset_tokens").all()[0]

    assert stored["token_hash"] == hash_reset_token(token)
    assert stored["token_hash"] != token
    assert reset_service.consume_password_reset_token(token) == "user-123"
    assert reset_service.consume_password_reset_token(token) is None


def test_creating_new_reset_token_invalidates_previous_token(auth_db):
    previous_token = reset_service.create_password_reset_token("user-123")
    current_token = reset_service.create_password_reset_token("user-123")

    assert reset_service.consume_password_reset_token(previous_token) is None
    assert reset_service.consume_password_reset_token(current_token) == "user-123"


def test_consume_rejects_unknown_and_expired_tokens(auth_db):
    token = reset_service.create_password_reset_token("user-123")
    reset_table = auth_db.table("reset_tokens")
    record = reset_table.all()[0]
    reset_table.update(
        {"expires_at": (datetime.now(timezone.utc) - timedelta(seconds=1)).isoformat()},
        doc_ids=[record.doc_id],
    )

    assert reset_service.consume_password_reset_token("unknown-token") is None
    assert reset_service.consume_password_reset_token(token) is None
    assert reset_table.all()[0]["used"] is True


def test_consume_rejects_malformed_expiration(auth_db):
    token = reset_service.create_password_reset_token("user-123")
    reset_table = auth_db.table("reset_tokens")
    record = reset_table.all()[0]
    reset_table.update({"expires_at": "invalid-date"}, doc_ids=[record.doc_id])

    assert reset_service.consume_password_reset_token(token) is None


def test_invalidate_marks_all_active_tokens_used(auth_db):
    reset_service.create_password_reset_token("user-123")
    reset_service.create_password_reset_token("user-456")

    reset_service.invalidate_user_reset_tokens("user-123")

    records = auth_db.table("reset_tokens").all()
    assert [record["used"] for record in records] == [True, False]