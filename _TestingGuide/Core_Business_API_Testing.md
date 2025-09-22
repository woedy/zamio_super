# Core Business API Testing Guide

## Overview

This document covers testing core business functionality APIs including artist management, music monitoring, and royalty calculation systems. These APIs form the backbone of the ZamIO platform's music rights management capabilities.

## API Categories

### Artist Management APIs
- Profile management and updates
- Music upload and metadata handling
- KYC document submission and verification
- Onboarding workflow management

### Music Monitoring APIs
- Audio fingerprinting and recognition
- Detection results and matching
- Airplay tracking and reporting
- Music catalog management

### Royalty Calculation APIs
- Airplay data processing
- Royalty calculation algorithms
- Payment processing and distribution
- Wallet and balance management

## Core Business API Endpoints

| Category | Endpoint | Method | Purpose |
|----------|----------|--------|---------|
| **Artist Management** | `/api/artists/profile/` | GET | Get artist profile data |
| | `/api/artists/add/` | POST | Create new artist profile |
| | `/api/artists/edit/` | POST | Update artist profile |
| | `/api/artists/details/` | GET | Get detailed artist information |
| **Track Management** | `/api/tracks/add/` | POST | Upload new music track |
| | `/api/tracks/all/` | GET | Get artist's tracks |
| | `/api/tracks/details/` | GET | Get track details and analytics |
| | `/api/tracks/edit/` | POST | Update track metadata |
| | `/api/tracks/upload-cover/` | POST | Upload track cover art |
| **Music Monitoring** | `/api/music-monitor/upload-audio-match/` | POST | Upload audio for matching |
| | `/api/music-monitor/start-stream-monitoring/` | POST | Start radio stream monitoring |
| | `/api/music-monitor/stop-stream-monitoring/` | POST | Stop stream monitoring |
| | `/api/music-monitor/fingerprint-track/` | POST | Generate track fingerprints |
| **Royalty Calculation** | `/api/royalties/calculate-play-log-royalties/` | POST | Calculate royalties for play logs |
| | `/api/royalties/rates/` | GET | Get current royalty rates |
| | `/api/royalties/cycles/` | GET | Get royalty cycles |
| | `/api/royalties/exchange-rates/` | GET | Get currency exchange rates |

---

## Test Case: Artist Profile Management

**Objective**: Validate artist profile creation, retrieval, and updates

**Prerequisites**: 
- Authenticated artist user with valid JWT token
- Artist account with verified email

**Steps**:

1. **Test Get Artist Profile**:
   ```bash
   curl -X GET "http://localhost:8000/api/artists/profile/?artist_id=test-artist-id" \
     -H "Authorization: Bearer your-jwt-token"
   ```

2. **Test Create Artist Profile**:
   ```bash
   curl -X POST http://localhost:8000/api/artists/add/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "stage_name": "Test Artist",
       "bio": "Test artist biography",
       "spotify_url": "https://spotify.com/artist/test",
       "instagram": "@testartist",
       "twitter": "@testartist",
       "contact_email": "artist@test.com"
     }'
   ```

3. **Test Update Artist Profile**:
   ```bash
   curl -X POST http://localhost:8000/api/artists/edit/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "artist_id": "artist-uuid",
       "stage_name": "Updated Artist Name",
       "bio": "Updated biography",
       "website": "https://testartist.com"
     }'
   ```

4. **Test Get Artist Details**:
   ```bash
   curl -X GET "http://localhost:8000/api/artists/details/?artist_id=artist-uuid" \
     -H "Authorization: Bearer your-jwt-token"
   ```

