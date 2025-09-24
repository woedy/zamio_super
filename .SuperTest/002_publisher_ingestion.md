# Publisher Catalog Ingestion & Split Validation

## Objective
Ensure a publisher administrator can onboard a partner catalog, define writer splits, and flag conflicts for Zamio operations review.

## Preconditions
- Publisher tenant seeded with admin credentials.
- Access to the publisher web app with dark mode enabled to verify theming consistency.
- Sample catalog XLSX including multiple compositions with co-writers.

## Test Data
- Login: `publisher.admin@example.com`
- Catalog file: `samples/publisher_catalog.xlsx`
- Writers: mix of existing Zamio writers and new entries requiring KYC.

## Steps
1. Log into the publisher portal and confirm the dashboard renders correctly in dark mode (no white cards).
2. Navigate to **Catalog › Bulk Import** and upload the sample XLSX.
3. During mapping, assign columns to work title, ISWC, society, and default split percentages.
4. Submit the import and monitor background processing via the notifications bell.
5. Open an imported work with multiple writers and adjust split percentages to ensure totals = 100%.
6. Attempt to save a work where totals exceed 100% to confirm validation prevents submission.
7. Review the conflict resolution queue for works requiring manual intervention and assign them to operations.

## Expected Results
- Dashboard respects dark theme with neutral-800 backgrounds and readable text.
- Import wizard validates required columns before processing.
- Background job completes and surfaces toast/notification on success.
- Split editor enforces percentage totals and warns on invalid allocations.
- Conflict queue displays any works missing society identifiers with actionable controls.
- Actions generate audit log entries attributable to the publisher admin.

## Notes
- Capture any UI inconsistencies for follow-up in theming workstream.
- Export job IDs for tracing in backend Celery logs.
