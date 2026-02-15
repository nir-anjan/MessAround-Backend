const prisma = require("../db/prisma");
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

/**
 * Attendance Service - Business logic for attendance management
 */
class AttendanceService {
  /**
   * Mark attendance for a subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {string} userId - User ID
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Created/updated attendance
   */
  async markAttendance(subscriptionId, userId, attendanceData) {
    const { date, breakfast, lunch, dinner } = attendanceData;

    // Get subscription details
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new NotFoundError("Subscription not found");
    }

    // Check if user owns this subscription
    if (subscription.userId !== userId) {
      throw new ForbiddenError(
        "You are not authorized to mark attendance for this subscription",
      );
    }

    // Check if subscription is active
    if (subscription.status !== "active") {
      throw new ValidationError(
        "Cannot mark attendance for inactive subscription",
      );
    }

    // Parse or use today's date
    const attendanceDate = date ? new Date(date) : new Date();
    attendanceDate.setHours(0, 0, 0, 0);

    // Check if date is within subscription period
    const subStart = new Date(subscription.startDate);
    const subEnd = new Date(subscription.endDate);
    subStart.setHours(0, 0, 0, 0);
    subEnd.setHours(23, 59, 59, 999);

    if (attendanceDate < subStart || attendanceDate > subEnd) {
      throw new ValidationError("Date is outside subscription period");
    }

    // Upsert attendance (one record per day)
    const attendance = await prisma.attendance.upsert({
      where: {
        subscriptionId_date: {
          subscriptionId,
          date: attendanceDate,
        },
      },
      update: {
        breakfast: breakfast !== undefined ? breakfast : undefined,
        lunch: lunch !== undefined ? lunch : undefined,
        dinner: dinner !== undefined ? dinner : undefined,
      },
      create: {
        subscriptionId,
        date: attendanceDate,
        breakfast: breakfast ?? false,
        lunch: lunch ?? false,
        dinner: dinner ?? false,
      },
    });

    return attendance;
  }

  /**
   * Get attendance for a subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {string} userId - User ID
   * @param {Object} filters - Query filters (startDate, endDate)
   * @returns {Promise<Object>} Attendance records with statistics
   */
  async getAttendance(subscriptionId, userId, filters = {}) {
    // Get subscription details
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundError("Subscription not found");
    }

    // Check if user owns this subscription
    if (subscription.userId !== userId) {
      throw new ForbiddenError(
        "You are not authorized to view this attendance",
      );
    }

    const where = { subscriptionId };

    // Apply date filters
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) {
        where.date.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.date.lte = new Date(filters.endDate);
      }
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

    return { attendance, stats };
  }
}

module.exports = new AttendanceService();
