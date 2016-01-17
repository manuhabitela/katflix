var Q = require('q');
var osApi = require('subtitler').api;
var a7Api = require('addic7ed-api');
var gunzip = require('gunzip-maybe');
var fs = require('fs');
var http = require('http');
var os = require('os');
var view = require('./view.js');

module.exports = function subtitles(searchSuggestion, languages, mode) {
    var deferred = Q.defer();

    waitForSubtitlesInput(searchSuggestion, mode)
        .then(function(subtitlesTerms) {
            if (!subtitlesTerms) {
                deferred.resolve(false);
            }
            return searchSubtitles(subtitlesTerms, languages, mode);
        })
        .then(listSubtitles)
        .then(selectSubtitles)
        .then(function(selection) {
            return downloadSubtitles(selection, mode);
        })
        .then(function(subtitlesFile) {
            deferred.resolve(subtitlesFile);
        });

    return deferred.promise;
};

function waitForSubtitlesInput(searchSuggestion, mode) {
    var deferred = Q.defer();
    var question = "What subtitles to search?";
    if (mode === 'series') {
        question += " Format: Series SxxExx.";
    }
    view.askFor(question + " Type \"no\" to skip:", {
        defaultAnswer: searchSuggestion
    }).then(function(input) {
        deferred.resolve(input === "no" ? false : input);
    });

    return deferred.promise;
}

function searchSubtitles(query, languages, mode) {
    if (mode === 'series') {
        return searchSeriesSubtitles(query, languages);
    }
    return searchNormalSubtitles(query, languages);
}

function searchNormalSubtitles(query, languages) {
    var deferred = Q.defer();
    var token;
    osApi.login().then(function(apiToken) {
        token = apiToken;
        return multipleLanguagesSearch(query, languages, token);
    }).then(function(allSubtitles) {
        osApi.logout(token);
        deferred.resolve(normalizeSubtitles(allSubtitles));
    });
    return deferred.promise;

    function multipleLanguagesSearch(query, languages, token) {
        var deferred = Q.defer();

        Q.all(languages.map(function(lang) {
            return singleLanguageSearch(query, lang, token);
        })).done(function(lists) {
            var allSubtitles = [];
            lists.forEach(function(list) {
                allSubtitles = allSubtitles.concat(list);
            });
            deferred.resolve(allSubtitles);
        })

        return deferred.promise;
    }

    function singleLanguageSearch(query, language, token) {
        var deferred = Q.defer();
        osApi.searchForTitle(token, language, query).then(function(results) {
            deferred.resolve(results);
        });
        return deferred.promise;
    }
}

function searchSeriesSubtitles(query, languages) {
    var deferred = Q.defer();
    var info = extractQueryInfo(query);
    a7Api.search(info.series, info.season, info.episode, languages).then(function(results) {
        var subs = results.map(function(sub) {
            sub.name = [query, sub.distribution, sub.team, sub.version].join(' ');
            return sub;
        })
        deferred.resolve(normalizeSubtitles(subs));
    });
    return deferred.promise;
}

function extractQueryInfo(query) {
    var regex = / S(\d+)E(\d+)/;
    var matches = query.match(regex);
    if (!matches) {
        throw "Can't get episode info. Be sure to respect the format (like 'The Shield S01E01').";
    }
    var episodeInfoPosition = query.indexOf(matches[0]);
    var seriesName = query.slice(0, episodeInfoPosition);
    return {
        series: seriesName,
        season: matches[1],
        episode: matches[2]
    };
}

function normalizeSubtitles(subtitles) {
    function normalizeOneSub(sub) {
        sub.name = sub.SubFileName || sub.name;
        sub.language = sub.SubLanguageID || sub.langId;
        return sub;
    }
    if (Array.isArray(subtitles)) {
        return subtitles.map(normalizeOneSub);
    }
    return normalizeOneSub(subtitles);
}

function listSubtitles(subtitlesList) {
    view.renderList(subtitlesList, renderSubtitlesLine);
    return subtitlesList;
}

function renderSubtitlesLine(subtitle) {
    var title = view.colors.cyan(subtitle.name);
    var lang = view.colors.yellow(subtitle.language);
    return [title, lang].join( view.colors.gray(" - ") );
}

function selectSubtitles(subtitlesList) {
    var deferred = Q.defer();

    view.selectItem(subtitlesList, "What subtitles to use?").then(function(item) {
        deferred.resolve(item);
    });

    return deferred.promise;
}

function downloadSubtitles(subtitles, mode) {
    var destination = os.tmpdir() + '/katflix-subtitle.srt';
    if (mode === 'series') {
        return downloadSeriesSubtitles(subtitles, destination);
    }
    return downloadNormalSubtitles(subtitles, destination);
}

function downloadNormalSubtitles(source, destination) {
    var deferred = Q.defer();
    var url = source.SubDownloadLink;
    http.get(url, function(res) {
        var output = fs.createWriteStream(destination);
        var uncompress = gunzip();
        output.on('close', function() {
            deferred.resolve(destination);
        });
        res.pipe(uncompress).pipe(output);
    });

    return deferred.promise;
}

function downloadSeriesSubtitles(source, destination) {
    var deferred = Q.defer();
    a7Api.download(source, destination).then(function() {
        deferred.resolve(destination);
    });
    return deferred.promise;
}
