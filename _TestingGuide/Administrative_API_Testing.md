# Administrative API Testing Guide

## Overview

This document covers testing administrative functionality APIs including user management, system monitoring, and compliance reporting. These APIs provide comprehensive oversight and management capabilities for platform administrators.

## API Categories

### User Management APIs
- User account administration and oversight
- Role and permission management
- KYC approval workflows
- Account status management and bulk operations

### System Monitoring APIs
- Platform analytics and metrics
- Performance monitoring and dashboards
- Error tracking and logging
- System health checks and real-time metrics

### Compliance and Reporting APIs
- Publisher management and agreements
- Station compliance monitoring
- Regulatory reporting and exports
- Audit trail management

## Administrative API Endpoints

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **User Management** | `/api/accounts/user-management-overview/` | GET | Get user management dashboard overview |
| | `/api/accounts/all-users/` | GET | Get paginated list of all users |
| | `/api/accounts/user-details/` | GET | Get detailed user information |
| | `/api/accounts/update-kyc-status/` | POST | Update user KYC status |
| | `/api/accounts/update-user-status/` | POST | Activate/deactivate user accounts |
| | `/api/accounts/bulk-user-operations/` | POST | Perform bulk operations on users |
| | `/api/accounts/kyc-pending-users/` | GET | Get users with pending KYC |
| | `/api/accounts/audit-logs/` | GET | Get system audit logs |
| **System Monitoring** | `/api/admin/dashboard-data/` | GET | Get admin dashboard analytics |
| | `/api/analytics/admin-analytics/` | GET | Get platform-wide analytics |
| | `/api/analytics/realtime-metrics/` | GET | Get real-time system metrics |
| | `/api/analytics/export-request/` | POST | Request analytics data export |
| **Compliance & Reporting** | `/api/royalties/partners/` | GET | Get partner PRO list |
| | `/api/royalties/cycles/` | GET | Get royalty cycles |
| | `/api/royalties/generate-pro-report/` | POST | Generate PRO compliance report |
| | `/api/stations/compliance-report/` | GET | Get station compliance report |

---

## Test Case: User Management Overview

**Objective**: Validate admin dashboard user management overview and statistics

**Prerequisites**: 
- Admin user account with proper permissions
- Various user types in the system (artists, publishers, stations)
- Users with different KYC statuses

**Steps**:

1. **Test Get User Management Overview**:
   ```bash
   curl -X GET http://localhost:8000/api/accounts/user-management-overview/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

2. **Test Non-Admin Access**:
   ```bash
   curl -X GET http://localhost:8000/api/accounts/user-management-overview/ \
     -H "Authorization: Bearer artist-jwt-token"
   ```

3. **Test Overview Data Structure**:
   ```bash
   # Verify response contains all required statistics
   curl -X GET http://localhost:8000/api/accounts/user-management-overview/ \
     -H "Authorization: Bearer admin-jwt-token" | jq '.data'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with comprehensive user statistics including user counts by type, KYC statistics, recent activity, and account status distribution
- Step 2: Returns 403 Forbidden with admin access required error
- Step 3: Response contains user_stats, kyc_stats, recent_stats, and account_stats objects

**Validation**:
- User statistics accurately reflect database counts
- KYC statistics show correct distribution of statuses
- Recent activity shows last 30 days data
- Account status distribution is accurate
- Audit log entry is created for admin action

---

## Test Case: User Management and Administration

**Objective**: Validate comprehensive user management capabilities including search, filtering, and detailed user information

**Prerequisites**: 
- Admin user account
- Multiple users of different types in the system
- Users with various statuses and KYC states

**Steps**:

1. **Test Get All Users with Pagination**:
   ```bash
   curl -X GET "http://localhost:8000/api/accounts/all-users/?page=1&per_page=20" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

2. **Test User Search and Filtering**:
   ```bash
   # Search by email
   curl -X GET "http://localhost:8000/api/accounts/all-users/?search=test@example.com" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Filter by user type
   curl -X GET "http://localhost:8000/api/accounts/all-users/?user_type=Artist" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Filter by KYC status
   curl -X GET "http://localhost:8000/api/accounts/all-users/?kyc_status=pending" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Filter by account status
   curl -X GET "http://localhost:8000/api/accounts/all-users/?account_status=active" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

