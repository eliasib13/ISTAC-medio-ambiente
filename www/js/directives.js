angular.module('starter.directives')
    .directive('d3bars', function() {
        return {
            restrict: 'EA',
            scope: {},
            link: function(scope, element, attrs){

                var svg = d3.select(element[0]).append("svg").style("width","100%");

                window.onresize = function() {
                    scope.$apply();
                };

                scope.$watch(function(){
                    return angular.element($window)[0].innerWidth;
                }, function() {
                    scope.render($scope.d3Data);
                });

                scope.render = function(data){
                    // d3 code here
                    console.log(data);
                }
            }
        }
    })