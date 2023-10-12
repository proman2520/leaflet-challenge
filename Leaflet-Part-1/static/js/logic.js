// All 4.5+ earthquakes from the past 30 days
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"

// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr> \
                    <p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }

    function createCircleMarker(feature, coord) {
      let options = {
        radius: feature.properties.mag*5,
        fillOpacity: 0.75,
        fillColor: colorCircle(feature.geometry.coordinates[2]),
        color: "black"
      }
      return L.circleMarker(coord, options)
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: createCircleMarker
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function colorCircle(depth) {
  if (depth > 90) {
      return "red"
  } else if (depth >= 70) {
      return "orangered"
  } else if (depth >= 50) {
      return "orange"
  } else if (depth >= 30) {
      return "yellow"
  } else if (depth >= 10) {
      return "yellowgreen"
  } else {
      return "green"
  }
}

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street,
      "Topographic Map": topo
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
}

// Create a control for our layers, and add our overlays to it.
L.control.layers(null, overlays).addTo(myMap);

// Create a legend to display information about our map.
let legend = L.control({
  position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend".
legend.onAdd = function() {
  let div = L.DomUtil.create("div", "legend");

  let grades = [-10, 10, 30, 50, 70, 90];
  let colors = ["green", "yellowgreen", "yellow", "orange", "orangered", "red"];

  //Assistance
  for (let i = 0; i < grades.length; i++) {
    div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
      + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
  }
  return div;
};

// Add the info legend to the map.
legend.addTo(myMap);