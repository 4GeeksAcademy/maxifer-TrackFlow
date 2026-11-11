#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Invoked over SSH. The short-lived GHCR token is read from stdin.
APP_DIR=${1:?Application directory required}
COMMIT=${2:?Commit required}
IMAGE_PREFIX=${3:?GHCR image prefix required}
REGISTRY_USER=${4:?Registry user required}
MODE=${5:-deploy}
[[ "$MODE" == deploy || "$MODE" == --dry-run || "$MODE" == --retention-dry-run ]] || exit 2
[[ "$APP_DIR" =~ ^/[a-zA-Z0-9_./-]+$ && "$APP_DIR" != / ]] || exit 2
[[ "$COMMIT" =~ ^[a-f0-9]{40}$ ]] || exit 2
[[ "$IMAGE_PREFIX" =~ ^ghcr\.io/[a-z0-9_.-]+/[a-z0-9_.-]+$ ]] || exit 2
APP_DIR=$(realpath "$APP_DIR")
RELEASE="$APP_DIR/releases/$COMMIT"
COMPOSE_FILE="$RELEASE/docker-compose.prod.yml"
[[ -f "$APP_DIR/.env" && -f "$APP_DIR/docker-compose.prod.yml" && -f "$RELEASE/release.json" ]] || exit 2
exec 9>"$APP_DIR/.deploy.lock"
flock -n 9 || { echo 'Another deployment is running'; exit 1; }

# Kept inline because CI copies deploy.sh as a standalone release artifact.
# Never expire backups here: their image references are permanent pins.
retention() {
    python3 - "$APP_DIR" "$IMAGE_PREFIX" "$1" "$COMMIT" <<'RETENTION_PY'
import json, pathlib, re, subprocess, sys
root, prefix, mode, commit = pathlib.Path(sys.argv[1]), *sys.argv[2:]
services = {'landing', 'uis', 'services', 'qdrant'}
def docker(*args):
    return subprocess.check_output(['docker', *args], text=True, stderr=subprocess.DEVNULL)
def inspect(ref):
    return json.loads(docker('image', 'inspect', ref))[0]['Id']
def containers():
    ids = docker('ps', '-aq').split()
    return json.loads(docker('inspect', *ids)) if ids else []
all_containers = containers()
active = {}
for item in all_containers:
    labels = item['Config'].get('Labels') or {}
    if labels.get('com.docker.compose.project') == 'trackflow-prod':
        service = labels.get('com.docker.compose.service')
        assert service in services and service not in active, 'Unexpected/duplicate service'
        assert item['State']['Status'] == 'running' and item['State'].get('Health', {}).get('Status') == 'healthy', 'Unhealthy service'
        active[service] = item['Image']
assert set(active) == services, 'Four healthy services required'
history = root / 'retention-history.json'
records = json.loads(history.read_text()) if history.exists() else []
if mode == 'record':
    records.append({'commit': commit, 'images': active})
    temporary = history.with_suffix('.tmp')
    temporary.write_text(json.dumps(records, indent=2) + '\n')
    temporary.replace(history)
    sys.exit(0)
# Distinct complete versions, not tags or deployment attempts.
versions = [active]
for record in reversed(records):
    images = record['images']
    assert set(images) == services, 'Incomplete retention record'
    if images not in versions:
        versions.append(images)
    if len(versions) == 3:
        break
if len(versions) < 3:
    print('Retention skipped: need active plus two distinct verified versions')
    sys.exit(0)
protected = {c['Image'] for c in all_containers}
for version in versions:
    for image in version.values():
        protected.add(inspect(image))  # Missing retained images stop deletion.
ids = docker('image', 'ls', '-aq', '--no-trunc').split()
images = json.loads(docker('image', 'inspect', *sorted(set(ids)))) if ids else []
by_ref = {tag: image['Id'] for image in images for tag in (image.get('RepoTags') or [])}
pins = set()
for file in (root / 'backups').glob('*/rollback-images.yml'):
    content = file.read_text()
    refs = re.findall(r'^\s+image:\s*(\S+)\s*$', content, re.M)
    assert len(refs) >= 3 and all(re.fullmatch(r'[a-zA-Z0-9_./:@-]+', r) for r in refs), 'Unrecognized rollback file'
    pins.update(r if ':' in r.rsplit('/', 1)[-1] else r + ':latest' for r in refs)
# Preserve maintenance originals, compact fixes and all aliases sharing their IDs.
pins.update(tag for tag in by_ref if tag.startswith('trackflow-uis:'))
for file in (root / 'maintenance').glob('*/state.json'):
    state = json.loads(file.read_text())
    for key in ('image', 'rollback'):
        ref = state.get(key)
        if ref:
            assert isinstance(ref, str) and re.fullmatch(r'[a-zA-Z0-9_./:@-]+', ref), 'Invalid maintenance image'
            pins.add(ref if ':' in ref.rsplit('/', 1)[-1] else ref + ':latest')
for ref in pins:
    if ref in by_ref:
        protected.add(by_ref[ref])
    elif ref.startswith('sha256:'):
        protected.add(inspect(ref))
    else:
        print('Historical rollback image already missing:', ref)
candidate_pattern = re.compile(re.escape(prefix) + r'/(landing|uis|services):[a-f0-9]{40}$')
plan = sorted((ref, image) for ref, image in by_ref.items()
              if candidate_pattern.fullmatch(ref) and image not in protected)
print(json.dumps({'mode': mode, 'retained_versions': versions, 'remove_references': [r for r, _ in plan]}, sort_keys=True))
# No forced removal, no prune, no size sum: layers and tags may be shared.
if mode == 'apply':
    for ref, expected in plan:
        assert inspect(ref) == expected, 'Image changed after planning'
        assert expected not in {c['Image'] for c in containers()}, 'Image now used'
        docker('image', 'rm', ref)
RETENTION_PY
}

