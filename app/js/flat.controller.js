'use strict';

angular.module('cfsn.flat.controller', [])
    .controller('FlatCtrl', ['$scope', 'dataService', 'Works',
        function ($scope, dataService, Works) {
            Works.works.removeAll();
            $scope.works = Works.works;

            $scope.totalTerms = 0;
            $scope.termList = [];

            function getTermList($scope, dataService) {
                var workId = $scope.works.add("making term list query");
                var htmlify = false;

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
                        return;
                    }

                    $scope.totalTerms = termList.length;

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

            getTermList($scope, dataService);
        }])
    ;
