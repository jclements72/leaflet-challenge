// Store URL for GeoJSON data
url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// Perform a get request to url
d3.json(url).the(function(data) {
    createFeatures(data.features);
});

// Create size of marker based on magnitude
function markerSize(magnitude) {
    return magnitude * 4;
}

// Create marker colors by depth
function markerColor(depth){
    if (depth < 10) return "green";
    else if (depth < 30) return "greenyellow";
    else if (depth < 50) return "yellow";
    else if (depth < 70) return "organge";
    else if (depth < 90) return "orangered";
    else return "red";
};

function createFeatures(earthquakeData) {
    
    // Popup for the time and place of each earthquake
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h1>Location: ${feature.properties.place}</h1><hr><h3>Magnitude: ${feature.properties.mag}</h3><br><h3>Depth: ${feature.geometry.coordinates[2]}</h3>`)
    }
    
    // Run the onEachFeature function once for each piece of data in the array.
      var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
    
        // Point to layer used to alter markers
        pointToLayer: function(feature, latlng) {
    
          // Determine the style of markers based on properties
          var markers = {
            radius: feature.properties.mag * 20000,
            fillColor: markerColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.7,
            color: "black",
            weight: 0.5
          }
          return L.circle(latlng,markers);
        }
    });

    //Send earthquake layer to createMap
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define streetmap and darkmap layers
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    
    });
  
    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    
  });
  
  
    // Define a baseMaps object to hold our base layers
    let baseMaps = {
      "Street": street,
      "Topography": topo,
  
    };
  
    // Create overlay object to hold our overlay layer
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load
    let myMap = L.map("map", {
      center: [
        37.09, -95.71
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);
  
    let legend = L.control({ position: "bottomright" });
    legend.onAdd = function(map) {
        let div = L.DomUtil.create("div", "info legend");
        const magnitudes = [-10, 10, 30, 50, 70, 90];
        const labels = [];
        const legendInfo = "<strong>Magnitude</strong>";
        div.innerHTML = legendInfo;
  
  // Loop through the magnitudes array and generate the legend HTML
  for (let i = 0; i < magnitudes.length; i++) {
    const from = magnitudes[i];
    const to = magnitudes[i + 1];
    labels.push(
      '<li style="background-color:' +
      markerColor(from + 1) +
      '"> <span>' +
      from +
      (to ? '&ndash;' + to : '+') +
      '</span></li>'
    );
  }
  
  // Add label items to the div under the <ul> tag
  div.innerHTML += "<ul>" + labels.join("") + "</ul>";
  return div;
};

// Add legend to the map
legend.addTo(myMap);
};