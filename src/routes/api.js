const express = require("express");
const prisma = require("../db/prisma");

const router = express.Router();

// Get all messes with their plans
router.get("/messes", async (req, res) => {
  try {
    const messes = await prisma.mess.findMany({
      where: { isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        plans: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: messes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get a single mess by ID
router.get("/messes/:id", async (req, res) => {
  try {
    const mess = await prisma.mess.findUnique({
      where: { id: req.params.id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        plans: true,
      },
    });

    if (!mess) {
      return res.status(404).json({ success: false, error: "Mess not found" });
    }

    res.json({ success: true, data: mess });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all active subscriptions for a user
router.get("/users/:userId/subscriptions", async (req, res) => {
  try {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: req.params.userId,
        status: "active",
      },
      include: {
        plan: {
          include: {
            mess: true,
          },
        },
        attendance: {
          orderBy: { date: "desc" },
          take: 30, // Last 30 days
        },
      },
    });
    res.json({ success: true, data: subscriptions });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Create a new subscription
router.post("/subscriptions", async (req, res) => {
  try {
    const { userId, planId, startDate, endDate } = req.body;

    // Get plan details for snapshot
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { mess: true },
    });

    if (!plan || !plan.isActive) {
      return res
        .status(404)
        .json({ success: false, error: "Plan not found or inactive" });
    }

    // Create subscription with snapshot data
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        priceAtPurchase: plan.price,
        planNameSnapshot: plan.name,
        mealTypeSnapshot: plan.mealType,
        status: "active",
      },
      include: {
        plan: {
          include: {
            mess: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark attendance for today
router.post("/attendance", async (req, res) => {
  try {
    const { subscriptionId, breakfast, lunch, dinner } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await prisma.attendance.upsert({
      where: {
        subscriptionId_date: {
          subscriptionId,
          date: today,
        },
      },
      update: {
        breakfast: breakfast ?? undefined,
        lunch: lunch ?? undefined,
        dinner: dinner ?? undefined,
      },
      create: {
        subscriptionId,
        date: today,
        breakfast: breakfast ?? false,
        lunch: lunch ?? false,
        dinner: dinner ?? false,
      },
    });

    res.json({ success: true, data: attendance });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get attendance report for a subscription
router.get("/subscriptions/:subscriptionId/attendance", async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { startDate, endDate } = req.query;

    const where = {
      subscriptionId,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const attendance = await prisma.attendance.findMany({
      where,
      orderBy: { date: "desc" },
    });

    // Calculate statistics
    const stats = {
      totalDays: attendance.length,
      breakfastCount: attendance.filter((a) => a.breakfast).length,
      lunchCount: attendance.filter((a) => a.lunch).length,
      dinnerCount: attendance.filter((a) => a.dinner).length,
    };

    res.json({ success: true, data: attendance, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
