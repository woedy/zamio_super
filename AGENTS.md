# AGENTS Overview

## Mission & Context
- **Royalty Platform Goal** Zamio is building a royalty management platform for Ghanaian artists while providing reciprocal royalty collection for international PROs, blending PRO administration (ASCAP/BMI-style) with fingerprinting and usage attribution (BMAT-style).
- **Primary Stakeholders** Ghanaian artists, partner stations, publishers/PROs (local and international), and internal Zamio operations teams.
- **Core Capabilities** Rights management, music usage monitoring, royalty calculation/distribution, reciprocal reporting, and payout workflows.

## Repository Topography
- **Monorepo Layout** Root `package.json` defines workspaces for React SPAs (`zamio_frontend/`, `zamio_admin/`, `zamio_stations/`, `zamio_publisher/`) plus the shared UI kit in `packages/ui/` and a Flutter mobile client in `zamio_app/`.
- **Backend** `zamio_backend/` is a Django 5 project using DRF, Channels, Celery, Redis, and Postgres. Domain apps include `royalties/`, `music_monitor/`, `stations/`, `artists/`, `publishers/`, etc.
- **Infrastructure** Docker configs (`docker-compose.local.yml`, `docker-compose.coolify.yml`, per-service Dockerfiles) support local and Coolify deployments. Environment templates live in `.env.example` files.

## Domain Highlights
- **Async & Messaging** Celery workers with Redis broker/backends power royalty calculations, capture ingestion, and scheduled tasks; Django Channels websockets broadcast live monitoring state where applicable.
- **PRO Partnerships** `royalties.PartnerPRO`, `ReciprocalAgreement`, and related models track local/international PRO integrations, reporting standards, and admin fees.
- **Usage & Detection** `music_monitor.AudioDetection` and `PlayLog` capture fingerprinting results, confidence scores, and station metadata for attribution.
- **Royalty Accounting** `RoyaltyCycle`, `RoyaltyLineItem`, `PartnerRemittance`, and `RoyaltyDistribution` orchestrate calculations, statements, and payments (including currency exchange via `CurrencyExchangeRate`).
- **Financial Controls** `RoyaltyWithdrawal` enforces authority validation for artists, publishers, and admins requesting payouts.

## Frontend Surfaces
- **React SPAs** Each SPA (admin, station, publisher, frontend) uses Vite + React 18 + Tailwind, and consumes shared components from `packages/ui/src/`.
- **Flutter Capture App** `zamio_app/` serves broadcast stations lacking stream endpoints. It authenticates station operators, runs continuous/interval microphone capture via `OfflineCaptureService`, queues AAC chunks locally with storage safeguards, and pushes them to backend upload endpoints for fingerprinting.

## Integration Approach
- **Phased Delivery** Follow the sequence defined in `implementation.md`: Authentication → Onboarding → Dashboard → In-App Activities.
- **API Standards** Implement REST endpoints under `/api/v1/` with clear serializers, JWT auth, pagination, and error handling aligned to DRF conventions.
- **Auth Endpoints** Use `POST /api/auth/token/` + `/api/auth/token/refresh/` for SimpleJWT access/refresh flow while legacy role logins (`POST /api/accounts/login-artist/`, `login-station/`, `login-admin/`) remain for device-specific tokens.
- **Auth Configuration** Keep `.env.example`, `docker-compose.coolify.yml`, and deployment secrets aligned: default `CORS_ALLOW_ALL_ORIGINS=False`, populate `CORS_ALLOWED_ORIGINS` with the SPA hosts (5173-5176 locally), and ensure each Vite app points `VITE_API_URL` at the deployed backend.
- **Data Contract Source of Truth** Keep schema definitions, payload examples, and acceptance criteria synchronized with `implementation.md` and update both docs when requirements shift.

## Agent Guidance
- **Documentation Discipline** Update `AGENTS.md` and `implementation.md` whenever new domain insights or scope changes emerge; treat them as canonical references.
- **Frontend Contract Source** The latest artist onboarding UI screens are the source of truth for data requirements—do not alter their layout or visual design without explicit stakeholder approval. Align backend contracts and models to the existing UI instead.
- **Tooling Expectations** Use Docker for end-to-end verification, DRF tests/pytest for backend validation, and Vite/Flutter dev servers for UI checks.
- **Collaboration Notes** Coordinate feature branches around the phased plan, merging only when corresponding checkboxes in `implementation.md` are satisfied.
- **Demo Readiness** Ensure each phase remains demoable: seed data/scripts should accompany backend endpoints, and UI should have guarded states for missing data.
