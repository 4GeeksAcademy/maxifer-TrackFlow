"""Merge offline business-data snapshots without changing authentication data.

Stop the target API and back up its volume before running this command.
Existing target records win conflicts. Repeated imports do not duplicate rows.
"""

import argparse
from contextlib import closing
import json
import os
from pathlib import Path
import sqlite3
import tempfile


def restore(source: Path, target: Path) -> dict:
    report = {"incidents": {}, "suppliers": {}, "conflicts": []}
    source_db = sqlite3.connect((source / "incidents.sqlite3").resolve().as_uri() + "?mode=ro", uri=True)
    source_db.row_factory = sqlite3.Row
    try:
        rows = [dict(row) for row in source_db.execute("SELECT * FROM incidents ORDER BY id")]
        schema = source_db.execute("SELECT sql FROM sqlite_master WHERE type='table' AND name='incidents'").fetchone()[0]
    finally:
        source_db.close()
    suppliers = json.loads((source / "suppliers.json").read_text(encoding="utf-8"))["suppliers"]
    target.mkdir(parents=True, exist_ok=True)
    path = target / "suppliers.json"
    # TinyDB creates a zero-byte file before its first write.
    contents = path.read_text(encoding="utf-8") if path.exists() else ""
    database = json.loads(contents) if contents.strip() else {}
    with closing(sqlite3.connect(target / "incidents.sqlite3")) as connection, connection:
        connection.row_factory = sqlite3.Row
        if not connection.execute("SELECT 1 FROM sqlite_master WHERE name='incidents' AND type='table'").fetchone():
            connection.execute(schema)
        existing = [dict(row) for row in connection.execute("SELECT * FROM incidents")]
        def key(row):
            return ("source", row["source_id"]) if row["source_id"] else ("manual", row["title"], row["created_at"])
        by_key = {key(row): row for row in existing}
        used = {row["id"] for row in existing}
        next_id = max([0] + list(used) + [row["id"] for row in rows]) + 1
        inserted = skipped = 0
        for row in rows:
            previous = by_key.get(key(row))
            if previous is not None:
                skipped += 1
                if {k: v for k, v in previous.items() if k != "id"} != {k: v for k, v in row.items() if k != "id"}:
                    report["conflicts"].append({"table": "incidents", "source_id": row["id"], "target_id": previous["id"], "resolution": "kept_target"})
                continue
            source_id = row["id"]
            if row["id"] in used:
                row["id"] = next_id
                next_id += 1
                report["conflicts"].append({"table": "incidents", "source_id": source_id, "target_id": row["id"], "resolution": "assigned_new_id"})
            columns = list(row)
            if any(not name.replace("_", "").isalnum() for name in columns):
                raise ValueError("Unexpected source columns")
            connection.execute(f"INSERT INTO incidents ({','.join(columns)}) VALUES ({','.join('?' for _ in columns)})", list(row.values()))
            used.add(row["id"])
            by_key[key(row)] = row
            inserted += 1
        assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        report["incidents"] = {"source": len(rows), "inserted": inserted, "skipped": skipped, "total": connection.execute("SELECT count(*) FROM incidents").fetchone()[0]}

    table = database.setdefault("suppliers", {})
    def supplier_key(row):
        return (row["name"].strip().casefold(), row["country"].strip().casefold())
    by_key = {supplier_key(row): (doc_id, row) for doc_id, row in table.items()}
    next_id = max([0] + [int(value) for value in table] + [int(value) for value in suppliers]) + 1
    inserted = skipped = 0
    for doc_id, row in suppliers.items():
        previous = by_key.get(supplier_key(row))
        if previous:
            skipped += 1
            if previous[1] != row:
                report["conflicts"].append({"table": "suppliers", "source_id": doc_id, "target_id": previous[0], "resolution": "kept_target"})
            continue
        new_id = doc_id
        if new_id in table:
            new_id = str(next_id)
            next_id += 1
            report["conflicts"].append({"table": "suppliers", "source_id": doc_id, "target_id": new_id, "resolution": "assigned_new_id"})
        table[new_id] = row
        by_key[supplier_key(row)] = (new_id, row)
        inserted += 1
    descriptor, temporary = tempfile.mkstemp(dir=target, prefix="suppliers-", suffix=".json")
    try:
        with os.fdopen(descriptor, "w", encoding="utf-8") as stream:
            json.dump(database, stream, ensure_ascii=False, indent=2)
            stream.flush()
            os.fsync(stream.fileno())
        if path.exists():
            os.chmod(temporary, path.stat().st_mode & 0o777)
        os.replace(temporary, path)
    finally:
        Path(temporary).unlink(missing_ok=True)
    report["suppliers"] = {"source": len(suppliers), "inserted": inserted, "skipped": skipped, "total": len(table)}
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, required=True)
    parser.add_argument("--target", type=Path, required=True)
    args = parser.parse_args()
    if args.source.resolve() == args.target.resolve():
        parser.error("Source and target must be different directories")
    print(json.dumps(restore(args.source, args.target), ensure_ascii=False))
