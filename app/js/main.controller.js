'use strict';

angular.module('cfsn.main.controller', ['trNgGrid'])

    .controller('MainCtrl', ['$scope', '$routeParams', '$location', '$timeout', 'dataService', 'Works', 'focus',
        function ($scope, $routeParams, $location, $timeout, dataService, Works, focus) {

            Works.works.removeAll();
            $scope.works = Works.works;

            $scope.searchMode = 'Default';
            $scope.searchRegex = undefined;


            if ($routeParams.search) {
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
            else {
                $scope.termListFilter = "";
            }

            (function preparePageSize() {
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
            })();

            $scope.totalTerms = 0;
            $scope.termList = [];

            updateSearchVars();
            getTermList($scope, dataService);

            $scope.stopPropagation = function($event) {
                // avoids dropdown getting closed
                $event.stopPropagation();
            };

            function updateSearchVars() {
                $scope.searchRegex = undefined;
                $scope.searchRegexError = undefined;
                $scope.termListFilter4grid = undefined;

                var searchText = $scope.termListFilter.trim();
                if ($scope.searchMode === 'Default') {
                    $scope.termListFilter4grid = searchText;
                }
                else if ($scope.searchMode === 'Glob') {
                    $scope.searchRegex = vutil.globToRegex(searchText);
                }
                else if ($scope.searchMode === 'Regex') {
                    try {
                        $scope.searchRegex = new RegExp(searchText, 'gim');
                    }
                    catch (e) {
                        $scope.searchRegexError = e.message;
                    }
                }
            }

            // called upon change in termListFilter or searchMode to update location
            function searchSettingsChanged() {
                var searchText = $scope.termListFilter.trim();
                searchText = searchText.replace("?", "%3F");
                if ($scope.searchMode === 'Default') {
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

            $scope.$watch('searchMode', function(searchMode) {
                //console.log("watch searchMode", searchMode);
                searchSettingsChanged();
//                if (searchMode === 'Default') {
//                    // returning from glob or regex search, so refresh whole term list:
//                    getTermList($scope, dataService);
//                }
//                updateSearchVars();
            });

            $scope.$watch('termListFilter', function(newTermListFilter) {
               updateSearchVars();
            });

            $scope.invalidSearchField = function() {
                return $scope.searchRegexError !== undefined;
            };

            $scope.searchKeyPressed = function($event) {
                //console.log("searchKeyPressed: $event=", $event);
                if ($event.keyCode == 13) {
                    searchSettingsChanged();
                }
            };

            focus('activation');
        }])
    ;


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

    dataService.getTermList({
        gotTermList: function(error, termList) {
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
                var regex = $scope.searchRegex;
                termList = _.filter(termList, function(term) {
                    return regex.test(vutil.getTermName(term.name))
                        || regex.test(term.definition)
                        || regex.test(term.canonicalUnits);
                });
                //console.log("after applying regex", regex, ": terms=", termList);
            }

            $scope.termList = _.map(termList, function(term) { // with htmlified or escaped uri's
                return {
                    name:           prepareName(term),
                    description:    prepareDefinition(term),
                    canonicalUnits: prepareCanonicalUnits(term)
                };
            });
            $scope.works.remove(workId);
        }
    });
}
