var chalk = require('chalk');
var inquirer = require('inquirer');
var Q = require('q');
module.exports = {};

module.exports.inputSearchTerms = function inputSearchTerms() {
    var deferred = Q.defer();

    inquirer.prompt([{
        name: "search",
        message: "Search for:",
    }], function(input) {
        return deferred.resolve(input.search);
    });

    return deferred.promise;
};

module.exports.renderTorrents = function renderTorrents(torrentsList) {
    console.log(
        torrentsList.map(function(torrent, n) {
            return lineNumber(n+1) + ' ' + torrentListItem(torrent);
        }).join('\n')
    );
};

function lineNumber(index) {
    index = index > 9 ? index : ' ' + index;
    return chalk.dim.magenta.bold(index);
}

function torrentListItem(torrent) {
    var title = chalk.yellow.bold(torrent.title);
    var size = chalk.cyan(torrent.readableSize);
    var seeds = chalk.green(torrent.seeds);
    var leechs = chalk.red(torrent.leechs);
    return [title, size, seeds + '/' + leechs].join( chalk.gray(" - ") );
}

module.exports.selectVideo = function selectVideo(torrents) {
    var deferred = Q.defer();

    inquirer.prompt([{
        name: "video",
        message: "What video do you want to watch (type the corresponding number)?",
        validate: function(val) {
            var number = val*1;
            if (!isNaN(val) && number >= 1 && number <= torrents.length+1) {
                return true;
            }
            return "Please enter a valid number between 1 and " + (torrents.length);
        }
    }], function(selection) {
        return deferred.resolve(torrents[selection.video-1]);
    });

    return deferred.promise;
};


module.exports.renderWarning = function renderWarning(message) {
    console.log(chalk.yellow.bold(message));
};

module.exports.renderError = function renderError(message) {
    console.log(chalk.red.bold(message));
};

module.exports.renderMessage = function renderMessage(message) {
    console.log(message);
};
