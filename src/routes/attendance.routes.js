const express = require("express");
const { body, query } = require("express-validator");
const attendanceController = require("../controllers/attendance.controller");
const auth = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

/**
 * @route   POST /api/subscriptions/:id/attendance
 * @desc    Mark attendance for a subscription
 * @access  Private (subscription owner only)
 */
router.post(
  "/",
  auth,
  [
    body("date").optional().isISO8601().withMessage("Valid date is required"),
    body("breakfast").optional().isBoolean(),
    body("lunch").optional().isBoolean(),
    body("dinner").optional().isBoolean(),
  ],
  attendanceController.markAttendance,
);

/**
 * @route   GET /api/subscriptions/:id/attendance
 * @desc    Get attendance records for a subscription
 * @access  Private (subscription owner only)
 */
router.get(
  "/",
  auth,
  [
    query("startDate").optional().isISO8601(),
    query("endDate").optional().isISO8601(),
  ],
  attendanceController.getAttendance,
);

module.exports = router;
