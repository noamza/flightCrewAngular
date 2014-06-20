'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers', ["wijmo"]);
// create the controller and inject Angular's $scope
flightCrewAppControllers.controller('mainController', ['$scope', function($scope) {
// create a message to display in our view
	
	//Flight Crew List
    $scope.crewList = [
      {
          Crew: {
              firstName: 'Jared',
              lastName: 'Hamilton'
          },
          delayStatus: "green",
          role: "captain",
          destination: " LAX ",
          std: " 08:20 ",
          ptd: " 08:30 ",
          delay: " +00:10",
      },
      {
          Crew: {
          firstName: 'Michael',
          lastName: 'Parker'
          },
          delayStatus: "red",
          role: "firstOfficer",
          destination: " JFK ",
          std: " 09:10 ",
          ptd: " 09:45 ",
          delay: " +00:35",
      },
      {
          Crew: {
          firstName: 'Jennifer',
          lastName: 'Ullman'
          },
          delayStatus: "yellow",
          role: "flightAttendant",
          destination: " LGA ",
          std: " 09:10 ",
          ptd: " 09:25 ",
          delay: " +00:15",
      }

    ];


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




