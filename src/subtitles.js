var Q = require('q');
var subtitler = require('subtitler');
var gunzip = require('gunzip-maybe');
var fs = require('fs');
var http = require('http');
var os = require('os');
var view = require('./view.js');

module.exports = function subtitles(torrent) {
    var deferred = Q.defer();

    waitForSubtitlesInput(torrent)
        .then(fetchSubtitles)
        .then(view.renderSubtitles)
        .then(view.selectSubtitles)
        .then(downloadSubtitles)
        .then(function(data) {
            return deferred.resolve(data);
        });

    return deferred.promise;
};

function waitForSubtitlesInput(torrent) {
    var deferred = Q.defer();

    view.askFor("Search subtitles:", {
        defaultAnswer: torrent.title
    }).then(function(input) {
        return deferred.resolve({
            torrent: torrent,
            subtitles: input
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
            }
        }).then(function(res) {
            subtitler.api.logout(res.token);
            return deferred.resolve(res.list);
        })
    })

    return deferred.promise;
};
