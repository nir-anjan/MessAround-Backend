# MessAround API Documentation

## Overview

Complete REST API for the MessAround mess management system with JWT authentication and role-based access control.

**Base URL:** `http://localhost:3000`

## Authentication

Most endpoints require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <your_jwt_token>
```

## User Roles

- `user` - Regular users who subscribe to meal plans
- `mess_owner` - Business owners who manage messes
- `admin` - System administrators

---

## 📌 API Endpoints

### 1️⃣ Authentication (`/api/auth`)

#### Register User

```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user",           // Optional: user | mess_owner | admin (default: user)
  "phone": "+1234567890"    // Optional
}
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "phone": "+1234567890",
      "createdAt": "2026-02-15T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

#### Get Current User Profile

```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "phone": "+1234567890",
    "createdAt": "2026-02-15T10:00:00Z",
    "updatedAt": "2026-02-15T10:00:00Z"
  }
}
```

---

### 2️⃣ Mess Management (`/api/messes`)

#### Create Mess (Mess Owner Only)

```http
POST /api/messes
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Delicious Mess",
  "description": "Best home-cooked meals",
  "location": "123 Main St, City",
  "vegAvailable": true,
  "nonvegAvailable": false
}
```

**Response:** `201 Created`

#### Get All Active Messes (Public)

```http
GET /api/messes
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Delicious Mess",
      "description": "Best home-cooked meals",
      "location": "123 Main St, City",
      "vegAvailable": true,
      "nonvegAvailable": false,
      "isActive": true,
      "owner": {
        "id": "uuid",
        "name": "Owner Name",
        "email": "owner@example.com",
        "phone": "+1234567890"
      },
      "plans": [...]
    }
  ]
}
```

#### Get Mess by ID (Public)

```http
GET /api/messes/:id
```

#### Get My Messes (Mess Owner Only)

```http
GET /api/messes/my
Authorization: Bearer <token>
```

#### Update Mess (Mess Owner Only - Own Mess)

```http
PUT /api/messes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Mess Name",
  "description": "Updated description",
  "location": "New Address",
  "vegAvailable": true,
  "nonvegAvailable": true,
  "isActive": true
}
```

---

### 3️⃣ Plan Management (`/api/messes/:messId/plans`)

#### Create Plan (Mess Owner Only)

```http
POST /api/messes/:messId/plans
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Monthly Veg Plan",
  "price": 3000,
  "durationType": "monthly",     // weekly | monthly
  "mealType": "veg",             // veg | nonveg
  "mealsPerDay": 2               // 1-3
}
```

**Response:** `201 Created`

#### Get Plans for Mess (Public)

```http
GET /api/messes/:messId/plans
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "messId": "uuid",
      "name": "Monthly Veg Plan",
      "price": 3000,
      "durationType": "monthly",
      "mealType": "veg",
      "mealsPerDay": 2,
      "isActive": true
    }
  ]
}
```

---

### 4️⃣ Subscription Management (`/api/subscriptions`)

#### Create Subscription

```http
POST /api/subscriptions
Authorization: Bearer <token>
Content-Type: application/json

{
  "planId": "uuid",
  "startDate": "2026-02-20T00:00:00Z"
}
```

**Notes:**

