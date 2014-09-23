'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');

flightCrewAppControllers.controller('progressController',['$scope','$http','$interval', '$q','$rootScope', function($scope, $http, $interval, $q, $rootScope) {

  var passengers = {};

  function update(){
      $http.get("ajax/getProgressIDs.php").success(function(Ids,status,headers,config){
         var deferred = $q.defer();
         var promises = [];
         function lastTask(){
            deferred.resolve();
         }
         $scope.status = status;
         
         for (var i=0; i<Ids.length; i++) {
            //console.log(crew[i].id);
            promises.push(
               $http.get("ajax/getLatestProgress.php?id="+Ids[i].id).success(function(data,status,headers,config){
                  $scope.status = status;  

                  if(data[0] != undefined && data[0] != null)
                  { 
                    console.log(data[0]);
                  }

               }).error(function(data, status, headers, config){
                  $scope.status = status;
                  console.log(data);
               })
            );
         }
         $q.all(promises).then(lastTask);

      }).error(function(data, status, headers, config){
         $scope.status = status;
         console.log(data);

      });
   }
 


   $interval(function () {
      update();
   }, 5000);


}]); //end

