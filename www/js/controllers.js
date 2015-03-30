angular.module('starter.controllers', [])

.controller('AppCtrl', function() {})

.controller('HomeCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('CategoriaCtrl', function($stateParams) {
})

.controller('AboutCtrl', function($cordovaInAppBrowser) {
    $('.logo').click(function(e){
        $cordovaInAppBrowser.open($(e.target).attr('href'), '_system');
    });
})
