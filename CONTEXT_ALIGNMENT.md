# Zamio Context Alignment Summary

## Platform Mission & Stakeholders
- Zamio delivers end-to-end royalty management for Ghanaian and international repertoires, covering artist onboarding, monitoring, royalty distribution, publisher administration, station compliance, and reciprocal PRO partnerships.【F:.kiro/steering/product.md†L1-L17】

## Architecture Snapshot
- Backend: Django 5.1+ with DRF, PostgreSQL, Redis, Celery, local fingerprinting via librosa/ffmpeg, JWT auth, Daphne ASGI.【F:.kiro/steering/tech.md†L1-L19】
- React frontends (artist, admin, publisher, stations) share React 18 + Vite + Tailwind stack with Axios, React Router, Chakra UI, and charting libraries.【F:.kiro/steering/tech.md†L21-L34】
- Flutter mobile app handles continuous station-side capture (flutter_sound, foreground tasks) with HTTP integration to backend.【F:.kiro/steering/tech.md†L36-L43】
- Local environment orchestrated via Docker Compose exposing backend (9001), DB (9003), Redis (9004), and React apps (9002, 9005-9007).【F:.kiro/steering/tech.md†L45-L52】

## Repository Focus Areas
- **Backend (`zamio_backend`)**: Roadmap prioritizes stabilizing fingerprint/match pipeline, Celery-driven stream monitoring, ledgered royalty postings, dispute workflow, analytics, withdrawals, and production hardening.【F:zamio_backend/backend_overview_plan.md†L1-L126】
- **Artist Frontend (`zamio_frontend`)**: Plan centers on auth/onboarding, profile+KYC, uploads/fingerprinting, analytics, royalties & payouts, notifications, legal, support, plus API alignment gaps (wallet sources naming, GH currency formatting, dynamic analytics).【F:zamio_frontend/zamio_frontend_plan.md†L1-L128】
- **Admin Dashboard (`zamio_admin`)**: Oversees partners, repertoire ingestion, QA, tariffs/cycles, exports, monitoring, and compliance with strong role-based security and audit trails.【F:zamio_admin/zamio_admin_overview.md†L1-L25】
- **Publisher & Station Portals**: Checklists mirror publisher onboarding/distribution oversight and station log submission/compliance tracking (see respective README/checklist docs for task detail).【F:zamio_publisher/publishers_frontend_plan.md†L1-L40】【F:zamio_stations/stations_frontend_plan.md†L1-L76】
- **Mobile App (`zamio_app`)**: Flutter checklists highlight capture workflows, offline resilience, authentication, and coordination with monitoring backend.【F:zamio_app/zamio_app_overview.md†L1-L72】

## Experience & UI Requirements
- UI spec mandates consistent dark/light theming, meaningful iconography, holistic admin/publisher/station workflows, hybrid detection with ACRCloud fallback, analytics depth, dispute tooling, and PRO-grade royalty flows.【F:.kiro/specs/platform-ui-improvements/requirements.md†L1-L200】

## Testing Assets
- `_TestingGuide/` houses end-to-end, API, role-based portal, and mobile testing charters with status indicators and sequencing guidance for QA execution.【F:_TestingGuide/README.md†L1-L60】

## Deployment Expectations
- Coolify production spec requires multi-stage builds, environment-driven configuration, resilient service networking, hardened security defaults, observability hooks, automation, and preserving Docker Compose for local development.【F:.kiro/specs/coolify-production-deployment/requirements.md†L1-L120】
- Backend README already documents Dockerized local setup, key commands, and deployment checklists to expand for production readiness.【F:zamio_backend/README.md†L1-L76】

## Immediate Observations & Next Steps
- Establish shared theme tokens/components across React apps before iterating on dark/light fixes to satisfy UI spec baseline.
- Prioritize documenting existing API coverage and aligning frontends to live endpoints (wallet sources naming, analytics data) while reviewing security-sensitive flows (auth, withdrawals, dispute actions).
- Prepare Coolify-ready Dockerfiles and env templates after auditing current configs against production requirements.
- Use `_TestingGuide` structure to seed `.SuperTest/` manual charters once feature reviews complete.
