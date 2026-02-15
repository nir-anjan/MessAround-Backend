# 🎯 Quick Start Guide - MessAround API

## ✅ Implementation Complete!

Your mess management API is now fully implemented with:

- ✅ JWT Authentication
- ✅ Role-based Access Control
- ✅ Clean Architecture (Controllers → Services → Database)
- ✅ Complete CRUD operations for all resources
- ✅ Input validation
- ✅ Global error handling

---

## 🚀 Start the Server

```bash
npm start
# Or for development with auto-reload:
npm run dev
```

**Server runs on:** `http://localhost:3000`

---

## 📚 Documentation Files

1. **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with all endpoints
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Architecture overview and design patterns
3. **[PRISMA_GUIDE.md](./PRISMA_GUIDE.md)** - Database schema documentation

---

## 🧪 Quick Test

### Run automated tests:

```bash
node test-api.js
```

### Manual test with curl:

**1. Register a mess owner:**

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Owner","email":"jane@example.com","password":"password123","role":"mess_owner"}'
```

**2. Login:**

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"password123"}'
```

**3. Create a mess (use token from step 2):**

```bash
curl -X POST http://localhost:3000/api/messes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"name":"Jane Kitchen","location":"Downtown","vegAvailable":true}'
```

---

## 📁 New Project Structure

```
src/
├── controllers/          # HTTP request handlers (thin)
│   ├── auth.controller.js
│   ├── mess.controller.js
│   ├── plan.controller.js
│   ├── subscription.controller.js
│   ├── attendance.controller.js
│   └── dashboard.controller.js
│
├── services/            # Business logic layer
│   ├── auth.service.js
│   ├── mess.service.js
│   ├── plan.service.js
│   ├── subscription.service.js
│   ├── attendance.service.js
│   └── dashboard.service.js
│
├── routes/              # Route definitions + validation
│   ├── auth.routes.js
│   ├── mess.routes.js
│   ├── plan.routes.js
│   ├── subscription.routes.js
│   ├── attendance.routes.js
│   └── dashboard.routes.js
│
├── middleware/          # Auth, RBAC, error handling
│   ├── auth.js
│   ├── roleCheck.js
│   └── errorHandler.js
│
├── utils/               # Helper utilities
│   ├── jwt.js
│   ├── password.js
│   └── errors.js
│
└── index.js             # App entry point
```

---

## 🔐 Authentication Flow

1. **Register/Login** → Get JWT token
2. **Add token to requests:** `Authorization: Bearer <token>`
3. **Token contains:** `{ id, email, role }`
4. **Middleware verifies token** → Attaches `req.user`

---

## 🎭 User Roles

| Role         | Description     | Special Access                                 |
| ------------ | --------------- | ---------------------------------------------- |
| `user`       | Regular users   | Subscribe to plans, mark attendance            |
| `mess_owner` | Business owners | Create/manage messes and plans, view dashboard |
| `admin`      | System admins   | Full access (future use)                       |

---

## 📋 All Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get profile (protected)

### Messes (`/api/messes`)

- `GET /api/messes` - List all (public)
- `GET /api/messes/:id` - Get by ID (public)
- `GET /api/messes/my` - My messes (owner only)
- `POST /api/messes` - Create (owner only)
- `PUT /api/messes/:id` - Update (owner only)

### Plans (`/api/messes/:messId/plans`)

- `GET /api/messes/:messId/plans` - List plans (public)
- `POST /api/messes/:messId/plans` - Create plan (owner only)

### Subscriptions (`/api/subscriptions`)

- `POST /api/subscriptions` - Subscribe to plan
- `GET /api/subscriptions/my` - My subscriptions
- `PATCH /api/subscriptions/:id/cancel` - Cancel subscription

### Attendance (`/api/subscriptions/:id/attendance`)

- `POST /api/subscriptions/:id/attendance` - Mark attendance
- `GET /api/subscriptions/:id/attendance` - Get attendance

### Dashboard (`/api/messes/:messId/today-summary`)

- `GET /api/messes/:messId/today-summary` - Today's summary (owner only)

---

## 🔑 Key Features

### Auto-calculated End Date

Subscriptions automatically calculate `endDate`:

