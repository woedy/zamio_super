# Track Details Backend Wiring

## Overview
The Track Details page in `zamio_frontend` is now fully wired to the backend API. This document describes the integration and data flow.

## Backend Endpoint

**Endpoint:** `GET /api/artists/get-track-details/`  
**Authentication:** Required (JWT or Token)  
**Query Parameters:**
- `track_id` (required): Track identifier (can be `track_id` string or numeric `id`)
- `period` (optional): Time period filter - `'daily'`, `'weekly'`, `'monthly'`, or `'all-time'` (default)

## Data Contract

### Request Example
```http
GET /api/artists/get-track-details/?track_id=TRK-2024-001&period=all-time
Authorization: Bearer <jwt_token>
```

### Response Structure
```json
{
  "message": "Successful",
  "data": {
    "track": {
      "id": 1,
      "track_id": "TRK-2024-001",
      "title": "Sunset Dreams",
      "artist": "Kwame Asante",
      "album": "Golden Horizons",
      "genre": "Afrobeats",
      "duration_seconds": 245,
      "release_date": "2024-03-15",
      "plays": 45678,
      "total_revenue": 12450.75,
      "cover_art_url": "/media/covers/track_001.jpg",
      "audio_file_url": "/media/audio/track_001.mp3",
      "lyrics": "..."
    },
    "stats": {
      "total_plays": 45678,
      "total_revenue": 12450.75,
      "average_confidence": 94.5,
      "first_played_at": "2024-03-20T08:30:00Z",
      "last_played_at": "2024-10-29T18:45:00Z"
    },
    "revenue": {
      "monthly": [
        {
          "month": "Mar 2024",
          "amount": 1250.50,
          "currency": "GHS"
        }
      ],
      "territories": [
        {
          "territory": "Greater Accra",
          "amount": 5680.45,
          "currency": "GHS",
          "percentage": 45.6
        }
      ],
      "payout_history": [
        {
          "date": "2024-04-01",
          "amount": 1250.50,
          "status": "Paid",
          "period": "March 2024"
        }
      ]
    },
    "performance": {
      "plays_over_time": [
        {
          "month": "Mar 2024",
          "plays": 3450,
          "revenue": 1250.50,
          "stations": 12
        }
      ],
      "top_stations": [
        {
          "name": "Joy FM",
          "count": 8945,
          "region": "Greater Accra",
          "country": "Ghana",
          "revenue": 2340.80
        }
      ]
    },
    "play_logs": [
      {
        "played_at": "2024-10-29T18:45:00Z",
        "station": "Joy FM",
        "region": "Greater Accra",
        "country": "Ghana"
      }
    ],
    "contributors": [
      {
        "role": "Primary Artist",
        "name": "Kwame Asante",
        "percentage": 60.0
      }
    ]
  }
}
```

## Backend Changes Made

### 1. Added Payout History Integration
**File:** `zamio_backend/artists/views/tracks_views.py`

Added query to `RoyaltyWithdrawal` model to fetch payout history:
```python
from royalties.models import RoyaltyWithdrawal

withdrawals = RoyaltyWithdrawal.objects.filter(
    artist=track.artist,
    status__in=['processed', 'approved']
).order_by('-requested_at')[:10]
```

Maps withdrawal data to frontend format:
- `date`: Withdrawal request date
- `amount`: Withdrawal amount in GHS
- `status`: "Paid" (processed) or "Pending" (approved)
- `period`: Formatted month/year label

### 2. Fixed Play Log Field Name
Changed `time` → `played_at` to match frontend expectations:
```python
play_logs_payload.append({
    'played_at': format_timestamp(log.played_at),  # Was 'time'
    'station': getattr(station, 'name', None),
    'region': getattr(station, 'region', None),
    'country': getattr(station, 'country', None),
})
```

## Frontend Changes Made

### 1. Re-enabled API Integration
**File:** `zamio_frontend/src/pages/TrackDetails.tsx`

Restored the original API call in `loadTrackDetail()`:
```typescript
const response = await fetchArtistTrackDetail(normalizedIdentifier);
setDetail(response);
```

### 2. Data Normalization
The frontend already has robust normalization in `src/lib/api.ts`:
- Handles both nested and flat response structures
- Maps `month` → `label` for time series data
- Provides fallback values for missing data
- Validates and sanitizes track identifiers

## Data Flow

```
User clicks "View Details"
         ↓
Navigate to /dashboard/track-details?trackId=TRK-2024-001
         ↓
TrackDetails component loads
         ↓
fetchArtistTrackDetail(trackId) called
         ↓
GET /api/artists/get-track-details/?track_id=TRK-2024-001
         ↓
Backend queries:
  - Track model (basic info)
  - PlayLog model (plays, revenue, logs)
  - Contributor model (splits)
  - RoyaltyWithdrawal model (payouts)
         ↓
Response normalized by frontend
         ↓
Data rendered in UI components:
  - Track info card
  - Performance charts
  - Revenue dashboard
  - Contributors table
  - Geographic visualization
```

