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

            /*
             * cache.termDict: populated individually if first requests are individual terms,
             * and all at once for the full list request.
             * cache.termList: version for the grid widget.
             */
            var cache = {termDict: {}, termList: undefined};

            function getTermList(fns) {

                if (cache.termList) {
                    //console.log("termList in cache");
                    fns.gotTermList(cache.termList);
                    return;
                }

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

                        cache.termDict = {};

                        cache.termList = _.map(rows, function (e) {
                            var name           = e[0];
                            var definition     = e[1];
                            var canonicalUnits = e[2];

                            var termName = vutil.getTermName(name);

                            cache.termDict[termName] = {
                                definition:     definition,
                                canonicalUnits: canonicalUnits
                            };

                            return {
                                name:           name,
                                definition:     definition,
                                canonicalUnits: canonicalUnits
                            };
                        });

                        fns.gotTermList(cache.termList);
                    }
                );
            }

            function getTermDetails(termName, fns) {

                if (termName in cache.termDict) {
                    //console.log("term", termName, "in cache");
                    var termDetails = cache.termDict[termName];
                    fns.gotTermDetails(termDetails);
                    return;
                }

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
                            cache.termDict[termName] = termDetails;
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
                cachedTermDict:   function() { return cache.termDict; },
                getTermList:      getTermList,
                getTermDetails:   getTermDetails
            };
        }]);
