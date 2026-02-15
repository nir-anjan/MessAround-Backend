# Log Format Improvements

## Summary

The logging system has been improved for better human readability with cleaner formatting, aligned columns, and reduced noise.

## Key Changes

### 1. **Aligned Column Format**

- Timestamps, log levels, and messages are now properly aligned
- Log level is padded to 7 characters for consistent column width
- Format: `YYYY-MM-DD HH:mm:ss LEVEL   | message [metadata]`

### 2. **Cleaner Metadata Display**

Instead of dumping entire JSON objects, metadata is now formatted as readable key-value pairs:

- `method=GET` instead of `"method":"GET"`
- `status=200` instead of `"statusCode":200`
- `time=4ms` instead of `"duration":"4ms"`

### 3. **Shortened UUIDs**

- Long UUIDs in URLs are truncated: `9e421d12-6331-477e-8c0f-52f7e965a131` → `9e421d12...`
- User IDs shown as: `user=7c175ca2...` for authenticated requests
- Reduces line length while maintaining traceability

### 4. **Visual Status Indicators**

Each request log now includes an icon based on status:

- `✓` (checkmark) - Successful requests (2xx)
- `⚠` (warning) - Client errors (4xx)
- `✗` (cross) - Server errors (5xx)

### 5. **Removed Duplicate Logging**

- Eliminated Morgan HTTP logger that was creating duplicate entries
- Single, clean log entry per request

### 6. **Contextual Error Logging**

Errors now include relevant context without overwhelming detail:

- Error type and message
- Status code, method, URL
- User info (if authenticated)

## Before & After Examples

### Before (Old Format)

```
2026-02-16 01:52:38 [INFO]: → GET /api/messes/9e421d12-6331-477e-8c0f-52f7e965a131 {"method":"GET","url":"/api/messes/9e421d12-6331-477e-8c0f-52f7e965a131","ip":"::ffff:192.168.1.7","userAgent":"okhttp/4.12.0","userId":"anonymous"}
2026-02-16 01:52:38 [INFO]: GET /api/messes/9e421d12-6331-477e-8c0f-52f7e965a131 304 - - 6.022 ms
2026-02-16 01:52:38 [INFO]: ← GET /api/messes/9e421d12-6331-477e-8c0f-52f7e965a131 304 7ms {"method":"GET","url":"/api/messes/9e421d12-6331-477e-8c0f-52f7e965a131","statusCode":304,"duration":"7ms","userId":"anonymous"}
```

### After (New Format)

```
2026-02-16 01:59:43 INFO    | ✓ GET    /api/messes [method=GET, status=200, time=44ms]
```

### Error Logging - Before

```
2026-02-16 01:52:38 [WARN]: ← POST /api/auth/login 401 13ms {"method":"POST","url":"/api/auth/login","statusCode":401,"duration":"13ms","userId":"anonymous"}
```

### Error Logging - After

```
2026-02-16 01:59:53 WARN    | Client Error: Invalid credentials [method=POST, status=401, ip=::1]
2026-02-16 01:59:53 WARN    | ⚠ POST   /api/auth/login [method=POST, status=401, time=13ms]
```

## Benefits

1. **Faster Scanning**: Aligned columns make it easy to scan logs visually
2. **Less Noise**: Removed redundant information and duplicate entries
3. **Better Context**: Status icons provide instant visual feedback
4. **Manageable Line Length**: Shortened UUIDs keep lines from wrapping
5. **Consistent Format**: Every log entry follows the same predictable structure
6. **Production Ready**: Clean format works well in both development and production

## Configuration

The improved format is automatically applied to both:

- Console output (with colors in development)
- Log files (`logs/combined.log` and `logs/error.log`)

No configuration changes needed - the improvements work out of the box!

## Log Files

- **combined.log**: All logs (info, warn, error)
- **error.log**: Only error-level logs
- **Rotation**: Logs rotate at 5MB with 5 file history

## Example Usage

View recent logs:

```powershell
Get-Content logs\combined.log -Tail 20
```

View only errors:

```powershell
Get-Content logs\error.log -Tail 10
```

Follow logs in real-time:

```powershell
Get-Content logs\combined.log -Wait -Tail 20
```
