'use strict';
angular.module('myApp.profile.services', []).constant('API_URL', 'http://127.0.0.1:3000/api')
    .factory('profileService', ['$http', 'API_URL', 'auth', function($http, API_URL, auth) {

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
                var listPromise = $http({
                    method: 'GET',
                    url: API_URL + '/users'
                }).then(function successCallback(response) {
                    console.log(JSON.stringify(response.data));
                    return response.data;
                }, function errorCallback(response) {
                    alert('error');
                });
                return listPromise;
            },

            /*return $http({
                method: 'GET',
                url: API_URL + '/users'
            });*/


            addUser: function(user) {
                var addPromise = $http({
                    method: 'POST',
                    url: API_URL + '/users',
                    headers: {
                        Authorization: 'Bearer ' + auth.getToken()
                    },
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
            console.log('save token ' + token);
            $window.localStorage['angular-blog'] = token;
        };
        auth.getToken = function() {
            console.log('get token ' + $window.localStorage['angular-blog']);
            return $window.localStorage['angular-blog'];
        }

        auth.isLoggedIn = function() {
            var token = auth.getToken();
            console.log('Token is ' + token);
            if (token) {
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');
                var payload = JSON.parse($window.atob(base64));
                /*var payload = JSON.parse($window.atob(token.split('.')[1]));*/
                return payload.exp > Date.now() / 1000;
            } else {
                return false;
            }
        };

        auth.currentUser = function() {
            if (auth.isLoggedIn()) {

                var token = auth.getToken();
                var base64Url = token.split('.')[1];
                var base64 = base64Url.replace('-', '+').replace('_', '/');
                var payload = JSON.parse($window.atob(base64));
                return payload.username;
            }
        };

        auth.register = function(user) {
            return $http.post('/api/register', user).success(function(data) {
                console.log(data.token);
                auth.saveToken(data.token);
            });
        };

        auth.logIn = function(user) {
            return $http.post('/api/login', user).success(function(data) {
                console.log(data.token);
                auth.saveToken(data.token);
            });
        };

        auth.logOut = function() {
            $window.localStorage.removeItem('angular-blog');
        };
        //  auth.logOut();
        return auth;
    }]).controller('ProfileController', ['$scope', '$location', '$rootScope', 'profileService', '$filter', 'auth', 'fetchUsers', function($scope, $location, $rootScope, profileService, $filter, auth, fetchUsers) {
        $scope.user = {};
        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;
        $scope.logOut = auth.logOut;
        //$scope.register = auth.register;
        //$scope.logIn = auth.logIn;
        console.log(fetchUsers);
        $scope.users = fetchUsers;
        $scope.logIn = function(user) {
            auth.logIn(user).error(function(error) {
                $scope.error = error;
                // $location.path('/dashboard');
            }).then(function(success) {
                $rootScope.loggedInUser = true;
                $location.path('/dashboard');
            });
        };

        $scope.register = function(user) {
            auth.register(user).error(function(error) {
                $scope.error = error;
                // $location.path('/dashboard');
            }).then(function(success) {
                $rootScope.loggedInUser = true;
                $location.path('/dashboard');
            });
        };
        $scope.listUsers = function() {
            profileService.listUsers().then(function(response) {
                $scope.users = response;
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
