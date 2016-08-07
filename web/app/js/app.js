(function(angular) {
    'use strict';

    // Declare app level module which depends on filters, and services
    var app = angular.module('myApp', [
        'myApp.config',
        'myApp.routes',
        'myApp.filters',
        'myApp.services',
        'myApp.directives',
        'myApp.controllers',
        'simpleLoginTools',
        'routeSecurity'
    ])

    app.run(['loginService', '$rootScope', 'FBURL',
        function(loginService, $rootScope, FBURL) {
            // establish authentication
            $rootScope.auth = loginService.init('/login');
            $rootScope.FBURL = FBURL;
        }
    ]);

}(angular));
