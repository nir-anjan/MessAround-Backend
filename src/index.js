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

// Morgan HTTP request logger
const morganFormat =
  process.env.NODE_ENV === "production"
    ? "combined"
    : ":method :url :status :res[content-length] - :response-time ms";

app.use(morgan(morganFormat, { stream: logger.stream }));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const startTime = Date.now();

  // Log request
  logger.info(`→ ${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get("user-agent"),
    userId: req.user?.id || "anonymous",
  });

  // Log response
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel](
      `← ${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
      {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        userId: req.user?.id || "anonymous",
      },
    );
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
    logger.error("Database health check failed", { error: error.message });
    res.status(500).json({
      status: "error",
      message: error.message,
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
