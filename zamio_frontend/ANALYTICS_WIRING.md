# Analytics Page Wiring Documentation

## Overview
The Analytics page in `zamio_frontend` has been successfully wired to the backend to display real-time performance data for artists. This includes plays, revenue, geographic distribution, top tracks, and recent activity.

## Backend Changes

### Enhanced Endpoint: `/api/artists/analytics/`

**File:** `zamio_backend/artists/views/artist_analytics_view.py`

**Request Parameters:**
- `artist_id` (required): The artist's unique identifier
- `time_range` (optional): Time period for analytics
  - `7days` - Last 7 days
  - `30days` - Last 30 days
  - `3months` - Last 3 months
  - `12months` - Last 12 months (default)

**Response Structure:**
```json
{
  "message": "Successful",
  "data": {
    "time_range": "12months",
    "overview": {
      "total_plays": 125000,
      "total_revenue": 1875.00,
      "total_tracks": 12,
      "total_albums": 5,
      "active_listeners": 45000,
      "growth_rate": 12.5,
      "previous_period_growth": 12.5
    },
    "monthly_performance": [
      {
        "month": "Jan",
        "plays": 10500,
        "revenue": 157.50,
        "listeners": 3500
      }
    ],
    "top_tracks": [
      {
        "title": "Track Name",
        "plays": 45000,
        "revenue": 675.00,
        "growth": 15.2,
        "listeners": 15000,
        "avg_play_time": 3.0
      }
    ],
    "geographic_performance": [
      {
        "region": "Greater Accra",
        "plays": 56700,
        "percentage": 45.5,
        "revenue": 850.50,
        "listeners": 18900,
        "avg_revenue_per_listener": 0.045
      }
    ],
    "revenue_by_source": [
      {
        "source": "Radio Stations",
        "amount": 1500.00,
        "percentage": 80.0,
        "plays": 100000,
        "avg_per_play": 0.015
      }
    ],
    "recent_activity": [
      {
        "action": "Track played on Joy FM",
        "time": "2 minutes ago",
        "plays": 1,
        "revenue": 0.015,
        "location": "Accra"
      }
    ],
    "track_details": [
      {
        "title": "Track Name",
        "plays": 45000,
        "revenue": 675.00,
        "listeners": 15000,
        "avg_play_time": 3.0,
        "completion_rate": 75.0,
        "skip_rate": 15.0
      }
    ]
  }
}
```

### Key Features

1. **Overview Statistics**
   - Total plays, revenue, tracks, albums
   - Active listeners estimate
   - Growth rate calculation (current vs previous period)

2. **Monthly Performance**
   - Grouped by month using Django's `TruncMonth`
   - Plays, revenue, and listener counts per month
   - Supports different time ranges

3. **Top Tracks**
   - Sorted by play count
   - Includes growth percentage
   - Revenue and listener metrics

4. **Geographic Performance**
   - Grouped by station region
   - Percentage distribution
   - Revenue per listener calculations

5. **Revenue Sources**
   - Distribution: 80% Radio, 16% Streaming, 4% Public Performance
   - Average per-play rates

6. **Recent Activity**
   - Last 5 play logs
   - Human-readable time formatting
   - Location information

## Frontend Changes

### New API Module: `src/lib/analyticsApi.ts`

**TypeScript Interfaces:**
```typescript
interface AnalyticsOverview {
  total_plays: number;
  total_revenue: number;
  total_tracks: number;
  total_albums: number;
  active_listeners: number;
  growth_rate: number;
  previous_period_growth: number;
}

interface MonthlyPerformanceEntry {
  month: string;
  plays: number;
  revenue: number;
  listeners: number;
}

interface TopTrackEntry {
  title: string;
  plays: number;
  revenue: number;
  growth: number;
  listeners: number;
  avg_play_time: number;
}

// ... and more
```

**API Function:**
```typescript
export const fetchArtistAnalytics = async (params: AnalyticsParams): Promise<AnalyticsData> => {
  const { data } = await authApi.get<ApiEnvelope<AnalyticsData>>(
    '/api/artists/analytics/',
    { params }
  );
  return data.data;
};
```

### Updated Analytics Page: `src/pages/Analytics.tsx`

**Key Changes:**

1. **State Management**
   ```typescript
   const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(defaultAnalyticsData);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);
   const [refreshing, setRefreshing] = useState(false);
   ```

2. **Data Fetching**
   ```typescript
   const loadAnalytics = useCallback(async (showRefreshing = false) => {
     const artistId = getArtistId();
     if (!artistId) {
       setError('Artist ID not found. Please log in again.');
       return;
     }

     try {
       const data = await fetchArtistAnalytics({
         artist_id: artistId,
         time_range: selectedTimeRange,
       });
       setAnalyticsData(data);
     } catch (err) {
       setError('Failed to load analytics data. Please try again.');
     } finally {
       setLoading(false);
       setRefreshing(false);
     }
   }, [selectedTimeRange]);
   ```

3. **Loading State**
   - Spinner with "Loading analytics data..." message
   - Shown on initial load

4. **Error State**
   - Red alert box with error message
   - "Try Again" button to retry

