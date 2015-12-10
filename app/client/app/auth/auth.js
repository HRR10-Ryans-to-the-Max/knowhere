angular.module('signin', ['ui.bootstrap'])

.controller('AuthCtrl', function ($scope, $uibModal, $rootScope, authMe, $location) {
  $rootScope.currentUserSignedIn = false;
  $scope.open = function() {
      var modalInstance = $uibModal.open({
        animation: $scope.animationsEnabled,
        templateUrl: 'app/auth/signin.html',
        controller: 'signinCtrl',
        });
      };

  $scope.signout = function() {
    $rootScope.currentUserSignedIn = false;
    authMe.logout().then(function (data) {
      console.log(data);
    });
  };


})

.controller('signinCtrl', function ($scope, $uibModalInstance, $uibModal, authMe, $location, $rootScope) {
  $scope.alerts = [];

  $scope.closeAlert = function() {
    $scope.alerts = [];
  };
  $scope.submit = function (){
    authMe.loginUser({username: $scope.email, password: $scope.password})
    .then(function (data){
        if (data.status === true){
          $rootScope.currentUserSignedIn = true;
          $uibModalInstance.close();
        } else {
          $scope.alerts = [{msg: data.message}];
        }
    });
  };

  $scope.create = function(){
    $uibModalInstance.close();
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/auth/signup.html',
      controller: 'signupCtrl',
      background: 'static'
      });
    };

    $scope.exit = function(){
      $uibModalInstance.close();
  };
})

.controller('signupCtrl', function ($scope, $uibModalInstance, authMe, $location, $rootScope) {
  $scope.alerts = [];

   $scope.closeAlert = function() {
    $scope.alerts = [];
  };

  $scope.signup = function (){
    authMe.createUser({username: $scope.email, password: $scope.password})
      .then(function (data){
        if (data.status === true){
          $uibModalInstance.close();
          $rootScope.currentUserSignedIn = true;
        } else{
          $scope.alerts = [{msg: data.message}];
        }
      });
  };

  $scope.exit = function(){
    $uibModalInstance.close();
  };

})

.factory("authMe", function ($http){

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
    createUser: createUser,
    loginUser: loginUser,
    isLoggedIn: isLoggedIn
  };

});


