'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');

function secToHMS(totalSec) {
  var hours = parseInt( totalSec / 3600 ) % 24;
  var minutes = parseInt( totalSec / 60 ) % 60;
  var seconds = parseInt(totalSec % 60, 10);
  var hms = hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
  return hms;
}

function log(s){
   console.log(s);
}

flightCrewAppControllers.controller('playbackController',['$scope','$http','$interval', '$q',function($scope, $http, $interval, $q) {
   
   var mapFirstLoaded = true;
   var gmap;
   var PDT;
   var delay;
   var flightDelayStatus;
   var crewMembers = {};
   var airports = {};
   var flights = {};
   var flightids = [];

   $scope.crewMembers = crewMembers;
   $scope.flights = flights;
   $scope.flightids = flightids;

   $scope.orderProp = 'id';
   $scope.toHMS = secToHMS;

   $scope.trackFlight = function(flightid) {
     $http.get("ajax/getCrewFromFlight.php?flightid=" + flightid).success(function(jsonData, status, headers, config) {
         var crewids = [];
         for(var i = 0; i < jsonData.length; i++) {
            crewids.push(jsonData[i].id);
         }
         $scope.form.id = crewids.toString();
         //log(flightid + ": " + crewids.toString());
         getDataAndTraversePath($scope.form.id, $scope.form.time);
      }).error(function(data, status, headers, config) {
         console.log("Error gleaning crew ids data");
      });
   }


   $scope.form = {
         //id: 'Enter id here'
         //, time: 'Enter time here'
         id: 'Enter IDs',
         time: '1000000000000000000',
         speed: '100'
         , submit: function() {
            //var msg = "ID: " + $scope.form.id + " | Time: " + $scope.form.time;
            //alert(msg);
            getDataAndTraversePath($scope.form.id, $scope.form.time);
         }
   }

   google.maps.visualRefresh = true;
   var n210 = {latitude: 37.414468, longitude: -122.056862};
   var SFO =  {latitude: 37.615223, longitude: -122.389979};

   $scope.map = {
         center: n210 //{latitude: 37.414468, longitude: -122.056862},
       , zoom: 7
       , control: {}
       , dragging: true
       , bounds: {}
       , envents: {}
       , options: {}
       , dynamicMarkers: []
       , events: {
         tilesloaded: function (map) {
            $scope.$apply(function () {
               gmap = map;
               if(mapFirstLoaded) {
                  initFlights();
               }
               mapFirstLoaded = false;
            });
         }
      }
      
   };
   
   function getDataAndTraversePath(id, time){
      var ids = parseID(id.replace(/\s+/g, '')); //removes whitespace from id before parsing...can add commas to query
      //log(ids);
      var queryID = makeQueryID(ids); //generates string to query
      //log(queryID);
      
      $http.get("ajax/playback.php?" + "id=" +  queryID + "&time=" + time).success(function(pathData, status, headers, config) {
         var msg = "ajax/playback.php?" + "id=" + queryID + "&time=" + time;
         var trackers = [];
         if(pathData != "null") {
            traversePaths(pathData, trackers, 0, pathData.length, 0);
         } else {
            alert("No data found for IDs: \"" + ids + "\"")
         }
      }).error(function(data, status, headers, config) {
         console.log("Error gleaning path data");
      });
      
   }

   function makeQueryID(ids) {
      var queryID = "'" + ids[0] + "'";
      for(var i = 1; i < ids.length; i++) {
         queryID += ",'" + ids[i] + "'";
      }
      //queryID += "\""
      return queryID;
   }

   function parseID(id) {
      var idArr = [];
      var lastComma = -1; //since we get the substring after the comma, technically the comma is at the -1th index.
      for(var i = 0; i <= id.length; i++) {
         if(id.charAt(i) == ',' || i == id.length) {
            idArr.push(id.substring(lastComma + 1, i));
            lastComma = i;
         }
      }
      return idArr;  
   }

   function traversePaths(pathData, trackers, i, limit, timeDiff) {
      setTimeout(function() {
         var latitude = pathData[i].latitudeDegree;
         var longitude = pathData[i].longitudeDegree;
         var id = pathData[i].id
         var currTime = pathData[i].timeSecond;
         var tracker = getTracker(id, trackers);
         updateMarker(pathData[i], tracker);
         //log(tracker.gpath);

         i++;

         if(i < limit) {
            //log(pathData[i].timeSecond - pathData[i-1].timeSecond);
            traversePaths(pathData, trackers, i, limit, pathData[i].timeSecond-pathData[i-1].timeSecond);
         } else {
            log("All paths finished.")
            setTimeout(function() { 
               clearMap(trackers); //can't clear one at a time since we don't know when it next shows up
            }, 5000);
         } 

      }, timeDiff/$scope.form.speed);
   }

   function clearMap(trackers) {
      for(var i = 0; i < trackers.length; i++) {
         trackers[i].marker.setMap(null);
         trackers[i].gpath.setMap(null);
         trackers[i].route.setMap(null);
      }
   }

   function getTracker(id, trackers) {
      for(var i = 0; i < trackers.length; i++) {
         if(trackers[i].id == id)
            return trackers[i];
      }
      var tracker = makeNewTracker(id);
      trackers.push(tracker);
      tracker.marker.setMap(gmap);
      tracker.gpath.setMap(gmap);
      tracker.route.setMap(gmap);
      return tracker; 
   }


   function makeNewTracker(id) {
      var pos = new google.maps.LatLng(null, null);
      //log(pos);
      var polyPath = [];
      var routePath = []; //maybe find route outside of fct then pass it in?

      var lineSymbol = {
        path : google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        strokeColor: 'white',
        strokeOpacity: 1.0,
        strokeWeight: 2,
        fillColor: '#0033CC',
        fillOpacity: 1.0,
        scale: 3.5
      }

      var tracker = {
         id: id,
         marker : new google.maps.Marker({
               position: pos,
               title : id,
               icon : 'img/green_Marker.png',
               //icon : 'null',
         }),
         gpath : new google.maps.Polyline({
            path : polyPath,
            strokeColor : '#0033CC',
            strokeOpacity : 0.7,
            strokeWeight: 3,
            clickable: true,
            draggable: false,
            editable: false,
            geodesic: false,
            icons: [{
              icon : lineSymbol,
              offset : '100%'
            }]
         }),     
         route : new google.maps.Polyline({
            path : routePath,
            strokeColor : '#FF0000',
            strokeOpacity : 0.7,
            strokeWeight: 2,
            clickable: true,
            draggable: false,
            editable: false,
            geodesic: false
         }),          
         gwindow : new google.maps.InfoWindow({
            content : "ID: " + id + "<br> Position: " + pos
         })
      }
      var infoWindow = tracker.gwindow;
      var marker = tracker.marker;
      google.maps.event.addListener(marker, 'click', function(){
               infoWindow.open(gmap, marker);
      });

      return tracker;
   }

   function getPolyPath(jsonData) {
      var route = (jsonData.route).split("|");
      var numPoints = route.length;
      var polyPath = [];
      for(var i = 0; i < numPoints; i++) {
         var point = route[i].split(",");
         polyPath.push(new google.maps.LatLng(point[0],point[1]));
         //log(polyPath);
      }
      return polyPath;
   }

   function updateMarker(pointData, tracker){
     var marker = tracker.marker;
     var pos = new google.maps.LatLng(pointData.latitudeDegree, pointData.longitudeDegree);
     var path = tracker.gpath.getPath();
     var infoWindow = tracker.gwindow;
     var newRoute = getPolyPath(pointData);

     infoWindow.content = "ID: " + tracker.id + "<br> Position: " + marker.position;
     marker.setPosition(pos);
     path.push(pos);
     tracker.route.setPath(newRoute);
     //log(pos);
   }

   function initFlights() {
      var flightids = $scope.flightids;
      $http.get("ajax/getFlightIDs.php").success(function(flightiddata, status, headers, config) {
         for(var i = 0; i < flightiddata.length; i++) {
            flightids.push(flightiddata[i].flightid);
         }
         //log(flightids.toString());
      }).error(function(data, status, headers, config) {
         console.log("Error gleaning flightids data");
      });
   }

   function setCrewIDsAsID(flightid) {
      
   }

}]); //end playback controller

