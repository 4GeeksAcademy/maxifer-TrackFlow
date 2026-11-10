"""TTL, isolation, committed invalidation and concurrent cache fills."""
from concurrent.futures import ThreadPoolExecutor
from contextlib import contextmanager
from threading import Event

import pytest
from fastapi.testclient import TestClient

from services.api import incident_store, main, security, user_service
from services.api.incident_cache import IncidentCache, incident_cache
from services.api.routers import incidents


@pytest.fixture
def client(tmp_path, monkeypatch, auth_db):
    monkeypatch.setattr(incident_store, "DATA_DIR", tmp_path)
    monkeypatch.setattr(incident_store, "DB_FILE_PATH", tmp_path / "incidents.sqlite3")
    monkeypatch.setattr(incident_store, "LEGACY_FILE_PATH", tmp_path / "absent.json")
    monkeypatch.setattr(incident_store, "_initialized", False)
    client = TestClient(main.app, raise_server_exceptions=False)
    yield client
    client.close()


def payload(**changes):
    return {"title": "Synthetic", "description": "Synthetic incident", "category": "other", "origin": "internal", "branch": "central", **changes}


def test_ttl_copy_eviction_and_failed_load():
    now = [0]
    cache = IncidentCache(ttl=30, max_entries=2, clock=lambda: now[0])
    calls = []
    def load():
        calls.append(1)
        return {"items": [len(calls)]}
    first = cache.get_or_load("a", load)
    first["items"].append("mutated")
    assert cache.get_or_load("a", load) == {"items": [1]}
    now[0] = 30
    assert cache.get_or_load("a", load) == {"items": [2]}
    cache.get_or_load("b", load)
    cache.get_or_load("c", load)
    assert cache.get_or_load("a", load) == {"items": [5]}
    with pytest.raises(ValueError):
        cache.get_or_load("error", lambda: (_ for _ in ()).throw(ValueError()))
    assert cache.get_or_load("error", lambda: "recovered") == "recovered"


@pytest.mark.parametrize("path", ["/api/incidents", "/api/incidents/summary"])
def test_auth_user_keys_and_filter_isolation(client, create_test_user, monkeypatch, path):
    one, two = create_test_user(), create_test_user(email="second@example.com")
    def headers(user):
        return {"Authorization": "Bearer " + security.create_access_token(user["id"])}
    reads = []
    original = incidents.find_incidents
    def counted(*args):
        reads.append(1)
        return original(*args)
    monkeypatch.setattr(incidents, "find_incidents", counted)
    client.post("/api/incidents", json=payload())
    cold = client.get(path, headers=headers(one))
    warm = client.get(path, headers=headers(one))
    assert cold.status_code == warm.status_code == 200
    assert cold.json() == warm.json()
    assert len(reads) == 1
    assert client.get(path, headers=headers(two)).json() == cold.json()
    assert len(reads) == 2  # Separate entries even when authorized data is identical.
    assert client.get(path).status_code == 401
    assert client.get(path, headers={"Authorization": "Bearer invalid"}).status_code == 401
    user_service.update_user(one["id"], {"is_active": False})
    assert client.get(path, headers=headers(one)).status_code == 401
    if path.endswith("incidents"):
        assert client.get(path + "?status=resolved", headers=headers(two)).json() == []
        assert len(reads) == 3
        assert client.get(path + "?status=unknown", headers=headers(two)).status_code == 400
        assert len(reads) == 3


