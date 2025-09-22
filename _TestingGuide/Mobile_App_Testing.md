# Mobile App Core Functionality Testing Guide

## Overview

This document covers testing the ZamIO mobile app core functionality, including audio capture, background recording, upload and sync processes, and user authentication. The mobile app is designed for radio stations to capture and upload audio samples for music detection and royalty tracking.

## Application Overview

### Technology Stack
- **Framework**: Flutter with Dart
- **Audio Recording**: flutter_sound package
- **Background Processing**: flutter_foreground_task
- **Local Storage**: SQLite with custom database service
- **HTTP Client**: http package for API communication
- **State Management**: ChangeNotifier pattern
- **File Management**: path_provider for local file storage

### Key Features
- Station authentication and session management
- Continuous audio capture with configurable intervals
- Background recording with foreground service
- Offline capture with local storage
- Automatic sync when connectivity is available
- Upload progress tracking and retry mechanisms
- Storage management and cleanup

## Mobile App User Journeys

| Journey | Description | Key Components |
|---------|-------------|----------------|
| **Authentication** | Station login and session management | LoginPage → AuthStore → HomeScaffold |
| **Audio Capture** | Continuous background audio recording | RadioSniffer → OfflineCaptureService → FlutterSoundRecorder |
| **Offline Storage** | Local capture storage and management | DatabaseService → StorageService → AudioCapture models |
| **Sync Process** | Upload captured audio to backend | SyncService → ConnectivityService → HTTP upload |
| **Background Operation** | Foreground service for continuous operation | ForegroundService → NotificationService |
| **Settings Management** | Configure capture settings and preferences | SettingsPage → CaptureSettings → Storage |

---

## Test Case: Station Authentication and Session Management

**Objective**: Validate station login process, session persistence, and authentication state management

**Prerequisites**: 
- Mobile device with app installed
- Valid station credentials
- Backend server accessible
- Network connectivity available

**Test Steps**:

1. **Test Initial App Launch**:
   ```dart
   // App startup flow
   - Launch the mobile app
   - Verify splash screen displays (if applicable)
   - Check service initialization completes
   - Verify navigation to appropriate screen based on auth state
   ```

2. **Test Login Form Validation**:
   ```dart
   // Form field validation
   const testCases = [
     {'field': 'baseUrl', 'value': '', 'expectedError': 'Required'},
     {'field': 'email', 'value': '', 'expectedError': 'Required'},
     {'field': 'password', 'value': '', 'expectedError': 'Required'},
     {'field': 'baseUrl', 'value': 'invalid-url', 'expectedError': 'Invalid URL'},
   ];
   
   testCases.forEach((testCase) {
     - Clear all form fields
     - Enter invalid data for specific field
     - Attempt form submission
     - Verify appropriate validation error displays
   });
   ```

3. **Test Successful Login Process**:
   ```dart
   const validCredentials = {
     'baseUrl': 'http://192.168.43.121:8000/',
     'email': 'station@example.com',
     'password': 'validPassword123'
   };
   
   - Enter valid server base URL
   - Enter valid station email
   - Enter valid password
   - Tap "Login" button
   - Verify loading state displays
   - Check successful navigation to HomeScaffold
   - Verify session data is stored locally
   ```

4. **Test Login Error Handling**:
   ```dart
   const errorScenarios = [
     {'scenario': 'invalid_credentials', 'expectedError': 'Login failed'},
     {'scenario': 'server_unreachable', 'expectedError': 'Network error'},
     {'scenario': 'invalid_response', 'expectedError': 'Invalid response'},
   ];
   
   errorScenarios.forEach((scenario) {
     - Enter credentials for error scenario
     - Attempt login
     - Verify appropriate error message displays
     - Check loading state is cleared
     - Verify user remains on login screen
   });
   ```

5. **Test Session Persistence**:
   ```dart
   - Complete successful login
   - Close the app completely
   - Relaunch the app
   - Verify automatic navigation to HomeScaffold
   - Check session data is loaded correctly
   - Verify no re-authentication required
   ```

