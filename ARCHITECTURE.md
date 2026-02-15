# 🏗️ MessAround API - Clean Architecture Implementation

## Overview

Production-ready REST API with JWT authentication, role-based access control, and clean architecture separation.

## ✅ What's Implemented

### 🔐 Authentication & Security

- ✅ JWT token-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (user, mess_owner, admin)
- ✅ Protected routes with auth middleware
- ✅ Input validation with express-validator

### 📁 Clean Architecture Structure

```
src/
├── controllers/              # Thin HTTP handlers
│   ├── auth.controller.js
│   ├── mess.controller.js
│   ├── plan.controller.js
│   ├── subscription.controller.js
│   ├── attendance.controller.js
│   └── dashboard.controller.js
│
├── services/                 # Business logic layer
│   ├── auth.service.js
│   ├── mess.service.js
│   ├── plan.service.js
│   ├── subscription.service.js
│   ├── attendance.service.js
│   └── dashboard.service.js
│
├── routes/                   # Route definitions
│   ├── auth.routes.js
│   ├── mess.routes.js
│   ├── plan.routes.js
│   ├── subscription.routes.js
│   ├── attendance.routes.js
│   └── dashboard.routes.js
│
├── middleware/               # Middleware functions
│   ├── auth.js              # JWT verification
│   ├── roleCheck.js         # Role-based access control
│   └── errorHandler.js      # Global error handling
│
├── utils/                    # Helper utilities
│   ├── jwt.js               # Token generation/verification
│   ├── password.js          # Password hashing
│   └── errors.js            # Custom error classes
│
├── db/                       # Database
│   ├── prisma.js            # Prisma client
│   └── connection.js        # Legacy pg pool
│
└── index.js                  # App entry point
```

### 🎯 Complete API Endpoints

#### 1️⃣ Authentication (`/api/auth`)

- ✅ `POST /api/auth/register` - Register new user
- ✅ `POST /api/auth/login` - Login user
- ✅ `GET /api/auth/me` - Get current user profile

#### 2️⃣ Mess Management (`/api/messes`)

- ✅ `POST /api/messes` - Create mess (mess_owner only)
- ✅ `GET /api/messes` - Get all active messes (public)
- ✅ `GET /api/messes/:id` - Get mess by ID (public)
- ✅ `GET /api/messes/my` - Get my messes (mess_owner only)
- ✅ `PUT /api/messes/:id` - Update mess (owner only)

#### 3️⃣ Plan Management (`/api/messes/:messId/plans`)

- ✅ `POST /api/messes/:messId/plans` - Create plan (owner only)
- ✅ `GET /api/messes/:messId/plans` - Get plans (public)

#### 4️⃣ Subscription Management (`/api/subscriptions`)

- ✅ `POST /api/subscriptions` - Create subscription
  - Auto-calculates endDate based on durationType
  - Validates no duplicate active subscriptions
  - Captures plan snapshot
- ✅ `GET /api/subscriptions/my` - Get my subscriptions
- ✅ `PATCH /api/subscriptions/:id/cancel` - Cancel subscription

#### 5️⃣ Attendance Management (`/api/subscriptions/:id/attendance`)

- ✅ `POST /api/subscriptions/:id/attendance` - Mark attendance
  - One record per day (upsert)
  - Only if subscription is active
- ✅ `GET /api/subscriptions/:id/attendance` - Get attendance records

#### 6️⃣ Owner Dashboard (`/api/messes/:messId/today-summary`)

- ✅ `GET /api/messes/:messId/today-summary` - Today's summary
  - Aggregate breakfast/lunch/dinner counts
  - List all active subscribers with attendance

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

**New packages installed:**

- `jsonwebtoken` - JWT token handling
- `bcryptjs` - Password hashing
- `express-validator` - Input validation

### 2. Configure Environment

Update `.env` with JWT settings:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRES_IN=7d
```

### 3. Start the Server

```bash
npm run dev
```

## 🧪 Testing the API

### Example: Complete User Flow

#### 1. Register a mess owner

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Owner",
    "email": "jane@example.com",
    "password": "password123",
    "role": "mess_owner",
    "phone": "+1234567890"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### 2. Create a mess

```bash
curl -X POST http://localhost:3000/api/messes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Jane Kitchen",
    "location": "Downtown",
    "description": "Healthy home-cooked meals",
    "vegAvailable": true,
    "nonvegAvailable": false
  }'
```

#### 3. Create a plan

```bash
curl -X POST http://localhost:3000/api/messes/MESS_ID/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Monthly Veg Plan",
    "price": 3000,
    "durationType": "monthly",
    "mealType": "veg",
    "mealsPerDay": 2
  }'
```

#### 4. Register a regular user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John User",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'
```

#### 5. Subscribe to a plan

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "planId": "PLAN_ID",
    "startDate": "2026-02-20T00:00:00Z"
  }'
```

#### 6. Mark attendance

```bash
curl -X POST http://localhost:3000/api/subscriptions/SUBSCRIPTION_ID/attendance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "breakfast": true,
    "lunch": true,
    "dinner": false
  }'
