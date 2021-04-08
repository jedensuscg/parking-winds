const { DateTime } = require("luxon");
require("dotenv").config();
dateAndTime = require("./dateAndTime")
const queryString = require('query-string')
const getTimelineURL = "https://api.tomorrow.io/v4/timelines"
//const apikey = "BgSBfAeutuezgsZbcXm0FeVGcLxJcgpr"
const location = "606e5216b7193e0008efd880"
const fields = ["temperature"]
const units = "imperial"
const now = DateTime.utc()
const startTime = now.toISO()
const endTime = now.plus( {hours: 12})
const getTimelineParameters =  queryString.stringify({
  apikey: process.env.CLIMACELL_KEY,
  location,
  fields,
  units,
  startTime,
  endTime,
}, {arrayFormat: "comma"});
const axios = require("axios").default;


function getTemp() {
  if (process.env.NODE_ENV == "production") {
    axios.get(getTimelineURL + "?" + getTimelineParameters)
  .then(result => result.data.data)
  .then(data => console.log(data.timelines[0].intervals))
  } else {
    const fs = require("fs");
    const climacellTestData = fs.readFileSync("./devOps/tempData.json", "utf8");
    const jsonData = JSON.parse(climacellTestData)
    const tempData = jsonData.data.timelines[0].intervals
    return getMinTemp(tempData)
  }
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