6. **Test Session Expiration Handling**:
   ```dart
   - Login with valid credentials
   - Simulate session expiration (server-side)
   - Attempt API operation
   - Verify automatic logout occurs
   - Check navigation back to login screen
   - Verify session data is cleared
   ```

7. **Test Logout Functionality**:
   ```dart
   - Navigate to settings or profile section
   - Tap logout button
   - Verify confirmation dialog (if applicable)
   - Confirm logout action
   - Check navigation to login screen
   - Verify session data is cleared from storage
   ```

**Expected Results**:
- Login form validates input correctly
- Successful authentication navigates to main app
- Session persists across app restarts
- Error handling provides clear feedback
- Logout clears session and returns to login

**Validation Criteria**:
- Form validation prevents invalid submissions
- Network errors are handled gracefully
- Session management works reliably
- Authentication state is consistent
- Security best practices are followed

---

## Test Case: Audio Capture and Background Recording

**Objective**: Validate continuous audio capture functionality, background operation, and recording quality

**Prerequisites**: 
- Authenticated station session
- Microphone permissions granted
- Storage permissions granted
- Background app permissions enabled

**Test Steps**:

1. **Test Microphone Permission Handling**:
   ```dart
   // Permission request flow
   - Launch app without microphone permission
   - Navigate to capture screen
   - Verify permission request dialog appears
   - Test permission denial handling
   - Test permission grant flow
   - Verify appropriate UI state for each permission status
   ```

2. **Test Audio Capture Initialization**:
   ```dart
   - Navigate to main capture screen (StatusPage)
   - Verify recorder initialization completes
   - Check temporary directory setup
   - Verify chunk file paths are created
   - Test initialization error handling
   ```

3. **Test Capture Service Start/Stop**:
   ```dart
   const captureConfig = {
     'chunkDurationSeconds': 10,
     'codec': 'aacADTS',
     'sampleRate': 16000,
     'numChannels': 1,
     'bitRate': 24000
   };
   
   // Start capture service
   - Tap "Go Live" button
   - Verify service starts successfully
   - Check recording indicator appears
   - Verify foreground service notification
   - Check audio level meter animation
   
   // Stop capture service
   - Tap "Stop" button
   - Verify recording stops
   - Check service status updates
   - Verify foreground service stops
   ```

4. **Test Chunk Recording and Rotation**:
   ```dart
   - Start capture service
   - Wait for first chunk duration (10 seconds)
   - Verify chunk file A is created
   - Wait for second chunk duration
   - Verify chunk file B is created
   - Check chunk rotation between A and B files
   - Verify gapless recording transition
   ```

5. **Test Background Recording Persistence**:
   ```dart
   - Start capture service
   - Minimize app to background
   - Wait for multiple chunk durations
   - Verify recording continues in background
   - Check foreground service notification persists
   - Return app to foreground
   - Verify capture status is maintained
   ```

6. **Test Audio Quality and Format**:
   ```dart
   - Start recording session
   - Capture audio chunks
   - Verify file format is AAC ADTS
   - Check sample rate is 16kHz
   - Verify mono channel recording
   - Test bit rate is 24kbps
   - Validate file size expectations
   ```

7. **Test Capture Statistics and UI Updates**:
   ```dart
   - Monitor capture statistics during recording
   - Verify total songs counter updates
   - Check confidence score calculations
   - Test regional data updates
   - Verify UI refresh intervals
   - Check countdown ring animation
   ```

8. **Test Error Handling During Capture**:
   ```dart
   const errorScenarios = [
     'microphone_access_lost',
     'storage_full',
     'recording_interrupted',
     'service_crash'
   ];
   
   errorScenarios.forEach((scenario) {
     - Simulate error condition during recording
     - Verify appropriate error handling
     - Check user notification
     - Test recovery mechanisms
   });
   ```

**Expected Results**:
- Audio capture starts and stops reliably
- Background recording continues uninterrupted
- Chunk rotation works without gaps
- Audio quality meets specifications
- UI updates reflect capture status accurately
- Error conditions are handled gracefully

**Validation Criteria**:
- Recording quality is consistent
- Background operation is stable
- File management works correctly
- UI state synchronization is accurate
- Error recovery is effective

---

## Test Case: Offline Storage and Data Management

