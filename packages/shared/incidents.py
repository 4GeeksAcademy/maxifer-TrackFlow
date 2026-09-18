"""Canonical incident validation used by the API and historical seed."""

VALID_STATUS = {"open", "in_progress", "resolved", "discarded"}
VALID_ORIGINS = {"customer", "branch", "internal"}
VALID_BRANCHES = {"central", "la_warehouse", "la_office", "zaragoza_warehouse", "zaragoza_office"}
VALID_CATEGORIES = {"lost_parcel", "delivery_failure", "inventory_discrepancy", "carrier_issue", "returns_issue", "warehouse_incident", "system_failure", "client_complaint", "other"}
ALLOWED_TRANSITIONS = {
    "open": {"in_progress", "discarded"},
    "in_progress": {"resolved", "discarded"},
    "resolved": set(),
    "discarded": set(),
}


class IncidentValidationError(ValueError):
    def __init__(self, field: str, message: str):
        self.field = field
        super().__init__(message)


def require_text(value: str, field: str) -> str:
    text = value.strip() if isinstance(value, str) else ""
    if not text:
        raise IncidentValidationError(field, f"El campo {field} es obligatorio")
    return text


def validate_choice(value: str, valid_values: set[str], field: str) -> str:
    text = require_text(value, field)
    if text not in valid_values:
        raise IncidentValidationError(field, f"El valor de {field} no es válido")
    return text


def validate_incident(values: dict) -> dict:
    result = dict(values)
    result["title"] = require_text(values.get("title"), "title")
    if len(result["title"]) > 120:
        raise IncidentValidationError("title", "El título no puede superar 120 caracteres")
    result["description"] = require_text(values.get("description"), "description")
    result["category"] = validate_choice(values.get("category"), VALID_CATEGORIES, "category")
    result["status"] = validate_choice(values.get("status", "open"), VALID_STATUS, "status")
    result["origin"] = validate_choice(values.get("origin"), VALID_ORIGINS, "origin")
    result["branch"] = validate_choice(values.get("branch"), VALID_BRANCHES, "branch")
    return result


def validate_transition(current: str, target: str) -> str:
    validate_choice(target, VALID_STATUS, "status")
    if target not in ALLOWED_TRANSITIONS[current]:
        raise IncidentValidationError("status", "La transición de estado no está permitida")
    return target
