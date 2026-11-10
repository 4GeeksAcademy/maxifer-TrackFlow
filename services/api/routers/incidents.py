"""Centralized incident management endpoints."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict

from packages.shared.incidents import (
    IncidentValidationError, VALID_STATUS, VALID_ORIGINS, VALID_BRANCHES,
    VALID_CATEGORIES, validate_choice, validate_incident,
)
from services.api.incident_store import get_incident as find_incident, list_incidents as find_incidents, insert_incident, update_status
from services.api.schemas_responses import (
    ApiErrorResponse, IncidentListItem, IncidentResponse,
    IncidentSummaryResponse, ValidationErrorResponse, HTTPErrorResponse,
)
from services.api.incident_cache import incident_cache
from services.api.security import get_current_user

router = APIRouter(
    prefix="/api/incidents", tags=["incidents"],
    responses={400: {"model": ValidationErrorResponse}, 404: {"model": ApiErrorResponse}},
)


class IncidentCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str
    description: str
    category: str
    status: str = "open"
    origin: str
    branch: str


class IncidentStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: str


def validation_response(error: IncidentValidationError):
    return JSONResponse(status_code=400, content={"error": "validation_error", "field": error.field, "message": str(error)})


def not_found():
    return JSONResponse(status_code=404, content={"error": "not_found", "message": "Incidencia no encontrada"})


@router.post("", response_model=IncidentResponse, status_code=201)
def create_incident(payload: IncidentCreate):
    try:
        record = validate_incident(payload.model_dump())
    except IncidentValidationError as error:
        return validation_response(error)
    now = datetime.now(timezone.utc).isoformat()
    record.update(created_at=now, updated_at=now, source_id=None)
    return insert_incident(record)


@router.get("", response_model=list[IncidentListItem], responses={401: {"model": HTTPErrorResponse}})
def list_incidents(status: str | None = None, origin: str | None = None, branch: str | None = None, category: str | None = None, current_user: dict = Depends(get_current_user)):
    try:
        for field, value, choices in (("status", status, VALID_STATUS), ("origin", origin, VALID_ORIGINS), ("branch", branch, VALID_BRANCHES), ("category", category, VALID_CATEGORIES)):
            if value is not None:
                validate_choice(value, choices, field)
    except IncidentValidationError as error:
        return validation_response(error)
    filters = {"status": status, "origin": origin, "branch": branch, "category": category}
    key = ("list", str(current_user["id"]), tuple(sorted((key, value) for key, value in filters.items() if value is not None)))
    return incident_cache.get_or_load(key, lambda: find_incidents(filters))


@router.get("/summary", response_model=IncidentSummaryResponse, responses={401: {"model": HTTPErrorResponse}})
def incidents_summary(current_user: dict = Depends(get_current_user)):
    return incident_cache.get_or_load(("summary", str(current_user["id"])), _build_summary)


def _build_summary():
    rows = find_incidents()
    result = {"total": len(rows), "by_status": {}, "by_category": {}, "by_origin": {}, "by_branch": {}}
    for row in rows:
        for field in ("status", "category", "origin", "branch"):
            group = result[f"by_{field}"]
            group[row[field]] = group.get(row[field], 0) + 1
    return result


@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(incident_id: int):
    doc = find_incident(incident_id)
    return doc if doc else not_found()


@router.patch("/{incident_id}/status", response_model=IncidentResponse)
def update_incident_status(incident_id: int, payload: IncidentStatusUpdate):
    try:
        updated = update_status(incident_id, payload.status, datetime.now(timezone.utc).isoformat())
    except IncidentValidationError as error:
        if payload.status in VALID_STATUS:
            return JSONResponse(status_code=400, content={"error": "invalid_status_transition", "field": "status", "message": str(error)})
        return validation_response(error)
    return updated if updated else not_found()
