# ZamIO Email Task System

This document describes the background email task system implemented for the ZamIO platform.

## Overview

The email task system provides asynchronous email processing using Celery for:
- Email verification
- Password reset emails
- User invitation emails
- General notification emails

All email operations are queued and processed in the background to improve user experience and system performance.

## Requirements Addressed

- **1.1**: Email verification queued using Celery
- **1.2**: Password reset tokens processed as background tasks
- **1.3**: User invites handled asynchronously via Celery
- **1.4**: Email notifications queued for background processing
- **1.5**: Proper queuing for notification email tasks

## Components

### 1. Celery Tasks (`accounts/tasks.py`)

Core email tasks that handle the actual email sending:

- `send_email_verification_task`: Sends email verification emails
- `send_password_reset_email_task`: Sends password reset emails
- `send_user_invitation_email_task`: Sends user invitation emails
- `send_notification_email_task`: Sends notification emails to specific users
- `send_bulk_notification_email_task`: Sends bulk notifications to user types

### 2. Email Utilities (`accounts/email_utils.py`)

Convenient wrapper functions for queuing email tasks:

- `send_verification_email(user, base_url=None)`
- `send_password_reset_email(user, base_url=None)`
- `send_invitation_email(inviter, invitee_email, user_type, base_url=None)`
- `send_notification_to_users(user_ids, subject, message, ...)`
- `send_notification_to_user_types(user_types, subject, message, ...)`

### 3. Email Templates (`templates/emails/`)

HTML and text email templates:

- `email_verification.html/txt`: Email verification templates
- `password_reset.html/txt`: Password reset templates
- `user_invitation.html/txt`: User invitation templates
- `notification.html/txt`: General notification templates
- `welcome.html/txt`: Welcome email templates

### 4. API Endpoints (`accounts/api/email_views.py`)

REST API endpoints for email operations:

- `POST /api/accounts/email/resend-verification/`: Resend email verification
- `POST /api/accounts/email/request-password-reset/`: Request password reset
- `POST /api/accounts/email/send-invitation/`: Send user invitation
- `POST /api/accounts/email/send-notification-to-users/`: Send notifications to specific users
- `POST /api/accounts/email/send-notification-to-user-type/`: Send notifications to user types
- `GET /api/accounts/email/system-status/`: Get email system status

## Usage Examples

### 1. Send Email Verification

```python
from accounts.email_utils import send_verification_email

# Send verification email to a user
task_id = send_verification_email(user)
print(f"Email verification queued with task ID: {task_id}")
```

### 2. Send Password Reset Email

```python
from accounts.email_utils import send_password_reset_email

# Send password reset email
task_id = send_password_reset_email(user)
print(f"Password reset email queued with task ID: {task_id}")
```

### 3. Send User Invitation

```python
from accounts.email_utils import send_invitation_email

# Send invitation to a new artist
task_id = send_invitation_email(
    inviter=current_user,
    invitee_email="newartist@example.com",
    user_type="Artist"
)
```

### 4. Send Notifications

```python
from accounts.email_utils import send_notification_to_users

# Send notification to specific users
user_ids = [1, 2, 3, 4, 5]
task_id = send_notification_to_users(
    user_ids=user_ids,
    subject="Platform Update",
    message="We've released new features!",
    email_type="update"
)
```

### 5. Send Bulk Notifications by User Type

```python
from accounts.email_utils import send_notification_to_user_types

# Send notification to all artists
task_ids = send_notification_to_user_types(
    user_types=["Artist"],
    subject="New Royalty Features",
    message="Check out our new royalty tracking features!",
    email_type="feature_announcement"
)
```

## API Usage Examples

### Resend Email Verification

```bash
curl -X POST http://localhost:9001/api/accounts/email/resend-verification/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### Request Password Reset

```bash
curl -X POST http://localhost:9001/api/accounts/email/request-password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

### Send User Invitation

```bash
curl -X POST http://localhost:9001/api/accounts/email/send-invitation/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "user_type": "Artist"
  }'
```

### Send Notification to Specific Users

```bash
curl -X POST http://localhost:9001/api/accounts/email/send-notification-to-users/ \
  -H "Authorization: Token YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_ids": [1, 2, 3],
    "subject": "Important Update",
    "message": "Please update your profile information.",
    "email_type": "alert"
  }'
```

## Configuration

### Email Backend Configuration

The system supports both SMTP and file-based email backends:

```python
# SMTP Configuration (production)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = 'your-email@gmail.com'
EMAIL_HOST_PASSWORD = 'your-app-password'
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# File-based Configuration (development)
EMAIL_BACKEND = 'django.core.mail.backends.filebased.EmailBackend'
EMAIL_FILE_PATH = '/path/to/sent_emails'
```

### Celery Configuration

Email tasks are routed to appropriate queues based on priority:

- Email verification: `high` priority queue
- Password reset: `high` priority queue
- User invitations: `normal` priority queue
- Notifications: `normal` priority queue
- Bulk notifications: `low` priority queue

## Task Monitoring

### Check Task Registration

```python
from core.celery import app

# List all registered tasks
tasks = list(app.tasks.keys())
email_tasks = [t for t in tasks if 'accounts.tasks' in t]
print("Registered email tasks:", email_tasks)
```

### Monitor Task Execution

```bash
# Check Celery worker status
celery -A core inspect active

# Check registered tasks
celery -A core inspect registered

# Monitor task execution
celery -A core events
```

## Error Handling

All email tasks include:

- Automatic retry with exponential backoff
- Maximum retry limits (3 retries by default)
- Comprehensive error logging
- Audit trail logging for all email activities

## Security Considerations

- Email addresses are validated before sending
- Tokens are cryptographically secure (32 characters)
- Password reset emails don't reveal if email exists (prevents enumeration)
- All email activities are logged for audit purposes
- Rate limiting should be implemented at the API level

## Testing

### Validate Email System

```bash
# Run the email system validation script
cd zamio_backend
python manage.py shell -c "
from accounts.email_utils import validate_email_configuration
print(validate_email_configuration())
"
```

### Test Task Registration

```bash
# Test task imports
python manage.py shell -c "
from accounts.tasks import send_email_verification_task
print('Email tasks imported successfully')
"
```

## Troubleshooting

### Common Issues

1. **Tasks not registered**: Check Celery worker logs and ensure all apps are in INSTALLED_APPS
2. **Email not sending**: Verify email backend configuration and credentials
3. **Templates not found**: Ensure email templates are in the correct directory
4. **Import errors**: Check for circular imports and Django app configuration

### Debug Commands

```bash
# Check email configuration
python manage.py shell -c "
from django.conf import settings
print('Email Backend:', settings.EMAIL_BACKEND)
print('Default From Email:', settings.DEFAULT_FROM_EMAIL)
"

# Test email sending (development)
python manage.py shell -c "
from django.core.mail import send_mail
send_mail('Test', 'Test message', 'from@example.com', ['to@example.com'])
print('Test email sent')
"
```

## Future Enhancements

- Email template customization per user type
- Email delivery status tracking
- Email analytics and reporting
- A/B testing for email templates
- Email preference management
- Unsubscribe functionality
- Email bounce handling