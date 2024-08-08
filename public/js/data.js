

var unitToFetch = "kecg";
var JSONLoaded;

let metarTextField = document.getElementById("metarTextField");
let tafTextField = document.querySelector("#tafTextField");
const swapMetarButton = document.querySelector("#swapMetarButton");
swapMetarButton.addEventListener('click', function() {
  populateMetar(swapMetarButton);
});
rawMetarMode = false;



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
    fetch(`./taf/${this.unitToFetch}`)
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
      rawMetarText = unitData.METAR.rawMetarText
      lowestTemp = {
        time: data.lowestTemp[0],
        temp: Math.floor(unitData.lowestTemp[1]),
      };

      populateMetar(swapMetarButton);
      populateTaf();
      
      resolve(unitData);
    })
    // When has failed, the `catch()` handler is called with
    .catch((error) => {
      console.log(error)
      //testData.textContent = `Could not fetch data: ${error}`;
      reject();
    });
  });
  return dataPromise;
}

function populateMetar(swapMetarButton) {
  rawMetarMode = !rawMetarMode
  if (rawMetarMode) {
    swapMetarButton.innerText = "Show Decoded METAR"
    metarTextField.textContent = rawMetarText
  } else {
    swapMetarButton.innerText = "Show RAW METAR"
    metarTextField.innerHTML = 
          `<span>Time: ${metarWinds.observationTime}</span><br>
          <span> Wind: ${metarWinds.windSpeed} knots at ${metarWinds.windDirection} degrees</span><br>`
  }
}

function populateTaf() {
  const tafDiv = document.querySelector(".taf-grid-container");
  tafDiv.innerHTML = ''; // Clear previous content if any

  const tafTextField = document.createElement('div');
  tafTextField.innerHTML = `${rawTaf}`;
  tafDiv.appendChild(tafTextField);

  decodeTaf.tafForecasts.forEach(taf => {
    // Create a new grid container for each forecast
    const gridContainer = document.createElement('div');
    gridContainer.className = 'grid-container';

    // Create rows for each property within the forecast
    createGridRow(gridContainer, 'Change Indicator', changeIndicatorToLongForm(taf.changeIndicator),'grid-blue');
    createGridRow(gridContainer, 'Forecast Period:', `${formatNumberToThreeDigits(taf.timeFrom)} to ${formatNumberToThreeDigits(taf.timeTo)}`,'grid-blue');
    createGridRow(gridContainer, 'Winds:', `${taf.windSpeed} knots at ${taf.windDirection} degrees`, 'grid-yellow');
    if (taf.windGustSpeed > 0) {
      createGridRow(gridContainer, 'Gust:', `${taf.windGustSpeed} knots`,'grid-yellow');
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
  
