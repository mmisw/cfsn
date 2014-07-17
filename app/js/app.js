'use strict';

angular.module('cfsn', [
        'ngRoute',
        'ngSanitize',
        'cfsn.data',
        'cfsn.filters',
        'cfsn.main.controller',
        'cfsn.term.controller'
    ])

    .value('version', '0.0.3')

    .directive('appVersion', ['version', function(version) {
        return function(scope, elm, attrs) {
            elm.text(version);
        };
     }])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'})

            .when('/:term', {
                templateUrl: 'views/term.html',
                controller: 'TermCtrl'})

            .when('/search/:search', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'})

            .otherwise({redirectTo: '/'});
    }])

    .factory('Works', ['$rootScope', function($rootScope) {
        var nextWorkId = 0;
        var worksById = {};

        var works = {
            add: function(w) {
                var id = ++nextWorkId;
                worksById[id] = w;
                return id;
            },
            has:  function(id) {
                return worksById[id] !== undefined;
            },
            remove:  function(id) {
                var w = worksById[id];
                delete worksById[id];
                return w;
            },
            update:  function(id, w) {
                worksById[id] = w;
            },
            removeAll: function() {
                worksById = {};
            },
            any:  function() {
                if (_.size(worksById) > 0) {
                    for (var id in worksById) {
                        if (worksById.hasOwnProperty(id)) {
                            return worksById[id];
                        }
                    }
                }
                return undefined;
            }
        };

        $rootScope.works = works;

        return {
            works: works
        };
    }])

    .run(['$rootScope', '$location', '$window', function($rootScope, $location, $window) {
        // note: $location.search() doesn't seem to always capture the actual query params,
        // so use $window.location.search, which seems to work better.
        //console.log("$window.location.search=", $window.location.search);
        //console.log("$location search=", $location.search());

        if (/localhost:/.test($window.location.host) ||
            /_noga/.test($window.location.search)
        ) {
            console.log("not enabling ga");
            return;
        }
        $rootScope.$on('$routeChangeSuccess', function(event) {
            if ($window.ga) {
                $window.ga('send', 'pageview', { page: $location.path() });
            }
        });
    }])
;
