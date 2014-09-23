'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');

function log(s){
   //console.log(s);
}

flightCrewAppControllers.controller('playbackController',['$scope','$http','$interval', '$q','$rootScope', function($scope, $http, $interval, $q, $rootScope) {

  window.addEventListener("keyup", spaceBar, false);

  function spaceBar(e) {
    if(e.keyCode=="192") {
      $scope.toggle();
      $scope.$apply();
    }
  }

  /* For date pickers */
  $scope.i = 0;
  $scope.limit = 0;
  $scope.dtlower = new Date();
  //$scope.dtlower.setTime($scope.dtlower.getTime() - 1296000000); //sets the lower bound as low as possible
  $scope.dtlower.setTime(0);
  $scope.dtupper = new Date(); //upper bound is the current times
  $scope.isFFW = false;
  $scope.queryID = "";
  $scope.pathData=[];

  /* for play/pause/ffw buttons */
  $scope.play = '\u25BA';
  $scope.playbackTime=0;
  $scope.nextpt=null;
  
  var tempMarker = new MarkerWithLabel({
               title : 'temp',
               //icon : 'img/green_Marker.png',
               icon : 'img/green_Marker.png',
               labelContent : "",
               labelClass : "labels",
               labelInBackground : false
  });
  

  $scope.toggle = function() {
    tempMarker.setMap(null);
    if($scope.play=='\u25BA') {
      if($scope.pathData.length > 0) {
        $scope.play='\u275A\u275A';
        $scope.form.speed=$scope.form.defaultspeed;
        traversePaths($scope.pathData, 0);
      } else {
        alert("No data to playback; please submit valid ID(s).");
      }
    } else {
      $scope.play='\u25BA';
      clearTimeout($scope.nextpt);
    }
  }

  $scope.step=function() { 
    if($scope.pathData.length > 0) {
      clearTimeout($scope.nextpt);
      traversePaths($scope.pathData, 0);
      $scope.play='\u275A\u275A';
    } else {
      alert("No data to playback; please submit valid ID(s).");
    }
  }

  $scope.ffw = function() {
    tempMarker.setMap(null);
    $scope.step();
    $scope.form.speed*=(1+9/$scope.form.speed);
  }

  $scope.refreshLowerTimeBound = function() {
    if($scope.pathData.length > 0) {
      var time = parseInt($scope.pathData[$scope.i].timeSecond);
      $scope.playbackTime=time;
      $scope.dtlower.setTime(time);
      tempMarker.setPosition(new google.maps.LatLng($scope.pathData[$scope.i].latitudeDegree, $scope.pathData[$scope.i].longitudeDegree));
      tempMarker.setOptions({labelContent: $scope.pathData[$scope.i].id});
    }
  }

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened = true;
  };

  /* Duplicated function to open/close both datepickers independently */
  $scope.open2 = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.opened2 = true;
  };

  $scope.resetSlider = function() {
    if($scope.play!='\u25BA') $scope.toggle();
    clearMap();
    $scope.i=0;
  }

  //end date picker stuff

   var mapFirstLoaded = true;
   var gmap;
   var crewMembers = [];
   var flightids = [];
   var trackers = [];

   $scope.crewMembers = crewMembers;
   $scope.flightids = flightids;

   /* Tracks the paths for all crew members of a particular flight. */
   $scope.trackFlight = function(flightid) {
     $http.get("ajax/getCrewFromFlight.php?flightid=" + flightid).success(function(jsonData, status, headers, config) {
         var crewids = [];
         for(var i = 0; i < jsonData.length; i++) {
            crewids.push(jsonData[i].id);
         }
         if($scope.form.id != "") {
          $scope.form.id += "," + crewids.toString();
         } else {
          $scope.form.id = crewids.toString();
         }

      }).error(function(data, status, headers, config) {
         console.log("Error gleaning crew ids data");
      });
   }

  /* Angular data for the forms. Initial values are set to double-bind. */
   $scope.form = {
         id: "",
         speed: 1,
         defaultspeed:1
         , submit: function() {
            getData($scope.dtupper.getTime(), $scope.dtlower.getTime());
         }
   }

   google.maps.visualRefresh = true;
   var n210 = {latitude: 37.414468, longitude: -122.056862};

   $scope.map = {
         center: {latitude: $rootScope.centerGlobal.k, longitude: $rootScope.centerGlobal.B}//n210 //{latitude: 37.414468, longitude: -122.056862},
       , zoom: $rootScope.zoomGlobal
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
                  initCrew();
               }
               mapFirstLoaded = false;
               $rootScope.zoomGlobal = map.getZoom();
               $rootScope.centerGlobal = map.getCenter();
            });
         }
      }
      
   };
   
   /* Queries the path data associated with the id string, then plays back the paths which correspond to the IDs */
   function getData(timeUpper, timeLower){
      var ids = parseID(($scope.form.id).replace(/\s+/g, '')); //removes whitespace from id before parsing...can add commas to query
      $scope.queryID = makeQueryID(ids); //generates string to query
      $http.get("ajax/playback.php?" + "id=" +  $scope.queryID + "&timeUpper=" + $scope.dtupper.getTime() + "&timeLower=" + $scope.dtlower.getTime()).success(function(pathData, status, headers, config) {
         if(pathData != "null") {
            $scope.limit = pathData.length;
            $scope.pathData=pathData;
            $scope.form.speed=$scope.form.defaultspeed;
            //$scope.refreshLowerTimeBound();
            $scope.playbackTime = pathData[0].timeSecond;
            $scope.resetSlider();
            tempMarker.setPosition(new google.maps.LatLng(pathData[0].latitudeDegree, pathData[0].longitudeDegree));
            tempMarker.setOptions({labelContent: pathData[0].id});
            tempMarker.setMap(gmap);
         } else {
            alert("No data found for IDs: \"" + ids + "\" between time " + $scope.dtlower + " and " + $scope.dtupper + ".")
            $scope.form.speed=null;
            $scope.queryID=null;
            //$scope.form.id="";
         }
      }).error(function(data, status, headers, config) {
         console.log("Error gleaning path data");
      });
   }


   /* Generates the id portion of the query to get the pathData */
   function makeQueryID(ids) {
      var queryID = "'" + ids[0] + "'";
      for(var i = 1; i < ids.length; i++) {
         queryID += ",'" + ids[i] + "'";
      }
      //queryID += "\""
      return queryID;
   }

   /* Returns an array which contains all the IDs (is this even necessary...?)  */
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

   /* Given the pathData queried according to the pathData.php script, traverses paths with a calculated pause time of timeDiff*/
   function traversePaths(pathData, timeDiff) {
      $scope.nextpt = setTimeout(function() {
         var latitude = pathData[$scope.i].latitudeDegree;
         var longitude = pathData[$scope.i].longitudeDegree;
         var id = pathData[$scope.i].id
         var currTime = pathData[$scope.i].timeSecond;
         var tracker = getTracker(id, trackers);
         updateMarker(pathData[$scope.i], tracker);
         //log(tracker.gpath);

         $scope.i++;
         $scope.playbackTime = currTime;
         //$scope.dtlower.setTime(currTime);
         $scope.$apply();

         if($scope.i < $scope.limit) {
            //log(pathData[i].timeSecond - pathData[i-1].timeSecond);
            traversePaths(pathData, pathData[$scope.i].timeSecond-pathData[$scope.i-1].timeSecond);
         } else {
          setTimeout(function() {
              //$scope.dtlower.setTime(0);
              clearMap();
              $scope.playbackTime = pathData[0].timeSecond;
              $scope.resetSlider();
              $scope.$apply();
          }, 3000);
         } 

      }, timeDiff/$scope.form.speed); //simulated delay = realtime difference (in ms) divided by user-specified multiplier
   }

   /* Clears the map of all markers and polyLines */
   function clearMap() {
      for(var i = 0; i < trackers.length; i++) {
         trackers[i].marker.setMap(null);
         trackers[i].gpath.setMap(null);
         trackers[i].route.setMap(null);
      }
      var trackers2 = [];
      trackers = trackers2;
   }

   /* Returns the tracker that corresponds to the id, or makes a new tracker if one does not exist. */
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

   /* Makes a new tracker associated to the given id. */
   function makeNewTracker(id) {
      var pos = new google.maps.LatLng(null, null);
      //log(pos);
      var polyPath = [];
      var routePath = []; //maybe find route outside of fct then pass it in?

      var lineSymbol = {
        path : google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
        strokeColor: 'blue',
        strokeOpacity: 1.0,
        strokeWeight: 2.5,
        fillColor: 'white',
        fillOpacity: 1.0,
        scale: 3.5
      }

      var tracker = {
         id: id,
         marker : new MarkerWithLabel({
               position: pos,
               title : id,
               //icon : 'img/green_Marker.png',
               icon : 'img/blank.png',
               labelContent : id,
               labelClass : "labels",
               labelInBackground : false
         }),
         gpath : new google.maps.Polyline({
            path : polyPath,
            strokeColor : 'blue',
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
            strokeColor : 'red',
            strokeOpacity : 0.7,
            strokeWeight: 2,
            clickable: true,
            draggable: false,
            editable: false,
            geodesic: false
         }),          
         gwindow : new google.maps.InfoWindow({
            content : "ID: " + id //+ "<br> Position: " + pos
         })
      }
      var infoWindow = tracker.gwindow;
      var marker = tracker.marker;
      google.maps.event.addListener(marker, 'click', function(){
               infoWindow.open(gmap, marker);
      });

      return tracker;
   }

   /* Returns the polypath associated to a single line of queried path data. */
   function getPolyPath(jsonData) {
      if(jsonData.route==null) return []; //handles null paths
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

   /* Relocates and updates the tracker (marker, polyLines) given a single line of data from the pathData */
   function updateMarker(pointData, tracker){
     var marker = tracker.marker;
     var pos = new google.maps.LatLng(pointData.latitudeDegree, pointData.longitudeDegree);
     var path = tracker.gpath.getPath();
     var infoWindow = tracker.gwindow;
     var newRoute = getPolyPath(pointData);

     infoWindow.content = "ID: " + tracker.id; //+ "<br> Position: " + marker.position;
     marker.setPosition(pos);
     path.push(pos);
     tracker.route.setPath(newRoute);
     //log(pos);
   }

   /* Gets all the flight IDs */
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

   /* Gets all the crewmembers */
   function initCrew() {
      var crew = $scope.crewMembers;
      $http.get("ajax/getCrewIDs.php").success(function(crewiddata, status, headers, config) {
         for(var i = 0; i < crewiddata.length; i++) {
            crew.push(crewiddata[i].id);
         }
         //log(crew.toString());
      }).error(function(data, status, headers, config) {
         console.log("Error gleaning flightids data");
      });
   }

}]); //end playback controller

