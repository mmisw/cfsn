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
            var cache = {
                termDict: {},
                termList: undefined,
                nercDict: {}
            };

            /**
             * Customized error handler for an http request.
             * @param cb         callback to report error.
             * @returns {Function}  handler
             */
            var httpErrorHandler = function(cb) {
                return function(data, status, headers, config) {
                    var reqMsg = config.method + " '" + config.url + "'";
                    var error = "An error occured with HTTP request: " +reqMsg;
                    //error += "<br/> query: " + _.escape(config.params.query).replace(/\n/, '<br/>');
                    error += "<br/>Status: " + status;
                    cb(error);
                };
            };

            function getTermList(fns) {

                if (cache.termList) {
                    //console.log("termList in cache");
                    fns.gotTermList(undefined, cache.termList);
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
                            var name           = vutil.cleanQuotes(e[0]);
                            var definition     = vutil.cleanQuotes(e[1]);
                            var canonicalUnits = vutil.cleanQuotes(e[2]);

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

                        fns.gotTermList(undefined, cache.termList);
                    })
                    .error(httpErrorHandler(fns.gotTermList));
            }

            function getTermDetails(termName, fns) {

                if (termName in cache.termDict) {
                    //console.log("term", termName, "in cache");
                    var termDetails = cache.termDict[termName];
                    fns.gotTermDetails(undefined, termDetails);
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
                                definition:     vutil.cleanQuotes(rows[0][0]),
                                canonicalUnits: vutil.cleanQuotes(rows[0][1])
                            };
                            cache.termDict[termName] = termDetails;
                            fns.gotTermDetails(undefined, termDetails);
                            return;
                        }
                        if (rows.length > 1) {
                            console.log("WARN: unexpected number of results: ", rows.length);
                        }
                        fns.gotTermDetails("WARN: unexpected number of results: ", rows.length);
                    })
                    .error(httpErrorHandler(fns.gotTermDetails));
            }

            function getNercTermUri(termName, fns) {

                if (termName in cache.nercDict) {
                    //console.log("getNercTermUri", termName, "in cache");
                    var uri = cache.nercDict[termName].uri;
                    fns.gotNercTermUri(undefined, uri);
                    return;
                }

                var query = cfsnConfig.nerc.uriQueryTemplate.replace('{{stdname}}', termName);
                console.log("making query: " + query + "\nagainst: " +cfsnConfig.nerc.sparqlEndpoint);

                $http.get(cfsnConfig.nerc.sparqlEndpoint, {params: {query: query, output: 'json'}})
                    .success(function (data, status, headers, config) {
                        //console.log("getNercTermUri: data= ", data);
                        // TODO more appropriate check of the response
                        var uri = data.results.bindings[0].uri.value;
                        //console.log("getNercTermUri: uri= ", uri);
                        cache.nercDict[termName] = {uri: uri};
                        fns.gotNercTermUri(undefined, uri);
                    })
                    .error(httpErrorHandler(fns.gotNercTermUri));
            }

            return {
                cachedTermDict:   function() { return cache.termDict; },
                getTermList:      getTermList,
                getTermDetails:   getTermDetails,

                getNercTermUri:   getNercTermUri
            };
        }]);
