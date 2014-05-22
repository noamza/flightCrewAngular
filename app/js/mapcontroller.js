
'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');

var crewArr

var rndAddToLatLon = function () {
 return Math.floor(((Math.random() < 0.5 ? -1 : 1) * 2) + 1)
}

flightCrewAppControllers.controller('mapController',['$scope','$http','$interval', function($scope, $http, $interval) {
		//turn into sevice
   $http.get("ajax/getCrewIDs.php").success(function(data,status,headers,config){
      $scope.crewIds = data;
      $scope.status = status;
      var crewIds = data;
      var crewArr = [];
      var crewText = {};
      console.log('hello');
        /**/
      for (var i=0; i<crewIds.length; i++) {
         //console.log(crew[i].id);
         $http.get("ajax/getLatestCrew.php?id="+crewIds[i].id).success(function(data,status,headers,config){
             //console.log('getLatestCrew '+data[0]);
            var crewMember = data[0];
            crewArr.push(data);
            var id = crewMember.id;
            var eta = crewMember.eta;
            var route = crewMember.route;
            var lat = crewMember.latitudeDegree;
            var lon = crewMember.longitudeDegree;
            var time = crewMember.timeSecond;
            console.log(id+" "+eta+" "+lat+" "+lon+" "+time+"");
            var dateT = new Date(time*1);
            var contentString = "<div>id: " + id + "<br>lat: " + lat + "<br> lon: " + lon + "<br>time: " + dateT.toLocaleTimeString() + " "+ dateT.toLocaleDateString() + "<br>eta (h:m:s): " + secToHMS(eta) +"</div>";
            crewText[id] = contentString;
         }).error(function(data, status, headers, config){
            $scope.status = status;
            console.log(data);

         });
      }
      $scope.crewArr = crewArr;
      $scope.crewText = crewText;
      console.log(crewArr);
   }).error(function(data, status, headers, config){
      $scope.status = status;
      console.log(data);
   });

   google.maps.visualRefresh = true;
   var n210 = {latitude: 37.414468, longitude: -122.056862};
   var SFO =  {latitude: 37.615223, longitude: -122.389979};

   $scope.map = {
         center: n210 //{latitude: 37.414468, longitude: -122.056862},
       , zoom: 3
       , control: {}
       , dragging: true
       , bounds: {}
       , envents: {}
       , options: {}
       , dynamicMarkers: []
       , markers: //crewArr
       [
      {
         id: 1,
         latitude: 37,
         longitude: -122,
         showWindow: true,
         title: 'Marker 1',
         icon: 'img/plane.png'
      },
      {
         id: 2,
         latitude: 38,
         longitude: -121,
         showWindow: true,
         title: 'Marker 2',
         icon: 'img/blue_marker.png'
      }
      ]
   };

   $interval(function () {

    //$scope.map.zoom = $scope.map.zoom +1;
    genRandomMarkers(3);

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