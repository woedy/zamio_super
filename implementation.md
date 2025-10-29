# Implementation Plan

## Roadmap Overview
- **Backend sequence** B1 Authentication → B2 Onboarding → B3 Dashboards → B4 In-App Activities.
- **Frontend sequence** F1 `zamio_frontend` → F2 `zamio_stations` → F3 `zamio_publisher` → F4 `zamio_admin`.
- **Dependencies** Backend endpoints must stabilize before SPA integrations in the corresponding phase. Capture provisioning (B2) feeds `zamio_app` and later station flows (F2). Async pipelines (Celery/Redis/Channels) underpin dashboards and activities.
- **Verification → Onboarding Hand-off** Treat successful email verification as the immediate hand-off point to onboarding flows. All clients should redirect or surface onboarding steps directly after verification without additional gating.
- **Static UI as Contract** All SPA UIs (front, station, publisher, admin) currently live as static builds and define the data contract we must honor. Backend models, serializers, and business logic may evolve to match UI requirements, while UI layout/structure changes must be explicitly requested before implementation.

## Backend Roadmap

### Phase B1 · Authentication & Access Control
- **Vision** Enable artists, station admins, and internal staff to create accounts, authenticate securely, and access role-appropriate areas.
- **User Stories**
  - B1.1 Artist Registration: As a Ghanaian artist, I can register an account and verify my email so I can access Zamio services.
  - B1.2 Station Admin Login: As a station admin, I can log in and receive JWT tokens for API access.
  - B1.3 Role-Based Access: As an authenticated user, I am routed to the correct SPA/dashboard based on my role (artist, station, admin, publisher).
- **Acceptance Criteria**
  - AB1.1 Existing registration + verification endpoints (`POST /api/accounts/register-artist/`, `POST /api/accounts/verify-artist-email/`) continue to accept artist details, trigger the verification workflow, and persist to `accounts.User`.
  - AB1.2 JWT login endpoint (`POST /api/auth/token/`) issues access + refresh tokens via the custom SimpleJWT serializer while preserving legacy role login endpoints (e.g., `POST /api/accounts/login-artist/`, `login-station/`, `login-admin/`) for device-specific flows.
  - AB1.3 Token refresh endpoint (`POST /api/auth/token/refresh/`) enforces expiration and invalid token handling.
  - AB1.4 Role claims remain embedded in tokens and are documented for frontend guard consumption.
  - AB1.5 Contract/integration tests exercise successful and failure auth scenarios against current endpoints.
  - AB1.6 Frontend auth flows validate inputs, surface API errors, and store tokens securely.
- **Task Checklist**
  - [x] Backend: Audit `accounts/` auth endpoints, update serializers/settings only where contract gaps surface.
  - [x] Backend QA: Refresh pytest/Postman suites validating login/register/refresh flows.
  - [x] Frontend: Build shared auth service wrappers and token storage (per SPA) aligned to existing responses.
  - [x] Frontend: Implement login/registration UI wiring using the preserved endpoints.
  - [x] DevOps: Reconfirm auth env variables/secrets in `.env.example`, `AGENTS.md`, and Coolify configs.
  - [x] Documentation: Capture token/role claim contract for frontend guards and QA references.
  - [x] Tests: Execute automated and manual scenarios (pytest, Postman, Cypress) covering B1 acceptance criteria and user stories.

### Phase B2 · Onboarding & Profile Setup
- **Vision** Guide newly authenticated users through completing artist/station profiles, linking PRO affiliations, and provisioning the station capture app configuration.
- **User Stories**
  - B2.1 Artist Onboarding: As an artist, I can submit bio, repertoire, and PRO affiliation info.
  - B2.2 Station Setup: As a station admin, I can register my station, upload scheduling data, and set royalty reporting preferences.
  - B2.3 Station Capture Provisioning: As a station operator using the `zamio_app` capture client, I can receive credentials, chunking policies, and upload endpoints so the device can stream audio snippets to Zamio.
  - B2.4 Publisher Linkage: As a publisher/PRO partner, I can connect my account to partner profiles for reciprocal reporting.
