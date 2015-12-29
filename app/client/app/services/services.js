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
      // console.log(res.data);
      return res.data.destinations;
    });
  };

  /*
    @params {object} query has:
      @prop {int} destinationId
  */
  var getVenues = function(query){
    return $http({
      method: 'GET',
      url: '/api/dest/venues',
      params: query
    })
    .then(function successCb (resp){
      return resp.data;
    }, function errCb (resp) {
      console.error(resp);
      return resp;
    });
  };

  /*
    @params {object} query has:
      @prop {str} venueId
  */
  var getDetailedVenueInfo = function(query){
    return $http({
      method: 'GET',
      url: '/api/dest/venues/info',
      params: query
    })
    .then(function successCb (resp){
      return resp.data;
    }, function errCb (resp) {
      console.error(resp);
      return resp;
    });
  };


  ////////////////// RATINGS //////////////////////


  /*
    @params {object} query has:
      @prop {str} groupId
      @prop {str} userId
  */
  var getRatings = function(query){
    return $http({
      method: 'GET',
      url: '/api/rating',
      params: query
    })
    .then(function(resp){
      return resp.data;
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


  /*
    @data {object} data has:
      @prop {str} groupId
      @prop {str} userId
      @prop {object} venue
      @prop {str} fromDate
      @prop {str} toDate
  */
  var addtoItinerary = function(data) {
    return $http({
      method: 'POST',
      url: '/api/rating/itin',
      data: data
    });
  };


  ////////////////// ITINERARY //////////////////////


  /*
    @params {object} query has:
      @prop {str} groupId
      @prop {str} userId
  */
  var getItinerary = function(query){
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
    getRatings: getRatings,
    getItinerary: getItinerary,
    addtoItinerary: addtoItinerary,
    getDetailedVenueInfo: getDetailedVenueInfo
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
