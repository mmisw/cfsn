'use strict';

angular.module('cfsn.main.controller', ['trNgGrid'])

    .controller('MainCtrl', ['$scope', '$routeParams', '$location', '$timeout', 'dataService', 'Works',
        function ($scope, $routeParams, $location, $timeout, dataService, Works) {

            Works.works.removeAll();
            $scope.works = Works.works;

            $scope.termListFilter = $routeParams.search ? $routeParams.search : "";

            (function preparePageSize() {
                $scope.pageSize = 25;
                $scope.pageSizeEnter = $scope.pageSize;

                function setSize(newSize) {
                    $scope.pageSizeEnter = newSize;
                    $timeout(function() {
                        $scope.pageSize = $scope.pageSizeEnter;
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
                    $scope.pageSize = undefined;
                };
            })();

            $scope.termList = [];

            getTermList($scope, dataService);

            $scope.searchKeyPressed = function($event) {
                //console.log("searchKeyPressed: $event=", $event);
                if ($event.keyCode == 13) {
                    var searchText = $scope.termListFilter.trim();
                    if (searchText.length > 0) {
                        $location.url("/search/" + searchText);
                    }
                    else {
                        $location.url("/");
                    }
                }
            };
        }])
    ;


function getTermList($scope, dataService) {
    var workId = $scope.works.add("making term list query");
    var htmlify = true;

    function prepareName(name) {
        var termName = vutil.getTermName(name);
        return htmlify ? vutil.htmlifyTerm(termName, name) : _.escape(termName)
    }

    dataService.getTermList({
        gotTermList: function(termList) {
            //console.log("gotTermList: ", result);

            $scope.termList = _.map(termList, function(term) { // with htmlified or escaped uri's
                return {
                    name:           prepareName(term.name),
                    description:    vutil.htmlifyObject(term.definition, dataService.cachedTermDict()),
                    canonicalUnits: vutil.htmlifyObject(term.canonicalUnits)
                };
            });
            $scope.works.remove(workId);
        }
    });
}
