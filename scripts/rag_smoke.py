"""Production-container smoke with real Qdrant and a synthetic model gateway.

Requires the three production images in LANDING_IMAGE, UIS_IMAGE and API_IMAGE.
All storage and configuration belong to a unique disposable Compose project.
"""
import json
import os
from pathlib import Path
import secrets
import subprocess
import tempfile
import uuid


ROOT = Path(__file__).resolve().parents[1]
SMOKE_USER_EMAIL = "smoke@example.com"


def main():
    project = "trackflow-rag-ci-" + uuid.uuid4().hex[:12]
    with tempfile.TemporaryDirectory(prefix="trackflow-rag-smoke-") as directory:
        temporary = Path(directory)
        env_file = temporary / "smoke.env"
        values = {
            "JWT_SECRET": secrets.token_urlsafe(48),
            "DATABASE_URL": "sqlite:////app/services/api/data/inventory.sqlite3",
            "DEMO_DATA_ENABLED": "false", "BACKEND_INTERNAL_URL": "http://services:8000",
            "NEXT_PUBLIC_API_URL": os.environ.get("PUBLIC_API_URL", ""),
            "LANDING_PORT": "3000", "BACKOFFICE_PORT": "3001", "TALENT_PORT": "3002",
            "LITELLM_API_BASE": "http://rag-gateway:8090", "LITELLM_API_KEY": "synthetic-key",
            "RAG_EMBEDDING_MODEL": "synthetic-embedding", "RAG_LLM_MODEL": "synthetic-chat",
        }
        # Host ports are removed below; no collision with local applications.
        env_file.write_text("".join(f"{key}={value}\n" for key, value in values.items()))
        override = temporary / "override.yml"
        override.write_text("""services:
  landing:
    ports: !reset []
  uis:
    ports: !reset []
  rag-gateway:
    image: ${API_IMAGE:-trackflow-prod-services:latest}
    entrypoint: ["python", "/mock.py"]
    volumes:
      - """ + json.dumps(str(ROOT / "scripts/rag_mock_gateway.py").replace("\\", "/") + ":/mock.py:ro") + """
    networks: [trackflow]
networks:
  trackflow:
    name: """ + project + "\n")
        env = os.environ | {"TRACKFLOW_ENV_FILE": str(env_file)}
        compose = ["docker", "compose", "--project-directory", str(ROOT), "--env-file", str(env_file),
                   "-p", project, "-f", str(ROOT / "docker-compose.prod.yml"), "-f", str(override)]

        def run(*args, capture=False, input=None):
            return subprocess.run(compose + list(args), env=env, check=True, text=True, encoding="utf-8",
                                  input=input, stdout=subprocess.PIPE if capture else None)

        def rag(*args):
            result = run("exec", "-T", "services", "python", "-m", "data.pipelines.production_rag",
                         *args, capture=True)
            return json.loads(result.stdout)

        try:
            run("pull", "qdrant")
            run("up", "-d", "--no-build", "--pull", "never", "--wait", "--wait-timeout", "180")
            run("exec", "-T", "services", "python", "-c",
                "from services.api.user_service import create_user_with_profile; "
                f"create_user_with_profile({SMOKE_USER_EMAIL!r}, 'unused-synthetic-hash')")
            first = rag("prepare")
            import base64
            state = base64.b64encode(json.dumps(first).encode()).decode()
            rag("activate", "--state-b64", state)
            second = rag("prepare")
            assert second["reused"] and first["candidate"] == second["candidate"]
            verifier = (ROOT / "scripts/verify_deployment.py").read_text(encoding="utf-8")
            run("exec", "-T", "services", "python", "-", "--rag", input=verifier)
            run("restart", "qdrant")
            run("up", "-d", "--no-build", "--pull", "never", "--wait", "--wait-timeout", "180")
            assert rag("prepare")["candidate"] == first["candidate"]
            run("exec", "-T", "services", "python", "-", "--rag", input=verifier)
        except BaseException:
            run("logs", "--tail", "60")
            raise
        finally:
            # This project name is generated here; it cannot target production volumes.
            run("down", "-v", "--remove-orphans")


if __name__ == "__main__":
    main()
