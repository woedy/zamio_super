# Media Files CORS Fix

## Problem
Track details page was unable to load cover images and MP3 audio files due to CORS errors:
- `ERR_BLOCKED_BY_RESPONSE.NotSameOrigin` - Media files blocked by CORS policy
- `404 Not Found` - Some media files not being served properly

## Root Causes

1. **CORS Headers Missing**: Media files weren't being served with proper CORS headers
2. **Security Policy Too Restrictive**: `CROSS_ORIGIN_RESOURCE_POLICY` was set to `same-origin`
3. **Embedder Policy**: `CROSS_ORIGIN_EMBEDDER_POLICY` was set to `require-corp`
4. **Production Media Serving**: Media files only served in DEBUG mode

## Changes Made

### 1. Updated CORS Configuration (`core/settings.py`)

**Added CORS Headers for Media Files:**
```python
# CORS headers for media files (images, audio, video)
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'range',  # For audio/video streaming
]

CORS_EXPOSE_HEADERS = [
    'content-length',
    'content-range',
    'accept-ranges',
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

**Changed Security Policies:**
```python
# Before:
CROSS_ORIGIN_EMBEDDER_POLICY = 'require-corp'
CROSS_ORIGIN_RESOURCE_POLICY = 'same-origin'

# After:
CROSS_ORIGIN_EMBEDDER_POLICY = 'unsafe-none'  # Allow media
CROSS_ORIGIN_RESOURCE_POLICY = 'cross-origin'  # Allow cross-origin access
```

### 2. Created Custom Media View (`core/media_views.py`)

Created a new view to serve media files with proper CORS headers:

**Features:**
- Serves files from `MEDIA_ROOT` with security checks
- Adds CORS headers: `Access-Control-Allow-Origin: *`
- Supports range requests for audio/video streaming
- Adds caching headers for performance
- Proper content-type detection

**Key Headers Added:**
```python
response['Access-Control-Allow-Origin'] = '*'
response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
response['Access-Control-Allow-Headers'] = 'Range, Accept, Accept-Encoding'
response['Access-Control-Expose-Headers'] = 'Content-Length, Content-Range, Accept-Ranges'
response['Cache-Control'] = 'public, max-age=31536000'
response['Accept-Ranges'] = 'bytes'  # For audio/video
```

### 3. Updated URL Configuration (`core/urls.py`)

**Added Custom Media URL Pattern:**
```python
from .media_views import serve_media_with_cors

urlpatterns += [
    re_path(r'^media/(?P<path>.*)$', serve_media_with_cors, name='media'),
]
```

This ensures all media requests go through the custom view with CORS headers.

## How It Works Now

### Request Flow:
```
Frontend requests: https://backend.com/media/artists/1/tracks/audio/song.mp3
         ↓
Django URL router matches: ^media/(?P<path>.*)$
         ↓
serve_media_with_cors view handles request
         ↓
Adds CORS headers:
  - Access-Control-Allow-Origin: *
  - Access-Control-Allow-Methods: GET, OPTIONS
  - Access-Control-Expose-Headers: Content-Length, Accept-Ranges
         ↓
Returns file with proper headers
         ↓
Frontend can now access the file!
```

### Supported Media Types:
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Audio**: MP3, WAV, OGG, M4A
- **Video**: MP4, WebM, OGV
- **Documents**: PDF (if needed)

### Security Features:
- Path traversal protection (ensures files are within `MEDIA_ROOT`)
- File existence validation
- Proper content-type detection
- CSRF exemption for GET requests only

## Testing

### Test Cover Image:
```bash
curl -I https://backend.com/media/artists/1/albums/images/cover.jpg
```

Expected headers:
```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Cache-Control: public, max-age=31536000
```

### Test Audio File:
```bash
curl -I https://backend.com/media/artists/1/tracks/audio/song.mp3
```

Expected headers:
```
HTTP/1.1 200 OK
Content-Type: audio/mpeg
Access-Control-Allow-Origin: *
Accept-Ranges: bytes
Cache-Control: public, max-age=31536000
```

## Environment Variables

You can override the CORS policies via environment variables:

```bash
# .env or deployment config
CROSS_ORIGIN_RESOURCE_POLICY=cross-origin
CROSS_ORIGIN_EMBEDDER_POLICY=unsafe-none
```

## Deployment Notes

### For Production:

1. **Restart Django Server:**
   ```bash
   python manage.py collectstatic
   systemctl restart gunicorn  # or your WSGI server
   ```

2. **Nginx Configuration (Optional):**
   For better performance, configure Nginx to serve media files directly:
   ```nginx
   location /media/ {
       alias /path/to/media/;
       add_header Access-Control-Allow-Origin *;
       add_header Access-Control-Allow-Methods "GET, OPTIONS";
       add_header Cache-Control "public, max-age=31536000";
       expires 1y;
   }
   ```

3. **Verify CORS:**
   - Check browser console for CORS errors
   - Verify `Access-Control-Allow-Origin` header in Network tab
   - Test audio player functionality

### For Docker:

Ensure media volume is mounted:
```yaml
volumes:
  - ./media:/app/media
```

## Troubleshooting

### Issue: Still getting CORS errors
**Solution:** Clear browser cache and hard refresh (Ctrl+Shift+R)

### Issue: 404 errors for media files
**Solution:** 
- Check if files exist in `MEDIA_ROOT`
- Verify file permissions (readable by Django process)
- Check `MEDIA_ROOT` path in settings

### Issue: Audio not playing
**Solution:**
- Verify `Accept-Ranges: bytes` header is present
- Check audio file format (MP3 is most compatible)
- Ensure file size is reasonable

### Issue: Images not loading
**Solution:**
- Check image file format (JPG, PNG, WebP)
- Verify image paths in database match actual files
- Check browser console for specific error messages

## Performance Considerations

1. **Caching**: Media files are cached for 1 year (`max-age=31536000`)
2. **CDN**: Consider using a CDN for media files in production
3. **Compression**: Nginx can handle gzip compression for images
4. **Lazy Loading**: Frontend should implement lazy loading for images

## Security Considerations

1. **Path Traversal**: Custom view validates paths to prevent directory traversal
2. **File Type Validation**: Only serves files from `MEDIA_ROOT`
3. **CORS Wildcard**: Using `*` for `Access-Control-Allow-Origin` is safe for public media
4. **Rate Limiting**: Middleware already skips `/media/` paths

## Next Steps

- [ ] Monitor media file access in production
- [ ] Consider implementing CDN for better performance
- [ ] Add media file size limits if needed
- [ ] Implement image optimization/resizing service

---

**Status:** ✅ Fixed and Deployed  
**Last Updated:** October 30, 2024
