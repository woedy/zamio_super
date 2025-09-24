# Zamio Security & Exploit Review — Phase 1

## Scope
- Django backend configuration (`zamio_backend`), focusing on HTTP surface controls, cookie/session handling, and rate limiting.
- Deployment artefacts (`env.*.example`, `env.coolify.example`) to ensure production guidance enforces hardened defaults.
- Custom security middleware responsibilities.

## Findings & Mitigations
1. **Missing production security headers & cookies**  
   - *Risk:* Without HSTS, secure cookies, or strict referrer/CORS rules, session tokens could be downgraded over HTTP or leaked to third parties.  
   - *Mitigation:* Added environment-aware helpers in `core/settings.py` to enable SSL redirect, HSTS, secure/HTTPOnly cookies, and samesite policies when not in DEBUG. Hardened CSP, Permissions-Policy, and cross-origin isolation headers with overridable env vars.

2. **SecurityHeadersMiddleware limited coverage**  
   - *Risk:* Middleware previously set deprecated `X-XSS-Protection` and lacked CSP/Permissions-Policy propagation.  
   - *Mitigation:* Middleware now honours the new settings, removes obsolete headers, and only adds HSTS when enabled, preventing accidental misconfiguration.

3. **Environment templates lacked guidance**  
   - *Risk:* Operators could deploy without enabling SSL redirect, secure cookies, or CSP, leading to inconsistent production posture.  
   - *Mitigation:* Updated `.env.example`, `env.local.example`, and `env.coolify.example` with explicit secure defaults and documentation-ready values for Coolify.

## Recommended Follow-ups
- Enable [Django security checks](https://docs.djangoproject.com/en/stable/ref/checks/#security) in CI/CD (e.g., `manage.py check --deploy`).
- Audit REST and websocket endpoints for object-level permissions and data exposure.
- Expand automated scanning: dependency scanning (Snyk), container image scanning, and frontend CSP validation once assets are finalised.
- Monitor rate limiting once Redis is configured in production; consider user-tier throttles.

## Status
Security baseline for HTTP headers and cookie policies is now hardened and ready for Coolify deployment. Further application-layer exploit review remains as a planned follow-up task.
