'use strict';

(function() {

angular.module('cfsn.filters', [])
  .filter('interpolate', ['version', function(version) {
    return function(text) {
      return String(text).replace(/\%VERSION\%/mg, version);
    }
  }])

  .filter('mklinks', [function() {
    return function(text) {
      return vutil.mklinks4text(text);
    }
  }])

  .filter('htmlifyTerm', [function() {
    return function(name, search) {
      var termName = vutil.getTermName(name);
      var text = termName;
      //// TODO, highlight search string
      //var re = new RegExp(search, 'gi');
      //text = termName.replace(re, '<span class="highlight">$&</span>');
      return '<a href="#/' + termName + '">' + text + '</a>';
    }
  }])

  .filter('htmlifyDefinition', ['dataService', function(dataService) {
    return function(text, search) {
      return vutil.htmlifyObject(text, dataService.cachedTermDict());
      //// TODO, highlight search string
      // var re = new RegExp(search, 'gi');
      // return text.replace(re, '<span class="highlight">$&</span>');
    }
  }])

;

})();
