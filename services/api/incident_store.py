"""SQLite incident repository with database constraints and legacy JSON migration."""

import json
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from threading import Lock

from packages.shared.incidents import validate_transition
from services.api.incident_model import Incident

DATA_DIR = Path(__file__).resolve().parent / "data"
DB_FILE_PATH = DATA_DIR / "incidents.sqlite3"
LEGACY_FILE_PATH = DATA_DIR / "incidents.json"
_init_lock = Lock()
_initialized = False

FIELDS = ("source_id", "title", "description", "category", "status", "origin", "branch", "created_at", "updated_at")
CREATE_TABLE = """
CREATE TABLE IF NOT EXISTS incidents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_id TEXT UNIQUE,
    title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 120),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    category TEXT NOT NULL CHECK (category IN (
        'lost_parcel', 'delivery_failure', 'inventory_discrepancy', 'carrier_issue',
        'returns_issue', 'warehouse_incident', 'system_failure', 'client_complaint', 'other')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'discarded')),
    origin TEXT NOT NULL CHECK (origin IN ('customer', 'branch', 'internal')),
    branch TEXT NOT NULL CHECK (branch IN (
        'central', 'la_warehouse', 'la_office', 'zaragoza_warehouse', 'zaragoza_office')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
)
"""


@contextmanager
def _connection():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DB_FILE_PATH, timeout=10)
    connection.row_factory = sqlite3.Row
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def _initialize():
    global _initialized
    if _initialized:
        return
    with _init_lock:
        if _initialized:
            return
        with _connection() as connection:
            connection.execute(CREATE_TABLE)
            connection.execute("CREATE INDEX IF NOT EXISTS idx_incidents_status_category ON incidents(status, category)")
            connection.execute("CREATE INDEX IF NOT EXISTS idx_incidents_branch ON incidents(branch)")
            if LEGACY_FILE_PATH.exists() and connection.execute("SELECT COUNT(*) FROM incidents").fetchone()[0] == 0:
                legacy = json.loads(LEGACY_FILE_PATH.read_text(encoding="utf-8"))
                for legacy_id, payload in legacy.get("incidents", {}).items():
                    incident = Incident(id=int(legacy_id), **payload)
                    values = incident.model_dump(mode="json")
                    connection.execute(
                        f"INSERT OR IGNORE INTO incidents (id, {', '.join(FIELDS)}) VALUES ({', '.join('?' for _ in range(len(FIELDS) + 1))})",
                        (values["id"], *(values[field] for field in FIELDS)),
                    )
        _initialized = True


def _record(row):
    return Incident.model_validate(dict(row)).model_dump(mode="json") if row else None


def get_incident(incident_id: int):
    _initialize()
    with _connection() as connection:
        return _record(connection.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone())


def list_incidents(filters=None):
    _initialize()
    filters = {field: value for field, value in (filters or {}).items() if value is not None}
    where = " AND ".join(f"{field} = ?" for field in filters)
    sql = "SELECT * FROM incidents" + (f" WHERE {where}" if where else "") + " ORDER BY created_at DESC, id DESC"
    with _connection() as connection:
        return [_record(row) for row in connection.execute(sql, tuple(filters.values())).fetchall()]


def insert_incident(values):
    _initialize()
    incident = Incident.model_validate(values).model_dump(mode="json")
    with _connection() as connection:
        cursor = connection.execute(
            f"INSERT INTO incidents ({', '.join(FIELDS)}) VALUES ({', '.join('?' for _ in FIELDS)})",
            tuple(incident[field] for field in FIELDS),
        )
        return _record(connection.execute("SELECT * FROM incidents WHERE id = ?", (cursor.lastrowid,)).fetchone())


def insert_seed_incident(values):
    _initialize()
    incident = Incident.model_validate(values).model_dump(mode="json")
    with _connection() as connection:
        cursor = connection.execute(
            f"INSERT INTO incidents ({', '.join(FIELDS)}) VALUES ({', '.join('?' for _ in FIELDS)}) ON CONFLICT(source_id) DO NOTHING",
            tuple(incident[field] for field in FIELDS),
        )
        return cursor.rowcount == 1


def update_status(incident_id: int, target: str, updated_at: str):
    _initialize()
    with _connection() as connection:
        connection.execute("BEGIN IMMEDIATE")
        row = connection.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone()
        if row is None:
            return None
        validate_transition(row["status"], target)
        connection.execute("UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?", (target, updated_at, incident_id))
        return _record(connection.execute("SELECT * FROM incidents WHERE id = ?", (incident_id,)).fetchone())
