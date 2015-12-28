angular.module('travel.groups', [])

.controller('GroupsController', function ($scope, $window, $rootScope, $state, Groups, Util) {
  $scope.newGroupInput = null;
  $scope.newDestinationInput = null;
  $scope.groups = [];
  $scope.newParticipantEmail = null;
  $scope.destination = null;


  ////////////////// GET LIST OF ALL GROUPS A USER BELONGS TO //////////////////////


  $scope.getUserGroups = function() {
    Groups.getUserGroups($scope);
  };


  ////////////////// CREATE A NEW GROUP //////////////////////

  $scope.createGroup = function() {
    var data = {
      groupName: $scope.newGroupInput,
      userId: $rootScope.currentUser._id,
      destination: Util.transToPermalink($scope.newDestinationInput)
    };
    Groups.createGroup(data)
    .then(function (newGroup) {
      $rootScope.currentGroup = newGroup;
      $rootScope.destinationPermalink = Util.transToPermalink($scope.newDestinationInput);
    });
  };


  ////////////////// ADD PARTICIPANT (THROUGH EMAIL?) //////////////////////


  $scope.addParticipant = function() {
    var data = {
      groupId: $rootScope.currentGroup._id,
      userId: $rootScope.currentUser_id,
      participantInfo: $scope.newParticipantEmail
    };
    Groups.addParticipant(data);
  };


  ////////////////// SELECTING A GROUP WILL REROUTE TO RESULTS PAGE //////////////////////


  $scope.selectGroup = Groups.selectGroup(function () {
    $state.go('results');
  });


  ////////////////// SET INIT STATE //////////////////////


  $scope.getUserGroups();


});
