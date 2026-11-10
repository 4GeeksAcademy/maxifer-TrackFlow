"""Exercise FastAPI's HTTP serialization against isolated synthetic storage."""

import csv
import io

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine
from tinydb import TinyDB

from services.api import auth, database, incident_store, main, security, user_service
from services.api.password_reset_service import create_password_reset_token


@pytest.fixture
def client(tmp_path, monkeypatch, auth_db):
    suppliers = TinyDB(tmp_path / "suppliers.json")
    monkeypatch.setattr(database, "_DB_INSTANCE", suppliers)
    monkeypatch.setattr(incident_store, "DATA_DIR", tmp_path)
    monkeypatch.setattr(incident_store, "DB_FILE_PATH", tmp_path / "incidents.sqlite3")
    monkeypatch.setattr(incident_store, "LEGACY_FILE_PATH", tmp_path / "absent.json")
    monkeypatch.setattr(incident_store, "_initialized", False)
    monkeypatch.setattr(main, "LAST_ANALYSIS", None)
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        def inventory_session():
            yield session

        # No lifespan context: startup seeds and external services are never run.
        monkeypatch.setitem(main.app.dependency_overrides, database.get_inventory_db, inventory_session)
        with_client = TestClient(main.app, raise_server_exceptions=False)
        yield with_client
        with_client.close()
    engine.dispose()
    suppliers.close()


@pytest.fixture
def account(create_test_user):
    return create_test_user(email="contract@example.com", password="contract-password")


def headers(account):
    return {"Authorization": "Bearer " + security.create_access_token(account["id"])}


def assert_no_private_keys(value, *, public_auth=False):
    forbidden = {"password", "hashed_password", "reset_token", "token_hash", "api_key"}
    if public_auth:
        forbidden.add("email")
    if isinstance(value, dict):
        assert not forbidden.intersection(value)
        for item in value.values():
            assert_no_private_keys(item, public_auth=public_auth)
    elif isinstance(value, list):
        for item in value:
            assert_no_private_keys(item, public_auth=public_auth)


def test_registration_and_login_never_echo_email_or_private_credentials(client, monkeypatch):
    original = user_service.create_user_with_profile

    def create_with_internal_fields(*args, **kwargs):
        user, profile = original(*args, **kwargs)
        user["reset_token"] = "internal-only"
        profile["email"] = user["email"]
        profile["api_key"] = "internal-only"
        return user, profile

    monkeypatch.setattr("services.api.routers.users.create_user_with_profile", create_with_internal_fields)
    response = client.post("/users", json={
        "email": "registration@example.com", "password": "registration-password", "name": "Synthetic",
    })
    assert response.status_code == 201
    assert response.json()["profile"]["name"] == "Synthetic"
    assert "user_id" not in response.json()["profile"]
    assert_no_private_keys(response.json(), public_auth=True)
    response = client.post("/auth/login", data={
        "username": "registration@example.com", "password": "registration-password",
    })
    assert response.status_code == 200
    assert set(response.json()) == {"access_token", "token_type"}
    assert response.json()["token_type"] == "bearer"
    assert_no_private_keys(response.json(), public_auth=True)


def test_password_recovery_responses_are_generic_and_filtered(client, account, monkeypatch):
    monkeypatch.setattr(auth, "send_password_reset_email", lambda *_: None)
    known = client.post("/auth/forgot-password", json={"email": account["email"]})
    unknown = client.post("/auth/forgot-password", json={"email": "unknown@example.com"})
    assert known.status_code == unknown.status_code == 200
    assert known.json() == unknown.json()
    assert set(known.json()) == {"message"}
    token = create_password_reset_token(account["id"])
    reset = client.post("/auth/reset-password", json={"token": token, "new_password": "replacement-password"})
    assert reset.status_code == 200
    assert set(reset.json()) == {"message"}
    assert_no_private_keys(known.json(), public_auth=True)
    assert_no_private_keys(reset.json(), public_auth=True)


def test_account_and_profiles_filter_persistence_fields_and_preserve_own_email(client, account):
    user_service.update_user(account["id"], {"reset_token": "internal-only"})
    user_service.update_profile(account["id"], {"hashed_password": "internal-only", "api_key": "internal-only"})
    response = client.get("/auth/me", headers=headers(account))
    assert response.status_code == 200
    payload = response.json()
    assert payload["user"]["email"] == account["email"]
    assert set(payload["profile"]) == {"id", "name", "phone", "address"}
    assert_no_private_keys(payload)
    for method, kwargs in (("GET", {}), ("PUT", {"json": {"name": "Updated"}})):
        response = client.request(method, "/profiles/me", headers=headers(account), **kwargs)
        assert response.status_code == 200
        assert set(response.json()) == {"id", "name", "phone", "address"}
        assert_no_private_keys(response.json())


