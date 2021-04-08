const { DateTime } = require("luxon");


function stripDate(dateTime) {
  dateTimeWithoutZ = dateTime.slice(0, -1)
  dateTimeISO = DateTime.fromISO(dateTime).setZone("UTC")
   return dateTimeISO.toLocaleString(DateTime.TIME_24_SIMPLE)
}

module.exports = {stripDate};