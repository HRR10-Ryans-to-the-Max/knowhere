angular.module('travel.ratings', ['ui.bootstrap', 'ngAnimate'])

.controller('RatingsController', function ($scope, $window, $rootScope, $state, $uibModal, CurrentInfo, Venues, Groups, Util) {
  $scope.filteredUserRatings = [];
  $scope.filteredGroupRatings  = [];
  $scope.city = $rootScope.destination;
  $scope.heading = null;
  $scope.allVenuesRatings = [];
  $scope.groups = [];
  $scope.ratingsInfo = $rootScope.ratingsInfo;
  $scope.phoneHide = $rootScope.phoneHide;

  // For add rating
  $scope.ratings = {};
  $scope.max = 10;
  $scope.isReadonly = false;
  $scope.showRatings = {};

  // For image carousel
  $scope.myInterval = 5000;
  $scope.noWrapSlides = false;


  ////////////////// GET ALL THE GROUPS OF A USER //////////////////////


  $scope.getUserGroups = function() {
    Groups.getUserGroups($scope);
  };


  ////////////////// SELECTING A GROUP WILL REROUTE TO RATINGS //////////////////////


  $scope.selectGroup = Groups.selectGroup(function () {
    $state.go('ratings');
  });


  ////////////////// FILTER FOR RESTAURANTS/ATTRACTIONS/HOTELS //////////////////////


  //FIXME: need updated data response object
  $scope.filterRatings = function (venueTypeId) {
    if (!$scope.allVenuesRatings.length) return;

    // set heading to appropriate value
    Util.setHeading($scope, venueTypeId);

    var filteredVenues = Util.filterVenues($scope, venueTypeId);

    filteredVenues.forEach(function (ven) {
      ven.allRatings.forEach(function (rating) {
        if (rating.user === $rootScope.currentUser._id) {
          ven.currentUserRating = rating;
          $scope.filteredUserRatings.push(ven);
        } else {
          $scope.filteredGroupRatings.push(ven);
        }
      });
    });
    // TODO remove this hack
    $rootScope.mockData = $scope.filteredUserRatings;
    // console.log($scope.filteredUserRatings);
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


  ////////////////// GET ALL RATINGS OF THE GROUP //////////////////////


  $scope.getRatings = function() {
    var query = {
      userId : $rootScope.currentUser._id,
      groupId : $rootScope.currentGroup._id
    };
    Venues.getRatings(query)
      .then(function(venuesInfo){
        console.log(venuesInfo);
        $scope.allVenuesRatings = venuesInfo;
        $scope.filterRatings(1);
      });
  };


  ////////////////// USER ADD RATING //////////////////////


  $scope.hoveringOver = function(value,id) {
    $scope.showRatings[id] = value;
  };

  $scope.addRating = function(ratingObj, newRating) {
    ratingObj.allRatings.forEach(function(rate) {
      if (rate.user === $rootScope.currentUser._id) {
        rate.userRating = newRating;
      }
    });
    $scope.addAvg(ratingObj);

    Venues.addRating(ratingObj.venue, newRating);
  };


  ////////////////// GET DETAILED INFO OF A VENUE //////////////////////


  $scope.getDetailedVenueInfo = function(venue) {
    if (venue.venue.telephone === null) {
      $rootScope.phoneHide = true;
    } else {
      $rootScope.phoneHide = false;
    }
    $rootScope.ratingsInfo = venue;
    $scope.ratingsInfo = venue;
    $scope.openModal();
  };
  $scope.exit = function(){
    $uibModalInstance.close();
  };
  $scope.openModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/ratings/moreInfo.html',
      controller: 'RatingsController',
    });
  };


  ////////////////// ADMIN ONLY //////////////////////


  $scope.addtoItin = function(venueData) {
    var data = {
      venue : venueData,
      userId : $rootScope.currentUser._id,
      groupId : $rootScope.currentGroup._id,
      startDate : null,
      endDate : null
    };
    Venues.addtoItinerary(data);
  };


  ////////////////// INIT STATE //////////////////////


  $scope.getRatings();

});