3. **Test User Details Retrieval**:
   ```bash
   curl -X GET "http://localhost:8000/api/accounts/user-details/?user_id=user-uuid" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

4. **Test Ordering and Sorting**:
   ```bash
   # Order by registration date
   curl -X GET "http://localhost:8000/api/accounts/all-users/?order_by=-timestamp" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Order by last activity
   curl -X GET "http://localhost:8000/api/accounts/all-users/?order_by=-last_activity" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

5. **Test Invalid User Details Request**:
   ```bash
   curl -X GET "http://localhost:8000/api/accounts/user-details/?user_id=invalid-uuid" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

**Expected Results**:
- Step 1: Returns 200 OK with paginated user list and pagination metadata
- Step 2: Returns 200 OK with filtered results matching search/filter criteria
- Step 3: Returns 200 OK with detailed user information including profile data, permissions, and recent activity
- Step 4: Returns 200 OK with properly ordered results
- Step 5: Returns 404 Not Found with user not found error

**Validation**:
- Pagination works correctly with proper page navigation
- Search functionality matches users by email, name, and phone
- Filters accurately narrow results by specified criteria
- User details include type-specific profile information
- Recent activity shows user's audit trail
- Permissions list shows current user permissions

---

## Test Case: KYC Management and Approval

**Objective**: Validate KYC document review and approval workflow for administrators

**Prerequisites**: 
- Admin user account
- Users with pending KYC submissions
- KYC documents uploaded by users

**Steps**:

1. **Test Get Pending KYC Users**:
   ```bash
   curl -X GET http://localhost:8000/api/accounts/kyc-pending-users/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

2. **Test KYC Status Update - Approval**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-kyc-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "kyc_status": "verified",
       "admin_notes": "All documents verified successfully"
     }'
   ```

3. **Test KYC Status Update - Rejection**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-kyc-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid-2",
       "kyc_status": "rejected",
       "rejection_reason": "Document quality insufficient",
       "admin_notes": "Please resubmit with clearer images"
     }'
   ```

4. **Test Invalid KYC Status Update**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-kyc-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "kyc_status": "invalid_status"
     }'
   ```

5. **Test Missing Rejection Reason**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-kyc-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "kyc_status": "rejected"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with list of users having pending KYC with document information
- Step 2: Returns 200 OK with updated KYC status and admin decision metadata
- Step 3: Returns 200 OK with rejection status and reason stored
- Step 4: Returns 400 Bad Request with invalid KYC status error
- Step 5: Returns 400 Bad Request with missing rejection reason error

**Validation**:
- KYC status is updated in user profile
- Admin decision metadata is stored with timestamp and admin details
- Rejection reasons are properly recorded
- Audit log entries are created for all KYC decisions
- User notifications are triggered for status changes

---

## Test Case: User Account Status Management

**Objective**: Validate user account activation, deactivation, and suspension capabilities

**Prerequisites**: 
- Admin user account
- Active and inactive user accounts
- Users that can be safely suspended for testing

**Steps**:

1. **Test User Account Activation**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-user-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "inactive-user-uuid",
       "action": "activate",
       "reason": "Account review completed"
     }'
   ```

2. **Test User Account Deactivation**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-user-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "active-user-uuid",
       "action": "deactivate",
       "reason": "Policy violation"
     }'
   ```

3. **Test User Account Suspension**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-user-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "action": "suspend",
       "reason": "Temporary suspension for investigation",
       "suspension_duration": 72
     }'
   ```

