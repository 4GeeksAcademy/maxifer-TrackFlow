#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Invoked over SSH. The short-lived GHCR token is read from stdin.
APP_DIR=${1:?Application directory required}
COMMIT=${2:?Commit required}
IMAGE_PREFIX=${3:?GHCR image prefix required}
REGISTRY_USER=${4:?Registry user required}
[[ "$APP_DIR" =~ ^/[a-zA-Z0-9_./-]+$ && "$APP_DIR" != / ]] || exit 2
[[ "$COMMIT" =~ ^[a-f0-9]{40}$ ]] || exit 2
[[ "$IMAGE_PREFIX" =~ ^ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+$ ]] || exit 2
APP_DIR=$(realpath "$APP_DIR")
RELEASE="$APP_DIR/releases/$COMMIT"
COMPOSE_FILE="$RELEASE/docker-compose.prod.yml"
[[ -f "$APP_DIR/.env" && -f "$APP_DIR/docker-compose.prod.yml" && -f "$RELEASE/release.json" ]] || exit 2
exec 9>"$APP_DIR/.deploy.lock"
flock -n 9 || { echo 'Another deployment is running'; exit 1; }

compose() {
    docker compose --ansi never --project-directory "$APP_DIR" --env-file "$APP_DIR/.env" \
        --project-name trackflow-prod -f "$COMPOSE_FILE" "$@"
}

DOCKER_CONFIG=$(mktemp -d)
export DOCKER_CONFIG
ROLLBACK_NEEDED=0
BACKUP=""
cleanup() { rm -rf -- "$DOCKER_CONFIG"; }
rollback() {
    local status=$?
    trap - ERR HUP INT TERM
    set +e
    if [[ "$ROLLBACK_NEEDED" == 1 ]]; then
        echo 'Deployment failed; restoring previous container images.'
        cp "$BACKUP/docker-compose.prod.yml" "$APP_DIR/docker-compose.prod.yml"
        COMPOSE_FILE="$BACKUP/docker-compose.prod.yml"
        if compose -f "$BACKUP/rollback-images.yml" up -d --no-build --pull never --wait --wait-timeout 180; then
            echo 'Previous images restored. Persistent data was retained.'
        else
            echo "Automatic rollback failed. Recovery files: $BACKUP" >&2
        fi
    fi
    exit "${status:-1}"
}
trap cleanup EXIT
trap rollback ERR
trap 'false' HUP INT TERM

IFS= read -r REGISTRY_TOKEN || [[ -n "${REGISTRY_TOKEN:-}" ]]
printf '%s' "$REGISTRY_TOKEN" | docker login ghcr.io --username "$REGISTRY_USER" --password-stdin >/dev/null
unset REGISTRY_TOKEN
FREE_BYTES=$(df -PB1 "$APP_DIR" | awk 'NR==2 {print $4}')
(( FREE_BYTES >= 2147483648 )) || { echo 'At least 2 GiB free disk space is required'; exit 1; }
BACKUP="$APP_DIR/backups/deploy-$(date -u +%Y%m%dT%H%M%SZ)-$COMMIT"
mkdir -p "$BACKUP"
chmod 700 "$BACKUP"
cp "$APP_DIR/.env" "$BACKUP/.env"
cp "$APP_DIR/docker-compose.prod.yml" "$BACKUP/docker-compose.prod.yml"
ENV_SHA=$(sha256sum "$APP_DIR/.env" | awk '{print $1}')

# Resolve the deployed legacy configuration before selecting new images.
COMPOSE_FILE="$APP_DIR/docker-compose.prod.yml"
for SERVICE in landing uis services; do
    CONTAINER=$(compose ps --all --quiet "$SERVICE")
    [[ -n "$CONTAINER" ]] || { echo "Existing container missing: $SERVICE"; exit 1; }
    IMAGE_ID=$(docker inspect --format '{{.Image}}' "$CONTAINER")
    TAG="trackflow-rollback-$COMMIT-$(date -u +%s)-$SERVICE"
    docker image tag "$IMAGE_ID" "$TAG"
    printf '  %s:\n    image: %s\n' "$SERVICE" "$TAG" >> "$BACKUP/image-entries.yml"
    [[ "$SERVICE" != services ]] || PREVIOUS_API_IMAGE=$TAG
done
{ printf 'services:\n'; cat "$BACKUP/image-entries.yml"; } > "$BACKUP/rollback-images.yml"
compose exec -T services python - --snapshot < "$RELEASE/verify_deployment.py" > "$BACKUP/before.json"

export LANDING_IMAGE="$IMAGE_PREFIX/landing:$COMMIT"
export UIS_IMAGE="$IMAGE_PREFIX/uis:$COMMIT"
export API_IMAGE="$IMAGE_PREFIX/services:$COMMIT"
COMPOSE_FILE="$RELEASE/docker-compose.prod.yml"
compose config --quiet
compose config --format json | python3 -c '
import json,sys,pathlib
config=json.load(sys.stdin); manifest=json.loads(pathlib.Path(sys.argv[1]).read_text())
assert manifest["commit"] == sys.argv[2]
assert config["volumes"]["api_data"]["name"] == "trackflow-prod_api_data"
api=config["services"]["services"]
assert any(v["type"]=="volume" and v["source"]=="api_data" and v["target"]=="/app/services/api/data" for v in api["volumes"])
assert str(api["environment"]["DEMO_DATA_ENABLED"]).lower()=="false"
ui=config["services"]["uis"]["environment"]
assert ui["BACKEND_INTERNAL_URL"] == "http://services:8000"
assert (ui.get("NEXT_PUBLIC_API_URL") or "") == manifest["public_api_url"], "NEXT_PUBLIC_API_URL differs between build and VPS"
' "$RELEASE/release.json" "$COMMIT"
compose pull

# A short API pause gives TinyDB and SQLite a consistent on-disk backup.
ROLLBACK_NEEDED=1
compose stop services
docker run --rm --user 0 --network none -v trackflow-prod_api_data:/data:ro \
    -v "$BACKUP:/backup" "$PREVIOUS_API_IMAGE" python -c \
    "import shutil; shutil.copytree('/data', '/backup/data')"
compose up -d --no-build --pull never --wait --wait-timeout 180
BASELINE=$(base64 -w0 "$BACKUP/before.json")
compose exec -T services python - --baseline-b64 "$BASELINE" < "$RELEASE/verify_deployment.py" > "$BACKUP/verification.json"
[[ $(sha256sum "$APP_DIR/.env" | awk '{print $1}') == "$ENV_SHA" ]]

# Persist only image references; application secrets stay in the existing .env.
python3 - "$COMPOSE_FILE" "$APP_DIR/.compose-next.yml" "$LANDING_IMAGE" "$UIS_IMAGE" "$API_IMAGE" <<'PY'
import pathlib,sys
content=pathlib.Path(sys.argv[1]).read_text()
for placeholder,image in zip(["${LANDING_IMAGE:-trackflow-prod-landing:latest}","${UIS_IMAGE:-trackflow-prod-uis:latest}","${API_IMAGE:-trackflow-prod-services:latest}"],sys.argv[3:]):
    assert content.count(placeholder)==1
    content=content.replace(placeholder,image)
pathlib.Path(sys.argv[2]).write_text(content)
PY
mv "$APP_DIR/.compose-next.yml" "$APP_DIR/docker-compose.prod.yml"
printf '%s\n' "$COMMIT" > "$APP_DIR/current-release"
ROLLBACK_NEEDED=0
echo "Deployment complete: $COMMIT"
cat "$BACKUP/verification.json"