**Objective**: Validate local storage of captured audio, database operations, and storage management

**Prerequisites**: 
- App with capture functionality active
- Storage permissions granted
- Various storage scenarios (low space, full storage)
- Database service initialized

**Test Steps**:

1. **Test Database Initialization and Schema**:
   ```dart
   - Launch app for first time
   - Verify database file creation
   - Check table schema creation
   - Test database migration (if applicable)
   - Verify initial data setup
   ```

2. **Test Audio Capture Storage**:
   ```dart
   const captureData = {
     'id': 'uuid-v4-string',
     'stationId': 'station-123',
     'filePath': '/temp/capture_timestamp.aac',
     'capturedAt': DateTime.now(),
     'durationSeconds': 10,
     'status': CaptureStatus.pending
   };
   
   - Start audio capture
   - Verify AudioCapture record creation in database
   - Check file storage in temporary directory
   - Verify metadata accuracy
   - Test file size calculation
   ```

3. **Test Capture Status Management**:
   ```dart
   const statusTransitions = [
     CaptureStatus.pending,
     CaptureStatus.uploading,
     CaptureStatus.completed,
     CaptureStatus.failed,
     CaptureStatus.retrying
   ];
   
   statusTransitions.forEach((status) {
     - Update capture status in database
     - Verify status change persistence
     - Check UI reflects status change
     - Test status-based filtering
   });
   ```

4. **Test Storage Limit Management**:
   ```dart
   - Configure low storage limit (e.g., 100MB)
   - Generate captures until limit approached
   - Verify storage warning displays
   - Test capture skipping when limit reached
   - Check automatic cleanup triggers
   ```

5. **Test Data Retrieval and Querying**:
   ```dart
   const queryTests = [
     {'method': 'getPendingCaptures', 'expectedFilter': 'status = pending'},
     {'method': 'getFailedCaptures', 'expectedFilter': 'status = failed'},
     {'method': 'getAllCaptures', 'expectedLimit': 'pagination'},
   ];
   
   queryTests.forEach((test) {
     - Execute database query method
     - Verify correct data filtering
     - Check result ordering
     - Test pagination parameters
   });
   ```

6. **Test Cleanup and Maintenance**:
   ```dart
   - Generate old completed captures (>24 hours)
   - Trigger automatic cleanup
   - Verify old captures are deleted
   - Check orphaned file cleanup
   - Test storage statistics update
   ```

7. **Test Data Integrity and Validation**:
   ```dart
   - Create capture with invalid data
   - Verify validation errors
   - Test foreign key constraints
   - Check data consistency after operations
   - Verify transaction rollback on errors
   ```

8. **Test Storage Statistics and Monitoring**:
   ```dart
   - Generate various capture statuses
   - Check statistics calculation accuracy
   - Verify storage usage tracking
   - Test percentage calculations
   - Check real-time updates
   ```

**Expected Results**:
- Database operations complete successfully
- File storage works reliably
- Status management is accurate
- Storage limits are enforced
- Cleanup processes work effectively
- Data integrity is maintained

**Validation Criteria**:
- Database schema is correct
- File operations are atomic
- Storage monitoring is accurate
- Cleanup is effective
- Data consistency is maintained

---

## Test Case: Upload and Sync Process Validation

**Objective**: Validate automatic sync functionality, upload progress tracking, and retry mechanisms

**Prerequisites**: 
- Authenticated session with valid token
- Captured audio files in local storage
- Network connectivity (online/offline scenarios)
- Backend server accessible

**Test Steps**:

1. **Test Sync Service Initialization**:
   ```dart
   - Launch app with pending captures
   - Verify SyncService initialization
   - Check connectivity monitoring setup
   - Test periodic sync timer setup
   - Verify notification service integration
   ```

2. **Test Automatic Sync Trigger**:
   ```dart
   const syncTriggers = [
     'connectivity_restored',
     'periodic_timer',
     'app_foreground',
     'manual_trigger'
   ];
   
   syncTriggers.forEach((trigger) {
     - Create pending captures
     - Simulate sync trigger condition
     - Verify sync process starts
     - Check sync status updates
   });
   ```

