(function(angular) {
    'use strict';

    angular.module('myApp.routes', ['ngRoute'])

    // configure views; the authRequired parameter is used for specifying pages
    // which should only be available while logged in
    .config(['$routeProvider',
        function($routeProvider) {
            $routeProvider.when('/home', {
                //            authRequired: true, // must authenticate before viewing this page
                templateUrl: 'partials/home.html',
                controller: 'HomeCtrl'
            });

            // $routeProvider.when('/chat', {
            //    templateUrl: 'partials/chat.html',
            //    controller: 'ChatCtrl'
            // });

            $routeProvider.when('/login', {
                templateUrl: 'partials/login.html',
                controller: 'LoginCtrl'
            });

            $routeProvider.otherwise({
                redirectTo: '/home'
            });
        }
    ]);

}(angular));
