var kickass = require('kickass-torrent');
var Q = require('q');
var view = require('./view.js');
var readableSize = require('./readable-size.js');

module.exports = function torrent(query) {
    var deferred = Q.defer();

    (query ? Q(query) : view.inputVideoSearchTerms())
        .then(searchTorrents)
        .then(listTorrents)
        .then(view.selectVideo)
        .then(function(torrent) {
            deferred.resolve({ torrent: torrent });
        });

    return deferred.promise;
}

function searchTorrents(query) {
    var deferred = Q.defer();
    kickass({ q: query }, function(err, response) {
        if (err) {
            deferred.reject(err);
            return false;
        }

        var torrents = parseSearchResponse(response.list);

        return deferred.resolve(torrents);
    });

    return deferred.promise;
}

function parseSearchResponse(list) {
    return list.filter(function(item) {
        item.readableSize = readableSize(item.size);
        return isVideo(item);
    });
}

function isVideo(torrent) {
    return torrent.category === "TV" || torrent.category === "Movies";
}

function listTorrents(torrents) {
    view.renderTorrents(torrents);
    return torrents;
}
