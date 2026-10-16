import pytest
from fastapi.responses import JSONResponse

from services.api import incident_store
from services.api.routers import incidents


@pytest.fixture
def isolated_incidents(tmp_path, monkeypatch):
    monkeypatch.setattr(incident_store, "DATA_DIR", tmp_path)
    monkeypatch.setattr(incident_store, "DB_FILE_PATH", tmp_path / "incidents.sqlite3")
    monkeypatch.setattr(incident_store, "LEGACY_FILE_PATH", tmp_path / "incidents.json")
    monkeypatch.setattr(incident_store, "_initialized", False)


def incident_payload(**overrides):
    values = {
        "title": "Package delayed",
        "description": "The carrier missed the delivery window.",
        "category": "carrier_issue",
        "status": "open",
        "origin": "internal",
        "branch": "central",
    }
    values.update(overrides)
    return incidents.IncidentCreate(**values)


def test_create_incident_stores_valid_data_and_timestamps(isolated_incidents):
    created = incidents.create_incident(incident_payload(title="  Package delayed  "))

    assert created["id"] == 1
    assert created["title"] == "Package delayed"
    assert created["status"] == "open"
    assert created["created_at"] == created["updated_at"]


@pytest.mark.parametrize(
    ("field", "value"),
    [("title", " "), ("title", "x" * 121), ("category", "unknown")],
)
def test_create_incident_rejects_invalid_boundary_values(isolated_incidents, field, value):
    response = incidents.create_incident(incident_payload(**{field: value}))

    assert isinstance(response, JSONResponse)
    assert response.status_code == 400


def test_list_incidents_filters_results_and_returns_empty_for_no_match(isolated_incidents):
    incidents.create_incident(incident_payload())
    incidents.create_incident(incident_payload(origin="customer", branch="la_office"))

    filtered = incidents.list_incidents(origin="customer", branch="la_office")
    no_match = incidents.list_incidents(category="lost_parcel")

    assert len(filtered) == 1
    assert filtered[0]["origin"] == "customer"
    assert no_match == []


def test_list_incidents_rejects_unknown_filter(isolated_incidents):
    response = incidents.list_incidents(status="waiting")

    assert isinstance(response, JSONResponse)
    assert response.status_code == 400


def test_summary_groups_records_and_handles_empty_store(isolated_incidents):
    assert incidents.incidents_summary()["total"] == 0
    incidents.create_incident(incident_payload())
    incidents.create_incident(incident_payload(category="lost_parcel", branch="la_office"))

    summary = incidents.incidents_summary()

    assert summary["total"] == 2
    assert summary["by_status"] == {"open": 2}
    assert summary["by_category"] == {"carrier_issue": 1, "lost_parcel": 1}


def test_get_incident_returns_record_or_not_found(isolated_incidents):
    created = incidents.create_incident(incident_payload())

    assert incidents.get_incident(created["id"])["title"] == "Package delayed"
    missing = incidents.get_incident(999)
    assert isinstance(missing, JSONResponse)
    assert missing.status_code == 404


def test_update_incident_status_accepts_valid_transition_and_rejects_invalid(isolated_incidents):
    created = incidents.create_incident(incident_payload())

    updated = incidents.update_incident_status(
        created["id"], incidents.IncidentStatusUpdate(status="in_progress")
    )
    invalid_transition = incidents.update_incident_status(
        created["id"], incidents.IncidentStatusUpdate(status="open")
    )
    invalid_status = incidents.update_incident_status(
        created["id"], incidents.IncidentStatusUpdate(status="waiting")
    )
    missing = incidents.update_incident_status(
        999, incidents.IncidentStatusUpdate(status="in_progress")
    )

    assert updated["status"] == "in_progress"
    assert isinstance(invalid_transition, JSONResponse)
    assert invalid_transition.status_code == 400
    assert isinstance(invalid_status, JSONResponse)
    assert invalid_status.status_code == 400
    assert isinstance(missing, JSONResponse)
    assert missing.status_code == 404