const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db/connection");
const errorHandler = require("./middleware/errorHandler");

// Import route modules
const authRoutes = require("./routes/auth.routes");
const messRoutes = require("./routes/mess.routes");
const planRoutes = require("./routes/plan.routes");
const subscriptionRoutes = require("./routes/subscription.routes");
const attendanceRoutes = require("./routes/attendance.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
      console.error(
        "⚠️  Failed to connect to database. Server will start but database operations will fail.",
      );
    }

    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 DB health check: http://localhost:${PORT}/health/db`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
