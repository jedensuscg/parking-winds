

//Retrieve unit ICAO list


let unitToFetch = getLocalCookie("unit")
let unitList;
let JSONLoaded;
let highWindWarning = false;
let highWindCaution = false;
rawMetarMode = false;
console.log(unitToFetch)
getUnitList();

if (unitToFetch == null) {unitToFetch = 'kecg'}

function getUnitList() {
  var unitPromise = new Promise((resolve, reject) => {
    fetch(`./unitsICAO`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      unitList = data
      console.log(unitList)
      resolve(unitList);
    })
    // When has failed, the `catch()` handler is called with
    .catch((error) => {
      console.log(error)
      loadingModal.style.visibility = "visible";
      loadingModal.innerText = "Error fetching data. Please refresh and try again. If problem persists, there may be an issue the sereer. \n Error: " + error;
      reject();
    });
  });
  return unitPromise;
}

let unitData = {
    hideDetails: false,
    firstLoadCheck: true,
    dataTimestamp: -3600001,
    loadMsg: "LOADING",
    unitToFetch: "",
    highWindWarning: false,
    hangarWindWarning: false,
    lowTempWarning: false,
    airStation: undefined,
    viewingWindDir: 0,
    viewingWindSpeed: 0,
    metarWinds: {
      observationTime: '',
      windSpeed: 0,
      windDirection: 0,
      windGustSpeed: 0,
      windGustDir: 0,
    },
    winds: {
      prevailingWinds: {
        direction: 0,
        speed: 0,
      },
      highestWinds: {
        direction: 0,
        speed: 0,
        timeFrom: 0,
        timeTo: 0,
        timeFromLocal: 0,
        timeToLocal: 0,
      },
      highestGust: {
        direction: 0,
        time: 0,
        timeFrom: 0,
        timeTo: 0,
        timeFromLocal: 0,
        timeToLocal: 0,
      },
    },
    rawTaf: "",
    rawMetarText: '',
    decodeTaf: {},
    lowestTemp: "",
    loadWinds: false,
    ctx: undefined,
    canvas: undefined,
    debugX: 0,
    debugY: 0,
    drawType: "",
    windColors: {
      light: "green",
      moderate: "yellow",
      heavy: "red",
    },
  };

  let airStation = {};
  SpotPositions = []

function getData() {
  console.log("Getting Data")
  var dataPromise = new Promise((resolve, reject) => {
    loadingModal.style.visibility = "visible";
    fetch(`./taf/${unitToFetch}`)
    .then((response) => {

      JSONLoaded = false;
      // If the response is not ok, throw an error
      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }
      return response.json();
    })
    // When the page is loaded, the `then()` method is called with the response
    .then((data) => {
      unitData = data;
        airStation = {
        unitName: unitData.airStation.unitName,
        airStaDim: unitData.airStation.airStaDim,
        parkingSpots: unitData.airStation.parkingSpots.spots,
        radius: unitData.airStation.parkingSpots.radius,
        lat: unitData.airStation.lat,
        long: unitData.airStation.long,
      }

      decodeTaf = unitData.rawTafData;
      winds = unitData.winds;
      rawTaf = unitData.rawText;
      metarWinds = unitData.METAR.rawMetarData.metarForecast[0];

      (unitData.METAR.rawMetarData)
      rawMetarText = unitData.METAR.rawMetarText
      lowestTemp = {
        time: data.lowestTemp[0],
        temp: Math.floor(unitData.lowestTemp[1]),
      };

      populateMetar(swapMetarButton);
      populateWindData();
      populateTaf();
      loadingModal.style.visibility = "hidden";
      calculateWindAlert();
      checkForAlerts();
      resolve(unitData);
    })
    // When has failed, the `catch()` handler is called with
    .catch((error) => {
      console.log(error)
      loadingModal.style.visibility = "visible";
      loadingModal.innerText = "Error fetching data. Please refresh and try again. If problem persists, there may be an issue the sereer. \n Error: " + error;
      reject();
    });
  });

  return dataPromise;
}