- Weekly plan: `startDate + 7 days`
- Monthly plan: `startDate + 1 month`

### Duplicate Prevention

Can't subscribe twice to same plan while active

### Plan Snapshots

Subscription captures plan details at purchase:

- `priceAtPurchase`
- `planNameSnapshot`
- `mealTypeSnapshot`

### Attendance Rules

- One record per day (upsert behavior)
- Only for active subscriptions
- Must be within subscription period

### Dashboard Aggregation

Real-time meal counts for active subscribers:

- Total active subscriptions
- Breakfast count
- Lunch count
- Dinner count

---

## ⚠️ Important Security Notes

### JWT Configuration

Update `.env` with a strong secret:

```env
JWT_SECRET=your-strong-secret-key-minimum-32-characters
JWT_EXPIRES_IN=7d
```

### Existing Passwords

⚠️ **Warning:** Existing user passwords in database are plain text!

**Options:**

1. Delete all users and register fresh (recommended for development)
2. Create migration script to hash existing passwords
3. Force password reset for all users

---

## 🛠️ Environment Variables

Required in `.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres123@localhost:5433/messaround_db

# Server
PORT=3000
NODE_ENV=development

# JWT (MUST CHANGE IN PRODUCTION!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production-12345
JWT_EXPIRES_IN=7d
```

---

## 🐛 Troubleshooting

### "Invalid token" errors

- Check `JWT_SECRET` is consistent
- Verify header format: `Authorization: Bearer <token>`
- Check token hasn't expired (default: 7 days)

### "Access forbidden" errors

- Verify user has correct role
- Check ownership (users can only access their own resources)

### "Validation failed" errors

- Check request body matches expected format
- Verify all required fields are present
- Check data types match

### Server won't start

- Check if port 3000 is in use
- Verify database is running: `docker ps`
- Check `.env` file exists with correct values

---

## 📊 Testing Checklist

- [ ] Register mess owner
- [ ] Login mess owner
- [ ] Create mess
- [ ] Create plan
- [ ] Register regular user
- [ ] Login regular user
- [ ] Create subscription
- [ ] Mark attendance
- [ ] View attendance
- [ ] View dashboard (owner)
- [ ] Cancel subscription
- [ ] Test unauthorized access (should fail)
- [ ] Test wrong role access (should fail)

---

## 🎓 Development Tips

### Adding New Endpoints

1. Create service method (business logic)
2. Create controller method (HTTP handler)
3. Add route with validation
4. Wire route in `index.js`

### Adding New Validations

Use express-validator in routes:

```javascript
(body("email").isEmail(),
  body("price").isFloat({ min: 0 }),
  body("role").isIn(["user", "mess_owner"]));
```

### Custom Errors

Throw appropriate error from services:

```javascript
throw new ValidationError("Invalid input"); // 400
throw new UnauthorizedError("Invalid token"); // 401
throw new ForbiddenError("Access denied"); // 403
throw new NotFoundError("Not found"); // 404
throw new ConflictError("Duplicate"); // 409
```

---

## 📦 Installed Packages

**New dependencies:**

- `jsonwebtoken` - JWT tokens
- `bcryptjs` - Password hashing
- `express-validator` - Input validation

**Existing:**

- `express` - Web framework
- `@prisma/client` - ORM
- `pg` - PostgreSQL driver
- `cors` - CORS middleware
- `dotenv` - Environment variables

---

## 🚀 Next Steps

### Recommended Enhancements

1. Add refresh token mechanism
2. Implement rate limiting
3. Add request logging (morgan)
4. Add pagination for list endpoints
5. Add email verification
6. Add password reset flow
7. Add file upload for images
8. Add analytics endpoints

### Production Checklist

- [ ] Change `JWT_SECRET` to strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Add rate limiting
- [ ] Configure CORS properly
- [ ] Add helmet for security headers
- [ ] Set up monitoring
- [ ] Set up CI/CD pipeline

---

## 📞 Need Help?

- **API Reference:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
- **Architecture Guide:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Database Schema:** [PRISMA_GUIDE.md](./PRISMA_GUIDE.md)

---

**🎉 Your MessAround API is ready for development!**

Run `node test-api.js` to verify everything works.
