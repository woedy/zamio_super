# Settings Page Implementation

## Overview

The Settings page provides a comprehensive interface for users to manage their account preferences, notification settings, privacy controls, and appearance options. This implementation fulfills all requirements from the platform improvements specification (Requirements 16.1-16.5).

## Features Implemented

### 1. Account Settings
- **Email Management**: Update email address with validation
- **Phone Number**: Update phone number with validation
- **Password Change**: Secure password update with current password verification
- **Form Validation**: Real-time validation with error messages
- **Password Visibility Toggle**: Show/hide password fields

### 2. Notification Settings
- **Email Notifications**: Control various email notification types
  - General email notifications
  - Royalty alerts
  - Match notifications (when music is detected)
  - Weekly reports
  - Marketing emails
- **Push Notifications**: Enable/disable push notifications and sound alerts
- **SMS Notifications**: Control text message notifications

### 3. Privacy Settings
- **Profile Privacy**: Control profile visibility and public information
  - Public profile visibility
  - Show earnings on profile
  - Show play counts
- **Data & Analytics**: Information about data collection and retention policies

### 4. Appearance Settings
- **Theme Selection**: Choose between Light, Dark, or System theme
  - Light theme for bright environments
  - Dark theme for low-light conditions
  - System theme that follows device preferences
- **Language & Region**: Select language and timezone preferences
- **Theme Preview**: Live preview of selected theme

## Technical Implementation

### State Management
- Uses `useFormWithValidation` hook for account form handling
- Local state for user preferences with API synchronization
- Theme state managed through `ThemeContext`

### API Integration
- `GET /api/accounts/profile/` - Load user profile data
- `PATCH /api/accounts/profile/` - Update account settings
- `GET /api/accounts/user-preferences/` - Load user preferences
- `PATCH /api/accounts/user-preferences/` - Update preferences

### Form Validation
- Email format validation
- Phone number format validation
- Password strength requirements (minimum 8 characters)
- Password confirmation matching
- Current password required for password changes

### Theme Persistence
- Theme preference stored in localStorage
- Automatic theme application on page load
- System theme detection for auto-switching

## Usage

The Settings page is accessible via:
- Sidebar navigation: "Settings" menu item
- Header dropdown: "Account Settings" link
- Direct URL: `/settings`

## Components Structure

```
Settings/
├── Settings.tsx          # Main settings component
└── README.md            # This documentation
```

## Dependencies

- `lucide-react` - Icons
- `useTheme` - Theme context hook
- `useFormWithValidation` - Form handling hook
- `useApiErrorHandler` - Error handling hook
- `api` - API client

## Requirements Fulfilled

✅ **16.1**: Create settings page with account preferences  
✅ **16.2**: Add notification settings management  
✅ **16.3**: Implement privacy settings configuration  
✅ **16.4**: Add theme preference persistence  
✅ **16.5**: Ensure settings are context-appropriate for artists

## Backend Implementation

### New Model Added
```python
class UserPreferences(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='preferences')
    
    # Notification preferences
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    push_notifications = models.BooleanField(default=True)
    marketing_emails = models.BooleanField(default=False)
    royalty_alerts = models.BooleanField(default=True)
    match_notifications = models.BooleanField(default=True)
    weekly_reports = models.BooleanField(default=True)
    sound_notifications = models.BooleanField(default=True)
    
    # Privacy preferences
    privacy_profile_public = models.BooleanField(default=False)
    privacy_show_earnings = models.BooleanField(default=False)
    privacy_show_plays = models.BooleanField(default=True)
    
    # Theme preferences
    theme_preference = models.CharField(max_length=10, default='system')
    language = models.CharField(max_length=10, default='en')
    timezone = models.CharField(max_length=50, default='UTC')
```

### New API Endpoint
- `user_preferences_view` - Handles GET and PATCH requests for user preferences
- Full audit logging for all preference changes
- Automatic creation of preferences on first access

### Enhanced Theme Context
- Support for 'system' theme preference
- Automatic system theme detection and following
- Separate storage of theme preference vs active theme

## Future Enhancements

- Two-factor authentication settings
- Data export/import functionality
- Advanced privacy controls
- Notification scheduling
- Custom theme creation
- Accessibility preferences