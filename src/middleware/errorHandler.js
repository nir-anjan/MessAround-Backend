const { AppError } = require("../utils/errors");

/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = 500;
  let message = "Internal server error";
  let errors = null;

  // Handle operational errors (AppError and its subclasses)
  if (err.isOperational) {
    statusCode = err.statusCode;
    message = err.message;
  }
  // Handle Prisma errors
  else if (err.code) {
    switch (err.code) {
      case "P2002": // Unique constraint violation
        statusCode = 409;
        message = `Duplicate value for ${err.meta?.target?.join(", ") || "field"}`;
        break;
      case "P2025": // Record not found
        statusCode = 404;
        message = "Record not found";
        break;
      case "P2003": // Foreign key constraint violation
        statusCode = 400;
        message = "Related record not found";
        break;
      default:
        message = "Database error occurred";
    }
  }
  // Handle validation errors from express-validator
  else if (err.array && typeof err.array === "function") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.array();
  }
  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Log error in development
  if (process.env.NODE_ENV === "development") {
    console.error("Error:", err);
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