- **Acceptance Criteria**
  - AB2.1 Existing onboarding APIs (`/api/artists/profile/`, `/api/stations/setup/`) are verified for schema accuracy, validation, and error messaging.
  - AB2.1a Artist onboarding captures profile metadata required by the static UI (primary genre, music style, social links, website, regional context) and returns a structured `profile` + `social_links` payload for the frontend wizard.
  - AB2.2 Upload endpoints accept station schedule CSV/JSON, persist records, and emit processing tasks as currently implemented.
  - AB2.2a Payment preferences persist structured `preferred_method` snapshots (MoMo, bank, international) for reuse across artist profile, payouts, and frontend state rehydration.
  - AB2.2b Publisher onboarding records self-publish decisions and optional publisher metadata so the UI can resume exactly where the artist left off.
  - AB2.3 Station capture provisioning endpoint continues returning tokenized config consumed by `OfflineCaptureService` in `zamio_app` (chunk duration, retry policy, base URL).
  - AB2.4 Frontend forms persist step-by-step, resume progress, and display backend validation messages.
  - AB2.5 Successful onboarding toggles status flags (`is_onboarded`) so dashboards unlock and marks station capture app as ready.
  - AB2.6 Integration tests cover required fields, forbidden transitions, file upload validation, and provisioning payload integrity.
- **Task Checklist**
  - [x] Backend QA: Review serializers/views in `artists/` and `stations/` apps; adjust only if data contract gaps emerge.
  - [x] Backend QA: Execute Postman/pytest flows for artist onboarding, station setup, and provisioning.
  - [x] Backend: Ensure onboarding step tracking always resumes the earliest incomplete stage (payment, publisher, KYC) after login, treat publisher skips as explicit self-publish selections, and expose KYC uploads via `/api/accounts/upload-kyc-documents/`.
  - [x] Backend: Surface the serialized onboarding state (next step, progress, stage name) in verify-email and legacy login responses so every client can resume the wizard and hydrate dashboard chrome immediately after authentication.
  - [x] Backend: Make `/api/accounts/resume-verification/` idempotent and include `verification_status`/`kyc_status` flags in onboarding payloads so the frontend only resumes KYC when the backend indicates it is necessary.
  - [x] Backend: Treat repeated uploads of the same KYC file for an existing document slot as idempotent replacements and allow identical hashes across accounts—the service now logs reuse but never blocks completion so artists avoid duplicate-file validation errors altogether.
  - [x] Backend: Persist the KYC identity profile (full legal name, ISO date of birth, nationality, ID type/number, residential address) via `/api/accounts/update-identity-profile/` and echo it in onboarding status payloads so the frontend wizard can prefill skipped steps.
  - [x] Frontend: Build multi-step onboarding UI with progress saving against existing endpoints.
  - [x] Frontend: Wire the artist onboarding wizard to the live APIs (profile, social skip, payment, publisher, finalization) with sanitized payloads and refresh the auth snapshot so dashboard chrome reflects the saved stage name immediately after completion.
  - [x] Frontend: Persist onboarding progress across sessions, redirect artists back to any skipped step on re-authentication, wire the identity verification step to the KYC upload/skip endpoints, and refresh dashboard chrome with the stored stage name.
  - [x] Frontend: Apply client-side validation for required onboarding inputs (profile essentials, payment method details, publisher consent) before submitting requests to keep the wizard frictionless.
  - [x] Frontend: Implement file upload + validation messaging mapped to backend error structure.
  - [ ] Flutter (`zamio_app`): Confirm provisioning payload compatibility, persist station credentials, and regression-test chunk upload loop against staging backend.
  - [ ] QA: Expand seed data + collections covering onboarding and capture provisioning scenarios.
  - [ ] Tests: Validate onboarding acceptance criteria end-to-end across web + Flutter clients (Cypress, pytest, manual UAT).

### Phase B3 · Dashboards & Insights
- **Vision** Provide real-time visibility into plays, royalties, and compliance for each user role.
- **User Stories**
  - B3.1 Artist Dashboard: As an artist, I see royalty earnings, play counts, and upcoming payments.
  - B3.2 Station Dashboard: As a station admin, I view compliance status, reporting obligations, and usage analytics.
  - B3.3 Admin Overview: As an internal admin, I monitor platform-wide KPIs (royalty cycles, disputes, remittances).
