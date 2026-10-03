from pathlib import Path

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine
from tinydb import TinyDB
from tinydb.table import Document, Table
import os


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
RESET_TOKENS_TABLE_NAME = "reset_tokens"

_AUTH_DB_INSTANCE: TinyDB | None = None

load_dotenv(Path(__file__).resolve().parent / ".env")
DATABASE_URL = os.getenv("DATABASE_URL")
inventory_engine = (
	create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
	if DATABASE_URL
	else None
)


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


def get_reset_tokens_table() -> Table:
    return get_auth_db().table(RESET_TOKENS_TABLE_NAME)


def get_inventory_db():
	if inventory_engine is None:
		raise RuntimeError("DATABASE_URL no está configurada")

	with Session(inventory_engine) as session:
		yield session


def create_inventory_tables() -> None:
	if inventory_engine is None:
		raise RuntimeError("DATABASE_URL no está configurada")

	from services.api import inventory_models

	SQLModel.metadata.create_all(inventory_engine)