- `endDate` is auto-calculated based on plan's `durationType`
- Validates that user doesn't have duplicate active subscription
- Captures plan snapshot (price, name, mealType)

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Subscription created successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "planId": "uuid",
    "startDate": "2026-02-20T00:00:00Z",
    "endDate": "2026-03-20T00:00:00Z",
    "status": "active",
    "priceAtPurchase": 3000,
    "planNameSnapshot": "Monthly Veg Plan",
    "mealTypeSnapshot": "veg",
    "plan": {...}
  }
}
```

#### Get My Subscriptions

```http
GET /api/subscriptions/my
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "status": "active",
      "startDate": "2026-02-20T00:00:00Z",
      "endDate": "2026-03-20T00:00:00Z",
      "priceAtPurchase": 3000,
      "plan": {...},
      "attendance": [...]
    }
  ]
}
```

#### Cancel Subscription

```http
PATCH /api/subscriptions/:id/cancel
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {...}
}
```

---

### 5️⃣ Attendance Management (`/api/subscriptions/:id/attendance`)

#### Mark Attendance

```http
POST /api/subscriptions/:id/attendance
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-02-15T00:00:00Z",  // Optional, defaults to today
  "breakfast": true,
  "lunch": true,
  "dinner": false
}
```

**Notes:**

- Only one record per day (upsert behavior)
- Only allowed if subscription status = `active`
- Date must be within subscription period

**Response:** `201 Created`

#### Get Attendance Records

```http
GET /api/subscriptions/:id/attendance?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "subscriptionId": "uuid",
      "date": "2026-02-15T00:00:00Z",
      "breakfast": true,
      "lunch": true,
      "dinner": false
    }
  ],
  "stats": {
    "totalDays": 15,
    "breakfastCount": 12,
    "lunchCount": 14,
    "dinnerCount": 8
  }
}
```

---

### 6️⃣ Owner Dashboard (`/api/messes/:messId/today-summary`)

#### Get Today's Attendance Summary (Mess Owner Only)

```http
GET /api/messes/:messId/today-summary
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "date": "2026-02-15T00:00:00Z",
    "mess": {
      "id": "uuid",
      "name": "Delicious Mess",
      "location": "123 Main St, City"
    },
    "summary": {
      "totalActiveSubscriptions": 50,
      "breakfastCount": 35,
      "lunchCount": 42,
      "dinnerCount": 28
    },
    "details": [
      {
        "subscriptionId": "uuid",
        "user": {
          "id": "uuid",
          "name": "John Doe",
          "email": "john@example.com",
          "phone": "+1234567890"
        },
        "plan": {
          "id": "uuid",
          "name": "Monthly Veg Plan",
          "mealType": "veg"
        },
        "attendance": {
          "breakfast": true,
          "lunch": true,
          "dinner": false
        }
      }
    ]
  }
}
```

---

## 🔒 Authorization Summary

| Endpoint                               | Public | User     | Mess Owner | Admin |
| -------------------------------------- | ------ | -------- | ---------- | ----- |
| POST /api/auth/register                | ✅     | ✅       | ✅         | ✅    |
| POST /api/auth/login                   | ✅     | ✅       | ✅         | ✅    |
| GET /api/auth/me                       |        | ✅       | ✅         | ✅    |
| GET /api/messes                        | ✅     | ✅       | ✅         | ✅    |
| GET /api/messes/:id                    | ✅     | ✅       | ✅         | ✅    |
| POST /api/messes                       |        |          | ✅         |       |
| GET /api/messes/my                     |        |          | ✅         |       |
| PUT /api/messes/:id                    |        |          | ✅ (own)   |       |
| GET /api/messes/:messId/plans          | ✅     | ✅       | ✅         | ✅    |
| POST /api/messes/:messId/plans         |        |          | ✅ (own)   |       |
| POST /api/subscriptions                |        | ✅       | ✅         | ✅    |
| GET /api/subscriptions/my              |        | ✅       | ✅         | ✅    |
| PATCH /api/subscriptions/:id/cancel    |        | ✅ (own) | ✅ (own)   | ✅    |
| POST /api/subscriptions/:id/attendance |        | ✅ (own) | ✅ (own)   | ✅    |
| GET /api/subscriptions/:id/attendance  |        | ✅ (own) | ✅ (own)   | ✅    |
| GET /api/messes/:messId/today-summary  |        |          | ✅ (own)   |       |

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message here",
  "errors": [...],          // Only for validation errors
  "stack": "..."            // Only in development mode
}
```

### Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## 🧪 Testing the API

### 1. Register a mess owner

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Owner",
    "email": "jane@example.com",
    "password": "password123",
    "role": "mess_owner"
  }'
```

### 2. Login and get token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@example.com",
    "password": "password123"
  }'
```

### 3. Create a mess (use token from step 2)

```bash
curl -X POST http://localhost:3000/api/messes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Jane's Kitchen",
    "location": "Downtown",
    "vegAvailable": true
  }'
```

---

## 🏗️ Architecture

### Clean Architecture Layers

```
src/
├── routes/              # HTTP route definitions
├── controllers/         # Request/response handlers (thin)
├── services/           # Business logic layer
├── middleware/         # Authentication, validation, error handling
├── utils/              # Helper functions (JWT, password, errors)
└── db/                 # Database connection (Prisma)
```

### Design Principles

- **Separation of Concerns**: Routes → Controllers → Services → Database
- **Thin Controllers**: Only handle HTTP, delegate to services
- **Service Layer**: All business logic and validation
- **Error Handling**: Centralized with custom error classes
- **Security**: JWT authentication + Role-based access control

---

## 🔐 Security Features

✅ Password hashing with bcrypt (10 rounds)  
✅ JWT token authentication  
✅ Role-based access control (RBAC)  
✅ Ownership validation (users can only access their own data)  
✅ Input validation with express-validator  
✅ Custom error classes with proper HTTP status codes  
✅ Protected routes with auth middleware  
✅ Request sanitization

---

## 📝 Notes

1. **Snapshot Pattern**: Subscriptions capture plan details at purchase time for billing accuracy
2. **One Attendance Per Day**: Upsert logic ensures single record per subscription per day
3. **Auto-calculated End Date**: Based on plan's duration type (weekly = +7 days, monthly = +1 month)
4. **Active Subscription Validation**: Attendance marking requires active subscription status
5. **Ownership Checks**: Users can only manage their own subscriptions/attendance
6. **Cascade Deletes**: Deleting mess/user cascades to related records (via Prisma)
