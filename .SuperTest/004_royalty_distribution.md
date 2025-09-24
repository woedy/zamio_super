# Royalty Calculation & Distribution Approval

## Objective
Confirm that Zamio calculates royalty shares correctly, surfaces payment packets for finance review, and triggers disbursements after approvals.

## Preconditions
- Prior ingestion of station usage, matched works, and publisher splits.
- Finance operator credentials with two-factor authentication enabled.
- Access to payment provider sandbox credentials configured in environment.

## Test Data
- Finance login: `finance.ops@example.com`
- Settlement period: `2024-Q2`
- Test bank account token seeded in sandbox.

## Steps
1. Log into the admin portal and ensure dark theme renders without contrast issues on tables.
2. Navigate to **Royalties › Calculation Runs** and start a new run for the settlement period.
3. Monitor job progress and review the calculation audit log for anomalies.
4. Once complete, open the generated payment packets and review per-rightsholder statements.
5. Approve the packet and initiate disbursement via the integrated payment provider.
6. Verify payment status transitions from `pending` to `processing` to `completed`.
7. Download the settlement summary PDF and CSV exports.

## Expected Results
- Calculation completes without errors and totals align with prior accounting estimates.
- Statements list accurate splits per work, including international co-publishers.
- Approval requires MFA confirmation and logs the approver’s identity.
- Payment provider sandbox registers the disbursements with matching amounts.
- Audit trail captures status transitions and disbursement references.

## Notes
- Capture packet IDs and payment transaction references for traceability.
- Flag any UI components that ignore theme tokens for follow-up fixes.
