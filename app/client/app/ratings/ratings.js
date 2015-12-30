angular.module('travel.ratings', ['ui.bootstrap', 'ngAnimate'])

.controller('RatingsController', function ($scope, $window, $rootScope, $state,
      $uibModal, CurrentInfo, MoreInfo, Venues, Groups, Util) {
  // begin moreInfo modal config:
  angular.extend($scope, MoreInfo);
  $scope.initMoreInfoState();

  $scope.openModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/ratings/moreInfo.html',
      controller: 'RatingsController',
    });
  };
  // end moreInfo modal config


  $scope.filteredUserRatings = [];
  $scope.filteredGroupRatings  = [];
  $scope.city = $rootScope.destination;
  $scope.heading = null;
  $scope.allVenuesRatings = [];
  $scope.groups = [];

  // For user add rating
  $scope.ratings = {};
  $scope.max = 10;
  $scope.isReadonly = false;
  $scope.showRatings = {};


  ////////////////// GET ALL THE GROUPS OF A USER //////////////////////


  $scope.getUserGroups = function() {
    Groups.getUserGroups($scope);
  };


  ////////////////// SELECTING A GROUP WILL REROUTE TO RATINGS //////////////////////


  $scope.selectGroup = Groups.selectGroup(function () {
    $state.go('ratings');
  });


  ////////////////// FILTER FOR RESTAURANTS/ATTRACTIONS/HOTELS //////////////////////


  $scope.filterRatings = function (venueTypeId) {
    if (!$scope.allVenuesRatings.length) return;

    Util.setHeading($scope, venueTypeId);

    var filteredRatings = Util.filterRatingsByVenueType($scope.allVenuesRatings,
                                                        venueTypeId);
    $scope.filteredUserRatings = [];
    $scope.filteredGroupRatings = [];

    filteredRatings.forEach(function (ratingObj) {
      $scope.addAvg(ratingObj);

      ratingObj.allRatings.forEach(function (rating) {
        if (rating.user === $rootScope.currentUser._id) {
          ratingObj.currentRating = rating.userRating;
          $scope.filteredUserRatings.push(ratingObj);
        } else {
          $scope.filteredGroupRatings.push(ratingObj);
        }
      });
    });
  };


  ////////////////// ADD AVERAGES FOR A VENUE //////////////////////


  $scope.addAvg = function (ratingObj) {
    var total = 0;
    var numberofRatings = 0;
    ratingObj.allRatings.forEach(function(rating){
      if (rating.userRating !== 0) {
        total += rating.userRating;
        numberofRatings ++;
      }
    });
    ratingObj.avgRating = (total / numberofRatings) || 0;
  };


  ////////////////// USER ADD RATING //////////////////////


  $scope.hoveringOver = function(value, id) {
    $scope.showRatings[id] = value;
  };

  $scope.addRating = function(ratingObj, newRating) {
    ratingObj.allRatings.forEach(function (userRating) {
      if (userRating.user === $rootScope.currentUser._id) {
        userRating.userRating = newRating;
      }
    });
    $scope.addAvg(ratingObj);

    Venues.addRating(ratingObj.venue, newRating);
  };


  ////////////////// ADMIN ONLY //////////////////////


  $scope.addToItin = Venues.addToItinerary;


  ////////////////// INIT STATE //////////////////////


  Venues.setRatings($scope);


});
