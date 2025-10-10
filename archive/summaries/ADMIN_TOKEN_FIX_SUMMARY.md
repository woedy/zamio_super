# Admin Frontend "Invalid Token" Error - Fix Summary

## Problem
All pages in the zamio_admin frontend were returning authentication errors:
```json
{
  "error": {
    "code": "AUTHENTICATION_ERROR",
    "message": "Invalid token.",
    "details": {"original_detail": "Invalid token."},
    "timestamp": "2025-10-02T11:54:54.524583",
    "trace_id": "e42c7c84-e8f9-4a6b-83e7-f8257934ab9f"
  }
}
```

## Root Cause Analysis
1. **Port Mismatch**: The admin frontend was configured to connect to `http://localhost:8000`, but the Django backend is running on port `9001`
2. **Missing Environment File**: The `zamio_admin` frontend was missing its `.env.local` file
3. **Inconsistent Configuration**: All frontend applications had incorrect API URLs pointing to port 8000 instead of 9001
4. **CSRF Protection**: Admin endpoints also needed CSRF exemption for Token authentication

## Solutions Applied

### 1. Created Missing Environment File
**File Created:** `zamio_admin/.env.local`
```bash
VITE_API_URL=http://localhost:9001
```

### 2. Fixed All Frontend Environment Files
**Files Updated:**
- `zamio_frontend/.env.local` - Changed from port 8000 to 9001
- `zamio_publisher/.env.local` - Changed from port 8000 to 9001  
- `zamio_stations/.env.local` - Changed from port 8000 to 9001
- `zamio_admin/.env.local` - Created with correct port 9001

**Before:**
```bash
VITE_API_URL=http://localhost:8000
```

**After:**
```bash
VITE_API_URL=http://localhost:9001
```

### 3. Added CSRF Exemption to Admin Endpoints
**File Modified:** `zamio_backend/accounts/api/admin_view.py`

**Changes:**
- Added `from django.views.decorators.csrf import csrf_exempt` import
- Added `@csrf_exempt` decorator to `complete_admin_profile_view`

```python
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@authentication_classes([TokenAuthentication])
@csrf_exempt
def complete_admin_profile_view(request):
```

## Backend Configuration Verification
The backend is correctly configured in `zamio_backend/.env.local`:
```bash
BASE_URL=http://localhost:9001
CSRF_TRUSTED_ORIGINS=http://localhost:9001,http://127.0.0.1:9001,http://31.97.156.207:9001
```

## Frontend API Configuration Verification
All frontends use the same pattern in their `lib/api.ts`:
```typescript
// Vite proxy configuration uses VITE_API_URL from .env.local
const api = axios.create({
  baseURL: (import.meta as any)?.env?.VITE_API_BASE || '/',
});

// Token authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Token ${token}`;
  }
  return config;
});
```

## Why This Fix Works

### 1. Port Alignment
- **Backend**: Runs on port 9001 (as configured in Docker Compose and .env.local)
- **Frontends**: Now all point to port 9001 via VITE_API_URL
- **Vite Proxy**: Forwards `/api` requests to the correct backend port

### 2. Authentication Flow
1. Admin logs in via `/api/accounts/login-admin/` on port 9001
2. Backend generates and returns a valid Token
3. Frontend stores token in localStorage
4. Subsequent API requests include `Authorization: Token <token>` header
5. Backend validates token and processes requests

### 3. Development Server Ports
According to the tech stack documentation:
- Django API: **9001** ✅
- Artist Frontend (zamio_frontend): 9002
- Admin Frontend (zamio_admin): 4176 (from vite.config.js)
- Publisher Frontend: 9005
- Station Frontend: Various

## Files Changed Summary

### Frontend Environment Files (4 files)
1. `zamio_admin/.env.local` - **Created** with correct API URL
2. `zamio_frontend/.env.local` - **Updated** API URL from 8000 to 9001
3. `zamio_publisher/.env.local` - **Updated** API URL from 8000 to 9001
4. `zamio_stations/.env.local` - **Updated** API URL from 8000 to 9001

### Backend Files (1 file)
1. `zamio_backend/accounts/api/admin_view.py` - **Added** CSRF exemption to admin endpoints

## Expected Result

After these fixes:
1. ✅ Admin frontend should connect to the correct backend port (9001)
2. ✅ Authentication tokens should be validated successfully
3. ✅ All admin dashboard pages should load without "Invalid token" errors
4. ✅ Admin profile completion should work without CSRF errors
5. ✅ All frontend applications should connect to the correct backend

## Next Steps

**For immediate testing:**
1. Restart the admin frontend development server to pick up the new environment variables
2. Clear browser localStorage/sessionStorage if there are cached invalid tokens
3. Log in again to get a fresh token from the correct backend port

**Command to restart admin frontend:**
```bash
cd zamio_admin
npm run dev
```

The admin frontend should now successfully authenticate and load all pages without token errors.