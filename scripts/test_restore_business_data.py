from contextlib import closing
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest

from scripts.restore_business_data import restore


class RestoreBusinessDataTests(unittest.TestCase):
    def test_empty_tinydb_and_new_sqlite_target(self):
        with tempfile.TemporaryDirectory() as directory:
            source, target = (Path(directory) / name for name in ("source", "target"))
            source.mkdir()
            target.mkdir()
            with closing(sqlite3.connect(source / "incidents.sqlite3")) as db, db:
                db.execute("CREATE TABLE incidents (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT UNIQUE, title TEXT, created_at TEXT, status TEXT)")
                db.execute("INSERT INTO incidents VALUES (97,NULL,'Manual','2026','open')")
            (source / "suppliers.json").write_text(json.dumps({"suppliers": {"15": {"name": "UPS", "country": "USA"}}}))
            (target / "suppliers.json").touch()
            report = restore(source, target)
            self.assertEqual(report["incidents"]["inserted"], 1)
            self.assertEqual(report["suppliers"]["inserted"], 1)
            self.assertEqual(json.loads((target / "suppliers.json").read_text())["suppliers"]["15"]["name"], "UPS")

    def test_merge_preserves_target_auth_and_conflicts_and_is_repeatable(self):
        with tempfile.TemporaryDirectory() as directory:
            source, target = (Path(directory) / name for name in ("source", "target"))
            for folder in (source, target):
                folder.mkdir()
                with closing(sqlite3.connect(folder / "incidents.sqlite3")) as db, db:
                    db.execute("CREATE TABLE incidents (id INTEGER PRIMARY KEY AUTOINCREMENT, source_id TEXT UNIQUE, title TEXT, created_at TEXT, status TEXT)")
            with closing(sqlite3.connect(source / "incidents.sqlite3")) as db, db:
                db.executemany("INSERT INTO incidents VALUES (?,?,?,?,?)", [(1, "import-1", "Original", "2026", "open"), (2, None, "Manual", "2026", "open"), (3, "import-3", "Third", "2026", "open"), (4, "import-4", "Fourth", "2026", "open")])
            with closing(sqlite3.connect(target / "incidents.sqlite3")) as db, db:
                db.executemany("INSERT INTO incidents VALUES (?,?,?,?,?)", [(1, "new-vps", "New", "2026", "open"), (4, "import-1", "Original", "2026", "resolved")])
            (source / "suppliers.json").write_text(json.dumps({"suppliers": {"1": {"name": "UPS", "country": "USA", "rate": 1}, "2": {"name": "DHL", "country": "ES", "rate": 2}}}))
            (target / "suppliers.json").write_text(json.dumps({"suppliers": {"2": {"name": "New", "country": "USA", "rate": 3}, "3": {"name": "UPS", "country": "USA", "rate": 4}}, "other": {"keep": True}}))
            auth = b'{"users":{"1":{"id":"existing-user"}}}'
            (target / "auth.json").write_bytes(auth)
            result = restore(source, target)
            self.assertEqual(result["incidents"]["inserted"], 3)
            self.assertEqual(result["suppliers"]["inserted"], 1)
            self.assertEqual(sum(c["resolution"] == "kept_target" for c in result["conflicts"]), 2)
            self.assertEqual(sum(c["resolution"] == "assigned_new_id" for c in result["conflicts"]), 2)
            with closing(sqlite3.connect(target / "incidents.sqlite3")) as db, db:
                self.assertEqual(db.execute("SELECT status FROM incidents WHERE source_id='import-1'").fetchone()[0], "resolved")
                self.assertEqual(db.execute("SELECT title FROM incidents WHERE id=1").fetchone()[0], "New")
                self.assertEqual(db.execute("SELECT title FROM incidents WHERE id=3").fetchone()[0], "Third")
            again = restore(source, target)
            self.assertEqual(again["incidents"]["inserted"], 0)
            self.assertEqual(again["suppliers"]["inserted"], 0)
            self.assertEqual((target / "auth.json").read_bytes(), auth)
            self.assertEqual(json.loads((target / "suppliers.json").read_text())["other"], {"keep": True})


if __name__ == "__main__":
    unittest.main()
