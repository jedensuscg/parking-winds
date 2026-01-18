
const parseString = require("xml2js");
const calcTafData = require("./calcWindData");
const getTemp = require("./getTemp")
const parser = new parseString.Parser({ explicitArray: false });
const axios = require("axios").default;
const logger = require('./logger');

const { DateTime } = require("luxon");
const url = ''


/**
 * Fetches TAF (Terminal Aerodrome Forecast) data from the aviation weather API or uses test data.
 *
 * @function
 * @param {Object} options - Configuration options for fetching TAF data.
 * @param {string} options.dataSource - The data source identifier (e.g., airport code).
 * @param {boolean} options.test - Flag to determine if test data should be used.
 * @param {string} [options.location] - The location identifier for building the TAF object.
 * @returns {Promise<Object>} A promise that resolves to the TAF data object or rejects with an error message.
 */
const getTaf = (options) => {
  const url = `https://aviationweather.gov/api/data/taf?ids=${options.dataSource}&format=json  `;
  return new Promise((resolve, reject) => {
    if (!options.test) { //Check if using TEST DATA
      axios
        .get(url)
        .then((response) => {
          const tafData = buildTafObject(response, options.location);
          resolve(tafData);
        })
        .catch((error) => {
          logger.error(error.stack)
          reject("error: " + error);
        });
    } else {
      const tafData = buildTafObject(options.dataSource);
      resolve(tafData);
    }  
  });
};

/**
 * Builds a TAF (Terminal Aerodrome Forecast) object from the given response and location.
 *
 * @async
 * @function buildTafObject
 * @param {Object} response - The response object containing TAF data.
 * @param {Object} location - The location object used to retrieve temperature data.
 * @returns {Promise<Object>} A promise that resolves to an object containing:
 *   @property {string} timeData - The time-related data (currently undefined in the code).
 *   @property {string} rawTafText - The raw TAF text from the response.
 *   @property {Object} winds - The calculated wind data from the TAF.
 *   @property {Array} rawTafForcasts - The raw TAF data arrays.
 *   @property {string} lowestTemp - The lowest temperature for the location.
 */
const buildTafObject = async (response, location) => {
  let lowestTemp;
  let timeData;
  let rawTafText;

  // ! Temp solution to not burn through API limits
  tempData = await getTemp(location)
  //lowestTemp = "15"

  // Check if using online source or local test file.
  const dataSource = (() => {
    try {
      if (!response.data) {
        //Using local test files
        return response;
      } else {
        // Online source
        return response.data;
      }
    } catch (error) {
      logger.error(error.stack)
    }

  })();
    rawTafText = dataSource[0].rawTAF
    rawTafForcasts = createTafArrays(dataSource[0].fcsts);

    winds = calcTafData.getCalculatedTafData(rawTafForcasts);
    //console.log(winds)
  return {
    //timeData,
    rawTafText,
    winds,
    rawTafForcasts,
    tempData,
  };
};


/**
 * Processes forecast data to create an array of TAF (Terminal Aerodrome Forecast) objects.
 *
 * @param {Object|Object[]} forecastData - The forecast data or an array of forecast data objects.
 * Each object should contain the following properties:
 *   - {string} timeFrom - The start time of the forecast period.
 *   - {string} timeTo - The end time of the forecast period.
 *   - {string} [change_indicator] - The change indicator for the forecast (e.g., "BECMG", "TEMPO").
 *   - {string} [wdir] - The wind direction (e.g., "Variable" or a numeric value as a string).
 *   - {string} [wspd] - The wind speed as a string.
 *   - {string} [wgst] - The wind gust speed as a string.
 *
 * @returns {Object} An object containing the following:
 *   - {Object[]} tafForecasts - An array of processed TAF forecast objects, each containing:
 *       - {string} timeFrom - The start time of the forecast period.
 *       - {string} timeTo - The end time of the forecast period.
 *       - {number|string} windDirection - The wind direction as a number or "Variable".
 *       - {number} windSpeed - The wind speed as a number.
 *       - {number} windGust - The wind gust speed as a number.
 *       - {number} durationOfForecast - The duration of the forecast period in some unit.
 *       - {string} changeIndicator - The change indicator for the forecast.
 */
const createTafArrays = (forecastData) => {
  console.log("creating arrays")
  let durationOfForecast;
  let tafForecasts = [];

  // Checks if forcastData is array, and if not turns it into an array format.
  if (!Array.isArray(forecastData)) {
    forecastData = [forecastData]
  }

  forecastData.forEach((forecast) => {
    //Times are in Timestamp, seconds from epoch. 
    
    timeFrom = forecast.timeFrom;
    timeTo = forecast.timeTo;


    changeIndicator = forecast.fcstChange != null ? forecast.fcstChange : "INITIAL";

    windDirection = forecast.wdir != 'null' ? forecast.wdir: 'not reported';

    windSpeed = forecast.wspd != 'null' ? forecast.wspd : 'not reported';
    windGust = forecast.wgst != 'null' ? forecast.wgst : 0;
    //determine amount of time taf forecast lasted
    if (timeFrom && timeTo) {
      durationOfForecast = calcForecastDurationFromTimeStamp(timeFrom, timeTo);
      
    } else {
      durationOfForecast = 0;
    }

    tafForecasts.push({
      timeFrom: convertTime(timeFrom),
      timeTo: convertTime(timeTo),
      windDirection: windDirection == 'VRB'? 'Variable': windDirection,
      windSpeed,
      windGust: windGust = 'null' ? 0 : windGust,
      durationOfForecast,
      changeIndicator,
    });
  });

  
  return {
    tafForecasts,
  };
};


/**
 * Calculates the duration of a forecast in minutes based on the given start and end times.
 *
 * @param {string} timeFrom - The starting time of the forecast in ISO 8601 format.
 * @param {string} timeTo - The ending time of the forecast in ISO 8601 format.
 * @returns {number} The duration of the forecast in minutes.
 */
const calcForecastDuration = (timeFrom, timeTo) => {
  const fromDT = DateTime.fromISO(timeFrom);
  const toDT = DateTime.fromISO(timeTo);
  const diff = toDT.diff(fromDT, "minutes");
  return (durationOfForecast = diff.toObject().minutes);
};

const calcForecastDurationFromTimeStamp = (timeFrom, timeTo) => {

  // Convert times from seconds to minutes and get difference.
  const diff = (timeTo - timeFrom) / 60
  return (diff);
};

const convertTime = (timeNumber) => {
  dateTime = new Date(timeNumber*1000)
  dateTimeISO = dateTime.toISOString()
  return dateTime
}

module.exports = getTaf;
