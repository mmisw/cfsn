'use strict';

angular.module('cfsn.term.controller', ['trNgGrid'])

    .controller('TermCtrl', ['$scope', '$routeParams', 'dataService', 'Works',
        function ($scope, $routeParams, dataService, Works) {

            Works.works.removeAll();
            $scope.works = Works.works;

            $scope.termName = $routeParams.term;
            //console.log("$scope.termName=", $scope.termName);

            $scope.termDetails = {};
            getTermDetails($scope, dataService);
        }])
    ;


function getTermDetails($scope, dataService) {
    var workId = $scope.works.add("making term details query");
    var htmlify = true;

    function processContent(content) {
        return htmlify ? vutil.htmlifyObject(content, dataService.cachedTermDict()) : _.escape(content);
    }

    $scope.termDetails.searching = true;
    $scope.nercExternalLink = undefined;
    dataService.getTermDetails($scope.termName, {
        gotTermDetails: function(error, termDetails) {
            //console.log("gotTermDetails: ", termDetails);

            if (error) {
                $scope.termDetails = {found: false};
                $scope.termDetails.searching = false;
                $scope.works.remove(workId);
                $scope.errors.add(error);
                return;
            }

            if (termDetails) {
                $scope.externalLink = cfsnConfig.snPrefix + $scope.termName;
                $scope.termDetails = {
                    found:          true,
                    definition:     processContent(termDetails.definition),
                    canonicalUnits: processContent(termDetails.canonicalUnits),
                    orrUri:        '<a href="' +$scope.externalLink+ '">' + $scope.externalLink + '</a>'
                };

                dataService.getNercTermUri($scope.termName, {
                    gotNercTermUri: function(error, uri) {
                        $scope.termDetails.searching = false;
                        $scope.works.remove(workId);
                        if (error) {
                            $scope.errors.add(error);
                            return;
                        }
                        $scope.nercExternalLink = uri;
                    }
                });
            }
            else {
                $scope.termDetails = {found: false};
            }

            $scope.termDetails.searching = false;

            $scope.works.remove(workId);
        }
    });
}
