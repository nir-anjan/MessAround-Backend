# 📊 Logging System - Implementation Complete!

## ✅ What Was Implemented

### 1. **Winston Logger** (`src/utils/logger.js`)
- Multi-level logging (info, warn, error)
- Colored console output
- File logging with rotation
- Automatic log directory creation

### 2. **Morgan HTTP Logger**
- HTTP request logging
- Response time tracking
- Integration with Winston

### 3. **Route Lister** (`src/utils/routeLister.js`)
- Lists all endpoints at startup
- Grouped by category
- Shows total endpoint count

### 4. **Enhanced Error Handler** (`src/middleware/errorHandler.js`)
- Logs all errors with context
- Includes user ID, IP, method, URL
- Different log levels based on severity

### 5. **Request/Response Logging** (`src/index.js`)
- Logs every incoming request
- Logs every response with status and duration
- Tracks user context

---

## 📁 Log Files Created

All logs are saved to the `logs/` directory:

- **`logs/combined.log`** - All logs (info, warn, error)
- **`logs/error.log`** - Errors only
- **Console output** - Real-time colored logs

**Features:**
- Automatic rotation (5MB max per file)
- Keeps last 5 files
- JSON metadata for structured logging

---

## 🎯 What Gets Logged

### 1. **Server Startup**
```
✅ Database connected successfully
🚀 Server is running on port 3000
📍 AVAILABLE API ENDPOINTS
🏥 Health
  GET     /health
  GET     /health/db
🔐 Authentication
  POST    /api/auth/register
  ...
📊 Total Endpoints: 18
```

### 2. **HTTP Requests**
```
→ POST /api/auth/login {"method":"POST","url":"/api/auth/login","ip":"::1"}
← POST /api/auth/login 200 45ms {"statusCode":200,"duration":"45ms"}
```

### 3. **Errors**
```
[WARN]: Client Error: Invalid credentials {"method":"POST","statusCode":401,"userId":"anonymous"}
[ERROR]: Server Error: Database connection failed {"method":"GET","statusCode":500,"stack":"..."}
```

### 4. **Business Logic**
Every controller/service can now use the logger:
```javascript
const logger = require('../utils/logger');

// In your service
logger.info('Subscription created', { userId, planId, subscriptionId });
logger.warn('Duplicate subscription attempt', { userId, planId });
logger.error('Payment processing failed', { error: err.message });
```

---

## 📊 Example Log Output

### Console (Colored):
```bash
2026-02-16 01:09:56 [INFO]: ✅ Database connected successfully
2026-02-16 01:09:56 [INFO]: 🚀 Server is running on port 3000
2026-02-16 01:10:15 [INFO]: → POST /api/auth/register
2026-02-16 01:10:15 [INFO]: ← POST /api/auth/register 201 123ms
2026-02-16 01:10:20 [INFO]: → POST /api/auth/login
2026-02-16 01:10:20 [INFO]: ← POST /api/auth/login 200 45ms
2026-02-16 01:10:25 [WARN]: Client Error: Invalid token {"statusCode":401}
2026-02-16 01:10:30 [INFO]: → GET /api/messes
2026-02-16 01:10:30 [INFO]: ← GET /api/messes 200 87ms
```

### File (combined.log):
```
2026-02-16 01:09:56 [INFO]: ✅ Database connected successfully
2026-02-16 01:10:15 [INFO]: → POST /api/auth/register {"method":"POST","url":"/api/auth/register","ip":"::1","userAgent":"curl/7.64.1","userId":"anonymous"}
2026-02-16 01:10:15 [INFO]: ← POST /api/auth/register 201 123ms {"method":"POST","url":"/api/auth/register","statusCode":201,"duration":"123ms","userId":"anonymous"}
```

---

## 🔧 How to Use

### View Real-Time Logs (Console)
Just run the server - logs appear in console with colors:
```bash
npm start
```

### View Log Files
```bash
# Combined logs (all levels)
cat logs/combined.log

# Errors only
cat logs/error.log

# Tail live logs
tail -f logs/combined.log
```

