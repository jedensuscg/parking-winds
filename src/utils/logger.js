const { createLogger, format,transports} = require("winston");
const {combine,timestamp,cli,json,label,printf} = format;
//require("dotenv").config();

const logFormat = combine(
  timestamp(),
  printf((info) => {
    return `${JSON.stringify({ timestamp: info.timestamp, level: info.level, message: info.message })}`;
  }),
);

const errorFormat = combine(
  timestamp(),
  printf((info) => {
    return `${JSON.stringify({ timestamp: info.timestamp, level: info.level, message: info.message })}`;
  }),
);

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
  level: "info",
  defaultMeta: {
    name: "Parking Winds",
  },
  transports: [
    new transports.File({
      filename: "error.log",
      level: "error",
      format: combine(
        format.errors({
          stack: true
        }),
        logFormat
      ),
    }),
    new transports.File({
      filename: "combined.log",
      format: logFormat,
    }),
  ],
  // exceptionHandlers: [
  //   new transports.File({
  //     filename: "exceptions.log",
  //   })
  // ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: cliFormat,

    })
  );
}

module.exports = logger;