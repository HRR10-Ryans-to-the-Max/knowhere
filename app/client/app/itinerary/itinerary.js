angular.module('travel.itinerary', ['ui.bootstrap', 'ngAnimate'])

.controller('ItineraryController', function ($scope, $window, $rootScope, $state,
      $uibModal, CurrentInfo, MoreInfo, Venues, Groups, Util) {
  // begin moreInfo modal config:
  angular.extend($scope, MoreInfo);
  $scope.initMoreInfoState();

  $scope.openModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/itinerary/moreInfo.html',
      controller: 'ItineraryController',
    });
  };
  // end moreInfo modal config.

  $scope.restaurants = [];
  $scope.attractions = [];
  $scope.hotels = [];
  $scope.city = $rootScope.destination;
  $scope.heading = null;
  $scope.fullItinerary = [];
  $scope.groups = [];


  ////////////////// GET ALL THE GROUPS OF A USER //////////////////////


  $scope.getUserGroups = function() {
    Groups.getUserGroups($scope);
  };


  ////////////////// SELECTING A GROUP WILL REROUTE TO ITINERARY //////////////////////


  $scope.selectGroup = Groups.selectGroup(function () {
    $state.go('itinerary');
  });


  ////////////////// FILTER FOR RESTAURANTS/ATTRACTIONS/HOTELS //////////////////////


  $scope.filterItinerary = function (venueTypeId) {
    Util.setHeading($scope, venueTypeId);

    $scope.filteredItinerary = Util.filterRatingsByVenueType($scope.fullItinerary,
                                                             venueTypeId);
  };


  ////////////////// SHOW FULL ITINERARY //////////////////////


  $scope.showFullItinerary = function() {
    $scope.heading = "Full Itinerary";
    $scope.filteredItinerary = $scope.fullItinerary;
  };


  ////////////////// ADD TO ITINERARY - ADMIN ONLY//////////////////////


  $scope.addDatesToItinerary = Venues.addToItinerary;


//////////////////INIT STATE//////////////////////


  Venues.getItinerary()
    .then(function (ratingsObjs) {
      $scope.fullItinerary = ratingsObjs;
      $scope.filterItinerary(1);
    })
    .catch(function (error) {
      console.error(error);
    });


});
