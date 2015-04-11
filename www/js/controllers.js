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
        $scope.shownGeoDimensions = {};
        $scope.lugares = [];
        $scope.granularityTemp = [];
        $scope.shownGranularityTemp = {};
        $scope.tiempos = [];
        $scope.medidas = [];

        $scope.$on('$ionicView.afterEnter', function() {
            $.ajax({
                type: "GET",
                url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/"+$scope.categoria.code.toUpperCase()+"?api_key=special-key",
                dataType: "jsonp",
                jsonp: "_callback",
                success: function(data) {
                    $scope.datos_consulta = data;

                    for (var i = 0; i < $scope.datos_consulta.dimension.GEOGRAPHICAL.granularity.length; i++) {
                        $scope.geoDimensions.push({
                            id: i,
                            code: $scope.datos_consulta.dimension.GEOGRAPHICAL.granularity[i].code,
                            title: $scope.datos_consulta.dimension.GEOGRAPHICAL.granularity[i].title.es
                        });
                        $scope.shownGeoDimensions[$scope.geoDimensions[i].code] = false;
                    };

                    for (var i = 0; i < $scope.datos_consulta.dimension.GEOGRAPHICAL.representation.length; i++)
                        $scope.lugares.push({id: i, code: $scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].code, title: $scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].title.es, granularityCode:$scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].granularityCode, isSelected: false});

                    for (var i = 0; i < $scope.datos_consulta.dimension.TIME.granularity.length; i++) {
                        $scope.granularityTemp.push({
                            id: i,
                            code: $scope.datos_consulta.dimension.TIME.granularity[i].code,
                            title: $scope.datos_consulta.dimension.TIME.granularity[i].title.es,
                            isSelected: true
                        });
                        $scope.shownGranularityTemp[$scope.granularityTemp[i].code] = false;
                    };

                    for (var i = 0; i < $scope.datos_consulta.dimension.TIME.representation.length; i++)
                        $scope.tiempos.push({id: i, code: $scope.datos_consulta.dimension.TIME.representation[i].code, title: $scope.datos_consulta.dimension.TIME.representation[i].title.es, granularityCode: $scope.datos_consulta.dimension.TIME.representation[i].granularityCode, isSelected: false});

                    for (var i = 0; i < $scope.datos_consulta.dimension.MEASURE.representation.length; i++)
                        $scope.medidas.push({id: i, code: $scope.datos_consulta.dimension.MEASURE.representation[i].code, title: $scope.datos_consulta.dimension.MEASURE.representation[i].title.es, unit: $scope.datos_consulta.dimension.MEASURE.representation[i].quantity.unit.es, isSelected: false});

                    $ionicLoading.hide();
                }
            });
        });

        $('#consultar').click(function(e){
            $ionicLoading.show({
                template: $scope.loadingTemplate
            });

            var base_url = 'http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/GANADO_BOVINO/data?';
            var representation = 'representation=';
            var granularity = 'granularity=';
            var geographical = 'GEOGRAPHICAL';
            var time = 'TIME';
            var measure = 'MEASURE';
            var end_url = '&api_key=special-key';

            var url_consulta = base_url+representation+geographical+'[';

            for(var i = 0; i < $scope.lugares.length; i++) {
                if ($scope.lugares[i].isSelected)
                    url_consulta += $scope.lugares[i].code + '|';
            }

            url_consulta += ']:' + time + '[';

            for(var i = 0; i < $scope.tiempos.length; i++) {
                if ($scope.tiempos[i].isSelected)
                    url_consulta += $scope.tiempos[i].code + '|';
            }

            url_consulta += ']:' + measure + '[';

            for(var i = 0; i < $scope.medidas.length; i++) {
                if ($scope.medidas[i].isSelected)
                    url_consulta += $scope.medidas[i].code + '|';
            }

            url_consulta += ']&' + granularity + geographical + '[';

            for(var i = 0; i < $scope.geoDimensions.length; i++) {
                if ($scope.geoDimensions[i].isSelected)
                    url_consulta += $scope.geoDimensions[i].code + '|';
            }

            url_consulta += ']:' + time + '[';

            for(var i = 0; i < $scope.granularityTemp.length; i++) {
                if ($scope.granularityTemp[i].isSelected)
                    url_consulta += $scope.granularityTemp[i].code + '|';
            }

            url_consulta += ']' + end_url;

            console.log(url_consulta);

            $.ajax({
                type: "GET",
                url: url_consulta,
                dataType: "jsonp",
                jsonp: "_callback",
                success: function(data) {
                    $scope.result_consulta = data;

                    console.log($scope.result_consulta);

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