4. **Test Self-Deactivation Prevention**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-user-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "admin-user-uuid",
       "action": "deactivate",
       "reason": "Testing self-deactivation"
     }'
   ```

5. **Test Invalid Action**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-user-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "action": "invalid_action"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with user activated and failed login attempts reset
- Step 2: Returns 200 OK with user deactivated
- Step 3: Returns 200 OK with user suspended for specified duration
- Step 4: Returns 400 Bad Request preventing admin from deactivating themselves
- Step 5: Returns 400 Bad Request with invalid action error

**Validation**:
- User account status is updated correctly in database
- Suspension duration is properly calculated and stored
- Failed login attempts are reset on activation
- Admin cannot perform destructive actions on their own account
- Audit logs capture all status change actions with reasons

---

## Test Case: Bulk User Operations

**Objective**: Validate bulk operations on multiple users including activation, deactivation, and data export

**Prerequisites**: 
- Admin user account
- Multiple user accounts for bulk operations
- Sufficient permissions for bulk actions

**Steps**:

1. **Test Bulk User Activation**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/bulk-user-operations/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_ids": ["user-uuid-1", "user-uuid-2", "user-uuid-3"],
       "operation": "activate",
       "operation_data": {
         "reason": "Bulk activation after review"
       }
     }'
   ```

2. **Test Bulk User Deactivation**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/bulk-user-operations/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_ids": ["user-uuid-4", "user-uuid-5"],
       "operation": "deactivate",
       "operation_data": {
         "reason": "Bulk deactivation for policy violations"
       }
     }'
   ```

3. **Test Bulk KYC Status Update**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/bulk-user-operations/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_ids": ["user-uuid-6", "user-uuid-7"],
       "operation": "update_kyc",
       "operation_data": {
         "kyc_status": "verified"
       }
     }'
   ```

4. **Test Bulk User Export**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/bulk-user-operations/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_ids": ["user-uuid-1", "user-uuid-2", "user-uuid-3"],
       "operation": "export"
     }'
   ```

5. **Test Invalid Bulk Operation**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/bulk-user-operations/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_ids": ["user-uuid-1"],
       "operation": "invalid_operation"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with summary of successful activations and any failures
- Step 2: Returns 200 OK with summary of successful deactivations
- Step 3: Returns 200 OK with summary of KYC status updates
- Step 4: Returns CSV file download with user data export
- Step 5: Returns 400 Bad Request with invalid operation error

**Validation**:
- Bulk operations are applied to all specified users
- Failed operations are reported with specific error messages
- Admin cannot bulk deactivate their own account
- Export generates properly formatted CSV with all user data
- Audit logs capture bulk operations with user counts and details

---

## Test Case: System Monitoring and Analytics

**Objective**: Validate admin dashboard analytics and system monitoring capabilities

**Prerequisites**: 
- Admin user account
- Platform data including users, tracks, plays, and royalties
- Various time periods of data for analytics

**Steps**:

1. **Test Admin Dashboard Data**:
   ```bash
   curl -X GET http://localhost:8000/api/admin/dashboard-data/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

2. **Test Dashboard with Date Range**:
   ```bash
   curl -X GET "http://localhost:8000/api/admin/dashboard-data/?start_date=2024-01-01&end_date=2024-01-31" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

3. **Test Dashboard with Period Filter**:
   ```bash
   # Daily data
   curl -X GET "http://localhost:8000/api/admin/dashboard-data/?period=daily" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Weekly data
   curl -X GET "http://localhost:8000/api/admin/dashboard-data/?period=weekly" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Monthly data
   curl -X GET "http://localhost:8000/api/admin/dashboard-data/?period=monthly" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

4. **Test Platform Analytics**:
   ```bash
   curl -X GET http://localhost:8000/api/analytics/admin-analytics/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

5. **Test Real-time Metrics**:
   ```bash
   curl -X GET "http://localhost:8000/api/analytics/realtime-metrics/?metrics=active_detections,revenue_today,plays_today" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

6. **Test Non-Admin Access to Analytics**:
   ```bash
   curl -X GET http://localhost:8000/api/analytics/admin-analytics/ \
     -H "Authorization: Bearer artist-jwt-token"
   ```

