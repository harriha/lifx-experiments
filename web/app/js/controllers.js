(function(global) {
    'use strict';

    var controllers = angular.module(global.appConfig.NAME + 'Controllers', ['firebase']);

    controllers.controller('BulbController', ['$scope', '$firebase',
        function($scope, $firebase) {
            var ref = rootRef.child('bulbs');

            $scope.bulbs = $firebase(ref);
        }
    ]);

}(window));
