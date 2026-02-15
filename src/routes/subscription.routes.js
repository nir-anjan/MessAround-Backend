const express = require("express");
const { body } = require("express-validator");
const subscriptionController = require("../controllers/subscription.controller");
const auth = require("../middleware/auth");

const router = express.Router();

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private
 */
router.post(
  "/",
  auth,
  [
    body("planId").notEmpty().withMessage("Plan ID is required"),
    body("startDate").isISO8601().withMessage("Valid start date is required"),
  ],
  subscriptionController.createSubscription,
);

/**
 * @route   GET /api/subscriptions/my
 * @desc    Get my subscriptions
 * @access  Private
 */
router.get("/my", auth, subscriptionController.getMySubscriptions);

/**
 * @route   PATCH /api/subscriptions/:id/cancel
 * @desc    Cancel a subscription
 * @access  Private
 */
router.patch("/:id/cancel", auth, subscriptionController.cancelSubscription);

module.exports = router;