5. **Test Artist Profile Validation**:
   ```bash
   # Test with missing required fields
   curl -X POST http://localhost:8000/api/artists/add/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with complete artist profile data including songs, royalty history, and play logs
- Step 2: Returns 201 Created with new artist ID and stage name
- Step 3: Returns 200 OK with updated artist information
- Step 4: Returns 200 OK with detailed artist analytics and track information
- Step 5: Returns 400 Bad Request with validation errors for missing stage_name

**Validation**:
- Artist profile contains all expected fields (name, bio, social links, etc.)
- Profile completion percentage is calculated correctly
- Artist analytics include play counts, earnings, and track statistics
- Social media links are properly formatted
- Contact information is validated

---

## Test Case: Music Track Upload

**Objective**: Validate music track upload, processing, and metadata management

**Prerequisites**: 
- Authenticated artist user
- Valid audio file (MP3 or WAV format)
- Artist profile created
- Available genres and albums in system

**Steps**:

1. **Test Get Upload Support Data**:
   ```bash
   curl -X GET "http://localhost:8000/api/tracks/upload-support-data/?artist_id=artist-uuid" \
     -H "Authorization: Bearer your-jwt-token"
   ```

2. **Test Successful Track Upload**:
   ```bash
   curl -X POST http://localhost:8000/api/tracks/add/ \
     -H "Authorization: Bearer your-jwt-token" \
     -F "title=Test Song" \
     -F "artist_id=artist-uuid" \
     -F "genre_id=1" \
     -F "release_date=2024-01-01" \
     -F "lyrics=Test song lyrics" \
     -F "explicit=false" \
     -F "audio_file=@test_music.mp3"
   ```

3. **Test Track Upload Validation**:
   ```bash
   # Test without required fields
   curl -X POST http://localhost:8000/api/tracks/add/ \
     -H "Authorization: Bearer your-jwt-token" \
     -F "artist_id=artist-uuid"
   ```

4. **Test Invalid Audio File**:
   ```bash
   curl -X POST http://localhost:8000/api/tracks/add/ \
     -H "Authorization: Bearer your-jwt-token" \
     -F "title=Test Song" \
     -F "artist_id=artist-uuid" \
     -F "genre_id=1" \
     -F "audio_file=@invalid.txt"
   ```

5. **Test Get Artist Tracks**:
   ```bash
   curl -X GET "http://localhost:8000/api/tracks/all/?artist_id=artist-uuid&page=1" \
     -H "Authorization: Bearer your-jwt-token"
   ```

6. **Test Track Details**:
   ```bash
   curl -X GET "http://localhost:8000/api/tracks/details/?track_id=track-uuid" \
     -H "Authorization: Bearer your-jwt-token"
   ```

7. **Test Cover Art Upload**:
   ```bash
   curl -X POST http://localhost:8000/api/tracks/upload-cover/ \
     -H "Authorization: Bearer your-jwt-token" \
     -F "track_id=track-uuid" \
     -F "photo=@cover_art.jpg"
   ```

**Expected Results**:
- Step 1: Returns 200 OK with available genres and albums
- Step 2: Returns 201 Created with track ID, title, and ISRC code
- Step 3: Returns 400 Bad Request with validation errors
- Step 4: Returns 400 Bad Request with audio file format error
- Step 5: Returns 200 OK with paginated list of artist's tracks
- Step 6: Returns 200 OK with detailed track analytics and play data
- Step 7: Returns 200 OK confirming cover art upload

**Validation**:
- Audio file is processed and converted to both MP3 and WAV formats
- Track duration is automatically calculated from audio file
- Fingerprints are generated and stored for the track
- ISRC code is automatically generated
- Track appears in artist's track list
- Cover art is properly associated with track

---

## Test Case: Audio Fingerprinting and Matching

**Objective**: Validate audio fingerprinting generation and matching capabilities

**Prerequisites**: 
- Tracks uploaded with fingerprints generated
- Valid audio clips for matching
- Station account for testing

**Steps**:

1. **Test Track Fingerprinting**:
   ```bash
   curl -X POST http://localhost:8000/api/music-monitor/fingerprint-track/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "track_id": "track-uuid",
       "force_reprocess": false
     }'
   ```

2. **Test Audio Matching Upload**:
   ```bash
   curl -X POST http://localhost:8000/api/music-monitor/upload-audio-match/ \
     -H "Authorization: Bearer your-jwt-token" \
     -F "file=@audio_clip.mp3" \
     -F "station_id=station-uuid" \
     -F "chunk_id=unique-chunk-id" \
     -F "started_at=2024-01-01T12:00:00Z" \
     -F "duration_seconds=30"
   ```

3. **Test No Match Scenario**:
   ```bash
   curl -X POST http://localhost:8000/api/music-monitor/upload-audio-match/ \
     -H "Authorization: Bearer your-jwt-token" \
     -F "file=@unknown_audio.mp3" \
     -F "station_id=station-uuid"
   ```

4. **Test Batch Fingerprinting**:
   ```bash
   curl -X POST http://localhost:8000/api/music-monitor/batch-fingerprint-tracks/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "track_ids": ["track-uuid-1", "track-uuid-2"],
       "config_name": "balanced",
       "force_reprocess": false
     }'
   ```

5. **Test Fingerprint Statistics**:
   ```bash
   curl -X GET http://localhost:8000/api/music-monitor/fingerprint-statistics/ \
     -H "Authorization: Bearer your-jwt-token"
   ```

6. **Test Stream Monitoring Start**:
   ```bash
   curl -X POST http://localhost:8000/api/music-monitor/start-stream-monitoring/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "stream_url": "http://stream.example.com:8000/stream",
       "station_id": "station-uuid"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with fingerprinting task status
