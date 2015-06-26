angular.module('starter.controllers', [])

    .controller('AppCtrl', function($ionicPlatform, $ionicLoading, $scope, $state) {
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

        function errorLoadingMarkers() {
            $ionicLoading.hide();
            navigator.app.exitApp();
        }

        $ionicLoading.show({
            template: $scope.loadingTemplate
        });
        $.ajax({
            type: "GET",
            url: "http://banot.etsii.ull.es/alu4396/VIStac-IMAS-Can/indicadores.json",
            dataType: "json",
            timeout: 10000,
            success: function(data) {
                $scope.indicadoresPermitidos = data;
            },
            error: function (jqXHR, textStatus) {
                if(textStatus === "timeout") {
                    navigator.notification.alert('La conexión con la fuente de datos ha expirado. Saliendo de la aplicación...',
                        errorLoadingMarkers,
                        'Error',
                        'Aceptar');
                }
            }
        });

        $.ajax({
            type: "GET",
            url: "http://banot.etsii.ull.es/alu4396/VIStac-IMAS-Can/derivados.json",
            dataType: "json",
            timeout: 10000,
            success: function(data) {
                $scope.indicadoresDerivados = data;
            },
            error: function (jqXHR, textStatus) {
                if(textStatus === "timeout") {
                    navigator.notification.alert('La conexión con la fuente de datos ha expirado. Saliendo de la aplicación...',
                        errorLoadingMarkers,
                        'Error',
                        'Aceptar');
                }
            }
        });

        $scope.categorias = [];
        $scope.indicadores = [];
        /*$scope.lista_derivados = [];
        $scope.indicadores_cat_actual = {};*/
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
                url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/subjects?api_key=special-key",
                dataType: "jsonp",
                jsonp: "_callback",
                timeout: 10000,
                success: function(data) {
                    for (var i = 0; i < data.length; i++)
                        $scope.categorias.push({id: i, code: data[i].code, title: data[i].title.es.substr(4)});

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

    .controller('CategoriaCtrl', function($stateParams, $scope, $ionicLoading) {
        $ionicLoading.show({
            template: $scope.loadingTemplate
        });

        $scope.categoria = $.grep($scope.categorias, function(cat){ return cat.code === $stateParams['categoriaId']; })[0];

        $scope.$on('$ionicView.afterEnter', function() {
            $.ajax({
                type: "GET",
                url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators?q=subjectCode+EQ+\"" + $scope.categoria.code + "\"&api_key=special-key",
                dataType: "jsonp",
                jsonp: "_callback",
                timeout: 10000,
                success: function(data) {
                    $scope.indicadores = [];
                    for (var i = 0; i < data.items.length; i++) {
                        if ($scope.indicadoresPermitidos[data.items[i].code])
                            $scope.indicadores.push({id: i, code: data.items[i].id, title: data.items[i].title.es});
                    }

                    $scope.indicadores_cat_actual = $scope.indicadoresDerivados[$scope.categoria.code];
                    if ($scope.indicadores_cat_actual){
                        $scope.lista_derivados = Object.keys($scope.indicadores_cat_actual);
                        for (var i = 0; i < $scope.lista_derivados.length; i++) {
                            if ($scope.indicadoresPermitidos[$scope.lista_derivados[i]])
                                $scope.indicadores.push({
                                    code: $scope.indicadores_cat_actual[$scope.lista_derivados[i]].code,
                                    title: $scope.indicadores_cat_actual[$scope.lista_derivados[i]].title,
                                    indicators: $scope.indicadores_cat_actual[$scope.lista_derivados[i]].indicators
                                });
                        }
                    }
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

    .controller('IndicadorCtrl', function($stateParams, $scope, $ionicLoading, $ionicModal) {
        $scope.categoriaCode = $stateParams['categoriaId'];
        $scope.indicadorCode = $stateParams['indicadorId'].toUpperCase();
        $ionicLoading.show({
            template: $scope.loadingTemplate
        });

        $scope.indicadorActual = $scope.indicadoresPermitidos[$scope.indicadorCode];

        $scope.lugares = [];
        $scope.tiempos = [];

        function errorDimensionsTimeout() {
            $ionicLoading.hide();
            navigator.app.backHistory();
        }

        $scope.$on('$ionicView.afterEnter', function() {
            if (!$scope.indicadoresDerivados[$scope.categoriaCode] || !$scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode]) { // Si es un indicador básico...
                $.ajax({
                    type: "GET",
                    url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/" + $scope.indicadorCode + "?api_key=special-key",
                    dataType: "jsonp",
                    jsonp: "_callback",
                    timeout: 10000,
                    success: function (data) {
                        $scope.datos_consulta = data;
                        $scope.indicadorTitle = $scope.datos_consulta.title.es;

                        for (var i = 0; i < $scope.datos_consulta.dimension.GEOGRAPHICAL.representation.length; i++) {
                            if ($scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].granularityCode == "ISLANDS")
                                $scope.lugares.push({
                                    id: i,
                                    code: $scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].code,
                                    title: $scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].title.es,
                                    granularityCode: $scope.datos_consulta.dimension.GEOGRAPHICAL.representation[i].granularityCode,
                                    isSelected: false
                                });
                        }

                        for (var i = 0; i < $scope.datos_consulta.dimension.TIME.representation.length; i++) {
                            if ($scope.datos_consulta.dimension.TIME.representation[i].granularityCode == "YEARLY")
                                $scope.tiempos.push({
                                    id: i,
                                    code: $scope.datos_consulta.dimension.TIME.representation[i].code,
                                    title: $scope.datos_consulta.dimension.TIME.representation[i].title.es,
                                    granularityCode: $scope.datos_consulta.dimension.TIME.representation[i].granularityCode,
                                    isSelected: false
                                });
                        }

                        for (var i = 0; i < $scope.datos_consulta.dimension.MEASURE.representation.length; i++) {
                            if ($scope.datos_consulta.dimension.MEASURE.representation[i].code == "ABSOLUTE")
                                $scope.medida_unit = $scope.datos_consulta.dimension.MEASURE.representation[i].quantity.unit.es;
                        }


                        $ionicLoading.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (textStatus == "timeout") {
                            navigator.notification.alert('La conexión con la fuente de datos ha expirado. Inténtelo de nuevo.',
                                errorDimensionsTimeout,
                                'Error',
                                'Aceptar');
                        }
                    }
                });
            }
            else { // Si es un indicador derivado...
                $scope.indicadorTitle = $scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].title;
                $scope.common_years = [];
                $scope.years_retrieved = {};
                for (var i = 0; i < $scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].indicators.length; i++)
                    $scope.years_retrieved[$scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].indicators[i].code] = false;

                $.each($scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].indicators, function(index, indicator_code){
                    $.ajax({
                        type: "GET",
                        url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/" + indicator_code + "?api_key=special-key",
                        dataType: "jsonp",
                        jsonp: "_callback",
                        timeout: 10000,
                        success: function (data) {
                            var years = [];
                            for (var i = 0; i < data.dimension.TIME.representation.length; i++)
                                years.push(data.dimension.TIME.representation[i].code);
                            $scope.common_years.push(years);
                            $scope.years_retrieved[indicator_code] = true;
                        }
                    });
                });

                var interval = setInterval(function(){ // Comprueba cada 300ms que se han completado las llamadas asíncronas.
                    var completed = true;
                    for (var i = 0; i < Object.keys($scope.years_retrieved).length; i++) {
                        if (Object.keys($scope.years_retrieved)[i] != "undefined") // Evitamos el campo "undefined" que genera la funcion Object.keys
                            completed = completed && $scope.years_retrieved[Object.keys($scope.years_retrieved)[i]];
                    }
                    if (completed && $scope.common_years.length == $scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].indicators.length){ // Se asegura que el bucle haya terminado.
                        clearInterval(interval);

                        $.ajax({
                            type: "GET",
                            url: "http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/" + $scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].indicators[0] + "?api_key=special-key",
                            dataType: "jsonp",
                            jsonp: "_callback",
                            timeout: 10000,
                            success: function (data) {
                                for (var i = 0; i < data.dimension.GEOGRAPHICAL.representation.length; i++) {
                                    if (data.dimension.GEOGRAPHICAL.representation[i].granularityCode == "ISLANDS") {
                                        $scope.lugares.push({
                                            id: i,
                                            code: data.dimension.GEOGRAPHICAL.representation[i].code,
                                            title: data.dimension.GEOGRAPHICAL.representation[i].title.es,
                                            granularityCode: data.dimension.GEOGRAPHICAL.representation[i].granularityCode,
                                            isSelected: false
                                        });
                                    }
                                }

                                while($scope.common_years.length > 1) {
                                    // Se hace la intersección de los dos últimos elementos del array
                                    var arr_one = $scope.common_years[$scope.common_years.length-1];
                                    var arr_two = $scope.common_years[$scope.common_years.length-2];

                                    $scope.common_years.pop();$scope.common_years.pop(); // Se eliminan las dos últimas posiciones del array

                                    var intersection = arr_one.filter(function(n){ return arr_two.indexOf(n) != -1});

                                    $scope.common_years.push(intersection);
                                }

                                for (var i = 0; i < $scope.common_years[0].length; i++)
                                    $scope.tiempos.push({id: i, code: $scope.common_years[0][i], title: $scope.common_years[0][i], isSelected: false});

                                $ionicLoading.hide();
                            }
                        });
                    }
                },300);
            }
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

        $scope.islands_colors = [
            '#0c63ee', // Azul
            '#F54931', // Rojo
            '#22C71A', // Verde
            '#EFFB0E', // Amarillo
            '#BF5AC6', // Fucsia
            '#B9EDF1', // Celeste
            '#5D221B'  // Marrón
        ];

        $scope.getDatoIndex = function (geoCode, timeCode) {
            var geoIndex, timeIndex, measureIndex;
            geoIndex = $scope.result_consulta.dimension.GEOGRAPHICAL.representation.index[geoCode];
            timeIndex = $scope.result_consulta.dimension.TIME.representation.index[timeCode];
            measureIndex = $scope.result_consulta.dimension.MEASURE.representation.index['ABSOLUTE'];

            var geoSize, timeSize, measureSize;
            geoSize = $scope.result_consulta.dimension.GEOGRAPHICAL.representation.size;
            timeSize = $scope.result_consulta.dimension.TIME.representation.size;
            measureSize = $scope.result_consulta.dimension.MEASURE.representation.size;

            return (geoIndex * timeSize * measureSize) + (timeIndex * measureSize) + measureIndex;
        };

        $scope.leyendaShown = false;
        $scope.switchLeyenda = function() {
            $scope.leyendaShown = !$scope.leyendaShown;
        };

        $scope.drawChart = function(){
            var collection = [];
            var data_canarias = [];
            for (var i = 0; i < $scope.selectedLugares.length; i++) {
                var data = [];
                for (var k = 0; k < $scope.selectedTiempos.length; k++) {
                    data.push({
                        "dato": $scope.result_consulta.observation[$scope.getDatoIndex($scope.selectedLugares[i].code, $scope.selectedTiempos[k].code)],
                        "fecha": $scope.selectedTiempos[k].code
                    });
                }
                data.reverse();
                collection.push(data);
            }

            for (var k = 0; k < $scope.selectedTiempos.length; k++) {
                data_canarias.push({
                    "dato": $scope.result_consulta.observation[$scope.getDatoIndex($scope.canaryCode, $scope.selectedTiempos[k].code)],
                    "fecha": $scope.selectedTiempos[k].code
                });
            }
            data_canarias.reverse();

            /*** GRÁFICA PARA LAS ISLAS ***/
            $('#graf-islas').empty();
            var grafica = d3.select('#graf-islas'),
                WIDTH = $('#graf-islas').width(),
                HEIGHT = $('#graf-islas').height(),
                MARGINS = {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 50
                },
                xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([parseInt(data[0].fecha),parseInt(data[data.length-1].fecha)]),
                maxDato = -Infinity, minDato = Infinity;

            for (var i = 0; i < collection.length; i++){
                var data = collection[i];
                for (var x = 0; x < data.length; x++) {
                    var dato_int = parseFloat(data[x].dato)
                    if (dato_int > maxDato)
                        maxDato = dato_int;
                    if (dato_int < minDato)
                        minDato = dato_int;
                }
            }

            var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([minDato,maxDato]),
                xAxis = d3.svg.axis().scale(xScale).tickFormat(d3.format("d")).ticks(6),
                yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format("d")).ticks(6);

            grafica.append("svg:g").attr("class", "axis").attr("transform", "translate(0, " + (HEIGHT - MARGINS.bottom) + ")").call(xAxis);
            grafica.append("svg:g").attr("class", "axis").attr("transform", "translate(" + (MARGINS.left) + ",0)").call(yAxis);

            var lineGen = d3.svg.line()
                .x(function (d) {
                    return xScale(d.fecha);
                })
                .y(function (d) {
                    return yScale(d.dato);
                });

            for (var i = 0; i < collection.length; i++) {
                grafica.append('svg:path')
                    .attr('d', lineGen(collection[i]))
                    .attr('stroke', $scope.islands_colors[i])
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
            };


            /*** GRÁFICA PARA TOTAL CANARIAS ***/
            $('#graf-canarias').empty();
            var grafica = d3.select('#graf-canarias'),
                WIDTH = $('#graf-canarias').width(),
                HEIGHT = $('#graf-canarias').height(),
                MARGINS = {
                    top: 20,
                    right: 20,
                    bottom: 20,
                    left: 50
                },
                xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([parseInt(data[0].fecha),parseInt(data[data.length-1].fecha)]),
                maxDato = -Infinity, minDato = Infinity;


            for (var x = 0; x < data_canarias.length; x++) {
                var dato_int = parseFloat(data_canarias[x].dato)
                if (dato_int > maxDato)
                    maxDato = dato_int;
                if (dato_int < minDato)
                    minDato = dato_int;
            }

            var yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([minDato,maxDato]),
                xAxis = d3.svg.axis().scale(xScale).tickFormat(d3.format("d")).ticks(6),
                yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(d3.format("d")).ticks(6);

            grafica.append("svg:g").attr("class", "axis").attr("transform", "translate(0, " + (HEIGHT - MARGINS.bottom) + ")").call(xAxis);
            grafica.append("svg:g").attr("class", "axis").attr("transform", "translate(" + (MARGINS.left) + ",0)").call(yAxis);

            var lineGen = d3.svg.line()
                .x(function (d) {
                    return xScale(d.fecha);
                })
                .y(function (d) {
                    return yScale(d.dato);
                });

            grafica.append('svg:path')
                .attr('d', lineGen(data_canarias))
                .attr('stroke', $scope.islands_colors[0])
                .attr('stroke-width', 2)
                .attr('fill', 'none');
        }

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


        $('#consultar').click(function(e){
            $ionicLoading.show({
                template: $scope.loadingTemplate
            });

            $scope.canaryCode = 'ES70';

            $scope.selectedLugares = [];
            $scope.selectedTiempos = [];

            var base_url = 'http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/' + $stateParams['indicadorId'].toUpperCase() + '/data?';
            var representation = 'representation=';
            var granularity = 'granularity=';
            var geographical = 'GEOGRAPHICAL';
            var time = 'TIME';
            var measure = 'MEASURE';
            var end_url = '&api_key=special-key';

            if (!$scope.indicadoresDerivados[$scope.categoriaCode] || !$scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode]) { // Si es un indicador básico...
                var url_consulta = base_url + representation + geographical + '[' + $scope.canaryCode + '|';

                for (var i = 0; i < $scope.lugares.length; i++) {
                    if ($scope.lugares[i].isSelected) {
                        url_consulta += $scope.lugares[i].code + '|';
                        $scope.selectedLugares.push($scope.lugares[i]);
                    }
                }

                if ($scope.selectedLugares.length == 0) {
                    $scope.selectedLugares = $scope.lugares;
                    for (var i = 0; i < $scope.selectedLugares.length; i++)
                        url_consulta += $scope.selectedLugares[i].code + '|';
                }

                url_consulta += ']:' + time + '[';

                for (var i = 0; i < $scope.tiempos.length; i++) {
                    if ($scope.tiempos[i].isSelected) {
                        url_consulta += $scope.tiempos[i].code + '|';
                        $scope.selectedTiempos.push($scope.tiempos[i]);
                    }
                }

                if ($scope.selectedTiempos.length == 0)
                    $scope.selectedTiempos = $scope.tiempos;

                url_consulta += ']:' + measure + '[ABSOLUTE]';
                url_consulta += ']&' + granularity + geographical + '[REGIONS|ISLANDS]';
                url_consulta += ':' + time + '[YEARLY]' + end_url;

                $.ajax({
                    type: "GET",
                    url: url_consulta,
                    dataType: "jsonp",
                    jsonp: "_callback",
                    timeout: 15000,
                    success: function (data) {
                        $scope.result_consulta = data;

                        $scope.openModal();

                        $(window).resize($scope.drawChart);

                        $ionicLoading.hide();
                    },
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (textStatus == "timeout") {
                            navigator.notification.alert('La conexión con la fuente de datos ha expirado. Inténtelo de nuevo.',
                                errorDataTimeout,
                                'Error',
                                'Aceptar');
                        }
                    }
                });
            }
            else { // Si es un indicador derivado...
                var data_indicators = {};
                var indicators = $scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].indicators;
                var data_indicators_retrieved = [];
                for (var n = 0; n < indicators.length; n++)
                    data_indicators_retrieved.push(false);

                $.each(indicators, function(x, item_indicator) {
                    base_url = 'http://www.gobiernodecanarias.org/istac/indicators/api/indicators/v1.0/indicators/' + indicators[x] + '/data?';

                    url_consulta = base_url + representation + geographical + '[' + $scope.canaryCode + '|';

                    if (x == 0) {
                        for (var i = 0; i < $scope.lugares.length; i++) {
                            if ($scope.lugares[i].isSelected) {
                                url_consulta += $scope.lugares[i].code + '|';
                                $scope.selectedLugares.push($scope.lugares[i]);
                            }
                        }

                        if ($scope.selectedLugares.length == 0) {
                            $scope.selectedLugares = $scope.lugares;
                            for (var i = 0; i < $scope.selectedLugares.length; i++)
                                url_consulta += $scope.selectedLugares[i].code + '|';
                        }
                    } else {
                        for (var i = 0; i < $scope.selectedLugares.length; i++)
                            url_consulta += $scope.selectedLugares[i].code + '|';
                    }

                    url_consulta += ']:' + time + '[';

                    if (x == 0) {
                        for (var i = 0; i < $scope.tiempos.length; i++) {
                            if ($scope.tiempos[i].isSelected) {
                                url_consulta += $scope.tiempos[i].code + '|';
                                $scope.selectedTiempos.push($scope.tiempos[i]);
                            }
                        }

                        if ($scope.selectedTiempos.length == 0) {
                            $scope.selectedTiempos = $scope.tiempos;
                            for (var i = 0; i < $scope.selectedTiempos.length; i++)
                                url_consulta += $scope.selectedTiempos[i].code + '|';
                        }
                    } else {
                        for (var i = 0; i < $scope.selectedTiempos.length; i++)
                            url_consulta += $scope.selectedTiempos[i].code + '|';
                    }

                    url_consulta += ']:' + measure + '[ABSOLUTE]';
                    url_consulta += ']&' + granularity + geographical + '[REGIONS|ISLANDS]';
                    url_consulta += ':' + time + '[YEARLY]' + end_url;

                    $.ajax({
                        type: "GET",
                        url: url_consulta,
                        dataType: "jsonp",
                        jsonp: "_callback",
                        timeout: 15000,
                        success: function (data) {
                            data_indicators[item_indicator] = data;
                            data_indicators_retrieved[x] = true;
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            if (textStatus == "timeout") {
                                navigator.notification.alert('La conexión con la fuente de datos ha expirado. Inténtelo de nuevo.',
                                    errorDataTimeout,
                                    'Error',
                                    'Aceptar');
                            }
                        }
                    })
                });

                var interval = setInterval(function(){
                    var completed = Object.keys(data_indicators).length;

                    if (completed == indicators.length){
                        clearInterval(interval);

                        eval("var calc_function = " + $scope.indicadoresDerivados[$scope.categoriaCode][$scope.indicadorCode].calculate);

                        $scope.result_consulta = {};
                        $scope.result_consulta["observation"] = [];
                        $scope.result_consulta["dimension"] = data_indicators[indicators[0]].dimension;

                        for (var i = 0; i < data_indicators[indicators[0]].observation.length; i++) {
                            var pars = []
                            for (var j = 0; j < completed; j++)
                                pars.push(parseFloat(data_indicators[indicators[j]].observation[i]));

                            $scope.result_consulta.observation.push(calc_function(pars).toFixed(2));
                        }

                        $scope.openModal();

                        $(window).resize($scope.drawChart);

                        $ionicLoading.hide();
                    }
                },300);
            }
        });
    })

    .controller('AboutCtrl', function($cordovaInAppBrowser) {
        $('.logo').click(function(e){
            $cordovaInAppBrowser.open($(e.target).attr('href'), '_system');
        });
    })