**Expected Results**:
- Step 1: Returns 200 OK with comprehensive dashboard data including platform stats, station performance, top earners, and activity data
- Step 2: Returns 200 OK with data filtered to specified date range
- Step 3: Returns 200 OK with data aggregated by specified time period
- Step 4: Returns 200 OK with detailed platform-wide analytics
- Step 5: Returns 200 OK with current real-time metrics
- Step 6: Returns 403 Forbidden with admin access required error

**Validation**:
- Dashboard data includes all required sections (platform stats, performance metrics, etc.)
- Date range filtering works correctly
- Period aggregation shows appropriate time-based grouping
- Real-time metrics reflect current system state
- Analytics data is accurate and up-to-date
- Non-admin users cannot access admin analytics

---

## Test Case: Analytics Export and Reporting

**Objective**: Validate analytics data export functionality and report generation

**Prerequisites**: 
- Admin user account
- Sufficient analytics data for meaningful exports
- Various export formats supported

**Steps**:

1. **Test Analytics Export Request**:
   ```bash
   curl -X POST http://localhost:8000/api/analytics/export-request/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "export_type": "platform_analytics",
       "export_format": "csv",
       "parameters": {
         "date_range": {
           "start": "2024-01-01T00:00:00Z",
           "end": "2024-01-31T23:59:59Z"
         },
         "include_metrics": ["revenue", "plays", "users"]
       }
     }'
   ```

2. **Test Export Status Check**:
   ```bash
   curl -X GET http://localhost:8000/api/analytics/export-status/export-uuid/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

3. **Test Export Download**:
   ```bash
   curl -X GET http://localhost:8000/api/analytics/download-export/export-uuid/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

4. **Test Invalid Export Type**:
   ```bash
   curl -X POST http://localhost:8000/api/analytics/export-request/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "export_type": "invalid_type",
       "export_format": "csv"
     }'
   ```

5. **Test Export with Different Formats**:
   ```bash
   # JSON export
   curl -X POST http://localhost:8000/api/analytics/export-request/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "export_type": "user_analytics",
       "export_format": "json"
     }'
   
   # Excel export
   curl -X POST http://localhost:8000/api/analytics/export-request/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "export_type": "revenue_analytics",
       "export_format": "xlsx"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with export request ID and queued status
- Step 2: Returns 200 OK with current export status and progress
- Step 3: Returns 200 OK with download URL or file content
- Step 4: Returns 400 Bad Request with invalid export type error
- Step 5: Returns 200 OK for each format with appropriate export requests

**Validation**:
- Export requests are queued and processed asynchronously
- Export status accurately reflects processing progress
- Generated files contain requested data in correct format
- Download links are secure and time-limited
- Different export formats are properly supported
- Export files are properly formatted and complete

---

## Test Case: Audit Trail and Logging

**Objective**: Validate comprehensive audit logging and trail functionality

**Prerequisites**: 
- Admin user account
- Historical user activity and admin actions
- Various types of system events logged

**Steps**:

1. **Test Get Audit Logs**:
   ```bash
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?page=1&per_page=50" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

2. **Test Audit Log Filtering**:
   ```bash
   # Filter by action
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?action=update_kyc_status" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Filter by resource type
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?resource_type=user" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Filter by user type
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?user_type=Admin" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Filter by date range
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?start_date=2024-01-01&end_date=2024-01-31" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

3. **Test Audit Log Search**:
   ```bash
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?search=user@example.com" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

4. **Test Status Code Filtering**:
   ```bash
   # Filter by successful actions
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?status_code=200" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Filter by failed actions
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?status_code=400" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

5. **Test Invalid Date Range**:
   ```bash
   curl -X GET "http://localhost:8000/api/accounts/audit-logs/?start_date=invalid-date" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

**Expected Results**:
- Step 1: Returns 200 OK with paginated audit log entries including user, action, resource, and timestamp information
- Step 2: Returns 200 OK with logs filtered by specified criteria
- Step 3: Returns 200 OK with logs matching search terms in user email, action, or resource
- Step 4: Returns 200 OK with logs filtered by HTTP status codes
- Step 5: Returns 200 OK ignoring invalid date filter (graceful handling)

