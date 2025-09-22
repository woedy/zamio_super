# Requirements Document

## Introduction

This specification outlines comprehensive improvements to the ZamIO royalty management platform focusing on UI/UX enhancements, proper role-based functionality, and ensuring the complete royalty management workflow functions correctly. ZamIO is solely a royalty management platform for the music industry - it does not include music streaming or fan engagement features. The improvements will address dark/light mode consistency, appropriate iconography, role-based access controls, publisher-artist relationships, admin capabilities, analytics, dispute resolution, and core platform functionality aligned with ASCAP, BMI, and ACRCloud industry standards.

## Requirements

### Requirement 1: UI/UX Theme and Visual Consistency

**User Story:** As a platform user, I want consistent dark and light mode themes across all applications so that I have a seamless visual experience regardless of my preferred theme.

#### Acceptance Criteria

1. WHEN a user toggles between dark and light modes THEN all UI components SHALL display with proper contrast and readability
2. WHEN navigating between different applications (frontend, admin, publisher, stations) THEN the selected theme SHALL persist consistently
3. WHEN viewing any page or component THEN all text, backgrounds, borders, and interactive elements SHALL follow the theme guidelines
4. WHEN using form inputs, buttons, and navigation elements THEN they SHALL have appropriate styling for both themes
5. WHEN viewing charts, graphs, and data visualizations THEN they SHALL adapt to the current theme

### Requirement 2: Iconography and Visual Elements

**User Story:** As a platform user, I want appropriate and meaningful icons throughout the interface so that I can quickly understand functionality and navigate efficiently.

#### Acceptance Criteria

1. WHEN viewing navigation menus THEN each section SHALL have relevant and recognizable icons
2. WHEN interacting with buttons and actions THEN they SHALL include appropriate icons alongside text labels
3. WHEN viewing data tables and lists THEN status indicators SHALL use clear and consistent iconography
4. WHEN using forms THEN input fields SHALL have relevant icons to indicate field types
5. WHEN viewing notifications and alerts THEN they SHALL use appropriate icons to convey message types

### Requirement 3: Artist Self-Publishing Management

**User Story:** As an artist who registers directly on the platform, I want to be automatically considered self-published so that I can manage my music and royalties without needing a separate publisher relationship.

#### Acceptance Criteria

1. WHEN an artist registers directly on the platform THEN they SHALL be automatically marked as self-published
2. WHEN a self-published artist uploads music THEN they SHALL have full control over their catalog without publisher approval
3. WHEN a self-published artist views their dashboard THEN they SHALL see options to request royalty payments
4. WHEN a self-published artist submits a royalty request THEN the system SHALL process it directly to their account
5. IF an artist later signs with a publisher THEN their status SHALL be updated and royalty flow SHALL redirect to the publisher

### Requirement 4: Publisher Onboarding and Management

**User Story:** As a platform administrator, I want to onboard and manage both local and international publishers so that I can expand the platform's reach and manage complex publishing relationships.

#### Acceptance Criteria

1. WHEN an admin accesses the publisher management section THEN they SHALL see options to add local and international publishers
2. WHEN onboarding a new publisher THEN the admin SHALL be able to set publisher type, territory, and capabilities
3. WHEN a publisher is onboarded THEN they SHALL receive appropriate access credentials and dashboard access
4. WHEN managing existing publishers THEN the admin SHALL be able to view, edit, suspend, or activate publisher accounts
5. WHEN a publisher has artists THEN the admin SHALL be able to view the publisher-artist relationships

### Requirement 5: Comprehensive Admin Dashboard

**User Story:** As a platform administrator, I want a comprehensive admin dashboard that allows me to manage all aspects of the platform so that I can oversee operations, user management, and system health.

#### Acceptance Criteria

