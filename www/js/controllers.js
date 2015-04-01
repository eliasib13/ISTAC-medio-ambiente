angular.module('starter.controllers', [])

    .controller('AppCtrl', function($ionicPlatform, $scope, $state) {
        $scope.loadingTemplate = '<ion-spinner icon="lines"></ion-spinner>';

        function exitApp(index) {
            if (index == 1)
                navigator.app.exitApp();
        }

        $ionicPlatform.registerBackButtonAction(function () {
            if($state.current.name=="app.home" || $state.current.name=="app.about")
            {
                navigator.notification.confirm(
                    '¿Desea salir de la aplicación?',
                    exitApp,
                    'Salir',
                    ['Sí','No']
                );
            }
            else {
                navigator.app.backHistory();
            }
        }, 100);

        $scope.categorias = [];
    })

    .controller('HomeCtrl', function($scope, $ionicLoading) {
        $ionicLoading.show({
            template: $scope.loadingTemplate
        });

        $scope.$on('$ionicView.loaded', function() {
            $.ajax({
                type: "GET",
                url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators?api_key=special-key",
                dataType: "jsonp",
                jsonp: "_callback",
                success: function(data) {
                    for (var i = 0; i < data.items.length; i++)
                        $scope.categorias.push({id: i, code: data.items[i].id, title: data.items[i].title.es});

                    $ionicLoading.hide();
                }
            });
        });
    })

    .controller('CategoriaCtrl', function($stateParams, $scope, $ionicLoading) {
        $ionicLoading.show({
            template: $scope.loadingTemplate
        });

        $scope.categoria = $scope.categorias[$stateParams.categoriaId];

        $scope.geoDimensions = [];
        $scope.lugares = [];

        $scope.updateGeoDim = function(val) {
            $scope.geoDimVal = val;
            $scope.lugares = [];

            var index = 0;
            for (var i = 0; i < $scope.datos_consulta.dimension.GEOGRAPHICAL.representation.length; i++) {
                if ($scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].granularityCode == $scope.geoDimVal.code) {
                    $scope.lugares.push(
                        {
                            id: index,
                            code: $scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].code,
                            title: $scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].title.es
                        });
                    index++;
                }
            }
        };


        $scope.updateLugar = function(val) {
            console.log('update lugar: '+JSON.stringify(val));
        }

        $scope.$on('$ionicView.afterEnter', function() {
            $.ajax({
                type: "GET",
                url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/"+$scope.categoria.code.toUpperCase()+"?api_key=special-key",
                dataType: "jsonp",
                jsonp: "_callback",
                success: function(data) {
                    $scope.datos_consulta = data;

                    for (var i = 0; i < $scope.datos_consulta.dimension.GEOGRAPHICAL.granularity.length; i++)
                        $scope.geoDimensions.push({id: i, code: $scope.datos_consulta.dimension.GEOGRAPHICAL.granularity[i].code, title: $scope.datos_consulta.dimension.GEOGRAPHICAL.granularity[i].title.es});
                    $ionicLoading.hide();
                }
            });
        });
    })

    .controller('AboutCtrl', function($cordovaInAppBrowser) {
        $('.logo').click(function(e){
            $cordovaInAppBrowser.open($(e.target).attr('href'), '_system');
        });
    })
