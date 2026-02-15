const express = require("express");
const { body } = require("express-validator");
const planController = require("../controllers/plan.controller");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router({ mergeParams: true });

/**
 * @route   POST /api/messes/:messId/plans
 * @desc    Create a new plan for a mess
 * @access  Private (mess_owner only - own mess)
 */
router.post(
  "/",
  auth,
  roleCheck("mess_owner"),
  [
    body("name").trim().notEmpty().withMessage("Plan name is required"),
    body("price").isFloat({ min: 0 }).withMessage("Valid price is required"),
    body("durationType")
      .isIn(["weekly", "monthly"])
      .withMessage("Duration type must be 'weekly' or 'monthly'"),
    body("mealType")
      .isIn(["veg", "nonveg"])
      .withMessage("Meal type must be 'veg' or 'nonveg'"),
    body("mealsPerDay")
      .isInt({ min: 1, max: 3 })
      .withMessage("Meals per day must be between 1 and 3"),
  ],
  planController.createPlan,
);

/**
 * @route   GET /api/messes/:messId/plans
 * @desc    Get all plans for a mess
 * @access  Public
 */
router.get("/", planController.getPlansByMess);

module.exports = router;
