# Governance, Compliance & Audit Trail Review

## Objective
Verify that compliance officers can audit system activity, export evidence, and enforce policy acknowledgements across Zamio properties.

## Preconditions
- Compliance user account with read access to all audit logs and policy modules.
- Retention policies configured in Django settings to retain logs for at least 7 years.
- Access to SIEM or log archive for cross-checking trace IDs.

## Test Data
- Compliance login: `compliance.officer@example.com`
- Policy document: `docs/zm-security-policy-v1.2.pdf`

## Steps
1. Sign into the admin console and open **Governance › Policy Center**.
2. Upload the latest security policy PDF and assign it to all roles.
3. Trigger a policy acknowledgement workflow and send notifications to outstanding users.
4. Navigate to **Audit Logs** and filter by the current date, verifying events from artist onboarding, publisher imports, and royalty approvals appear.
5. Drill into an individual audit record and confirm metadata includes trace ID, IP address, user agent, and sanitized request payload.
6. Export the filtered audit log to CSV and verify the download includes policy-related events.
7. Cross-reference one trace ID with the external SIEM to confirm logs were forwarded successfully.

## Expected Results
- Policy upload succeeds and versioning retains prior revisions.
- Notification system queues policy acknowledgement emails/messages without errors.
- Audit logs reflect events across all major workflows with consistent formatting.
- Exported CSV matches on-screen filters and includes compliance metadata.
- Trace IDs align between Zamio and the external SIEM/observability stack.

## Notes
- Capture any missing fields required by partner PROs (e.g., society identifiers) for follow-up enhancements.
- Confirm retention policy configuration and automated purge schedule.
