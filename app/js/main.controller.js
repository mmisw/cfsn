'use strict';

(function() {

angular.module('cfsn.main.controller', ['trNgGrid'])

    .controller('MainCtrl', ['$scope', '$routeParams', '$location', '$timeout', 'dataService', 'Works', 'focus',
        function ($scope, $routeParams, $location, $timeout, dataService, Works, focus) {

            Works.works.removeAll();
            $scope.works = Works.works;

            parseRouteParams($scope, $routeParams);

            preparePageSize($scope, $timeout);

            $scope.totalTerms = 0;
            $scope.termList = [];

            updateSearchVars($scope);
            getTermList($scope, dataService);

            $scope.stopPropagation = function($event) {
                // avoids dropdown getting closed
                $event.stopPropagation();
            };

            $scope.$watch('searchMode', function(searchMode) {
                //console.log("watch searchMode", searchMode);
                searchSettingsChanged($scope, $location);
            });

            $scope.$watch('termListFilter', function(newTermListFilter) {
               updateSearchVars($scope);
            });

            $scope.invalidSearchField = function() {
                return $scope.searchRegexError !== undefined;
            };

            $scope.searchKeyPressed = function($event) {
                //console.log("searchKeyPressed: $event=", $event);
                if ($event.keyCode == 13) {
                    searchSettingsChanged($scope, $location);
                }
            };

            focus('activation');
        }])
    ;

function parseRouteParams($scope, $routeParams) {
    $scope.searchMode = 'Literal';
    $scope.searchRegex = undefined;
    $scope.termListFilter = "";

    if (!$routeParams.search) {
        return;
    }
    var s = $routeParams.search;
    var q = s.match(/!(g|r)\/(.*)/);
    if (q) {
        $scope.searchMode = q[1] == 'g' ? 'Glob' : 'Regex';
        $scope.termListFilter = q[2];
    }
    else {
        $scope.termListFilter = s;
    }
}

function preparePageSize($scope, $timeout) {
    $scope.pageSize = vutil.options.pageSize;
    $scope.pageSizeEnter = $scope.pageSize;

    function setSize(newSize) {
        $scope.pageSizeEnter = newSize;
        $timeout(function() {
            vutil.options.pageSize = $scope.pageSize = $scope.pageSizeEnter;
            $scope.$digest();
        }, 500);
    }

    $scope.pageSizeKeyPressed = function($event) {
        if ($event.keyCode == 13) {
            if ($scope.pageSizeEnter.trim().length == 0) {
                setSize("");
            }
            else {
                var num = parseInt($scope.pageSizeEnter);
                if (!isNaN(num) && num > 0)  {
                    setSize(num);
                }
            }
        }
    };
    $scope.showAll = function() {
        $scope.pageSizeEnter = "";
        vutil.options.pageSize = $scope.pageSize = undefined;
    };
}

function updateSearchVars($scope) {
    $scope.searchRegex = undefined;
    $scope.searchRegexError = undefined;
    $scope.termListFilter4grid = undefined;

    var searchText = $scope.termListFilter.trim();
    if ($scope.searchMode === 'Literal') {
        $scope.termListFilter4grid = searchText;
    }
    else if (searchText.length == 0) {
        $scope.searchRegex = "";  // #14
    }
    else {
        var translate = function(str) {
            return $scope.searchMode === 'Glob' ? vutil.globToRegex(str) : str;
        };

        var field;
        var parts = searchText.split(/\s+/);
        if (parts.length == 1) {
            field = translate(searchText);
        }
        else {
            var regexes = _.map(parts, function(p) { return '(' + translate(p) + ')'; });
            field = regexes.join('|');
        }
        try {
            $scope.searchRegex = new RegExp(field, 'im');
        }
        catch (e) {
            $scope.searchRegexError = e.message;
            throw e;
        }
    }
}

// called upon change in termListFilter or searchMode to update location
function searchSettingsChanged($scope, $location) {
    var searchText = $scope.termListFilter.trim();
    searchText = searchText.replace("?", "%3F");
    if ($scope.searchMode === 'Literal') {
        if (searchText.length > 0) {
            $location.url("/search/" + searchText);
        }
        else {
            $location.url("/");
        }
    }
    else if ($scope.searchMode === 'Glob') {
        $location.url("/search/!g/" + searchText);
    }
    else if ($scope.searchMode === 'Regex') {
        $location.url("/search/!r/" + searchText);
    }
}

function getTermList($scope, dataService) {
    var workId = $scope.works.add("making term list query");
    var htmlify = true;

    var prepareName = function(term) {
        var name = term.name;
        var termName = vutil.getTermName(name);
        return htmlify ? vutil.htmlifyTerm(termName, name) : _.escape(termName)
    };

    var prepareDefinition = function(term) {
        var def = term.definition;
        return htmlify ? vutil.htmlifyObject(def, dataService.cachedTermDict()) : _.escape(def)
    };

    var prepareCanonicalUnits = function(term) {
        return htmlify ? vutil.htmlifyObject(term.canonicalUnits) : _.escape(term.canonicalUnits)
    };

    var filterByRegex = function(termList, regex) {
        return _.filter(termList, function(term) {
            var termName = vutil.getTermName(term.name);
            return regex.test(termName)
                || regex.test(term.definition)
                || regex.test(term.canonicalUnits);
        });
    };

    var gotTermList = function(error, termList) {
        //console.log("gotTermList: ", termList);

        $scope.totalTerms = 0;
        if (error) {
            $scope.works.remove(workId);
            $scope.error = error;
            $scope.errors.add(error);
            return;
        }

        $scope.totalTerms = termList.length;

        if ($scope.searchRegex) {
            console.log("tp applyregex", $scope.searchRegex);
            termList = filterByRegex(termList, $scope.searchRegex);
            console.log("after applying regex", $scope.searchRegex, termList.length);
        }

        $scope.termList = _.map(termList, function(term) { // with htmlified or escaped uri's
            return {
                name:           prepareName(term),
                definition:     prepareDefinition(term),
                canonicalUnits: prepareCanonicalUnits(term)
            };
        });
        $scope.works.remove(workId);
    };

    dataService.getTermList({gotTermList: gotTermList});
}

})();
