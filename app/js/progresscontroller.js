'use strict';

var flightCrewAppControllers = angular.module('FlightCrewApp.controllers');

flightCrewAppControllers.controller('progressController',['$scope','$http','$interval', '$q','$rootScope', function($scope, $http, $interval, $q, $rootScope) {

  $scope.passengers = {};

   function location(l){
      var location = l;
      switch (l) {
         case "1":
            location = "Check-In";
            break;
         case "2":
            location = "Security";
            break;
         case "3":
            location = "Gate";
            break;
     }
     return location;
  }

   function eta(l){
      var eta = l;
      switch (l) {
         case "1":
            eta = 40*60*1000;
            break;
         case "2":
            eta = 20*60*1000;
            break;
         case "3":
            eta = 0;
            break;
     }
     return eta;
  }

   function time(t){
      /*
      var hours = parseInt( t / 3600 ) % 24;
      var minutes = parseInt( t / 60 ) % 60;
      var seconds = parseInt(t % 60, 10);
      var hms = hours + ":" + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);
      //return hms; */
      var dateT = new Date(t *1);
      return dateT.toLocaleTimeString(); //+ " "+ dateT.toLocaleDateString(); 
  }

  function update(){
      $http.get("ajax/getProgressIDs.php").success(function(Ids,status,headers,config){
         var deferred = $q.defer();
         var promises = [];
         function lastTask(temp){
            deferred.resolve();
            $scope.passengers = temp;
         }
         $scope.status = status;

         var temp = [];
         
         for (var i=0; i<Ids.length; i++) {
            //console.log(crew[i].id);
            promises.push(
               $http.get("ajax/getLatestProgress.php?id="+Ids[i].id).success(function(data,status,headers,config){
                  $scope.status = status;  

                  if(data[0] != undefined && data[0] != null)
                  { 
                     var passenger = 
                     {
                        id : data[0].id,
                        location : location(data[0].locationid),
                        time : time(data[0].time),
                        eta : time((parseInt(data[0].time) + eta(data[0].locationid)) + "")
                     };
                  } else {
                     console.log("no passengers!");
                  }

                  temp.push(passenger);
               
               }).error(function(data, status, headers, config){
                  $scope.status = status;
                  console.log(data);
               })
            );
         }
         $q.all(promises).then(lastTask(temp));

         //$scope.passengers = temp;

      }).error(function(data, status, headers, config){
         $scope.status = status;
         console.log(data);

      });
   }

   $interval(function () {
      update();
   }, 5000);


}]); //end

