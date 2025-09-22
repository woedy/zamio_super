# Authentication API Testing Guide

## Overview

This document covers testing all authentication-related API endpoints including user registration, login, JWT token management, and role-based authentication across different user types (Artist, Publisher, Station, Admin, Fan).

## Authentication Endpoints Overview

| Endpoint | Method | Purpose | User Type |
|----------|--------|---------|-----------|
| `/api/accounts/register-artist/` | POST | Artist registration | Artist |
| `/api/accounts/login-artist/` | POST | Artist login | Artist |
| `/api/accounts/verify-artist-email/` | POST | Email verification | Artist |
| `/api/accounts/register-publisher/` | POST | Publisher registration | Publisher |
| `/api/accounts/login-publisher/` | POST | Publisher login | Publisher |
| `/api/accounts/register-station/` | POST | Station registration | Station |
| `/api/accounts/login-station/` | POST | Station login | Station |
| `/api/accounts/register-admin/` | POST | Admin registration | Admin |
| `/api/accounts/login-admin/` | POST | Admin login | Admin |
| `/api/accounts/register-fan/` | POST | Fan registration | Fan |
| `/api/accounts/login-fan/` | POST | Fan login | Fan |
| `/api/auth/token/` | POST | JWT token obtain | All |
| `/api/auth/token/refresh/` | POST | JWT token refresh | All |
| `/api/auth/token/verify/` | POST | JWT token verify | All |

---

## Test Case: Artist Registration

**Objective**: Validate artist account creation with proper data validation and email verification flow

**Prerequisites**: 
- Backend API running on `http://localhost:8000`
- Valid test email address
- Test image file for profile photo

**Steps**:

1. **Test successful artist registration**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/register-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "first_name": "Test",
       "last_name": "Artist",
       "stage_name": "TestArtist",
       "phone": "+233123456789",
       "country": "Ghana",
       "password": "TestPass123!",
       "password2": "TestPass123!"
     }'
   ```

2. **Verify response structure**:
   ```json
   {
     "message": "Successful",
     "data": {
       "user_id": "uuid-string",
       "email": "testartist@example.com",
       "first_name": "Test",
       "last_name": "Artist",
       "phone": "+233123456789",
       "country": "Ghana",
       "photo": null,
       "token": "auth-token-string"
     }
   }
   ```

3. **Test validation errors**:
   ```bash
   # Missing required fields
   curl -X POST http://localhost:8000/api/accounts/register-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com"
     }'
   ```

4. **Test password validation**:
   ```bash
   # Weak password
   curl -X POST http://localhost:8000/api/accounts/register-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist2@example.com",
       "first_name": "Test",
       "last_name": "Artist",
       "stage_name": "TestArtist2",
       "phone": "+233123456789",
       "password": "weak",
       "password2": "weak"
     }'
   ```

5. **Test duplicate email**:
   ```bash
   # Use same email as step 1
   curl -X POST http://localhost:8000/api/accounts/register-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "first_name": "Another",
       "last_name": "Artist",
       "stage_name": "AnotherArtist",
       "phone": "+233987654321",
       "password": "TestPass123!",
       "password2": "TestPass123!"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with user data and auth token
- Step 2: Response contains all required fields with correct data types
- Step 3: Returns 400 Bad Request with validation errors
- Step 4: Returns 400 Bad Request with password strength error
- Step 5: Returns 400 Bad Request with duplicate email error

**Validation**:
- Check database for new user record
- Verify user is created with `is_active=False` and `email_verified=False`
- Confirm Artist profile is created and linked to user
- Verify BankAccount is created with zero balance
- Check that email verification token is generated

---

## Test Case: Email Verification

**Objective**: Validate email verification process and account activation

**Prerequisites**: 
- Completed artist registration from previous test
- Email verification token from registration response or email

**Steps**:

1. **Test successful email verification**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/verify-artist-email/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "email_token": "verification-token-from-email"
     }'
   ```

2. **Test invalid email**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/verify-artist-email/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "nonexistent@example.com",
       "email_token": "any-token"
     }'
   ```

3. **Test invalid token**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/verify-artist-email/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "email_token": "invalid-token"
     }'
   ```

4. **Test missing fields**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/verify-artist-email/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with complete user profile data
- Step 2: Returns 400 Bad Request with email error
- Step 3: Returns 400 Bad Request with token error
- Step 4: Returns 400 Bad Request with missing field error

**Validation**:
- User account is activated (`is_active=True`, `email_verified=True`)
- Auth token is returned for immediate login
- Artist profile data is included in response
- Activity log entry is created

---

## Test Case: Artist Login

**Objective**: Validate artist authentication and session management

**Prerequisites**: 
- Verified artist account from previous tests
- FCM token for push notifications (can use dummy value for testing)

**Steps**:

1. **Test successful login**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/login-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "password": "TestPass123!",
       "fcm_token": "dummy-fcm-token-for-testing"
     }'
   ```

