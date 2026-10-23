"""Check deployed routes and detect loss of existing data across an update.

Run inside the API container. Output contains IDs and counts, never credentials.
"""

import argparse
import base64
from contextlib import closing
import hashlib
import json
import os
from pathlib import Path
import sqlite3
import time
import urllib.request


def read_table(path, table):
    if not path.exists():
        return {}
    for attempt in range(3):
        try:
            content = path.read_text(encoding="utf-8")
            return json.loads(content).get(table, {}) if content.strip() else {}
        except json.JSONDecodeError:
            if attempt == 2:
                raise
            time.sleep(0.2)


def capture(*, check_assets=True):
    data = Path("/app/services/api/data")
    users = read_table(data / "auth.json", "users")
    active = next((u for u in users.values() if u.get("is_active")), None)
    headers = {}
    if active:
        from jose import jwt
        token = jwt.encode({"sub": active["id"], "exp": int(time.time()) + 120}, os.environ["JWT_SECRET"], algorithm="HS256")
        headers["Authorization"] = "Bearer " + token

    def get(path, *, as_json=True):
        request = urllib.request.Request("http://uis:3001/backend" + path, headers=headers)
        with urllib.request.urlopen(request, timeout=20) as response:
            assert response.status == 200
            return json.load(response) if as_json else response.read()

    assert get("/")["message"] == "TrackFlow Incidents API is running"
    if active:
        assert get("/auth/me")["user"]["id"] == active["id"]
        get("/suppliers")
    incidents = get("/api/incidents")
    products = get("/inventory/products")
    orders = get("/inventory/orders")
    urls = ["http://landing/", "http://uis:3001/login", "http://uis:3002/"]
    if check_assets:
        urls += ["http://landing/i18n.js", "http://landing/validation.js"]
    for url in urls:
        with urllib.request.urlopen(url, timeout=20) as response:
            assert response.status == 200

    stored_incidents = []
    database = data / "incidents.sqlite3"
    if database.exists():
        with closing(sqlite3.connect(database.as_uri() + "?mode=ro", uri=True)) as connection:
            stored_incidents = [row[0] for row in connection.execute("SELECT id FROM incidents")]
    assert set(stored_incidents) == {row["id"] for row in incidents}
    assert os.environ.get("DEMO_DATA_ENABLED", "").lower() == "false"
    return {
        "users": sorted(u["id"] for u in users.values()),
        "suppliers": sorted(read_table(data / "suppliers.json", "suppliers")),
        "incidents": sorted(stored_incidents),
        "products": sorted(row["id"] for row in products),
        "orders": sorted(f"{row['movement_type']}:{row['id']}" for row in orders),
        "database_sha256": hashlib.sha256(os.environ["DATABASE_URL"].encode()).hexdigest(),
        "jwt_sha256": hashlib.sha256(os.environ["JWT_SECRET"].encode()).hexdigest(),
    }


def compare(before, after):
    for name in ["users", "suppliers", "incidents", "products", "orders"]:
        if not set(before[name]).issubset(after[name]):
            raise RuntimeError(f"Existing {name} are missing after deployment")
    for name in ["database_sha256", "jwt_sha256"]:
        if before[name] != after[name]:
            raise RuntimeError(f"Production configuration changed: {name}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--snapshot", action="store_true")
    parser.add_argument("--baseline-b64")
    args = parser.parse_args()
    state = capture(check_assets=not args.snapshot)
    if args.baseline_b64:
        compare(json.loads(base64.b64decode(args.baseline_b64)), state)
    if args.snapshot:
        print(json.dumps(state))
    else:
        print(json.dumps({name: len(state[name]) for name in ["users", "suppliers", "incidents", "products", "orders"]}))
