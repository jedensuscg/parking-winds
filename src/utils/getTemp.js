const { DateTime } = require("luxon");
require("dotenv").config();
dateAndTime = require("./dateAndTime")
const queryString = require('query-string')
const getTimelineURL = "https://api.tomorrow.io/v4/timelines"
const apikey = process.env.CLIMACELL_KEY
const location = "606e5216b7193e0008efd880"
const fields = ["temperature"]
const units = "imperial"
const now = DateTime.utc()
const startTime = now.toISO()
const endTime = now.plus( {hours: 12})
const getTimelineParameters =  queryString.stringify({
  apikey,
  location,
  fields,
  units,
  startTime,
  endTime,
}, {arrayFormat: "comma"});
const axios = require("axios").default;
console.log("Fetching Temp")
console.log("Environment", process.env.NODE_ENV)
console.log(apikey)
async function getTemp() {
  console.log("Inside getTemp")
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV == "production") {
      console.log("Inside getTemp Promise")
      axios.get(getTimelineURL + "?" + getTimelineParameters)
    .then(result => result.data.data)
    .then((data) => {
      lowestTemp = getMinTemp(data.timelines[0].intervals)
      resolve(lowestTemp)
    }).catch((error) => {
      resolve(["error", 99])
    })
    } else {
      const fs = require("fs");
      const climacellTestData = fs.readFileSync("./devOps/tempData.json", "utf8");
      const jsonData = JSON.parse(climacellTestData)
      const tempData = jsonData.data.timelines[0].intervals
      lowestTemp = getMinTemp(tempData)
      resolve(lowestTemp)
    }
  })
  
}

function getMinTemp(data) {
  map = mapTimeAndTemp(data)
  const lowestTemp = [...map.entries()].reduce((total, next) => (next[1] < total[1] ? next : total));
  console.log(map)
  return lowestTemp
}

function mapTimeAndTemp(data) {
  let timeAndTempMap = new Map()
  data.forEach(hour => {
    timeAndTempMap.set(dateAndTime.stripDate(Object.values(hour)[0]), Object.values(hour)[1].temperature)
  });
  return timeAndTempMap
}



module.exports = getTemp