'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers', ["wijmo"]);
// create the controller and inject Angular's $scope
flightCrewAppControllers.controller('mainController', ['$scope', function($scope) {
// create a message to display in our view

}]);


//about
flightCrewAppControllers.controller('aboutController',['$scope','$http', function($scope) {

	$scope.message = 'About us';
  
}]);



//contact
flightCrewAppControllers.controller('contactController',['$scope', function($scope) {
	$scope.message = 'Contact us';

  setInterval(function() { updateMap();}, 5000); 


}]);

//contact
flightCrewAppControllers.controller('contactController',['$scope', function($scope) {
  $scope.message = 'Contact us';

  setInterval(function() { updateMap();}, 5000); 


}]);