1. WHEN accessing the admin dashboard THEN I SHALL see overview metrics for users, royalties, and system activity
2. WHEN managing users THEN I SHALL be able to view, edit, approve KYC, suspend, or activate any user account
3. WHEN overseeing royalty cycles THEN I SHALL be able to initiate, monitor, and troubleshoot royalty calculations and payments
4. WHEN managing music catalog THEN I SHALL be able to view all uploaded music, approve/reject submissions, and manage metadata
5. WHEN monitoring station compliance THEN I SHALL be able to view station logs, audio captures, and detection results
6. WHEN handling disputes THEN I SHALL have tools to investigate and resolve royalty or ownership disputes

### Requirement 6: Royalty Payment Flow Management

**User Story:** As a publisher, I want to receive royalty payments for my artists and then distribute funds to them so that I can manage the financial relationship with my signed artists.

#### Acceptance Criteria

1. WHEN royalties are calculated for publisher-signed artists THEN payments SHALL be directed to the publisher account
2. WHEN a publisher receives royalty payments THEN they SHALL see detailed breakdowns by artist and song
3. WHEN a publisher wants to distribute funds THEN they SHALL have tools to send payments to individual artists
4. WHEN an artist is signed to a publisher THEN they SHALL NOT be able to request direct royalty payments
5. WHEN viewing royalty reports THEN publishers SHALL see both received amounts and distributed amounts

### Requirement 7: Audio Capture and Detection System

**User Story:** As a radio station, I want reliable audio capture through both online streaming and mobile app uploads so that my airplay is accurately detected and reported for royalty calculations.

#### Acceptance Criteria

1. WHEN a station streams online THEN the system SHALL continuously capture and analyze audio for music detection
2. WHEN using the mobile app THEN station staff SHALL be able to upload periodic audio captures
3. WHEN audio is captured THEN it SHALL be processed through the local fingerprinting system for music identification
4. WHEN local fingerprinting cannot identify a song THEN the system SHALL send the audio segment to ACRCloud for external identification
5. WHEN ACRCloud returns a match THEN the system SHALL lookup ISRCs and map songs to their respective PROs (e.g., ASCAP, local PROs)
6. WHEN music is detected (locally or via ACRCloud) THEN it SHALL be logged with timestamp, station, song information, and PRO affiliation
7. WHEN detection results are available THEN they SHALL be accessible to relevant stakeholders (artists, publishers, admin)
8. WHEN preparing royalty reports THEN the system SHALL calculate royalty shares based on detected airplay and PRO representation

### Requirement 8: Landing Page Redesign

**User Story:** As a potential platform user, I want informative and engaging landing pages that clearly explain the platform's purpose and benefits so that I can understand how ZamIO serves the music royalty management needs.

#### Acceptance Criteria

1. WHEN visiting any application's landing page THEN I SHALL see clear information about ZamIO's royalty management focus
2. WHEN viewing the main landing page THEN I SHALL understand the different user types (artists, publishers, stations, admin)
3. WHEN exploring features THEN I SHALL see how the platform handles music monitoring, royalty calculation, and payment distribution
4. WHEN considering registration THEN I SHALL have clear paths for different user types
5. WHEN viewing on mobile devices THEN the landing pages SHALL be fully responsive and accessible

### Requirement 9: Backend-Frontend Integration

**User Story:** As a developer, I want all backend APIs properly connected to frontend interfaces so that all platform functionality works seamlessly across applications.

#### Acceptance Criteria

1. WHEN any frontend makes API calls THEN they SHALL receive proper responses with consistent error handling
2. WHEN user authentication occurs THEN JWT tokens SHALL work correctly across all applications
3. WHEN data is submitted through forms THEN it SHALL be properly validated and stored in the backend
4. WHEN real-time updates are needed THEN WebSocket connections SHALL provide live data updates
5. WHEN file uploads occur THEN they SHALL be processed and stored correctly with proper validation

### Requirement 10: Complete Royalty Management Workflow

**User Story:** As a platform stakeholder, I want the entire royalty management process to function correctly from music upload to payment distribution so that the platform fulfills its core business purpose.

#### Acceptance Criteria