3. **Test Upload Process Flow**:
   ```dart
   const uploadData = {
     'file': 'capture_audio.aac',
     'stationId': 'station-123',
     'chunkId': 'uuid-chunk-id',
     'startedAt': '2024-01-15T14:30:00Z',
     'durationSeconds': 10,
     'metadata': {'quality': 'standard'}
   };
   
   - Start sync with pending capture
   - Verify multipart form data creation
   - Check authentication header inclusion
   - Test file upload progress
   - Verify server response handling
   ```

4. **Test Batch Upload Processing**:
   ```dart
   - Create multiple pending captures (10+)
   - Start sync process
   - Verify batch processing (max 3 concurrent)
   - Check upload order (oldest first)
   - Test batch completion handling
   ```

5. **Test Upload Progress Tracking**:
   ```dart
   - Start upload for large audio file
   - Monitor upload progress updates
   - Verify progress percentage accuracy
   - Check UI progress indicator updates
   - Test progress completion notification
   ```

6. **Test Retry Mechanism**:
   ```dart
   const failureScenarios = [
     {'type': 'network_timeout', 'retryable': true},
     {'type': 'server_error_500', 'retryable': true},
     {'type': 'auth_error_401', 'retryable': false},
     {'type': 'file_not_found', 'retryable': false}
   ];
   
   failureScenarios.forEach((scenario) {
     - Simulate upload failure
     - Verify retry logic execution
     - Check retry count increment
     - Test max retry limit enforcement
   });
   ```

7. **Test Offline/Online Sync Behavior**:
   ```dart
   // Offline behavior
   - Disable network connectivity
   - Generate audio captures
   - Verify captures stored locally
   - Check sync service pauses
   
   // Online restoration
   - Restore network connectivity
   - Verify automatic sync resumption
   - Check pending uploads processing
   - Test connectivity change handling
   ```

8. **Test Upload Completion and Cleanup**:
   ```dart
   - Complete successful upload
   - Verify capture status update to 'completed'
   - Check local file deletion
   - Test database record update
   - Verify statistics update
   ```

**Expected Results**:
- Sync process starts automatically when appropriate
- Upload progress is tracked accurately
- Retry mechanisms work for transient failures
- Offline/online transitions are handled smoothly
- Successful uploads clean up local files
- Failed uploads are marked appropriately

**Validation Criteria**:
- Upload success rate is high
- Progress tracking is accurate
- Retry logic is effective
- Network state handling is robust
- Cleanup processes work correctly

---

## Test Case: Background Operation and Foreground Service

**Objective**: Validate background operation stability, foreground service management, and system integration

**Prerequisites**: 
- Background app permissions granted
- Notification permissions enabled
- Battery optimization disabled for app
- Device with various Android/iOS versions

**Test Steps**:

1. **Test Foreground Service Initialization**:
   ```dart
   - Start capture service
   - Verify foreground service starts
   - Check notification appears in status bar
   - Test notification content accuracy
   - Verify service persistence
   ```

2. **Test Background Operation Stability**:
   ```dart
   const backgroundTests = [
     {'duration': '30_minutes', 'expectedBehavior': 'continuous_recording'},
     {'duration': '2_hours', 'expectedBehavior': 'stable_operation'},
     {'duration': '8_hours', 'expectedBehavior': 'overnight_recording'}
   ];
   
   backgroundTests.forEach((test) {
     - Start capture service
     - Move app to background
     - Wait for test duration
     - Verify continuous operation
     - Check capture file generation
   });
   ```

3. **Test System Resource Management**:
   ```dart
   - Monitor CPU usage during background recording
   - Check memory consumption over time
   - Verify battery usage is reasonable
   - Test thermal management impact
   - Check storage I/O patterns
   ```

4. **Test App Lifecycle Integration**:
   ```dart
   const lifecycleEvents = [
     'app_minimized',
     'app_restored',
     'screen_locked',
     'screen_unlocked',
     'device_reboot'
   ];
   
   lifecycleEvents.forEach((event) {
     - Start capture service
     - Trigger lifecycle event
     - Verify service continues operation
     - Check state restoration
   });
   ```

