'use strict';

/* utilities */

var vutil = (function () {
    var uriRegex = /\b(https?:\/\/[0-9A-Za-z-\.\/&@:%_\+~#=\?\(\)]+\b)/g;

    function n2br(str) {
        str = str.replace(/\\n/g, "\n");
        str = str.replace(/\n/g, "<br />\n");
        return str;
    }

    function mklinks4uri(uri, possibleBrackets, text4link) {
        var pre = "";
        var post = "";
        if (possibleBrackets !== undefined && possibleBrackets) {
            var m = uri.match(/^(<)?([^>]*)(>)?$/);
            pre  = _.escape(m[1]);
            uri  = m[2];
            post = _.escape(m[3]);
        }
        var url4link = uri.replace(/#/g, "%23");
        text4link = text4link || uri;

        var link = '<a href="#/' + url4link + '">' + text4link + '</a> '
            + '<a class="fa fa-external-link" target="_blank" title="open directly in a new browser window" href="' + uri + '"></a>';

        //console.log("mklinks4uri:" +pre + "|" + link + "|" +post);
        return pre + link + post;
    }

    function mklinks4uriNoBrackets(uri) {
        return mklinks4uri(uri);
    }

    function mklinks4text(str) {
        // first, escape original text
        str = _.escape(str);
        // but restore any '&' for the links processing below:
        str = str.replace(/&amp;/g, "&");
        // then, add our re-formatting
        str = n2br(str);
        str = str.replace(uriRegex, mklinks4uriNoBrackets);
        return str;
    }

    /**
     * Updates model array with responsive updates to the UI as elements are
     * transferred from sourceArray to targetArray.
     *
     * @param targetArray
     * @param sourceArray
     * @param stepFn         stepFn(done) called at every chunk update, with
     *                       done indicating whether the update has been completed.
     *                       If not complete, return true to continue the updates.
     * @param chunkSize      the larger this value the less responsive the ui.
     */
    function updateModelArray(targetArray, sourceArray, stepFn, chunkSize) {
        chunkSize = chunkSize || 5;
        var jj = 0, len = sourceArray.length;
        setTimeout(function () {
            function processNext() {
                for (var kk = 0; jj < len && kk < chunkSize; kk++, jj++) {
                    var elm = sourceArray[jj];
                    targetArray.push(elm);
                }

                var done = jj >= len;
                var cont = stepFn(done);

                if (!done && cont) {
                    setTimeout(processNext, 0);
                }
            }
            processNext();
        }, 0);

    }

    // regex to recognize std names within a text.
    // for now, only those lowercase words having embedded underscores, which are
    // the majority. TODO recognize std names not having underscores.
    var stdNameRegex = /\b(([a-z]+_[a-z]+)+)\b/g;

    function mklinks4stdName(stdName, p1) {
        return '<a href="#/' + p1 + '">' + p1 + '</a>';
    }

    function htmlifyObject(value) {
        if (/^<([^>]*)>$/.test(value)) {
            // it is an uri.
            value = vutil.mklinks4uri(value, true);
        }
        else {
            // \"Age of sea ice\" means...  -->  "Age of sea ice" means...
            value = value.replace(/\\"/g, '"');

            value = value.replace(/^"(.*)"$/, '$1');

            // string with language tag?
            var m = value.match(/^("[^"]+")(@[A-Za-z\-]+)$/);
            if (m) {
                // http://stackoverflow.com/questions/7885096/how-do-i-decode-a-string-with-escaped-unicode
                value = '"' + decodeURIComponent(JSON.parse(m[1])) + '"' + m[2];
            }
            else {
                value = vutil.mklinks4text(value);
            }

            value = value.replace(stdNameRegex, mklinks4stdName);
        }
        return value;
    }

    function htmlifyUri(uri, text4link) {
        return vutil.mklinks4uri(uri, true, text4link);
    }

    function htmlifyTerm(termName, uri, withExternal) {
        //console.log("htmlifyTerm:", termName);
        var url4link = uri.replace(/#/g, "%23");

        var link = '<a href="#/' + termName + '">' + termName + '</a>';

        if (withExternal !== undefined && withExternal) {
            link += ' <a class="fa fa-external-link" target="_blank" title="open term URI directly in a new browser window" href="'
                + url4link + '"></a>';
        }

        return link;
    }

    // removes the prefix
    function getTermName(name) {
        var termName = name.replace(/^<(.*)>$/, '$1');
        if (termName.indexOf(cfsnConfig.snPrefix) == 0) {
            termName = termName.substring(cfsnConfig.snPrefix.length);
        }
        return termName;
    }

    return {
        mklinks4uri:         mklinks4uri,
        mklinks4text:        mklinks4text,
        updateModelArray:    updateModelArray,
        loadingSnippet:      '<div class="loading"> loading</div>',
        htmlifyObject:       htmlifyObject,
        htmlifyUri:          htmlifyUri,
        htmlifyTerm:         htmlifyTerm,
        getTermName:         getTermName
    };
})();