- Step 2: Returns 200 OK with match result including track title, artist, and confidence score
- Step 3: Returns 200 OK with match: false
- Step 4: Returns 200 OK with batch processing task ID
- Step 5: Returns 200 OK with fingerprint database statistics
- Step 6: Returns 200 OK with monitoring session ID

**Validation**:
- Fingerprints are generated and stored in database
- Audio matching returns accurate results with confidence scores
- Match cache entries are created for successful matches
- Batch processing handles multiple tracks efficiently
- Stream monitoring sessions are properly managed
- Statistics reflect current fingerprint database state

---

## Test Case: Royalty Calculation

**Objective**: Validate royalty calculation algorithms and distribution logic

**Prerequisites**: 
- Play logs with matched tracks
- Royalty rate structures configured
- Artist and contributor information available

**Steps**:

1. **Test Get Royalty Rates**:
   ```bash
   curl -X GET "http://localhost:8000/api/royalties/rates/?territory=GH" \
     -H "Authorization: Bearer your-jwt-token"
   ```

2. **Test Calculate Play Log Royalties**:
   ```bash
   curl -X POST http://localhost:8000/api/royalties/calculate-play-log-royalties/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "play_log_ids": [1, 2, 3],
       "dry_run": true
     }'
   ```

3. **Test Actual Royalty Calculation**:
   ```bash
   curl -X POST http://localhost:8000/api/royalties/calculate-play-log-royalties/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "play_log_ids": [1, 2, 3],
       "dry_run": false
     }'
   ```

4. **Test Get Exchange Rates**:
   ```bash
   curl -X GET http://localhost:8000/api/royalties/exchange-rates/ \
     -H "Authorization: Bearer your-jwt-token"
   ```

5. **Test Royalty Cycles**:
   ```bash
   curl -X GET http://localhost:8000/api/royalties/cycles/ \
     -H "Authorization: Bearer your-jwt-token"
   ```

6. **Test Create Royalty Cycle**:
   ```bash
   curl -X POST http://localhost:8000/api/royalties/cycles/ \
     -H "Authorization: Bearer your-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Q1 2024 Cycle",
       "period_start": "2024-01-01",
       "period_end": "2024-03-31",
       "territory": "GH",
       "admin_fee_percent_default": 15.0
     }'
   ```

7. **Test Calculation Audit Trail**:
   ```bash
   curl -X GET "http://localhost:8000/api/royalties/calculation-audit/?limit=10" \
     -H "Authorization: Bearer your-jwt-token"
   ```

