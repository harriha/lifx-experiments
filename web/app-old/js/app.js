(function(global) {
    'use strict';

    var appConfig = global.appConfig;

    var rootRef = getRootRef();

    function getRootRef() {
        return new Firebase(firebaseConfig.NAME);
    }

    global.deferredBootstrapper.bootstrap({
        element: global.document.body,
        module: appConfig.NAME,
        resolve: {
            LIFX: function($http, $q) {
                var deferred = $q.defer();

                rootRef.auth(firebaseConfig.AUTH_TOKEN, function(error, result) {
                    if(error) {
                        log.error('Authentication failed!', error);
                        deferred.reject(new Error('Authentication failed'));
                    } else {
                        log.debug('Authenticated successfully with payload:', JSON.stringify(result));

                        deferred.resolve(true);
                    }
                });

                return deferred.promise;
            }
        }
    });

    var app = angular.module(appConfig.NAME, [
        'ngRoute',
        appConfig.NAME + 'Controllers',
        'firebase',
    ]);


    app.config(['LIFX', '$routeProvider',
        function(LIFX, $routeProvider) {
            log.debug('config successful: ' + JSON.stringify(LIFX));

            $routeProvider.
                when('/bulbs', {
                    templateUrl: 'partials/bulbs.html',
                    controller: 'BulbController'
                }).
                otherwise({
                    redirectTo: '/bulbs'
                });
        }
    ]);

}(window));
