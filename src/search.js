var kickass = require('kickass-torrent');
var Q = require('q');
var readableSize = require('./readable-size.js');

module.exports = function search(query) {
    var deferred = Q.defer();
    kickass(query, function(err, response) {
        if (err) {
            deferred.reject(err);
            return false;
        }

        var torrents = parseResponse(response.list);

        return deferred.resolve(torrents);
    });

    return deferred.promise;
};

function parseResponse(list) {
    return list.filter(function(item) {
        item.readableSize = readableSize(item.size);
        return isVideo(item);
    });
}

function isVideo(torrent) {
    return torrent.category === "TV" || torrent.category === "Movies";
}
