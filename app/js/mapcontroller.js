
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
   var PDT;
   var delay;
   var crewDelay;
   var flightDelayStatus;
   var crewDelayStatus;
   var distance;
   var farValue;
   var crewMembers = {};
   var airports = {};
   var flights = {};
   var matchingFlights = {};
   var selectedFlight;
   var globalCrewIDs = [];
   var saveCrewIDs = [];
   var specificCrew = {};
   var specificCrewMember;
   var counter = 0;

   $scope.crewMembers = crewMembers;
   $scope.flights = flights;
   $scope.matchingFlights = matchingFlights;
   $scope.allFlights = [];
   $scope.orderProp = 'id';
   $scope.toHMS = secToHMS;
   $scope.specificCrew = specificCrew;

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
                  initMarkers();
                  initAirportMarkers();
                  initFlights();
                  getMatchingFlights();
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
         //console.log("delayColor"+status);
         return "red";
      }
      return "black";

   }

   $scope.maxEta = function(){
      var max = 0;
      angular.forEach(crewMembers, function(crewMember, id) {
         if (crewMember.eta > max) 
         {
            max = crewMember.eta;
         }
      });
      return secToHMS(max);
   }
   
   $scope.selectedFlights = $scope.allFlights[0];

   function reset() 
   {

      if(counter != 0)
      {
        //log("reset: " + counter);
        $("#crewControl tbody td").empty();
      }
      
      counter = counter +1;
      //log("check reset" + counter);
   }

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

   function initAirportMarkers() {
      log("init airport markers");
      $http.get('data/airportpositions.json').success(function(data) { 
           //log(data);
          $.each( data, function( key, item ) {
            log(data[key][0].latitude);
            log(data[key][0].longitude);
            log('airport name: ' + key);
            var airport = {
               airportId : key,
               showWindow : false,
               gwindow : new google.maps.InfoWindow({
                              content: key}),
               airportMarker : new google.maps.Marker({
                                       position: new google.maps.LatLng(
                                       data[key][0].latitude, 
                                       data[key][0].longitude),
                                       title : key,
                                       icon:'img/Airport-cct.png'
                                    })
            }
            var infoWindow = airport.gwindow;
            var marker = airport.airportMarker;
            google.maps.event.addListener(marker, 'click', function(){
               infoWindow.content = makeAirportWindowContent(airport);
               infoWindow.open(gmap, marker);
               airport.showWindow = true;
             });
            google.maps.event.addListener(infoWindow,'closeclick',function(){
               airport.showWindow = false;
            });
            airports[airport.airportId]=airport;
          });
        });
   }

   //add error handeling
   function initMarkers(){
      log("init markers once");
      $http.get("ajax/getCrewIDs.php").success(function(crewIds,status,headers,config){
         var deferred = $q.defer();
         var promises = [];
         function lastTask(){
            deferred.resolve();
            addRemoveAllMarkers(true);
         }
         $scope.status = status;
         for (var i=0; i<crewIds.length; i++) {
            //console.log(crewIds[i].id);
            promises.push(
               $http.get("ajax/getLatestCrew.php?id="+crewIds[i].id).success(function(data,status,headers,config){
                  //console.log('getLatestCrew '+data[0]);
                  //log('crewRoute: ' + data[0].route);
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

   function initFlights()
   {
      log("init flight date");

      $http.get("ajax/getFlightData.php").success(function(flights,status,headers,config)
      {
         var deferred = $q.defer();
    
         deferred.resolve(flights);

         for(var i=0; i<flights.length; i++)
         {

            calculatePTD(flights[i]);
            addFlights(flights[i], PDT, delay, flightDelayStatus);
         }

      }).error(function(data, status, headers, config){

         deferred.reject(flights);

         console.log("Error in initFlights");
      });
   }

   function addFlights(jsonData, PDT, delay, flightDelayStatus)
   {
      // var day = jsonData.departuretime.slice(0,3);
      var hours = parseInt(jsonData.departuretime.slice(4,6), 10);
      var minutes = parseInt(jsonData.departuretime.slice(7,9), 10); //specifying 10 as the base
      var amPM = jsonData.departuretime.slice(9,11);
      // var timeSavings = jsonData.departuretime.slice(11,15);

      var hma = formatTime(hours,minutes, amPM);

         var flight = 
         {
            flightId : jsonData.flightid,
            aircraftType : jsonData.aircraftype,
            departureAirport : jsonData.departureairport,
            arrivalAirport : jsonData.arrivalairport,
            departureTime :  hma,
            arrivalTime : jsonData.arrivaltime,
            flightPTD : PDT,
            flightDelay : delay,
            delayStatus : flightDelayStatus,
         };

      flights[flight.flightId]=flight;
      
   }

   function getMatchingFlights()
   {
      $http.get("ajax/matchFlights.php").success(function(matchFlights,status,headers,config){
         var deferred = $q.defer();
         var promises = [];

         function lastTask()
         {
            deferred.resolve();       
         }

         $scope.status = status;

         for(var i=0; i<matchFlights.length; i++) 
         {
            matchingFlights[i] = { id:matchFlights[i].flightID};
          
            $scope.allFlights.push(matchingFlights[i].id);
         
            console.log("Matching flights: " + matchingFlights[i].id);
         }
         
         //only called when all asynchrounous calls are finished
         $q.all(promises).then(lastTask);

      }).error(function(data, status, headers, config){
         $scope.status = status;
         console.log("Error in getMatchingFlights " + data);
      });
   }

   $scope.getSelectedFlight = function()
   {
     
      selectedFlight = $scope.selectedFlights;

      console.log("Flight selected:" + selectedFlight);

      getSpecificCrew();

      reset();

   }

   function getSpecificCrew()
   {
     
      for(var i=0; i<globalCrewIDs.length; i++) 
      {
         specificCrewMember = crewMembers[globalCrewIDs[i]];

         farValue = calculateFAR();

         if(specificCrewMember.crewFlightId == selectedFlight)
         {
            calculateDistance(specificCrewMember.latitude,specificCrewMember.longitude,37.615223,-122.389979);
            log("dist" + distance);

            specificCrewMember = 
            {
                  id: specificCrewMember.id,  
                  eta : specificCrewMember.eta,
                  route : specificCrewMember.route,
                  crewFlightId : specificCrewMember.crewFlightId,
                  crewDelay : specificCrewMember.crewDelay,
                  delayStatus : specificCrewMember.delayStatus,
                  far : farValue,
                  distanceToDest : distance
            }

            specificCrew[specificCrewMember.id] = specificCrewMember;  

            //log("check crew id and flight id: " + specificCrewMember.id + " " + specificCrewMember.crewFlightId);

         }
      }

      saveCrewIDs = globalCrewIDs.slice(0); //copies contents to saveCrewIDs

   }

   function formatTime(hours, minutes, amPM)
   {
      if(minutes >= 60)
      {
         minutes = minutes-60;

         /* AM/PM switch */
         if(hours == 11 && amPM == "AM")
         {
            hours = hours+1;
            amPM = "PM";
         }
         else if (hours == 11 && amPM == "PM")
         {
            hours = hours+1;
            amPM = "AM";
         }
         else
         { 
            hours = hours+1;
         }

      }

      if(hours > 12)
      {
         hours = hours-12;
      }  

      /*Leading zeroes are inserted back (8:00AM is 08:00AM)*/
      if(hours < 10)
      {
         hours = "0"+hours;
      }
      if(minutes < 10)
      {
         minutes = "0"+minutes;
      }

      /*Ignore days and time zones*/
      var hma = hours+":"+minutes+" "+amPM;

      return hma;
   }

   /*Max delay is 1 hour; changes necessary if delay > 1 hour*/
   function formatDelay(hours,delay)
   {
      var delayHours = 0;

      if(delay < 10)
      {
         delay = "+00:0"+delay;
         //console.log("Delay < 10: "+delay);

         return delay;
         
      }
      else if(delay >= 10 && delay < 60)
      {
         delay = "+00:"+delay;
         //console.log("Delay > 10: "+delay);
         
         return delay;
      }
      else if (delay >= 60)
      {
         delayHours = delayHours+1;

         if(delayHours < 10)
         {
            delay = "+0"+delayHours+":"+(delay-60)+"0";

            return delay;
         }
         else (delayHours >= 10)
         {
            delay = "+"+delayHours+":"+(delay-60)+"0"; 
            
            return delay; 
         }
      }
   }

   //Generating dummy PTD values for now
   function calculatePTD(jsonData)
   {
      //Format: Wed 10:49AM EDT
      var randomValue = Math.floor((Math.random() * 60) + 1); //max delay is 60 minutes

      var hours = parseInt(jsonData.departuretime.slice(4,6), 10);
      var minutes = parseInt(jsonData.departuretime.slice(7,9), 10); //specifying 10 as the base
      var amPM = jsonData.departuretime.slice(9,11);

      var oldMinutes = minutes;
      minutes = minutes+randomValue; //add artificial delay
      
      delay = Math.abs(oldMinutes - minutes); //the temporary delay value

      /*Set flight delay status*/
      if(delay <= 10)
      {
         flightDelayStatus = "green";
      }
      else if (delay > 10 && delay <= 30)
      {
         flightDelayStatus = "yellow";
      }
      else
      {
         flightDelayStatus = "red";
      }

      delay = formatDelay(hours, delay);

      var hma = formatTime(hours, minutes, amPM);

      PDT = hma;

      //console.log("PDT: "+PDT); 
   }

   function calculateDistance(originLat, originLong, destLat, destLong)
   {
        /* http://maps.googleapis.com/maps/api/distancematrix/json?origins=34.0500,-118.2500&destinations=37.615223,-122.389979 */
        var service = new google.maps.DistanceMatrixService();  
        var origin = new google.maps.LatLng(originLat, originLong);
        var destination = new google.maps.LatLng(destLat, destLong); //SFO for now

        service.getDistanceMatrix(
        {
           origins: [origin],
           destinations: [destination],
           travelMode: google.maps.TravelMode.DRIVING,
           unitSystem: google.maps.UnitSystem.IMPERIAL,
           avoidHighways: false,
           avoidTolls: false,
         }, callback);

   }
   function callback(response, status) 
   {
      if(status == google.maps.DistanceMatrixStatus.OK) 
      {
       var origins = response.originAddresses;
       var destinations = response.destinationAddresses;

         for (var i = 0; i < origins.length; i++) 
         {
            var results = response.rows[i].elements;
            
            for (var j = 0; j < results.length; j++) 
            {
              var element = results[j];
              distance = element.distance.text;
              //var duration = element.duration.text;
              //var from = origins[i];
              //var to = destinations[j];

              $scope.distance = distance;
              console.log("distance check: " + distance);
            }
         }
      }
    }

   /*FAR-117 limit for 2-pilot crews is 9 hours*/
   function calculateFAR()
   {
      /*9 hours = 540 minutes */
      farValue = Math.floor((Math.random() * 540) + 1);

      var farHours = 0;
      var farMin = 0;

      if(farValue < 60)
      {
         farValue = "00:"+farValue;
         
         return farValue;
      }
      else if (farValue >= 60)
      {
         farHours = Math.floor(farValue/60);
         var temp = farHours*60;
         farMin = parseInt(farValue - temp);

         if(farMin < 10)
         {
             farValue = "0"+farHours+":"+"0"+farMin;
             //console.log("farValue: " + farValue);

             return farValue;
         }
         else if (farMin >= 10)
         {
             farValue = "0"+farHours+":"+farMin;
             //console.log("farValue: " + farValue);

             return farValue;
         }  
      }
   }  

   //This function will be unnecessary when we update the phone apps to send destination as well
   function getDestPoint(jsonData) {
      var dest_route = (jsonData.route).split("|");
      //log(dest_route);
      var dest = dest_route[dest_route.length - 1];
      //log(dest);
      var point = dest.split(",");
      //log(point);
      //var destLat = point[0];
      //var destLon = point[1];
      //log("lat" + destLat);
      //log("lon" + destLon);
      return point;
   }


   function getPolyPath(jsonData) {
      var route = (jsonData.route).split("|");
      var numPoints = route.length;
      var polyPath = [];
      for(var i = 0; i < numPoints; i++) {
         var point = route[i].split(",");
         //log(point[0]);
         //log(point[1]);
         polyPath.push(new google.maps.LatLng(point[0],point[1]));
         //log(polyPath);
      }
      return polyPath;
   }

   function addCrewMember(jsonData){
      var dest_point = getDestPoint(jsonData);
      var polyPath = getPolyPath(jsonData);
      var prevPath = [];
      //farValue = calculateFAR();

      //log(polyPath);
      var crewMember = {
         id : jsonData.id,
         eta : parseFloat(jsonData.eta),
         route : jsonData.route,
         latitude : jsonData.latitudeDegree,
         longitude : jsonData.longitudeDegree,
         time: jsonData.timeSecond,
         crewFlightId : jsonData.flightid,
         crewDelay : crewDelay,
         delayStatus : crewDelayStatus,
         //far : farValue,
         showWindow: false,
         late:false,
         /*templateUrl: 'partials/info.html',*/
         destination : new google.maps.LatLng(dest_point[0], dest_point[1]),
         gmarker: new google.maps.Marker({
            position: new google.maps.LatLng(
               jsonData.latitudeDegree, 
               jsonData.longitudeDegree),
            title:jsonData.id,
            icon:'img/green_Marker.png'
         }),
         gwindow: new google.maps.InfoWindow({
                  content: jsonData.id
         }),
         gpath : new google.maps.Polyline({
            path : polyPath,
            strokeColor : '#FF0000',
            strokeOpacity : 0.7,
            strokeWeight: 2,
            clickable: true,
            draggable: false,
            editable: false,
            geodesic: false
         }),
         prevPath : new google.maps.Polyline({
            path : prevPath,
            strokeColor : '#0033CC',
            strokeOpacity : 0.7,
            strokeWeight: 2,
            clickable: true,
            draggable: false,
            editable: false,
            geodesic: false
         }) 
      };

      /*Temporarily set crew delay equal to ETA*/       
      crewDelay = secToHMS(crewMember.eta);
      parseCrewDelay(crewDelay, crewMember); 

      var marker = crewMember.gmarker;
      var infoWindow = crewMember.gwindow;
      google.maps.event.addListener(marker, 'click', function(){
            infoWindow.content = makeWindowContent(crewMember, false);
            infoWindow.open(gmap, marker);
            crewMember.showWindow = true;
            //crewMember.gpath.
            crewMember.gpath.setMap(gmap);
            crewMember.prevPath.setMap(gmap);
      });
      google.maps.event.addListener(infoWindow,'closeclick',function(){
         crewMember.showWindow = false;
         crewMember.gpath.setMap(null);
         crewMember.prevPath.setMap(null);
         log("closing");
      });
      initPrevPath(crewMember);

      crewMembers[crewMember.id]=crewMember;

      /*check for duplicates here */
      globalCrewIDs.push(crewMember.id);

   }

   function initPrevPath(crewMember) {
      $http.get("ajax/getPrevPath.php?id=" + crewMember.id).success(function(pathData, status, headers, config) {
         var path = [];
         for(var i = 0; i < pathData.length; i++) {
            var latitude = pathData[i].latitudeDegree;
            var longitude = pathData[i].longitudeDegree;
            var point = new google.maps.LatLng(latitude, longitude);
            path.push(point);
         }
         crewMember.prevPath.setPath(path);
      }).error(function(data, status, headers, config) {
         console.log("Error gleaning path data");
      });
   }



   function updateCrewMember(jsonData){
      var dest_point = getDestPoint(jsonData);
      var polyPath = getPolyPath(jsonData);
    
      //calculateDistance(jsonData.latitudeDegree,jsonData.longitudeDegree,37.615223,-122.389979); //calculate distance to SFO
      
      var crewMember = crewMembers[jsonData.id];
      crewMember.latitude = jsonData.latitudeDegree;
      crewMember.longitude = jsonData.longitudeDegree;
      crewMember.eta = parseFloat(jsonData.eta);
      crewMember.route = jsonData.route;
      crewMember.time=jsonData.timeSecond;
      crewMember.gpath.setPath(polyPath);
      crewMember.crewFlightId = jsonData.flightid;
      //crewMember.distanceToDest = distance;

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

   function parseCrewDelay(crewDelay, crewMember)
   {
      var parsedDelay = crewDelay.slice(0,8);
      //console.log("parsed crew delay: " + parsedDelay);

      var parsedMinutes = parseInt(crewDelay.slice(5,8));
      //console.log("parsed minutes: " + parsedMinutes);

      /*Set crew delay status*/
      if(parsedMinutes <= 10)
      {
         crewMember.delayStatus = "green";
         crewDelayStatus = crewMember.delayStatus;
      }
      else if(crewDelay > 10 && crewDelay <= 30)
      {
         crewMember.delayStatus = "yellow";
         crewDelayStatus = crewMember.delayStatus;
      }
      else
      {
         crewMember.delayStatus = "red";
         crewDelayStatus = crewMember.delayStatus;
      }

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
   }

   function makeAirportWindowContent(airport) {
      var content = "<div class =\"infoWindow\"> " + airport.airportId;
      return content;
   }
   
   //used to add/remove markers, sets map to gmap or null
   function addRemoveAllMarkers(add) {
      var map = null;
      if(add){map = gmap;}
      //marker.setMap(gmap);
      angular.forEach(airports, function(airport, id) {
         airport.airportMarker.setMap(map);
      });
      angular.forEach(crewMembers, function(crewMember, id) {
         crewMember.gmarker.setMap(map);
         //crewMember.gpath.setMap(map);
      });
   }

   function updateMap(){
  
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