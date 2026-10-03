"""Import the historical customer incidents. Safe to run repeatedly."""

import csv
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from packages.shared.incidents import validate_incident
from packages.incidents_analysis.analyzer import validate_row
from services.api.incident_store import insert_seed_incident

STATUS_MAP = {"OPEN": "open", "CLOSED": "resolved", "DISCARDED": "discarded"}
CATEGORY_MAP = {"LOST_PARCEL": "lost_parcel", "DELAYED_DELIVERY": "carrier_issue", "WRONG_ADDRESS": "delivery_failure", "RETURN_REQUEST": "returns_issue", "DAMAGE": "carrier_issue"}
BRANCH_MAP = {"US": "la_office", "ES": "zaragoza_office"}
CSV_PATH = ROOT / "scripts" / "incidents-trackflow.csv"


def transform(row):
    description = row.get("description", "")
    created_at = datetime.strptime(row.get("date", ""), "%Y-%m-%d").replace(tzinfo=timezone.utc).isoformat()
    values = validate_incident({
        "title": description[:120].strip(), "description": description,
        "category": CATEGORY_MAP.get(row.get("category")),
        "status": STATUS_MAP.get(row.get("status")),
        "origin": "customer", "branch": BRANCH_MAP.get(row.get("country")),
    })
    values["source_id"] = row.get("incident_id", "").strip() or f"{values['title']}|{created_at}"
    values["created_at"] = created_at
    values["updated_at"] = created_at
    return values


def seed(path=CSV_PATH):
    inserted = skipped = 0
    invalid = []
    with open(path, newline="", encoding="utf-8-sig") as source:
        for line, row in enumerate(csv.DictReader(source), start=2):
            try:
                problems = validate_row(row)
                if problems:
                    invalid.append((line, ", ".join(problems)))
                    continue
                values = transform(row)
                if insert_seed_incident(values):
                    inserted += 1
                else:
                    skipped += 1
            except (ValueError, TypeError) as error:
                invalid.append((line, str(error)))
    print(f"Seed terminado\nInsertadas: {inserted}\nOmitidas por existir: {skipped}\nInválidas: {len(invalid)}")
    for line, reason in invalid:
        print(f"Fila {line}: {reason}")
    return inserted, skipped, invalid


if __name__ == "__main__":
    seed()