- **Acceptance Criteria**
  - AB3.1 Existing aggregated endpoints return metrics sourced from `music_monitor.PlayLog`, `royalties.RoyaltyDistribution`, `royalties.RoyaltyCycle` with documented field definitions.
  - AB3.2 Role-based filtering continues to ensure users only see relevant data; access policies are validated by tests.
  - AB3.3 Frontend dashboard components render charts/cards with loading, empty, and error states using current payloads.
  - AB3.4 Data refresh strategies (polling or websocket) are documented; initial implementation leverages available Channels topics.
  - AB3.5 Automated tests and monitoring probes verify aggregations and access control rules.
- **Task Checklist**
  - [ ] Backend QA: Catalogue metrics endpoints across `music_monitor/` and `royalties/`; add regression tests where gaps exist.
  - [ ] Backend Ops: Ensure queryset filters/permissions remain aligned with role expectations; patch edge cases only if discovered.
  - [ ] Frontend: Implement dashboard views with shared UI components wired to existing endpoints.
  - [ ] Frontend: Hook charts to API, handling fallback states and websocket subscriptions when available.
  - [ ] QA: Create/demo seed scripts populating sample plays/royalties for consistent dashboards.
  - [ ] Docs: Update `AGENTS.md` with dashboard endpoint references and payload notes.
  - [ ] Tests: Run automated dashboard verification (pytest metrics checks + Cypress visual assertions) against B3 acceptance criteria.

### Phase B4 · In-App Activities & Workflows
- **Vision** Allow users to act on disputes, withdrawals, reporting, and remittances within the platform.
- **User Stories**
  - B4.1 Dispute Resolution: As an operator, I can view, update, and resolve disputes tied to `music_monitor.PlayLog` records.
  - B4.2 Royalty Cycle Management: As finance staff, I can open, lock, and remit royalty cycles.
  - B4.3 Withdrawal Processing: As an artist/publisher, I submit withdrawal requests; admins approve or reject them.
  - B4.4 Partner Reporting: As an admin, I generate partner-specific exports (CSV, CWR, DDEX) for reciprocal PROs.
- **Acceptance Criteria**
  - AB4.1 Existing dispute endpoints with state transitions remain compliant; regression tests confirm permissible transitions.
  - AB4.2 Royalty cycle endpoints trigger calculations and generate `RoyaltyLineItem` records without regressions.
  - AB4.3 Withdrawal workflow in `royalties/` enforces authority validation and logs actions; audit trail is verified.
  - AB4.4 Export jobs generate downloadable files and audit logs per current Celery tasks.
  - AB4.5 Frontend activity pages support pagination, filtering, and action feedback (toasts/alerts).
  - AB4.6 End-to-end tests cover happy path + failure scenarios for each workflow.
- **Task Checklist**
  - [ ] Backend QA: Exercise dispute, royalty cycle, withdrawal, and export endpoints; file targeted fixes only if integration uncovers bugs.
  - [ ] Backend Ops: Monitor Celery/Redis pipelines supporting these workflows; tune configs where necessary.
  - [ ] Frontend: Create activity management UIs per role with optimistic updates mapped to existing APIs.
  - [ ] QA: Extend Postman/E2E suites; ensure demo data scripts cover workflows and exports.
  - [ ] Tests: Confirm B4 workflows via pytest/Celery task assertions and end-to-end UI regressions.

## Frontend Roadmap

- **Order** F1 `zamio_frontend` → F2 `zamio_stations` → F3 `zamio_publisher` → F4 `zamio_admin`.
- **Shared Expectations** Each SPA consumes `@zamio/ui` components, central auth/session utilities, and API clients wired to `/api/v1/...` endpoints defined in backend phases.

