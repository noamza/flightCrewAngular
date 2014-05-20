'use strict';


/* Declare app level module which depends on filters, and services */
var flightCrewApp = angular.module('FlightCrewApp', [
  'ngRoute',
  'FlightCrewApp.filters',
  'FlightCrewApp.services',
  'FlightCrewApp.directives', 
  'FlightCrewApp.controllers',
  'google-maps',
]);

flightCrewApp.config(['$routeProvider', 
	function($routeProvider) {
	$routeProvider
/* route for the home page */
	/**/
	.when('/', {
		templateUrl : 'partials/map.html',
		controller  : 'mapController'
	})
	/**/
	/* route for the about page /**/
	.when('/about', {
		templateUrl : 'partials/about.html',
		controller  : 'aboutController'
	})

	/* route for the contact page /**/
	.when('/contact', {
		templateUrl : 'partials/contact.html',
		controller  : 'contactController'
	})

	.otherwise({ //CHEEECKKK NEEDS CONTROLLER?
		redirectTo: 'partials/map.html'
		});
}]);
/*
.
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {templateUrl: 'partials/partial1.html', controller: 'MyCtrl1'});
  $routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);
*/


