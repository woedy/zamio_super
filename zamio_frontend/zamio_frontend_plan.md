# ZamIO Artist Frontend Plan

Purpose: a living, execution-focused plan to guide the artist-facing app to production. Keep this document close to code. Update as decisions change.

## High‑Level Priorities
- Reliable auth + onboarding with graceful recovery flows.
- Clear visibility of plays, matches, and earned royalties.
- Frictionless withdrawals to MoMo; transparent fees and statuses.
- Fast, resilient UI under unstable networks (Africa-first constraints).
- Production-grade error handling, observability, and DX.

## Architecture & Conventions
- Stack: React 18 + Vite, TypeScript, TailwindCSS, Axios, Recharts, React Router v6.
- Routing: Public vs Private routes. Private routes redirect to `/signin` if token missing/expired.
- API client: `src/lib/api.ts` (Axios) + request interceptor attaches `Authorization: Token <token>`.
- Identity: Prefer deriving `artist_id` from `GET api/profile/me` after login; avoid persisting IDs long-term in `localStorage`.
- State/data: Local component state + Axios. If data needs caching/invalidation, consider adding React Query later.
- Styling: Tailwind + existing design tokens. Keep components dumb; lift data/UI state to pages.
- Error/loading: Skeletons for long loads (>300ms), inline toasts for errors, retry buttons for idempotent fetches.
- Formatting/i18n: Use `Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })` for money. Dates via `toLocaleString('en-GH')`.
- Env/config: Single source in `src/constants.tsx`. Avoid hardcoding URLs in components.

## Environments
- Local: `http://localhost:8000` (backend) with token in localStorage for now.
- Staging: `https://staging.api.zamio...` (TBD). Separate env file.
- Production: `https://api.zamio...` (TBD). Rollout uses feature flags where possible.

## Route Map (current)
- `/` Landing: `src/pages/Landing/LandingPage.tsx`
- `/signin`, `/signup`, `/verify-email`, password reset flow
- `/onboarding/*` complete profile, payment, social
- `/dashboard` artist dashboard
- `/match-logs` full detection/plays: `PlaylogsMatchLog/FullDetectionTable.tsx`
- `/royalty-payments` wallet/payments: `PaymentsOversight/ViewPaymentHistory.tsx`
- `/music/*` upload, song manager, contributors
- `/analytics` artist analytics page
- `/notifications`, `/legal`, `/help`, `/feedback`

## Workstreams & Tasks

### 1) Authentication & Onboarding
- [ ] Login with email/phone + password
- [ ] Register as artist (name, email, phone, password)
- [ ] Forgot password (email reset)
- [ ] Optional 2FA/OTP (phone verification for MoMo)
- [ ] Profile completion prompt (bio, photo, genre)
- [ ] Private route guard + token expiry handling (401 -> sign‑in)
- [ ] Fetch `me` profile on app load; derive `artist_id` server-side
- [ ] Persist minimal session (token only); rehydrate user on load

Acceptance: Can sign up, log in, recover password; unauthed routes redirect; onboarding prompts until complete.

### 2) Artist Profile Management
- [ ] Edit profile (bio, image, genres, contact)
- [ ] KYC upload (ID, phone, tax ID)
- [ ] MoMo number add/update (MTN, Vodafone, AirtelTigo)
- [ ] Settings: change password, notifications, delete account

Acceptance: Profile saved with validations; KYC status displayed; MoMo number verified; destructive actions confirmed.

### 3) Music Upload & Management
- [ ] Upload new track (audio + metadata)
- [ ] Upload cover art (constraints + preview)
- [ ] Add contributors & splits by percentage
- [ ] Trigger backend fingerprint on upload; show processing status
- [ ] Song Manager list with filters/sort
- [ ] Edit song metadata
- [ ] Download registration certificate (PDF)

Acceptance: Upload > processing > ready with fingerprint status; contributors totals sum to 100%; PDF contains track + splits.

### 4) Airplay & Streaming Analytics
- [ ] Airplay map (stations by region)
- [ ] Plays over time (daily/weekly/monthly)
- [ ] Station breakdown (top stations)
- [ ] Top songs by airplay
- [ ] Optional fan streaming analytics (phase 2)

Acceptance: Charts load from API with date range filters and empty states; export CSV where useful.

### 5) Royalty Dashboard & Payments
- [ ] Wallet balance (available, on-hold, pending)
- [ ] Sources breakdown (radio, streaming, distro)
- [ ] Royalty breakdown (by song/source/month) chart/table toggle
- [ ] Request MoMo withdrawal (min threshold, fees, idempotent)
- [ ] Payment history with statuses + receipts
- [ ] Royalty rate info (effective, with optional overrides)

Immediate fixes in codebase:
- [ ] Replace `wallet.sources.stations` with `wallet.sources.radio`
- [ ] Add safe currency formatting with GH locale
- [ ] Wire withdrawal form to API; show loading/errors; disable when below min
- [ ] Replace static `revenueData` with API timeseries

Acceptance: End‑to‑end flow from earned royalties to successful payout request; clear errors for KYC/insufficient balance.

### 6) Notifications Center
- [ ] Airplay alerts
- [ ] Payout updates
- [ ] Feature announcements
- [ ] Manage notifications: mark read/delete/filter

Acceptance: Real-time or near real-time updates; pagination; preferences respected.

### 7) Legal & Compliance
- [ ] Terms acceptance modal on sign‑in when updated
- [ ] Download agreements (split sheets, terms)
- [ ] Dispute claim center (phase 2+)

Acceptance: Legal documents downloadable; acceptance recorded with timestamp and version.

### 8) Tech & Support
- [ ] In‑app help center (FAQ, payouts)
- [ ] Contact support (email/ticket)
- [ ] Bug report (with diagnostics)
- [ ] Mobile optimization (responsive checks)

Acceptance: Self‑serve help; issue creation flows; all views responsive.

## API Contracts To Confirm (Backend)
- GET `api/payments/artist/wallet?artist_id=` → { wallet: { total, currency, sources: { radio, streaming, distro }, royalty_rates: {...}, history: [...] } }
- POST `api/payouts/withdrawals/` → { payout_id, status, amount, fee, net_amount, eta }
- GET `api/analytics/royalties/timeseries?artist_id=&granularity=&from=&to=` → { series, totals }
- GET `api/artists/playlogs/?artist_id=&page=&log_page_state=` → { playLogs|matchLogs, pagination }
- GET `api/profile/me` → { artist_id, ... }

## Rollout & QA
- [ ] Define feature flags for withdrawals, disputes
- [ ] UAT scenarios per workstream
- [ ] Accessibility pass (keyboard, contrast, labels)
- [ ] Perf budget: initial JS < 200kb gz; lazy-load heavy pages
- [ ] Monitoring hooks (Sentry or custom logging endpoints)

## Observed Gaps / Tech Debt (from code scan)
- Payments page uses `sources.stations` but types define `radio`. Align.
- Money rendering without fallbacks can show `GHS undefined`. Add formatters/guards.
- Static analytics data on royalties; replace with API.
- Route guard not obvious; verify 401 handling and redirect.

—
How to use: treat this as the single source of truth for the artist app scope. Keep checkboxes updated in PRs.

