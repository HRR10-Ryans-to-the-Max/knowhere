angular.module('travel.results', ['ui.bootstrap', 'ngAnimate'])

.controller('ResultsController', function ($scope, $window, $rootScope, $state, $uibModal, CurrentInfo, Venues, Groups, Util) {
  $scope.venues = [];
  $scope.filteredVenues = [];
  $scope.city = $rootScope.destination;
  $scope.heading = null;
  $scope.groups = [];
  // Sets image carousel interval
  $scope.myInterval = 5000;
  $scope.noWrapSlides = false;
  $scope.detailedInfo = $rootScope.detailedInfo;


  ////////////////// GET ALL THE GROUPS OF A USER //////////////////////


  $scope.getUserGroups = function() {
    Groups.getUserGroups($scope);
  };


  ////////////////// SELECTING A GROUP WILL REROUTE TO RESULTS PAGE //////////////////////


  $scope.selectGroup = Groups.selectGroup(function () {
    $state.go('results');
  });


  ////////////////// FILTER FOR RESTAURANTS/ATTRACTIONS/HOTELS //////////////////////


  $scope.filterVenues = function (venueTypeId) {
    // set heading to appropriate value
    Util.setHeading($scope, venueTypeId);

    // populate venues with appropriate results
    $scope.filteredVenues = Util.filterVenues($scope.venues, venueTypeId);
  };


  ////////////////// GET ALL VENUES BASED ON A DESTINATION CITY //////////////////////


  $scope.getVenuesOfDestination = function (destinationId) {
    if (!destinationId) return;

    var query = {
      destinationId: destinationId
    };
    Venues.getVenues(query)
      .then(function(venuesInfo) {
        if (!Array.isArray(venuesInfo)) return;

        CurrentInfo.destination.venues = $scope.venues = venuesInfo;
        $scope.filterVenues(1);
      })
      .catch(function(error){
        console.error(error);
      });
  };


  ////////////////// GET DETAILED INFO OF A VENUE //////////////////////


  $scope.getDetailedVenueInfo = function(venueId) {
    var query = {
      venueId : venueId
    };
    Venues.getDetailedVenueInfo(query)
      .then(function(venueInfo) {
        $rootScope.detailedInfo = $scope.detailedInfo = venueInfo;
        $scope.openModal();
      })
      .catch(function(error){
        console.error(error);
      });
  };
  $scope.exit = function(){
    $uibModalInstance.close();
  };
  $scope.openModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/results/venueInfo.html',
      controller: 'ResultsController',
    });
  };


  ////////////////// ADD TO RESULT LIST //////////////////////


  $scope.addToRatings = function(venueInfo) {
    Venues.addRating(venueInfo, null);
  };

  $scope.addToRatingsMain = function(venueId) {
    var query = {
      venueId : venueId
    };
    Venues.getDetailedVenueInfo(query)
      .then(function(venueInfo) {
        Venues.addRating(venueInfo, null);   
      })
      .catch(function(error){
        console.error(error);
      });
  };


  ////////////////// INIT STATE //////////////////////


  $scope.getUserGroups();
  $scope.getVenuesOfDestination($rootScope.destination.id);
});