function populateMetar(swapMetarButton) {
  rawMetarMode = !rawMetarMode
  linkHeader = document.querySelector("#direct-link");
  linkHeader.innerHTML = `<a href="https://aviationweather.gov/data/taf/?id=${unitToFetch}&metar=yes&decoded=yes" target="_blank">Direct link to full data on Aviationweather.gov</a>`
  if (rawMetarMode) {
    swapMetarButton.innerText = "Show Decoded METAR"
    metarTextField.textContent = rawMetarText
  } else {
    swapMetarButton.innerText = "Show RAW METAR"
    metarTextField.innerHTML = 
          `<span>Time: ${metarWinds.observationTime}</span><br>
          <span> Wind: ${metarWinds.windDirection} @ ${metarWinds.windSpeed} knots</span><br>`
    if (metarWinds.windGustSpeed > 0) {
      metarTextField.innerHTML += `<span> Gust: ${metarWinds.windGustSpeed} knots</span><br>`
    }
    metarTextField.innerHTML += `NOTE: Clouds and visibility are not currently not decoded. Server side updates are in progress.`
  }
}

function populateWindData() {
  //METAR
  currentTimeSpan.innerHTML = convertToLocalTime(metarWinds.observationTime);
  currentWindDirSpan.innerHTML = metarWinds.windDirection;
  currentWindSpeedSpan.innerHTML = metarWinds.windSpeed;
  metarWinds.windGust > 0 ? currentWindGustSpan.innerHTML = metarWinds.windGust : currentWindGustSpan.innerHTML = "No Gusts";

  //PREVAILING
  console.log(winds.prevailingWinds.direction)
  prevailingWindsDirSpan.innerHTML = winds.prevailingWinds.direction;
  prevailingWindsSpeedSpan.innerHTML = winds.prevailingWinds.speed;
  
  //STRONGEST
  strongestWindsTimeSpan.innerHTML = convertToLocalTime(this.winds.highestGust.timeFrom) + " to " + convertToLocalTime(this.winds.highestGust.timeTo)
  strongestWindsDirSpan.innerHTML = winds.highestWinds.direction
  strongestWindsSpeedSpan.innerHTML = winds.highestWinds.speed;

  //TEMP DATA
  currentTempSpan.innerHTML =  convertToF(metarWinds.metarTemp) + "&deg"
  lowestTempSpan.innerHTML = lowestTemp.temp
  lowestTempTimeSpan.innerHTML = lowestTemp.time
}

function populateTaf() {

  tafTextField.innerHTML = `${rawTaf}`;
  tafDiv.innerHTML = '';
  decodeTaf.tafForecasts.forEach(taf => {
    // Create a new grid container for each forecast
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';
    // Create rows for each property within the forecast
    createGridRow(gridContainer, 'Change Indicator', changeIndicatorToLongForm(taf.changeIndicator),'grid-blue');
    createGridRow(gridContainer, 'Forecast Period:', `${formatNumberToThreeDigits(taf.timeFrom)} to ${formatNumberToThreeDigits(taf.timeTo)}`,'grid-blue');
    if (taf.windSpeed == 0 && taf.windDirection == 0 && taf.changeIndicator == 'TEMPO') {
      createGridRow(gridContainer, 'Winds', 'No wind changes in this TEMPO line', 'grid-yellow');
    } else {

      createGridRow(gridContainer, 'Winds:', `${taf.windDirection == null ? "Variable": taf.windDirection} @ ${taf.windSpeed} knots`, 'grid-yellow');
    }

    if (taf.windGust > 0) {
      createGridRow(gridContainer, 'Gust:', `${taf.windGust} knots`,'grid-yellow');
    }

    // Append the new grid container to the main TAF container
    tafDiv.appendChild(gridContainer);
  });
}

