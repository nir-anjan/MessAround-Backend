const express = require("express");
const { body } = require("express-validator");
const messController = require("../controllers/mess.controller");
const auth = require("../middleware/auth");
const roleCheck = require("../middleware/roleCheck");

const router = express.Router();

/**
 * @route   POST /api/messes
 * @desc    Create a new mess
 * @access  Private (mess_owner only)
 */
router.post(
  "/",
  auth,
  roleCheck("mess_owner"),
  [
    body("name").trim().notEmpty().withMessage("Mess name is required"),
    body("location").trim().notEmpty().withMessage("Location is required"),
    body("description").optional().trim(),
    body("vegAvailable").optional().isBoolean(),
    body("nonvegAvailable").optional().isBoolean(),
  ],
  messController.createMess,
);

/**
 * @route   GET /api/messes
 * @desc    Get all active messes
 * @access  Public
 */
router.get("/", messController.getAllMesses);

/**
 * @route   GET /api/messes/my
 * @desc    Get messes owned by current user
 * @access  Private (mess_owner only)
 */
router.get("/my", auth, roleCheck("mess_owner"), messController.getMyMesses);

/**
 * @route   GET /api/messes/:id
 * @desc    Get mess by ID
 * @access  Public
 */
router.get("/:id", messController.getMessById);

/**
 * @route   PUT /api/messes/:id
 * @desc    Update mess
 * @access  Private (mess_owner only - own mess)
 */
router.put(
  "/:id",
  auth,
  roleCheck("mess_owner"),
  [
    body("name").optional().trim().notEmpty(),
    body("location").optional().trim().notEmpty(),
    body("description").optional().trim(),
    body("vegAvailable").optional().isBoolean(),
    body("nonvegAvailable").optional().isBoolean(),
    body("isActive").optional().isBoolean(),
  ],
  messController.updateMess,
);

module.exports = router;
