const parseString = require("xml2js");
const parser = new parseString.Parser({ explicitArray: false });
const axios = require("axios").default;
const fs = require('fs')
const {DateTime} = require('luxon')
const url =
  "https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&hoursBeforeNow=12&timeType=issue&mostRecent=true&stationString=kecg";

const getTaf = (options = { test: false, dataSource: url }) => {
  return new Promise((resolve, reject) => {
    if (!options.test) {
      axios
        .get(url)
        .then((response) => {
          const tafData = buildTafObject(response);

          resolve(tafData);
        })
        .catch((error) => {
          reject("error: " + error);
        });
    } else {
      const tafData = buildTafObject(options.dataSource);
      resolve(tafData);
    }
  });
};

buildTafObject = (response) => {
  
  // Check if using online source or local xml test file.
  const xmlToParse = (() => {
    if (!response.data) {
      return response;
    } else {
      return response.data;
    }
  })();


  let timeData;
  parser.parseString(xmlToParse, (err, result) => {
    if (err) {
      return "parse error", err;
    }
    baseData = result.response.data.TAF;
        //DEBUG
        fs.writeFile("./devOps/json-output.json", JSON.stringify(baseData), (err) => {
          if(err) {
            console.log('Failed to write json file', err)
          }
        })
    //object relating to TAF times
    timeData = {
      issueTime: baseData.issue_time,
      validTimeFrom: baseData.valid_time_from,
      validTimeTo: baseData.valid_time_to,
    };

    uncalibratedForecastData = createForecastArrays(baseData.forecast)
    calcPredominateWinds(uncalibratedForecastData)
    


  });
  return {
    timeData,
    uncalibratedForecastData
  };
};


createForecastArrays = (forecastData) => {
  let durationOfForecast
  let forecastArray = []
    forecastData.forEach(forecast => {
      timeFrom = forecast.fcst_time_from
      timeTo = forecast.fcst_time_to
      windDirection = forecast.wind_dir_degrees ? forecast.wind_dir_degrees : 0
      windSpeed = forecast.wind_speed_kt ? forecast.wind_speed_kt : 0

      //determine amount of time taf forecast lasted
      if(timeFrom && timeTo) {
        durationOfForecast = calcForecastDuration(timeFrom,timeTo)
      } else {
        durationOfForecast = 0
      }

      forecastArray.push({
        timeFrom,
        timeTo,
        windDirection: parseInt(windDirection),
        windSpeed: parseInt(windSpeed),
        durationOfForecast
      })
  });

  return {
    forecastArray
  }

}

calcForecastDuration = (timeFrom, timeTo) => {
  const fromDT = DateTime.fromISO(timeFrom)
  const toDT = DateTime.fromISO(timeTo)
  const diff = toDT.diff(fromDT, 'minutes')
  return durationOfForecast = diff.toObject().minutes
}

calcPredominateWinds = (uncalibratedForecastData) => {
  let windDirections = []
  let windSpeeds = []
  let windTimes = []
  let windMap = new Map()
  let windTimeMap = new Map()
  console.log
  uncalibratedForecastData.forecastArray.forEach(forecast => {


    windDirections.push(forecast.windDirection)
    windSpeeds.push(forecast.windSpeed)
    windTimes.push(forecast.durationOfForecast)
    for (let index = 0; index < windSpeeds.length; index++) {

      if (windMap.has(windDirections[index])) {
        const newTime = windMap.get(windDirections[index]) + windDirections[index]
        windMap.set(windDirections[index], newTime)
      } else {
        windMap.set(windDirections[index], windTimes[index])
      }
      //Try setting directly by adding. 
     
      
    }
  });
  console.log(windDirections)
  // console.log(windSpeeds)
  console.log(windMap)
}

module.exports = getTaf;
