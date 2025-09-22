# ZamIO Publishers Frontend Plan

See also: [TestPlanOrder.md](../TestPlanOrder.md) for cross-repo visual test order and publisher-specific acceptance checks.

This is a living plan to guide the publisher portal to production. It organizes scope, architecture, conventions, and phased milestones. We will revise as backend contracts and requirements evolve.

## 1) Objectives & Scope
- Core: Onboarding, Dashboard, Contracts, Royalties, Playlogs/Match Logs, Notifications, Publisher Profile, Settings.
- Outcomes: Accurate data wiring, reliable auth + token refresh, production-ready performance, observability, and accessible UI.

## 2) Tech Stack & Conventions
- Framework: React 18 + TypeScript, Vite, React Router v6.
- Styling: TailwindCSS; component utility patterns and small reusable UI primitives.
- Icons & Charts: lucide-react, apexcharts/chart.js (as already present).
- Data: React Query (SWR acceptable alternative) for caching, loading, retries.
- HTTP: Axios with a typed client and interceptors.
- File structure (proposed additions):
  - `src/lib/api/` axios client, endpoint modules
  - `src/lib/config.ts` runtime config
  - `src/types/` shared types for API responses
  - `src/hooks/` custom hooks (useAuth, useWS, useQuery helpers)
  - `src/components/ui/` shared UI primitives (Table, EmptyState, Skeleton, ErrorBoundary)
  - `src/features/` optional feature folders for complex domains
- Naming: camelCase in frontend; map snake_case API fields to camelCase.

## 3) Environments & Config
- Env vars: `VITE_API_BASE_URL`, `VITE_WS_BASE_URL`, `VITE_ENV`.
- Files: `.env.development`, `.env.staging`, `.env.production`.
- Config module reads env, validates presence, exports constants.
- No hardcoded hosts in code; only via config.

## 4) Authentication & Authorization
- Approach: Short-lived access token + refresh token.
- Storage: Access token in memory (or localStorage fallback); refresh in httpOnly cookie when feasible.
- Axios interceptors: attach access token, handle 401 with refresh, logout on failure.
- Route guards: protect app routes, redirect to sign-in; preserve intended redirect.

## 5) API Client & Error Model
- Axios instance with base URL from config; JSON response envelope:
  - `{ success: boolean; data?: T; error?: { code: string; message: string } }`
- Strong types in `src/types/` per endpoint; no `any` in page code.
- Centralized error normalization; toast + inline error components.

## 6) Data Fetching & Caching (React Query)
- Query keys by entity and params, e.g., `['publisherProfile', publisherId]`.
- Stale time tuned per endpoint; background refetch on focus.
- Mutations invalidate relevant queries.

## 7) Realtime (WebSocket)
- WS URL from config: `ws://.../ws/publishers/:publisherId` (final path per backend).
- Events (proposed): `play_detected`, `top10_updated`, `royalty_statement_ready`, `artist_upload`.
- Client: `useWebSocket` hook with exponential backoff, heartbeat, dedupe by event id.
- Fallback polling (30–60s) where WS unavailable.

## 8) Routing & Navigation
- Use route params for deep links; avoid `location.state` for required ids.
  - `/dashboard`
  - `/artists`
  - `/artists/:artistId`
  - `/contracts`
  - `/contracts/:contractId`
  - `/royalties`
  - `/playlogs`
  - `/notifications`
  - `/profile` (publisher org profile)
  - `/onboarding/profile`, `/onboarding/revenue-split`, `/onboarding/link-artist`, `/onboarding/payment`
- Keep filters in query params (e.g., `?page=2&sort=plays_desc`).

## 9) UX Standards: Loading, Empty, Error
- Reusable components: `Skeleton`, `EmptyState`, `InlineError`, `ErrorBoundary`.
- Toasts for transient events; inline errors for actionable problems.

## 10) Currency, Dates, Locale
- Currency: GHS displayed via `Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })` or `GH₵` prefix. Avoid mojibake by ensuring UTF-8 files.
- Dates: ISO 8601 from backend; format with `Intl.DateTimeFormat`.
- Amounts: Prefer integer pesewas in API; convert to decimal only in UI.

