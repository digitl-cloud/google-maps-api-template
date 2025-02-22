 document.addEventListener('DOMContentLoaded', function () {
  if (document.querySelectorAll('#map').length > 0)
  {
    if (document.querySelector('html').lang)
      lang = document.querySelector('html').lang;
    else
      lang = 'de';

    var js_file = document.createElement('script');
    js_file.type = 'text/javascript';
    js_file.src = 'https://maps.googleapis.com/maps/api/js?callback=initMap&mapId=82fda344a7fca373&libraries=places,localContext&sensor=true&v=beta&language=' + lang + '&key=AIzaSyDvHrH49ggg4zB2tpRsu8I6ygD989Bx7go';
    document.getElementsByTagName('head')[0].appendChild(js_file);
  }
});


 var map;
 var service;
 var localContextMap;
 var placesService;

 function initMap()
 {

  localContextMap = new google.maps.localContext.LocalContextMapView({
    element: document.getElementById("map"),
    placeTypePreferences: [
      { type: "restaurant" },
      { type: "tourist_attraction" },
      { type: "night_club" },
      { type: "clothing_store" },
      { type: "convenience_store" },
      { type: "department_store" },
      { type: "cafe" },
      { type: "bar" },
      { type: "bakery" },
    ],
    maxPlaceCount: 0
  });

  map = localContextMap.map;
  map.setOptions({ 
    zoom: 15,
    clickableIcons: true,
    styles: {
      featureType: "poi",
      elementType: "labels",
      stylers: [
       { visibility: "on" }
      ]
    }
  }); 

  console.log('clickable icons = ' + map.getClickableIcons());

  //Intialize the Direction Service
  var service = new google.maps.DirectionsService();

  // fetch-Aufruf mit Pfad zur XML-Datei
  fetch ('KZK126.xml')
  .then (function (response) {
    return response.text();
  })
  .then (function (data) {

    var x2js = new X2JS();

    var jsonObj = x2js.xml_str2json(data);

    var airTravel = jsonObj.root.airTravel;
    var country = jsonObj.root.country;
    var itinerary = jsonObj.root.itinerary;
    var location = jsonObj.root.location;
    var organizer = jsonObj.root.organizer;

    iterateOverDays(itinerary.day);

  }).catch (function (error) {
   console.log ("Fehler: bei Auslesen der XML-Datei " + error);
 });
}

var markers;
var bounds;
var coords;
var counter = 0;

function createMarkers(dayName, destination) {
 var position = new google.maps.LatLng(destination.latitude, destination.longitude);


 var infoWindowContent = '<div class="container"><div class="accommodation-overlay h-100 w-100">'+dayName+'</div><div class="class="description"">'+destination.name+'</div></div>';

 var infowindow = new google.maps.InfoWindow({
  content: infoWindowContent,
});

 var marker = new google.maps.Marker({
  position: position,
  map: map,
  animation: google.maps.Animation.DROP,
  title: dayName
});

 marker.addListener("click", () => {
  infowindow.open({
    anchor: marker,
    map,
    shouldFocus: true,
  });
  localContextMap.maxPlaceCount = 12;
  localContextMap.search();
});

 coords.push(position);
 markers.push(marker)
 bounds.extend(position);
}

function iterateOverDays(days)
{
  markers = [];
  coords = [];
  bounds = new google.maps.LatLngBounds();

  console.log(days);

  days.forEach(function (day) {
    console.log(day);
    counter++;

    if (typeof day.destination_ref.destination != "undefined" && ((day.destination_ref.destination.latitude && day.destination_ref.destination.longitude) || Array.isArray(day.destination_ref.destination)) )  {
      if (Array.isArray(day.destination_ref.destination)) {
        day.destination_ref.destination.forEach(function (destinationDay, index) {
          createMarkers(day.name, destinationDay);
        });
      } else {
        createMarkers(day.name, day.destination_ref.destination);
      }

    }
  });

  var flightPath = new google.maps.Polyline({
    path: coords,
    geodesic: true,
    strokeColor: '#00FFFF',
    strokeOpacity: 1.0,
    strokeWeight: 5
  });
  
  flightPath.setMap(map);
  map.fitBounds(bounds);
}

