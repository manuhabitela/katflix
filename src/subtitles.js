var Q = require('q');
var searchSubtitles = require('./search-subtitles.js');
var view = require('./view.js');
var gunzip = require('gunzip-maybe');
var fs = require('fs');
var http = require('http');
var os = require('os');

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

    askFor(torrent).then(function(input) {
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

function askFor(torrent) {
    return view.askFor("Search subtitles:", {
        defaultAnswer: torrent.title
    });
}