## 11) Accessibility & Internationalization
- Semantics: landmark roles, label inputs, focus states.
- Keyboard: ensure navigability; skip links where needed.
- Color contrast: test against WCAG AA.
- i18n: future-ready structure; strings centralized for later translation.

## 12) Security
- Sanitize any HTML inputs; never `dangerouslySetInnerHTML` without sanitization.
- Enforce CSP where app is hosted; restrict origins for API and WS.
- Handle PII carefully; avoid logging sensitive values.

## 13) Testing Strategy
- Unit: Vitest + React Testing Library for components, hooks.
- Integration: test data hooks with MSW.
- E2E: Playwright for critical flows (sign-in, onboarding, dashboard views).
- Lint/format: ESLint + Prettier (already present Prettier/Tailwind plugin).
- CI: run tests + type-check on PR.

## 14) Performance & DX
- Code-splitting per route; dynamic import for heavy charts/editors.
- Memoize list rows; virtualize long tables if needed.
- Image optimization; lazy-load non-critical assets.
- Source maps in dev only; analyze bundle in CI.

## 15) Observability
- Error reporting: Sentry (or alternative) with release tagging.
- Basic analytics for feature usage (page views, key actions).
- Feature flags if needed for gradual rollout.

## 16) Release Process
- Branching: trunk-based with PR reviews.
- Versioning: semver for app builds; tag releases.
- Build: Docker image with Vite build; env injection at runtime if needed.
- Deploy: staging → production promotion; smoke tests post-deploy.

## 17) Feature Plans (by area)

### Onboarding Flow
- Endpoint: `GET /publisher/onboarding/start` to drive step gating.
- Steps:
  1) Company Profile: name, address, legal rep, contact email.
  2) Revenue Split Setup: e.g., 60% artist / 40% publisher; validate totals.
  3) Sign/Link Artists:
     - Invite artists by email or code.
     - Accept/deny association requests.
- Persistence: save each step; resume mid-flow. Disable dashboard until complete.

### Dashboard
- Widgets: earnings summary (per artist, station, song), roster snapshot, contracts status, recent plays, notifications.
- Charts: trend over time; top songs/stations.
- Deep link into details.

### Artist Roster
- List with search/sort/pagination; managed artists only.
- Artist detail: plays, earnings, songs, contracts, contact.

### Contract Management
- List contracts; upload/view signed agreements (PDF); view duration and status.
- Contract detail route with songs, contributors/splits, recent plays.
- Versioning and audit if edits are permitted.

### Royalties
- Totals and breakdowns by artist/song/station.
- Statement history; export CSV/PDF.
- Payouts due to artists; threshold rules.

### Playlogs / Match Logs
- Real-time table or periodic refresh; filters by station/time/artist/song.
- Link to detections/matching confidence.

### Notifications
- Activity feed: artist uploads, payout triggers, top10 updates.
- Preferences per publisher.

### Publisher Profile
- Org info (logo, name, address, contacts); notification prefs.
- Replace demo state with real API data.

## 18) Milestones & Sequencing
1) Platform Foundation: env config, axios client, React Query setup, auth guard & token refresh, error/empty/loading primitives.
2) Onboarding MVP: complete profile, revenue split, artist linking; gate dashboard.
3) Dashboard + Roster MVP: earnings summary, artist list + detail.
4) Contracts + Royalties: contract list/detail, statements, exports.
5) Playlogs + Notifications: live or polled feed; preferences.
6) Polish & Launch: a11y, i18n scaffold, performance passes, observability, E2E + CI, release pipeline.

## 19) Open Questions
- Are publishers and stations separate actors in the data model? Confirm scope for profile vs. station monitoring views.
- Confirm API response schemas for: onboarding start, dashboard, managed artists, contracts, contract details, royalties, playlogs, notifications.
- WS contract: paths and event payloads. Are we targeting live play updates in publisher UI?
- Payout rails (MoMo/bank) and statement requirements for Ghana-specific compliance.
- Splits editing: allowed in UI? versioning + approvals required?