5. **Test Notification Management**:
   ```dart
   - Start foreground service
   - Verify notification displays correctly
   - Test notification tap behavior
   - Check notification update frequency
   - Test notification dismissal handling
   ```

6. **Test Service Recovery and Restart**:
   ```dart
   - Start capture service
   - Force kill app process
   - Verify service restart (if configured)
   - Check data recovery
   - Test state restoration
   ```

7. **Test Battery Optimization Handling**:
   ```dart
   - Enable battery optimization for app
   - Start capture service
   - Monitor service behavior over time
   - Check for service termination
   - Test user guidance for optimization settings
   ```

8. **Test Multi-tasking Scenarios**:
   ```dart
   - Start capture service
   - Open multiple other apps
   - Perform memory-intensive operations
   - Verify capture service priority
   - Check recording continuity
   ```

**Expected Results**:
- Foreground service operates reliably in background
- System resource usage is reasonable
- App lifecycle events don't interrupt recording
- Notifications provide appropriate user feedback
- Service recovery works when needed
- Battery optimization is handled appropriately

**Validation Criteria**:
- Background operation is stable for extended periods
- Resource usage is within acceptable limits
- System integration follows platform best practices
- User experience is smooth across lifecycle events
- Service reliability is high

---

## Test Case: Connectivity and Network Handling

**Objective**: Validate network state management, connectivity changes, and offline operation

**Prerequisites**: 
- Device with WiFi and cellular connectivity
- Ability to control network connectivity
- Various network conditions (slow, fast, intermittent)
- Backend server with different response scenarios

**Test Steps**:

1. **Test Connectivity Detection**:
   ```dart
   const connectivityStates = [
     'wifi_connected',
     'cellular_connected', 
     'no_connection',
     'limited_connection'
   ];
   
   connectivityStates.forEach((state) {
     - Set device to connectivity state
     - Verify app detects state correctly
     - Check UI updates reflect connectivity
     - Test service behavior adaptation
   });
   ```

2. **Test Network State Transitions**:
   ```dart
   - Start with WiFi connection
   - Switch to cellular data
   - Verify seamless transition
   - Check ongoing operations continue
   - Test sync process adaptation
   
   - Disconnect all networks
   - Verify offline mode activation
   - Reconnect network
   - Check automatic sync resumption
   ```

3. **Test Offline Operation Mode**:
   ```dart
   - Disable all network connectivity
   - Start capture service
   - Verify audio recording continues
   - Check local storage accumulation
   - Test offline UI indicators
   - Verify sync queue management
   ```

4. **Test Upload Behavior on Poor Connectivity**:
   ```dart
   const networkConditions = [
     {'type': 'slow_connection', 'speed': '56kbps'},
     {'type': 'intermittent', 'pattern': 'on_off_cycles'},
     {'type': 'high_latency', 'delay': '5000ms'}
   ];
   
   networkConditions.forEach((condition) {
     - Simulate network condition
     - Attempt file upload
     - Verify timeout handling
     - Check retry behavior
     - Test user feedback
   });
   ```

5. **Test Sync Queue Management**:
   ```dart
   - Generate captures while offline
   - Verify queue accumulation
   - Restore connectivity
   - Check queue processing order
   - Test queue size limits
   - Verify queue persistence
   ```

6. **Test Network Error Handling**:
   ```dart
   const networkErrors = [
     {'error': 'dns_resolution_failed', 'expected': 'retry_with_delay'},
     {'error': 'connection_timeout', 'expected': 'exponential_backoff'},
     {'error': 'ssl_handshake_failed', 'expected': 'user_notification'}
   ];
   
   networkErrors.forEach((errorCase) {
     - Simulate network error
     - Verify error detection
     - Check error handling strategy
     - Test user notification
   });
   ```

7. **Test Bandwidth Adaptation**:
   ```dart
   - Monitor upload behavior on different connection speeds
   - Verify appropriate timeout values
   - Check concurrent upload limits
   - Test bandwidth usage optimization
   - Verify user data usage consideration
   ```