def test_missing_profile_is_nullable_in_account_and_404_in_profile_routes(client, account):
    table = database.get_profiles_table()
    table.remove(doc_ids=[doc.doc_id for doc in table.all()])
    assert client.get("/auth/me", headers=headers(account)).json()["profile"] is None
    for method, kwargs in (("GET", {}), ("PUT", {"json": {"name": "Missing"}})):
        response = client.request(method, "/profiles/me", headers=headers(account), **kwargs)
        assert response.status_code == 404
        assert response.json() == {"detail": "Perfil no encontrado."}


def test_user_crud_exposes_only_public_projection(client, account):
    user_service.update_user(account["id"], {"api_key": "internal-only"})
    expected = {"id", "email", "is_active", "role", "created_at"}
    response = client.get("/users", headers=headers(account))
    assert response.status_code == 200
    assert all(set(item) == expected for item in response.json())
    for method, kwargs in (("GET", {}), ("PUT", {"json": {"email": "changed@example.com"}})):
        response = client.request(method, "/users/" + account["id"], headers=headers(account), **kwargs)
        assert response.status_code == 200
        assert set(response.json()) == expected
        assert_no_private_keys(response.json())
    response = client.delete("/users/" + account["id"], headers=headers(account))
    assert response.status_code == 200
    assert response.json() == {"deleted": True, "id": account["id"]}


def test_supplier_list_is_smaller_than_detail_and_mutations_keep_detail(client, account):
    response = client.post("/suppliers", headers=headers(account), json={
        "name": "Synthetic supplier", "country": "USA", "categories": ["carrier_last_mile"],
        "rate_per_shipment": 5, "currency": "USD", "status": "active",
        "service_zone": "Synthetic zone", "contact_email": "contact@example.com", "notes": "Detail only",
    })
    assert response.status_code == 201
    supplier_id = response.json()["id"]
    detail = client.get("/suppliers/" + supplier_id, headers=headers(account))
    assert detail.status_code == 200
    assert detail.json()["notes"] == "Detail only"
    listed = client.get("/suppliers?country=USA&category=carrier_last_mile", headers=headers(account))
    assert listed.status_code == 200
    assert set(listed.json()[0]) == {
        "id", "name", "country", "categories", "rate_per_shipment", "currency", "status",
    }
    for field, payload in (("rate", {"rate_per_shipment": 7}), ("status", {"status": "suspended"})):
        updated = client.patch(f"/suppliers/{supplier_id}/{field}", json=payload, headers=headers(account))
        assert updated.status_code == 200
        assert updated.json()["notes"] == "Detail only"
    deleted = client.delete("/suppliers/" + supplier_id, headers=headers(account))
    assert deleted.json() == {"deleted": True, "id": supplier_id}


def test_inventory_movement_projections_preserve_stock_and_operational_attribution(client, account):
    created = client.post("/inventory/products", headers=headers(account), json={
        "name": "Synthetic product", "sku": "AUDIT-1", "client_name": "Synthetic client",
        "category": "fashion", "warehouse": "LA",
    })
    assert created.status_code == 201
    product_id = created.json()["id"]
    projection = {"id": product_id, "name": "Synthetic product", "sku": "AUDIT-1"}
    for path, payload in (
        ("inbound", {"quantity": 8, "reference": "REF-1"}),
        ("outbound", {"quantity": 3, "exit_type": "loss"}),
    ):
        response = client.post("/inventory/orders/" + path, headers=headers(account), json={
            "sku_id": product_id, "warehouse": "LA", **payload,
        })
        assert response.status_code == 201
        assert response.json()["sku"] == projection
        assert response.json()["user_uuid"] == account["id"]
        assert "sku_id" not in response.json()
    listed = client.get("/inventory/orders")
    assert listed.status_code == 200
    assert len(listed.json()) == 2
    assert all(item["sku"] == projection for item in listed.json())
    assert client.get(f"/inventory/products/{product_id}").json()["current_stock"] == 5
    assert client.get("/inventory/products").json()[0]["current_stock"] == 5


def test_incident_contract_filters_import_id_and_preserves_errors(client):
    payload = {
        "title": "Synthetic incident", "description": "Synthetic description",
        "category": "carrier_issue", "origin": "internal", "branch": "central",
    }
    created = client.post("/api/incidents", json=payload)
    assert created.status_code == 201
    incident_id = created.json()["id"]
    with incident_store._connection() as connection:
        connection.execute("UPDATE incidents SET source_id = ? WHERE id = ?", ("internal-import-id", incident_id))
    for path in ("/api/incidents", f"/api/incidents/{incident_id}"):
        response = client.get(path)
        assert response.status_code == 200
        items = response.json() if isinstance(response.json(), list) else [response.json()]
        assert all("source_id" not in item and item["description"] == payload["description"] for item in items)
    assert client.get("/api/incidents/summary").json()["by_status"] == {"open": 1}
    updated = client.patch(f"/api/incidents/{incident_id}/status", json={"status": "in_progress"})
    assert updated.status_code == 200
    assert "source_id" not in updated.json()
    invalid = client.patch(f"/api/incidents/{incident_id}/status", json={"status": "open"})
    assert invalid.status_code == 400
    assert invalid.json()["error"] == "invalid_status_transition"
    invalid = client.get("/api/incidents?status=unknown")
    assert invalid.status_code == 400
    assert set(invalid.json()) == {"error", "field", "message"}
    missing = client.get("/api/incidents/9999")
    assert missing.status_code == 404
    assert set(missing.json()) == {"error", "message"}


