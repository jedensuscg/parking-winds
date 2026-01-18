const { createLogger, format, transports } = require("winston");
const { combine, timestamp, cli, json, printf } = format;
// require("dotenv").config();

// 1. Define Custom Levels
const logLevels = {
  error: 0,
  warn: 1,
  request: 2,
  info: 3,
  http: 4,
  verbose: 5,
  debug: 6,
  silly: 7
};

// 2. Define Formats
const logFormat = printf(({ timestamp, level, message, label }) => {
  return `${timestamp} [${label || 'App'}] ${level}: ${message}`;
});

const cliFormat = combine(
  format.errors({ stack: true }),
  cli({
    colors: {
      error: "red",
      warn: "yellow",
      request: "magenta",
      info: "blue",
    },
  })
);

// 3. Create the Main Logger (Production Defaults)
const logger = createLogger({
  levels: logLevels,
  defaultMeta: { name: "Parking Winds" },
  format: combine(timestamp(), format.json()), // Default format for files
  transports: [
    // Production: Error Log (Level 0 only)
    new transports.File({
      filename: "error.log",
      level: "error",
    }),
    // Production: Requests (Level 2, 1, 0)
    new transports.File({
      filename: "requests.log",
      level: "request",
    }),
    // Production: Info (Level 3, 2, 1, 0)
    new transports.File({
      filename: "info.log",
      level: "info",
    }),
    // Production: Combined (Everything)
    new transports.File({
      filename: "combined.log",
    }),
  ],
});

// 4. Local Development Override
if (process.env.NODE_ENV !== "production") {
  // Clear default production transports
  logger.clear();

  // Add Local Transports ONE BY ONE (Chained)
  logger
    .add(
      new transports.File({
        filename: "error.log",
        level: "error", // Only catches errors
        format: format.json(),
      })
    )
    .add(
      new transports.File({
        filename: "info.log",
        level: "info", // Catches Info, Request, Warn, Error
        format: format.json(),
      })
    )
    .add(
      new transports.File({
        filename: "requests.log",
        level: "request", // Catches Request, Warn, Error
        format: format.json(),
      })
    )
    .add(
      new transports.Console({
        level: "info", // Show up to Info in console
        format: cliFormat,
      })
    );
}

module.exports = logger;