## Models Involved

### Backend Models
1. **Track** (`artists.Track`)
   - Basic track information
   - Cover art, audio files
   - Release date, duration, lyrics

2. **PlayLog** (`music_monitor.PlayLog`)
   - Individual play records
   - Station information
   - Timestamps, confidence scores
   - Royalty amounts

3. **Contributor** (`artists.Contributor`)
   - Role assignments
   - Percentage splits
   - User relationships

4. **RoyaltyWithdrawal** (`royalties.RoyaltyWithdrawal`)
   - Payout requests
   - Status tracking
   - Amount and currency
   - Processing timestamps

### Frontend Interfaces
- `TrackDetailPayload`: Main response structure
- `TrackDetailTrack`: Track information
- `TrackDetailStats`: Aggregated statistics
- `TrackRevenueMonthlyEntry`: Monthly revenue data
- `TrackRevenueTerritoryEntry`: Regional breakdown
- `TrackRevenuePayoutEntry`: Payout history
- `TrackPerformanceSeriesEntry`: Time series data
- `TrackPerformanceTopStationEntry`: Station rankings
- `TrackPlayLogEntry`: Individual play records
- `TrackContributorEntry`: Contributor information

## Features Now Working

✅ **Fully Functional:**
- Real-time track data from database
- Play count and revenue aggregation
- Monthly revenue charts
- Territory/region breakdown
- Top stations ranking
- Play logs table (last 25 plays)
- Contributors with percentage splits
- Payout history (last 10 payouts)
- Audio player with actual track files
- Cover art display
- Performance analytics over time
- Geographic performance visualization

✅ **Edit Functionality:**
- Edit track metadata (title, genre, album, lyrics)
- Changes persist to database via `/api/artists/edit-track/`

⚠️ **UI Only (Not Yet Wired):**
- Add contributors (modal UI ready, needs backend endpoint)
- Share and favorite buttons (future feature)

## Testing the Integration

### 1. Prerequisites
- Backend server running on configured API URL
- User authenticated with valid JWT token
- At least one track with play logs in database

### 2. Test Steps

**View Track Details:**
```
1. Navigate to Upload Management
2. Click "View Details" on any track
3. Verify all sections load with real data
```

**Check Data Accuracy:**
```
1. Compare play counts with database
2. Verify revenue calculations
3. Check contributor percentages sum to 100%
4. Confirm payout history matches withdrawals
```

**Test Edit Functionality:**
```
1. Click Edit button
2. Modify track title or genre
3. Save changes
4. Verify updates in database
5. Refresh page to confirm persistence
```

### 3. Error Scenarios

**Track Not Found:**
- Shows error message with retry button
- Navigates back to Upload Management

**Missing Data:**
- Falls back to empty arrays/default values
- UI displays "No data" messages gracefully

**Network Errors:**
- Shows error message with details
- Provides retry functionality

## Environment Configuration

Ensure these environment variables are set:

**Frontend (.env):**
```bash
VITE_API_URL=http://localhost:8000
```

**Backend (.env):**
```bash
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176
CORS_ALLOW_ALL_ORIGINS=False
```

## API Authentication

The endpoint requires authentication. Ensure the frontend includes:
```typescript
headers: {
  'Authorization': `Bearer ${accessToken}`
}
```

The `authApi` instance in `src/lib/api.ts` handles this automatically.

## Performance Considerations

1. **Query Optimization:**
   - Uses `select_related()` for station data
   - Limits play logs to last 25 records
   - Limits payout history to last 10 records
   - Aggregates data at database level

2. **Response Size:**
   - Typical response: 15-50 KB
   - Includes only essential data
   - Audio files served separately via media URLs

3. **Caching:**
   - Consider implementing Redis caching for frequently accessed tracks
   - Frontend could cache track details for 5-10 minutes

## Future Enhancements

1. **Add Contributor Endpoint:**
   - Create `POST /api/artists/add-contributor/` endpoint
   - Wire to "Add Contributor" modal

2. **Real-time Updates:**
   - WebSocket integration for live play updates
   - Push notifications for new plays

3. **Advanced Filtering:**
   - Date range selection for analytics
   - Station filtering
   - Export functionality

4. **Pagination:**
   - Paginate play logs beyond 25 records
   - Load more functionality for payout history

---

**Last Updated:** October 30, 2024  
**Status:** ✅ Fully Wired and Functional
