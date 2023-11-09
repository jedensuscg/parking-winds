const parseString = require("xml2js");
const parser = new parseString.Parser({ explicitArray: false });
const axios = require("axios").default;
const logger = require("./logger");

const { DateTime } = require("luxon");
const url = ''

const getMetar = async (options) => {
  const url = 'https://aviationweather.gov/api/data/dataserver?requestType=retrieve&dataSource=metars&stationString=${options.dataSource}&hoursBeforeNow=12&format=xml&mostRecent=true&fields=raw_text,observation_time,temp_c,wind_dir_degrees,wind_speed_kt,wind_gust_kt'
  const urloring =
  `https://aviationweather.gov/adds/dataserver_current/httpparam?dataSource=metars&requestType=retrieve&format=xml&stationString=${options.dataSource}&hoursBeforeNow=12&mostRecent=true&fields=raw_text,observation_time,temp_c,wind_dir_degrees,wind_speed_kt,wind_gust_kt`;
  return new Promise((resolve, reject) => {
    if (!options.test) { //Check if using TEST DATA
      axios
        .get(url)
        .then((response) => {
          const metarData = buildMetarObject(response, options.location);
          resolve(metarData);
        })
        .catch((error) => {
          logger.error(error.stack)
          reject("error: " + error);
        });
    } else {
      const metarData = buildMetarObject(options.dataSource);
      resolve(metarData);
    }
  });
};

const buildMetarObject = async (response, location) => {
  let timeData;
  let rawText;

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


    const baseData = result.response.data
    //object relating to TAF times
    timeData = {
      issueTime: baseData.issue_time,
      validTimeFrom: baseData.valid_time_from,
      validTimeTo: baseData.valid_time_to,
    };
    rawMetarText = baseData.METAR.raw_text
    windSpeed = baseData.METAR.wind_gust_kt
    windDirection = baseData.METAR.wind_dir_degrees
    
    rawMetarData = createMetarArrays(baseData.METAR);


  });
  return {
    //timeData,
    rawMetarText,
    //winds,
    rawMetarData,
    //lowestTemp
  };
};

// Create an array for each forecast period.
createMetarArrays = (forecast) => {
  let metarForecast = [];
  
    try {
      observationTime = forecast.observation_time;
      windDirection = forecast.wind_dir_degrees ? (forecast.wind_dir_degrees == '0'? 'Variable': forecast.wind_dir_degrees) : 0;
      windSpeed = forecast.wind_speed_kt ? forecast.wind_speed_kt : 0;
      windGust = forecast.wind_gust_kt ? forecast.wind_gust_kt : 0;
      windGustDir = forecast.wind_dir_degrees ? (forecast.wind_dir_degrees == '0'? 'Variable': forecast.wind_dir_degrees) : 0;
  
      metarForecast.push({
        observationTime,
        windDirection: windDirection == 'Variable'? 'Variable': parseInt(windDirection),
        windSpeed: parseInt(windSpeed),
        windGust: parseInt(windGust),
        windGustDir: windGustDir == 'Variable'? 'Variable': parseInt(windGustDir),
      });
    } catch (error) {
      logger.error(error.stack)
    }



  return {
    metarForecast,
  };
};

calcForecastDuration = (timeFrom, timeTo) => {
  const fromDT = DateTime.fromISO(timeFrom);
  const toDT = DateTime.fromISO(timeTo);
  const diff = toDT.diff(fromDT, "minutes");
  return (durationOfForecast = diff.toObject().minutes);
};

module.exports = getMetar;
