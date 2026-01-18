const parseString = require("xml2js");
const parser = new parseString.Parser({ explicitArray: false });
const axios = require("axios").default;
const logger = require("./logger");

const { DateTime } = require("luxon");
const url = ''

const getMetar = async (options) => {
  const url = `https://aviationweather.gov/api/data/metar?ids=${options.dataSource}&format=json`
  return new Promise((resolve, reject) => {
    if (!options.test) { //Check if using TEST DATA
      axios
        .get(url)
        .then((response) => {
          
          const metarData = buildMetarObject(response, options.location);

          resolve(metarData);
          logger.info("metar data: ", metarData);
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
  try {
    logger.info("Building metar object");

    

    // NOTE: You originally had 'result.response.data' here, 
    // but your function argument is named 'response'.
    const baseData = response.data[0]; // Changed 'result' to 'response'
    const timeData = {
      issueTime: baseData.reportTime,
    };



    // Added 'const' here so these variables exist
    const rawMetarText = baseData.rawOb;
    const windSpeed = baseData.wspd;
    const windDirection = baseData.wdir;
    const rawMetarData = createMetarArrays(baseData);


    return {
      timeData,
      rawMetarText,
      //winds,
      rawMetarData,
      //lowestTemp
    };

  } catch (error) { 
    logger.error("Error building metar object: ", error);
    return null; // Useful to return null if it fails so the caller knows
  }
};

// Create an array for each forecast period.
createMetarArrays = (forecast) => {
  let metarForecast = [];
  
    try {
      observationTime = forecast.reportTime;
      windDirection = forecast.wdir ? (forecast.wdir == '0'? 'Variable': forecast.wdir) : 0;
      windSpeed = forecast.wspd ? forecast.wspd : 0;
      windGust = forecast.wgst ? forecast.wgst : 0;
      windGustDir = forecast.wdir ? (forecast.wdir == '0'? 'Variable': forecast.wdir) : 0;
  
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