```

#### 7. View today's summary (mess owner)

```bash
curl -X GET http://localhost:3000/api/messes/MESS_ID/today-summary \
  -H "Authorization: Bearer OWNER_TOKEN"
```

## 🔒 Security Features

### Authentication Flow

1. User registers/logs in → receives JWT token
2. Token includes: `{ id, email, role }`
3. Protected routes require `Authorization: Bearer <token>` header
4. Middleware verifies token and attaches `req.user`

### Authorization Layers

1. **Auth Middleware** - Verifies JWT token
2. **Role Check Middleware** - Validates user role
3. **Ownership Validation** - In service layer (users can only access their data)

### Password Security

- Passwords hashed with bcrypt (10 salt rounds)
- Never returned in API responses
- Plain text passwords in existing DB should be migrated

## 📋 Design Principles

### 1. Controller Pattern

Controllers are **thin** - only handle HTTP:

```javascript
async createMess(req, res, next) {
  try {
    const mess = await messService.createMess(req.user.id, req.body);
    res.status(201).json({ success: true, data: mess });
  } catch (error) {
    next(error);
  }
}
```

### 2. Service Pattern

Services contain **all business logic**:

```javascript
async createMess(ownerId, messData) {
  // Validation
  if (!name || !location) {
    throw new ValidationError("Name and location required");
  }

  // Business logic
  const mess = await prisma.mess.create({...});

  return mess;
}
```

### 3. Error Handling

Custom error classes with proper HTTP codes:

```javascript
throw new ValidationError("Invalid input"); // 400
throw new UnauthorizedError("Invalid token"); // 401
throw new ForbiddenError("Access denied"); // 403
throw new NotFoundError("Resource not found"); // 404
throw new ConflictError("Duplicate entry"); // 409
```

Global error handler catches all errors and formats responses.

### 4. Validation

Input validation with express-validator:

```javascript
[
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("role").isIn(["user", "mess_owner", "admin"]),
];
```

## 🎓 Key Implementation Details

### Auto-calculated End Date

```javascript
const start = new Date(startDate);
const endDate = new Date(start);

if (plan.durationType === "weekly") {
  endDate.setDate(endDate.getDate() + 7);
} else if (plan.durationType === "monthly") {
  endDate.setMonth(endDate.getMonth() + 1);
}
```

### Duplicate Subscription Check

```javascript
const existingSubscription = await prisma.subscription.findFirst({
  where: { userId, planId, status: "active" },
});

if (existingSubscription) {
  throw new ConflictError("Already subscribed");
}
```

### Attendance Upsert (One Per Day)

```javascript
const attendance = await prisma.attendance.upsert({
  where: {
    subscriptionId_date: { subscriptionId, date: today },
  },
  update: { breakfast, lunch, dinner },
  create: { subscriptionId, date: today, breakfast, lunch, dinner },
});
```

### Today's Summary Aggregation

```javascript
const activeSubscriptions = await prisma.subscription.findMany({
  where: {
    plan: { messId },
    status: "active",
    startDate: { lte: today },
    endDate: { gte: today },
  },
  include: { attendance: { where: { date: today } } },
});
```

## 📚 Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference
- **[PRISMA_GUIDE.md](./PRISMA_GUIDE.md)** - Database schema guide

## ⚠️ Migration Notes

### For Existing Users

If you have existing user data with plain text passwords:

**Option 1:** Hash existing passwords (migration script needed)
**Option 2:** Force password reset for all users

### Old Routes

The original `/api/*` routes from `api.js` are now replaced with:

- Organized route modules
- Protected endpoints
- Role-based access control

## 🔄 Next Steps

### Recommended Enhancements

1. ✅ Add refresh token mechanism
2. ✅ Implement rate limiting (express-rate-limit)
3. ✅ Add request logging (morgan)
4. ✅ Add API versioning (/api/v1/...)
5. ✅ Add pagination for list endpoints
6. ✅ Add filtering/sorting query params
7. ✅ Add email verification
8. ✅ Add password reset flow
9. ✅ Add file upload for mess images
10. ✅ Add analytics endpoints

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Add request logging
- [ ] Set up monitoring
- [ ] Configure CORS properly
- [ ] Add helmet for security headers
- [ ] Set up CI/CD pipeline

## 🐛 Troubleshooting

### "Invalid token" errors

- Check if `JWT_SECRET` matches between registration and login
- Verify `Authorization: Bearer <token>` header format
- Check token expiration (default: 7 days)

### "Access forbidden" errors

- Verify user has correct role (user/mess_owner/admin)
- Check ownership (e.g., mess owner can only update their own mess)

### Validation errors

- Check request body matches expected format
- Verify all required fields are present
- Check data types (strings, booleans, numbers)

## 📞 Support

For issues or questions, refer to:

- API Documentation: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- Database Guide: [PRISMA_GUIDE.md](./PRISMA_GUIDE.md)
