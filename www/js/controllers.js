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

        function errorLoadingMarkers() {
            $ionicLoading.hide();
            navigator.app.exitApp();
        }

        $scope.$on('$ionicView.loaded', function() {
            $.ajax({
                type: "GET",
                url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators?api_key=special-key",
                dataType: "jsonp",
                jsonp: "_callback",
                timeout: 10000,
                success: function(data) {
                    for (var i = 0; i < data.items.length; i++)
                        $scope.categorias.push({id: i, code: data.items[i].id, title: data.items[i].title.es});

                    $ionicLoading.hide();
                },
                error: function (jqXHR, textStatus){
                    if(textStatus === "timeout") {
                        navigator.notification.alert('La conexión con la fuente de datos ha expirado. Saliendo de la aplicación...',
                            errorLoadingMarkers,
                            'Error',
                            'Aceptar');
                    }
                }
            });
        });
    })

    .controller('CategoriaCtrl', function($stateParams, $scope, $ionicLoading, $ionicModal) {
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

        function errorDimensionsTimeout() {
            $ionicLoading.hide();
            navigator.app.backHistory();
        }

        $scope.$on('$ionicView.afterEnter', function() {
            $.ajax({
                type: "GET",
                url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/"+$scope.categoria.code.toUpperCase()+"?api_key=special-key",
                dataType: "jsonp",
                jsonp: "_callback",
                timeout: 10000,
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
                },
                error: function (jqXHR, textStatus, errorThrown){
                    if(textStatus == "timeout") {
                        navigator.notification.alert('La conexión con la fuente de datos ha expirado. Inténtelo de nuevo.',
                            errorDimensionsTimeout,
                            'Error',
                            'Aceptar');
                    }
                }
            });
        });

        $ionicModal.fromTemplateUrl('templates/result_modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal){
            $scope.result_modal = modal;
        });

        $scope.openModal = function() {
            $scope.result_modal.show();
        };

        $scope.closeModal = function() {
            $scope.result_modal.hide();
        };

        $scope.$on('$destroy', function() {
            $scope.result_modal.remove();
        });

        function errorDataTimeout() {
            $ionicLoading.hide();
            $scope.closeModal();
        }

        $('#consultar').click(function(e){
            $ionicLoading.show({
                template: $scope.loadingTemplate
            });

            $scope.selectedLugares = [];
            $scope.selectedTiempos = [];
            $scope.selectedMeasures = [];

            var base_url = 'http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/GANADO_BOVINO/data?';
            var representation = 'representation=';
            var granularity = 'granularity=';
            var geographical = 'GEOGRAPHICAL';
            var time = 'TIME';
            var measure = 'MEASURE';
            var end_url = '&api_key=special-key';

            var url_consulta = base_url+representation+geographical+'[';

            for(var i = 0; i < $scope.lugares.length; i++) {
                if ($scope.lugares[i].isSelected) {
                    url_consulta += $scope.lugares[i].code + '|';
                    $scope.selectedLugares.push($scope.lugares[i]);
                }
            }

            if ($scope.selectedLugares.length == 0)
                $scope.selectedLugares = $scope.lugares;

            url_consulta += ']:' + time + '[';

            for(var i = 0; i < $scope.tiempos.length; i++) {
                if ($scope.tiempos[i].isSelected) {
                    url_consulta += $scope.tiempos[i].code + '|';
                    $scope.selectedTiempos.push($scope.tiempos[i]);
                }
            }

            if ($scope.selectedTiempos.length == 0)
                $scope.selectedTiempos = $scope.tiempos;

            url_consulta += ']:' + measure + '[';

            for(var i = 0; i < $scope.medidas.length; i++) {
                if ($scope.medidas[i].isSelected) {
                    url_consulta += $scope.medidas[i].code + '|';
                    $scope.selectedMeasures.push($scope.medidas[i]);
                }
            }

            if ($scope.selectedMeasures.length == 0)
                $scope.selectedMeasures = $scope.medidas;

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

            $.ajax({
                type: "GET",
                url: url_consulta,
                dataType: "jsonp",
                jsonp: "_callback",
                timeout: 15000,
                success: function(data) {
                    $scope.result_consulta = data;

                    $scope.getDatoIndex = function (geoCode, timeCode, measureCode) {
                        var geoIndex, timeIndex, measureIndex;
                        geoIndex = $scope.result_consulta.dimension.GEOGRAPHICAL.representation.index[geoCode];
                        timeIndex = $scope.result_consulta.dimension.TIME.representation.index[timeCode];
                        measureIndex = $scope.result_consulta.dimension.MEASURE.representation.index[measureCode];

                        var geoSize, timeSize, measureSize;
                        geoSize = $scope.result_consulta.dimension.GEOGRAPHICAL.representation.size;
                        timeSize = $scope.result_consulta.dimension.TIME.representation.size;
                        measureSize = $scope.result_consulta.dimension.MEASURE.representation.size;

                        return (geoIndex * timeSize * measureSize) + (timeIndex * measureSize) + measureIndex;
                    };

                    $scope.openModal();

                    $scope.drawChart = function(){
                        for (var i = 0; i < $scope.selectedLugares.length; i++) {
                            for (var j = 0; j < $scope.selectedMeasures.length; j++) {
                                var data = [];
                                for (var k = 0; k < $scope.selectedTiempos.length; k++) {
                                    data.push({
                                        "dato": $scope.result_consulta.observation[$scope.getDatoIndex($scope.selectedLugares[i].code, $scope.selectedTiempos[k].code, $scope.selectedMeasures[j].code)],
                                        "fecha": $scope.selectedTiempos[k].code
                                    });
                                }
                                data.reverse();

                                $('#graf-' + i + '-' + j).empty();
                                var grafica = d3.select('#graf-' + i + '-' + j),
                                    WIDTH = $('#graf-' + i + '-' + j).width(),
                                    HEIGHT = $('#graf-' + i + '-' + j).height(),
                                    MARGINS = {
                                        top: 20,
                                        right: 20,
                                        bottom: 20,
                                        left: 50
                                    },
                                    xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([parseInt(data[0].fecha),parseInt(data[data.length-1].fecha)]),
                                    maxDato = -Infinity, minDato = Infinity;

                                for (var x = 0; x < data.length; x++) {
                                    var dato_int = parseFloat(data[x].dato)
                                    if (dato_int > maxDato)
                                        maxDato = dato_int;
                                    if (dato_int < minDato)
                                        minDato = dato_int;
                                }
                                var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([minDato,maxDato]),
                                    xAxis = d3.svg.axis().scale(xScale),
                                    yAxis = d3.svg.axis().scale(yScale).orient("left");

                                grafica.append("svg:g").attr("transform", "translate(0, " + (HEIGHT - MARGINS.bottom) + ")").call(xAxis);
                                grafica.append("svg:g").attr("transform", "translate(" + (MARGINS.left) + ",0)").call(yAxis);

                                var lineGen = d3.svg.line()
                                    .x(function (d) {
                                        return xScale(d.fecha);
                                    })
                                    .y(function (d) {
                                        return yScale(d.dato);
                                    });

                                grafica.append('svg:path')
                                    .attr('d', lineGen(data))
                                    .attr('stroke', 'red')
                                    .attr('stroke-width', 2)
                                    .attr('fill', 'none');
                            }
                        }
                    };

                    $(window).resize($scope.drawChart);

                    $scope.data_mode = 1;

                    $scope.setDataMode = function (mode) {
                        $scope.data_mode = mode;

                        if(mode == 2){ // Mostrar gráficas
                            setTimeout($scope.drawChart, 0);
                        }
                    }

                    $scope.isDataMode = function (mode) {
                        return $scope.data_mode == mode;
                    }

                    $ionicLoading.hide();
                },
                error: function (jqXHR, textStatus, errorThrown){
                    if(textStatus == "timeout") {
                        navigator.notification.alert('La conexión con la fuente de datos ha expirado. Inténtelo de nuevo.',
                            errorDataTimeout,
                            'Error',
                            'Aceptar');
                    }
                }
            });
        });
    })

    .controller('AboutCtrl', function($cordovaInAppBrowser) {
        $('.logo').click(function(e){
            $cordovaInAppBrowser.open($(e.target).attr('href'), '_system');
        });
    })
