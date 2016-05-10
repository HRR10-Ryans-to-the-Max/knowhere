angular.module('signin', ['ui.bootstrap'])

.controller('AuthController', function ($scope, $uibModal, $rootScope, AuthMe, $location, $state) {
  $rootScope.currentUserSignedIn = false;
  $rootScope.currentUser = null;
  $scope.test = "test";
  $scope.open = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/auth/signin.html',
      controller: 'SigninController',
    });
  };
  $scope.signUpOpen = function() {
    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'app/auth/signup.html',
      controller: 'SignupController'
      });
  };

  $scope.signout = function() {
    $rootScope.currentUser = null;
    $rootScope.currentUserSignedIn = false;
    $rootScope.currentGroup = null;
    $rootScope.destination = null;

    AuthMe.logout()
        .then(function (data) {
          $state.go('main');
        });
    $state.go('main');
  };

  $scope.validate = function(){
    var user = $location.search().id;
    AuthMe.validateUser(user);
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

.controller('SigninController', function ($scope, $uibModalInstance, $uibModal, AuthMe, $location, $rootScope, $state) {
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
          $state.go('main');
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

.controller('SignupController', function ($scope, $uibModalInstance, AuthMe, $location, $rootScope, $state) {
  $scope.alerts = [];

   $scope.closeAlert = function() {
    $scope.alerts = [];
  };

  $scope.signup = function (){
    if ($scope.password !== $scope.passwordCheck) {
      $scope.alerts = [{msg: 'Passwords do not match!'}];
      return;
    }
    AuthMe.createUser({username: $scope.email.toLowerCase(), password: $scope.password, 
                      first: $scope.firstName, last: $scope.lastName})
      .then(function (data){
        if (data.status === true){
          $scope.alerts = [];
          $scope.emailAlert = true;
          $rootScope.currentUserSignedIn = true;
          $rootScope.currentUser = data.user;
          $state.go('main');
        } else {
          $scope.alerts = [{type: 'danger', msg: data.message}];
        }
      });
  };

  $scope.exit = function(){
    $uibModalInstance.close();
    $state.go('main');
  };

});
