import io
import os
import tempfile
import unittest
from contextlib import redirect_stderr
from pathlib import Path

from scripts import analyze
from scripts import seed_incidents


class ScriptErrorHandlingTests(unittest.TestCase):
    def test_analyze_exits_with_error_for_missing_csv(self):
        missing_path = Path(tempfile.gettempdir()) / "trackflow_missing.csv"
        if missing_path.exists():
            missing_path.unlink()

        stderr = io.StringIO()
        with redirect_stderr(stderr):
            with self.assertRaises(SystemExit) as exc:
                analyze.main([str(missing_path)])

        self.assertEqual(exc.exception.code, 1)
        self.assertIn("No se pudo leer", stderr.getvalue())

    def test_seed_exits_with_error_for_missing_csv(self):
        missing_path = Path(tempfile.gettempdir()) / "trackflow_seed_missing.csv"
        if missing_path.exists():
            missing_path.unlink()

        stderr = io.StringIO()
        with redirect_stderr(stderr):
            with self.assertRaises(SystemExit) as exc:
                seed_incidents.seed(str(missing_path))

        self.assertEqual(exc.exception.code, 1)
        self.assertIn("No se pudo abrir", stderr.getvalue())


if __name__ == "__main__":
    unittest.main()