### Add Custom Logging to Your Code
```javascript
const logger = require('../utils/logger');

// In services
logger.info('User registered successfully', { userId, email });
logger.warn('Subscription limit reached', { userId, limit: 5 });
logger.error('Payment failed', { error: err.message, userId });

// With metadata
logger.info('Attendance marked', {
  userId,
  subscriptionId,
  date: today,
  breakfast: true,
  lunch: true
});
```

---

## 🎨 Log Levels

**INFO** - Normal operations
- Server startup
- Successful requests
- Business events

**WARN** - Issues that don't break the app
- Client errors (400-499)
- Validation failures
- Rate limit warnings
- 404 errors

**ERROR** - Serious problems
- Server errors (500+)
- Database failures
- Unhandled exceptions
- Stack traces included

---

## 📋 Logged Information

### For Every Request:
✅ HTTP Method (GET, POST, etc.)
✅ URL/Endpoint
✅ Status Code
✅ Response Time
✅ User ID (if authenticated)
✅ IP Address
✅ User Agent

### For Every Error:
✅ Error message
✅ Stack trace
✅ Request context
✅ User information
✅ Timestamp

---

## 🚀 Testing the Logging

### 1. Test Successful Request
```bash
curl http://localhost:3000/health
```

**Expected Logs:**
```
[INFO]: → GET /health
[INFO]: ← GET /health 200 5ms
```

### 2. Test 404 Error
```bash
curl http://localhost:3000/nonexistent
```

**Expected Logs:**
```
[INFO]: → GET /nonexistent
[WARN]: 404 Not Found: GET /nonexistent
[WARN]: ← GET /nonexistent 404 2ms
```

### 3. Test Authentication Error
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wrong@test.com","password":"wrong"}'
```

**Expected Logs:**
```
[INFO]: → POST /api/auth/login
[WARN]: Client Error: Invalid credentials {"statusCode":401}
[WARN]: ← POST /api/auth/login 401 35ms
```

---

## 📊 Benefits

### 1. **Debugging**
- See exactly what's happening
- Track down errors quickly
- Understand request flow

### 2. **Monitoring**
- Track API usage
- Identify slow endpoints
- Monitor error rates

### 3. **Security**
- Track failed login attempts
- Monitor suspicious activity
- Audit user actions

### 4. **Performance**
- Measure response times
- Identify bottlenecks
- Track database query performance

---

## 🎯 Configuration

### Environment Variables
```env
# Set log level (default: info)
LOG_LEVEL=info  # Options: error, warn, info, debug

# Change for production
NODE_ENV=production  # Uses 'combined' format for Morgan
```

### Log Rotation Settings
In `src/utils/logger.js`:
```javascript
maxsize: 5242880,  // 5MB per file
maxFiles: 5,       // Keep last 5 files
```

---

## 🔍 Advanced Usage

### Custom Log Metadata
```javascript
logger.info('Complex operation', {
  operation: 'subscription_creation',
  userId: req.user.id,
  planId: plan.id,
  duration: endTime - startTime,
  metadata: {
    source: 'mobile_app',
    version: '2.1.0'
  }
});
```

### Error Logging with Stack Trace
```javascript
try {
  await someOperation();
} catch (error) {
  logger.error('Operation failed', {
    error: error.message,
    stack: error.stack,
    userId: req.user.id,
    context: { planId, subscriptionId }
  });
  throw error;
}
```

---

## ✅ Verification

Check that everything is working:

1. **Server starts with endpoint listing** ✅
2. **Logs appear in console** ✅
3. **Files created in `logs/` directory** ✅
4. **Requests logged** ✅
5. **Errors logged with context** ✅

---

## 🎉 Summary

Your API now has **production-grade logging**:
- ✅ All requests/responses logged
- ✅ All errors tracked with context
- ✅ Endpoint listing at startup
- ✅ File-based log persistence
- ✅ Automatic log rotation
- ✅ Colored console output
- ✅ User context tracking
- ✅ Performance monitoring

**Check your logs:**
```bash
# View combined logs
cat logs/combined.log

# View errors only
cat logs/error.log
```

Your MessAround API is now fully observable! 📊