1. WHEN music is uploaded THEN it SHALL be fingerprinted and added to the local detection database
2. WHEN radio airplay occurs THEN it SHALL be detected through local fingerprints or ACRCloud fallback
3. WHEN songs are detected via ACRCloud THEN the system SHALL lookup ISRCs and determine PRO representation (ASCAP, local PROs, etc.)
4. WHEN royalty cycles run THEN calculations SHALL be accurate based on airplay data, ownership splits, and PRO affiliations
5. WHEN foreign PRO songs are detected THEN reciprocal royalty sharing SHALL be calculated and reported appropriately
6. WHEN payments are processed THEN they SHALL reach the correct recipients (artists, publishers, or foreign PROs) through appropriate channels
7. WHEN disputes arise THEN there SHALL be clear audit trails showing detection source (local vs ACRCloud), PRO mapping, and calculation methods


### Requirement 11: Hybrid Fingerprinting and PRO Integration

**User Story:** As a platform operator, I want a hybrid fingerprinting system that uses local detection first and falls back to ACRCloud for unmatched content so that I can detect both local and international music for comprehensive royalty management.

#### Acceptance Criteria

1. WHEN processing a radio stream segment THEN the system SHALL first attempt identification using local fingerprints
2. WHEN local fingerprinting fails to identify a segment THEN the system SHALL automatically send it to ACRCloud
3. WHEN ACRCloud returns a match THEN the system SHALL extract ISRC and metadata for PRO lookup
4. WHEN mapping detected songs THEN the system SHALL identify PRO representation (ASCAP, BMI, local PROs, etc.)
5. WHEN generating royalty reports THEN the system SHALL separate local vs foreign PRO detections
6. WHEN calculating reciprocal royalties THEN the system SHALL apply appropriate rates for foreign PRO content
7. WHEN a song is detected multiple times THEN the system SHALL aggregate airplay data by PRO affiliation for accurate reporting### Req
uirement 12: Comprehensive Analytics Dashboard

**User Story:** As a platform user (artist, publisher, station, admin), I want detailed analytics relevant to my role so that I can make informed decisions and track performance metrics.

#### Acceptance Criteria

1. WHEN an artist accesses analytics THEN they SHALL see airplay statistics, royalty trends, and geographic distribution of plays
2. WHEN a publisher views analytics THEN they SHALL see portfolio performance, artist comparisons, and revenue breakdowns
3. WHEN a station accesses analytics THEN they SHALL see their submission compliance, detection accuracy, and playlist analysis
4. WHEN an admin reviews analytics THEN they SHALL see platform-wide metrics, user activity, and system performance indicators
5. WHEN viewing time-based data THEN users SHALL be able to filter by date ranges, stations, and geographic regions
6. WHEN exporting analytics THEN users SHALL be able to generate reports in standard formats (PDF, CSV, Excel)
7. WHEN comparing periods THEN users SHALL see percentage changes and trend indicators

### Requirement 13: Station Playlog and Match Log Management

**User Story:** As a radio station, I want comprehensive playlog submission and match log viewing capabilities so that I can ensure accurate reporting and verify detection results.

#### Acceptance Criteria

1. WHEN submitting playlogs THEN stations SHALL be able to upload logs in standard formats (CSV, XML, JSON)
2. WHEN viewing match logs THEN stations SHALL see detected songs with confidence scores and timestamps
3. WHEN comparing playlogs to detections THEN stations SHALL identify discrepancies and missing matches
4. WHEN detection confidence is low THEN stations SHALL be able to manually verify or correct identifications
5. WHEN submitting corrections THEN the system SHALL update detection records and notify relevant parties
6. WHEN viewing historical data THEN stations SHALL access past playlogs and match results for auditing
7. WHEN generating compliance reports THEN stations SHALL see submission rates and detection accuracy metrics

### Requirement 14: Comprehensive Dispute Resolution System

**User Story:** As a platform stakeholder, I want a structured dispute resolution process so that conflicts between stations, artists, publishers, and the platform can be resolved fairly and efficiently.

