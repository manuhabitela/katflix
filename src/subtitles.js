var Q = require('q');
var subtitler = require('subtitler');
var gunzip = require('gunzip-maybe');
var fs = require('fs');
var http = require('http');
var os = require('os');
var view = require('./view.js');

module.exports = function subtitles(torrent, languages) {
    var deferred = Q.defer();

    waitForSubtitlesInput(torrent)
        .then(function(subtitlesTerms) {
            if (!subtitlesTerms) {
                deferred.resolve(false);
            }
            return fetchSubtitles(subtitlesTerms, languages);
        })
        .then(listSubtitles)
        .then(selectSubtitles)
        .then(downloadSubtitles)
        .then(function(subtitlesFile) {
            deferred.resolve(subtitlesFile);
        });

    return deferred.promise;
};

function waitForSubtitlesInput(torrent) {
    var deferred = Q.defer();
    view.askFor("What subtitles to search? Type \"no\" to skip:", {
        defaultAnswer: torrent
    }).then(function(input) {
        deferred.resolve(input === "no" ? false : input);
    });

    return deferred.promise;
}

function fetchSubtitles(query, languages) {
    var deferred = Q.defer();
    if (!query) {
        deferred.resolve([]);
    }

    searchSubtitles(query, languages).then(function(results) {
        deferred.resolve(results);
    });

    return deferred.promise;
}

function searchSubtitles(title, languages) {
    var deferred = Q.defer();
    var token;
    subtitler.api.login().then(function(apiToken) {
        token = apiToken;
        return multipleLanguagesSearch(title, languages, token);
    }).then(function(allSubtitles) {
        subtitler.api.logout(token);
        deferred.resolve(allSubtitles);
    });

    return deferred.promise;
}

function multipleLanguagesSearch(title, languages, token) {
    var deferred = Q.defer();

    Q.all(languages.map(function(lang) {
        return singleLanguageSearch(title, lang, token);
    })).done(function(lists) {
        var allSubtitles = [];
        lists.forEach(function(list) {
            allSubtitles = allSubtitles.concat(list);
        });
        deferred.resolve(allSubtitles);
    })

    return deferred.promise;
}

function singleLanguageSearch(title, language, token) {
    var deferred = Q.defer();
    subtitler.api.searchForTitle(token, language, title).then(function(results) {
        deferred.resolve(results);
    });
    return deferred.promise;
}

function listSubtitles(subtitlesList) {
    view.renderList(subtitlesList, renderSubtitlesLine);
    return subtitlesList;
}

function renderSubtitlesLine(subtitle) {
    var title = view.colors.cyan(subtitle.SubFileName);
    var lang = view.colors.yellow(subtitle.SubLanguageID);
    return [title, lang].join( view.colors.gray(" - ") );
}

function selectSubtitles(subtitlesList) {
    var deferred = Q.defer();

    view.selectItem(subtitlesList, "What subtitles to use?").then(function(item) {
        deferred.resolve(item);
    });

    return deferred.promise;
}

function downloadSubtitles(subtitles) {
    var deferred = Q.defer();
    var url = subtitles.SubDownloadLink;
    http.get(url, function(res) {
        var filename = os.tmpdir() + '/katflix-subtitle.srt';
        var output = fs.createWriteStream(filename);
        var uncompress = gunzip();
        output.on('close', function() {
            deferred.resolve(filename);
        });
        res.pipe(uncompress).pipe(output);
    });

    return deferred.promise;
}
