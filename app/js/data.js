'use strict';

(function() {

angular.module('cfsn.data', []).factory('dataService', ['$http', function($http) {
    return {
        getGeneralInfo:   function(fns) { getGeneralInfo($http, fns); },
        getTermList:      function(fns) { getTermList($http, fns); },
        getTermDetails:   function(termName, fns) { getTermDetails($http, termName, fns); },
        getNercTermUri:   function(termName, fns) { getNercTermUri($http, termName, fns); },

        getMappings:   function(termUri, queryTemplate, sparqlEndpoint, fns) {
                         getMappings($http, termUri, queryTemplate, sparqlEndpoint, fns); },

        cachedTermDict:   function() { return cache.termDict; }
    };
}]);

/*
 * cache.termDict: populated individually if first requests are individual terms,
 * and all at once for the full list request.
 * cache.termList: version for the grid widget.
 */
var cache = {
    generalInfo: undefined,
    termDict: {},
    termList: undefined,
    nercDict: {}
};

function logQuery(query) {
    console.log("making query: " + query);
}

/**
 * Customized error handler for an http request.
 * @param cb         callback to report error.
 * @returns {Function}  handler
 */
function httpErrorHandler(cb) {
    return function(data, status, headers, config) {
        var reqMsg = config.method + " '" + config.url + "'";
        var error = "An error occured with HTTP request: " +reqMsg;
        //error += "<br/> query: " + _.escape(config.params.query).replace(/\n/, '<br/>');
        error += "<br/>Status: " + status;
        cb(error);
    };
}

function getGeneralInfo($http, fns) {
    if (cache.generalInfo) {
        //console.log("generalInfo", cache.generalInfo, "in cache");
        fns.gotGeneralInfo(undefined, cache.generalInfo);
        return;
    }

    // todo maybe also retrieve some general info from NVS.

    var query = cfsnConfig.orr.generalInfoQuery;

    logQuery(query);

    $http.get(cfsnConfig.orr.sparqlEndpoint, {params: {query: query}})
        .success(function (data, status, headers, config) {
            console.log("getGeneralInfo: data= ", data);
            var names = data.names;
            var rows = data.values;

            if (rows.length == 1) {
                cache.generalInfo = {"orr": {}};
                _.each(names, function(name, index) {
                    var value = rows[0][index];
                    if (value) {
                        cache.generalInfo.orr[name] = vutil.cleanQuotes(value);
                    }
                });
                fns.gotGeneralInfo(undefined, cache.generalInfo);
            }
            else if (rows.length == 0) {
                fns.gotGeneralInfo();  // not found
            }
            else {
                // should not happen.
                console.log("WARN: unexpected number of results: ", rows.length);
            }
        })
        .error(httpErrorHandler(fns.gotGeneralInfo));
}

function getTermList($http, fns) {

    if (cache.termList) {
        //console.log("termList in cache");
        fns.gotTermList(undefined, cache.termList);
        return;
    }

    var query = cfsnConfig.orr.termListQuery;
    logQuery(query);

    $http.get(cfsnConfig.orr.sparqlEndpoint, {params: {query: query}})
        .success(function (data, status, headers, config) {
            //console.log("getTermList: data= ", data);

            //var names = data.names;
            var rows = data.values;

            cache.termDict = {};

            cache.termList = _.map(rows, function (e) {
                var name           = vutil.cleanQuotes(e[0]);
                var definition     = e[1] ? vutil.cleanQuotes(e[1]) : "";
                var canonicalUnits = e[2] ? vutil.cleanQuotes(e[2]) : "";

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

function getTermDetails($http, termName, fns) {

    if (termName in cache.termDict) {
        //console.log("term", termName, "in cache");
        var termDetails = cache.termDict[termName];
        fns.gotTermDetails(undefined, termDetails);
        return;
    }

    var termUri = '<' + cfsnConfig.orr.snPrefix + termName + '>';
    var query = cfsnConfig.orr.termQueryTemplate.replace(/{{name}}/g, termUri);

    logQuery(query);

    $http.get(cfsnConfig.orr.sparqlEndpoint, {params: {query: query}})
        .success(function (data, status, headers, config) {
            console.log("getTermDetails: data= ", data);
            //var names = data.names;
            var rows = data.values;

            if (rows.length == 1) {
                var definition = rows[0][0];
                var canonicalUnits = rows[0][1];
                var termDetails = {
                    definition:     definition ? vutil.cleanQuotes(definition) : "",
                    canonicalUnits: canonicalUnits ? vutil.cleanQuotes(canonicalUnits) : ""
                };
                cache.termDict[termName] = termDetails;
                fns.gotTermDetails(undefined, termDetails);
            }
            else if (rows.length == 0) {
                fns.gotTermDetails();  // not found
            }
            else {
                // should not happen.
                console.log("WARN: unexpected number of results: ", rows.length);
            }
        })
        .error(httpErrorHandler(fns.gotTermDetails));
}

function getNercTermUri($http, termName, fns) {

    if (termName in cache.nercDict) {
        //console.log("getNercTermUri", termName, "in cache");
        var uri = cache.nercDict[termName].uri;
        fns.gotNercTermUri(undefined, uri);
        return;
    }

    var query = cfsnConfig.nvs.uriQueryTemplate.replace(/{{stdname}}/g, termName);
    console.log("making query: " + query + "\nagainst: " +cfsnConfig.nvs.sparqlEndpoint);

    $http.get(cfsnConfig.nvs.sparqlEndpoint, {params: {query: query, output: 'json'}})
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

function getMappings($http, termUri, queryTemplate, sparqlEndpoint, fns) {
    termUri = '<' + termUri + '>';

    var query = queryTemplate;
    query = query.replace(/{{termUri}}/g, termUri);
    console.log("making query: " + query + "\nagainst: " +sparqlEndpoint);

    $http.get(sparqlEndpoint, {params: {query: query, output: 'json'}, cache: true})
        .success(function (data, status, headers, config) {
            console.log("getMappings: data= ", data);

            // TODO in general, more generic check/parse of the response.

            var objects;
            if (data.results && data.results.bindings) {
                console.log("getMappings: data.results.bindings= ", data.results.bindings);
                objects = _.map(data.results.bindings, function(a) { return a.object.value });
            }
            else {
                objects = _.map(data.values, function(a) { return a[0] });
            }

            fns.gotMappings(undefined, objects);
        })
        .error(httpErrorHandler(fns.gotMappings));
}


})();