'use strict';

(function() {

angular.module('cfsn.main.controller', ['trNgGrid'])

.controller('MainCtrl', ['$scope', '$routeParams', '$location', '$timeout', 'dataService', 'Works', 'focus',
    function ($scope, $routeParams, $location, $timeout, dataService, Works, focus) {

        //console.log("trNgGridPager", angular.module('trNgGrid'));

        Works.works.removeAll();
        $scope.works = Works.works;
        $scope.selCategories = _.map(cfsnConfig.categories, function(cat) {
            return {label: cat.label, searchString: cat.searchString};
        });
        $scope.totalTerms = 0;
        $scope.termList = [];

        parseRouteParams($scope, $routeParams);
        updateSearchVars($scope);

        preparePageSize($scope, $timeout);

        $scope.stopPropagation = function($event) {
            // avoids dropdown getting closed
            $event.stopPropagation();
        };

        $scope.invalidSearchField = function() {
            return $scope.searchRegexError !== undefined;
        };

        $scope.searchKeyPressed = function($event) {
            //console.log("searchKeyPressed: $event=", $event);
            if ($event.keyCode == 13) {
                searchSettingsChanged($scope, $location);
            }
        };

        getTermList($scope, dataService, function() {
            setWatchers($scope, $location);
        });

        focus('activation');
    }])
;

function parseRouteParams($scope, $routeParams) {
    $scope.searchMode = 'Literal';
    $scope.searchRegex = undefined;
    $scope.termListFilter = "";

    var search = $routeParams.search;
    if (!search || search.length == 0) {
        return;
    }

    if (search[0] !== '!') {
        $scope.termListFilter = search;
        return;
    }
    var parts = search.split('!');
    parts.shift(); // skip first empty element

    _.each(parts, function(part) {
        var q = part.match(/(c|g|r)\/(.*)/);
        if (q) {
            var key = q[1];
            var arg = q[2];
            if (key == 'c') {
                var e = _.find($scope.selCategories, {label: arg});
                if (e) {
                    e.selected = true;
                }
            }
            else {
                $scope.searchMode = key == 'g' ? 'Glob' : 'Regex';
                $scope.termListFilter = arg;
            }
        }
        else {
            console.log("warning: part ignored:", part);
        }
    });
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
            //throw e;
        }
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

function searchSettingsChanged($scope, $location) {

    var parts4location = [];

    // capture selected categories:
    _.each($scope.selCategories, function(cat) {
        if (cat.selected) {
            parts4location.push("c/" + cat.label);
        }
    });

    // capture global search:
    var searchText = $scope.termListFilter.trim();
    searchText = searchText.replace("?", "%3F");
    if ($scope.searchMode === 'Literal') {
        if (searchText.length > 0) {
            parts4location.push("/" + searchText);
        }
    }
    else if ($scope.searchMode === 'Glob') {
        parts4location.push("g/" + searchText);
    }
    else if ($scope.searchMode === 'Regex') {
        parts4location.push("r/" + searchText);
    }
    //console.log("searchSettingsChanged: parts4location", parts4location);

    if (parts4location.length == 0) {
        $location.url("/");
    }
    else {
        var url = "/search/!" + parts4location.join('!');
        $location.url(url);
    }
}

function filterByRegex(termList, regex) {
    if (!regex || regex.length == 0) {
        return termList;
    }
    //console.log("to apply regex", regex);
    termList = _.filter(termList, function(term) {
        var termName = vutil.getTermName(term.name);
        return regex.test(termName)
            || regex.test(term.definition)
            || regex.test(term.canonicalUnits);
    });
    console.log("after applying regex", regex, termList.length);
    return termList;
}

function applyFilters($scope, termList) {
    var regex;

    // first, do filtering according to selected categories:
    $scope.numberAfterCategories = termList.length;
    var selectedCategories = _.filter($scope.selCategories, "selected");
    //console.log("applyFilters selectedCategories", selectedCategories);
    if (selectedCategories.length > 0) {
        var allParts = [];
        _.each(selectedCategories, function(cat) {
            var catDef = _.find(cfsnConfig.categories, {label: cat.label});
            allParts = allParts.concat(catDef.searchString.split(/\s+/));
        });
        allParts = _.uniq(allParts);
        if (allParts.length == 1) {
            regex = allParts[0];
        }
        else {
            regex = _.map(allParts, function(part) { return '(' + part + ')' }).join('|');
        }
        termList = filterByRegex(termList, new RegExp(regex, 'im'));
        $scope.numberAfterCategories = termList.length;
    }

    // now, by global field:
    $scope.numberAfterGlobalFilter = termList.length;
    termList = filterByRegex(termList, $scope.searchRegex);
    $scope.numberAfterGlobalFilter = termList.length;
    return termList;
}

function setWatchers($scope, $location) {
    $scope.$watch('selCategories', function() {
        //console.log("$watch selCategories", $scope.selCategories);
        searchSettingsChanged($scope, $location);
    }, true);

    $scope.$watch('searchMode', function(searchMode) {
        //console.log("watch searchMode", searchMode);
        searchSettingsChanged($scope, $location);
    });

    $scope.$watch('termListFilter', function(newTermListFilter) {
       updateSearchVars($scope);
    });
}

function getTermList($scope, dataService, then) {
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

    var gotTermList = function(error, termList) {
        //console.log("gotTermList: ", termList);

        $scope.totalTerms = 0;
        if (error) {
            $scope.works.remove(workId);
            $scope.error = error;
            $scope.errors.add(error);
            if (then) then();
            return;
        }

        $scope.totalTerms = termList.length;

        termList = applyFilters($scope, termList);

        $scope.termList = _.map(termList, function(term) { // with htmlified or escaped uri's
            return {
                name:           prepareName(term),
                definition:     prepareDefinition(term),
                canonicalUnits: prepareCanonicalUnits(term)
            };
        });
        $scope.works.remove(workId);
        if (then) then();
    };

    dataService.getTermList({gotTermList: gotTermList});
}

})();
