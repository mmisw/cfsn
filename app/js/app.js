'use strict';

angular.module('cfsn', [
        //'ui.bootstrap',
        'ngRoute',
        'ngSanitize',
        'ngCookies',
        'cfsn.data',
        'cfsn.filters',
        'cfsn.main.controller',
        'cfsn.term.controller'
    ])

    .value('version', '0.0.7')

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

            .when('/search/:search*', {
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'})

            .otherwise({redirectTo: '/'});
    }])

    .factory('Works', ['$rootScope', function($rootScope) {
        var works  = new ItemList();
        var errors = new ItemList();

        $rootScope.works  = works;
        $rootScope.errors = errors;

        return {
            works:  works,
            errors: errors
        };

        function ItemList() {
            var nextId = 0;
            var byId = {};
            return {
                add: function(w) {
                    var id = ++nextId;
                    byId[id] = w;
                    return id;
                },
                has:  function(id) {
                    return byId[id] !== undefined;
                },
                remove:  function(id) {
                    var w = byId[id];
                    delete byId[id];
                    return w;
                },
                update:  function(id, w) {
                    byId[id] = w;
                },
                removeAll: function() {
                    byId = {};
                },
                any:  function() {
                    if (_.size(byId) > 0) {
                        for (var id in byId) {
                            if (byId.hasOwnProperty(id)) {
                                return byId[id];
                            }
                        }
                    }
                    return undefined;
                }
            }
        }
    }])

    // http://stackoverflow.com/a/18295416/830737
    .directive('focusOn', function() {
        return function(scope, elem, attr) {
            scope.$on('focusOn', function(e, name) {
                if(name === attr.focusOn) {
                    elem[0].focus();
                }
            });
        };
    })
    .factory('focus', ['$rootScope', '$timeout', function($rootScope, $timeout) {
        return function(name) {
            $timeout(function (){
                $rootScope.$broadcast('focusOn', name);
            });
        }
    }])

    .run(['$cookies', '$rootScope', '$location', '$window', 'Works', function($cookies, $rootScope, $location, $window, Works) {

        $rootScope.$on('$routeChangeStart', function(event) {
            // crear errors:
            Works.errors.removeAll();
        });

        if ($cookies.mmisw_cfsn_noga) {
            console.log("not enabling ga per cookie");
            return;
        }
        if (/localhost:/.test($window.location.host)) {
            console.log("not enabling ga on localhost");
            return;
        }
        $rootScope.$on('$routeChangeSuccess', function(event) {
            if ($window.ga) {
                $window.ga('send', 'pageview', { page: $location.path() });
            }
        });
    }])
;
