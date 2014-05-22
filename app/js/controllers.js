'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers', []);
// create the controller and inject Angular's $scope
flightCrewAppControllers.controller('mainController', ['$scope', function($scope) {
// create a message to display in our view

}]);

//maps
flightCrewAppControllers.controller('_testmapController', ['$scope', function($scope) {
// create a message to display in our view
	hello();
	//maps();
}]);

//map
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
        , zoom: 8
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
    $scope.map.dynamicMarkers = [
      {
        id: 1,
        latitude: 46,
        longitude: -79,
        showWindow: false
      },
      {
        id: 2,
        latitude: 33,
        longitude: -79,
        showWindow: false
      },
      {
        id: 3,
        icon: 'img/plane.png',
        latitude: 35,
        longitude: -127,
        showWindow: false
      }
    ];

    $scope.map.zoom = $scope.map.zoom +1;

  }, 2000);

  //end map

}]);

//about
flightCrewAppControllers.controller('aboutController',['$scope','$http', function($scope, $http) {

	$scope.message = 'Everyone come and see all about us';
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
          console.log('getLatestCrew '+data);
          var crewMember = data[0];
          crewArr.push(data);
          var eta = crewMember.eta;
          var route = crewMember.route;
          var lat = crewMember.latitudeDegree;
          var lon = crewMember.longitudeDegree;
          var time = crewMember.timeSecond;
          var id = crewMember.id;
          console.log("fn " + id);
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

  }).error(function(data, status, headers, config){
      $scope.status = status;
      console.log(data);
  });
  
}]);



//contact
flightCrewAppControllers.controller('contactController',['$scope', function($scope) {
	$scope.message = 'Contact us';

  setInterval(function() { updateMap();}, 5000); 


}]);



function updateMap(){

}

function secToHMS(totalSec) {
  var hours = parseInt( totalSec / 3600 ) % 24;
  var minutes = parseInt( totalSec / 60 ) % 60;
  var seconds = parseInt(totalSec % 60, 10);
  var hms = hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
  return hms;
}

function markers(){
/*
 var polyPath = [];
for (var jindex=0; jindex<numPoints;jindex++){ 
          var point = route[jindex].split(",");
          polyPath.push(new google.maps.LatLng(point[0], point[1]));
        }

        var flightPath = new google.maps.Polyline({
          path: polyPath,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 2
        });

        flightPath.setMap(map);
        markersArray.push(posMarker);
        polyLinesArray.push(flightPath);


  var etaRequest = {
          origin: pos, destination:SFO, 
          travelMode:google.maps.DirectionsTravelMode.DRIVING
        };
        directionsService.route(
          etaRequest,function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              var eta = response.routes[0].legs[0].duration.value;
        }});
        var markerInfo = new google.maps.InfoWindow({
          content:contentString
        });
        google.maps.event.addListener(posMarker, 'click', 
          function() {
            map.setCenter(posMarker.getPosition());
            markerInfo.open(map,posMarker);
        });        
*/
}




/*
//angular http way
$http.post("http://example.appspot.com/rest/app", {"foo":"bar"})
.success(function(data, status, headers, config) {
    $scope.data = data;
}).error(function(data, status, headers, config) {
    $scope.status = status;
});



//service
function($q, $http, ...) {    
    return {
        getData: function() {
            var defer = $q.defer();
            $http.get('/getdata.php', { cache: 'true'})
            .success(function(data) {
                defer.resolve(data);
            });

            return defer.promise;
    };
}

//controller
function($scope, YourService) {
    YourService.getData().then(function(data) {
        $scope.data = data;
    });
}
*/





