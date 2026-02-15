const dashboardService = require("../services/dashboard.service");

/**
 * Dashboard Controller
 */
class DashboardController {
  /**
   * Get today's attendance summary
   * GET /api/messes/:messId/today-summary
   */
  async getTodaySummary(req, res, next) {
    try {
      const summary = await dashboardService.getTodaySummary(
        req.params.messId,
        req.user.id,
      );
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
