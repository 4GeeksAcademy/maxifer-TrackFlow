from pathlib import Path

from tinydb import TinyDB
from tinydb.table import Document, Table


DB_FILE_PATH = Path(__file__).resolve().parent / "data" / "suppliers.json"
SUPPLIERS_TABLE_NAME = "suppliers"

_DB_INSTANCE: TinyDB | None = None


def get_db() -> TinyDB:
	global _DB_INSTANCE

	if _DB_INSTANCE is None:
		DB_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
		_DB_INSTANCE = TinyDB(DB_FILE_PATH)

	return _DB_INSTANCE


def get_suppliers_table() -> Table:
	return get_db().table(SUPPLIERS_TABLE_NAME)


def document_to_record(document: Document) -> dict:
	payload = dict(document)
	payload["id"] = str(document.doc_id)
	return payload


AUTH_DB_FILE_PATH = Path(__file__).resolve().parent / "data" / "auth.json"
USERS_TABLE_NAME = "users"
PROFILES_TABLE_NAME = "profiles"

_AUTH_DB_INSTANCE: TinyDB | None = None


def get_auth_db() -> TinyDB:
    global _AUTH_DB_INSTANCE

    if _AUTH_DB_INSTANCE is None:
        AUTH_DB_FILE_PATH.parent.mkdir(parents=True, exist_ok=True)
        _AUTH_DB_INSTANCE = TinyDB(AUTH_DB_FILE_PATH)

    return _AUTH_DB_INSTANCE


def get_users_table() -> Table:
    return get_auth_db().table(USERS_TABLE_NAME)


def get_profiles_table() -> Table:
    return get_auth_db().table(PROFILES_TABLE_NAME)
