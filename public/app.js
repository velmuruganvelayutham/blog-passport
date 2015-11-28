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
    var fetchUserResolve = function($http, $q, API_URL) {
        var deferred = $q.defer();
        $http({
            method: 'GET',
            url: API_URL + '/users'
        }).then(function successCallback(response) {
            console.log(JSON.stringify(response.data));
            deferred.resolve(response.data);
        }, function errorCallback(response) {
            deferred.reject()
        })
        return deferred.promise;
    };
    $routeProvider.when('/login', {
        templateUrl: 'profile/login.html',
        controller: 'ProfileController',
        resolve: {
            fetchUsers: fetchUserResolve
        }
    });
    $routeProvider.when('/signup', {
        templateUrl: 'profile/signup.html',
        controller: 'ProfileController',
        resolve: {
            fetchUsers: fetchUserResolve
        }
    });

    $routeProvider.when('/users', {
        templateUrl: 'profile/users.html',
        controller: 'ProfileController',
        resolve: {
            fetchUsers: fetchUserResolve
        }
    });
    $routeProvider.when('/settings', {
        templateUrl: 'profile/settings.html'
    }).otherwise({
        redirectTo: '/dashboard'
    });

}]).run(function($rootScope, $location, $http, auth, $window) {

    if (auth.isLoggedIn()) {
        $location.path("/dashboard");
    }

    $rootScope.$on("$routeChangeStart", function(event, next, current) {

        /*if ($rootScope.loggedInUser == null) {*/
        if (!auth.isLoggedIn()) {
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
