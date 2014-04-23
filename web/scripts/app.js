(function(global) {

    var APP_NAME = "lifxApp";
    
    var rootRef = getRootRef();

    function getRootRef() {
        return new Firebase(firebaseConfig.NAME);
    }

    global.deferredBootstrapper.bootstrap({
        element: global.document.body,
        module: APP_NAME,
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

    angular.module(APP_NAME, ["firebase"])
        .config(function(LIFX) {
            log.debug('config successful: ' + JSON.stringify(LIFX));
        })
        .controller("BulbController", function($scope, $firebase, LIFX) {
            var ref = rootRef.child("bulbs");

            $scope.bulbs = $firebase(ref);
        });
}(window));