MIN_FREE_BYTES=${TRACKFLOW_MIN_FREE_BYTES:-2147483648}
[[ "$MIN_FREE_BYTES" =~ ^[0-9]{1,15}$ ]] && (( MIN_FREE_BYTES >= 2147483648 )) || exit 2
check_space() {
    local free_bytes
    free_bytes=$(df -PB1 "$APP_DIR" | awk 'NR==2 {print $4}')
    echo "Available disk bytes: $free_bytes; required: $MIN_FREE_BYTES"
    (( free_bytes >= MIN_FREE_BYTES )) || { echo 'Insufficient free disk space'; return 1; }
}
if [[ "$MODE" == --retention-dry-run ]]; then
    retention dry-run
    exit 0
fi
check_space
if [[ "$MODE" == --dry-run ]]; then
    echo "Simulation: validate/pull $COMMIT, verify services and RAG, then retain active + two verified versions and rollback pins. No deployment performed."
    exit 0
fi

compose() {
    docker compose --ansi never --project-directory "$APP_DIR" --env-file "$APP_DIR/.env" \
        --project-name trackflow-prod -f "$COMPOSE_FILE" "$@"
}

DOCKER_CONFIG=$(mktemp -d)
export DOCKER_CONFIG
ROLLBACK_NEEDED=0
RAG_ACTIVATION_STARTED=0
RAG_JOB="trackflow-rag-$COMMIT"
BACKUP=""
cleanup() {
    docker rm -f "$RAG_JOB" >/dev/null 2>&1 || true
    rm -rf -- "$DOCKER_CONFIG"
}
rag() {
    timeout --signal=TERM --kill-after=5 180 docker compose --ansi never \
        --project-directory "$APP_DIR" --env-file "$APP_DIR/.env" \
        --project-name trackflow-prod -f "$RELEASE/docker-compose.prod.yml" \
        run --rm --no-deps -T --name "$RAG_JOB" services \
        python -m data.pipelines.production_rag "$@"
}
rollback() {
    local status=$?
    trap - ERR HUP INT TERM
    set +e
    if [[ "$ROLLBACK_NEEDED" == 1 ]]; then
        echo 'Deployment failed; restoring previous container images.'
        if [[ "$RAG_ACTIVATION_STARTED" == 1 ]]; then
            compose stop services
            docker rm -f "$RAG_JOB" >/dev/null 2>&1 || true
            if ! rag restore --state-b64 "$RAG_STATE"; then
                echo "Alias rollback failed; API remains stopped. Recovery files: $BACKUP" >&2
                exit 1
            fi
        fi
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
python3 -c 'import json,sys; assert json.load(open(sys.argv[1]))["active_user_available"], "An existing active user is required for RAG verification"' "$BACKUP/before.json"

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
for key in ["LITELLM_API_BASE", "LITELLM_API_KEY", "RAG_EMBEDDING_MODEL", "RAG_LLM_MODEL"]:
    assert str(api["environment"].get(key, "")).strip(), "Missing required RAG variable: " + key
assert api["environment"]["QDRANT_URL"] == "http://qdrant:6333"
assert api["environment"]["RAG_COLLECTION_NAME"] == "trackflow_knowledge_prod"
assert not config["services"]["qdrant"].get("ports"), "Qdrant must remain private"
assert config["volumes"]["qdrant_data"]["name"] == "trackflow-prod_qdrant_data"
ui=config["services"]["uis"]["environment"]
assert ui["BACKEND_INTERNAL_URL"] == "http://services:8000"
assert (ui.get("NEXT_PUBLIC_API_URL") or "") == manifest["public_api_url"], "NEXT_PUBLIC_API_URL differs between build and VPS"
' "$RELEASE/release.json" "$COMMIT"
compose pull
check_space
rag check
compose up -d --no-build --pull never --wait --wait-timeout 180 qdrant
echo 'Preparing production RAG index (maximum 180 seconds).'
rag prepare > "$BACKUP/rag.json"
RAG_STATE=$(base64 -w0 "$BACKUP/rag.json")
cat "$BACKUP/rag.json"

# A short API pause gives TinyDB and SQLite a consistent on-disk backup.
ROLLBACK_NEEDED=1
compose stop services
docker run --rm --user 0 --network none -v trackflow-prod_api_data:/data:ro \
    -v "$BACKUP:/backup" "$PREVIOUS_API_IMAGE" python -c \
    "import shutil; shutil.copytree('/data', '/backup/data')"
RAG_ACTIVATION_STARTED=1
rag activate --state-b64 "$RAG_STATE"
compose up -d --no-build --pull never --wait --wait-timeout 180
BASELINE=$(base64 -w0 "$BACKUP/before.json")
compose exec -T services python - --baseline-b64 "$BASELINE" --rag < "$RELEASE/verify_deployment.py" > "$BACKUP/verification.json"
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
# Failure to record/clean retention must not roll back a healthy deployment.
# Record only after all health, data preservation and RAG checks have passed.
if retention record; then
    retention apply || echo 'Retention failed safely; inspect inventory before retrying' >&2
else
    echo 'Retention history not recorded; image cleanup skipped' >&2
fi
