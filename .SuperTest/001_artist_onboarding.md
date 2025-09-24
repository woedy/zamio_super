# Artist Onboarding & Catalog Setup

## Objective
Validate that a new artist can self-register, activate their profile, and import an initial works catalog so Zamio can begin tracking royalties.

## Preconditions
- Clean database seed with no pre-existing artist profile for the test email.
- Email service configured to deliver activation codes (or access to backend admin to retrieve the token).
- Sample works metadata CSV available for upload.

## Test Data
- Artist email: `artist.test+onboarding@example.com`
- Stage name: `Test Artist`
- Catalog CSV: `samples/catalog_seed.csv`

## Steps
1. Visit the public landing page and select **Join as an Artist**.
2. Complete the registration form with the test data and submit.
3. Retrieve the activation link/code from the email (or admin console) and activate the account.
4. Sign in as the artist and complete required profile fields (legal name, bank account stub, contact phone).
5. Navigate to **Catalog › Imports** and upload the sample CSV.
6. Review the parsed works preview and confirm the import.
7. Open the works list and verify newly imported titles exist with pending validation status.

## Expected Results
- Registration responds with success copy and triggers an activation email.
- Activation endpoint completes without errors and logs an audit trail entry.
- Artist dashboard displays onboarding checklist with catalog import unlocked.
- CSV import succeeds, generating works records with correct metadata and `pending_verification` status.
- Audit log captures profile completion and import events with correct trace IDs.

## Notes
- Capture screenshots of every step for stakeholder review.
- Record the trace IDs from the audit log for correlation with backend logs.
