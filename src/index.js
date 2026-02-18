const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();
const db = require("./db/connection");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const { displayRoutes } = require("./utils/routeLister");

// Import route modules
const authRoutes = require("./routes/auth.routes");
const messRoutes = require("./routes/mess.routes");
const planRoutes = require("./routes/plan.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Note: Using custom request logging middleware below instead of Morgan
// to avoid duplicate logs and have better control over format

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request/Response logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log response when finished
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logLevel =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    // Format URL (shorten long UUIDs)
    let url = req.originalUrl;
    if (url.length > 60) {
      url = url.replace(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        (match) => match.substring(0, 8) + "...",
      );
    }

    const statusIcon =
      res.statusCode >= 500 ? "✗" : res.statusCode >= 400 ? "⚠" : "✓";
    logger[logLevel](`${statusIcon} ${req.method.padEnd(6)} ${url}`, {
      method: req.method,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id,
    });
  });

  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Database health check endpoint
app.get("/health/db", async (req, res) => {
  try {
    const result = await db.query("SELECT NOW()");
    res.json({
      status: "connected",
      database: process.env.DB_NAME,
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    console.error("FULL DB ERROR:", error);
    logger.error("Database health check failed", { error });
    res.status(500).json({
      status: "error",
      message: error?.message || error?.toString() || "Unknown error",
    });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/messes", messRoutes);
app.use("/api/messes/:messId/plans", planRoutes);
app.use("/api/messes/:messId/today-summary", dashboardRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/subscriptions/:id/attendance", attendanceRoutes);

// 404 handler
app.use((req, res) => {
  logger.warn(`404 Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: "Route not found" });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server and test database connection
const startServer = async () => {
  try {
    // Test database connection
    const isConnected = await db.testConnection();

    if (!isConnected) {
      logger.warn(
        "⚠️  Failed to connect to database. Server will start but database operations will fail.",
      );
    } else {
      logger.info("✅ Database connected successfully");
    }

    app.listen(PORT, () => {
      logger.info(`🚀 Server is running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
      logger.info(`🔗 DB health check: http://localhost:${PORT}/health/db`);
      logger.info(`📁 Logs directory: logs/`);
      logger.info("");

      // Display all available routes
      displayRoutes(app, logger);
    });
  } catch (error) {
    logger.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