def test_committed_mutations_invalidate_all_users_and_failed_writes_do_not(client, create_test_user, monkeypatch):
    users = [create_test_user(), create_test_user(email="second@example.com")]
    headers = [{"Authorization": "Bearer " + security.create_access_token(user["id"])} for user in users]
    created = client.post("/api/incidents", json=payload()).json()
    for header in headers:
        assert client.get("/api/incidents/summary", headers=header).json()["total"] == 1
        assert client.get("/api/incidents?status=open", headers=header).json()[0]["id"] == created["id"]
    assert client.patch(f"/api/incidents/{created['id']}/status", json={"status": "in_progress"}).status_code == 200
    for header in headers:
        assert client.get("/api/incidents?status=open", headers=header).json() == []
        assert client.get("/api/incidents/summary", headers=header).json()["by_status"] == {"in_progress": 1}
    # Direct seeding also invalidates both read models, after commit.
    incident_store.insert_seed_incident({**payload(), "source_id": "synthetic-seed", "status": "open", "created_at": "2026-01-01T00:00:00Z", "updated_at": "2026-01-01T00:00:00Z"})
    assert client.get("/api/incidents/summary", headers=headers[0]).json()["total"] == 2
    original = incident_store._connection
    @contextmanager
    def broken_commit():
        with original() as connection:
            yield connection
            connection.rollback()
            raise RuntimeError("synthetic commit failure")
    with monkeypatch.context() as patcher:
        patcher.setattr(incident_store, "_connection", broken_commit)
        with pytest.raises(RuntimeError):
            incident_store.insert_incident({**payload(), "status": "open", "created_at": "2026-01-01T00:00:00Z", "updated_at": "2026-01-01T00:00:00Z"})
    assert client.get("/api/incidents/summary", headers=headers[0]).json()["total"] == 2
    monkeypatch.setattr(incidents, "find_incidents", lambda *_: (_ for _ in ()).throw(AssertionError("failed writes must retain the warm cache")))
    assert client.get("/api/incidents/summary", headers=headers[0]).json()["total"] == 2
    assert incidents.update_incident_status(created["id"], incidents.IncidentStatusUpdate(status="open")).status_code == 400


def test_inflight_read_cannot_repopulate_after_committed_write(client):
    entered, release, writer_started = Event(), Event(), Event()
    key = ("summary", "synthetic")
    def slow_read():
        value = incidents._build_summary()
        entered.set()
        assert release.wait(5)
        return value
    def write():
        writer_started.set()
        return incidents.create_incident(incidents.IncidentCreate(**payload()))
    with ThreadPoolExecutor(max_workers=2) as pool:
        reading = pool.submit(incident_cache.get_or_load, key, slow_read)
        assert entered.wait(5)
        writing = pool.submit(write)
        assert writer_started.wait(5)
        release.set()
        assert reading.result()["total"] == 0
        assert writing.result()["id"] == 1
    assert incident_cache.get_or_load(key, incidents._build_summary)["total"] == 1


def test_concurrent_cold_reads_share_one_fill():
    cache = IncidentCache()
    calls = []
    def load():
        calls.append(1)
        return {"total": 1}
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(lambda _: cache.get_or_load(("summary", "synthetic"), load), range(20)))
    assert results == [{"total": 1}] * 20
    assert len(calls) == 1


def test_openapi_declares_auth_and_401_for_cached_routes(client):
    paths = client.get("/openapi.json").json()["paths"]
    for path in ("/api/incidents", "/api/incidents/summary"):
        assert paths[path]["get"]["security"] == [{"OAuth2PasswordBearer": []}]
        assert paths[path]["get"]["responses"]["401"]["content"]["application/json"]["schema"]["$ref"].endswith("/HTTPErrorResponse")


def test_timing_logs_template_status_and_no_query_or_body(client, caplog):
    with caplog.at_level("INFO", logger="api.timing"):
        client.get("/api/incidents/999?secret=synthetic-private-query")
        client.post("/api/incidents", json=payload(title="synthetic-private-body"))
        client.get("/unmatched-private-path")
    messages = [r.message for r in caplog.records if r.name == "api.timing"]
    assert any("GET /api/incidents/{incident_id} → 404" in line and " ms" in line for line in messages)
    assert "synthetic-private" not in " ".join(messages)
    assert "unmatched-private-path" not in " ".join(messages)
