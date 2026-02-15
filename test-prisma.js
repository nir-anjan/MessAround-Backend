const prisma = require("./src/db/prisma");

async function testPrisma() {
  console.log("🧪 Testing Prisma connection and models...\n");

  try {
    // Test 1: Connection
    await prisma.$connect();
    console.log("✅ Database connected successfully\n");

    // Clean up existing test data first
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ["test@example.com", "owner@example.com"],
        },
      },
    });
    console.log("🧹 Cleaned up existing test data\n");

    // Test 2: Create a test user
    const testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "hashed_password_here",
        role: "user",
        phone: "+1234567890",
      },
    });
    console.log(
      "✅ Created test user:",
      testUser.name,
      "(ID:",
      testUser.id,
      ")\n",
    );

    // Test 3: Create a mess owner
    const messOwner = await prisma.user.create({
      data: {
        name: "Mess Owner",
        email: "owner@example.com",
        password: "hashed_password_here",
        role: "mess_owner",
        phone: "+9876543210",
      },
    });
    console.log(
      "✅ Created mess owner:",
      messOwner.name,
      "(ID:",
      messOwner.id,
      ")\n",
    );

    // Test 4: Create a mess with plans
    const mess = await prisma.mess.create({
      data: {
        name: "Healthy Eats Mess",
        description: "Fresh home-cooked meals",
        location: "Downtown, City",
        vegAvailable: true,
        nonvegAvailable: true,
        ownerId: messOwner.id,
        plans: {
          create: [
            {
              name: "Monthly Veg Plan",
              price: 3000,
              durationType: "monthly",
              mealType: "veg",
              mealsPerDay: 2,
            },
            {
              name: "Weekly Non-Veg Plan",
              price: 1000,
              durationType: "weekly",
              mealType: "nonveg",
              mealsPerDay: 3,
            },
          ],
        },
      },
      include: {
        plans: true,
      },
    });
    console.log("✅ Created mess:", mess.name);
    console.log("   Plans created:", mess.plans.length);
    mess.plans.forEach((plan) => {
      console.log(`   - ${plan.name} (₹${plan.price}, ${plan.mealType})`);
    });
    console.log();

    // Test 5: Create a subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: testUser.id,
        planId: mess.plans[0].id,
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        priceAtPurchase: mess.plans[0].price,
        planNameSnapshot: mess.plans[0].name,
        mealTypeSnapshot: mess.plans[0].mealType,
        status: "active",
      },
    });
    console.log("✅ Created subscription:", subscription.id);
    console.log("   User:", testUser.name);
    console.log("   Plan:", subscription.planNameSnapshot);
    console.log("   Status:", subscription.status, "\n");

    // Test 6: Create attendance
    const attendance = await prisma.attendance.create({
      data: {
        subscriptionId: subscription.id,
        date: new Date(),
        breakfast: true,
        lunch: true,
        dinner: false,
      },
    });
    console.log("✅ Created attendance record for today");
    console.log("   Breakfast:", attendance.breakfast);
    console.log("   Lunch:", attendance.lunch);
    console.log("   Dinner:", attendance.dinner, "\n");

    // Test 7: Query with relations
    const userWithData = await prisma.user.findUnique({
      where: { id: testUser.id },
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
    console.log("✅ Queried user with relations:");
    console.log("   Name:", userWithData.name);
    console.log("   Subscriptions:", userWithData.subscriptions.length);
    if (userWithData.subscriptions[0]) {
      const sub = userWithData.subscriptions[0];
      console.log("   - Mess:", sub.plan.mess.name);
      console.log("   - Attendance records:", sub.attendance.length);
    }
    console.log();

    console.log(
      "🎉 All tests passed! Your Prisma setup is working perfectly.\n",
    );
    console.log(
      "📊 Open Prisma Studio to view the data: http://localhost:5555",
    );
    console.log("🧹 To clean up test data, run: npx prisma migrate reset\n");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("\nFull error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
