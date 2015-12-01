angular.module('myApp.poll.controller', []).controller('PollController', ['$http', '$scope', function($http, $scope) {

    $scope.placeholders = ['coke', 'pepsi'];

    $scope.addOption = function() {
        $scope.placeholders.push('New Option');
    }

}]);
