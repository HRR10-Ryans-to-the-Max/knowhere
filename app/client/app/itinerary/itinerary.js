angular.module('travel.itinerary', ['ui.bootstrap', 'ngAnimate'])

.controller('ItineraryController', function ($scope, $window, $rootScope, $state, $uibModal, CurrentInfo, Venues, Groups, Util) {
  $scope.restaurants = [];
  $scope.attractions = [];
  $scope.hotels = [];
  $scope.city = $rootScope.destination;
  $scope.heading = null;
  //TODO: REMOVE AND UNCOMMENT BELOW WHEN HAVE FULL DATA
  $scope.fullItinerary = $rootScope.mockData;
  // $scope.fullItinerary = [];
  //TORO: REMOVE AND UNCOMMENT ABOVE WHEN HAVE FULL DATA 
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
    Util.setHeader($scope, venueTypeId);

    $scope.filteredItinerary = Util.filterVenues($scope, venueTypeId);
  };


  ////////////////// SHOW FULL ITINERARY //////////////////////


  $scope.showFullItinerary = function() {
    var venues = [];
    $scope.heading = "Full Itinerary";
    $scope.filteredItinerary = $scope.fullItinerary;
  };


  ////////////////// GET GROUP ITINERARY //////////////////////


  $scope.getItinerary = function() {
    var userId = $rootScope.currentUser._id;
    var groupId = $rootScope.currentGroup._id;
    var query = {
      userId : userId,
      groupId : groupId
    };
    Venues.getItinerary(query)
      .then(function(itineraryData){
        $scope.itinerary = fullItineraryData;
        filterItinerary();
      });
  };


  ////////////////// ADD TO ITINERARY - ADMIN ONLY//////////////////////


  $scope.addDatestoItinerary = function(venueData, fromDate, toDate) {
    console.log(venueData, fromDate, toDate);
    var userId = $rootScope.currentUser._id;
    var groupId = $rootScope.currentGroup._id;
    var data = {
      venue : venueData,
      userId : userId,
      groupId : groupId,
      fromDate : fromDate,
      toDate : toDate
    };
    Venues.addtoItinerary(data);
  };


  ////////////////// GET DETAILED INFO OF A VENUE //////////////////////


  $scope.myInterval = 5000;
  $scope.noWrapSlides = false;
  $scope.itinInfo = $rootScope.itinInfo;
  $scope.phoneHide = $rootScope.phoneHide;

  $scope.getDetailedVenueInfo = function(venue) {
    if (venue.venue.telephone === null) {
      $rootScope.phoneHide = true;
    } else {
      $rootScope.phoneHide = false;
    }
    $rootScope.itinInfo = venue;
    $scope.itinInfo = venue;
    $scope.openModal();
  };
  $scope.exit = function(){
    $uibModalInstance.close();
  };
  $scope.openModal = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/itinerary/moreInfo.html',
      controller: 'ItineraryController',
    });
  };


//////////////////INIT STATE//////////////////////


  //TODO: REMOVE BELOW WHEN HAVE FULL DATA
  $scope.filterItinerary(1);
  //TODO: REMOVE ABOVE WHEN HAVE FULL DATA 


  //////////////////TEST//////////////////////
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();
  $scope.maxDate = new Date(2020, 5, 22);

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[1];
  //format = 2016-01-01T09:59:23.891Z
  $scope.status = {
    opened: false
  };
});
