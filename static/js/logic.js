
function markerSize(magnitude) {
	return magnitude*3;
}

function markerColor(magnitude) {
	if (magnitude <= 1) {
		return 'green'
	} else if (magnitude <=2) {
		return 'lime'
	} else if (magnitude <=3) {
		return 'yellow'
	} else if (magnitude <=4) {
		return 'orange'
	} else {
		return 'red'
	}
}

function markerOpacity(magnitude){
	if (magnitude <= 1) {
		return 0.3
	} else if (magnitude <=2) {
		return 0.4
	} else if (magnitude <=3) {
		return 0.5
	} else if (magnitude <=4) {
		return 0.6
	} else if (magnitude <=5) {
		return 0.7
	} else if (magnitude <=6) {
		return 0.8
	} else if (magnitude <=7) {
		return 0.9
	} else {
		return 1
	}
}

var queryUrl= "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
var queryUrl2="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";
var geoJson;

Promise.all([d3.json(queryUrl),
			d3.json(queryUrl2),
]).then(function(data) {
	
	//console.log(data[1])
	//console.log('flag')
	console.log(data[0].features);
	console.log(data[0]);

	createFeatures(data[0].features,data[1].features);
});

function createFeatures(earthquakeData, faultLineData) {
	console.log(earthquakeData.length);
	//console.log(earthquakeData[0].properties);
	//console.log(earthquakeData[0].features);
	//console.log(earthquakeData[0].geometry.coordinates[0]);

	var earthquakes = L.geoJSON(earthquakeData, {
		onEachFeature: createPopup,
		pointToLayer: createMarker
	});
	var faultLines = L.geoJson(faultLineData)

	var markers = L.markerClusterGroup();
	  for (var i = 0; i < earthquakeData.length; i++) {
    // Set the data location property to a variable
    var location = earthquakeData[i].geometry;
    // Check for location property
    if (location) {
      // Add a new marker to the cluster group and bind a pop-up
      markers.addLayer(L.marker([location.coordinates[1], location.coordinates[0]])
        .bindPopup(earthquakeData[i].properties.title));
    }}

    //map.addLayer(markers)
	createMap(earthquakes,faultLines,location);
}
	
function createPopup(feature, layer) {
	return layer.bindPopup("<h3>" + feature.properties.place +
			"</h3><hr><p>" + new Date(feature.properties.time) + "</p><hr><p>Magntude:" + feature.properties.mag + "</p>");
	}
function createMarker(feature, location) {
	var options = {
		fillOpacity: markerOpacity(feature.properties.mag),
		color: markerColor(feature.properties.mag),
		fillColor:markerColor(feature.properties.mag),
		stroke: false,
		radius: markerSize(feature.properties.mag)
	}
	return L.circleMarker(location, options);
}

function createMap(earthquakes,faultLines,location) {


	//Define variables for base layers
	var streetmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox/streets-v11',
	    tileSize: 512,
	    zoomOffset: -1,
	    accessToken: API_KEY
		});

	var darkmap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
	    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
	    maxZoom: 18,
	    id: 'mapbox/dark-v10',
	    tileSize: 512,
	    zoomOffset: -1,
	    accessToken: API_KEY
		});

	//create separate layer groups

	var baseMaps = {
		"Street Map": streetmap,
		"Dark Map": darkmap
	};

console.log(location)

	var overlayMaps = {
	  Earthquakes: earthquakes,
	  "Fault Lines": faultLines,
	  Location: location
	};


	var myMap = L.map("map", {
		center: [37, -95],
		zoom: 2,
		layers: [darkmap, earthquakes, faultLines, location]
	})

	L.control.layers(baseMaps, overlayMaps, {
	collapsed: false
	}).addTo(myMap);
	

	/*
	var legend = L.control({position: 'bottomright'});
		legend.onAdd = function() {

			var div = L.DomUtil.create('div', 'info legend');
			div.innerHTML = "<h3>Earthquake Magnitude</h3><table><tr><th>4+</th><td>Red</td></tr><tr><th>3+</th><td>Orange</td></tr><tr><th>2+</th><td>Yellow</td></tr><tr><th>1+</th><td>Lime</td></tr><tr><th><1</th><td>Green</td></tr></table>";
			return div;

		};
	legend.addTo(myMap);
	*/

	/*
var legend = L.control({position: 'bottomright'});
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Categories</strong>'],
    categories = ['4+','3+','2+','1+','<1'];
    colors=['Red','Orange','Yellow','Lime','Green']

    for (var i = 0; i < categories.length; i++) {
            div.innerHTML += 
            labels.push(
                '<i style="background:' + colors[i] + '"></i> ' +
                (categories[i] ? categories[i] : '+'));
        }

        div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(myMap);
*/

  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = ['4+','3+','2+','1+','<1'];
    var colors = ['red','orange','yellow','lime','green'];
    var labels = [];

    // Add min & max
    var legendInfo = "<h1 style=\"color:red\">Earthquake Magnitude</h1>" +
      "<div class=\"labels\">" +
        "<div class=\"min\">" + limits[0] + "</div>" +
        "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
      "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push(`<li style="background-color: ${colors[index]}">${limit}</li>`);
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
}
legend.addTo(myMap);

}