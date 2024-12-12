const L = window.leaflet
const swapMetarButton = document.querySelector("#swapMetarButton");
const loadingModal = document.querySelector(".loading-modal");
const currentWindsBtn = document.querySelector("#current-winds-btn");
const currentGustBtn = document.querySelector("#current-gust-btn");
const prevailingWindBtn = document.querySelector("#prevailing-wind-btn");
const highestWindbtn = document.querySelector("#strongest-wind-btn");
const hideLabelBtn = document.querySelector("#hide-label-btn");
const windDetails = document.querySelector("#wind-details-div")
const metarWindDataDiv = document.querySelector("#metar-wind-data-div")
const prevailingWindDataDiv = document.querySelector("#prevailing-wind-data-div")
const strongestWindDataDiv = document.querySelector("#strongest-wind-data-div")

let tafDiv = document.querySelector(".taf-grid-container");
let tafTextField = document.querySelector("#tafTextField");
let metarTextField = document.getElementById("metarTextField");
let windsToUse, windBarbs, parkingSpots, windLabels
let windBarbOptions = {
  strokeLength: 60,
  strokeWidth: 3,
  barbHeight: 20,
  pointRadius: 5,
  barbSpacing: 8,
}

// Wind Data Declarations
let testData = document.querySelector("#test-data")

let currentTimeSpan = document.querySelector("#current-wind-time")
let currentWindDirSpan = document.querySelector("#current-wind-dir")
let currentWindSpeedSpan = document.querySelector("#current-wind-speed")
let currentWindGustSpan = document.querySelector("#current-wind-gust")
let prevailingWindsDirSpan = document.querySelector("#prevailing-wind-dir")
let prevailingWindsSpeedSpan = document.querySelector("#prevailing-wind-speed")
let strongestWindsTimeSpan = document.querySelector("#strongest-wind-time")
let strongestWindsDirSpan = document.querySelector("#strongest-wind-dir")
let strongestWindsSpeedSpan = document.querySelector("#strongest-wind-speed")

// Create map with initial view. Currently Ecity.
let map = L.map('map').setView([36.262862536771785, -76.17342389086477], 19);
let OSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});
let satMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
 // Check viewport width
let vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)


let sidebar = L.control.sidebar({ 
  container: 'sidebar',
  autopan: true,
})
.addTo(map)

if (vw > 1400) {
  sidebar.open('wind')
}





window.addEventListener('DOMContentLoaded', () => {
  //TODO Replace with programatical assignment based on number of units in DB. I.E Dropdown menu.
  let kecgButton = document.getElementById('kecgButton');
  let padqButton = document.getElementById('padqButton');
  let toggleMapTypeButton = document.querySelector('#change-map-btn');
  
  kecgButton.addEventListener('click', function() {
    map.removeLayer(windBarbs).removeLayer(parkingSpots).removeLayer(windLabels);
    unitToFetch = "kecg";
    drawMap();

  });
  
  padqButton.addEventListener('click', function() {
    unitToFetch = "padq";
    map.removeLayer(windBarbs).removeLayer(parkingSpots).removeLayer(windLabels);
    drawMap();
  });
  toggleMapTypeButton.addEventListener('click', function(){
    if (map.hasLayer(OSM)) {
        map.addLayer(satMap);
        map.removeLayer(OSM);
        toggleMapTypeButton.innerText = "Switch to Street Map";
    } else {
        map.addLayer(OSM);
        map.removeLayer(satMap);
        toggleMapTypeButton.innerText = "Switch to Satellite Map";
    }
})
});

