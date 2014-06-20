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

   $scope.crewMembers = crewMembers;
   $scope.flights = flights;

   $scope.orderProp = 'id';
   $scope.toHMS = secToHMS;

   $scope.form = {
         //id: 'Enter id here'
         //, time: 'Enter time here'
         id: 'sfkee',
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
                  initAirportMarkers();
                  //initFlights();
               }
               mapFirstLoaded = false;
            });
         }
      }
      
   };

   $scope.color = 'red';

   $scope.lateColor = function(crewMember){

      if(crewMember.late){
         return 'red';
      }
      return "green";
   }

   $scope.delayColor = function(flight)
   {
      var status = flight.delayStatus;
      
      if(status == "red")
      {
         console.log("delayColor"+status);
         return "red";
      }
      return "black";

   }

   $scope.maxEta = function(){
      var max = 0;
      angular.forEach(crewMembers, function(crewMember, id) {
         if (crewMember.eta > max) max = crewMember.eta;
      });
      return secToHMS(max);
   }
     /* _.each(markers, function (marker) {
            marker.showWindow = false; } */

   $scope.crewTableClick = function(crewMember){

      if(!crewMember.showWindow){//window is currently closed
            crewMember.gwindow.open(gmap, crewMember.gmarker);
            crewMember.showWindow = true;
      } else { //window is open
         crewMember.gwindow.close();
         crewMember.showWindow = false;
      }
      log("tableClick more like" + crewMember.showWindow);
   };

   
   function getDataAndTraversePath(id, time){
      var ids = parseID(id.replace(/\s+/g, '')); //removes whitespace from id before parsing...can add commas to query
      //log(ids);
      var queryID = makeQueryID(ids); //generates string to query
      //log(queryID);
      
      $http.get("ajax/playback.php?" + "id=" +  queryID + "&time=" + time).success(function(pathData, status, headers, config) {
         var msg = "ajax/playback.php?" + "id=" + queryID + "&time=" + time;
         //log(msg);
         //log(pathData);
         //traversePath(pathData, id); //change to accept multiple IDs
         var trackers = [];
         traversePaths(pathData, trackers, 0, pathData.length);
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

   function traversePaths(pathData, trackers, i, limit) {
      setTimeout(function() {
         var latitude = pathData[i].latitudeDegree;
         var longitude = pathData[i].longitudeDegree;
         var id = pathData[i].id;

         var tracker = getTracker(id, trackers);
         moveMarker(latitude, longitude, tracker.marker, tracker.gpath);
         //log(tracker.gpath);

         i++;

         if(i < limit) { 
            traversePaths(pathData, trackers, i, limit);
         } else {
            log("All paths finished.")
            setTimeout(function() { 
               clearMap(trackers); //can't clear one at a time since we don't know when it next shows up
            }, 5000);
         } 

      }, $scope.form.speed);
   }

   function clearMap(trackers) {
      for(var i = 0; i < trackers.length; i++) {
         trackers[i].marker.setMap(null);
         trackers[i].gpath.setMap(null);
         //trackers[i].route.setMap(null);
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
      return tracker; 
   }


   function makeNewTracker(id) {
      var pos = new google.maps.LatLng(null, null);
      //log(pos);
      var polyPath = [];
      //var routePath = getPolyPath(pathData[pathData.length - 1]); //maybe find route outside of fct then pass it in?

      var tracker = {
         id: id,
         marker : new google.maps.Marker({
               position: pos,
               title : id,
               icon : 'img/green_Marker.png',
         }),
         gpath : new google.maps.Polyline({
            path : polyPath,
            strokeColor : '#0033CC',
            strokeOpacity : 0.7,
            strokeWeight: 2,
            clickable: true,
            draggable: false,
            editable: false,
            geodesic: false
         }),
         /*
         , route = new google.maps.Polyline({
            path : routePath,
            strokeColor : '#FF0000',
            strokeOpacity : 0.7,
            strokeWeight: 2,
            clickable: true,
            draggable: false,
            editable: false,
            geodesic: false
         }), 
         */
         gwindow : new google.maps.InfoWindow({
            content : id
         })
      }
      var infoWindow = tracker.gwindow;

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

   function moveMarker(latitude, longitude, marker, gpath){
     var pos = new google.maps.LatLng(latitude, longitude);
     var path = gpath.getPath();
     marker.setPosition(pos);
     path.push(pos);
     //log(pos);
   }

}]); //end map controller

