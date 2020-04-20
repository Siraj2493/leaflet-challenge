var queryUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'

// Perform a GET request to the query URL
d3.json(queryUrl, function (data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features)
})

function createFeatures (earthquakeData) {
  console.log(earthquakeData)

  function onEachFeature (feature, layer) {
    layer.bindPopup('<h3>' + feature.properties.place +
      '</h3><hr><p>' + new Date(feature.properties.time) + '</p>')
  }

  function onEachQuake (feature, layer) {
    return new L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
      radius: feature.properties.mag * 3,
      color: colorChooser(feature.properties.mag),
      fillOpacity: 1,
      fillColor: colorChooser(feature.properties.mag)
    })
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: onEachQuake
  })

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes)
}

function createMap (earthquakes) {
  // Define streetmap and darkmap layers
  var satellitemap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: API_KEY
  })

  var greyscale = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.light',
    accessToken: API_KEY
  })

  var darkmap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.dark',
    accessToken: API_KEY
  })

  var faultLines = new L.LayerGroup()

  var faultURL = 'https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json'

  d3.json(faultURL, function (data) {
    L.geoJSON(data, {
      style: function () {
        return { color: 'darkgrey'}
      }
    }).addTo(faultLines)
  })

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    'Satellite Map': satellitemap,
    'Grey Scale': greyscale,
    'Dark Map': darkmap
  }

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    'Fault Lines': faultLines
  }

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map('map', {
    center: [
      0, 0
    ],
    zoom: 3,
    layers: [satellitemap, earthquakes, faultLines]
  })

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap)

  var legend = L.control({ position: 'bottomright' })

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    var grades = [0, 1, 2, 3, 4, 5]
    var labels = []

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +=
              '<i style="background:' + colorChooser(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+')
    }

    return div
  }

  legend.addTo(myMap)
}

function colorChooser (mag) {
  switch (true) {
    case (mag < 1):
      return 'green'
    case (mag < 2):
      return 'greenyellow'
    case (mag < 3):
      return 'yellow'
    case (mag < 4):
      return 'orange'
    case (mag < 5):
      return 'DarkOrange'
    default:
      return 'red'
  };
}