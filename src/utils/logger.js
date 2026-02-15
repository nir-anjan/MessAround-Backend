const winston = require("winston");
const path = require("path");

// Define human-readable log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    // Format level with fixed width for alignment
    const levelPadded = level.toUpperCase().padEnd(7);
    let log = `${timestamp} ${levelPadded} | ${message}`;

    // Add metadata in a readable format
    if (Object.keys(meta).length > 0) {
      const metaEntries = [];
      
      // Format common fields nicely
      if (meta.method) metaEntries.push(`method=${meta.method}`);
      if (meta.statusCode) metaEntries.push(`status=${meta.statusCode}`);
      if (meta.duration) metaEntries.push(`time=${meta.duration}`);
      if (meta.userId && meta.userId !== 'anonymous') {
        // Show shortened UUID
        const shortId = meta.userId.substring(0, 8);
        metaEntries.push(`user=${shortId}...`);
      }
      if (meta.ip) metaEntries.push(`ip=${meta.ip}`);
      
      // Add any remaining metadata
      const displayedKeys = ['method', 'statusCode', 'duration', 'userId', 'ip', 'url', 'userAgent'];
      Object.keys(meta).forEach(key => {
        if (!displayedKeys.includes(key)) {
          metaEntries.push(`${key}=${JSON.stringify(meta[key])}`);
        }
      });

      if (metaEntries.length > 0) {
        log += ` [${metaEntries.join(', ')}]`;
      }
    }

    // Add stack trace for errors
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  }),
);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../../logs");

// Create Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [
    // Console transport (colored for development)
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logFormat),
    }),

    // File transport for all logs
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Separate file for errors
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Create a stream for Morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
