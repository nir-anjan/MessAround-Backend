const planService = require("../services/plan.service");

/**
 * Plan Controller
 */
class PlanController {
  /**
   * Create new plan
   * POST /api/messes/:messId/plans
   */
  async createPlan(req, res, next) {
    try {
      const plan = await planService.createPlan(
        req.params.messId,
        req.user.id,
        req.body,
      );
      res.status(201).json({
        success: true,
        message: "Plan created successfully",
        data: plan,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get plans for a mess
   * GET /api/messes/:messId/plans
   */
  async getPlansByMess(req, res, next) {
    try {
      const plans = await planService.getPlansByMess(req.params.messId);
      res.json({
        success: true,
        data: plans,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PlanController();
