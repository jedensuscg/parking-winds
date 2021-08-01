const logger = require("./logger");

calcPrevailingWinds = (rawTafData) => {
  let windMap = new Map();
  let windDirections = [];
  let windSpeeds = [];
  let windTimes = [];
  let windGusts = [];
  // Put each element into individual array
  console.log(rawTafData)
  rawTafData.tafForecasts.forEach((forecast) => {
    windDirections.push(forecast.windDirection);
    windSpeeds.push(forecast.windSpeed);
    windTimes.push(forecast.durationOfForecast);
    windGusts.push(forecast.windGust);
  });

  //Map elements with wind direction as key, adding up the time duration of each unique wind direction.
  let newWindSpeed = 0
  try {
    for (let index = 0; index < windSpeeds.length; index++) {

      if (windMap.has(windDirections[index])) {
  
        const newTime = windMap.get(windDirections[index])[1] + windTimes[index];
        newWindSpeed = windSpeeds[index] > newWindSpeed ? windSpeeds[index] : newWindSpeed
  
        windMap.set(windDirections[index], [newWindSpeed, newTime]);
  
      } else {
        windMap.set(windDirections[index], [windSpeeds[index], windTimes[index]]);
        newWindSpeed = windSpeeds[index]
      }
    }

  

  const prevailingWindDirectionMap = [...windMap.entries()].reduce((a, b) => (b[1][1] > a[1][1] ? b : a));

  const prevailingWindDirection = prevailingWindDirectionMap[0];
  const prevailingWindTime = prevailingWindDirectionMap[1][1];
  const prevailingWindSpeed = prevailingWindDirectionMap[1][0]
  return {
    direction: prevailingWindDirection,
    speed: prevailingWindSpeed,
    time: prevailingWindTime,
  };
} catch (error) {
  logger.error({message: error.stack})
}
};

calcHighestWinds = (rawTafData) => {
  let windSpeedMap = new Map();

  //Create map with only the FIRST instance of each wind speed element.
  rawTafData.tafForecasts.forEach((forecast) => {
    if (!windSpeedMap.has(Object.values(forecast)[3])) {
      windSpeedMap.set(Object.values(forecast)[3], [Object.values(forecast)[2], Object.values(forecast)[0], Object.values(forecast)[1]]);
    }
  });

  //Get the highest wind speed, and create a map with direction at time.
  const highestWindSet = [...windSpeedMap.entries()].reduce((total, next) => (next[0] > total[0] ? next : total));
  return {
    speed: highestWindSet[0],
    direction: highestWindSet[1][0],
    timeFrom: highestWindSet[1][1],
    timeTo: highestWindSet[1][2]
  };
};

calcHighestGust = (rawTafData) => {
  let windGustMap = new Map();

  //Create map with only the FIRST instance of each wind speed element.
  rawTafData.tafForecasts.forEach((forecast) => {
    if (!windGustMap.has(Object.values(forecast)[4])) {
      windGustMap.set(Object.values(forecast)[4], [Object.values(forecast)[2], Object.values(forecast)[0], Object.values(forecast)[1]]);
    }
  });

  //Get the highest wind speed, and create a map with direction at time.
  const highestWindSet = [...windGustMap.entries()].reduce((total, next) => (next[0] > total[0] ? next : total));

  return {
    speed: highestWindSet[0],
    direction: highestWindSet[1][0],
    timeFrom: highestWindSet[1][1],
    timeTo: highestWindSet[1][2]
  };
};

getCalculatedTafData = (rawTafData) => {
  prevailingWinds = calcPrevailingWinds(rawTafData);
  highestWinds = calcHighestWinds(rawTafData);
  highestGust = calcHighestGust(rawTafData)
  return {
    prevailingWinds,
    highestWinds,
    highestGust,
  };
};

module.exports = {
  getCalculatedTafData,
};