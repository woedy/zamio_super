# AGENTS Plan for Zamio Initiative

## Mission Overview
Zamio is a multi-application platform for royalty collection and distribution serving Ghanaian and international artists. The objective is to deliver a cohesive, production-ready experience that aligns with PRO-grade expectations (ASCAP, BMI, BMAT, etc.) across web, mobile, and backend services.

## Workstreams & Approach

### 1. Context & Discovery
- Audit all documentation across repositories, including the `.kiro` research materials, to understand product requirements, stakeholder expectations, and existing technical decisions.
- Map the current architecture and data flows between `zamio_backend`, frontend React apps (`zamio_frontend`, `zamio_stations`, `zamio_publisher`, `zamio_admin`), and the Flutter mobile app (`zamio_app`).
- Identify shared design tokens, component libraries, and branding assets already in use.

### 2. Unified Theming & UI Consistency
- Create or refine a central design system defining typography, spacing, color palettes, elevations, and motion guidelines with accessible light/dark variants.
- Extract shared Tailwind configurations and component primitives, applying them systematically across all React codebases to eliminate per-app inconsistencies.
- Audit every screen (including form states, modals, tables, and dashboards) to ensure dark mode fidelity—resolving mismatched backgrounds, input fields, and hover states.
- Update the Flutter app to consume the same theme tokens and component styles for parity with the web experiences.

### 3. Landing Page Redesign
- Synthesize stakeholder goals (credibility, artist empowerment, PRO partnerships) into wireframes and high-fidelity mockups.
- Implement the redesigned landing page with responsive layouts, compelling storytelling sections, interactive elements, and optimized performance/SEO.
- Validate accessibility (WCAG AA) for both visual modes.

### 4. Security Hardening & Exploit Mitigation
- Perform a security review of Django backend endpoints: authentication, authorization, data validation, logging, and third-party integrations.
- Assess frontend apps for injection risks, exposed secrets, and insecure API usage; enforce safe coding patterns and strict Content Security Policy headers.
- Review infrastructure artifacts (Dockerfiles, environment handling) to ensure secrets management, TLS readiness, and secure defaults.
- Document identified vulnerabilities and implement prioritized remediations.

### 5. Testing & Quality Assurance
- Define automated test coverage: Django unit/integration tests, React component/e2e tests, Flutter widget/integration tests.
- Create manual validation guides under `.SuperTest/`, with one Markdown file per critical user journey (artist onboarding, catalog ingestion, royalty calculation, distribution approval, reporting, etc.).
- Integrate CI pipelines to run linting, type checks, automated tests, and vulnerability scans on every change.

### 6. Deployment for Coolify Production
- Adapt Docker configurations and environment files for Coolify, including health checks, scaling settings, and persistent storage requirements.
- Provide deployment documentation: environment variable catalog, service dependencies, domain/SSL guidance, and rollback procedures.
- Ensure observability hooks (metrics, logs, alerts) are configured for production monitoring.

### 7. Stakeholder Readiness & Continuous Improvement
- Align platform capabilities with PRO-level acceptance criteria, highlighting compliance, reporting fidelity, and partnership readiness.
- Prepare demo scripts, release notes, and operational runbooks for stakeholder presentations.
- Capture enhancement ideas (analytics dashboards, AI-assisted insights, partner portals) for future roadmap consideration.

## Working Agreements
- Maintain clean Git history with focused commits and comprehensive testing before merges.
- Prioritize accessibility, performance, and security in every change.
- Communicate risks, blockers, and assumptions promptly to stakeholders.

## Execution Checklist
- [x] Context alignment — audit repository documentation (`_TestingGuide`, `.kiro`, repo plans) and capture key findings in `CONTEXT_ALIGNMENT.md`.
- [x] UI theming baseline — inventory shared design tokens, propose consolidated light/dark palette, and draft implementation approach across React apps (see `UI_THEMING_BASELINE.md`).
- [x] Landing page redesign — produce refreshed layout/wireframes, build responsive implementation, and validate accessibility (see `zamio_frontend/src/pages/Landing/LandingPage.tsx`).
- [x] Coolify readiness — production Dockerfiles, role-aware entrypoints, and deployment guide for Coolify (see `deploy/coolify/README.md`).
- [x] Security & exploit review — assess backend/frontend/mobile vectors, patch findings, and document mitigations (see `SECURITY_REVIEW.md`).
- [x] Testing expansion — add regression coverage for security headers and publish `.SuperTest/` manual charters per user story.
- [x] Stakeholder sign-off package — compile demo scripts, release notes, and improvement suggestions aligned with PRO expectations (see `STAKEHOLDER_SIGNOFF.md`).

