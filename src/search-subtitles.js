var subtitler = require('subtitler');
var Q = require('q');

module.exports = function search(title, language) {
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

