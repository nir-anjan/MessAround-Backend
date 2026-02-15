const prisma = require("../db/prisma");
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

/**
 * Plan Service - Business logic for plan management
 */
class PlanService {
  /**
   * Create a new plan for a mess
   * @param {string} messId - Mess ID
   * @param {string} ownerId - Owner user ID
   * @param {Object} planData - Plan data
   * @returns {Promise<Object>} Created plan
   */
  async createPlan(messId, ownerId, planData) {
    const { name, price, durationType, mealType, mealsPerDay } = planData;

    // Validate required fields
    if (!name || !price || !durationType || !mealType || !mealsPerDay) {
      throw new ValidationError(
        "Name, price, durationType, mealType, and mealsPerDay are required",
      );
    }

    // Check if mess exists and user is the owner
    const mess = await prisma.mess.findUnique({
      where: { id: messId },
    });

    if (!mess) {
      throw new NotFoundError("Mess not found");
    }

    if (mess.ownerId !== ownerId) {
      throw new ForbiddenError(
        "You are not authorized to create plans for this mess",
      );
    }

    // Validate durationType
    if (!["weekly", "monthly"].includes(durationType)) {
      throw new ValidationError("Duration type must be 'weekly' or 'monthly'");
    }

    // Validate mealType
    if (!["veg", "nonveg"].includes(mealType)) {
      throw new ValidationError("Meal type must be 'veg' or 'nonveg'");
    }

    // Validate mealsPerDay
    if (mealsPerDay < 1 || mealsPerDay > 3) {
      throw new ValidationError("Meals per day must be between 1 and 3");
    }

    const plan = await prisma.plan.create({
      data: {
        messId,
        name,
        price: parseFloat(price),
        durationType,
        mealType,
        mealsPerDay: parseInt(mealsPerDay),
      },
      include: {
        mess: {
          select: {
            id: true,
            name: true,
            location: true,
          },
        },
      },
    });

    return plan;
  }

  /**
   * Get all plans for a mess
   * @param {string} messId - Mess ID
   * @returns {Promise<Array>} List of plans
   */
  async getPlansByMess(messId) {
    // Check if mess exists
    const mess = await prisma.mess.findUnique({
      where: { id: messId },
    });

    if (!mess) {
      throw new NotFoundError("Mess not found");
    }

    const plans = await prisma.plan.findMany({
      where: {
        messId,
        isActive: true,
      },
      orderBy: { price: "asc" },
    });

    return plans;
  }
}

module.exports = new PlanService();
