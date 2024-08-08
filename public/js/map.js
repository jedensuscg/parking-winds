const L = window.leaflet

// Create C130 Icons
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

// Create map with initial view. Currently Ecity.
let map = L.map('map').setView([36.262862536771785, -76.17342389086477], 19);
let OSM = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  });

  var satMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  });

// let satMap = L.tileLayer('https://atlas.microsoft.com/map/tile?subscription-key={subscriptionKey}&api-version=2.0&tilesetId={tilesetId}&zoom={z}&x={x}&y={y}&tileSize=256&language={language}&view={view}', {
//       attribution: `© ${new Date().getFullYear()} TomTom, Microsoft`,
//       maxZoom: 19,
//       minZoom: 17,
//       //Add your Azure Maps key to the map SDK. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
//       subscriptionKey: '9cHjOG8GmLwhGGBZvLhAAkiFtpjayDmPkSUDQsh1m_U',
  
//       /*
//           Tileset ID specifies which data layers to render in the tiles. Can be:
                               
//           'microsoft.base.road',  
//           'microsoft.base.darkgrey',
//           'microsoft.imagery', 
//           'microsoft.weather.infrared.main', 
//           'microsoft.weather.radar.main', 
//           'microsoft.base.hybrid.road',
//           'microsoft.base.labels.road '
//       */
//       tilesetId: 'microsoft.imagery',
  
//       //The language of labels. Supported languages: https://docs.microsoft.com/en-us/azure/azure-maps/supported-languages
//       language: 'en-US',
  
//       //The regional view of the map. Supported views: https://aka.ms/AzureMapsLocalizationViews
//       view: 'Auto'
  
//   });

// Assign unit buttons events.
//TODO Replace with programatical assignment based on number of units in DB. I.E Dropdown menu.

window.addEventListener('DOMContentLoaded', () => {
  let kecgButton = document.getElementById('kecgButton');
  let padqButton = document.getElementById('padqButton');
  let toggleMapTypeButton = document.querySelector('.mapTypeButton');
  
  kecgButton.addEventListener('click', function() {
    unitToFetch = "kecg";
    drawMap();
  });
  
  padqButton.addEventListener('click', function() {
    unitToFetch = "padq";
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

//Add Map type button
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


// Initial Load
drawMap();

// Fetch data from server and draw the map
function drawMap() {

  getData().then(() => {
  map.setView([airStation.lat, airStation.long], 18);
  
    OSM.addTo(map);

    // Add parking spot markers to map
    let parkingSpots = addParkingSpotsToLayer();
    parkingSpots.addTo(map);
  
    // Changes icon on zoom
    map.on("zoomend", function() {
      changeIconOnZoom(parkingSpots);
    });
  
    map.on("contextmenu", function (event) {
      let lat = event.latlng.lat;
      let long = event.latlng.lng;
      let popup = L.popup()
      .setLatLng([lat, long])
      .setContent(lat.toString() + ", " + long.toString())
      .openOn(map);
      console.log("Coordinates: " + event.latlng.toString());
    });

    // Currently only shows if the current unit is in view
    map.on("moveend", function() {
      let inView = checkForUnitInView();

    });

}).catch(() => {});
}

//#region FUNCTIONS

//Add markers for current airstation to map
function addParkingSpotsToLayer() {
  let parkingSpotArray = []
  airStation.parkingSpots.forEach(function (spot) {

    parkingSpotArray.push(L.marker([spot.lat, spot.long], {icon:airplaneIconHalf, rotationAngle: spot.baseHeading, rotationOrigin: 'center center'}));

  });

  return L.layerGroup(parkingSpotArray);
}

function changeIconOnZoom(parkingSpots) {
  let currentZoom = map.getZoom();
      if(currentZoom <= 15) {
        parkingSpots.eachLayer(function (spot) {
          spot.setIcon(airplaneIconTiny);
        });
        console.log(" Switch to full: Zoom level: " + currentZoom);
      } else if(currentZoom <= 17 && currentZoom > 15) {
      parkingSpots.eachLayer(function (spot) {
          spot.setIcon(airplaneIconQuarter);
        });
        console.log(" Switch to quarter: Zoom level: " + currentZoom);
      } else if (currentZoom == 18 ) {
        parkingSpots.eachLayer(function (spot) {
          spot.setIcon(airplaneIconHalf);
      });
      } else {
        parkingSpots.eachLayer(function (spot) {
          spot.setIcon(airplaneIconFull);
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
//#endregion





