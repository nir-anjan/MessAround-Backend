const attendanceService = require("../services/attendance.service");

/**
 * Attendance Controller
 */
class AttendanceController {
  /**
   * Mark attendance
   * POST /api/subscriptions/:id/attendance
   */
  async markAttendance(req, res, next) {
    try {
      const attendance = await attendanceService.markAttendance(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.status(201).json({
        success: true,
        message: "Attendance marked successfully",
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get attendance
   * GET /api/subscriptions/:id/attendance
   */
  async getAttendance(req, res, next) {
    try {
      const result = await attendanceService.getAttendance(
        req.params.id,
        req.user.id,
        req.query,
      );
      res.json({
        success: true,
        data: result.attendance,
        stats: result.stats,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AttendanceController();
