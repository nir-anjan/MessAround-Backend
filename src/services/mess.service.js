const prisma = require("../db/prisma");
const {
  ValidationError,
  NotFoundError,
  ForbiddenError,
} = require("../utils/errors");

/**
 * Mess Service - Business logic for mess management
 */
class MessService {
  /**
   * Create a new mess
   * @param {string} ownerId - User ID of mess owner
   * @param {Object} messData - Mess data
   * @returns {Promise<Object>} Created mess
   */
  async createMess(ownerId, messData) {
    const { name, description, location, vegAvailable, nonvegAvailable } =
      messData;

    if (!name || !location) {
      throw new ValidationError("Name and location are required");
    }

    const mess = await prisma.mess.create({
      data: {
        ownerId,
        name,
        description,
        location,
        vegAvailable: vegAvailable ?? false,
        nonvegAvailable: nonvegAvailable ?? false,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    return mess;
  }

  /**
   * Get all active messes
   * @returns {Promise<Array>} List of messes
   */
  async getAllMesses() {
    const messes = await prisma.mess.findMany({
      where: { isActive: true },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        plans: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return messes;
  }

  /**
   * Get mess by ID
   * @param {string} messId - Mess ID
   * @returns {Promise<Object>} Mess details
   */
  async getMessById(messId) {
    const mess = await prisma.mess.findUnique({
      where: { id: messId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        plans: {
          where: { isActive: true },
        },
      },
    });

    if (!mess) {
      throw new NotFoundError("Mess not found");
    }

    return mess;
  }

  /**
   * Get messes owned by a user
   * @param {string} ownerId - Owner user ID
   * @returns {Promise<Array>} List of owned messes
   */
  async getMyMesses(ownerId) {
    const messes = await prisma.mess.findMany({
      where: { ownerId },
      include: {
        plans: {
          where: { isActive: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return messes;
  }

  /**
   * Update mess
   * @param {string} messId - Mess ID
   * @param {string} ownerId - Owner user ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated mess
   */
  async updateMess(messId, ownerId, updateData) {
    // Check if mess exists and user is the owner
    const mess = await prisma.mess.findUnique({
      where: { id: messId },
    });

    if (!mess) {
      throw new NotFoundError("Mess not found");
    }

    if (mess.ownerId !== ownerId) {
      throw new ForbiddenError("You are not authorized to update this mess");
    }

    const updatedMess = await prisma.mess.update({
      where: { id: messId },
      data: updateData,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        plans: {
          where: { isActive: true },
        },
      },
    });

    return updatedMess;
  }
}

module.exports = new MessService();
