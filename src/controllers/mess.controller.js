const messService = require("../services/mess.service");

/**
 * Mess Controller
 */
class MessController {
  /**
   * Create new mess
   * POST /api/messes
   */
  async createMess(req, res, next) {
    try {
      const mess = await messService.createMess(req.user.id, req.body);
      res.status(201).json({
        success: true,
        message: "Mess created successfully",
        data: mess,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all messes
   * GET /api/messes
   */
  async getAllMesses(req, res, next) {
    try {
      const messes = await messService.getAllMesses();
      res.json({
        success: true,
        data: messes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get mess by ID
   * GET /api/messes/:id
   */
  async getMessById(req, res, next) {
    try {
      const mess = await messService.getMessById(req.params.id);
      res.json({
        success: true,
        data: mess,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my messes (mess owner only)
   * GET /api/messes/my
   */
  async getMyMesses(req, res, next) {
    try {
      const messes = await messService.getMyMesses(req.user.id);
      res.json({
        success: true,
        data: messes,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update mess
   * PUT /api/messes/:id
   */
  async updateMess(req, res, next) {
    try {
      const mess = await messService.updateMess(
        req.params.id,
        req.user.id,
        req.body,
      );
      res.json({
        success: true,
        message: "Mess updated successfully",
        data: mess,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MessController();
