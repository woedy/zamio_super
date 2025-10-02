# Enhanced Authentication and Session Management

This document describes the enhanced authentication and session management features implemented for the ZamIO platform.

## Overview

The enhanced authentication system provides:
- Comprehensive logout functionality with session cleanup
- Advanced audit logging for all authentication events
- Security event handling with rate limiting
- Session status monitoring
- Multi-session invalidation capabilities

## New Endpoints

### 1. Enhanced Logout (`/api/accounts/logout/`)
**Method:** POST  
**Authentication:** Required (Token)

Performs comprehensive logout with:
- Token invalidation (DRF Token)
- JWT token blacklisting (if available)
- FCM token cleanup
- Session data clearing
- Comprehensive audit logging

**Request:**
```json
{
    "refresh_token": "optional_jwt_refresh_token"
}
```

**Response:**
```json
{
    "message": "Successful",
    "data": {
        "message": "Successfully logged out",
        "user_id": "uuid",
        "email": "user@example.com",
        "logout_timestamp": "2024-01-01T12:00:00Z",
        "session_cleanup": {
            "token_invalidated": true,
            "jwt_blacklisted": false,
            "fcm_cleared": true,
            "session_data_cleared": true
        },
        "trace_id": "uuid"
    }
}
```

### 2. Invalidate All Sessions (`/api/accounts/invalidate-all-sessions/`)
**Method:** POST  
**Authentication:** Required (Token)

Invalidates all active sessions for the current user across all devices.

**Response:**
```json
{
    "message": "Successful",
    "data": {
        "message": "All sessions invalidated successfully",
        "user_id": "uuid",
        "invalidation_results": {
            "tokens_deleted": 3,
            "jwt_tokens_blacklisted": 2,
            "fcm_cleared": true,
            "session_data_cleared": true
        },
        "timestamp": "2024-01-01T12:00:00Z",
        "trace_id": "uuid"
    }
}
```

### 3. Session Status (`/api/accounts/session-status/`)
**Method:** GET  
**Authentication:** Required (Token)

Returns current session status and security information.

**Response:**
```json
{
    "message": "Successful",
    "data": {
        "user_id": "uuid",
        "email": "user@example.com",
        "user_type": "Artist",
        "is_active": true,
        "email_verified": true,
        "profile_complete": true,
        "kyc_status": "verified",
        "two_factor_enabled": false,
        "last_activity": "2024-01-01T12:00:00Z",
        "account_locked_until": null,
        "failed_login_attempts": 0,
        "current_ip": "192.168.1.1",
        "session_valid": true,
        "active_token_sessions": 1,
        "recent_activity": [
            {
                "action": "login_success",
                "timestamp": "2024-01-01T11:00:00Z",
                "ip_address": "192.168.1.1",
                "status_code": 200
            }
        ]
    }
}
```

### 4. Authentication Audit Logs (`/api/accounts/auth-audit-logs/`)
**Method:** GET  
**Authentication:** Required (Token)

Returns authentication-related audit logs for the current user.

**Query Parameters:**
- `page`: Page number (default: 1)
- `per_page`: Items per page (default: 20, max: 100)

**Response:**
```json
{
    "message": "Successful",
    "data": {
        "logs": [
            {
                "id": 123,
                "action": "login_success",
                "timestamp": "2024-01-01T12:00:00Z",
                "ip_address": "192.168.1.1",
                "user_agent": "Mozilla/5.0...",
                "status_code": 200,
                "resource_type": "authentication",
                "success": true
            }
        ],
        "pagination": {
            "page": 1,
            "per_page": 20,
            "total_count": 50,
            "total_pages": 3,
            "has_next": true,
            "has_previous": false
        }
    }
}
```

## Enhanced Security Features

### 1. Rate Limiting and Account Locking
- Failed login attempts are tracked per user
- Account is locked for 30 minutes after 5 failed attempts
- Comprehensive audit logging of security events

### 2. Enhanced Login Responses
All login endpoints now include security information:
```json
{
    "message": "Errors",
    "errors": {"email": ["Account locked due to multiple failed attempts..."]},
    "security_info": {
        "failed_attempts": 5,
        "account_locked": true
    }
}
```

### 3. Session Security Validation
- IP address change detection
- User agent anomaly detection
- Suspicious activity logging

### 4. Comprehensive Audit Logging
All authentication events are logged with:
- User information
- IP address and user agent
- Request and response data
- Trace IDs for correlation
- Timestamps and status codes

## Security Event Types

The system logs the following authentication events:
- `login_success` / `login_failed`
- `logout_success` / `logout_failed`
- `account_locked`
- `session_status_check`
- `invalidate_all_sessions`
- `suspicious_activity`
- `authentication_error`

## Implementation Details

### Files Created/Modified:
1. `accounts/api/views.py` - New enhanced authentication endpoints
2. `accounts/api/enhanced_auth.py` - Security handlers and middleware
3. `accounts/api/artist_views.py` - Enhanced ArtistLogin class
4. `accounts/api/publisher_view.py` - Enhanced PublisherLogin class
5. `accounts/api/station_views.py` - Enhanced StationLogin class
6. `accounts/api/urls.py` - New URL patterns
7. `accounts/tests/test_enhanced_authentication.py` - Comprehensive tests

### Key Components:
- `SecurityEventHandler` - Handles failed logins and security events
- `SessionSecurityValidator` - Validates session integrity
- `EnhancedTokenAuthentication` - Enhanced token authentication
- `AuthenticationAuditMiddleware` - Automatic audit logging

## Usage Examples

### Logout from current session:
```python
import requests

response = requests.post(
    'http://localhost:8000/api/accounts/logout/',
    headers={'Authorization': 'Token your_token_here'}
)
```

### Logout from all sessions:
```python
response = requests.post(
    'http://localhost:8000/api/accounts/invalidate-all-sessions/',
    headers={'Authorization': 'Token your_token_here'}
)
```

### Check session status:
```python
response = requests.get(
    'http://localhost:8000/api/accounts/session-status/',
    headers={'Authorization': 'Token your_token_here'}
)
```

## Security Considerations

1. **Token Management**: All tokens are properly invalidated on logout
2. **Audit Trail**: Complete audit trail for compliance and security monitoring
3. **Rate Limiting**: Prevents brute force attacks
4. **Session Validation**: Detects suspicious session activity
5. **Error Handling**: Secure error messages that don't leak information

## Testing

Run the enhanced authentication tests:
```bash
python manage.py test accounts.tests.test_enhanced_authentication
```

The test suite covers:
- Successful and failed logout scenarios
- Session invalidation
- Security event handling
- Audit logging
- Rate limiting functionality