5. **Refresh Functionality**
   - Refresh button in header
   - Shows spinning icon while refreshing
   - Doesn't block UI during refresh

### Auth Helper: `src/lib/auth.tsx`

**New Function:**
```typescript
export const getArtistId = (): string | null => {
  const stored = getStoredAuth();
  const artistId = stored.user?.artist_id;
  return typeof artistId === 'string' ? artistId : null;
};
```

## Data Flow

```
User opens Analytics page
         ↓
Component mounts → useEffect triggers
         ↓
loadAnalytics() called
         ↓
getArtistId() from stored auth
         ↓
fetchArtistAnalytics({ artist_id, time_range })
         ↓
GET /api/artists/analytics/?artist_id=xxx&time_range=12months
         ↓
Backend queries PlayLog, Track, Album models
         ↓
Calculates statistics, growth rates, aggregations
         ↓
Returns JSON response
         ↓
Frontend normalizes and sets state
         ↓
UI re-renders with real data
```

## UI Components

### Overview Cards
- **Total Plays**: Blue gradient card with play icon
- **Total Revenue**: Green gradient card with dollar icon
- **Active Listeners**: Purple gradient card with users icon
- **Total Tracks**: Amber gradient card with music icon

### Charts (Placeholders)
- **Monthly Performance Trends**: Line/bar chart placeholder
- **Geographic Performance Distribution**: Pie chart placeholder

### Tables
- **Revenue Sources**: Progress bars with percentages
- **Track Performance**: Sortable table (plays, revenue, growth)
- **Regional Performance**: Detailed breakdown by region
- **Track Analytics**: Completion rates, skip rates
- **Recent Activity**: Live activity log

### Controls
- **Time Range Selector**: 7 days, 30 days, 3 months, 12 months
- **View Toggle**: Charts vs Tables
- **Metric Toggle**: Plays, Revenue, Listeners
- **Sort Options**: By plays, revenue, or growth
- **Refresh Button**: Manual data refresh
- **Export Button**: (Placeholder for future implementation)

## Testing

### Prerequisites
1. Backend server running
2. Authenticated artist user
3. Tracks with play logs in database

### Test Steps

1. **Navigate to Analytics**
   ```
   Login → Dashboard → Analytics
   ```

2. **Verify Loading State**
   - Should show spinner
   - Should show "Loading analytics data..." message

3. **Verify Data Display**
   - Overview cards show correct numbers
   - Monthly performance data appears
   - Top tracks listed with growth indicators
   - Geographic distribution shown
   - Revenue sources with percentages
   - Recent activity log populated

4. **Test Time Range Filter**
   - Select "Last 7 days"
   - Data should refresh
   - Numbers should change based on period

5. **Test View Toggle**
   - Switch between Charts and Tables views
   - Tables view shows additional detail tables
   - Charts view shows summary cards

6. **Test Refresh**
   - Click Refresh button
   - Button shows "Refreshing..." with spinner
   - Data reloads without full page refresh

7. **Test Error Handling**
   - Disconnect from backend
   - Should show error message
   - "Try Again" button should retry

### Expected Behavior

**With Data:**
- All metrics populated
- Growth indicators show green (positive) or red (negative)
- Tables sortable and interactive
- Time range changes update data

**Without Data:**
- Shows zeros in overview
- Empty tables with "No data" messages
- Charts show placeholders

**On Error:**
- Error alert displayed
- Retry button available
- Previous data (if any) cleared

## Performance Considerations

1. **Database Queries**
   - Uses Django ORM aggregations
   - Indexed on `played_at` for time filtering
   - Limited to relevant time ranges

2. **Response Size**
   - Monthly data: ~12 entries for 12 months
   - Top tracks: Limited to 5
   - Geographic: Varies by regions
   - Recent activity: Limited to 5
   - Total response: ~5-10KB

3. **Frontend Caching**
   - Data stored in component state
   - Refreshes only on time range change or manual refresh
   - No automatic polling (prevents server load)

## Future Enhancements

1. **Real Charts**
   - Integrate Chart.js or Recharts
   - Interactive line/bar charts for monthly performance
   - Pie charts for geographic distribution

2. **Export Functionality**
   - CSV export for tables
   - PDF reports
   - Email scheduled reports

3. **Advanced Filters**
   - Filter by specific tracks
   - Filter by regions
   - Custom date ranges

4. **Real-time Updates**
   - WebSocket integration for live activity
   - Auto-refresh every N minutes
   - Push notifications for milestones

5. **Comparative Analytics**
   - Compare periods
   - Year-over-year growth
   - Benchmark against similar artists

## Troubleshooting

### Issue: "Artist ID not found"
**Solution:** Ensure user is logged in and has `artist_id` in stored auth

### Issue: Empty data
**Solution:** 
- Check if artist has tracks
- Verify tracks have play logs
- Check time range filter

### Issue: Slow loading
**Solution:**
- Check database indexes on `PlayLog.played_at`
- Optimize time range queries
- Consider caching frequently accessed data

### Issue: Growth rate shows 0%
**Solution:** Need data from previous period for comparison

---

**Status:** ✅ Complete and Functional  
**Last Updated:** October 30, 2024  
**Version:** 1.0
