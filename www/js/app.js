angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

    .run(function($ionicPlatform) {
        $ionicPlatform.ready(function() {

            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });
    })

    .config(function($stateProvider, $urlRouterProvider) {
        $stateProvider

            .state('app', {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: 'AppCtrl'
            })

            .state('app.about', {
                url: "/about",
                views: {
                    'menuContent': {
                        templateUrl: "templates/about.html",
                        controller: "AboutCtrl"
                    }
                }
            })
            .state('app.home', {
                url: "/home",
                views: {
                    'menuContent': {
                        templateUrl: "templates/home.html",
                        controller: 'HomeCtrl'
                    }
                }
            })

            .state('app.categoria', {
                url: "/home/:categoriaId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/categoria.html",
                        controller: 'CategoriaCtrl'
                    }
                }
            })

            .state('app.indicador', {
                url: "/home/:categoriaId/:indicadorId",
                views: {
                    'menuContent': {
                        templateUrl: "templates/indicador.html",
                        controller: 'IndicadorCtrl'
                    }
                }
            })

        $urlRouterProvider.otherwise('/app/home');
    });
