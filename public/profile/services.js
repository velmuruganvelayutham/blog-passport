'use strict';
angular.module('myApp.profile.services', []).constant('API_URL', 'http://127.0.0.1:3000/api')
    .factory('profileService', ['$http', 'API_URL', function($http, API_URL) {

        return {
            login: function(user) {
                var loginPromise = $http({
                    method: 'POST',
                    url: API_URL + "/login",
                    data: user
                }).then(function successCallback(response) {
                    console.log(JSON.stringify(response));
                    return response;
                }, function errorCallback(response) {
                    alert('error');
                });
                return loginPromise;
            },

            listUsers: function() {
                return $http({
                    method: 'GET',
                    url: API_URL + '/users'
                });
            },

            addUser: function(user) {
                var addPromise = $http({
                    method: 'POST',
                    url: API_URL + '/users',
                    data: user
                }).then(function successCallback(response) {
                    console.log(JSON.stringify(response.data));
                    return response.data;
                }, function errorCallback(response) {
                    alert('error');
                });
                return addPromise;
            },

            deleteUser: function(id) {
                var deletePromise = $http({
                    method: 'DELETE',
                    url: API_URL + '/users/' + id
                }).then(function successCallback(response) {
                    console.log(JSON.stringify(response.data));
                    return response.data;
                }, function errorCallback(response) {
                    alert('error');
                });
                return deletePromise;
            },
            updateUser: function(user) {
                var updatePromise = $http({
                    method: 'PUT',
                    url: API_URL + '/users/' + user.id,
                    data: user
                }).then(function successCallback(response) {
                    console.log(JSON.stringify(response.data));
                    return response.data;
                }, function errorCallback(response) {
                    alert('error');
                });
                return updatePromise;
            }

        };
    }]).factory('auth', ['$http', '$window', function($http, $window) {
        var auth = {};
        auth.saveToken = function(token) {
            $window.localStorage['angular-blog'] = token;
        };
        auth.getToken = function() {
            return $window.localStorage['angular-blog'];
        }

        auth.isLoggedIn = function() {
            var token = auth.getToken();

            if (token) {
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function() {
            if (auth.isLoggedIn()) {
                var token = auth.getToken();
                var payload = JSON.parse($window.atob(token.split('.')[1]));

                return payload.username;
            }
        };

        auth.register = function(user) {
            return $http.post('/api/register', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function(user) {
            return $http.post('/api/login', user).success(function(data) {
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function() {
            $window.localStorage.removeItem('angular-blog');
        };
        return auth;
    }]).controller('ProfileController', ['$scope', '$location', '$rootScope', 'profileService', '$filter', 'auth', function($scope, $location, $rootScope, profileService, $filter, auth) {
        $scope.user = {};
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
        $scope.isLoggedIn = auth.register;
        $scope.currentUser = auth.logIn;

        $scope.login = function(user) {
            profileService.login(user).then(function(response) {
                $rootScope.loggedInUser = true;
                $location.path('/dashboard');
            })
        };
        $scope.listUsers = function() {
            profileService.listUsers().then(function(response) {
                $scope.users = response.data;
                console.log($scope.users);
            })
        };
        $scope.addUser = function(user) {
            console.log(user);
            var upperCaseFilter = $filter('uppercase');
            user.name = upperCaseFilter(user.name);
            if ($scope.update) {

                profileService.updateUser(user).then(function(data) {
                    $scope.resetUser();
                    $scope.listUsers();
                    $scope.update = false;
                    $scope.message = user.name + " is updated successfully !";
                })
            } else {

                profileService.addUser(user).then(function(data) {
                    $scope.resetUser();
                    $scope.listUsers();
                    $scope.message = user.name + " is added successfully !";
                })
            }

        };
        $scope.editUser = function(user) {
            $scope.message = "";
            $scope.user = user;
            $scope.update = true;
        }

        $scope.deleteUser = function(id) {
            console.log(id);
            profileService.deleteUser(id).then(function(data) {
                $scope.message = id + " is deleted successfully !";
                $scope.listUsers();

            })
        };
        $scope.resetUser = function() {
            $scope.user = {};
            $scope.message = "";
        }


     /*   $scope.listUsers();
*/

        $scope.$watch('user.username', function(newVal, oldVal) {
            console.log(newVal + "- -" + oldVal);
            if (!newVal) return;
            if (newVal.length < 3) {
                $scope.message = 'minimum 3 characters are required!.';
            } else {
                $scope.message = '';
            }
        });

    }]).filter('userIdGenerator', function() {
        return function(input) {
            return input.username + '@angular-blog.io';
        }
    });
