var Q = require('q');
var subtitler = require('subtitler');
var gunzip = require('gunzip-maybe');
var fs = require('fs');
var http = require('http');
var os = require('os');
var view = require('./view.js');

module.exports = function subtitles(originalData) {
    var deferred = Q.defer();

    waitForSubtitlesInput(originalData.torrent)
        .then(function(dataAfterInput) {
            if (!dataAfterInput.subtitles) {
                return deferred.resolve(originalData);
            }
            return fetchSubtitles(dataAfterInput);
        })
        .then(listSubtitles)
        .then(selectSubtitles)
        .then(downloadSubtitles)
        .then(function(finalData) {
            return deferred.resolve(finalData);
        });

    return deferred.promise;
};

function waitForSubtitlesInput(torrent) {
    var deferred = Q.defer();

    view.askFor("What subtitles to search? Type \"no\" to skip:", {
        defaultAnswer: torrent.title
    }).then(function(input) {
        return deferred.resolve({
            torrent: torrent,
            subtitles: input === "no" ? false : input
        });
    });

    return deferred.promise;
}

function fetchSubtitles(data) {
    var deferred = Q.defer();

    if (!data.subtitles) {
        return deferred.resolve(data);
    }

    searchSubtitles(data.subtitles).then(function(results) {
        return deferred.resolve({
            torrent: data.torrent,
            subtitles: results
        });
    });

    return deferred.promise;
}

function downloadSubtitles(data) {
    var deferred = Q.defer();

    var url = data.subtitles.SubDownloadLink;
    http.get(url, function(res) {
        var filename = os.tmpdir() + '/katflix-subtitle.srt';
        var output = fs.createWriteStream(filename);
        var uncompress = gunzip();
        output.on('close', function() {
            deferred.resolve({
                torrent: data.torrent,
                subtitles: filename
            });
        });
        res.pipe(uncompress).pipe(output);
    });

    return deferred.promise;
}

function searchSubtitles(title, language) {
    var deferred = Q.defer();

    subtitler.api.login().then(function(token) {
        subtitler.api.searchForTitle(token, language || "fre", title).then(function(results) {
            return {
                token: token,
                list: results
            };
        }).then(function(res) {
            subtitler.api.logout(res.token);
            return deferred.resolve(res.list);
        });
    });

    return deferred.promise;
}

function listSubtitles(data) {
    view.renderList(data.subtitles, renderSubtitlesLine);
    return data;
}

function renderSubtitlesLine(subtitle) {
    var title = view.colors.cyan(subtitle.SubFileName);
    var lang = view.colors.yellow(subtitle.SubLanguageID);
    return [title, lang].join( view.colors.gray(" - ") );
}

function selectSubtitles(data) {
    var deferred = Q.defer();

    view.selectItem(data.subtitles, "What subtitles to use?").then(function(item) {
        return deferred.resolve({ torrent: data.torrent, subtitles: item });
    });

    return deferred.promise;
}
