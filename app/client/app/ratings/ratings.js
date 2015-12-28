angular.module('travel.ratings', ['ui.bootstrap', 'ngAnimate'])

.controller('RatingsController', function ($scope, $window, $rootScope, $state, $uibModal, CurrentInfo, Venues, Groups, Util) {
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


  ////////////////// SELECTING A GROUP WILL REROUTE TO RATINGS //////////////////////


  $scope.selectGroup = Groups.selectGroup(function () {
    $state.go('ratings');
  });


  ////////////////// FILTER FOR RESTAURANTS/ATTRACTIONS/HOTELS //////////////////////


  $scope.filterRatings = function (filterType) {
    if (!$scope.allVenuesRatings.length) return;

    // set heading to appropriate value
    $scope._setHeading(filterType);

    $scope.filteredGroupRatings = [];
    $scope.filteredUserRatings = [];

    $scope.allVenuesRatings.forEach(function (ven) {
      if (ven.venue.venue_type_id !== filterType) return;

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


  $scope.addAvg = function (venue) {
    var total = 0;
    var numberofRatings = 0;
    venue.allRatings.forEach(function(rating){
      if (rating.userRating !== 0) {
        total += rating.userRating;
        numberofRatings ++;
      }
    });
    venue.avgRating = (total / numberofRatings) || 0;
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
  $scope.showRatings = {};
  $scope.hoveringOver = function(value,id) {
    $scope.showRatings[id] = value;
  };

  $scope.addRating = function(venueData, rating) {
    var userId = $rootScope.currentUser._id;
    venueData.allRatings.forEach(function(rate) {
      if (rate.user === userId) {
        rate.userRating = rating;
      }
    });
    venueData.currentRating = rating;
    console.log(venueData);
    $scope.addAvg(venueData);
    
    var data = {
      venue : venueData.venue,
      userId : userId,
      groupId : $rootScope.currentGroup._id,
      rating : rating
    };
    Venues.addRating(data);
  };


  ////////////////// GET DETAILED INFO OF A VENUE //////////////////////


  // Sets image carousel interval
  $scope.myInterval = 5000;
  $scope.noWrapSlides = false;
  $scope.ratingsInfo = $rootScope.ratingsInfo;
  $scope.phoneHide = $rootScope.phoneHide;

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


////////////////// SET HEADING //////////////////////


  $scope._setHeading = function (filterType) {
    if (filterType === 1) {
      $scope.heading = 'Hotels';
    } else if (filterType === 2) {
      $scope.heading = 'Restaurants';
    } else if (filterType === 3) {
      $scope.heading = 'Attractions';
    }
  };


  ////////////////// INIT STATE //////////////////////


  $scope.getRatings();

});