### Phase F1 · `zamio_frontend` (Artist Portal)
- **Vision** Deliver the artist-facing experience for catalog submission, royalty insights, and notification management.
- **User Stories**
  - F1.1 Catalog Upload: As an artist, I can upload and manage releases through `UploadManagement.tsx` and `AddTrack.tsx`.
  - F1.2 Royalty Overview: As an artist, I can review dashboards and payment history sourced from backend metrics (`Dashboard.tsx`, `RoyaltyPayments.tsx`).
  - F1.3 Notification Center: As an artist, I can consume alerts for disputes, payouts, and onboarding steps (`Notifications.tsx`).
- **Acceptance Criteria**
  - AF1.1 API client layer in `src/lib` handles authenticated requests (token refresh, error mapping) and covers uploads, metrics, notifications.
  - AF1.2 Upload workflows support resumable uploads, file validation, and display backend processing statuses.
  - AF1.3 Dashboard widgets render real API data with loading/empty/error states; totals match backend seed data.
  - AF1.4 Notification center polls/websocket subscribes to Channels topic when available; unread counts sync with backend.
  - AF1.5 End-to-end happy paths covered by Cypress or Playwright scripts (login → upload → verify dashboard update).
- **Task Checklist**
  - [ ] Build reusable API client + hooks (e.g., `useArtistMetrics`, `useUploadMutation`).
  - [ ] Wire upload pages (`UploadManagement.tsx`, `AddTrack.tsx`) to media ingestion endpoints with progress UI.
  - [ ] Connect dashboard components to metrics endpoints, ensuring formatting and unit tests.
  - [ ] Integrate notifications list/detail with websocket/polling fallback and mark-as-read mutations.
  - [ ] Implement route guards/layout state in `App.tsx` ensuring auth + onboarding gates.
  - [ ] Author automated UI tests covering primary flows; update demo data scripts.
  - [ ] Tests: Execute F1 regression pack (Cypress/Playwright + lint/unit suites) to prove acceptance criteria.

### Phase F2 · `zamio_stations` (Station Compliance Portal)
- **Vision** Enable station operators to monitor compliance, manage disputes, and configure capture schedules.
- **User Stories**
  - F2.1 Compliance Dashboard: As a station admin, I view play/compliance KPIs and outstanding tasks (`Dashboard.tsx`, `Compliance.tsx`).
  - F2.2 Dispute Handling: As operations staff, I resolve disputes and view audit trails (`MatchDisputeManagement/*`).
  - F2.3 Staff & Device Setup: As a station owner, I manage staff users and deploy capture app credentials (`StaffManagement.tsx`).
- **Acceptance Criteria**
  - AF2.1 Compliance widgets consume backend endpoints for play logs, dispute counts, and capture status; data matches sample fixtures.
  - AF2.2 Dispute actions trigger PATCH/POST requests with optimistic UI and reflect status transitions defined in backend.
  - AF2.3 Staff management integrates with invite endpoints and enforces roles/permissions.
  - AF2.4 Capture provisioning page displays device tokens/config produced in onboarding phase, allowing regen/revoke flows.
  - AF2.5 Accessibility review ensures critical tables/cards meet keyboard navigation standards.
- **Task Checklist**
  - [ ] Implement shared station API client (play logs, disputes, staff, provisioning).
  - [ ] Connect compliance dashboard cards/charts to backend, add loading skeletons.
  - [ ] Build dispute detail modals/actions with optimistic updates and rollback handling.
  - [ ] Create staff management CRUD UI integrated with invite emails and role toggles.
  - [ ] Surface capture provisioning details, including QR/JSON export for `zamio_app` devices.
  - [ ] Extend automated tests to cover compliance and dispute scenarios; update documentation for station demos.
  - [ ] Tests: Run F2 acceptance verification across automated suites and manual capture provisioning walkthroughs.

### Phase F3 · `zamio_publisher` (Publisher & PRO Portal)
- **Vision** Provide publishers and partner PROs visibility into catalog performance, contract management, and royalty settlements.
- **User Stories**
  - F3.1 Catalog Oversight: As a publisher, I manage works and recording metadata (`CatalogManagement.tsx`, `ArtistsManagement.tsx`).
  - F3.2 Contract Lifecycle: As legal staff, I review and update agreements, including reciprocal contracts (`ContractsLegal.tsx`).
  - F3.3 Royalty Settlement: As finance, I inspect payments/remittances and download partner exports (`RoyaltiesPayments.tsx`, `PaymentProcessing.tsx`).
