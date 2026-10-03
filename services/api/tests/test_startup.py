import io
import os
import tempfile
import unittest
from contextlib import redirect_stderr, redirect_stdout
from pathlib import Path
from unittest.mock import patch

from tinydb import TinyDB

os.environ.setdefault("JWT_SECRET", "test-jwt-secret")

from services.api import database, incident_store, main, user_service
from services.api.security import hash_password, verify_password
from scripts.seed_incidents import CSV_PATH, seed


class StartupTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        auth_db = TinyDB(self.root / "auth.json")
        self.addCleanup(auth_db.close)
        self.patchers = [
            patch.dict(os.environ, {"DEMO_DATA_ENABLED": "true"}),
            patch.object(database, "_AUTH_DB_INSTANCE", auth_db),
            patch.object(main, "create_inventory_tables"),
            patch.object(main, "seed_incidents"),
            patch.object(main, "CSV_PATH", self.root),
        ]
        for patcher in self.patchers:
            patcher.start()
            self.addCleanup(patcher.stop)

    def start(self):
        with self.assertLogs(main.__name__, level="WARNING"):
            main.initialize_inventory_tables()

    def test_creates_single_test_user_on_repeated_startup(self):
        self.start()
        first = user_service.get_user_by_email("test@test.com")
        self.start()
        users = user_service.get_all_users()
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0]["id"], first["id"])
        self.assertEqual(users[0]["hashed_password"], first["hashed_password"])
        self.assertTrue(verify_password("test1234", users[0]["hashed_password"]))
        self.assertIsNotNone(user_service.get_profile_by_user_id(first["id"]))

    def test_migrates_legacy_test_user_and_preserves_profile(self):
        legacy, profile = user_service.create_user_with_profile(
            "maxifer@test.com", hash_password("old-password"), {"name": "Existing profile"}
        )
        self.start()
        user = user_service.get_user_by_email("test@test.com")
        self.assertEqual(user["id"], legacy["id"])
        self.assertEqual(user_service.get_profile_by_user_id(user["id"]), profile)
        self.assertIsNone(user_service.get_user_by_email("maxifer@test.com"))
        self.assertTrue(verify_password("test1234", user["hashed_password"]))

    def test_removes_legacy_test_account_but_preserves_other_users(self):
        legacy, _ = user_service.create_user_with_profile("maxifer@test.com", hash_password("old-password"))
        current, _ = user_service.create_user_with_profile("test@test.com", hash_password("old-password"))
        other, _ = user_service.create_user_with_profile("other@example.com", hash_password("other-password"))
        self.start()
        self.assertEqual({user["id"] for user in user_service.get_all_users()}, {current["id"], other["id"]})
        self.assertIsNone(user_service.get_profile_by_user_id(legacy["id"]))
        self.assertTrue(verify_password("other-password", user_service.get_user_by_id(other["id"])["hashed_password"]))

    def test_restores_test_password_and_active_status(self):
        current, _ = user_service.create_user_with_profile("test@test.com", hash_password("old-password"))
        user_service.update_user(current["id"], {"is_active": False})
        self.start()
        user = user_service.get_user_by_email("test@test.com")
        self.assertTrue(user["is_active"])
        self.assertTrue(verify_password("test1234", user["hashed_password"]))

    def test_demo_data_can_be_disabled(self):
        with patch.dict(os.environ, {"DEMO_DATA_ENABLED": "false"}):
            main.initialize_inventory_tables()
        main.create_inventory_tables.assert_called_once_with()
        main.seed_incidents.assert_not_called()
        self.assertEqual(user_service.get_all_users(), [])

    def test_seeds_on_every_startup_even_when_test_user_exists(self):
        with patch.object(main, "CSV_PATH", Path(__file__)):
            main.initialize_inventory_tables()
            main.initialize_inventory_tables()
        self.assertEqual(main.seed_incidents.call_count, 2)

    @unittest.skipUnless(CSV_PATH.is_file(), "Historical CSV is unavailable")
    def test_historical_import_is_idempotent_and_preserves_status_changes(self):
        with (
            patch.object(incident_store, "DATA_DIR", self.root),
            patch.object(incident_store, "DB_FILE_PATH", self.root / "incidents.sqlite3"),
            patch.object(incident_store, "LEGACY_FILE_PATH", self.root / "incidents.json"),
            patch.object(incident_store, "_initialized", False),
            patch.object(main, "CSV_PATH", CSV_PATH),
            patch.object(main, "seed_incidents", side_effect=seed),
            redirect_stdout(io.StringIO()),
            redirect_stderr(io.StringIO()),
        ):
            main.initialize_inventory_tables()
            rows = incident_store.list_incidents()
            self.assertEqual(len(rows), 95)
            open_incident = next(row for row in rows if row["status"] == "open")
            incident_store.update_status(open_incident["id"], "in_progress", open_incident["updated_at"])
            main.initialize_inventory_tables()
            self.assertEqual(len(incident_store.list_incidents()), 95)
            self.assertEqual(incident_store.get_incident(open_incident["id"])["status"], "in_progress")