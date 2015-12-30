angular.module('travel.services', [])



////////////////// AuthMe //////////////////////


.factory("AuthMe", function ($http){

  var createUser = function(user){
    return $http({
      method: 'POST',
      url: '/api/auth/signup',
      data: JSON.stringify(user)
    })
    .then(function (resp){
      return resp.data;
    });
  };

  var googleLogin = function(){
    return $http({
      method: 'GET',
      url: '/api/auth/google'
    }).then(function (resp){
      return resp.data;
    });
  };

  var facebookLogin = function(){
    return $http({
      method: 'GET',
      url: '/api/auth/facebook'
    }).then(function (resp){
      return resp.data;
    });
  };

  var loginUser = function(user){
    return $http({
      method: 'POST',
      url: '/api/auth/login',
      data: JSON.stringify(user)
    })
    .then(function (resp){
      return resp.data;
    });
  };

  var isLoggedIn = function(){
    return $http({
      method: 'GET',
      url: '/api/auth/check'
    })
    .then(function (resp){
      return resp.data;
    });
  };

  var logout = function(){
    return $http({
      method: 'GET',
      url: '/api/auth/logout'
    });
  };

  var validateUser = function(user){
    return $http({
      method: 'POST',
      url: '/api/validate',
      data: JSON.stringify({id: user})
    })
    .then(function (resp){
      return resp.data;
    });
  };

  return {
    validateUser: validateUser,
    logout: logout,
    facebookLogin: facebookLogin,
    googleLogin: googleLogin,
    createUser: createUser,
    loginUser: loginUser,
    isLoggedIn: isLoggedIn
  };

})


////////////////// Groups //////////////////////


.factory('Groups', function ($http, $rootScope) {
  // HTTP REQ FUNCTIONS

  /*
    @data {object} has:
      @prop {str} username. (email)
      @prop {int} groupId.
  */
  var addParticipant = function(data) {
    return $http({
      method: 'POST',
      url: '/api/group/add',
      data: data
    });
  };
  /*
    @data {object} has:
      @prop {str} groupName.  Group title.
      @prop {int} destinationId.
      @prop {int} userId.
  */
  var createGroup = function(data){
    return $http({
      method: 'POST',
      url: '/api/group',
      data: data
    })
    .then(function (resp) {
      return resp.data;
    });
  };
  var getUserGroups = function ($scope) {
    if (!$rootScope.currentUser || !$rootScope.currentUser._id) {
      return console.error("Cannot get groups. currentUser id not found!");
    }

    $http({
      method: 'GET',
      url: '/api/group',
      params: { userId: $rootScope.currentUser._id }
    })
    .then(function (resp) {
      $scope.groups = resp.data;
    })
    .catch(function (err) {
      console.error(err);
    });
  };

  /*
    @data {object} has:
      @prop {str} groupId.
      @prop {str} userId.
  */
  var removeMember = function (data) {
    return $http({
      method: 'DELETE',
      url: '/api/group/user',
      data: data
    })
    .then(function (resp) {
      return resp.data;
    });
  };

  // NOT HTTP REQ FUNCTIONS
  var selectGroup = function (next) {
    return function (groupInfo) {
      $rootScope.currentGroup = groupInfo;
      $rootScope.destination  = groupInfo.destination;
      next();
    };
  };

  return {
    // HTTP REQ FUNCTIONS
    getUserGroups: getUserGroups,
    createGroup: createGroup,
    addParticipant: addParticipant,

    // NOT HTTP REQ FUNCTIONS
    selectGroup: selectGroup,
  };
})


////////////////// UTIL //////////////////////


.factory('Util', function () {
  // TODO ? combine these two filter functions
  var filterRatingsByVenueType = function (ratings, venueTypeId) {
    return ratings.filter(function (rating) {
      return rating.venue.venue_type_id === venueTypeId;
    });
  };

  var filterVenues = function (venues, venueTypeId) {
    return venues.filter(function (venue) {
      return venue.venue_type_id === venueTypeId;
    });
  };

  var setHeading = function ($scope, venueType) {
    if (venueType === 1) {
      $scope.heading = 'Hotels';
    } else if (venueType === 2) {
      $scope.heading = 'Restaurants';
    } else if (venueType === 3) {
      $scope.heading = 'Attractions';
    }
  };

  var transToPermalink = function (string) {
    // Leave commented-out to let the server throw errors for now
    // if (!string) return;

    return string.trim().replace(/\s+/g, '-').toLowerCase();
  };

  return {
    filterRatingsByVenueType: filterRatingsByVenueType,
    filterVenues: filterVenues,
    setHeading: setHeading,
    transToPermalink: transToPermalink
  };
})


////////////////// VENUES //////////////////////


