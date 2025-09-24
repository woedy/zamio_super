# Coolify Production Deployment Guide

This guide summarizes how to deploy the Zamio platform on [Coolify](https://coolify.io) using the production-focused Dockerfiles that live alongside each service. The goal is to keep local Docker workflows untouched while giving Coolify a clean, reproducible build.

## 1. Infrastructure dependencies

Create the following resources inside your Coolify stack (or attach existing managed services):

| Purpose            | Coolify resource type | Notes |
| ------------------ | --------------------- | ----- |
| PostgreSQL         | Database              | PostgreSQL 15+, automatic backups recommended. |
| Redis              | Database              | Redis 7+ for Celery broker & cache. |
| Object storage/CDN | External              | Optional but recommended for long-term static/media assets. Local volume works initially. |
| Shared network     | Private network       | Attach every container below so internal DNS works (e.g. `zamio-network`). |

Record connection URLs; you will reference them in environment variables (`DATABASE_URL`, `REDIS_URL`, etc.).

## 2. Application containers

Each project now ships with a production-ready Dockerfile placed beside the source. Point Coolify at the repository, choose the corresponding subdirectory as *workdir*, and set `Dockerfile.coolify` as the build file.

| Service | Repository path | Dockerfile | Internal port | Default role |
| ------- | ---------------- | ---------- | ------------- | ------------ |
| Django API | `zamio_backend/` | `Dockerfile.coolify` | `8000` | `web` (Gunicorn) |
| Celery Worker | `zamio_backend/` | `Dockerfile.coolify` | n/a (background) | set `SERVICE_ROLE=worker` |
| Celery Beat | `zamio_backend/` | `Dockerfile.coolify` | n/a | set `SERVICE_ROLE=beat` |
| Artist Web | `zamio_frontend/` | `Dockerfile.coolify` | `8080` | static SPA |
| Admin Web | `zamio_admin/` | `Dockerfile.coolify` | `8080` | static SPA |
| Publisher Web | `zamio_publisher/` | `Dockerfile.coolify` | `8080` | static SPA |
| Stations Web | `zamio_stations/` | `Dockerfile.coolify` | `8080` | static SPA |

> **Tip:** If you host additional React experiences, reuse the same pattern: Vite build inside Node, static assets served via Nginx with an `/healthz` endpoint.

## 3. Environment variables

### Backend & Celery services

Use `zamio_backend/env.coolify.example` as the template. At minimum provide:

- `SECRET_KEY`
- `DATABASE_URL` (and optional `DATABASE_READ_URL`)
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `REDIS_URL`
- `BASE_URL` (external https URL)
- Email credentials (if production mail should send)
- Third-party integrations referenced in settings (ACRCloud, PRO configuration, etc.)
- `SERVICE_ROLE` (`web`, `worker`, or `beat` per container)

The entrypoint automatically waits for PostgreSQL, applies migrations, collects static files (for the web role), and launches the appropriate process.

### React frontends

During build, pass the required `VITE_*` variables (for example `VITE_API_URL`, analytics keys, etc.). Coolify lets you mark build-time variables by toggling the *build* scope.

## 4. Coolify configuration steps

1. **Create a project** (or reuse an existing one) and attach your Git repository.
2. **Add the databases** (Postgres & Redis) and note the URLs / credentials Coolify generates.
3. **Add the Django API application**
   - Repository path: `/zamio_backend`
   - Dockerfile: `Dockerfile.coolify`
   - Build command: *(leave blank, Dockerfile handles it)*
   - Environment variables: paste from `env.coolify.example`, set `SERVICE_ROLE=web`, `PORT=8000` (default) and map `DATABASE_URL`, `REDIS_URL`, etc.
   - Expose port `8000` and attach to your private network.
4. **Duplicate the application** twice for background workers**
   - Same repository and Dockerfile.
   - Set `SERVICE_ROLE=worker` (command stays default) and `SERVICE_ROLE=beat` respectively.
   - Override container names (e.g. `zamio-celery-worker`, `zamio-celery-beat`).
5. **Add each React frontend**
   - Repository paths: `/zamio_frontend`, `/zamio_admin`, `/zamio_publisher`, `/zamio_stations`.
   - Dockerfile: `Dockerfile.coolify` in each directory.
   - Expose internal port `8080` and configure domain/routes.
   - Provide `VITE_API_URL` pointing at the external API host (e.g. `https://api.zamio.com`).
6. **Configure routing / domains**
   - Map each Coolify application to the correct domain or subdomain (e.g. `app.zamio.com`, `admin.zamio.com`, `publisher.zamio.com`, etc.).
   - Enable HTTPS via Coolify’s automatic certificates.
7. **Provision persistent volumes** (optional but recommended)
   - Attach a volume to the Django container at `/app/static_cdn` and `/app/media` for user uploads & collected assets.
   - Alternatively use object storage + `django-storages` in future iterations.
8. **Trigger an initial deployment** and watch the logs.
   - The backend will log database wait attempts, migrations, static collection, then start Gunicorn.
   - React builds output the static asset compilation.
9. **Smoke test**
   - Hit `/healthz` on each frontend and `/api/health/` (or equivalent) on the backend to confirm readiness.

## 5. Optional docker-compose template

For reference (and for local reproduction), `docker-compose.coolify.template.yml` describes how the services fit together using the new images. Adapt it if you prefer to orchestrate everything outside Coolify.

## 6. Ongoing operations

- Rebuild images whenever dependencies change; Coolify caches layers per application.
- Use Coolify’s cron jobs or an external scheduler to run recurring Django commands if needed.
- Monitor Celery queues and worker logs from the Coolify dashboard.
- Plan a follow-up enhancement to push static/media assets to S3 or another CDN for improved scalability.

With these assets in place, the Zamio stack can be deployed on Coolify with reproducible builds and role-specific containers.
