'use strict';


/* Declare app level module which depends on filters, and services */
var flightCrewApp = angular.module('FlightCrewApp', [
  'ngRoute',
  'FlightCrewApp.filters',
  'FlightCrewApp.services',
  'FlightCrewApp.directives', 
  'FlightCrewApp.controllers',
  'google-maps',
  'ui.bootstrap'
], 
  function($httpProvider) 
  {
  // Use x-www-form-urlencoded Content-Type
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

  /**
   * The workhorse; converts an object to x-www-form-urlencoded serialization.
   * @param {Object} obj
   * @return {String}
   */ 
  var param = function(obj) {
    var query = '', name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null)
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  //Override $http service's default transformRequest
  $httpProvider.defaults.transformRequest = [function(data) 
  {
    return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
  }];
  
});

/* an alternative way to do globals
flightCrewApp.factory('Global', function(){
  return {};
 });
*/

flightCrewApp.run(function($rootScope) {
  $rootScope.zoomGlobal = 4;
  var USCenter = {k: 32.8282, B: -98.5795};
  $rootScope.centerGlobal = USCenter;
});
      

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

	/* route for playback */
	.when('/playback', { 
		templateUrl : 'partials/historical-playback.html',
		controller : 'playbackController'
	})

  .when('/progress', {
    templateUrl : 'partials/progress.html',
    controller : 'progressController'
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