2. **Test invalid credentials**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/login-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "password": "wrongpassword",
       "fcm_token": "dummy-fcm-token"
     }'
   ```

3. **Test unverified account login**:
   ```bash
   # First create unverified account
   curl -X POST http://localhost:8000/api/accounts/register-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "unverified@example.com",
       "first_name": "Unverified",
       "last_name": "Artist",
       "stage_name": "UnverifiedArtist",
       "phone": "+233111111111",
       "password": "TestPass123!",
       "password2": "TestPass123!"
     }'
   
   # Then try to login without verification
   curl -X POST http://localhost:8000/api/accounts/login-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "unverified@example.com",
       "password": "TestPass123!",
       "fcm_token": "dummy-fcm-token"
     }'
   ```

4. **Test missing fields**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/login-artist/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with user data and auth token
- Step 2: Returns 400 Bad Request with invalid credentials error
- Step 3: Returns 400 Bad Request with email verification required error
- Step 4: Returns 400 Bad Request with missing field errors

**Validation**:
- Auth token is generated and returned
- FCM token is stored for push notifications
- Activity log entry is created for login
- User's last login timestamp is updated

---

## Test Case: JWT Token Management

**Objective**: Validate JWT token obtain, refresh, and verify operations

**Prerequisites**: 
- Verified user account (any type)
- Valid login credentials

**Steps**:

1. **Test JWT token obtain**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/token/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "password": "TestPass123!"
     }'
   ```

2. **Test token refresh**:
   ```bash
   # Use refresh token from step 1 response
   curl -X POST http://localhost:8000/api/auth/token/refresh/ \
     -H "Content-Type: application/json" \
     -d '{
       "refresh": "refresh-token-from-step-1"
     }'
   ```

3. **Test token verify**:
   ```bash
   # Use access token from step 1 or 2
   curl -X POST http://localhost:8000/api/auth/token/verify/ \
     -H "Content-Type: application/json" \
     -d '{
       "token": "access-token-to-verify"
     }'
   ```

4. **Test invalid token refresh**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/token/refresh/ \
     -H "Content-Type: application/json" \
     -d '{
       "refresh": "invalid-refresh-token"
     }'
   ```

5. **Test expired token verify**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/token/verify/ \
     -H "Content-Type: application/json" \
     -d '{
       "token": "expired-or-invalid-token"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with access and refresh tokens plus user info
- Step 2: Returns 200 OK with new access token and user info
- Step 3: Returns 200 OK with token validity confirmation
- Step 4: Returns 401 Unauthorized with invalid token error
- Step 5: Returns 401 Unauthorized with invalid token error

**Validation**:
- JWT tokens contain correct user information in payload
- Access tokens have appropriate expiration time
- Refresh tokens can generate new access tokens
- Invalid tokens are properly rejected

---

## Test Case: Multi-Role Registration Testing

**Objective**: Validate registration endpoints for all user types

**Prerequisites**: 
- Backend API running
- Unique email addresses for each user type

**Steps**:

1. **Test Publisher Registration**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/register-publisher/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testpublisher@example.com",
       "first_name": "Test",
       "last_name": "Publisher",
       "company_name": "Test Publishing Co",
       "phone": "+233123456789",
       "password": "TestPass123!",
       "password2": "TestPass123!"
     }'
   ```

2. **Test Station Registration**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/register-station/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teststation@example.com",
       "first_name": "Test",
       "last_name": "Station",
       "station_name": "Test FM",
       "phone": "+233123456789",
       "password": "TestPass123!",
       "password2": "TestPass123!"
     }'
   ```

3. **Test Admin Registration**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/register-admin/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testadmin@example.com",
       "first_name": "Test",
       "last_name": "Admin",
       "phone": "+233123456789",
       "password": "TestPass123!",
       "password2": "TestPass123!"
     }'
   ```

