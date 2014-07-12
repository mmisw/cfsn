'use strict';

angular.module('cfsn.data', [])

    .factory('dataService', ['$http',
        function($http) {

            var rdfType = "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>";
            var snClass = '<' + cfsnConfig.snClass + '>';
            var definition = '<' + cfsnConfig.predicates.definition + '>';
            var canonicalUnits = '<' + cfsnConfig.predicates.canonicalUnits + '>';

            function logQuery(query) {
                console.log("making query: " + query);
            }

            function getTermList(fns) {
                var query = 'select distinct ?name ?definition ?canonicalUnits where {\n' +
                    '  ?name ' +rdfType+ ' ' + snClass + '.\n' +
                    '  ?name ' +definition+ ' ?definition.\n' +
                    '  ?name ' +canonicalUnits+ ' ?canonicalUnits.\n' +
                    '}\n' +
                    'order by ?name';

                logQuery(query);

                $http.get(cfsnConfig.sparqlEndpoint, {params: {query: query}})
                    .success(function (data, status, headers, config) {
                        //console.log("getTermList: data= ", data);

                        //var names = data.names;
                        var rows = data.values;

                        var result = _.map(rows, function (e) {
                            return {
                                name:           e[0],
                                definition:     e[1],
                                canonicalUnits: e[2]
                            };
                        });

                        fns.gotTermList(result);
                    }
                );
            }

            function getTermDetails(termName, fns) {
                var termUri = '<' + cfsnConfig.snPrefix + termName + '>';
                var query = 'select distinct ?definition ?canonicalUnits where {\n' +
                    '  ' +termUri+ ' ' +definition+ ' ?definition.\n' +
                    '  ' +termUri+ ' ' +canonicalUnits+ ' ?canonicalUnits.\n' +
                    '}';

                logQuery(query);

                $http.get(cfsnConfig.sparqlEndpoint, {params: {query: query}})
                    .success(function (data, status, headers, config) {
                        //console.log("getTermDetails: data= ", data);
                        //var names = data.names;
                        var rows = data.values;

                        if (rows.length == 1) {
                            var termDetails = {
                                definition:     rows[0][0],
                                canonicalUnits: rows[0][1]
                            };
                            fns.gotTermDetails(termDetails);
                            return;
                        }
                        if (rows.length > 1) {
                            console.log("WARN: unexpected number of results: ", rows.length);
                        }
                        fns.gotTermDetails(undefined);
                    }
                );
            }

            return {
                getTermList:      getTermList,
                getTermDetails:   getTermDetails
            };
        }]);
