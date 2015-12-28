angular.module('travel.ratings', ['ui.bootstrap', 'ngAnimate'])

.controller('RatingsController', function ($scope, $window, $rootScope, $state, CurrentInfo, Venues, Groups, Util) {
  $scope.filteredUserRatings = [];
  $scope.filteredGroupRatings  = [];
  $scope.city = $rootScope.destination;
  $scope.heading = null;
  $scope.allVenuesRatings = [];
  $scope.groups = [];


  ////////////////// GET ALL THE GROUPS OF A USER //////////////////////


  $scope.getUserGroups = function() {
    Groups.getUserGroups($rootScope.currentUser._id)
      .then(function(groupsInfo){
        $scope.groups = groupsInfo;
      });
  };


  ////////////////// SELECTING A GROUP WILL REROUTE TO RESULTS PAGE //////////////////////


  $scope.selectGroup = function(groupInfo) {
    Groups.selectGroup(groupInfo, $rootScope);
    $state.go('ratings');
  };


  ////////////////// FILTER FOR RESTAURANTS/ATTRACTIONS/HOTELS //////////////////////

  //FIXME: need updated data response object
  $scope.filterRatings = function (filterType) {
    if (!$scope.allVenuesRatings.length) return;

    var venues = [];
    var groupRatings = [];
    var userRatings = [];
    var userId = $rootScope.currentUser._id;

    // set heading to appropriate value
    if (filterType === 1) {
      $scope.heading = 'Hotels';
    } else if (filterType === 2) {
      $scope.heading = 'Restaurants';
    } else if (filterType === 3) {
      $scope.heading = 'Attractions';
    }

    // populate venues with appropriate results
    // not working with groups removed this code...
    // if (favorite.userInfo === $rootScope.currentUser) {
    //   console.log(favorite.venue);
    // } else {
    //   GroupRatings.push(favorite);
    // }

    $scope.allVenuesRatings.forEach(function(ven) {
      if (ven.venue.venue_type_id === filterType) {
        venues.push(ven);
      }
    });
    venues.forEach(function(ven) {
      ven.allRatings.forEach(function(rating) {
        if (rating.user === userId) {
          ven.currentRating = rating.userRating;
        }
      });
    });
    $scope.filteredGroupRatings = groupRatings;
    $scope.filteredUserRatings  = venues;
    console.log(userRatings);
  };


  ////////////////// GET ALL RATINGS OF THE GROUP //////////////////////


  $scope.getRatings = function() {
    var userId = $rootScope.currentUser._id;
    var groupId = $rootScope.currentGroup._id;
    var query = {
      userId : userId,
      groupId : groupId
    };
    Venues.getRatings(query)
      .then(function(venuesInfo){
        console.log(venuesInfo);
        $scope.allVenuesRatings = venuesInfo;
        $scope.filterRatings(1);
      });
  };

  // $scope.fetchUserFavorites = function () {
  //   var userId = $rootScope.currentUser._id;
  //   Venues.getUserFavorites(userId)
  //   .then(function(favorites) {
  //     $scope.allVenuesRatings = favorites;
  //     console.log('favorites', $scope.allVenuesRatings);
  //     $scope.filterRatings(1);
  //   });
  // };


  ////////////////// USER ADD RATING //////////////////////


  $scope.ratings = {};
  $scope.max = 10;
  $scope.isReadonly = false;

  $scope.addRating = function(venueData, rating) {
    var data = {
      venue : venueData,
      userId : $rootScope.currentUser._id,
      groupId : $rootScope.currentGroup._id,
      rating : rating
    };
    Venues.addRating(data);
  };


  ////////////////// ADMIN ONLY //////////////////////


  $scope.addtoItinerary = function(venueData) {
    var data = {
      venue : venueData,
      userId : $rootScope.currentUser._id,
      groupId : $rootScope.currentGroup._id
    };
    Venues.addtoItinerary(data);
  };


  ////////////////// INIT STATE //////////////////////


  $scope.getRatings();

})