8. **Test Server Communication Resilience**:
   ```dart
   const serverScenarios = [
     {'response': 'server_maintenance_503', 'expected': 'retry_later'},
     {'response': 'rate_limit_429', 'expected': 'backoff_strategy'},
     {'response': 'server_error_500', 'expected': 'retry_with_limit'}
   ];
   
   serverScenarios.forEach((scenario) {
     - Configure server to return specific response
     - Attempt upload operation
     - Verify client handling strategy
     - Check retry behavior
   });
   ```

**Expected Results**:
- Connectivity changes are detected accurately
- Offline operation works seamlessly
- Network errors are handled gracefully
- Upload behavior adapts to connection quality
- Sync queue management is reliable
- Server communication is resilient

**Validation Criteria**:
- Network state detection is accurate
- Offline/online transitions are smooth
- Error handling provides good user experience
- Upload success rate is high across conditions
- Resource usage is optimized for connection type

---

## Performance Test Cases

### Test Case: Audio Capture Performance and Resource Usage

**Objective**: Validate app performance during extended audio capture sessions

**Test Steps**:

1. **Test Extended Recording Sessions**:
   ```dart
   const performanceTests = [
     {'duration': '1_hour', 'metric': 'cpu_usage'},
     {'duration': '4_hours', 'metric': 'memory_consumption'},
     {'duration': '12_hours', 'metric': 'battery_usage'},
     {'duration': '24_hours', 'metric': 'storage_growth'}
   ];
   
   performanceTests.forEach((test) {
     - Start capture service
     - Monitor specified metric over duration
     - Verify performance stays within limits
     - Check for memory leaks
     - Test thermal impact
   });
   ```

2. **Test Concurrent Operations Performance**:
   ```dart
   - Start audio capture
   - Simultaneously run sync process
   - Monitor system resource usage
   - Verify both operations complete successfully
   - Check for performance degradation
   ```

3. **Test Storage I/O Performance**:
   ```dart
   - Generate high-frequency captures
   - Monitor disk I/O patterns
   - Verify write performance
   - Check file system impact
   - Test storage fragmentation
   ```

**Expected Results**:
- CPU usage remains under 10% during recording
- Memory usage is stable without leaks
- Battery consumption is reasonable for audio recording
- Storage I/O doesn't impact system performance

### Test Case: Large-Scale Data Handling

**Objective**: Test app behavior with large amounts of captured data

**Test Steps**:

1. **Test Large Upload Queue Processing**:
   ```dart
   - Generate 100+ pending captures
   - Start sync process
   - Monitor processing performance
   - Verify queue processing efficiency
   - Check memory usage during batch processing
   ```

2. **Test Database Performance with Large Datasets**:
   ```dart
   - Insert 10,000+ capture records
   - Test query performance
   - Verify pagination efficiency
   - Check database file size growth
   - Test cleanup operation performance
   ```

**Expected Results**:
- Large queues process efficiently
- Database queries remain fast with large datasets
- Memory usage scales appropriately
- Cleanup operations complete in reasonable time

---

## Security Test Cases

### Test Case: Authentication and Data Security

**Objective**: Validate security measures for authentication and data protection

**Test Steps**:

1. **Test Authentication Token Security**:
   ```dart
   - Verify tokens are stored securely (encrypted storage)
   - Check token transmission uses HTTPS
   - Test token expiration handling
   - Verify token refresh mechanisms
   ```

2. **Test Local Data Protection**:
   ```dart
   - Check audio files are stored securely
   - Verify database encryption (if implemented)
   - Test file permissions are restrictive
   - Check temporary file cleanup
   ```

3. **Test Network Communication Security**:
   ```dart
   - Verify all API calls use HTTPS
   - Check certificate validation
   - Test SSL/TLS configuration
   - Verify no sensitive data in logs
   ```

**Expected Results**:
- Authentication tokens are handled securely
- Local data is protected appropriately
- Network communication is encrypted
- No sensitive information is exposed

---

## Platform-Specific Test Cases

### Test Case: Android-Specific Functionality

**Objective**: Validate Android-specific features and behaviors

**Test Steps**:

