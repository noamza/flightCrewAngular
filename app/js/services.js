'use strict';

/* Services */
// Demonstrate how to register services
// In this case it is a simple value service.
var FlightCrewAppServices = angular.module('FlightCrewApp.services', []).
  value('version', '0.1');


/*
var promises = [];

angular.forEach(array, function(index) {
  promises.push(Resource.query(...));
});

$q.all(promises).then(function(result1, result2, result3 ...) {
  // do stuff with result1, result2 ... or
  // var results = Array.prototype.slice.call(arguments);
});
*/