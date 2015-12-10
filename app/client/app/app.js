angular.module('travel', [
  'travel.services',
  'travel.landing',
  'travel.hotels',
  'travel.attractions',
  'travel.restaurants',
  'ngRoute',
  'signin'
])
.config(function($routeProvider, $httpProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'app/landing/landing.html',
      controller: 'LandingController'
    })
    .when('/attractions', {
      templateUrl: 'app/attractions/attractions.html',
      controller: 'AttractionsController',
      authenticate: true 
    })
    .when('/hotels', {
      templateUrl: 'app/hotels/hotels.html',
      controller: 'HotelsController',
      authenticate: true 
    })
    .when('/restaurants', {
      templateUrl: 'app/restaurants/restaurants.html',
      controller: 'RestaurantsController',
      authenticate: true 
    })
    .otherwise({
      redirectTo: '/'
    });
    $httpProvider.interceptors.push('AttachCity');
})
.factory('AttachCity', function ($window) {
  var attach = {
    request: function (object) {
      var jwt = $window.sessionStorage.getItem('knowhere');
      if (jwt) {
        object.headers['x-access-token'] = jwt;
      }
      object.headers['Allow-Control-Allow-Origin'] = '*';
      return object;
    }
  };
  return attach;
})
.run(function ($rootScope, $location, SessionStorage) {
  $rootScope.$on('$routeChangeStart', function (evt, next, current) {
    if (next.$$route && next.$$route.authenticate && !SessionStorage.sessionExists()) {
      $location.path('/');
    }
  });
});