1. **Test Android Permissions**:
   ```dart
   const permissions = [
     'RECORD_AUDIO',
     'WRITE_EXTERNAL_STORAGE',
     'FOREGROUND_SERVICE',
     'WAKE_LOCK'
   ];
   
   permissions.forEach((permission) {
     - Test permission request flow
     - Verify permission denial handling
     - Check permission revocation handling
     - Test runtime permission changes
   });
   ```

2. **Test Android Background Restrictions**:
   ```dart
   - Test behavior with battery optimization enabled
   - Verify doze mode handling
   - Check app standby behavior
   - Test background app limits
   ```

3. **Test Android Notifications**:
   ```dart
   - Verify foreground service notification
   - Test notification channel configuration
   - Check notification importance levels
   - Test notification actions
   ```

**Expected Results**:
- Permissions are handled correctly
- Background restrictions are managed appropriately
- Notifications follow Android guidelines
- App works across different Android versions

### Test Case: iOS-Specific Functionality

**Objective**: Validate iOS-specific features and behaviors

**Test Steps**:

1. **Test iOS Background App Refresh**:
   ```dart
   - Test with Background App Refresh enabled/disabled
   - Verify background processing limits
   - Check iOS background task management
   - Test app suspension handling
   ```

2. **Test iOS Audio Session Management**:
   ```dart
   - Verify audio session configuration
   - Test interruption handling (calls, other apps)
   - Check audio route changes
   - Test audio session activation/deactivation
   ```

**Expected Results**:
- Background operation works within iOS limits
- Audio session is managed correctly
- Interruptions are handled gracefully
- App follows iOS guidelines

---

## Test Results Template

Use this template to document test results for mobile app testing.

### Test Execution Summary
- **Date**: [Test execution date]
- **Tester**: [Name]
- **Device**: [Device model and OS version]
- **App Version**: [Version number]
- **Test Status**: [Pass/Fail/Partial]

### Test Case Results
| Test Case | Status | Duration | Notes | Issues |
|-----------|--------|----------|-------|--------|
| Authentication | ✅ Pass | 5min | Login flow working correctly | None |
| Audio Capture | ✅ Pass | 30min | Recording quality good | None |
| Offline Storage | ⚠️ Partial | 15min | Database operations slow | #137 |
| Upload/Sync | ✅ Pass | 20min | Sync process reliable | None |
| Background Operation | ❌ Fail | 2hrs | Service terminated after 1hr | #138 |
| Connectivity Handling | ✅ Pass | 25min | Network transitions smooth | None |

### Performance Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| CPU Usage (Recording) | <10% | 7.2% | ✅ Pass |
| Memory Usage | <100MB | 85MB | ✅ Pass |
| Battery Usage (1hr) | <5% | 4.1% | ✅ Pass |
| Upload Success Rate | >95% | 97.3% | ✅ Pass |
| Background Stability | 8hrs | 1hr | ❌ Fail |

### Device Compatibility
| Device | OS Version | Status | Notes |
|--------|------------|--------|-------|
| Samsung Galaxy S21 | Android 13 | ✅ Pass | Full functionality |
| Google Pixel 6 | Android 14 | ✅ Pass | Full functionality |
| iPhone 13 | iOS 17.1 | ⚠️ Partial | Background limitations |
| OnePlus 9 | Android 12 | ✅ Pass | Full functionality |

### Issues Found
1. **Issue #137**: Database operations slower than expected on older devices
   - **Severity**: Medium
   - **Steps to reproduce**: Generate 1000+ captures, query database
   - **Expected**: Queries complete within 500ms
   - **Actual**: Takes 2-3 seconds on older devices

2. **Issue #138**: Background service terminated after 1 hour on some devices
   - **Severity**: High
   - **Steps to reproduce**: Start recording, leave in background for 2+ hours
   - **Expected**: Continuous recording for 8+ hours
   - **Actual**: Service killed after ~1 hour on devices with aggressive battery optimization

### Recommendations
1. Optimize database queries for better performance on older devices
2. Implement better background service protection strategies
3. Add user guidance for battery optimization settings
4. Improve error handling for service interruptions
5. Add more granular upload progress indicators
6. Implement adaptive quality settings based on device capabilities
7. Add comprehensive logging for debugging background issues
8. Consider implementing service restart mechanisms for reliability