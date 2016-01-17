var kickass = require('kickass-torrent');
var Q = require('q');
var view = require('./view.js');
var readableSize = require('./readable-size.js');

module.exports.torrent = function torrent(query) {
    var deferred = Q.defer();
    var torrents, torrent;
    searchTorrents(query)
        .then(listTorrents)
        .then(function(searchResults) {
            torrents = searchResults;
            return selectTorrent(torrents);
        })
        .then(function(torrent) {
            deferred.resolve(torrent);
        });

    return deferred.promise;
};

module.exports.query = function query(optionalQuery) {
    return optionalQuery ? Q(optionalQuery) : waitForTorrentInput();
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
    view.renderList(torrents, renderTorrentLine);
    return torrents;
}

function renderTorrentLine(torrent) {
    var title = view.colors.yellow.bold(torrent.title);
    var size = view.colors.cyan(torrent.readableSize);
    var seeds = view.colors.green(torrent.seeds);
    var leechs = view.colors.red(torrent.leechs);
    return [title, size, seeds + '/' + leechs].join( view.colors.gray(" - ") );
}

function selectTorrent(torrents) {
    var deferred = Q.defer();
    view.selectItem(torrents, "What do you want to watch?").then(function(item) {
        deferred.resolve(item);
    });
    return deferred.promise;
}

function waitForTorrentInput() {
    return view.askFor("Search for:");
}
