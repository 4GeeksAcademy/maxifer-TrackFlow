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
import re
import sqlite3
import time
import urllib.error
import urllib.request


def _safe_error_detail(error):
    try:
        payload = json.loads(error.read().decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError):
        return "No structured error detail returned"
    detail = payload.get("detail") if isinstance(payload, dict) else None
    if not isinstance(detail, str) or not detail.strip():
        return "No structured error detail returned"
    detail = re.sub(r"(?i)\b(bearer\s+)[A-Za-z0-9._~+/-]+=*", r"\1[REDACTED]", detail)
    detail = re.sub(
        r"(?i)\b(api[_-]?key|token|secret|password|authorization)\b(\s*[:=]\s*)(?:\"[^\"]*\"|'[^']*'|[^\s,;]+)",
        r"\1\2[REDACTED]",
        detail,
    )
    detail = re.sub(r"(?i)(https?://)[^/@\s]+@", r"\1[REDACTED]@", detail)
    detail = re.sub(r"\bsk-[A-Za-z0-9_-]{12,}\b", "[REDACTED]", detail)
    return " ".join(detail.split())[:320]


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


def verify_rag(headers):
    request = urllib.request.Request(
        "http://uis:3001/backend/api/rag/query",
        data=json.dumps({"question": "¿Cuál es la ventana estándar para solicitar una devolución?"}).encode(),
        headers={**headers, "Content-Type": "application/json"}, method="POST",
    )
    for attempt in range(3):
        try:
            with urllib.request.urlopen(request, timeout=40) as response:
                result = json.load(response)
                assert response.status == 200
            break
        except urllib.error.HTTPError as error:
            if error.code == 503 and attempt < 2:
                error.close()
                time.sleep(attempt + 1)
                continue
            detail = _safe_error_detail(error)
            raise RuntimeError(f"RAG verification failed with HTTP {error.code}: {detail}") from error
    assert result.get("answer", "").strip() and result.get("sources")
    assert result.get("retrieved_count", 0) > 0 and result.get("abstained") is False


def capture(*, check_assets=True, check_rag=False):
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
    if check_rag:
        if not active:
            raise RuntimeError("RAG verification requires an existing active user")
        verify_rag(headers)
    incidents = get("/api/incidents")
    products = get("/inventory/products")
    orders = get("/inventory/orders")
    urls = ["http://landing/", "http://uis:3001/login", "http://uis:3002/"]
    if check_assets:
        urls += [
            "http://landing/index.html",
            "http://landing/application.html",
            "http://landing/application/",
            "http://landing/assets/trackflow-logo.svg",
            "http://landing/assets/trackflow-hero.webp",
        ]
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
        "active_user_available": active is not None,
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
    parser.add_argument("--rag", action="store_true")
    args = parser.parse_args()
    state = capture(check_assets=not args.snapshot, check_rag=args.rag)
    if args.baseline_b64:
        compare(json.loads(base64.b64decode(args.baseline_b64)), state)
    if args.snapshot:
        print(json.dumps(state))
    else:
        print(json.dumps({name: len(state[name]) for name in ["users", "suppliers", "incidents", "products", "orders"]}))
