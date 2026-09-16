import json
import sqlite3
import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

from fastapi.testclient import TestClient
from services.api.main import app
from services.api import incident_store


class IncidentStoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.patchers = [
            patch.object(incident_store, "DATA_DIR", root),
            patch.object(incident_store, "DB_FILE_PATH", root / "incidents.sqlite3"),
            patch.object(incident_store, "LEGACY_FILE_PATH", root / "incidents.json"),
            patch.object(incident_store, "_initialized", False),
        ]
        for patcher in self.patchers:
            patcher.start()
            self.addCleanup(patcher.stop)

    def test_database_rejects_invalid_values(self):
        record = incident_store.insert_incident({
            "title": "Prueba", "description": "Detalle", "category": "carrier_issue",
            "status": "open", "origin": "internal", "branch": "central",
            "created_at": "2026-01-01T00:00:00+00:00",
            "updated_at": "2026-01-01T00:00:00+00:00",
        })
        self.assertEqual(record["id"], 1)
        with closing(sqlite3.connect(incident_store.DB_FILE_PATH)) as db:
            for sql in (
                "UPDATE incidents SET status = 'invalid' WHERE id = 1",
                "UPDATE incidents SET category = 'invalid' WHERE id = 1",
                "UPDATE incidents SET origin = 'invalid' WHERE id = 1",
                "UPDATE incidents SET branch = 'invalid' WHERE id = 1",
                "UPDATE incidents SET title = '  ' WHERE id = 1",
                "UPDATE incidents SET description = NULL WHERE id = 1",
            ):
                with self.assertRaises(sqlite3.IntegrityError):
                    db.execute(sql)
        self.assertEqual(incident_store.get_incident(1)["status"], "open")

    def test_migrates_legacy_id_and_preserves_source(self):
        payload = {
            "title": "Histórica", "description": "Detalle", "category": "lost_parcel",
            "status": "resolved", "origin": "customer", "branch": "la_office",
            "source_id": "TRF-000001", "created_at": "2024-01-01T00:00:00+00:00",
            "updated_at": "2024-01-01T00:00:00+00:00",
        }
        incident_store.LEGACY_FILE_PATH.write_text(json.dumps({"incidents": {"7": payload}}), encoding="utf-8")
        self.assertEqual(incident_store.get_incident(7)["source_id"], "TRF-000001")
        self.assertFalse(incident_store.insert_seed_incident(payload))
        self.assertEqual(len(incident_store.list_incidents()), 1)
        self.assertTrue(incident_store.LEGACY_FILE_PATH.exists())

    def test_api_persists_and_enforces_transitions(self):
        client = TestClient(app)
        created = client.post("/api/incidents", json={
            "title": "Prueba", "description": "Detalle", "category": "carrier_issue",
            "status": "open", "origin": "internal", "branch": "central",
        })
        self.assertEqual(created.status_code, 201)
        incident_id = created.json()["id"]
        self.assertEqual(client.patch(f"/api/incidents/{incident_id}/status", json={"status": "in_progress"}).status_code, 200)
        self.assertEqual(client.patch(f"/api/incidents/{incident_id}/status", json={"status": "resolved"}).status_code, 200)
        self.assertEqual(client.patch(f"/api/incidents/{incident_id}/status", json={"status": "open"}).status_code, 400)
        self.assertEqual(incident_store.get_incident(incident_id)["status"], "resolved")


if __name__ == "__main__":
    unittest.main()
