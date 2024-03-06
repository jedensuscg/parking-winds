const L = window.leaflet

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

let map = L.map('map').setView([36.262862536771785, -76.17342389086477], 19);

window.addEventListener('DOMContentLoaded', () => {
  let kecgButton = document.getElementById('kecgButton');
  let padqButton = document.getElementById('padqButton');
  kecgButton.addEventListener('click', function() {
    unitToFetch = "kecg";
    unit.lat = kecg.lat;
    unit.long = kecg.long;
    tempSpotPos = parkingSpotsKecg;
    drawMap();
  });
  
  padqButton.addEventListener('click', function() {
    unitToFetch = "padq";
    unit.lat = padq.lat;
    unit.long = padq.long;
    tempSpotPos = parkingSpotsPadq;
    drawMap();
  });
});

// Initial Load
drawMap();

// Fetch data from server and draw the map
function drawMap() {
  console.log("DRAW MAP " + unit.lat + " " + unit.long);
  getData().then(() => {
  map.setView([unit.lat, unit.long], 18);
  
    // Azure Maps
    //   L.tileLayer('https://atlas.microsoft.com/map/tile?subscription-key={subscriptionKey}&api-version=2.0&tilesetId={tilesetId}&zoom={z}&x={x}&y={y}&tileSize=256&language={language}&view={view}', {
    //     attribution: `© ${new Date().getFullYear()} TomTom, Microsoft`,
    //     maxZoom: 19,
    //     minZoom: 17,
    //     //Add your Azure Maps key to the map SDK. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
    //     subscriptionKey: '9cHjOG8GmLwhGGBZvLhAAkiFtpjayDmPkSUDQsh1m_U',
    
    //     /*
    //         Tileset ID specifies which data layers to render in the tiles. Can be:
                                 
    //         'microsoft.base.road',  
    //         'microsoft.base.darkgrey',
    //         'microsoft.imagery', 
    //         'microsoft.weather.infrared.main', 
    //         'microsoft.weather.radar.main', 
    //         'microsoft.base.hybrid.road',
    //         'microsoft.base.labels.road '
    //     */
    //     tilesetId: 'microsoft.imagery',
    
    //     //The language of labels. Supported languages: https://docs.microsoft.com/en-us/azure/azure-maps/supported-languages
    //     language: 'en-US',
    
    //     //The regional view of the map. Supported views: https://aka.ms/AzureMapsLocalizationViews
    //     view: 'Auto'
    
    // }).addTo(map);
    
    //#region  Open Street Maop
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    //#endregion


    // Add parking spot markers to array and add markers to map.
    let parkingSpots = addToLayerGroup();
    parkingSpots.addTo(map);
  

      map.on("zoomend", function() {
        let currentZoom = map.getZoom();
       if(currentZoom <= 17 ) {
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

      map.on("moveend", function() {
        let inView = checkForUnitInView();
        console.log("In View: " + inView);
      });

}).catch(() => {});
}


// Add markers for current airstation to map
function addToLayerGroup() {

  let parkingSpotArray = []
      unitData.airStation.parkingSpots.spots.forEach(function (spot, index) {
        console.log(index)
        parkingSpotArray.push(L.marker([tempSpotPos[index].lat, tempSpotPos[index].long], {icon:airplaneIconHalf, rotationAngle: spot.baseHeading, rotationOrigin: 'center center'}));
      });
  return L.layerGroup(parkingSpotArray);
}

function checkForUnitInView() {
  
  let bounds = map.getBounds();
  
  let inView = bounds.contains([unit.lat, unit.long]);
  console.log("In View: " + inView);
  return inView;
}


