angular.module('myApp.directive.panel', []).directive('abPanel', function() {
    // Runs during compile
    return {
        // name: '',
        // priority: 1,
        // terminal: true,
        scope: true, // {} = isolate, true = child, false/undefined = no change
        // controller: function($scope, $element, $attrs, $transclude) {},
        // require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
        restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
        template: '<div class="panel panel-success">' +
            '<div class="panel-heading">' +
            '<h3 class="panel-title">{{title}}</h3>' +
            '</div>' +
            '<div ng-click="panelClick()" class="panel-body">' +
            '<div ng-transclude > This is panel</div>' +
            '</div>' +
            '</div>',
        //templateUrl: 'components/directives/panel.html',
        replace: true,
        transclude: true,
        // compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
        link: function($scope, iElm, iAttrs, controller) {
            $scope.title = iAttrs.abTitle;
            $scope.panelClick = function() {
                $scope.$broadcast('panelClick', {});
            }
            $scope.$on('panelClick', function() {
                alert('Panel is clicked !');
            });
        }
    };
});
