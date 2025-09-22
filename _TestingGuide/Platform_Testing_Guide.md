# ZamIO Platform Testing Guide

## Table of Contents

1. [Introduction](#introduction)
2. [Environment Setup](#environment-setup)
3. [Test Data Preparation](#test-data-preparation)
4. [Prerequisites](#prerequisites)
5. [Backend API Testing](#backend-api-testing)
6. [Artist Portal Testing](#artist-portal-testing)
7. [Admin Dashboard Testing](#admin-dashboard-testing)
8. [Publisher Portal Testing](#publisher-portal-testing)
9. [Station Portal Testing](#station-portal-testing)
10. [Mobile App Testing](#mobile-app-testing)
11. [End-to-End Workflow Testing](#end-to-end-workflow-testing)
12. [Integration Testing](#integration-testing)
13. [Troubleshooting](#troubleshooting)
14. [Test Validation and Reporting](#test-validation-and-reporting)

---

## Introduction

This comprehensive testing guide provides step-by-step instructions for validating all features across the ZamIO platform. The guide covers testing procedures for:

- **Backend API** - Django REST API endpoints and business logic
- **Artist Portal** - Music upload, profile management, and royalty tracking
- **Admin Dashboard** - User management, KYC approval, and system monitoring
- **Publisher Portal** - Catalog management and royalty distribution
- **Station Portal** - Log submission and compliance monitoring
- **Mobile App** - Audio capture and background recording functionality

### Testing Approach

The guide follows a structured approach:
- **Unit-Level Testing**: Individual feature validation within each application
- **Integration Testing**: Cross-application workflow validation
- **User Role Testing**: Role-specific functionality validation
- **End-to-End Testing**: Complete business process validation

### Test Case Structure

Each test case follows this format:

```markdown
### Test Case: [Feature Name]
**Objective**: [What this test validates]
**Prerequisites**: [Required setup/data]
**Steps**:
1. [Detailed step with expected outcome]
2. [Next step with validation criteria]
**Expected Results**: [What should happen]
**Validation**: [How to confirm success]
**Notes**: [Additional considerations]
```

---

## Environment Setup

### Local Development Environment

#### Prerequisites
- Docker and Docker Compose installed
- Node.js (v16+) and npm installed
- Python 3.9+ and pip installed
- Flutter SDK (for mobile app testing)
- Git for version control

#### Backend Setup
1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd ZamioPro
   ```

2. **Start backend services**:
   ```bash
   cd zamio_backend
   docker-compose -f docker-compose.local.yml up -d
   ```

3. **Verify backend services**:
   - Database: PostgreSQL running on port 5432
   - Redis: Running on port 6379
   - Backend API: Running on port 8000
   - Check health endpoint: `http://localhost:8000/health/`

#### Frontend Applications Setup

1. **Admin Dashboard**:
   ```bash
   cd zamio_admin
   npm install
   npm run dev
   # Runs on http://localhost:3001
   ```

2. **Artist Portal (Frontend)**:
   ```bash
   cd zamio_frontend
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Publisher Portal**:
   ```bash
   cd zamio_publisher
   npm install
   npm run dev
   # Runs on http://localhost:3002
   ```

4. **Station Portal**:
   ```bash
   cd zamio_stations
   npm install
   npm run dev
   # Runs on http://localhost:3003
   ```

#### Mobile App Setup
1. **Flutter Environment**:
   ```bash
   cd zamio_app
   flutter pub get
   flutter doctor  # Verify Flutter installation
   ```

2. **Run on emulator/device**:
   ```bash
   flutter run
   ```

### Environment Verification Checklist

- [ ] Backend API responds at `http://localhost:8000/health/`
- [ ] Database connection established
- [ ] Redis cache service running
- [ ] Admin dashboard loads at `http://localhost:3001`
- [ ] Artist portal loads at `http://localhost:3000`
- [ ] Publisher portal loads at `http://localhost:3002`
- [ ] Station portal loads at `http://localhost:3003`
- [ ] Mobile app builds and runs successfully
- [ ] All services can communicate with backend API

---

## Test Data Preparation

### Database Seeding

1. **Run database migrations**:
   ```bash
   cd zamio_backend
   python manage.py migrate
   ```

2. **Create superuser account**:
   ```bash
   python manage.py createsuperuser
   # Username: admin
   # Email: admin@zamio.com
   # Password: admin123!
   ```

3. **Load test fixtures** (if available):
   ```bash
   python manage.py loaddata test_data.json
   ```

### Test User Accounts

Create the following test accounts for role-based testing:

#### Artist Account
- **Username**: test_artist
- **Email**: artist@test.com
- **Password**: TestArtist123!
- **Role**: Artist
- **Status**: Active

#### Publisher Account
- **Username**: test_publisher
- **Email**: publisher@test.com
- **Password**: TestPublisher123!
- **Role**: Publisher
- **Status**: Active

#### Station Account
- **Username**: test_station
- **Email**: station@test.com
- **Password**: TestStation123!
- **Role**: Station
- **Status**: Active

#### Admin Account
- **Username**: test_admin
- **Email**: admin@test.com
- **Password**: TestAdmin123!
- **Role**: Admin
- **Status**: Active

### Test Files and Assets

Prepare the following test assets:

#### Audio Files for Testing
- **Sample Music Track**: `test_music.mp3` (3-5 minutes, 320kbps)
- **Short Audio Clip**: `test_clip.wav` (30 seconds, for fingerprinting)
- **Invalid Audio File**: `invalid.txt` (for error testing)

#### Document Files
- **KYC Documents**: Sample ID, proof of address (PDF format)
- **Station Logs**: Sample CSV files with playlist data
- **Publisher Agreements**: Sample contract documents

### API Testing Tools Setup

#### Postman Collection
1. Import the ZamIO API collection (if available)
2. Set environment variables:
   - `base_url`: `http://localhost:8000`
   - `auth_token`: (will be set during authentication tests)

#### cURL Commands
Prepare authentication headers for API testing:
```bash
# Set base URL
export ZAMIO_API_BASE="http://localhost:8000"

# Authentication token (set after login)
export AUTH_TOKEN="Bearer [jwt-token]"
```

---

## Prerequisites

### System Requirements

#### Minimum Hardware
- **RAM**: 8GB minimum, 16GB recommended
- **Storage**: 10GB free space for local development
- **CPU**: Multi-core processor recommended
- **Network**: Stable internet connection for external integrations

#### Software Dependencies
- **Operating System**: Windows 10+, macOS 10.15+, or Linux Ubuntu 18.04+
- **Browsers**: Chrome 90+, Firefox 88+, Safari 14+ (for frontend testing)
- **Mobile Testing**: Android 8.0+ or iOS 12.0+ devices/emulators

### Access Requirements

#### Development Environment Access
- [ ] Repository access with appropriate permissions
- [ ] Local development environment setup completed
- [ ] Test database access configured
- [ ] External service credentials (if testing integrations)

#### Testing Credentials
- [ ] Admin dashboard access credentials
- [ ] API testing tools configured (Postman/cURL)
- [ ] Mobile device or emulator for app testing
- [ ] Test payment gateway credentials (for payment testing)

### Knowledge Prerequisites

#### Technical Knowledge
- Basic understanding of REST APIs and HTTP methods
- Familiarity with web browser developer tools
- Understanding of mobile app testing concepts
- Knowledge of database concepts and SQL basics

#### Domain Knowledge
- Understanding of music industry workflows
- Familiarity with royalty distribution concepts
- Knowledge of audio fingerprinting technology
- Understanding of compliance and reporting requirements

### Pre-Test Validation

Before starting any test scenarios, ensure:

1. **Environment Health Check**:
   ```bash
   # Check all services are running
   docker ps  # Should show all backend containers
   curl http://localhost:8000/health/  # Should return 200 OK
   ```

2. **Database Connectivity**:
   ```bash
   # Test database connection
   python manage.py dbshell
   # Should connect to PostgreSQL without errors
   ```

3. **Frontend Applications**:
   - All frontend applications load without console errors
   - Navigation between pages works correctly
   - API calls to backend succeed (check network tab)

4. **Mobile App**:
   - App builds and installs successfully
   - Basic navigation works
   - Can connect to backend API

---

## Backend API Testing

The backend API testing is organized into separate documents for better maintainability:

### Testing Documents

1. **[Authentication API Testing](Authentication_API_Testing.md)** ✅
   - User registration for all roles (Artist, Publisher, Station, Admin, Fan)
   - Email verification workflows
   - Login authentication and session management
   - JWT token lifecycle management (obtain, refresh, verify)
   - Security features (failed login tracking, account locking)
   - Multi-role authentication testing

2. **[Core Business API Testing](Core_Business_API_Testing.md)** 🔄
   - Artist management APIs (profile, music upload, KYC)
   - Music monitoring APIs (fingerprinting, detection results)
   - Royalty calculation and payment processing APIs

3. **[Administrative API Testing](Administrative_API_Testing.md)** 📋
   - User management and system monitoring APIs
   - Publisher and station management API testing
   - Compliance monitoring and reporting API tests

### Quick Reference

For immediate testing needs, refer to the specific document based on the API category you're testing. Each document contains:
- Complete test cases with cURL examples
- Expected responses and validation criteria
- Postman collection setup instructions
- Test result documentation templates

---

*This testing guide will be continuously updated as new features are added to the platform. Always verify you're using the latest version before conducting tests.*