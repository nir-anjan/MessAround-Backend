const prisma = require("../db/prisma");
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
  ConflictError,
} = require("../utils/errors");

/**
 * Subscription Service - Business logic for subscription management
 */
class SubscriptionService {
  /**
   * Create a new subscription
   * @param {string} userId - User ID
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(userId, subscriptionData) {
    const { planId, startDate } = subscriptionData;

    if (!planId || !startDate) {
      throw new ValidationError("Plan ID and start date are required");
    }

    // Get plan details
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { mess: true },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundError("Plan not found or inactive");
    }

    // Check if user already has an active subscription to this plan
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        planId,
        status: "active",
      },
    });

    if (existingSubscription) {
      throw new ConflictError(
        "You already have an active subscription to this plan",
      );
    }

    // Auto-calculate end date based on duration type
    const start = new Date(startDate);
    const endDate = new Date(start);

    if (plan.durationType === "weekly") {
      endDate.setDate(endDate.getDate() + 7);
    } else if (plan.durationType === "monthly") {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    // Create subscription with snapshot data
    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId,
        startDate: start,
        endDate,
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

    return subscription;
  }

  /**
   * Get user's subscriptions
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of subscriptions
   */
  async getMySubscriptions(userId) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
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
      orderBy: { createdAt: "desc" },
    });

    return subscriptions;
  }

  /**
   * Cancel a subscription
   * @param {string} subscriptionId - Subscription ID
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Updated subscription
   */
  async cancelSubscription(subscriptionId, userId) {
    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundError("Subscription not found");
    }

    // Check if user owns this subscription
    if (subscription.userId !== userId) {
      throw new ForbiddenError(
        "You are not authorized to cancel this subscription",
      );
    }

    // Check if already cancelled
    if (subscription.status === "cancelled") {
      throw new ValidationError("Subscription is already cancelled");
    }

    // Update subscription status
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: { status: "cancelled" },
      include: {
        plan: {
          include: {
            mess: true,
          },
        },
      },
    });

    return updatedSubscription;
  }
}

module.exports = new SubscriptionService();
