var chalk = require('chalk');
var inquirer = require('inquirer');
var Q = require('q');
module.exports = {};

module.exports.inputVideoSearchTerms = function inputSearchTerms() {
    return module.exports.askFor("Search for:");
};

module.exports.askFor = function askFor(message, opts) {
    opts = opts || {};
    var options = { defaultAnswer: opts.defaultAnswer || null };

    var deferred = Q.defer();

    inquirer.prompt([{
        name: "search",
        message: message,
        "default": options.defaultAnswer
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

module.exports.renderSubtitles = function renderSubtitles(data) {
    var subtitlesList = data.subtitles;
    console.log(
        subtitlesList.map(function(subtitle, n) {
            return lineNumber(n+1) + ' ' + subtitleListItem(subtitle);
        }).join('\n')
    );
    return data;
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

function subtitleListItem(subtitle) {
    var title = chalk.cyan(subtitle.SubFileName);
    var lang = chalk.yellow(subtitle.SubLanguageID);
    return [title, lang].join( chalk.gray(" - ") );
}

module.exports.selectVideo = function selectVideo(torrents) {
    return selectItem(torrents, "What do you want to watch?");
};

module.exports.selectSubtitles = function selectSubtitles(data) {
    var deferred = Q.defer();
    selectItem(data.subtitles, "What subtitles to use?").then(function(item) {
        return deferred.resolve({ torrent: data.torrent, subtitles: item });
    });

    return deferred.promise;
};

function selectItem(list, message) {
    var deferred = Q.defer();

    inquirer.prompt([{
        name: "item",
        message: message + " Type the corresponding number:",
        validate: function(val) {
            var number = val*1;
            if (!isNaN(val) && number >= 1 && number <= list.length+1) {
                return true;
            }
            return "Please enter a valid number between 1 and " + (list.length);
        }
    }], function(selection) {
        return deferred.resolve(list[selection.item-1]);
    });

    return deferred.promise;
}

module.exports.renderWarning = function renderWarning(message) {
    console.log(chalk.yellow.bold(message));
};

module.exports.renderError = function renderError(message) {
    console.log(chalk.red.bold(message));
};

module.exports.renderMessage = function renderMessage(message) {
    console.log(message);
};
