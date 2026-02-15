const express = require("express");
const dashboardController = require("../controllers/dashboard.controller");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router({ mergeParams: true });

/**
 * @route   GET /api/messes/:messId/today-summary
 * @desc    Get today's attendance summary for a mess
 * @access  Private (mess_owner only - own mess)
 */
router.get(
  "/",
  auth,
  roleCheck("mess_owner"),
  dashboardController.getTodaySummary,
);

module.exports = router;
