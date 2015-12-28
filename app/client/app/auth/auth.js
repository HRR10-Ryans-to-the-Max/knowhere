angular.module('signin', ['ui.bootstrap'])

.controller('AuthController', function ($scope, $uibModal, $rootScope, AuthMe, $location) {
  $rootScope.currentUserSignedIn = false;
  $rootScope.currentUser = null;

  $scope.open = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/auth/signin.html',
      controller: 'SigninController',
    });
  };

  $scope.signout = function() {
    $rootScope.currentUser = null;
    $rootScope.currentUserSignedIn = false;

    AuthMe.logout()
        .then(function (data) {
          // console.log(data);
        });
  };

  $scope.validate = function(){
    var user = $location.search().id;
    AuthMe.validateUser(user)
      .then(function (data){
        console.log(data);
      });
  };

  $scope.onLoad = function() {
    AuthMe.isLoggedIn()
        .then(function (data){

          if (data.status === true){
            $rootScope.currentUserSignedIn = true;
            $rootScope.currentUser = data.user;
          }
        });
  };

  $scope.onLoad();
})

.controller('SigninController', function ($scope, $uibModalInstance, $uibModal, AuthMe, $location, $rootScope) {
  $scope.alerts = [];

  $scope.closeAlert = function() {
    $scope.alerts = [];
  };

  $scope.submit = function (){
    AuthMe.loginUser({username: $scope.email.toLowerCase(), password: $scope.password})
    .then(function (data){
        if (data.status === true){
          $rootScope.currentUserSignedIn = true;
          $rootScope.currentUser = data.user;
          $uibModalInstance.close();
        } else {
          $scope.alerts = [{msg: data.message}];
        }
    });
  };

  $scope.google = function (){
    AuthMe.googleLogin()
    .then(function (data){
      if (data.status === true) {
          $rootScope.currentUserSignedIn = true;
          $rootScope.currentUser = data.user;
          $uibModalInstance.close();
        } else {
          $scope.alerts = [{msg: data.message}];
        }
    });
  };

  $scope.facebook = function (){
    AuthMe.facebookLogin()
    .then(function (data){
      if (data.status === true) {
          $rootScope.currentUserSignedIn = true;
          $rootScope.currentUser = data.user;
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
      controller: 'SignupController',
      background: 'static'
      });
    };

    $scope.exit = function(){
      $uibModalInstance.close();
  };
})

.controller('SignupController', function ($scope, $uibModalInstance, AuthMe, $location, $rootScope) {
  $scope.alerts = [];

   $scope.closeAlert = function() {
    $scope.alerts = [];
  };

  $scope.signup = function (){
    if ($scope.password !== $scope.passwordCheck) {
      $scope.alerts = [{msg: 'Passwords do not match!'}];
      return;
    }
    AuthMe.createUser({username: $scope.email.toLowerCase(), password: $scope.password})
      .then(function (data){
        if (data.status === true){
          $scope.alerts = [];
          $scope.emailAlert = true;
          $rootScope.currentUserSignedIn = true;
          $rootScope.currentUser = data.user;
        } else {
          $scope.alerts = [{type: 'danger', msg: data.message}];
        }
      });
  };

  $scope.exit = function(){
    $uibModalInstance.close();
  };

});
