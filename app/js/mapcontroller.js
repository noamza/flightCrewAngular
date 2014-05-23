
'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');

function InfoController($scope, $log) {
   $scope.templateValue = 'hello from the template itself';
   $scope.clickedButtonInWindow = function () {
      var msg = 'clicked a window in the template!';
        $log.info(msg);
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

flightCrewAppControllers.controller('mapController',['$scope','$http','$interval', function($scope, $http, $interval) {
	

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
       , markers:
        {
          id: 1,
          latitude: 38,
          longitude: -122,
          showWindow: false,
          title: 'Marker 1'
        }
       , infoWindow: {
            coords: {
               latitude: 37.270850,
               longitude: -122.296875
            },
            options: {
               disableAutoPan: true
            },
            show: true
         }  
   };

   var onMarkerClicked = function (marker) {
      marker.showWindow = true;
      $scope.$apply();
      //window.alert("Marker: lat: " + marker.latitude + ", lon: " + marker.longitude + " clicked!!")
   };

   function updateMarkers(markers){
      _.each(markers, function (marker) {
         marker.closeClick = function () {
            marker.showWindow = false;
            $scope.$apply();
         };
         marker.onClicked = function () {
            onMarkerClicked(marker);
         };
      });
   }

   function updateMap(){
      //turn into sevice
      $http.get("ajax/getCrewIDs.php").success(function(data,status,headers,config){
         $scope.crewIds = data;
         $scope.status = status;
         var crewIds = data;
         var crewMarkers = [];
         var crewText = {};
         console.log('hello');
           /**/
         for (var i=0; i<crewIds.length; i++) {
            //console.log(crew[i].id);
            $http.get("ajax/getLatestCrew.php?id="+crewIds[i].id).success(function(data,status,headers,config){
                //console.log('getLatestCrew '+data[0]);
                data[0];
               var crewMember = {

                  id : data[0].id,
                  eta : secToHMS(data[0].eta),
                  route : data[0].route,
                  latitude : data[0].latitudeDegree,
                  longitude : data[0].longitudeDegree,
                  icon: 'img/blue_marker.png',
                  showWindow: true,
                  templateUrl: 'partials/info.html',
                  templateParameter: { message: 'passed in from the opener'
                  },
                  closeClick : function () { showWindow = false;
                        $scope.$apply();
                  }
               }
               //console.log(id+" "+eta+" "+lat+" "+lon+" "+time+"");
               var dateT = new Date(data[0].time*1);
               
               /*
               crewMember[html] = "<div>id: " + data[0].id + "<br>lat: " + data[0].lat + "<br> lon: " + data[0].lon + "<br>time: " + dateT.toLocaleTimeString() + " "+ dateT.toLocaleDateString() + "<br>eta (h:m:s): " + secToHMS(data[0].eta) +"</div>";
               
               crewMember[time] =  dateT.toLocaleTimeString() + " "+ dateT.toLocaleDateString();
               */
               updateMarkers(crewMember);
               crewMarkers.push(crewMember);
            }).error(function(data, status, headers, config){
               $scope.status = status;
               console.log(data);

            });
         }
         /*
         var ret = {
         latitude: latitude,
         longitude: longitude,
         title: 'm' + i
         id: i;
         };
         ret[idKey] = i;
         */

         //console.log(crewArr);
         $scope.map.dynamicMarkers = crewMarkers;


      }).error(function(data, status, headers, config){
         $scope.status = status;
         console.log(data);
      });
   }
   updateMap();
   console.log("here");
   


   //update//
   $interval(function () {
      
      //updateMap();
      //genRandomMarkers(3);

   }, 2000);


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
  };

  //end map

}]); //end mao controller