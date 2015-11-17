'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
    'ngRoute',
    'myApp.profile.services',
    'myApp.directive.panel',
    'myApp.version'
]).
config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

    $routeProvider.when('/dashboard', {
        templateUrl: 'dashboard.html'
    });
    $routeProvider.when('/contact', {
        templateUrl: 'dashboard.html'
    });
    $routeProvider.when('/login', {
        templateUrl: 'profile/login.html',
        controller: 'ProfileController'
    });
    $routeProvider.when('/signup', {
        templateUrl: 'profile/signup.html'
    });

    $routeProvider.when('/users', {
        templateUrl: 'profile/users.html',
        controller: 'ProfileController'
    });
    $routeProvider.when('/settings', {
        templateUrl: 'profile/settings.html'
    }).otherwise({
        redirectTo: '/dashboard'
    });

}]).run(function($rootScope, $location, $http) {
    $http({
        method: 'GET',
        url: 'http://localhost:3000/api/me'
    }).then(function successCallback(response) {
        console.log(JSON.stringify(response));
        $rootScope.loggedInUser = true;
        $location.path("/dashboard");
    }, function errorCallback(response) {
        console.log('not authenticated!');
        delete $rootScope.loggedInUser;
    });
    $rootScope.$on("$routeChangeStart", function(event, next, current) {


        if ($rootScope.loggedInUser == null) {
            // no logged user, redirect to /login
            if (next.templateUrl === "profile/login.html" || next.templateUrl === "profile/signup.html") {} else {
                $location.path("/login");
            }
        }
    });
}).controller('TodoController', ['$scope', function($scope) {

    $scope.todoList = [];
    $scope.addToDo = function(value) {
        $scope.todoList.push({
            text: value
        });
        $scope.todo = "";
    }
    $scope.removeToDo = function(value) {
        if ($scope.todoList.indexOf(value) !== -1) {
            $scope.todoList.splice($scope.todoList.indexOf(value), 1);
        }
    }

}]).controller('MainController', ['$scope', '$location', function($scope, $location) {

    $scope.menuClass = function(page) {
        var current = $location.path().substring(1);
        if (current === page) {
            return "active";
        } else {
            return "";
        }
    }

}]);
