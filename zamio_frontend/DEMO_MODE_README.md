# Track Details Demo Mode

## Overview
The Track Details page in `zamio_frontend` now uses **static demo data** instead of making backend API requests. This allows you to view and interact with the track details page without needing a running backend server.

## What Changed

### 1. New Demo Data File
**File:** `src/lib/demoTrackData.ts`

This file contains:
- `demoTrackDetail`: The default demo track with comprehensive data
- `demoTracks`: A collection of multiple demo tracks (2 tracks currently)
- `getDemoTrackById()`: Helper function to retrieve demo data by track ID

### 2. Modified Track Details Page
**File:** `src/pages/TrackDetails.tsx`

Changes made:
- Imported `getDemoTrackById` from the demo data file
- Modified `loadTrackDetail()` function to use demo data instead of `fetchArtistTrackDetail()` API call
- Added a simulated 500ms delay to mimic network latency for realistic UX
- All other functionality remains intact (audio player, tabs, modals, etc.)

## Demo Data Included

### Track 1: "Sunset Dreams" by Kwame Asante
- **ID:** `demo-track-001` or `TRK-2024-001`
- **Genre:** Afrobeats
- **Plays:** 45,678
- **Revenue:** ₵12,450.75
- Includes full lyrics, 8 months of revenue data, 9 top stations, 15 play logs, and 6 contributors

### Track 2: "Accra Nights" by Ama Serwaa
- **ID:** `demo-track-002` or `TRK-2024-002`
- **Genre:** Afro Pop
- **Plays:** 32,145
- **Revenue:** ₵8,934.20
- Includes 6 months of revenue data, 5 top stations, 5 play logs, and 4 contributors

## How to Use

### Viewing Demo Tracks

1. **From Upload Management:**
   - Click on any track's "View Details" button
   - The page will load demo data regardless of the track ID

2. **Direct Navigation:**
   - Navigate to `/dashboard/track-details?trackId=demo-track-001`
   - Or `/dashboard/track-details?trackId=demo-track-002`
   - Or any other track ID (will default to "Sunset Dreams")

3. **Via Router State:**
   - Pass track identifier via location state when navigating
   - Demo data will be loaded based on the identifier

### Features Available in Demo Mode

✅ **Fully Functional:**
- View track information (title, artist, album, genre, duration)
- Audio player with play/pause controls (uses sample audio)
- Volume control and seek functionality
- Performance analytics (plays over time, top stations)
- Revenue dashboard (monthly earnings, territories, payout history)
- Contributors section with percentage splits
- Geographic performance visualization
- Play logs table
- Tab navigation between sections
- Refresh button (reloads demo data)
- Edit track modal (UI only - doesn't save)
- Add contributor modal (UI only - doesn't save)

⚠️ **UI Only (No Backend):**
- Edit track information (modal opens but changes aren't persisted)
- Add contributors (modal opens but changes aren't persisted)
- Share and favorite buttons (visual only)

## Switching Back to API Mode

To re-enable backend API calls, modify `src/pages/TrackDetails.tsx`:

```typescript
const loadTrackDetail = useCallback(async () => {
  const normalizedIdentifier = sanitizeIdentifier(trackIdentifier) ?? null;

  if (normalizedIdentifier === null || normalizedIdentifier === '') {
    setError('Track identifier is missing.');
    setDetail(null);
    setLoading(false);
    return;
  }

  setLoading(true);
  setError(null);
  try {
    const response = await fetchArtistTrackDetail(normalizedIdentifier);
    setDetail(response);
  } catch (err) {
    setError(resolveTrackErrorMessage(err));
    setDetail(null);
  } finally {
    setLoading(false);
  }
}, [trackIdentifier]);
```

## Adding More Demo Tracks

To add additional demo tracks, edit `src/lib/demoTrackData.ts`:

```typescript
export const demoTracks: Record<string, TrackDetailPayload> = {
  'demo-track-001': demoTrackDetail,
  'demo-track-002': { /* existing track 2 */ },
  'demo-track-003': {
    track: {
      id: 'demo-track-003',
      track_id: 'TRK-2024-003',
      title: 'Your New Track',
      artist: 'Artist Name',
      // ... rest of the track data
    },
    stats: { /* ... */ },
    revenue: { /* ... */ },
    performance: { /* ... */ },
    play_logs: [ /* ... */ ],
    contributors: [ /* ... */ ],
  },
};
```

## Technical Notes

- Demo data follows the exact `TrackDetailPayload` interface from `src/lib/api.ts`
- All data transformations and view models work identically with demo data
- The 500ms simulated delay provides realistic loading states
- Cover art uses Unsplash placeholder images
- Audio files use SoundHelix sample MP3s for demonstration
- All monetary values are in Ghanaian Cedis (GHS)
- Dates and timestamps are realistic and recent

## Benefits of Demo Mode

1. **No Backend Dependency:** View and test the UI without running Django backend
2. **Faster Development:** Iterate on UI/UX without waiting for API responses
3. **Consistent Data:** Always see the same data for reliable testing
4. **Offline Work:** Work on the frontend without internet or backend access
5. **Demo Presentations:** Show stakeholders the UI with polished sample data

---

**Last Updated:** October 30, 2024
