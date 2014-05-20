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
flightCrewAppControllers.controller('mapController',['$scope','$http', function($scope, $http) {
		//turn into sevice
	$http.get("ajax/getRecord.php").success(function(data,status,headers,config){
        $scope.picked = data[0].id;
        $scope.status = status;
    }).error(function(data, status, headers, config){
    	$scope.status = status;
	});

	$http.get("ajax/getCrew.php").success(function(data){
        $scope.crew = data;
    });
	
	$scope.map = {
    	center: {
        	latitude: 45,
        	longitude: -73
    	},
    	zoom: 8
	};
}]);

//about
flightCrewAppControllers.controller('aboutController',['$scope','$http', function($scope, $http) {

	$http.get("ajax/getCrew.php").success(function(data){
        $scope.crew = data[0].id;
       });
	$scope.message = 'Everyone come and see all about us';
}]);

//contact
flightCrewAppControllers.controller('contactController',['$scope', function($scope) {
	$scope.message = 'Contact us';
}]);








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
/*
phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Phone', function($scope, Phone) {
  
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';
  }]);
*/

/* Controllers */
/*
angular.module('FlightCrewApp.controllers', [])
  .controller('MyCtrl1', ['$scope', function($scope) {

  }])
  .controller('MyCtrl2', ['$scope', function($scope) {

  }]);
*/
// create the module and name it scotchApp


/* Controllers */
/*
var phonecatControllers = angular.module('phonecatControllers', []);

phonecatControllers.controller('PhoneListCtrl', ['$scope', 'Phone',
  function($scope, Phone) {
    $scope.phones = Phone.query();
    $scope.orderProp = 'age';
  }]);

phonecatControllers.controller('PhoneDetailCtrl', ['$scope', '$routeParams', 'Phone',
  function($scope, $routeParams, Phone) {
    $scope.phone = Phone.get({phoneId: $routeParams.phoneId}, function(phone) {
      $scope.mainImageUrl = phone.images[0];
    });

    $scope.setImage = function(imageUrl) {
      $scope.mainImageUrl = imageUrl;
    }
  }]);
*/