- **Acceptance Criteria**
  - AF3.1 Catalog tables integrate with backend pagination/search filters; edits sync bi-directionally with validation feedback.
  - AF3.2 Contract management surfaces statuses, triggers workflow actions, and stores amendment history.
  - AF3.3 Royalty payment pages present cycle breakdowns, export links, and status tags consistent with backend `PartnerRemittance` data.
  - AF3.4 Reports download flows stream files securely (signed URLs or direct download tokens).
  - AF3.5 QA scripts cover end-to-end contract edit → royalty review → export download sequences.
- **Task Checklist**
  - [ ] Develop publisher API layer (catalog, contracts, remittances, exports).
  - [ ] Hook catalog/artist components to CRUD endpoints with inline editing and validation modals.
  - [ ] Implement contract timeline UI, including upload/view of supporting documents.
  - [ ] Build royalty settlement views, charts, and export download handlers with error handling.
  - [ ] Add integration tests validating pagination, contract transitions, and export downloads.
  - [ ] Update `AGENTS.md`/runbooks with publisher demo scenarios and credentials.
  - [ ] Tests: Execute F3 regression plan validating reports, contracts, and exports against acceptance criteria.

### Phase F4 · `zamio_admin` (Internal Operations Console)
- **Vision** Equip internal Zamio teams with cross-cutting oversight for system health, user management, and financial reconciliation.
- **User Stories**
  - F4.1 Global Monitoring: As an admin, I monitor platform-wide KPIs, worker health, and ingestion backlogs (`Dashboard.tsx`).
  - F4.2 User Governance: As support, I manage accounts, roles, and escalations across artists/stations/publishers (`UserManagement` pages).
  - F4.3 Financial Controls: As finance ops, I reconcile payouts, approve withdrawals, and audit Celery tasks (`Finance`/`Compliance` pages`).
- **Acceptance Criteria**
  - AF4.1 Admin dashboard aggregates metrics from multiple services (Celery queues, Redis stats, capture backlog) and surfaces alerts.
  - AF4.2 User management supports advanced filters, impersonation (where permitted), and audit logging of changes.
  - AF4.3 Financial views integrate with withdrawal approval endpoints and display Celery job statuses.
  - AF4.4 Role-based access enforced client-side and server-side; unauthorized nav blocked with clear messaging.
  - AF4.5 Incident response workflows documented with quick links to logs/monitoring tools.
- **Task Checklist**
  - [ ] Craft admin API client for metrics, user management, and finance operations.
  - [ ] Implement dashboard widgets including worker/queue health using websocket or polling feeds.
  - [ ] Build user governance tables/forms with bulk actions and audit trail display.
  - [ ] Connect finance pages to withdrawal/remittance endpoints with status transitions and evidence uploads.
  - [ ] Add SSO/2FA integration hooks if required; ensure session timeout handling.
  - [ ] Produce comprehensive admin runbook and automated regression tests.
  - [ ] Tests: Complete F4 end-to-end validation (Cypress admin suite + pytest backend checks) before release.

## Cross-Cutting Practices
- **Documentation** Update `AGENTS.md` and this file whenever scopes shift; append changelog entries.
- **Testing** Maintain backend pytest coverage, frontend unit/integration tests, and integration smoke tests via Postman/Cypress.
- **Deployment** Keep Docker compose files current; each phase should be deployable independently with feature flags if needed.
- **Demo Readiness** At the end of every phase, ensure there is a scripted demo scenario with test data, accessible credentials, and instructions.
- **Frontend Contract Discipline** Treat the existing static SPA screens as non-negotiable guides for data structure, copy, and flow unless explicit approval is given to revise them. Any backend/domain changes should be driven by aligning responses with these UI expectations.

## Manual QA · Upload Management Flow

### Backend preparation
1. Navigate to the backend app and apply migrations:
   ```bash
   cd zamio_backend
   python manage.py migrate
   ```
2. Seed an artist account and API token for testing:
   ```bash
   python manage.py shell <<'PY'
from django.contrib.auth import get_user_model
from artists.models import Artist
from rest_framework.authtoken.models import Token

User = get_user_model()
user, _ = User.objects.get_or_create(
    email='artist@example.com',
    defaults={'first_name': 'Upload', 'last_name': 'Tester'}
)
user.set_password('securepass123')
user.save()
artist, _ = Artist.objects.get_or_create(user=user, defaults={'stage_name': 'Upload Tester'})
Token.objects.get_or_create(user=user)
print('Token:', Token.objects.get(user=user).key)
PY
   ```
3. (Optional) Prime a few upload records for manual inspection:
   ```bash
   python manage.py shell <<'PY'
from artists.models import UploadProcessingStatus
from django.contrib.auth import get_user_model

user = get_user_model().objects.get(email='artist@example.com')
UploadProcessingStatus.objects.get_or_create(
    upload_id='manual_processing',
    defaults={
        'user': user,
        'upload_type': 'track_audio',
        'original_filename': 'manual-processing.mp3',
        'file_size': 2048,
        'mime_type': 'audio/mpeg',
        'status': 'processing',
        'progress_percentage': 45,
        'metadata': {'title': 'Processing Demo', 'album_title': 'Manual Album'}
    }
)
UploadProcessingStatus.objects.get_or_create(
    upload_id='manual_failed',
    defaults={
        'user': user,
        'upload_type': 'track_audio',
        'original_filename': 'manual-failed.mp3',
        'file_size': 1024,
        'mime_type': 'audio/mpeg',
        'status': 'failed',
        'progress_percentage': 20,
        'metadata': {'title': 'Failed Demo', 'album_title': 'Manual Album'}
    }
)
PY
   ```

### Backend endpoint verification
1. Start the API server: `python manage.py runserver 0.0.0.0:8000`.
2. Call the upload listing endpoint and verify stats, pagination, and filters are populated:
   ```bash
   curl -H "Authorization: Token <TOKEN_VALUE>" http://localhost:8000/api/artists/api/uploads/
   ```
3. Create an album and confirm the response echoes the title/genre:
   ```bash
   curl -X POST \
     -H "Authorization: Token <TOKEN_VALUE>" \
     -H "Content-Type: application/json" \
     -d '{"title": "Manual Release", "genre": "Highlife", "release_date": "2024-06-15"}' \
     http://localhost:8000/api/artists/api/albums/create/
   ```
4. Cancel an in-flight upload and delete a failed upload, confirming status changes via follow-up GET requests:
   ```bash
   curl -X DELETE -H "Authorization: Token <TOKEN_VALUE>" http://localhost:8000/api/artists/api/upload/manual_processing/cancel/
   curl -X DELETE -H "Authorization: Token <TOKEN_VALUE>" http://localhost:8000/api/artists/api/upload/manual_failed/delete/
   curl -H "Authorization: Token <TOKEN_VALUE>" http://localhost:8000/api/artists/api/uploads/
   ```

### Frontend verification
1. Install workspace dependencies (first run only): `npm install`.
2. Ensure the frontend points at the local API by creating `zamio_frontend/.env.local` with `VITE_API_URL=http://localhost:8000`.
3. Start the Vite dev server: `npm run dev -- --host 0.0.0.0 --port 5173`.
4. Sign in as `artist@example.com` / `securepass123`, open the Upload Management page, and confirm:
   - The stats cards and table rows reflect the seeded uploads.
   - Album filter dropdown includes the album titles returned by the API.
   - The "Add Album" modal persists a new album and immediately refreshes the list.
   - Bulk upload wizard accepts audio files, transitions through metadata/progress steps, and refreshes the table after completion.
   - Row-level actions (`Cancel upload`, `Refresh status`, `Delete upload`, `View track details`) invoke the backend and update the UI state.
5. Run the automated suites to regress the flow:
   ```bash
   pytest zamio_backend/artists/tests/test_upload_management_api.py
   npm test -w zamio_frontend -- --run
   ```