**Validation**:
- Audit logs contain complete information about admin actions
- Filtering works correctly for all supported criteria
- Search functionality matches relevant fields
- Pagination handles large audit log datasets
- Log entries include IP addresses, user agents, and request/response data
- Sensitive information is properly masked in logs

---

## Test Case: Compliance and Regulatory Reporting

**Objective**: Validate compliance monitoring and regulatory reporting capabilities

**Prerequisites**: 
- Admin user account
- Station compliance data
- Partner PRO relationships
- Royalty cycles and distributions

**Steps**:

1. **Test Station Compliance Report**:
   ```bash
   curl -X GET "http://localhost:8000/api/stations/compliance-report/?station_id=station-uuid" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

2. **Test PRO Report Generation**:
   ```bash
   curl -X POST http://localhost:8000/api/royalties/generate-pro-report/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "partner_id": "partner-uuid",
       "cycle_id": "cycle-uuid",
       "format": "CSV"
     }'
   ```

3. **Test Reciprocal Payments Summary**:
   ```bash
   curl -X GET http://localhost:8000/api/royalties/reciprocal-payments-summary/cycle-uuid/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

4. **Test Partner PRO List**:
   ```bash
   curl -X GET http://localhost:8000/api/royalties/partners/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

5. **Test Royalty Cycles Management**:
   ```bash
   # Get cycles
   curl -X GET http://localhost:8000/api/royalties/cycles/ \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Create new cycle
   curl -X POST http://localhost:8000/api/royalties/cycles/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Q1 2024 Compliance Cycle",
       "period_start": "2024-01-01",
       "period_end": "2024-03-31",
       "territory": "GH"
     }'
   ```

6. **Test Invalid PRO Report Request**:
   ```bash
   curl -X POST http://localhost:8000/api/royalties/generate-pro-report/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "partner_id": "invalid-uuid",
       "format": "CSV"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with station compliance status and reporting data
- Step 2: Returns 201 Created with PRO report generation confirmation and file details
- Step 3: Returns 200 OK with summary of reciprocal payments for the cycle
- Step 4: Returns 200 OK with list of active partner PROs
- Step 5: Returns 200 OK for cycle list and 201 Created for new cycle
- Step 6: Returns 404 Not Found with invalid partner error

**Validation**:
- Compliance reports contain accurate station data
- PRO reports are generated in correct format with proper data
- Reciprocal payment summaries show accurate financial information
- Partner PRO management functions correctly
- Royalty cycles are properly managed and tracked
- Generated reports meet regulatory requirements

---

## Performance Test Cases

### Test Case: Large Dataset Management

**Objective**: Validate system performance with large user datasets and bulk operations

**Steps**:

1. **Test Large User List Performance**:
   ```bash
   # Request large page size
   curl -X GET "http://localhost:8000/api/accounts/all-users/?per_page=1000" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

2. **Test Complex Filtering Performance**:
   ```bash
   # Multiple filters with search
   curl -X GET "http://localhost:8000/api/accounts/all-users/?search=test&user_type=Artist&kyc_status=verified&account_status=active&order_by=-last_activity" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

3. **Test Bulk Operations Performance**:
   ```bash
   # Bulk operation on many users
   curl -X POST http://localhost:8000/api/accounts/bulk-user-operations/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_ids": ["user1", "user2", "user3", "...100 users..."],
       "operation": "activate"
     }'
   ```

**Expected Results**:
- Large datasets are handled efficiently with reasonable response times
- Complex filtering maintains good performance
- Bulk operations complete successfully without timeouts
- Memory usage remains stable during large operations

### Test Case: Concurrent Admin Operations

**Objective**: Test system behavior with multiple concurrent admin operations

**Steps**:

