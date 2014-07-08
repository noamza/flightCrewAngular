
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

flightCrewAppControllers.controller('mapController',['$scope','$http','$interval', '$q', function($scope, $http, $interval, $q) {
	
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
   var showAirports = false;
   var numFlights;
   var filteredFlights = [];
   var data = [[],[]];
   var crewCounter = 0;
   var crewData = [];
   var showSpecificCrewMembers = false;
   var directionsDisplay;
   var directionsService = new google.maps.DirectionsService();
   var googleRoute;

   $scope.crewMembers = crewMembers;
   $scope.flights = flights;
   $scope.matchingFlights = matchingFlights;
   $scope.allFlights = [];
   $scope.orderProp = 'id';
   $scope.toHMS = secToHMS;
   $scope.specificCrew = specificCrew;
   $scope.localFlights = flights;
   $scope.currAirport = "";
   $scope.currentPage = 0;
   $scope.currentPageCrew = 0;
   $scope.pageSize = 5;
   $scope.data = data;
   $scope.data.length = 0;
   $scope.crewCounter = crewCounter;
   $scope.crewData = crewData;
   $scope.googleRoute = googleRoute;
    
   $scope.numberOfPages=function()
   {
        //log("check data length: " + data.length);
        return Math.ceil(data.length/$scope.pageSize);               
   }

   $scope.numberOfPagesCrew=function()
   {
        return Math.ceil(crewData.length/$scope.pageSize);
        //return Math.ceil(crewCounter/$scope.pageSize);               
   }

   google.maps.visualRefresh = true;
   var n210 = {latitude: 37.414468, longitude: -122.056862};
   var SFO =  {latitude: 37.615223, longitude: -122.389979};
   var USCenter = {latitude: 32.8282, longitude: -98.5795};
   var USLatLng = new google.maps.LatLng(32.8282, -98.5795);

   $scope.map = {
         center: USCenter //{latitude: 37.414468, longitude: -122.056862},
       , zoom: 4
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

  /*Used to reset selected flights */
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



   $scope.crewTableClick = function(selectedCrewMember){
      //log(selectedCrewMember.id);
      var crewMember = crewMembers[selectedCrewMember.id];

      //log(crewMember);
      if(!crewMember.showWindow){//window is currently closed
            //crewMember.gwindow.open(gmap, crewMember.gmarker);
            google.maps.event.trigger(crewMember.gmarker, 'click');
            crewMember.showWindow = true;
      } else { //window is open
         //crewMember.gwindow.close();
         markerCloseClick(crewMember);
         //google.maps.event.trigger(crewMember.gmarker, 'closeclick');
         //crewMember.showWindow = false;
      }
      log("tableClick more like " + crewMember.showWindow);
   };
   
   /* Centers the map on a crewmember and zooms in. Only applies when the 
      row corresponding to the crewmember on the map table is clicked */
   $scope.trackCrewMember = function(crew) { //maybe open window here?
    // gmap.panTo(crew.position);
    // gmap.setZoom(9);
    //var crewMember = getCrewFromID(crew.id;
    //can add stuff to zoom in + open infowindow/path info on crew.
   }

   /* Given a crew ID, iterates through the list containing all crew members
      to find the object that corresponds to said ID.
   */
   function getCrewFromID(id) {
      var crew = null;
      angular.forEach(crewMembers, function(crewMember) {
        if(crewMember.id = id)
            crew = crewMember;
      });
      return crew;
   }

   /*
      When a flight is clicked, populates the crew table at the bottom. 
      NOTE: The click events are linked to the "ng-click" things in the actual
      HTML.
   */

   $scope.populateCrewTable = function(flight) {

    specificCrew = {}; //clears out old entries in case there is something already there
    $scope.crewData = [];

    log("clear crew table: " + flight.flightId + ": " + flight.crew);
    
    $scope.selectedFlights=flight.flightId;
    selectedFlight = flight.flightId;

    getSpecificCrew();
   }
 

   function initAirportMarkers() {
      log("init airport markers");
      directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(gmap);
      
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
              $scope.selectedFlights = "";
              $scope.specificCrew.length = 0;
              // gmap.panTo(marker.position);
              // gmap.setZoom(8);
              angular.forEach(airports, function(airport) {
                airport.gwindow.close();
              });
              infoWindow.content = makeAirportWindowContent(airport);
              infoWindow.open(gmap, marker);
              airport.showWindow = true;
              $scope.localFlights = getFlightsForAirport(marker.title);
              //hideOtherAirports(marker.title);
              $scope.currAirport = marker.title;
              showCrewForAirport(marker.title);
             });
            google.maps.event.addListener(infoWindow,'closeclick',function(){ //resets the view when the window is closed.
               airport.showWindow = false;
               //showHideAirportMarkers($scope.showAirports); //messes up the window for some reason
               showHideAllCrew(false);
               // gmap.panTo(USLatLng);
               // gmap.setZoom(4);        
               $scope.currAirport="";
               $scope.localFlights = flights;
               $scope.selectedFlights="";
               $scope.specificCrew = {}; //I don't know if this is necessary, but just to be safe...
            });
            airports[airport.airportId]=airport;
          });
        });
    $scope.showAirports = true;
   }

   /*
      Given an array of flight structs, returns an array containing the IDs of 
      all flight structs in the input array.
    */
   function getFlightIDsFromFlights(flights) {
      var flightIDs = [];
      for(var i = 0; i < flights.length; i++) {
        flightIDs.push(flights[i].flightId);
      }
      return flightIDs;
   }

   /*
      Hides all airports on the map except for the one with the given ID.
      (I don't think this is actually used, but may be helpful.)
   */
   function hideOtherAirports(id) {
    //log(id);
    showHideAirportMarkers(false);
    angular.forEach(airports, function(airport) {
      if(airport.airportId == id) {
        airport.airportMarker.setMap(gmap);
      }
    });
   }

   /*
      Given an airport ID, displays the crews of all flights that are departing 
      that airport. Maybe this shouldn't be used since it will create a lot of clutter.
   */
   function showCrewForAirport(id) {
      var localCrew = getCrewIDsForAirport(id);
      //log(localCrew.toString());
      hideOtherCrew(localCrew);
   }

   /*
      Given an array of crewIDs, displays only the markers for the crew members in said
        array (i.e. every marker not in the array of crewIDs is hidden).
   */
   function hideOtherCrew(ids) {
      showHideAllCrew(false);

      /* REDO THIS SECTION IF POSSIBLE; THIS IS O(mn) 
          Note: this would probably require some significant
          data restructuring */
      angular.forEach(ids, function(id) {

        angular.forEach(crewMembers, function(crewMember) {
          if(crewMember.id==id)
            crewMember.gmarker.setMap(gmap);
        });
      });
   }

   /*
      Returns an array of all IDs that correspond to some flight which has a departureAirport
      associated with the input ID.
   */
   function getCrewIDsForAirport(id) {
      var localCrew = [];
      angular.forEach(flights, function(flight) {
      if(flight.departureAirport== "K" + id) {
        for(var i = 0; i < flight.crew.length; i++)
          if(flight.crew[i])
            localCrew.push(flight.crew[i]);
        }
      });
      return localCrew;
   }

   /*
      Returns an array containing the flight STRUCTS with departureAirport == id 
      (i.e. the input id).
   */
   function getFlightsForAirport(id) {
      var localFlights = [];
      angular.forEach(flights, function(flight) {
      if(flight.departureAirport== "K" + id) {
        localFlights.push(flight);
      }
      });

      $scope.data.length = localFlights.length;
  
      return localFlights;
   }

   //add error handeling
   function initMarkers(){
      log("init markers once");
      $http.get("ajax/getCrewIDs.php").success(function(crewIds,status,headers,config){
         var deferred = $q.defer();
         var promises = [];
         function lastTask(){
            deferred.resolve();
            //addRemoveAllMarkers(true);
            showHideAirportMarkers(true);
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

      var crewIDs = [];

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
            crew: crewIDs //added this so we don't have to iterate across everything every single time
         };

      addCrewIDs(flight);
      flights[flight.flightId]=flight;
      
   }

   /*
    Adds the crew IDs to the associated flight struct (under crew; will be an array populated with
    the corresponding crew IDs).
   */
  function addCrewIDs(flight) {
    $http.get("ajax/getCrewFromFlight.php?flightid=" + flight.flightId).success(function(jsonData, status, headers, config) {
         for(var i = 0; i < jsonData.length; i++) {
            flight.crew.push(jsonData[i].id);
         }
         //log(flight.flightId + ": " + flight.crew.toString());
      }).error(function(data, status, headers, config) {
         console.log("Error gleaning crew ids data");
      });
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

      //reset();

   }

   function getSpecificCrew()
   {
      showHideAllCrew(false); 
      for(var i=0; i<globalCrewIDs.length; i++) 
      {
         specificCrewMember = crewMembers[globalCrewIDs[i]];

         farValue = calculateFAR();

         if(specificCrewMember.crewFlightId == selectedFlight)
         {
            crewCounter++;
            var latitude = specificCrewMember.latitude;
            var longitude = specificCrewMember.longitude;
            calculateDistance(latitude, longitude,37.615223,-122.389979);
            //log("specific crew distance: " + distance);

            specificCrewMember = 
            {
                  id: specificCrewMember.id,  
                  eta : specificCrewMember.eta,
                  route : specificCrewMember.route,
                  crewFlightId : specificCrewMember.crewFlightId,
                  crewDelay : specificCrewMember.crewDelay,
                  delayStatus : specificCrewMember.delayStatus,
                  far : farValue,
                  distanceToDest : distance,
                  position : new google.maps.LatLng(latitude, longitude),
                  latitudeDegree : specificCrewMember.latitude,
                  longitudeDegree : specificCrewMember.longitude,
                  gmarker: new google.maps.Marker({
                  position: new google.maps.LatLng(
                     specificCrewMember.latitude, 
                     specificCrewMember.longitude),
                  title:specificCrewMember.id,
                  icon:'img/mapIconSmall.svg'
               }),
            }

            specificCrew[specificCrewMember.id] = specificCrewMember;  
            
            $scope.crewData.push(specificCrewMember); //for pagination in the crew control table
            log("check crewData length: " + crewData.length + " id: " + specificCrewMember.id);

            //log("check crew id and flight id: " + specificCrewMember.id + " " + specificCrewMember.crewFlightId);
         }
      }
      $scope.specificCrew = specificCrew;

      var currFlight = getFlightByID(selectedFlight);
      hideOtherCrew(currFlight.crew);
      saveCrewIDs = globalCrewIDs.slice(0); //copies contents to saveCrewIDs

      $scope.crewCounter = crewCounter; 
      log("Number of crew members: " + crewCounter);

   } 

   /*
    Obtains the flight struct that corresponds to the input ID (i.e. flight.flightID == id).
   */
   function getFlightByID(id) {
    var currFlight = null;
    angular.forEach(flights, function(flight) {
      if(flight.flightId==id) {
        currFlight = flight;
      }
    });
    return currFlight;
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
              //console.log("distance check: " + distance);
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
      // var destLat = point[0];
      // var destLon = point[1];
      // log("lat: " + destLat);
      // log("lon: " + destLon);

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
   
   function addCrewMember(jsonData)
   {
      var dest_point = getDestPoint(jsonData);

      calculateRoute(jsonData, dest_point, function(result)
      {
          log("Google route: " + result);
      });

      
      var polyPath = getPolyPath(jsonData);
      //log("polyPath: " + polyPath);
      var prevPath = [];
      farValue = calculateFAR();

      var crewMember = {
         id : jsonData.id,
         eta : parseFloat(jsonData.eta),
         route :  jsonData.route,
         latitude : jsonData.latitudeDegree,
         longitude : jsonData.longitudeDegree,
         time: jsonData.timeSecond,
         crewFlightId : jsonData.flightid,
         crewDelay : crewDelay,
         delayStatus : crewDelayStatus,
         far : farValue,
         showWindow: false,
         late:false,
         /*templateUrl: 'partials/info.html',*/
         destination : new google.maps.LatLng(dest_point[0], dest_point[1]),
         gmarker: new google.maps.Marker({
            position: new google.maps.LatLng(
               jsonData.latitudeDegree, 
               jsonData.longitudeDegree),
            title:jsonData.id,
            icon:'img/mapIconSmall.svg'
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
         prevPath : new google.maps.Polyline({ //basically everywhere they've been; update this with new points if need be
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
      });
      initPrevPath(crewMember);
  
      crewMembers[crewMember.id]=crewMember;

      /*check for duplicates here */
      globalCrewIDs.push(crewMember.id);

   }

   /*Calculates the route using Google Maps*/
   function calculateRoute(jsonData, dest_point, callback)
   {
     
     var start = new google.maps.LatLng(jsonData.latitudeDegree, jsonData.longitudeDegree);
     var end = new google.maps.LatLng(dest_point[0], dest_point[1]); 

     // var polyline = new google.maps.Polyline({
     //    path: [],
     //    strokeColor: '#FF0000',
     //    strokeWeight: 3
     // });
      
     // var bounds = new google.maps.LatLngBounds();
     var request = 
     {
        origin:start,
        destination:end,
        travelMode: google.maps.TravelMode.DRIVING
     };
     
     directionsService.route(request, function(result, status) 
     {
      if(status == google.maps.DirectionsStatus.OK) 
      {
          //directionsDisplay.setDirections(result);
          for(var i = 0; i < result.routes[0].legs.length; i++) 
          {
              $scope.googleRoute = result.routes[0].overview_path;
              //log("Route: " + $scope.googleRoute);

              var getRoute = function(){
                callback($scope.googleRoute);
              };

              getRoute(); 
              // var legs = result.routes[0].legs;

              // for (i=0;i<legs.length;i++) {
              //   var steps = legs[i].steps;
              //   for (j=0;j<steps.length;j++) {
              //     var nextSegment = steps[j].path;
              //     for (k=0;k<nextSegment.length;k++) {
              //       polyline.getPath().push(nextSegment[k]);
              //       bounds.extend(nextSegment[k]);
              //     }
              //   }
              // }

              // polyline.setMap(gmap);
              // gmap.fitBounds(bounds);
          }
       }
      });
   }

   function markerCloseClick(crewMember) {
      crewMember.gwindow.close();
      crewMember.gpath.setMap(null);
      crewMember.prevPath.setMap(null);
      crewMember.showWindow = false;
   }
   /*
    When the button "Show/Hide Airport Visibility" is clicked, shows the airports
    if they're hidden (and resets the zoom), or hides them if they're shown.

    This seems kind of unintuitive to use and should probably be changed. 
   */
  $scope.toggleAirportVisibility = function() {
    var map = null;
    $scope.showAirports = !$scope.showAirports;
    showHideAirportMarkers($scope.showAirports);
    if($scope.showAirports) {
      gmap.panTo(USLatLng);
      gmap.setZoom(4);     
    }
  }

  /*
    Puts all airport markers on the map if bool == true, or removes them if bool == false.
  */
  function showHideAirportMarkers(bool) {
    var map = null;
    if(bool)
        map = gmap;
    angular.forEach(airports, function(airport) {
      airport.airportMarker.setMap(map);
    });
  }

  /*
    Generates the prevPath field for a particular crewMember (i.e. all data logged for said crew member)
    prior to the starting of the application. 
  */
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
    
      calculateDistance(jsonData.latitudeDegree,jsonData.longitudeDegree,37.615223,-122.389979); //calculate distance to SFO
      
      var crewMember = crewMembers[jsonData.id];
      crewMember.latitude = jsonData.latitudeDegree;
      crewMember.longitude = jsonData.longitudeDegree;
      crewMember.eta = parseFloat(jsonData.eta);
      crewMember.route = jsonData.route;
      crewMember.time=jsonData.timeSecond;
      crewMember.gpath.setPath(polyPath);
      crewMember.crewFlightId = jsonData.flightid;
      crewMember.distanceToDest = distance;

      if(Math.random()<0.2) crewMember.late = !crewMember.late;
      var icon = 'img/mapIconSmall.svg';
      if(crewMember.late) icon = 'img/mapIconSmall.svg';

      var currPos = new google.maps.LatLng(
               jsonData.latitudeDegree, 
               jsonData.longitudeDegree);

      crewMember.gmarker.setPosition(currPos);
      crewMember.gmarker.setIcon(icon);
      var prevPath = crewMember.prevPath.getPath(); //these two lines push the new point into the traversed data
      prevPath.push(currPos);
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
      /*
      if(add){map = gmap;}
      //marker.setMap(gmap);
      angular.forEach(airports, function(airport, id) {
         airport.airportMarker.setMap(map);
      });
      angular.forEach(crewMembers, function(crewMember, id) {
         crewMember.gmarker.setMap(map);
         //crewMember.gpath.setMap(map);
      });
      */
      showHideAirportMarkers(add);
      showHideAllCrew(add);
   }

   /*
    Shows all crew members' markers on the map if bool == true, otherwise removes
    all markers from the map.
   */
   function showHideAllCrew(bool) {
    var map = null;
    if(bool) {map = gmap;}
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

}]); //end map controller
