angular.module('travel.results', ['ui.bootstrap', 'ngAnimate'])

.controller('ResultsController', function ($scope, $window, $rootScope, $state,
      $uibModal, CurrentInfo, MoreInfo, Venues, Groups, Util) {
  // begin moreInfo modal config:
  angular.extend($scope, MoreInfo);
  $scope.initMoreInfoState();
  $scope.detailedInfo = $rootScope.detailedInfo;
  $rootScope.loading = true;
  $scope.openModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/results/venueInfo.html',
      controller: 'ResultsController',
    });
  };
  // end moreInfo modal

  $scope.headerText = 'Places to explore in ' + $rootScope.destination.name;

  $scope.venues = [];
  $scope.filteredVenues = [];
  $scope.heading = null;
  $scope.groups = [];
  console.log($rootScope.currentGroup);

  ////////////////// SELECTING A GROUP WILL REROUTE TO RESULTS PAGE //////////////////////


  $scope.selectGroup = function (groupInfo) {
    Groups.selectGroup(groupInfo, function () {
      $state.go('results');
    });
  };


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

    Venues.getVenues(destinationId)
      .then(function(venuesInfo) {
        $rootScope.loading = false;
        if (!Array.isArray(venuesInfo)) return;

        CurrentInfo.destination.venues = $scope.venues = venuesInfo;
        $scope.filterVenues(1);
      })
      .catch(function(error){
        console.error(error);
      });
  };


  ////////////////// ADD TO RESULT LIST //////////////////////


  $scope.addToRatings = function(venueInfo) {
    Venues.addRating(venueInfo, null);
  };

  $scope.addToRatingsMain = function(venueId) {
    Venues.getDetailedVenueInfo(venueId)
      .then(function(venueInfo) {
        Venues.addRating(venueInfo, null);
      })
      .catch(function(error){
        console.error(error);
      });
  };


  ////////////////// INIT STATE //////////////////////


  Groups.setUserGroups($scope);
  $scope.getVenuesOfDestination($rootScope.destination.id);
});
