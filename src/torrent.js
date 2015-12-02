var kickass = require('kickass-torrent');
var Q = require('q');
var view = require('./view.js');
var readableSize = require('./readable-size.js');

module.exports = function torrent(query) {
    var deferred = Q.defer();

    (query ? Q(query) : waitForTorrentInput())
        .then(searchTorrents)
        .then(listTorrents)
        .then(selectTorrent)
        .then(function(torrent) {
            deferred.resolve({ torrent: torrent });
        });

    return deferred.promise;
};

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
    return view.selectItem(torrents, "What do you want to watch?");
}

function waitForTorrentInput() {
    return view.askFor("Search for:");
}
