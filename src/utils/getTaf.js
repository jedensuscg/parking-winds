const parseString = require("xml2js");
const calcTafData = require("./calcWindData");
const getTemp = require("./getTemp")
const parser = new parseString.Parser({ explicitArray: false });
const axios = require("axios").default;

const { DateTime } = require("luxon");
const url = ''

const getTaf = (options) => {
  const url =
  `https://www.aviationweather.gov/adds/dataserver_current/httpparam?dataSource=tafs&requestType=retrieve&format=xml&hoursBeforeNow=24&timeType=issue&mostRecent=true&stationString=${options.dataSource}`;
  return new Promise((resolve, reject) => {
    if (!options.test) { //Check if using TEST DATA
      axios
        .get(url)
        .then((response) => {
          
          const tafData = buildTafObject(response, options.location);
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

const buildTafObject = async (response, location) => {
  let lowestTemp;
  let timeData;
  let rawText;
  lowestTemp = await getTemp(location)
  // Check if using online source or local xml test file.
  const xmlToParse = (() => {

    if (!response.data) {
      return response;
    } else {
      return response.data;
    }
  })();

  parser.parseString(xmlToParse, (err, result) => {
    if (err) {
      return "parse error", err;
    }
    const baseData = result.response.data.TAF;

    //object relating to TAF times
    timeData = {
      issueTime: baseData.issue_time,
      validTimeFrom: baseData.valid_time_from,
      validTimeTo: baseData.valid_time_to,
    };
    rawText = baseData.raw_text;
    rawTafData = createTafArrays(baseData.forecast);
    winds = calcTafData.getCalculatedTafData(rawTafData);

  });
  return {
    timeData,
    rawText,
    winds,
    rawTafData,
    lowestTemp
  };
};

// Create an array for each forecast period.
createTafArrays = (forecastData) => {
  console.log(forecastData)
  let durationOfForecast;
  let tafForecasts = [];
  
  if (!Array.isArray(forecastData)) {
    forecastData = [forecastData]
  } 
  forecastData.forEach((forecast) => {
    timeFrom = forecast.fcst_time_from;
    timeTo = forecast.fcst_time_to;
    windDirection = forecast.wind_dir_degrees ? forecast.wind_dir_degrees : 0;
    windSpeed = forecast.wind_speed_kt ? forecast.wind_speed_kt : 0;
    windGust = forecast.wind_gust_kt ? forecast.wind_gust_kt : 0;
    windGustDir = forecast.wind_gust_kt ? forecast.wind_dir_degrees : 0;

    //determine amount of time taf forecast lasted
    if (timeFrom && timeTo) {
      durationOfForecast = calcForecastDuration(timeFrom, timeTo);
    } else {
      durationOfForecast = 0;
    }

    tafForecasts.push({
      timeFrom,
      timeTo,
      windDirection: parseInt(windDirection),
      windSpeed: parseInt(windSpeed),
      windGust: parseInt(windGust),
      windGustDir: parseInt(windGustDir),
      durationOfForecast,
    });
  });

  return {
    tafForecasts,
  };
};

calcForecastDuration = (timeFrom, timeTo) => {
  const fromDT = DateTime.fromISO(timeFrom);
  const toDT = DateTime.fromISO(timeTo);
  const diff = toDT.diff(fromDT, "minutes");
  return (durationOfForecast = diff.toObject().minutes);
};

module.exports = getTaf;