#### Acceptance Criteria

1. WHEN a dispute is raised THEN the system SHALL create a formal dispute case with unique identifier and timeline
2. WHEN submitting a dispute THEN users SHALL provide evidence, documentation, and detailed descriptions
3. WHEN a dispute involves detection accuracy THEN the system SHALL provide audio samples, fingerprint data, and confidence scores
4. WHEN mediating disputes THEN admins SHALL have access to all relevant data including logs, audio, and user communications
5. WHEN disputes require expert review THEN the system SHALL support external arbitrator involvement
6. WHEN disputes are resolved THEN all parties SHALL be notified and corrective actions SHALL be implemented automatically
7. WHEN tracking dispute patterns THEN the system SHALL identify recurring issues for process improvement
8. IF a station disputes detection results THEN they SHALL provide alternative evidence (playlogs, receipts, contracts)
9. IF royalty calculations are disputed THEN the system SHALL show detailed breakdown of splits and calculations
10. WHEN disputes escalate THEN there SHALL be defined escalation paths and timeframes for resolution

### Requirement 15: Industry Standards Compliance (ASCAP/BMI/ACRCloud)

**User Story:** As a platform operator, I want the system to comply with industry standards from ASCAP, BMI, and ACRCloud so that we can ensure interoperability and professional-grade royalty management.

#### Acceptance Criteria

1. WHEN processing royalty data THEN the system SHALL use standard industry formats and calculation methods
2. WHEN integrating with ACRCloud THEN the system SHALL follow their API specifications and data formats
3. WHEN generating reports for PROs THEN the system SHALL use ASCAP and BMI standard reporting formats
4. WHEN handling ISRCs THEN the system SHALL validate and process them according to international standards
5. WHEN calculating performance royalties THEN the system SHALL apply industry-standard rates and formulas
6. WHEN exchanging data with external PROs THEN the system SHALL use secure, standardized protocols
7. WHEN maintaining audit trails THEN the system SHALL meet industry requirements for transparency and accountability
8. WHEN processing international content THEN the system SHALL handle reciprocal agreements according to PRO standards###
 Requirement 16: Enhanced User Onboarding and Profile Management

**User Story:** As a new platform user, I want a streamlined onboarding process that guides me through setup so that I can quickly start using the platform effectively.

#### Acceptance Criteria

1. WHEN an artist registers THEN they SHALL be automatically marked as self-published and guided through profile completion
2. WHEN completing onboarding THEN users SHALL see clear progress indicators and next steps
3. WHEN profile information is incomplete THEN users SHALL see specific prompts for missing required fields
4. WHEN KYC verification is required THEN users SHALL have clear instructions and status updates
5. WHEN onboarding is complete THEN users SHALL be redirected to their appropriate dashboard
6. WHEN users need to update profiles THEN they SHALL have easy access to edit forms with validation
7. WHEN profile changes are saved THEN users SHALL see confirmation and updated information immediately

### Requirement 17: Improved Data Models and Relationships

**User Story:** As a platform operator, I want properly structured data models that support all business requirements so that the system can handle complex royalty scenarios accurately.

#### Acceptance Criteria

1. WHEN artists register directly THEN their self_publish flag SHALL be set to True automatically
2. WHEN publishers onboard artists THEN the artist-publisher relationship SHALL be properly established
3. WHEN tracks are uploaded THEN contributor splits SHALL be validated to sum to 100%
4. WHEN fingerprinting occurs THEN the system SHALL track processing status and version information
5. WHEN royalty calculations run THEN they SHALL respect publisher relationships and contributor splits
6. WHEN disputes are created THEN they SHALL link to specific detections with proper audit trails
7. WHEN user roles change THEN permissions and access SHALL be updated accordingly

### Requirement 18: Enhanced Station Management and Compliance

**User Story:** As a radio station, I want comprehensive tools to manage my station profile, staff, and compliance requirements so that I can meet regulatory obligations efficiently.