**Expected Results**:
- Step 1: Returns 200 OK with current royalty rate structures by station class and time period
- Step 2: Returns 200 OK with calculation preview without creating distributions
- Step 3: Returns 200 OK with actual calculations and created distribution records
- Step 4: Returns 200 OK with current exchange rates for currency conversion
- Step 5: Returns 200 OK with list of royalty cycles and their status
- Step 6: Returns 201 Created with new royalty cycle details
- Step 7: Returns 200 OK with audit trail of recent calculations

**Validation**:
- Royalty amounts are calculated correctly based on play duration and rate structures
- Time-of-day and station class multipliers are applied properly
- Distributions are created for all contributors with correct percentage splits
- Publisher shares are calculated when artists have publishing agreements
- Currency conversions use current exchange rates
- Audit trail captures all calculation details and errors

---

## Test Case: KYC Document Processing

**Objective**: Validate KYC document upload and verification workflow

**Prerequisites**: 
- Artist account with profile created
- Valid document files (PDF format)
- Admin account for approval testing

**Steps**:

1. **Test KYC Document Upload**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/upload-kyc-documents/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -F "document_type=id_card" \
     -F "document_file=@test_id.pdf"
   ```

2. **Test Multiple Document Types**:
   ```bash
   # Upload utility bill
   curl -X POST http://localhost:8000/api/accounts/upload-kyc-documents/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -F "document_type=utility_bill" \
     -F "document_file=@utility_bill.pdf"
   ```

3. **Test Invalid Document Type**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/upload-kyc-documents/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -F "document_type=invalid_type" \
     -F "document_file=@test_doc.pdf"
   ```

4. **Test Get Pending KYC Users (Admin)**:
   ```bash
   curl -X GET http://localhost:8000/api/accounts/kyc-pending-users/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

5. **Test KYC Status Update (Admin)**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/update-kyc-status/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "user_id": "user-uuid",
       "status": "verified",
       "notes": "All documents verified successfully"
     }'
   ```

6. **Test Artist Onboarding Status**:
   ```bash
   curl -X GET http://localhost:8000/api/accounts/artist-onboarding-status/artist-uuid/" \
     -H "Authorization: Bearer artist-jwt-token"
   ```

**Expected Results**:
- Step 1: Returns 200 OK with document upload confirmation and updated KYC status
- Step 2: Returns 200 OK with second document uploaded successfully
- Step 3: Returns 400 Bad Request with invalid document type error
- Step 4: Returns 200 OK with list of users pending KYC review
- Step 5: Returns 200 OK with updated KYC status confirmation
- Step 6: Returns 200 OK with complete onboarding status including KYC verification

**Validation**:
- Document metadata is stored correctly in user profile
- KYC status transitions properly (pending → incomplete → uploaded → verified)
- File uploads are handled securely
- Admin can review and approve/reject KYC submissions
- Onboarding progress reflects KYC completion status

---

## Test Case: Payment and Wallet Management

**Objective**: Validate payment processing and wallet balance management

**Prerequisites**: 
- Artist with calculated royalties
- Bank account/wallet configured
- Payment processing system available

**Steps**:

1. **Test Get Artist Payment Info**:
   ```bash
   curl -X GET http://localhost:8000/api/bank-account/artist-payment/ \
     -H "Authorization: Bearer artist-jwt-token"
   ```

2. **Test Complete Payment Information**:
   ```bash
   curl -X POST http://localhost:8000/api/accounts/complete-artist-payment/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "artist_id": "artist-uuid",
       "momo": "+233123456789",
       "bankAccount": "1234567890"
     }'
   ```

3. **Test Wallet Balance Check**:
   ```bash
   curl -X GET http://localhost:8000/api/bank-account/balance/ \
     -H "Authorization: Bearer artist-jwt-token"
   ```

4. **Test Payment History**:
   ```bash
   curl -X GET http://localhost:8000/api/bank-account/payment-history/?limit=10" \
     -H "Authorization: Bearer artist-jwt-token"
   ```

5. **Test Payment Request**:
   ```bash
   curl -X POST http://localhost:8000/api/bank-account/request-payment/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "amount": "100.00",
       "payment_method": "momo",
       "notes": "Monthly royalty withdrawal"
     }'
   ```

