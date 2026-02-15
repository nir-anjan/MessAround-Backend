const { ForbiddenError } = require("../utils/errors");

/**
 * Role-based access control middleware
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware
 */
const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ForbiddenError("User not authenticated"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`,
        ),
      );
    }

    next();
  };
};

module.exports = roleCheck;
