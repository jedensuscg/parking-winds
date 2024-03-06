var unitToFetch = "kecg";
var JSONLoaded;
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

  let kecg = 
  {
  code:"KECG",
  lat:36.26286,
  long:-76.17386
  }

  let padq = 
  {
  code:"PADQ",
  lat:57.73654328450417,
  long:-152.5043862000004,
  }

  let unit = 
  {
    lat:36.26286,
    long:-76.17386
  }
    
  var tempSpotPos = []

  let parkingSpotsKecg = [
    {
      spot:1,
      lat:36.26280538331262,
      long:-76.17423728721101
    },
    {
      spot:2,
      lat:36.26265615697597,
      long:-76.17369828612773
    },
    {
      spot:3,
      lat:36.262394469523336,
      long:-76.17217487450256
    },
    {
      spot:4,
      lat:36.26288756581106,
      long:-76.17268588055424
    }
  ]

  let parkingSpotsPadq = [
    {
      spot:1,
      lat:57.73620537850443, 
      long:-152.50348579566182
    },
    {
      spot:2,
      lat:57.73742526156234, 
      long:-152.5050834130002
    },
    {
      spot:3,
      lat:57.73710168156802, 
      long:-152.50563582022312
    },
  ]
  
  tempSpotPos = parkingSpotsKecg;
  console.log(tempSpotPos)

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
      testData.textContent = JSON.stringify(unitData.airStation);
      JSONLoaded = true;
      console.log("Data Loaded: " + JSONLoaded);
      resolve(unitData);
    })
    // When has failed, the `catch()` handler is called with
    .catch((error) => {
      console.log(error)
      testData.textContent = `Could not fetch data: ${error}`;
      reject();
    });
  });
  return dataPromise;
}
  
