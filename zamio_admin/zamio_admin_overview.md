# ZamIO Admin — Overview

Purpose
- Internal operations console for partners, repertoire ingestion, attribution QA, tariffs/cycles, exports, and remittances.
- Monitor ingestion health (device snippets and stream scans), data quality, and system status.

Core Domains
- Partners & Agreements: PartnerPRO, ReciprocalAgreement, admin fee policies, territories.
- Repertoire: CSV/CWR/DDEX imports, idempotent upsert, conflict resolution.
- Attribution QA: low-confidence queue, overrides, adjudication logs.
- Tariffs & Cycles: station classes, time-of-day rules, cycle open/close.
- Exports & Remittance: statements (CSV baseline), remittance creation and settlement.
- Users & Roles: staff roles (superadmin/support/finance), tokens/2FA policy.

Monitoring & Health
- Device fleet: last-seen, backlog depth, error rate, app versions.
- Stream scans: per-station scan status, last capture/match, error counts.
- Backend jobs: Celery Beat schedules, task success/failures.

Security & Compliance
- Scoped staff roles and per-endpoint permissions.
- Audit trail for sensitive transitions (cycle lock, remittance settle, QA decisions).
- Data retention and access controls across evidence (audio, logs).

References
- Backend APIs: `/api/music-monitor/*`, `/api/artists/*`, `/api/publishers/*`, `/api/stations/*`.
- Stream scanning tasks: `music_monitor.tasks` (Celery) with capture→match pipeline.