@pytest.mark.parametrize("status,score,invalid", [("CLOSED", "5", False), ("OPEN", "", False), ("UNKNOWN", "", True)])
def test_csv_analysis_schema_and_export_remain_compatible(client, account, status, score, invalid):
    from packages.incidents_analysis.analyzer import EXPECTED_COLUMNS

    assert client.get("/api/incidents/results/export", headers=headers(account)).status_code == 404
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow(EXPECTED_COLUMNS)
    writer.writerow(["TRF-000001", "2026-11-09", "US", "B2C", "TRACK0001", "UPS",
                     "LOST_PARCEL", "Synthetic incident", status, "synthetic@example.com", score])
    response = client.post("/api/incidents/analyze", headers=headers(account), files={
        "file": ("synthetic.csv", stream.getvalue().encode(), "text/csv"),
    })
    assert response.status_code == 200
    result = response.json()
    assert result["total_records"] == 1
    assert result["invalid_records"] == int(invalid)
    assert result["satisfaction"]["average"] == (5 if score else None)
    assert "synthetic@example.com" not in response.text
    exported = client.get("/api/incidents/results/export", headers=headers(account))
    assert exported.status_code == 200
    assert exported.headers["content-type"].startswith("text/csv")
    assert 'filename="results.csv"' in exported.headers["content-disposition"]
    assert "total_records,1" in exported.text


@pytest.mark.parametrize("abstained", [False, True])
def test_rag_filters_context_and_internal_source_fields(client, account, monkeypatch, abstained):
    from data.pipelines import rag

    monkeypatch.setattr(rag, "query", lambda _: {
        "answer": "Synthetic response", "retrieved_count": 0 if abstained else 1, "abstained": abstained,
        "sources": [] if abstained else [{"source_document": "synthetic", "section": "Terms", "embedding": [1]}],
        "api_key": "internal-only", "context": "private-context",
    })
    response = client.post("/api/rag/query", headers=headers(account), json={"question": "Synthetic?"})
    assert response.status_code == 200
    assert set(response.json()) == {"answer", "sources", "retrieved_count", "abstained"}
    if not abstained:
        assert response.json()["sources"] == [{"source_document": "synthetic", "section": "Terms"}]


@pytest.mark.parametrize("path,payload", [
    ("/users", {"email": "bad@example.com", "password": "valid-password", "role": "admin"}),
    ("/profiles/me", {"name": "Synthetic", "user_id": "other-user"}),
    ("/inventory/products", {"name": "Synthetic", "sku": "BAD", "client_name": "Synthetic",
                             "category": "fashion", "warehouse": "LA", "current_stock": 100}),
    ("/inventory/orders/inbound", {"sku_id": 1, "quantity": 1, "reference": "R", "warehouse": "LA", "user_uuid": "other"}),
    ("/api/incidents", {"title": "Synthetic", "description": "Synthetic", "category": "other",
                        "origin": "internal", "branch": "central", "source_id": "internal"}),
    ("/api/rag/query", {"question": "Synthetic?", "api_key": "not-allowed"}),
])
def test_write_contracts_reject_fields_not_owned_by_the_client(client, account, path, payload):
    method = "PUT" if path == "/profiles/me" else "POST"
    response = client.request(method, path, headers=headers(account), json=payload)
    assert response.status_code == 400
    assert response.json()["error"] == "validation_error"


def test_openapi_describes_all_success_responses_and_csv_as_text(client):
    document = client.get("/openapi.json").json()
    operations = [(path, verb, operation) for path, verbs in document["paths"].items()
                  for verb, operation in verbs.items() if verb in {"get", "post", "put", "patch", "delete"}]
    assert len(operations) == 33
    for path, _, operation in operations:
        success = next(v for k, v in operation["responses"].items() if k.startswith("2"))
        content = success["content"]
        if path == "/api/incidents/results/export":
            assert set(content) == {"text/csv"}
            assert content["text/csv"]["schema"]["type"] == "string"
        else:
            assert content["application/json"]["schema"]
    assert client.get("/").json() == {"message": "TrackFlow Incidents API is running"}