#### Acceptance Criteria

1. WHEN managing station profiles THEN I SHALL be able to update contact information, location, and operational details
2. WHEN adding staff members THEN I SHALL be able to assign roles and permissions appropriately
3. WHEN submitting compliance reports THEN I SHALL have templates for GHAMRO, COSGA, and other regulatory bodies
4. WHEN viewing detection logs THEN I SHALL see confidence scores, timestamps, and match details
5. WHEN stream links are configured THEN the system SHALL validate URLs and test connectivity
6. WHEN generating monthly reports THEN I SHALL have options for different formats and export types
7. WHEN compliance deadlines approach THEN I SHALL receive automated reminders and notifications

### Requirement 19: Robust Error Handling and User Feedback

**User Story:** As a platform user, I want clear error messages and feedback when things go wrong so that I can understand issues and take appropriate action.

#### Acceptance Criteria

1. WHEN API calls fail THEN users SHALL see user-friendly error messages with suggested actions
2. WHEN form validation fails THEN users SHALL see specific field-level errors with correction guidance
3. WHEN file uploads fail THEN users SHALL see progress indicators and retry options
4. WHEN network connectivity is poor THEN the system SHALL handle timeouts gracefully with offline indicators
5. WHEN system maintenance occurs THEN users SHALL see appropriate maintenance messages
6. WHEN errors are logged THEN they SHALL include trace IDs for support correlation
7. WHEN users report bugs THEN they SHALL have easy access to support channels with context

### Requirement 20: Performance and Scalability Improvements

**User Story:** As a platform user, I want fast and responsive interfaces that work well even with large amounts of data so that I can work efficiently.

#### Acceptance Criteria

1. WHEN loading dashboards THEN initial page load SHALL complete within 3 seconds
2. WHEN viewing large data tables THEN pagination or virtualization SHALL handle thousands of records smoothly
3. WHEN uploading files THEN progress indicators SHALL show accurate upload status
4. WHEN generating reports THEN background processing SHALL prevent UI blocking
5. WHEN using mobile devices THEN all interfaces SHALL be responsive and touch-friendly
6. WHEN multiple users access the system THEN performance SHALL remain consistent under load
7. WHEN data updates occur THEN real-time updates SHALL be delivered efficiently via WebSockets

### Requirement 21: Enhanced Security and Data Protection

**User Story:** As a platform stakeholder, I want robust security measures that protect user data and prevent unauthorized access so that the platform maintains trust and compliance.

#### Acceptance Criteria

1. WHEN users authenticate THEN the system SHALL use secure token-based authentication with proper expiration
2. WHEN sensitive data is transmitted THEN it SHALL be encrypted in transit and at rest
3. WHEN user permissions are checked THEN the system SHALL enforce role-based access controls strictly
4. WHEN audit logs are created THEN they SHALL capture all significant user actions with timestamps
5. WHEN password resets occur THEN they SHALL use secure tokens with time-limited validity
6. WHEN file uploads happen THEN they SHALL be scanned for malware and validated for type/size
7. WHEN data exports are generated THEN access SHALL be logged and controlled based on user permissions

### Requirement 22: Mobile App Integration and Functionality

**User Story:** As a station staff member, I want a reliable mobile app for audio capture that works offline and syncs when connectivity is available so that I can ensure continuous monitoring.

#### Acceptance Criteria

1. WHEN using the mobile app THEN it SHALL capture audio samples at configurable intervals
2. WHEN network connectivity is unavailable THEN the app SHALL store captures locally for later upload
3. WHEN connectivity is restored THEN the app SHALL automatically sync pending uploads
4. WHEN audio is captured THEN it SHALL include metadata like timestamp, location, and device information
5. WHEN uploads complete THEN users SHALL see confirmation and processing status
6. WHEN app updates are available THEN users SHALL be notified with easy update mechanisms
7. WHEN battery optimization is needed THEN the app SHALL provide efficient background processing options