**Expected Results**:
- Step 1: Returns 200 OK with current payment information and wallet balance
- Step 2: Returns 200 OK with updated payment information confirmation
- Step 3: Returns 200 OK with current wallet balance and currency
- Step 4: Returns 200 OK with paginated payment transaction history
- Step 5: Returns 200 OK with payment request confirmation and reference ID

**Validation**:
- Wallet balances are accurate and reflect royalty distributions
- Payment methods are properly validated and stored
- Payment history shows all transactions with correct amounts and dates
- Payment requests are processed according to business rules
- Currency conversions are handled correctly for international payments

---

## Integration Test Case: Complete Music Upload to Royalty Workflow

**Objective**: Validate the complete workflow from music upload to royalty distribution

**Prerequisites**: 
- Complete environment setup
- All test accounts created
- Station monitoring configured

**Steps**:

1. **Upload and Process Track**:
   ```bash
   # Upload track
   curl -X POST http://localhost:8000/api/tracks/add/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -F "title=Integration Test Song" \
     -F "artist_id=artist-uuid" \
     -F "genre_id=1" \
     -F "audio_file=@test_song.mp3"
   
   # Wait for fingerprinting to complete
   sleep 10
   ```

2. **Simulate Radio Play**:
   ```bash
   # Upload matching audio clip
   curl -X POST http://localhost:8000/api/music-monitor/upload-audio-match/ \
     -H "Authorization: Bearer station-jwt-token" \
     -F "file=@test_song_clip.mp3" \
     -F "station_id=station-uuid" \
     -F "duration_seconds=180"
   ```

3. **Verify Match Creation**:
   ```bash
   # Check for match cache entries
   curl -X GET http://localhost:8000/api/music-monitor/recent-matches/" \
     -H "Authorization: Bearer admin-jwt-token"
   ```

