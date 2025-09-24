#!/bin/bash
set -euo pipefail

log() {
    echo "$(date --utc +"%Y-%m-%dT%H:%M:%SZ") | $1" >&2
}

wait_for_postgres() {
    if [[ -z "${DATABASE_URL:-}" ]]; then
        log "DATABASE_URL not set; skipping PostgreSQL wait."
        return 0
    fi

    log "Waiting for PostgreSQL to accept connections..."
    python <<'PY'
import os
import time
from urllib.parse import urlparse

import psycopg2

url = os.environ["DATABASE_URL"]
parsed = urlparse(url)
conn_kwargs = {
    "dbname": (parsed.path or "/").lstrip("/"),
    "user": parsed.username,
    "password": parsed.password,
    "host": parsed.hostname or "localhost",
    "port": parsed.port or 5432,
}

max_attempts = int(os.environ.get("DB_WAIT_ATTEMPTS", "30"))
delay = int(os.environ.get("DB_WAIT_DELAY", "2"))

for attempt in range(1, max_attempts + 1):
    try:
        with psycopg2.connect(**conn_kwargs):
            print("PostgreSQL connection established.")
            break
    except Exception as exc:
        if attempt == max_attempts:
            raise
        print(f"Attempt {attempt} failed: {exc}. Retrying in {delay}s...", flush=True)
        time.sleep(delay)
PY
}

collect_static() {
    log "Collecting static files..."
    python manage.py collectstatic --noinput
}

apply_migrations() {
    log "Applying database migrations..."
    python manage.py migrate --noinput
}

run_checks() {
    if [[ "${DJANGO_RUN_CHECKS:-true}" == "true" ]]; then
        log "Running Django system checks..."
        python manage.py check --deploy --fail-level=WARNING || log "Django checks reported warnings."
    fi
}

ROLE=${SERVICE_ROLE:-web}

wait_for_postgres

case "$ROLE" in
    web)
        apply_migrations
        collect_static
        run_checks
        log "Starting Gunicorn application server..."
        exec "$@"
        ;;
    worker)
        log "Starting Celery worker..."
        exec celery -A core worker -l INFO --concurrency="${CELERY_WORKER_CONCURRENCY:-4}" --max-tasks-per-child="${CELERY_MAX_TASKS_PER_CHILD:-1000}"
        ;;
    beat)
        log "Starting Celery beat scheduler..."
        exec celery -A core beat -l INFO --scheduler=django_celery_beat.schedulers:DatabaseScheduler
        ;;
    *)
        log "Unknown SERVICE_ROLE '$ROLE'; executing provided command."
        exec "$@"
        ;;
esac
