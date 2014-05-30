
'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');

function InfoController($scope) {
   $scope.templateValue = 'hello from the template itself';
   $scope.clickedButtonInWindow = function () {
      var msg = 'clicked a window in the template!';
        log(msg);
        alert(msg);
   };
};

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

flightCrewAppControllers.controller('mapController',['$scope','$http','$interval', '$q',function($scope, $http, $interval, $q) {
	
   var mapFirstLoaded = true;
   var gmap;
   var crewMembers = {};
   $scope.crewMembers = crewMembers;

   $scope.orderProp = 'id';
   $scope.toHMS = secToHMS;

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
               if(mapFirstLoaded)initMarkers();
               mapFirstLoaded = false;
            });
         }
      }
      
   };

   $scope.colo = 'red';

   $scope.lateColor = function(crewMember){
      if(crewMember.late){
         return 'red';
      }
      return "green";
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

   //add error handeling
   function initMarkers(){
      log("once");
      $http.get("ajax/getCrewIDs.php").success(function(crewIds,status,headers,config){
         var deferred = $q.defer();
         var promises = [];
         function lastTask(){
            deferred.resolve();
            addRemoveAllMarkers(true);
         }
         $scope.status = status;
         for (var i=0; i<crewIds.length; i++) {
            //console.log(crew[i].id);
            promises.push(
               $http.get("ajax/getLatestCrew.php?id="+crewIds[i].id).success(function(data,status,headers,config){
                  //console.log('getLatestCrew '+data[0]);
                  $scope.status = status;
                  addCrewMember(data[0]);
               }).error(function(data, status, headers, config){
                  $scope.status = status;
                  console.log(data);
               })
            );
         }
         //only called when all asynchrounous calls are finished
         $q.all(promises).then(lastTask);

      }).error(function(data, status, headers, config){
         $scope.status = status;
         console.log(data);

      });
      
   }


   function addCrewMember(jsonData){
      var crewMember = {
         id : jsonData.id,
         eta : parseFloat(jsonData.eta),
         route : jsonData.route,
         latitude : jsonData.latitudeDegree,
         longitude : jsonData.longitudeDegree,
         time: jsonData.timeSecond,
         showWindow: false,
         late:false,
         /*templateUrl: 'partials/info.html',*/
         gmarker: new google.maps.Marker({
            position: new google.maps.LatLng(
               jsonData.latitudeDegree, 
               jsonData.longitudeDegree),
            title:jsonData.id,
            icon:'img/green_Marker.png'
         }),
         gwindow: new google.maps.InfoWindow({
                  content: jsonData.id
         }) 
      };

      var marker = crewMember.gmarker;
      var infoWindow = crewMember.gwindow;
      google.maps.event.addListener(marker, 'click', function(){
            infoWindow.content = makeWindowContent(crewMember, false);
            infoWindow.open(gmap, marker);
            crewMember.showWindow = true;
      });
      google.maps.event.addListener(infoWindow,'closeclick',function(){
         crewMember.showWindow = false;
         log("closing");
      });

      crewMembers[crewMember.id]=crewMember;
   }


   function updateCrewMember(jsonData){
      var crewMember = crewMembers[jsonData.id];
      crewMember.latitude = jsonData.latitudeDegree;
      crewMember.longitude = jsonData.longitudeDegree;
      crewMember.eta = parseFloat(jsonData.eta);
      crewMember.route = jsonData.route;
      crewMember.time=jsonData.timeSecond;
      if(Math.random()<0.2) crewMember.late = !crewMember.late;
      var icon = 'img/green_Marker.png';
      if(crewMember.late) icon = 'img/red_Marker.png';

      crewMember.gmarker.setPosition(new google.maps.LatLng(
               jsonData.latitudeDegree, 
               jsonData.longitudeDegree));
      crewMember.gmarker.setIcon(icon);
      crewMember.gwindow.content = makeWindowContent(crewMember, crewMember.late);
      if(crewMember.showWindow)crewMember.gwindow.open(gmap, crewMember.gmarker);
   }

   function makeWindowContent(crewMember, late){

      var tag = "\"onTime\"";
      if(late) tag = "\"late\"";
      
      var style = "style=\"color:green\"";
      if(late) style = "style =\"color:red\"";

      var dateT = new Date(crewMember.time *1);
      var content = "<div class=\"infoWindow\">id: " + crewMember.id +
             "<br>lat: " + crewMember.latitude + 
             "<br>lon: " + crewMember.longitude + 
             "<br>time of update: " + dateT.toLocaleTimeString() + " "+ dateT.toLocaleDateString() + 
             "<p "+style+">eta: " + secToHMS(crewMember.eta) +"</p></div>";
      //console.log(content);
      return content;
   //<h2 style="background-color:red;">
   }

   
   //used to add/remove markers, sets map to gmap or null
   function addRemoveAllMarkers(add) {
      var map = null;
      if(add){map = gmap;}
      //marker.setMap(gmap);
      angular.forEach(crewMembers, function(crewMember, id) {
         crewMember.gmarker.setMap(map);
      });
   }



   function updateMap(){
      //log("many");
      $http.get("ajax/getCrewIDs.php").success(function(crewIds,status,headers,config){
         var deferred = $q.defer();
         var promises = [];
         function lastTask(){
            deferred.resolve();
            //addRemoveAllMarkers(true);
         }
         $scope.status = status;
         for (var i=0; i<crewIds.length; i++) {
            //console.log(crew[i].id);
            promises.push(
               $http.get("ajax/getLatestCrew.php?id="+crewIds[i].id).success(function(data,status,headers,config){
                  //console.log('getLatestCrew '+data[0]);
                  $scope.status = status;
                  updateCrewMember(data[0]);
               }).error(function(data, status, headers, config){
                  $scope.status = status;
                  console.log(data);
               })
            );
         }
         //only called when all asynchrounous calls are finished
         $q.all(promises).then(lastTask);

      }).error(function(data, status, headers, config){
         $scope.status = status;
         console.log(data);

      });
   }
   //updateMap();
   //update//

   //timer
   $interval(function () {
      updateMap();
      //genRandomMarkers(3);
   }, 5000);



   /* for debugging.. 

   function genRandomMarkers (numberOfMarkers) {
      var markers = [];
      for (var i = 0; i < numberOfMarkers; i++) {
         markers.push(createRandomMarker(i, $scope.map.bounds))
      }
      $scope.map.dynamicMarkers = markers;
   };


   var createRandomMarker = function (i, bounds, idKey) {
      var lat_min = bounds.southwest.latitude,
         lat_range = bounds.northeast.latitude - lat_min,
         lng_min = bounds.southwest.longitude,
         lng_range = bounds.northeast.longitude - lng_min;

      if (idKey == null) idKey = "id";

      var latitude = lat_min + (Math.random() * lat_range);
      var longitude = lng_min + (Math.random() * lng_range);
      var ret = {
         latitude: latitude,
         longitude: longitude,
         title: 'm' + i
      };
      ret[idKey] = i;
      return ret;
  }; */

  //end map

}]); //end mao controller