// #region Create C130 Icons
let airplaneIconFull = L.icon({
  iconUrl: 'public/img/130top.svg',

  iconSize:     [170, 170], // size of the icon
  shadowSize:   [80, 80], // size of the shadow
  iconAnchor:   [85, 85], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor

});
let airplaneIconHalf = L.icon({
  iconUrl: 'public/img/130top.svg',

  iconSize:     [80, 80], // size of the icon
  shadowSize:   [40, 40], // size of the shadow
  iconAnchor:   [40, 40], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
let airplaneIconQuarter = L.icon({
  iconUrl: 'public/img/130top.svg',

  iconSize:     [40, 40], // size of the icon
  shadowSize:   [20, 20], // size of the shadow
  iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
let airplaneIconTiny = L.icon({
  iconUrl: 'public/img/130top.svg',

  iconSize:     [10, 10], // size of the icon
  shadowSize:   [20, 20], // size of the shadow
  iconAnchor:   [5, 5], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
// #endregion
// Initial Load
drawMap();

//TODO Add a logo to the map
L.Control.Watermark = L.Control.extend({
  onAdd: function(map) {
      var img = L.DomUtil.create('img');

      img.src = '../../docs/images/logo.png';
      img.style.width = '200px';

      return img;
  },

  onRemove: function(map) {
      // Nothing to do here
  }
});
L.control.watermark = function(opts) {
  return new L.Control.Watermark(opts);
}

L.control.watermark({ position: 'bottomleft' }).addTo(map);

// standard leaflet map setup

// #region ---------- FUNCTIONS -------------
addHandlersAndListeners()
// Fetch data from server and draw the map
function drawMap() {
  getData().then(() => {
    map.setView([airStation.lat, airStation.long], 18);
    windsToUse = {speed: metarWinds.windSpeed, direction: metarWinds.windDirection};

    
    OSM.addTo(map);
    // Add parking spot markers to map
    windBarbs = createWindBarbLayer();
    parkingSpots = addParkingSpotsToLayer();
    windLabels = createWindLabelLayer();

    //Add windBarbs to map
    windBarbs.addTo(map);
    parkingSpots.addTo(map);
    windLabels.addTo(map);
    checkLabelVisibility();

    // Changes icon on zoom
    map.on("zoomend", function() {
      changeIconOnZoom(parkingSpots, windBarbs);
    });
  
    map.on("contextmenu", function (event) {
      let lat = event.latlng.lat;
      let long = event.latlng.lng;
      let popup = L.popup()
      .setLatLng([lat, long])
      .setContent(lat.toString() + ", " + long.toString())
      .openOn(map);
    });

    // Currently only shows if the current unit is in view
    map.on("moveend", function() {
      let inView = checkForUnitInView();

    });

}).catch((e) => {
  console.log(e);
  loadingModal.style.visibility = "visible";
  loadingModal.innerText = `Error Loading Map. Please refresh and try again. \n Error: ${e}`;
});
}
//Add markers for current airstation to map
function addParkingSpotsToLayer() {
  let parkingSpotArray = []
  airStation.parkingSpots.forEach(function (spot) {

    parkingSpotArray.push(L.marker([spot.lat, spot.long], {icon:airplaneIconHalf, rotationAngle: spot.baseHeading, rotationOrigin: 'center center'}));
  });

  return L.layerGroup(parkingSpotArray);
}

function createWindBarbLayer() {

  let windBarbArray = []
  let icon = L.WindBarb.icon({lat:airStation.lat, deg: windsToUse.direction, speed: windsToUse.speed, ...windBarbOptions});
  airStation.parkingSpots.forEach(function (spot) {
    windBarbArray.push(L.marker([spot.lat, spot.long], {icon:icon}));
  });

  return L.layerGroup(windBarbArray);
}

function createWindLabelLayer() {
  let windLabelArray = []
  airStation.parkingSpots.forEach(function (spot) {
    offset = addOffset(windsToUse.direction, spot.lat, spot.long);
    windLabelArray.push(L.marker([offset[0], offset[1]], { opacity: 0.01 }));
    
  });
  windLabelArray.forEach(marker => {

    marker.bindTooltip(windsToUse.speed + "Kts", {permanent: true, className: "my-label", offset: [0,0] });
  });
  return L.layerGroup(windLabelArray);
}

function changeIconOnZoom(parkingSpots, windBarbs) {
  let currentZoom = map.getZoom();
  const baseWindOptions = {lat: airStation.lat, deg:windsToUse.direction, speed: windsToUse.speed};
  let basewindBarbOptions = {...windBarbOptions, ...baseWindOptions};

  console.log("Zoom level: " + currentZoom);
  // Zoom <= 15
  if(currentZoom <= 15) {
    parkingSpots.eachLayer(function (spot) {
      spot.setIcon(airplaneIconTiny);
    });
    basewindBarbOptions = {...changeWindOptions(basewindBarbOptions, 0, "set"), ...baseWindOptions};
    windBarbs.eachLayer(function (barb) {
      let icon = L.WindBarb.icon({...baseWindOptions, ...basewindBarbOptions});
      barb.setIcon(icon);
    });
  // Zoom <= 17 && > 15
  } else if(currentZoom <= 17 && currentZoom > 15) {
      parkingSpots.eachLayer(function (spot) {
      spot.setIcon(airplaneIconQuarter);
    });
    basewindBarbOptions = {...changeWindOptions(basewindBarbOptions, 2, "divide"), ...baseWindOptions};
    windBarbs.eachLayer(function (barb) {
      let icon = L.WindBarb.icon({...baseWindOptions, ...basewindBarbOptions});
      barb.setIcon(icon);
    });
  // Zoom <= 18 && > 17
  } else if (currentZoom == 18 ) {
    parkingSpots.eachLayer(function (spot) {
      spot.setIcon(airplaneIconHalf);
    });
    windBarbs.eachLayer(function (barb) {
      let icon = L.WindBarb.icon(basewindBarbOptions);
      barb.setIcon(icon);
    });
  } else {
    parkingSpots.eachLayer(function (spot) {
      spot.setIcon(airplaneIconFull);
    });
    basewindBarbOptions = {...changeWindOptions(basewindBarbOptions, 1.25, "multiply"), ...baseWindOptions};
    basewindBarbOptions.strokeLength = basewindBarbOptions.strokeLength * 1.5;
    windBarbs.eachLayer(function (barb) {
      let icon = L.WindBarb.icon({...baseWindOptions, ...basewindBarbOptions});
      barb.setIcon(icon);
    });
  }
}

//Determines if current unit in view.
//TODO Change to see if any unit is in view.
function checkForUnitInView() {
  let bounds = map.getBounds();
  
  let inView = bounds.contains([airStation.lat, airStation.long]);

  return inView;
}

function changeWindOptions(options, value, operation) {
for (var option in options) {
    if (options.hasOwnProperty(option)) {
      switch (operation) {
        case "multiply":
           options[option] *= value;
          break;
        case "divide":
          options[option] /= value;
          break;
        case "set":
          options[option] = value;
          break;
        default:
          options[option] = value;
          break;
      }
    }
  }
  return options;
}

function setWindToUse (winds) {
  const windToUse = winds.highestWinds;
  return windToUse;

}
function createOffset(direction, distance) {
  const offsetX = distance * Math.sin(direction * Math.PI / 180);
  const offsetY = distance * Math.cos(direction * Math.PI / 180);
  return { x: offsetX, y: offsetY };
}

function addOffset(direction, lat, long) {
  if (direction == "variable") {
    return [lat, long];
  }
  const offset = 75 / 364000; // 10 feet in degrees (approximate value)
  const offsetLat = lat + offset * Math.cos(isNaN(direction) ? 0 : direction * Math.PI / 180);
  const offsetLong = long + offset * Math.sin(isNaN(direction) ? 0 : direction * Math.PI / 180);
  return [offsetLat, offsetLong];
}

function toggleLabels() {
  if (hideLabelBtn.innerText == "Hide Labels") {
    windLabels.eachLayer(function (label) {
      label.getTooltip().setOpacity(0.00);
    });
    hideLabelBtn.innerText = "Show Labels";
  } else {
    windLabels.eachLayer(function (label) {
      label.getTooltip().setOpacity(1.00);
    });
    hideLabelBtn.innerText = "Hide Labels";
  }
}

function checkLabelVisibility() {
  console.log("checking label visibility");
  if (hideLabelBtn.innerText == "Hide Labels") {
    windLabels.eachLayer(function (label) {
      label.getTooltip().setOpacity(1.00);
    });
  } else {
    windLabels.eachLayer(function (label) {
      label.getTooltip().setOpacity(0.00);
    });
  }
}

function addHandlersAndListeners() {
  swapMetarButton.addEventListener('click', function() {
    populateMetar(swapMetarButton);
  });

  currentWindsBtn.addEventListener('click', () => handleWindSelectionClick({speed: metarWinds.windSpeed, direction: metarWinds.windDirection}, metarWindDataDiv, "METAR WINDS"))
  currentGustBtn.addEventListener('click', () => handleWindSelectionClick({speed: metarWinds.windGust, direction: metarWinds.windGustDir}, metarWindDataDiv, "METAR GUSTS"))
  prevailingWindBtn.addEventListener('click', () => handleWindSelectionClick(winds.prevailingWinds, prevailingWindDataDiv,"PREVAILING WINDS"))
  highestWindbtn.addEventListener('click', () => handleWindSelectionClick(winds.highestWinds, strongestWindDataDiv,  "STRONGEST WINDS"))
  

  hideLabelBtn.addEventListener('click', function() {
    toggleLabels();
  });

  function handleWindSelectionClick(wind, windDiv, windText) {
    windsToUse = wind
    map.removeLayer(windBarbs).removeLayer(windLabels);
    windBarbs = createWindBarbLayer().addTo(map);
    windLabels = createWindLabelLayer().addTo(map);
    changeIconOnZoom(parkingSpots, windBarbs);
    const elements = document.querySelectorAll(".wind-data-col-active");
    console.log(elements)

    for (let i = 0; i < elements.length; i++) {
      elements[i].classList.remove("wind-data-col-active");
    }

    windDiv.classList.add("wind-data-col-active")
    document.querySelector("#view-wind-text").innerHTML = windText
  }

}
// #endregion





