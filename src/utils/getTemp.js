const { DateTime } = require("luxon");
const axios = require("axios").default;
require("dotenv").config();
dateAndTime = require("./dateAndTime");
const queryString = require("query-string");
const getTimelineURL = "https://api.tomorrow.io/v4/timelines";
const apikey = process.env.CLIMACELL_KEY;
const logger = require('./logger')

let location

const fields = ["temperature"];
const units = "imperial";


async function getTemp(latLong) {
  location = latLong
  getTimelineParameters = getQueryString();
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV == "production") {
      axios
        .get(getTimelineURL + "?" + getTimelineParameters)
        .then((result) => {
          const data = result.data.data;
          lowestTemp = getMinTemp(data.timelines[0].intervals);
          resolve(lowestTemp);
        })
        .catch((error) => {
          console.log(getTimelineURL + "?" + getTimelineParameters)
          logger.error(error.response.data)
          resolve(["error", 99]);
        });
    } else {
      const fs = require("fs");
      const climacellTestData = fs.readFileSync("./devOps/tempData.json", "utf8");
      const jsonData = JSON.parse(climacellTestData);
      const tempData = jsonData.data.timelines[0].intervals;
      lowestTemp = getMinTemp(tempData);
      resolve(lowestTemp);
    }
  });
}

function getQueryString() {
  const now = DateTime.utc();
  const startTime = now.toISO();
  const endTime = now.plus({ hours: 12 });
  const getTimelineParameters = queryString.stringify(
    {
      apikey,
      location,
      fields,
      units,
      startTime,
      endTime,
    },
    { arrayFormat: "comma" }
  );

  return getTimelineParameters
}

function getMinTemp(data) {
  try {
    map = mapTimeAndTemp(data);
    const lowestTemp = [...map.entries()].reduce((total, next) => (next[1] < total[1] ? next : total));
    return lowestTemp;
  } catch (error) {
    logger.error(error.stack)
  }

}

function mapTimeAndTemp(data) {
  let timeAndTempMap = new Map();
  data.forEach((hour) => {
    timeAndTempMap.set(dateAndTime.stripDate(Object.values(hour)[0]), Object.values(hour)[1].temperature);
  });
  return timeAndTempMap;
}

module.exports = getTemp;
