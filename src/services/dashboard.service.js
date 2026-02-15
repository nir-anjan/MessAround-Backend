const prisma = require("../db/prisma");
const { NotFoundError, ForbiddenError } = require("../utils/errors");

/**
 * Dashboard Service - Business logic for owner dashboard
 */
class DashboardService {
  /**
   * Get today's attendance summary for a mess
   * @param {string} messId - Mess ID
   * @param {string} ownerId - Owner user ID
   * @returns {Promise<Object>} Attendance summary
   */
  async getTodaySummary(messId, ownerId) {
    // Check if mess exists and user is the owner
    const mess = await prisma.mess.findUnique({
      where: { id: messId },
    });

    if (!mess) {
      throw new NotFoundError("Mess not found");
    }

    if (mess.ownerId !== ownerId) {
      throw new ForbiddenError(
        "You are not authorized to view this mess's dashboard",
      );
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all active subscriptions for this mess's plans
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        plan: {
          messId,
        },
        status: "active",
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        attendance: {
          where: {
            date: today,
          },
        },
      },
    });

    // Calculate attendance counts
    let breakfastCount = 0;
    let lunchCount = 0;
    let dinnerCount = 0;

    const attendanceDetails = activeSubscriptions.map((sub) => {
      const todayAttendance = sub.attendance[0] || {
        breakfast: false,
        lunch: false,
        dinner: false,
      };

      if (todayAttendance.breakfast) breakfastCount++;
      if (todayAttendance.lunch) lunchCount++;
      if (todayAttendance.dinner) dinnerCount++;

      return {
        subscriptionId: sub.id,
        user: sub.user,
        plan: {
          id: sub.plan.id,
          name: sub.plan.name,
          mealType: sub.plan.mealType,
        },
        attendance: todayAttendance,
      };
    });

    return {
      date: today,
      mess: {
        id: mess.id,
        name: mess.name,
        location: mess.location,
      },
      summary: {
        totalActiveSubscriptions: activeSubscriptions.length,
        breakfastCount,
        lunchCount,
        dinnerCount,
      },
      details: attendanceDetails,
    };
  }
}

module.exports = new DashboardService();
