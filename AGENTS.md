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
- **Phased Delivery** Follow the sequence defined in `implementation.md`: Authentication → Onboarding → Dashboard → In-App Activities. Treat the completion of email verification as the trigger for immediately launching the onboarding journey in every client.
- **API Standards** Implement REST endpoints under `/api/v1/` with clear serializers, JWT auth, pagination, and error handling aligned to DRF conventions.
- **Auth Endpoints** Use `POST /api/auth/token/` + `/api/auth/token/refresh/` for SimpleJWT access/refresh flow while legacy role logins (`POST /api/accounts/login-artist/`, `login-station/`, `login-admin/`) remain for device-specific tokens.
- **Auth Configuration** Keep `.env.example`, `docker-compose.coolify.yml`, and deployment secrets aligned: default `CORS_ALLOW_ALL_ORIGINS=False`, populate `CORS_ALLOWED_ORIGINS` with the SPA hosts (5173-5176 locally), and ensure each Vite app points `VITE_API_URL` at the deployed backend.
- **Data Contract Source of Truth** Keep schema definitions, payload examples, and acceptance criteria synchronized with `implementation.md` and update both docs when requirements shift. Static frontend UIs across `zamio_frontend/`, `zamio_stations/`, `zamio_publisher/`, and `zamio_admin/` are the canonical reference for data needs; avoid redesigning layouts unless explicitly requested and instead evolve backend models/serializers to satisfy the UI contracts.
- **Onboarding Wiring** When posting onboarding payloads from React, let the browser set multipart boundaries (do not override `Content-Type` when using `FormData`), trim optional strings via the shared sanitizers before sending, and prefer the provided skip helpers for optional steps like social connections. Each successful response should refresh the auth snapshot so the dashboard header/sidebar immediately reflect the artist's stage name.
- **Onboarding Resumption** Preserve the backend-provided `next_step` pointer so artists who skipped payment or other required stages are routed back on the next login. Skipping the publisher step should mark the artist as self-published, while the identity verification step must use `/api/accounts/upload-kyc-documents/` (plus `/api/accounts/skip-verification/` when deferring) before calling the completion endpoint. Legacy login and verification responses now return the serialized onboarding state (progress + stage name) — keep those fields intact so the dashboard chrome can hydrate instantly after auth.

## Agent Guidance
- **Documentation Discipline** Update `AGENTS.md` and `implementation.md` whenever new domain insights or scope changes emerge; treat them as canonical references.
- **Tooling Expectations** Use Docker for end-to-end verification, DRF tests/pytest for backend validation, and Vite/Flutter dev servers for UI checks.
- **Collaboration Notes** Coordinate feature branches around the phased plan, merging only when corresponding checkboxes in `implementation.md` are satisfied.
- **Demo Readiness** Ensure each phase remains demoable: seed data/scripts should accompany backend endpoints, and UI should have guarded states for missing data.
