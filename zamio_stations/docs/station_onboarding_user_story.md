# Station Onboarding User Story

## User Story
As a newly registered radio station manager, I want ZamIO Stations to guide me through completing my profile, inviting my team, and setting up payouts so that I can access the dashboard only after providing all required operational information.

## Acceptance Criteria
- **Registration & Verification**
  - Given I submit valid registration details, when I create an account, then I receive a verification email with a 4-digit code.
  - Given I have received the verification code, when I confirm my email, then my session token, station ID, and onboarding step are persisted locally and the onboarding status cache refreshes.

- **Onboarding Flow Enforcement**
  - Given I have not finished onboarding, when I log in or refresh any protected page, then I am redirected to the next required onboarding step instead of the dashboard.
  - Given I try to access an onboarding page after completing all steps, when onboarding is marked as done, then I am redirected to the station dashboard.

- **Complete Profile Step**
  - Given my profile data already exists, when I open the profile onboarding step, then my saved bio, country, region, and photo preview appear.
  - Given I submit valid profile information and an optional new photo, when the request succeeds, then the onboarding cache refreshes and I am routed to the next pending step.
  - Given I choose to skip the profile step, when I click “Skip”, then the backend records the station as moving to the staff step and I am navigated there.

- **Add Staff Step**
  - Given staff members already exist, when I open the staff onboarding step, then existing active staff are pre-populated in the form.
  - Given I submit at least one staff entry with a name and role, when the request succeeds, then the onboarding status refreshes and I proceed to the payment step.
  - Given I choose to skip adding staff, when I click “Skip”, then the backend updates the onboarding step to payment and I am navigated accordingly.

- **Payment Setup Step**
  - Given payment details already exist, when I open the payment onboarding step, then stored MOMO or bank information is pre-filled.
  - Given I submit at least one payout method, when the request succeeds, then onboarding is marked as done and I am redirected to the dashboard.
  - Given I skip payment setup, when I click “Skip”, then the backend marks onboarding as complete and I am taken to the dashboard.

- **Skip & Resume Behaviour**
  - Given I skipped a step earlier, when I log out and back in, then I am routed to the skipped step until completion.
  - Given I partially complete a form and navigate away, when I return, then cached station details are fetched again so I can continue without losing stored data.

- **Progress Visibility & Errors**
  - Given onboarding data is loading, when a protected page renders, then a loader displays until status retrieval finishes.
  - Given the onboarding status API fails, when that happens, then an error toast or inline message surfaces and no stale data is shown.
