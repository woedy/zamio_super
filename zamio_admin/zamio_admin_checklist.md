# ZamIO Admin — Checklist

See also: [TestPlanOrder.md](../TestPlanOrder.md) for the end-to-end visual testing order and acceptance notes.

Legend: [ ] todo, [~] partial, [x] done

Foundations
- [ ] Staff auth with roles/permissions (superadmin/support/finance)
- [~] Secure token issuance and rotation (token auth exists; no rotation)
- [~] Environment config (API base, media base, WS base) (env support in api client; constants still hardcoded)

Partners & Agreements
- [ ] CRUD PartnerPRO with reporting standard and admin fee
- [ ] CRUD ReciprocalAgreement (territory, dates, status, cadence, fee override)

Repertoire
- [ ] CSV import (v1) with dry-run and idempotent upsert
- [ ] Import logs (counts, conflicts, missing IDs)
- [ ] Conflict resolution UI (duplicates, ownership)

Attribution QA
- [ ] Low-confidence queue (approve/reject/reassign)
- [ ] Evidence view (match details, confidence, source)
- [ ] Audit log for QA actions

Tariffs & Cycles
- [ ] Tariff rules by station class/time-of-day/usage type
- [ ] Cycle open/close; LineItems view (gross/admin/net)
- [ ] Lock cycle; export statement package (CSV)

Exports & Remittance
- [ ] Generate partner statements; attach to remittance
- [ ] Create remittance (currency, totals); mark Sent/Settled
- [ ] Archive exports with checksum

Monitoring
- [ ] Device fleet page (last-seen, backlog, errors)
- [ ] Stream scan status (per station): last sample, last match, error rate
- [ ] Celery tasks dashboard (success/fail counts)

Security & Compliance
- [ ] Access controls per page and API
- [ ] TLS everywhere; CORS configured for portals
- [ ] Data retention: raw audio and evidence access policy

QA
- [ ] End-to-end: track upload → fingerprint → match → PlayLog → payout
- [ ] Stream scan: station link produces periodic matches
- [ ] Device snippet: idempotent duplicate upload returns 200/201 consistently
