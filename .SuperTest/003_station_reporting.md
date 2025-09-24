# Station Usage Reporting & Detection Review

## Objective
Validate that a radio station can submit usage logs, trigger audio fingerprint matching, and reconcile detections before royalties are calculated.

## Preconditions
- Station account with permissions to upload daily logs.
- Audio fingerprinting workers online (Celery + Redis) or simulated responses.
- Access to detection review queue in the Zamio Stations portal.

## Test Data
- Station login: `station.ops@example.com`
- Usage log: `samples/station_playlog_2024-06-01.csv`
- Reference audio snippet for spot auditing.

## Steps
1. Sign into the stations portal and confirm light theme renders without dark remnants.
2. Navigate to **Usage Reports › Upload** and submit the CSV log.
3. Monitor processing status; confirm background task initiates fingerprint matching.
4. Once complete, open the detections summary and filter by `unmatched` plays.
5. Manually attach the provided audio snippet to a detection to confirm the waveform player works in dark mode.
6. Approve a set of matches and reject at least one false positive, leaving reviewer notes.
7. Export the daily reconciliation report and verify totals match the imported play counts.

## Expected Results
- Upload validates schema and rejects malformed rows with descriptive errors.
- Processing job transitions through `pending → processing → complete` within SLA.
- Detections summary respects selected theme across cards, tables, and modals.
- Manual review actions persist and appear in the audit log tied to the station operator.
- Exported reconciliation file totals match accepted plays and highlights rejected entries.

## Notes
- Cross-check Celery worker logs for duration and error rates.
- Capture any latency concerns for the detection viewer when toggling themes.
