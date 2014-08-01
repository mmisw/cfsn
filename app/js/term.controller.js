'use strict';

(function() {

angular.module('cfsn.term.controller', ['trNgGrid'])

    .controller('TermCtrl', ['$scope', '$routeParams', 'dataService', 'Works',
        function ($scope, $routeParams, dataService, Works) {

            Works.works.removeAll();
            $scope.works = Works.works;

            $scope.termName = $routeParams.term;
            //console.log("$scope.termName=", $scope.termName);

            $scope.termDetails = {};

            prepareMappings($scope);

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

            $scope.termDetails.searching = false;
            if (error) {
                $scope.termDetails = {found: false};
                $scope.works.remove(workId);
                $scope.errors.add(error);
                return;
            }

            if (termDetails) {
                var termUri = cfsnConfig.orr.snPrefix + $scope.termName;
                $scope.externalLink = termUri;
                $scope.termDetails = {
                    found:          true,
                    definition:     processContent(termDetails.definition),
                    canonicalUnits: processContent(termDetails.canonicalUnits),
                    orrUri:        '<a href="' +$scope.externalLink+ '">' + $scope.externalLink + '</a>'
                };
                getMappings($scope, dataService, termUri, 'orr');

                getNercTermUri($scope, dataService);
            }
            else {
                $scope.termDetails = {found: false};
            }

            $scope.works.remove(workId);
        }
    });
}

function getNercTermUri($scope, dataService) {
    var workId = $scope.works.add("making NVS query");
    dataService.getNercTermUri($scope.termName, {
        gotNercTermUri: function(error, termUri) {
            $scope.works.remove(workId);
            if (error) {
                $scope.errors.add(error);
                return;
            }
            $scope.nercExternalLink = termUri;
            getMappings($scope, dataService, termUri, 'nvs');
        }
    });
}

function prepareMappings($scope) {
    $scope.cfsnConfig = cfsnConfig;

    $scope.mappingPredicates = cfsnConfig.mapping.predicates;

    $scope.mappingResults = {orr: {}, nvs: {}};
    _.each($scope.mappingPredicates, function(pred) {
        $scope.mappingResults.orr[pred.predicate] = [];
        $scope.mappingResults.orr[pred.predicate].searching = false;

        $scope.mappingResults.nvs[pred.predicate] = [];
        $scope.mappingResults.nvs[pred.predicate].searching = false;
    });

}

function getMappings($scope, dataService, termUri, repo) {
    var sparqlEndpoint = cfsnConfig[repo].sparqlEndpoint;
    var workId = $scope.works.add("making mapping queries");
    _.each(cfsnConfig.mapping.predicates, function(pred) {
        $scope.works.update(workId, "making mapping query for " + pred.label);
        $scope.mappingResults[repo][pred.predicate].searching = true;
        dataService.getMappings(termUri, pred.queryTemplate, sparqlEndpoint, {
            gotMappings: function(error, objects) {
                $scope.mappingResults[repo][pred.predicate].searching = false;
                if (error) {
                    $scope.errors.add(error);
                    return;
                }

                console.log("GOT objects", objects, "for predicate", pred.label);
                $scope.mappingResults[repo][pred.predicate] = _.map(objects, function(o) {
                    return vutil.mkExternalLink4Uri(o, true);
                });
            }
        });
    });
    $scope.works.remove(workId);
}

})();
