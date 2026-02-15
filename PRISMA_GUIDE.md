# Prisma Setup for Mess Subscription Marketplace

## Database Schema Overview

This project uses Prisma ORM with PostgreSQL to manage a multi-vendor mess subscription marketplace.

### Models

1. **User** - Working professionals, mess owners, and admins
2. **Mess** - Businesses owned by mess owners
3. **Plan** - Subscription products offered by messes
4. **Subscription** - Contracts between users and plans
5. **Attendance** - Daily meal participation tracking

### Enums

- `Role`: user, mess_owner, admin
- `SubscriptionStatus`: active, paused, cancelled
- `DurationType`: weekly, monthly
- `MealType`: veg, nonveg

## Prisma Commands

### Generate Prisma Client

```bash
npx prisma generate
```

### Create a New Migration

```bash
npx prisma migrate dev --name <migration_name>
```

### Apply Migrations (Production)

```bash
npx prisma migrate deploy
```

### Reset Database (Development)

```bash
npx prisma migrate reset
```

### Open Prisma Studio (Database GUI)

```bash
npx prisma studio
```

### View Current Database Schema

```bash
npx prisma db pull
```

### Format Prisma Schema

```bash
npx prisma format
```

## Using Prisma in Your Code

### Import Prisma Client

```javascript
const prisma = require("./db/prisma");
```

### Example Queries

#### Create a User

```javascript
const user = await prisma.user.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    password: "hashed_password",
    role: "user",
    phone: "+1234567890",
  },
});
```

#### Create a Mess with Plans

```javascript
const mess = await prisma.mess.create({
  data: {
    name: "Healthy Eats Mess",
    description: "Nutritious home-cooked meals",
    location: "Downtown, City",
    vegAvailable: true,
    nonvegAvailable: true,
    ownerId: userId,
    plans: {
      create: [
        {
          name: "Monthly Veg Plan",
          price: 3000,
          durationType: "monthly",
          mealType: "veg",
          mealsPerDay: 2,
        },
      ],
    },
  },
  include: {
    plans: true,
  },
});
```

#### Create a Subscription

```javascript
const subscription = await prisma.subscription.create({
  data: {
    userId: userId,
    planId: planId,
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    priceAtPurchase: 3000,
    planNameSnapshot: "Monthly Veg Plan",
    mealTypeSnapshot: "veg",
    status: "active",
  },
});
```

#### Mark Attendance

```javascript
const attendance = await prisma.attendance.upsert({
  where: {
    subscriptionId_date: {
      subscriptionId: subscriptionId,
      date: new Date().toISOString().split("T")[0],
    },
  },
  update: {
    breakfast: true,
    lunch: true,
  },
  create: {
    subscriptionId: subscriptionId,
    date: new Date(),
    breakfast: true,
    lunch: true,
    dinner: false,
  },
});
```

#### Find User with Subscriptions

```javascript
const userWithSubscriptions = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    subscriptions: {
      include: {
        plan: {
          include: {
            mess: true,
          },
        },
        attendance: true,
      },
    },
  },
});
```

#### Find Active Subscriptions for a Mess

```javascript
const messSubscriptions = await prisma.subscription.findMany({
  where: {
    plan: {
      messId: messId,
    },
    status: "active",
  },
  include: {
    user: {
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    },
    plan: true,
  },
});
```

## Relationship Rules

### Cascade Deletes

- Deleting a **User** (mess_owner) → deletes all their **Messes**
- Deleting a **Mess** → deletes all its **Plans**
- Deleting a **User** → deletes all their **Subscriptions**
- Deleting a **Subscription** → deletes all its **Attendance** records

### Restrict Deletes

- Deleting a **Plan** with active subscriptions → **BLOCKED** (must cancel subscriptions first)

## Database Connection

The Prisma client is initialized in `src/db/prisma.js` and uses the `DATABASE_URL` from your `.env` file:

```
DATABASE_URL=postgresql://postgres:postgres123@localhost:5433/messaround_db
```

## Development Tips

1. **Always run migrations after schema changes**:

   ```bash
   npx prisma migrate dev
   ```

2. **Use Prisma Studio for data exploration**:

   ```bash
   npx prisma studio
   ```

3. **Type safety**: Prisma generates TypeScript types automatically (useful if you migrate to TS later)

4. **Transactions**: For operations that need atomicity

   ```javascript
   await prisma.$transaction([
     prisma.user.create({ data: { ... } }),
     prisma.subscription.create({ data: { ... } }),
   ]);
   ```

5. **Raw queries** (when needed):
   ```javascript
   const result =
     await prisma.$queryRaw`SELECT * FROM users WHERE role = 'mess_owner'`;
   ```

## Troubleshooting

### Migration Conflicts

```bash
npx prisma migrate reset  # Resets database (dev only!)
```

### Out of Sync

```bash
npx prisma generate  # Regenerate client
npx prisma db push   # Push schema without migration (dev only)
```

### Connection Issues

- Verify Docker container is running: `docker ps`
- Check `.env` has correct `DATABASE_URL`
- Ensure port 5433 is accessible

## Next Steps

1. Add authentication and authorization middleware
2. Create REST API endpoints for each model
3. Implement business logic for subscriptions and billing
4. Add validation using Zod or Joi
5. Set up automated tests with Prisma test environment