.factory('Venues', function ($http, $rootScope) {


  ////////////////// PLACES TO EXPLORE //////////////////////

  var getAllDestinations = function () {
    return $http({
      method: 'GET',
      url: '/api/dest/',
      params: { limit: 500 } // As of 12/26/2015, TripExpert returns 375 destinations
    }).then(function(res) {
      return res.data.destinations;
    });
  };

  var getVenues = function(destinationId){
    return $http({
      method: 'GET',
      url: '/api/dest/venues',
      params: { destinationId: destinationId }
    })
    .then(function successCb (resp){
      return resp.data;
    }, function errCb (resp) {
      console.error(resp);
      return resp;
    });
  };

  var getDetailedVenueInfo = function(venueId){
    return $http({
      method: 'GET',
      url: '/api/dest/venues/info',
      params: { venueId: venueId }
    })
    .then(function successCb (resp){
      return resp.data;
    }, function errCb (resp) {
      console.error(resp);
      return resp;
    });
  };


  ////////////////// RATINGS //////////////////////


  var setRatings = function(_$scope_){
    var query = {
      groupId: $rootScope.currentGroup._id,
      userId: $rootScope.currentUser._id,
    };
    return $http({
      method: 'GET',
      url: '/api/rating',
      params: query
    })
    .then(function(resp){
      _$scope_.allVenuesRatings = resp.data;
      _$scope_.filterRatings(1);
    })
    .catch(function (error) {
      console.error(error);
    });
  };

  var addRating = function(venueInfo, rating) {
    return $http({
      method: 'POST',
      url: '/api/rating',
      data: {
        venue: venueInfo,
        userId: $rootScope.currentUser._id,
        groupId: $rootScope.currentGroup._id,
        rating: rating || 0
      }
    });
  };


  ////////////////// GROUP FAVORITES - ADMIN ONLY //////////////////////


  var addToItinerary = function (venueData, fromDate, toDate) {

    var data = {
      venue: venueData,
      userId: $rootScope.currentUser._id,
      groupId: $rootScope.currentGroup._id,
      fromDate: fromDate || new Date(),
      toDate: toDate || new Date()
    };

    return $http({
      method: 'POST',
      url: '/api/rating/itin',
      data: data
    });
  };

  var getItinerary = function($scope){
    var query = {
      userId: $rootScope.currentUser._id,
      groupId: $rootScope.currentGroup._id
    };
    return $http({
      method: 'GET',
      url: '/api/rating/itin',
      params: query
    })
    .then(function(resp){
      return resp.data;
    });
  };


  ////////////////// ADD TO USER FAVORITES - NON FUNCTIONAL - SAVE FOR LATER //////////////////////


  var getUserFavorites = function (userId) {
    return $http({
      method: 'GET',
      url: '/api/fav/user',
      params: {userId: userId}
    })
    .then(function(resp) {
      // console.log(resp.data);
      return resp.data;
    });
  };


  ////////////////// EXPORTING ALL THE FUNCTIONS //////////////////////


  return {
    getAllDestinations: getAllDestinations,
    getVenues: getVenues,
    getUserFavorites: getUserFavorites,
    addRating: addRating,
    getItinerary: getItinerary,
    setRatings: setRatings,
    addToItinerary: addToItinerary,
    getDetailedVenueInfo: getDetailedVenueInfo
  };

})


////////////////// FOR MOREINFO MODAL //////////////////////


.factory('MoreInfo', function ($http, $rootScope, Venues) {



  var initMoreInfoState = function () {
    // sets image carousel interval
    this.myInterval = 5000;
    this.noWrapSlides = false;

    // used by Ratings and Itinerary
    this.ratingsInfo = $rootScope.ratingsInfo;
    this.phoneHide = $rootScope.phoneHide;
  };

  var getDetailedVenueInfo = function (venueId) {
    var query = {
      venueId: venueId
    };
    var _this_ = this;
    Venues.getDetailedVenueInfo(query)
      .then(function (venueInfo) {
        $rootScope.detailedInfo = _this_.detailedInfo = venueInfo;
        _this_.openModal();
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  var showDetailedVenueInfo = function (venue) {
    $rootScope.phoneHide = ( venue.venue.telephone ? false : true );
    $rootScope.ratingsInfo = venue;
    this.ratingsInfo = venue;
    this.openModal();
  };

  var exit = function () {
    $uibModalInstance.close();
  };
  
  return {
    // Cannot directly extend properties. Must use
    // this method because $rootScope.ratingsInfo / .phoneHide needs to be set first
    initMoreInfoState: initMoreInfoState,

    getDetailedVenueInfo: getDetailedVenueInfo,
    showDetailedVenueInfo: showDetailedVenueInfo,
    exit: exit,
  };
})


////////////////// TRANSFACTORY STORAGE //////////////////////


.factory('CurrentInfo', function ($http) {
  var destination = {
    name: null,
    basicInfo: null,
    venues: null
  };
  return {
    destination: destination
  };
});


// ////////////////// SESSION STORAGE //////////////////////


// .factory('SessionStorage', function ($http, $location, $window) {
//   var sessionExists = function () {
//     return !!$window.sessionStorage.getItem('knowhere');
//   };

//   return {
//     sessionExists: sessionExists
//   };
// });
