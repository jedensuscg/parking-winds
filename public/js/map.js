const L = window.leaflet

var airplaneIconFull = L.icon({
  iconUrl: 'public/img/130top.svg',

  iconSize:     [140, 140], // size of the icon
  shadowSize:   [80, 80], // size of the shadow
  iconAnchor:   [70, 70], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor

});
var airplaneIconHalf = L.icon({
  iconUrl: 'public/img/130top.svg',

  iconSize:     [80, 80], // size of the icon
  shadowSize:   [40, 40], // size of the shadow
  iconAnchor:   [40, 40], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});
var airplaneIconQuarter = L.icon({
  iconUrl: 'public/img/130top.svg',

  iconSize:     [40, 40], // size of the icon
  shadowSize:   [20, 20], // size of the shadow
  iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
  shadowAnchor: [4, 62],  // the same for the shadow
  popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});




var map = L.map('map').setView([unit.lat,unit.long], 19);
document.body.onload = function() {

// Azure Maps
  L.tileLayer('https://atlas.microsoft.com/map/tile?subscription-key={subscriptionKey}&api-version=2.0&tilesetId={tilesetId}&zoom={z}&x={x}&y={y}&tileSize=256&language={language}&view={view}', {
    attribution: `© ${new Date().getFullYear()} TomTom, Microsoft`,
    maxZoom: 19,
    minZoom: 17,
    //Add your Azure Maps key to the map SDK. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
    subscriptionKey: '9cHjOG8GmLwhGGBZvLhAAkiFtpjayDmPkSUDQsh1m_U',

    /*
        Tileset ID specifies which data layers to render in the tiles. Can be:
                             
        'microsoft.base.road',  
        'microsoft.base.darkgrey',
        'microsoft.imagery', 
        'microsoft.weather.infrared.main', 
        'microsoft.weather.radar.main', 
        'microsoft.base.hybrid.road',
        'microsoft.base.labels.road '
    */
    tilesetId: 'microsoft.imagery',

    //The language of labels. Supported languages: https://docs.microsoft.com/en-us/azure/azure-maps/supported-languages
    language: 'en-US',

    //The regional view of the map. Supported views: https://aka.ms/AzureMapsLocalizationViews
    view: 'Auto'

}).addTo(map);

//----------------- Base Map
  // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  // maxZoom: 19,
  // attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  // }).addTo(map);
// ---END BASE MAP
  console.log(unitData.airStation.parkingSpots.spots.length);
  
  var parkingSpotArray = []

  unitData.airStation.parkingSpots.spots.forEach(function (spot, index) {
    console.log(index)
    parkingSpotArray.push(L.marker([tempSpotPos[index].lat, tempSpotPos[index].long], {icon:airplaneIconFull, rotationAngle: spot.baseHeading, rotationOrigin: 'center center'}).addTo(map));
  });


  

  map.on("zoomend", function() {
    var currentZoom = map.getZoom();
   if(currentZoom <= 17 ) {
      parkingSpotArray.forEach((spot) => {
        spot.setIcon(airplaneIconQuarter);
      });
      
      console.log(" Switch to quarter: Zoom level: " + currentZoom);
    } else if (currentZoom == 18 ) {
      parkingSpotArray.forEach((spot) => {
        spot.setIcon(airplaneIconHalf);
      });
      
      console.log(" Switch to half: Zoom level: " + currentZoom);
    } else {
      parkingSpotArray.forEach((spot) => {
        spot.setIcon(airplaneIconFull);
      });
      console.log(" Switch to full: Zoom level: " + currentZoom);
    }

  });


  map.on("contextmenu", function (event) {
    var lat = event.latlng.lat;
    var long = event.latlng.lng;
    var popup = L.popup()
    .setLatLng([lat, long])
    .setContent(lat.toString() + ", " + long.toString())
    .openOn(map);
    console.log("Coordinates: " + event.latlng.toString());
  });


///ROTATE///




}


