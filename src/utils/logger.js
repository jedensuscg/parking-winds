const { createLogger, format,transports} = require("winston");
const {combine,timestamp,cli,json,label,printf,errors} = format;
//require("dotenv").config();

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

const logFormat = printf(({ timestamp, level, message, label }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});



const cliFormat = combine(
  format.errors({
    stack: true
  }),
  cli({
    colors: {
      info: "blue",
    },
  })
);

const logger = createLogger({
  levels: logLevels,
  format: combine(timestamp(), logFormat),
  defaultMeta: {
    name: "Parking Winds",
  },
  transports: [
    new transports.File({
      filename: "/var/log/parking-winds/testing/error.log",
      level: "error",
      format: format.json()
    }),
    new transports.File({
      filename: "/var/log/parking-winds/testing/log/requests.log",
      level: "request",
      format: format.json()
    }),
    new transports.File({
      filename: "/var/log/parking-winds/testing/log/combined.log",
      format: format.json()
    }),
    new transports.File({
      filename: "combined.log",
      format: format.json()
    }),
    // new transports.Console({
    //   format: format.json()
    // }),
  ],
  // exceptionHandlers: [
  //   new transports.File({
  //     filename: "exceptions.log",
  //   })
  // ],
});

if (process.env.NODE_ENV !== "production") {
  logger.clear().add(
    new transports.File({
      filename: "requests.log",
      level: "request",
      format: combine(timestamp(), logFormat, format.json()),
    }),
    new transports.File({
      filename: "error.log",
      level: "error",
      format: format.json()
    }),
    new transports.File({
      filename: "combined.log",
      format: format.json()
    }),
    new transports.Console({
      format: cliFormat,
    }),
  );
}

module.exports = logger;