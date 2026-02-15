const express = require("express");
const cors = require("cors");
require("dotenv").config();
const db = require("./db/connection");
const apiRoutes = require("./routes/api");

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
app.use("/api", apiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

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
