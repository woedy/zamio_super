# Profile Page Wiring Guide

## ✅ Completed

### Backend
- ✅ Created `artist_profile_view.py` with JWT authentication
- ✅ Added endpoints to `artists/urls.py`:
  - `GET /api/artists/profile/` - Get profile data
  - `PUT /api/artists/profile/update/` - Update profile

### Frontend API
- ✅ Created `src/lib/profileApi.ts` with snake_case types
- ✅ Added `fetchArtistProfile()` and `updateArtistProfile()` functions

### Frontend State Management
- ✅ Added imports for React hooks and API functions
- ✅ Created `profileData` state with proper typing
- ✅ Added loading, error, refreshing states
- ✅ Implemented `loadProfile()` function with useCallback
- ✅ Added useEffect to load on mount
- ✅ Added `handleRefresh()` function

## 🔧 Remaining Tasks

### Update UI References

All references to `artistData` need to be replaced with `profileData`. Here's the mapping:

#### Profile Information
```typescript
// OLD
artistData.name
artistData.stageName
artistData.bio
artistData.avatar
artistData.coverImage
artistData.verified
artistData.followers
artistData.totalPlays
artistData.totalEarnings
artistData.joinDate
artistData.location
artistData.genres

// NEW
profileData.profile.stage_name
profileData.profile.bio
profileData.profile.profile_image
profileData.profile.cover_image
profileData.profile.verified
profileData.stats.followers
profileData.stats.total_plays
profileData.stats.total_earnings
profileData.profile.join_date
profileData.profile.location
profileData.profile.genres
```

#### Contact Information
```typescript
// OLD
artistData.contact.email
artistData.contact.phone
artistData.contact.instagram
artistData.contact.twitter
artistData.contact.facebook

// NEW
profileData.contact.email
profileData.contact.phone
profileData.contact.instagram
profileData.contact.twitter
profileData.contact.facebook
profileData.contact.website
profileData.contact.spotify_url
profileData.contact.shazam_url
```

#### Stats
```typescript
// OLD
artistData.stats.monthlyPlays
artistData.stats.monthlyEarnings
artistData.stats.newFollowers
artistData.stats.radioCoverage
artistData.stats.avgRating
artistData.stats.totalSongs

// NEW
profileData.stats.monthly_plays
profileData.stats.monthly_earnings
profileData.stats.new_followers
profileData.stats.radio_coverage
profileData.stats.avg_rating
profileData.stats.total_songs
```

#### Achievements
```typescript
// OLD
artistData.achievements

// NEW
profileData.achievements
```

### Add Loading/Error States

Add these UI components before the main content:

```tsx
{/* Loading State */}
{loading && (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <RefreshCw className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
    </div>
  </div>
)}

{/* Error State */}
{error && !loading && (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
    <div className="flex items-center space-x-3">
      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
      <div>
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200">Error Loading Profile</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
      </div>
    </div>
    <button
      onClick={handleRefresh}
      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      Try Again
    </button>
  </div>
)}

{/* Content */}
{!loading && !error && (
  // ... existing profile content
)}
```

### Update Save Profile Function

Replace the existing save function with:

```typescript
const handleSaveProfile = async () => {
  const artistId = getArtistId();
  if (!artistId) return;

  setIsSaving(true);
  setSaveMessage(null);

  try {
    const params: UpdateProfileParams = {
      artist_id: artistId,
      stage_name: editFormData.stageName,
      bio: editFormData.bio,
      contact_email: editFormData.contact.email,
      instagram: editFormData.contact.instagram,
      twitter: editFormData.contact.twitter,
      website: editFormData.contact.website,
      spotify_url: editFormData.contact.spotify_url,
      shazam_url: editFormData.contact.shazam_url
    };

    await updateArtistProfile(params);
    
    // Refresh profile data
    await loadProfile(true);
    
    setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
    setIsEditModalOpen(false);
  } catch (err) {
    console.error('Failed to update profile:', err);
    setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
  } finally {
    setIsSaving(false);
  }
};
```

### Add Null Safety

For all numeric displays, add null safety:

```typescript
// OLD
{artistData.totalPlays.toLocaleString()}

// NEW
{(profileData.stats.total_plays || 0).toLocaleString()}
```

For currency:

```typescript
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return '₵0.00';
  return `₵${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Usage
{formatCurrency(profileData.stats.total_earnings)}
```

### Update Top Tracks Section

Replace `songsData` with `profileData.top_tracks`:

```typescript
{(profileData.top_tracks || []).map((track) => (
  <div key={track.track_id}>
    <h3>{track.title}</h3>
    <p>{track.duration}</p>
    <p>{track.total_plays.toLocaleString()} plays</p>
    <p>{formatCurrency(track.total_earnings)}</p>
    <p>{track.status}</p>
  </div>
))}
```

### Update Recent Activity Section

Replace `playLogsData` with `profileData.recent_activity`:

```typescript
{(profileData.recent_activity || []).map((activity) => (
  <div key={activity.id}>
    <p>{activity.track_title}</p>
    <p>{activity.station_name}</p>
    <p>{new Date(activity.detected_at || '').toLocaleDateString()}</p>
    <p>{(activity.confidence_score * 100).toFixed(1)}% confidence</p>
  </div>
))}
```

## 🎯 Testing Checklist

After completing the updates:

1. ✅ Profile loads without errors
2. ✅ Loading state displays correctly
3. ✅ Error state displays with retry button
4. ✅ All profile fields display correctly
5. ✅ Stats show real data with proper formatting
6. ✅ Top tracks list displays
7. ✅ Recent activity displays
8. ✅ Achievements display
9. ✅ Edit profile modal works
10. ✅ Save profile updates backend
11. ✅ Refresh button works
12. ✅ No console errors
13. ✅ All null values handled gracefully

## 📝 Key Patterns Applied

Following the proven patterns from Analytics, Payments, and Notifications:

✅ **JWT Authentication** - Not TokenAuthentication  
✅ **snake_case** - All field names match backend  
✅ **Null Safety** - `|| []` for arrays, `|| 0` for numbers  
✅ **Loading States** - Spinner with message  
✅ **Error Handling** - Clear messages with retry  
✅ **Type Safety** - Full TypeScript types  
✅ **useCallback** - Optimized data fetching  
✅ **useEffect** - Load on mount  
✅ **Refresh** - Manual refresh capability  

## 🚀 Quick Fix Script

Search and replace in Profile.tsx:

1. `artistData.name` → `profileData.profile.stage_name`
2. `artistData.stageName` → `profileData.profile.stage_name`
3. `artistData.bio` → `profileData.profile.bio`
4. `artistData.avatar` → `profileData.profile.profile_image`
5. `artistData.verified` → `profileData.profile.verified`
6. `artistData.followers` → `profileData.stats.followers`
7. `artistData.totalPlays` → `profileData.stats.total_plays`
8. `artistData.totalEarnings` → `profileData.stats.total_earnings`
9. `artistData.stats.monthlyPlays` → `profileData.stats.monthly_plays`
10. `artistData.stats.monthlyEarnings` → `profileData.stats.monthly_earnings`
11. `artistData.achievements` → `profileData.achievements`
12. `songsData` → `profileData.top_tracks`
13. `playLogsData` → `profileData.recent_activity`

Then add null safety to all array operations and numeric displays.
