var map;

var buses = new Array(1000);
var busmarkers = new Array(1000);
var busInfos = new Array(1000);

var busStops = new Array(10000);
var busStopMarkers = new Array(10000);
var busStopInfos = new Array(10000);

 var x = 0;
 var tempBusStops;

function initMap(){
  	var map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 41.6907, lng: -72.7665},
	  zoom: 16,
	  mapTypeControl: false,
	  streetViewControl: false
	});
	var marker = new google.maps.Marker({
		map: map,
		position: new google.maps.LatLng(41.6907, -72.7665),
		icon:  {
        url: 	"assets/img/currentPos.png",
        		scaledSize: new google.maps.Size(34, 41)
    	}
	});
	if (navigator.geolocation){
	  	navigator.geolocation.getCurrentPosition(function(position) {
		    var pos = {
		      lat: position.coords.latitude,
		      lng: position.coords.longitude
		    };
		    var marker = new google.maps.Marker({
				map: map,
				position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
				icon:  {
		        url: 	"assets/img/currentPos.png",
		        		scaledSize: new google.maps.Size(34, 41)
		    	}
	    	});
		    map.setCenter(pos);
		});
	}
	loadBusStops(map);
	getVehicleInfo(map);
	setInterval(updatePositions, 30000);
}

function nextArrivingBus(busStopID){
	var nextBus = new Array(2);
	$.getJSON("http://65.213.12.244/realtimefeed/tripupdate/tripupdates.json", function(data){
		jsonTrips = jQuery.parseJSON(JSON.stringify(data));
		for(var i = 0; i < jsonTrips.entity.length; i++){
			for(var j = 0; j < jsonTrips.entity[i].trip_update.stop_time_update.length; j++){
				if(jsonTrips.entity[i].trip_update.stop_time_update[j].stop_id == busStopID){
					if(nextBus == null){
						nextBus[0] = jsonTrips.entity[i].trip_update.vehicle.id;
						nextBus[1] = jsonTrips.entity[i].trip_update.stop_time_update[j].arrival.time;
					}
					else if(jsonTrips.entity[i].trip_update.stop_time_update[j].arrival.time < nextBus[1]){
						nextBus[0] = jsonTrips.entity[i].trip_update.vehicle.id;
						nextBus[1] = jsonTrips.entity[i].trip_update.stop_time_update[j].arrival.time;
					}
				}
			}
		}
	});
	return nextBus;
}

