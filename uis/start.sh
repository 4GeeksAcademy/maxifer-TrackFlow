#!/bin/sh
set -eu

# Tini forwards signals to the process group, including npm's Next.js children.
# BusyBox wait -n exits as soon as either app stops; stop the sibling as well.
stop() {
    trap - INT TERM
    kill "$backoffice_pid" "$talent_pid" 2>/dev/null || true
    wait "$backoffice_pid" "$talent_pid" 2>/dev/null || true
}

if [ "${1:-development}" = "production" ]; then
    npm --prefix /app/uis/backoffice run start -- --hostname 0.0.0.0 --port 3001 &
    backoffice_pid=$!
    npm --prefix /app/uis/backoffice/talent-pipeline-tracker run start -- --hostname 0.0.0.0 --port 3002 &
    talent_pid=$!
else
    # Webpack supports WATCHPACK_POLLING on Docker Desktop bind mounts.
    npm --prefix /app/uis/backoffice run dev -- --webpack --hostname 0.0.0.0 --port 3001 &
    backoffice_pid=$!
    npm --prefix /app/uis/backoffice/talent-pipeline-tracker run dev -- --webpack --hostname 0.0.0.0 --port 3002 &
    talent_pid=$!
fi

trap 'stop; exit 143' TERM
trap 'stop; exit 130' INT
status=0
wait -n "$backoffice_pid" "$talent_pid" || status=$?
stop
# An unexpectedly stopped server must not leave a partially working container.
[ "$status" -ne 0 ] || status=1
exit "$status"