1. **Test Concurrent User Management**:
   ```bash
   # Multiple admins performing operations simultaneously
   for i in {1..10}; do
     curl -X GET http://localhost:8000/api/accounts/all-users/ \
       -H "Authorization: Bearer admin-jwt-token-$i" &
   done
   wait
   ```

**Expected Results**:
- System handles concurrent admin operations without conflicts
- Data consistency is maintained across concurrent operations
- No race conditions or deadlocks occur

---

## Security Test Cases

### Test Case: Admin Permission Validation

**Objective**: Validate that admin endpoints properly enforce permission requirements

**Steps**:

1. **Test Artist User Access to Admin Endpoints**:
   ```bash
   curl -X GET http://localhost:8000/api/accounts/user-management-overview/ \
     -H "Authorization: Bearer artist-jwt-token"
   ```

2. **Test Publisher User Access to Admin Endpoints**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-kyc-status/ \
     -H "Authorization: Bearer publisher-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "kyc_status": "verified"
     }'
   ```

3. **Test Unauthenticated Access**:
   ```bash
   curl -X GET http://localhost:8000/api/accounts/all-users/
   ```

**Expected Results**:
- All non-admin users receive 403 Forbidden responses
- Unauthenticated requests receive 401 Unauthorized responses
- Admin-only operations are properly protected

**Validation**:
- Permission checks are enforced at the API level
- Error messages don't leak sensitive information
- Audit logs capture unauthorized access attempts

---

## Test Results Template

Use this template to document test results for administrative API testing.

### Test Execution Summary
- **Date**: [Test execution date]
- **Tester**: [Name]
- **Environment**: [Local/Staging/Production]
- **Test Status**: [Pass/Fail/Partial]

### Test Case Results
| Test Case | Status | Response Time | Notes | Issues |
|-----------|--------|---------------|-------|--------|
| User Management Overview | ✅ Pass | 300ms | All statistics accurate | None |
| User Administration | ✅ Pass | 250ms | Search and filtering working | None |
| KYC Management | ⚠️ Partial | 400ms | Approval works, rejection slow | #127 |
| Account Status Management | ✅ Pass | 200ms | All status changes working | None |
| Bulk Operations | ❌ Fail | - | Bulk export timing out | #128 |
| System Monitoring | ✅ Pass | 500ms | Dashboard data complete | None |
| Analytics Export | ✅ Pass | 2s | Export generation working | None |
| Audit Trail | ✅ Pass | 350ms | Comprehensive logging | None |
| Compliance Reporting | ✅ Pass | 800ms | Reports generating correctly | None |

### Performance Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| User List Load Time | <500ms | 300ms | ✅ Pass |
| Dashboard Load Time | <1s | 500ms | ✅ Pass |
| Bulk Operation Time | <30s | 45s | ❌ Fail |
| Export Generation | <5min | 2min | ✅ Pass |
| Audit Log Query | <1s | 350ms | ✅ Pass |

### Security Validation
| Test | Status | Notes |
|------|--------|-------|
| Admin Permission Enforcement | ✅ Pass | All endpoints properly protected |
| Non-Admin Access Blocked | ✅ Pass | 403 responses for unauthorized users |
| Audit Logging | ✅ Pass | All admin actions logged |
| Data Sanitization | ✅ Pass | No sensitive data in logs |

### Issues Found
1. **Issue #127**: KYC rejection processing slower than approval
   - **Severity**: Medium
   - **Steps to reproduce**: Reject KYC with long rejection reason
   - **Expected**: <500ms response time
   - **Actual**: 800ms response time

2. **Issue #128**: Bulk export operation timing out for >500 users
   - **Severity**: High
   - **Steps to reproduce**: Export >500 users to CSV
   - **Expected**: Successful export within 30 seconds
   - **Actual**: Request timeout after 30 seconds

### Recommendations
1. Optimize KYC rejection processing by implementing async notification handling
2. Implement chunked export processing for large user datasets
3. Add progress indicators for long-running operations
4. Consider implementing export queue system for very large datasets
5. Add caching for frequently accessed dashboard statistics