function createGridRow(container, label, value, classColor) {
  const labelDiv = document.createElement('div');
  labelDiv.className = classColor + ' ' + 'grid-left';
  labelDiv.textContent = label;

  const valueDiv = document.createElement('div');
  valueDiv.className = classColor + ' ' + 'grid-right';
  valueDiv.textContent = value;

  container.appendChild(labelDiv);
  container.appendChild(valueDiv);
}
function changeIndicatorToLongForm (changeIndicator) {
  let longFormChangeIndicator
  switch (changeIndicator) {
    case 'FM':
      longFormChangeIndicator = 'FROM: standard forecast or significant change'
      break;
    case 'BECMG':
      longFormChangeIndicator = 'BECOMING'
    break;
    case 'TEMPO':
      longFormChangeIndicator = 'TEMPORARY: changes expected for less than half the time period'
    break;
    default:
      break;
  }
  return longFormChangeIndicator
};

function formatNumberToThreeDigits (value) {
  //if value is not integer, return value
  if (!isNaN(value)) {
  threeDigitValue = ('000' + value).substr(-3)
  return threeDigitValue
  } else {
    return value
  }
}

function convertToLocalTime (time) {
  const localTimeFull = new Date(time);
  const today = new Date()

  let localTime
  if (localTimeFull.getDate() === today.getDate()) {
    localTime = localTimeFull.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    localTime = localTimeFull.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      day: '2-digit',
      month: 'short'
    });
  }

  
  const localDay = localTimeFull.getDate()
  const localMonth = (localTimeFull.getMonth()) + 1
  const localDate = `${localMonth}/${localDay}`
  localTime = localTime.replace(':', "")
  localTime = localTime.replace(',', "")
  return localTime
}

function calculateWindAlert(){
  if ((winds.highestGust.speed || winds.highestWinds.speed ) > 22 && (winds.highestGust.speed || winds.highestWinds.speed ) < 35) {
    highWindCaution = true;
        console.log("high wind caution")
  }
  if ((winds.highestGust.speed || winds.highestWinds.speed ) > 34) {
        highWindWarning = true;
        console.log("high wind warning")
      }
}



function checkForAlerts() {

  console.log("checking for alerts")
  sidebarLowTempSpan = document.getElementById("lowest-temp-sidebar")
  sidebarLowTempSpan.innerHTML = lowestTemp.temp + "&deg"
  if(highWindCaution) {
    triggerAlert("wind-caution-alert")
  }
  if(highWindWarning) {
    triggerAlert("wind-warning-alert")
  }
  if(lowestTemp.temp < 34) {

    tempTimeSpan = document.getElementById("lowest-temp-time")
    tempSpan = document.getElementById("lowest-temp")
    tempSpan.innerHTML = lowestTemp.temp + "&deg"
    tempTimeSpan.innerHTML = lowestTemp.time + "Z"
    triggerAlert("temp-warning-alert")
    
  }
}

function triggerAlert(id) {
  const alert = document.getElementById(id);
  const statusAlert = document.getElementById("alerts-present");
  const statusNoAlert = document.getElementById("no-alerts");
  if (alert && alert.classList.contains('hidden')) {
    alert.classList.remove('hidden');
    if(statusAlert.classList.contains('hidden')) {
       statusAlert.classList.remove('hidden');
    }
    if(!statusNoAlert.classList.contains('hidden')) {
       statusNoAlert.classList.add('hidden');
    }
  }
}

function clearAlerts(id) {
  const alert = document.getElementById(id);
  const statusAlert = document.getElementById("alerts-present");
  const statusNoAlert = document.getElementById("no-alerts");
  if (!alert.classList.contains('hidden')) {
  }
  if (!statusAlert.classList.contains('hidden')) {
    statusAlert.classList.add('hidden')
  }
  if (statusNoAlert.classList.contains('hidden')) {
    statusNoAlert.classList.remove('hidden')
  }
}



// Get the modal
var modal = document.getElementById("updateModal");

// Get the button that opens the modal
var btn = document.getElementById("update-btn");
// var helpbtn = document.getElementById("help-btn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function convertToF(tempC){
  return (tempC * 9/5) + 32;
}
  
function setLocalCookie(key, value) {
  localStorage.setItem(key, value);
}

// Function to get a value from localStorage
function getLocalCookie(key) {
  return localStorage.getItem(key);
}

// Function to remove a value from localStorage
function removeLocalCookie(key) {
  localStorage.removeItem(key);
}