4. **Process Matches to Play Logs**:
   ```bash
   # Trigger match processing (admin command)
   curl -X POST http://localhost:8000/api/admin/process-matches/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

5. **Calculate Royalties**:
   ```bash
   # Get recent play logs
   curl -X GET http://localhost:8000/api/admin/recent-play-logs/" \
     -H "Authorization: Bearer admin-jwt-token"
   
   # Calculate royalties for play logs
   curl -X POST http://localhost:8000/api/royalties/calculate-play-log-royalties/ \
     -H "Authorization: Bearer admin-jwt-token" \
     -H "Content-Type: application/json" \
     -d '{
       "play_log_ids": [1, 2, 3],
       "dry_run": false
     }'
   ```

6. **Verify Artist Earnings**:
   ```bash
   # Check artist profile for updated earnings
   curl -X GET "http://localhost:8000/api/artists/profile/?artist_id=artist-uuid" \
     -H "Authorization: Bearer artist-jwt-token"
   ```

**Expected Results**:
- Track is successfully uploaded and fingerprinted
- Audio matching correctly identifies the track
- Match cache entries are created
- Play logs are generated from matches
- Royalties are calculated and distributed
- Artist profile shows updated earnings and play counts

**Validation**:
- Complete workflow executes without errors
- Data consistency is maintained across all stages
- Timing and sequence of operations work correctly
- All stakeholders receive appropriate updates
- Financial calculations are accurate throughout the process

---

## Performance Test Cases

### Test Case: Bulk Track Processing

**Objective**: Validate system performance with multiple concurrent track uploads

**Steps**:

1. **Upload Multiple Tracks Simultaneously**:
   ```bash
   # Use parallel processing to upload 10 tracks
   for i in {1..10}; do
     curl -X POST http://localhost:8000/api/tracks/add/ \
       -H "Authorization: Bearer artist-jwt-token" \
       -F "title=Performance Test Song $i" \
       -F "artist_id=artist-uuid" \
       -F "genre_id=1" \
       -F "audio_file=@test_song_$i.mp3" &
   done
   wait
   ```

2. **Monitor Processing Status**:
   ```bash
   # Check fingerprinting task status
   curl -X GET http://localhost:8000/api/music-monitor/fingerprint-statistics/ \
     -H "Authorization: Bearer admin-jwt-token"
   ```

**Expected Results**:
- All tracks are processed successfully
- System maintains responsiveness during bulk operations
- No data corruption or processing errors occur
- Resource usage remains within acceptable limits

### Test Case: High-Volume Audio Matching

**Objective**: Test audio matching performance with large fingerprint database

**Steps**:

1. **Batch Audio Matching**:
   ```bash
   # Submit multiple audio clips for matching
   for i in {1..50}; do
     curl -X POST http://localhost:8000/api/music-monitor/upload-audio-match/ \
       -H "Authorization: Bearer station-jwt-token" \
       -F "file=@audio_clip_$i.mp3" \
       -F "station_id=station-uuid" &
   done
   wait
   ```

**Expected Results**:
- All audio clips are processed within acceptable time limits
- Matching accuracy remains high under load
- System handles concurrent requests efficiently
- No memory leaks or performance degradation occurs

---

## Error Handling Test Cases

### Test Case: Network Failure Recovery

**Objective**: Validate system behavior during network interruptions

**Steps**:

1. **Test Upload with Network Interruption**:
   ```bash
   # Start upload and simulate network failure
   timeout 5 curl -X POST http://localhost:8000/api/tracks/add/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -F "title=Network Test Song" \
     -F "audio_file=@large_test_file.mp3"
   ```

2. **Test Retry Mechanism**:
   ```bash
   # Retry the same upload
   curl -X POST http://localhost:8000/api/tracks/add/ \
     -H "Authorization: Bearer artist-jwt-token" \
     -F "title=Network Test Song" \
     -F "audio_file=@large_test_file.mp3"
   ```

**Expected Results**:
- System handles interrupted uploads gracefully
- Retry mechanisms work correctly
- No partial data corruption occurs
- Appropriate error messages are returned

---

## Test Results Template

Use this template to document test results for core business API testing.

### Test Execution Summary
- **Date**: [Test execution date]
- **Tester**: [Name]
- **Environment**: [Local/Staging/Production]
- **Test Status**: [Pass/Fail/Partial]

### Test Case Results
| Test Case | Status | Response Time | Notes | Issues |
|-----------|--------|---------------|-------|--------|
| Artist Profile Management | ✅ Pass | 250ms | All CRUD operations working | None |
| Music Track Upload | ✅ Pass | 15s | Fingerprinting takes ~10s | None |
| Audio Fingerprinting | ⚠️ Partial | 5s | Matching accuracy 95% | #125 |
| Royalty Calculation | ✅ Pass | 500ms | All calculations correct | None |
| KYC Processing | ❌ Fail | - | Document upload failing | #126 |
| Payment Management | ✅ Pass | 300ms | Wallet operations working | None |
| Integration Workflow | ✅ Pass | 30s | End-to-end flow successful | None |

### Performance Metrics
| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Track Upload Time | <20s | 15s | ✅ Pass |
| Audio Match Time | <5s | 3s | ✅ Pass |
| Royalty Calculation | <1s | 500ms | ✅ Pass |
| API Response Time | <500ms | 250ms | ✅ Pass |
| Concurrent Users | 100 | 150 | ✅ Pass |

### Issues Found
1. **Issue #125**: Audio matching accuracy drops to 85% with background noise
   - **Severity**: Medium
   - **Steps to reproduce**: Upload audio with significant background noise
   - **Expected**: >90% accuracy
   - **Actual**: 85% accuracy

2. **Issue #126**: KYC document upload fails for files >5MB
   - **Severity**: High
   - **Steps to reproduce**: Upload document file larger than 5MB
   - **Expected**: Successful upload with progress indicator
   - **Actual**: Request timeout after 30 seconds

### Recommendations
1. Implement audio preprocessing to improve matching accuracy in noisy environments
2. Increase file upload limits and add chunked upload support for large documents
3. Add progress indicators for long-running operations
4. Implement better error handling and user feedback for failed operations