// Query URL
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_week.geojson";

// Get request to query URL 
d3.json(queryUrl, function(data) {
    createFeatures(data.features);
});

function markerColor(depth) {

    // Conditional to assign color based on depth
    if (depth >= 90) {
        return "#F20101";
    }
    else if (depth >= 70) {
        return "#F26E01";
    }
    else if (depth >= 50) {
        return "#F2BB01";
    }
    else if (depth >= 30) {
        return "#E4F201";
    }
    else if (depth >= 10) {
        return "#B8F201";
    }
    else {
        return "#27F201"
    };
}
function createFeatures(earthquakeData) {

    // Create popup and circles
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function (feature,layer) {
            layer.bindPopup("<h3> Location: " + feature.properties.place + 
            "</h3><hr><p>" + "Magnitude: " + feature.properties.mag + 
            "<br> Depth: " + feature.geometry.coordinates[2])
        },
        pointToLayer: function(feature,latlng) {
            return new L.circle(latlng, {
                fillOpacity: 0.75,
                fillColor: markerColor(feature.geometry.coordinates[2]),
                radius: (feature.properties.mag) * 20000,
                stroke: true,
                color: "#000000",
                weight: 1
            })
        }
    });

    createMap(earthquakes); 
}

function createMap(earthquakes) {

    // Define streetmap, darkmap and lightmap layers
    var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });
    
    var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    var light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold  base layers
    var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap,
    "Light Map": light
    };

    // Create overlay object to hold overlay layer
    var overlayMaps = {
    Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("mapid", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [light, earthquakes]
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function () {

        var div = L.DomUtil.create('div', 'info legend'),
            depth = [-10, 10, 30, 50, 70, 90];
        

        // Loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
                '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' +
                depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
        }

        return div;
    };

    legend.addTo(myMap);
}