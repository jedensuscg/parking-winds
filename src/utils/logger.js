const { createLogger, format, transports } = require('winston');
const { combine, timestamp, cli, json, label, printf } = format;
//require("dotenv").config();

const logFormat = combine(
  timestamp(),
  json()
);

const cliFormat  = combine(
  cli({colors: {info: 'blue'}})
);

const logger = createLogger({
  level: 'info',
  defaultMeta: { 
    name: 'Parking Winds'},
  transports: [
    new transports.File({filename: 'error.log', level: 'error', format: combine(
      logFormat,
      format.errors({stack: true})
    )}),
    new transports.File({filename: 'combined.log',  format: logFormat}),
    // new winston.transports.Console({
    //   format: winston.format.simple(),
    // }),
  ],
  exceptionHandlers: [
    new transports.File({ filename: 'exceptions.log' })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: cliFormat,
  }));
}

module.exports = logger