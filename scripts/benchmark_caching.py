"""Synthetic caching benchmark. Never imports project dotenv or opens project data.

Run with: uv run --frozen python -m scripts.benchmark_caching
All databases are created in a new TemporaryDirectory and removed on exit.
"""
import os

os.environ["PYTHON_DOTENV_DISABLED"] = "1"
os.environ["DEMO_DATA_ENABLED"] = "false"
os.environ["DATABASE_URL"] = "sqlite://"
os.environ["JWT_SECRET"] = "synthetic-caching-benchmark-secret"

import argparse
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
import json
from pathlib import Path
import sqlite3
from statistics import median
from tempfile import TemporaryDirectory
from threading import Lock
from time import perf_counter
from unittest.mock import patch

from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine
from tinydb import TinyDB
from tinydb.storages import MemoryStorage

from services.api import database, incident_store, main, security, user_service
from services.api.inventory_models import SKU, StockEntry, StockExit


def seed(directory):
    """Accept only an empty, newly allocated benchmark directory."""
    if any(directory.iterdir()):
        raise ValueError("Seeder requires an empty temporary directory")
    stamp = "2026-01-01T00:00:00+00:00"
    with sqlite3.connect(directory / "incidents.sqlite3") as connection:
        connection.execute(incident_store.CREATE_TABLE)
        connection.executemany(
            "INSERT INTO incidents (source_id,title,description,category,status,origin,branch,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?)",
            [(f"synthetic-{i}", f"Synthetic incident {i}", "Synthetic benchmark description", "carrier_issue", "open" if i % 2 else "in_progress", "internal", "central", stamp, stamp) for i in range(10000)],
        )
    with TinyDB(directory / "suppliers.json") as suppliers:
        suppliers.table("suppliers").insert_multiple([
            {"name": f"Synthetic supplier {i}", "country": "USA", "categories": ["carrier_last_mile", "reverse_logistics"], "rate_per_shipment": 5.5, "currency": "USD", "status": "active" if i % 2 else "suspended", "updated_at": stamp}
            for i in range(5000)
        ])
    engine = create_engine(f"sqlite:///{(directory / 'inventory.sqlite3').as_posix()}")
    SQLModel.metadata.create_all(engine)
    with engine.begin() as connection:
        connection.execute(SKU.__table__.insert(), [dict(id=i, name=f"Synthetic product {i}", sku=f"SYN-{i}", client_name="Synthetic client", category="fashion", warehouse="LA") for i in range(1, 1001)])
        from datetime import datetime, timezone
        date = datetime(2026, 1, 1, tzinfo=timezone.utc)
        for model in (StockEntry, StockExit):
            rows = []
            for i in range(10000):
                row = dict(sku_id=i % 1000 + 1, quantity=10 if model is StockEntry else 1, warehouse="LA", created_at=date, user_uuid="synthetic-user")
                row.update(reference=f"SYN-{i}") if model is StockEntry else row.update(exit_type="dispatch", tracking_number=f"SYN-{i}")
                rows.append(row)
            connection.execute(model.__table__.insert(), rows)
    engine.dispose()


def main_cli():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rounds", type=int, default=20)
    parser.add_argument("--uncached", action="store_true", help="Control run with the same auth/timing stack but no incident cache")
    args = parser.parse_args()
    if not 5 <= args.rounds <= 100:
        parser.error("rounds must be between 5 and 100")
    with TemporaryDirectory(prefix="trackflow-caching-") as temporary:
        directory = Path(temporary)
        seed(directory)
        with TinyDB(storage=MemoryStorage) as auth, patch.object(database, "_AUTH_DB_INSTANCE", auth), patch.object(incident_store, "DATA_DIR", directory), patch.object(incident_store, "DB_FILE_PATH", directory / "incidents.sqlite3"), patch.object(incident_store, "LEGACY_FILE_PATH", directory / "absent.json"), patch.object(incident_store, "_initialized", False):
            user, _ = user_service.create_user_with_profile("benchmark@example.com", "unused-synthetic-hash")
            headers = {"Authorization": "Bearer " + security.create_access_token(user["id"])}
            original = incident_store._connection
            lock = Lock()
            queries = [0]

            @contextmanager
            def traced():
                with original() as connection:
                    def trace(sql):
                        if sql.lstrip().upper().startswith("SELECT"):
                            with lock:
                                queries[0] += 1
                    connection.set_trace_callback(trace)
                    yield connection

            # No lifespan: no automatic startup seeds or project database access.
            from contextlib import nullcontext
            from services.api.incident_cache import incident_cache
            incident_cache.clear()
            control = patch.object(incident_cache, "get_or_load", lambda key, load: load()) if args.uncached else nullcontext()
            with patch.object(incident_store, "_connection", traced), control:
                client = TestClient(main.app)
                try:
                    for path in ("/api/incidents", "/api/incidents/summary"):
                        for mode in ("sequential", "concurrent"):
                            queries[0] = 0
                            def request(_):
                                start = perf_counter()
                                response = client.get(path, headers=headers)
                                assert response.status_code == 200, response.text
                                return (perf_counter() - start) * 1000, len(response.content)
                            # Measure warmed repeated reads, including HTTP validation/serialization.
                            request(0)
                            queries[0] = 0
                            if mode == "concurrent":
                                with ThreadPoolExecutor(max_workers=4) as pool:
                                    rows = list(pool.map(request, range(args.rounds)))
                            else:
                                rows = [request(i) for i in range(args.rounds)]
                            times = sorted(row[0] for row in rows)
                            print(json.dumps(dict(endpoint=path, mode=mode, requests=len(rows), p50_ms=round(median(times), 2), p95_ms=round(times[int(.95 * (len(times) - 1))], 2), selects=queries[0], response_bytes=rows[0][1])), flush=True)
                finally:
                    client.close()


if __name__ == "__main__":
    main_cli()