4. **Test Fan Registration**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/register-fan/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testfan@example.com",
       "first_name": "Test",
       "last_name": "Fan",
       "phone": "+233123456789",
       "password": "TestPass123!",
       "password2": "TestPass123!"
     }'
   ```

**Expected Results**:
- All registrations return 200 OK with appropriate user data
- Each user type has correct `user_type` field set
- Role-specific profiles are created (Publisher, Station, etc.)
- Email verification tokens are generated for all accounts

**Validation**:
- Check database for correct user_type values
- Verify role-specific profile tables have corresponding records
- Confirm email verification workflow works for all user types

---

## Test Case: Authentication Security Features

**Objective**: Validate security features like failed login tracking and account locking

**Prerequisites**: 
- Verified user account
- Multiple test attempts capability

**Steps**:

1. **Test failed login attempt tracking**:
   ```bash
   # Make 3 failed login attempts
   for i in {1..3}; do
     curl -X POST http://localhost:8000/api/auth/token/ \
       -H "Content-Type: application/json" \
       -d '{
         "email": "testartist@example.com",
         "password": "wrongpassword"
       }'
   done
   ```

2. **Test account locking after 5 failed attempts**:
   ```bash
   # Make 5 failed login attempts
   for i in {1..5}; do
     curl -X POST http://localhost:8000/api/auth/token/ \
       -H "Content-Type: application/json" \
       -d '{
         "email": "testartist@example.com",
         "password": "wrongpassword"
       }'
   done
   ```

3. **Test login with locked account**:
   ```bash
   # Try to login with correct credentials after account is locked
   curl -X POST http://localhost:8000/api/auth/token/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "password": "TestPass123!"
     }'
   ```

4. **Test successful login resets failed attempts**:
   ```bash
   # Wait for lock to expire (30 minutes) or manually reset in database
   # Then test successful login
   curl -X POST http://localhost:8000/api/auth/token/ \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testartist@example.com",
       "password": "TestPass123!"
     }'
   ```

**Expected Results**:
- Step 1: Each attempt returns 401 with invalid credentials
- Step 2: After 5 attempts, account is locked for 30 minutes
- Step 3: Returns error indicating account is temporarily locked
- Step 4: Successful login resets failed attempt counter

**Validation**:
- Check database for `failed_login_attempts` counter
- Verify `account_locked_until` timestamp is set correctly
- Confirm successful login clears security flags

---

## Test Case: Authenticated API Access

**Objective**: Validate that protected endpoints require valid authentication

**Prerequisites**: 
- Valid JWT access token from login
- Protected API endpoint to test

**Steps**:

1. **Test API access with valid token**:
   ```bash
   curl -X GET http://localhost:8000/api/protected-endpoint/ \
     -H "Authorization: Bearer your-access-token-here"
   ```

2. **Test API access without token**:
   ```bash
   curl -X GET http://localhost:8000/api/protected-endpoint/
   ```

3. **Test API access with invalid token**:
   ```bash
   curl -X GET http://localhost:8000/api/protected-endpoint/ \
     -H "Authorization: Bearer invalid-token"
   ```

4. **Test API access with expired token**:
   ```bash
   curl -X GET http://localhost:8000/api/protected-endpoint/ \
     -H "Authorization: Bearer expired-token"
   ```

**Expected Results**:
- Step 1: Returns 200 OK with requested data
- Step 2: Returns 401 Unauthorized
- Step 3: Returns 401 Unauthorized with invalid token error
- Step 4: Returns 401 Unauthorized with token expired error

**Validation**:
- Protected endpoints properly validate JWT tokens
- Error messages are informative but don't leak sensitive information
- Token expiration is enforced correctly

---

## Postman Collection Setup

For easier API testing, create a Postman collection with the following setup:

### Environment Variables
```json
{
  "base_url": "http://localhost:8000",
  "access_token": "",
  "refresh_token": "",
  "user_id": "",
  "artist_id": ""
}
```

### Pre-request Scripts
Add this script to automatically set tokens from login responses:
```javascript
// For login requests, save tokens to environment
pm.test("Save auth tokens", function () {
    var jsonData = pm.response.json();
    if (jsonData.access) {
        pm.environment.set("access_token", jsonData.access);
    }
    if (jsonData.refresh) {
        pm.environment.set("refresh_token", jsonData.refresh);
    }
    if (jsonData.data && jsonData.data.user_id) {
        pm.environment.set("user_id", jsonData.data.user_id);
    }
});
```

### Authorization Header
For protected endpoints, use:
```
Authorization: Bearer {{access_token}}
```

---

## Test Results Template

Use this template to document test results:

### Test Execution Summary
- **Date**: [Test execution date]
- **Tester**: [Name]
- **Environment**: [Local/Staging/Production]
- **Test Status**: [Pass/Fail/Partial]

### Test Case Results
| Test Case | Status | Notes | Issues |
|-----------|--------|-------|--------|
| Artist Registration | ✅ Pass | All validations working | None |
| Email Verification | ✅ Pass | Token validation correct | None |
| Artist Login | ❌ Fail | FCM token validation issue | #123 |
| JWT Token Management | ✅ Pass | All token operations work | None |
| Multi-Role Registration | ⚠️ Partial | Publisher reg fails | #124 |
| Security Features | ✅ Pass | Account locking works | None |
| Authenticated Access | ✅ Pass | Token validation correct | None |

### Issues Found
1. **Issue #123**: FCM token validation not working properly
   - **Severity**: Medium
   - **Steps to reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

2. **Issue #124**: Publisher registration endpoint returns 500 error
   - **Severity**: High
   - **Steps to reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]