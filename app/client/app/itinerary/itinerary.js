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

  $scope.headerText = 'Itinerary in ' + $rootScope.destination.name;

  $scope.restaurants = [];
  $scope.attractions = [];
  $scope.hotels = [];
  $scope.heading = null;
  $scope.fullItinerary = [];
  $scope.groups = [];


  ////////////////// SELECTING A GROUP WILL REROUTE TO ITINERARY //////////////////////


  $scope.selectGroup = Groups.selectGroup(function () {
    $state.go('itinerary');
  });


  ////////////////// FILTER FOR RESTAURANTS/ATTRACTIONS/HOTELS //////////////////////


  $scope.filterItinerary = function (venueTypeId) {
    Util.setHeading($scope, venueTypeId);

    $scope.filteredItinerary = Util.filterRatingsByVenueType($scope.fullItinerary,
                                                             venueTypeId);
    $scope.showInput = true;
    console.log($scope.filteredItinerary);
  };


  ////////////////// SHOW FULL ITINERARY //////////////////////


  $scope.showFullItinerary = function() {
    $scope.heading = "Full Itinerary";
    $rootScope.showInputModal = false;
    $scope.showInput = false;
    $scope.fullItinerary.sort(function(a,b) {
      var check1 = a.itinerary.fromDate;
      var check2 = b.itinerary.fromDate;
      return check1 - check2;
    });
    $scope.filteredItinerary = $scope.fullItinerary;
  };


  ////////////////// ADD TO ITINERARY - ADMIN ONLY//////////////////////


  $scope.addDatesToItinerary = Venues.addToItinerary;


//////////////////INIT STATE//////////////////////


  Venues.getItinerary()
    .then(function (ratingsObjs) {
      ratingsObjs.forEach(function(rating) {
        rating.itinerary.fromDate = new Date(rating.itinerary.fromDate);
        rating.itinerary.toDate = new Date(rating.itinerary.toDate);
      });
      $scope.fullItinerary = ratingsObjs;
      $scope.filterItinerary(1);
    })
    .catch(function (error) {
      console.error(error);
    });


});
