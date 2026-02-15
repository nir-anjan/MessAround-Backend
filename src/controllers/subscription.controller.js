const subscriptionService = require("../services/subscription.service");

/**
 * Subscription Controller
 */
class SubscriptionController {
  /**
   * Create new subscription
   * POST /api/subscriptions
   */
  async createSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.createSubscription(
        req.user.id,
        req.body,
      );
      res.status(201).json({
        success: true,
        message: "Subscription created successfully",
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my subscriptions
   * GET /api/subscriptions/my
   */
  async getMySubscriptions(req, res, next) {
    try {
      const subscriptions = await subscriptionService.getMySubscriptions(
        req.user.id,
      );
      res.json({
        success: true,
        data: subscriptions,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel subscription
   * PATCH /api/subscriptions/:id/cancel
   */
  async cancelSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.cancelSubscription(
        req.params.id,
        req.user.id,
      );
      res.json({
        success: true,
        message: "Subscription cancelled successfully",
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new SubscriptionController();