function compareBusStops(busStopID){

        
    $.getJSON("http://65.213.12.244/realtimefeed/tripupdate/tripupdates.json", function(data){
   
        jsonStops = jQuery.parseJSON(JSON.stringify(data));
        for(var i = 0; i < jsonStops.entity.length; i++){
            for(var j = 0; j < jsonStops.entity[i].trip_update.stop_time_update.length; j++){
                tempBusStops = jsonStops.entity[i].trip_update.stop_time_update[j].stop_id;
             
               $.getJSON("./assets/files/stops.json", function(data){      // inner json call
					jsonStops = jQuery.parseJSON(JSON.stringify(data));
           				 for(var k = 0; k < jsonStops.length; k++){
                                     busStops[i][0] = jsonStops[i].stop_id;
                                     busStops[i][1] = jsonStops[i].stop_name;
                                     busStops[i][2] = jsonStops[i].stop_lat;
                                     busStops[i][3] = jsonStops[i].stop_lon;
                			if( busStops[i][0] == jsonStops[i] ){ 

                            // code print onto google maps if fast trak stop


                		 }
            }
                
            }
        }

    }
 
 
 }

function loadBusStops(thisMap){
	for(var j = 0; j < busStops.length; j++){
		busStops[j] = new Array(4); //stop_id, name, lat, long
	}
	$.getJSON("./assets/files/stops.json", function(data){
		jsonStops = jQuery.parseJSON(JSON.stringify(data));
		for(var i = 0; i < jsonStops.length; i++){
			busStops[i][0] = jsonStops[i].stop_id;
			busStops[i][1] = jsonStops[i].stop_name;
			busStops[i][2] = jsonStops[i].stop_lat;
			busStops[i][3] = jsonStops[i].stop_lon;
			var nextBusInfo = nextArrivingBus(busStops[i][0]);
			var bsinfo = 		'<div id="content">'+
					            '<div id="siteNotice">'+
					            '</div>'+
					            '<h1 id="firstHeading" class="firstHeading">Bus Stop ID: '+ busStops[i][0] +'</h1>'+
					            '<div id="bodyContent">' +
						            '<p>' +
							            'Bus Stop Name: ' + busStops[i][1] + '<br>' +
							            'Location (Lat / Long): ' + busStops[i][2] + ' / ' + busStops[i][3] + '<br>' +
							            //'Next bus / time: ' + nextBusInfo[0] + ' / ' + nextBusInfo[1] + '<br>' +
						            '</p>'+
					            '</div>'+
				            '</div>';
			busStopInfos[i] = new google.maps.InfoWindow({
				content: bsinfo
			});
			busStopMarkers[i] = new google.maps.Marker({
				map: thisMap,
				position: new google.maps.LatLng(busStops[i][2], busStops[i][3]),
				icon:  {
			        url: 	"assets/img/busstopicon.png",
			        		scaledSize: new google.maps.Size(34, 41)
		    	},
		    	infowindow: busStopInfos[i]
    		});
			google.maps.event.addListener(busStopMarkers[i], 'click', function(innerKey) {
				return function() {
					busStopInfos[innerKey].open(thisMap, busStopMarkers[innerKey]);
				}
			}(i));
		}
	});
}

function updatePositions(){
	for(var i = 0; i < busmarkers.length; i++){
		if(busmarkers[i] != null){
			getNewPosition(i);
		}
	}
}

function getNewPosition(i){
	var latlng;
	$.getJSON("http://65.213.12.244/realtimefeed/vehicle/vehiclepositions.json", function(data){
		jsonObjectVehicle = jQuery.parseJSON(JSON.stringify(data));
		latlng = new google.maps.LatLng(jsonObjectVehicle.entity[i].vehicle.position.latitude, jsonObjectVehicle.entity[i].vehicle.position.longitude);
		busmarkers[i].setPosition(latlng);
	});
}

function getVehicleInfo(thisMap){
	var vehicles = new Array(1000); //enough for 1000 vehicles
	for(var k = 0; k < vehicles.length; k++){
		vehicles[k] = new Array(6);
	}
	// vehicle: id - lat - long - timestamp - routeid - tripid
	$.getJSON("http://65.213.12.244/realtimefeed/vehicle/vehiclepositions.json", function(data){
		jsonObjectVehicle = jQuery.parseJSON(JSON.stringify(data));
		for(var i = 0; i < jsonObjectVehicle.entity.length; i++){
			vehicles[i][0] = jsonObjectVehicle.entity[i].id;
			vehicles[i][1] = jsonObjectVehicle.entity[i].vehicle.position.latitude;
			vehicles[i][2] = jsonObjectVehicle.entity[i].vehicle.position.longitude;
			vehicles[i][3] = jsonObjectVehicle.entity[i].vehicle.timestamp;
			vehicles[i][4] = jsonObjectVehicle.entity[i].vehicle.trip.route_id;
			vehicles[i][5] = jsonObjectVehicle.entity[i].vehicle.trip.trip_id;
    		var info = 		'<div id="content">'+
				            '<div id="siteNotice">'+
				            '</div>'+
				            '<h1 id="firstHeading" class="firstHeading">Bus ID: '+ vehicles[i][0] +'</h1>'+
				            '<div id="bodyContent">'+
				            '<p>'+
				            'Vehicle Position (Lat/Long): ' + vehicles[i][1] + ' / ' + vehicles[i][1] + '<br>' +
				            'Timestamp: ' + vehicles[i][3] + '<br>' +
				            'Route ID: ' + vehicles[i][4] + '<br>' +
				            'Trip ID: ' + vehicles[i][5] + '<br>' +
				            '</p>'+
				            '</div>'+
				            '</div>';
			busInfos[i] = new google.maps.InfoWindow({
				content: info
			});
			busmarkers[i] = new google.maps.Marker({
				map: thisMap,
				position: new google.maps.LatLng(vehicles[i][1], vehicles[i][2]),
				icon:  {
			        url: 	"assets/img/busicon.png",
			        		scaledSize: new google.maps.Size(34, 41)
		    	},
		    	infowindow: busInfos[i]
    		});
    		google.maps.event.addListener(busmarkers[i], 'click', function(innerKey) {
				return function() {
					busInfos[innerKey].open(thisMap, busmarkers[innerKey]);
				}
			}(i));
		}
	});
}