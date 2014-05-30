'use strict';

/* Filters */

/*
var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');
var flightCrewAppControllers = angular.module('FlightCrewApp.controllers', []);
*/

angular.module('FlightCrewApp.filters', [])
  	.filter('interpolate', ['version', function(version) {
    	return function(text) {
      		return String(text).replace(/\%VERSION\%/mg, version);
    	};
  	}])
  	
  	.filter('makeArray', function() {
  		return function(items) {
    		var filtered = [];
    		//console.log("filtering " + items );

    		angular.forEach(items, function(obj, id) {
    			//console.log();
      			filtered.push(obj);
    		});
   			return filtered;
  		};
	});
	


//app