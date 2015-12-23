angular.module('travel.services', [])



////////////////// AuthMe //////////////////////


.factory("AuthMe", function ($http){

  var createUser = function(user){
    return $http({
      method: 'POST',
      url: '/signup',
      data: JSON.stringify(user)
    })
    .then(function (resp){
      return resp.data;
    });
  };

  var googleLogin = function(){
    return $http({
      method: 'GET',
      url: '/auth/google'
    }).then(function (resp){
      return resp.data;
    });
  };

  var facebookLogin = function(){
    return $http({
      method: 'GET',
      url: '/auth/facebook'
    }).then(function (resp){
      return resp.data;
    });
  };

  var loginUser = function(user){
    return $http({
      method: 'POST',
      url: '/login',
      data: JSON.stringify(user)
    })
    .then(function (resp){
      return resp.data;
    });
  };

  var isLoggedIn = function(){
    return $http({
      method: 'GET',
      url: '/api/check'
    })
    .then(function (resp){
      return resp.data;
    });
  };

  var logout = function(){
    return $http({
      method: 'GET',
      url: '/logout'
    });
  };

  return {
    logout: logout,
    facebookLogin: facebookLogin,
    googleLogin: googleLogin,
    createUser: createUser,
    loginUser: loginUser,
    isLoggedIn: isLoggedIn
  };

})


////////////////// Groups //////////////////////


.factory('Groups', function ($http) {
  // HTTP REQ FUNCTIONS
  var addParticipants = function(data) {
    return $http({
      method: 'POST',
      url: '/api/group/add',
      data: data
    });
  };
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
  var getUserGroups = function(userId){
    return $http({
      method: 'GET',
      url: '/api/group',
      params: { userId: userId }
    })
    .then(function(resp){
      return resp.data;
    });
  };

  // NOT HTTP REQ FUNCTIONS
  var selectGroup = function (groupInfo, _$rootScope_) {
    _$rootScope_.currentGroup = groupInfo;
    _$rootScope_.destinationPermalink = groupInfo.destination;
  };

  return {
    // HTTP REQ FUNCTIONS
    getUserGroups: getUserGroups,
    createGroup: createGroup,
    addParticipants: addParticipants,

    // NOT HTTP REQ FUNCTIONS
    selectGroup: selectGroup,
  };
})


////////////////// UTIL //////////////////////


.factory('Util', function () {
  var transToPermalink = function (string) {
    // Leave commented-out to let the server throw errors for now
    // if (!string) return;

    return string.trim().replace(/\s+/g, '-').toLowerCase();
  };

  return {
    transToPermalink: transToPermalink
  };
})


////////////////// VENUES //////////////////////


.factory('Venues', function ($http) {


  ////////////////// PLACES TO EXPLORE //////////////////////

  var getAllDestinations = function () {
    return $http({
      method: 'GET',
      url: '/api/dest/',
      params: { limit: 375 }
    }).then(function(res) {
      console.log(res.data.response.destinations);
      return res.data.response.destinations;
    });
  };

  /*
    @params {object} query has:
      @prop {str} permalink
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

  /*
    @data {object} data has:
      @prop {str} groupId
      @prop {str} userId
      @prop {number} rating
      @prop {object} venue
  */
  var addRating = function(data) {
    return $http({
      method: 'POST',
      url: '/api/rating',
      data: data
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
      url: '/api/itin',
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
      url: '/api/itin',
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
      console.log(resp.data);
      return resp.data;
    });
  };

  /*
    @param {object} query has:
      @prop {str} userId
      @prop {object} venue
  */
  var addToUserFavorites = function (query) {
    return $http({
      method: 'POST',
      url: '/api/fav',
      data: query
    });
  };


  ////////////////// EXPORTING ALL THE FUNCTIONS //////////////////////


  return {
    getAllDestinations: getAllDestinations,
    getVenues: getVenues,
    getUserFavorites: getUserFavorites,
    addToUserFavorites: addToUserFavorites,
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
