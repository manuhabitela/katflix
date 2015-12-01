var searchTorrents = require('./src/search-torrents.js');
var view = require('./src/view.js');
var player = require('./src/peerflix.js');
var getSubtitles = require('./src/subtitles.js');
var parseArgs = require('./src/parse-args.js');
var Q = require('q');

var args = require('minimist')(process.argv.slice(2));
args.peerflix = parseArgs.makeObject(args.peerflix || '');

if (args.version || args.v) {
    return view.renderMessage(version());
}

if (args.help || args.h) {
    return view.renderMessage(help());
}

return start(args._[0]);

function version() {
    return "katflix version " + require('./package.json').version;
}

function help() {
    return [
        'Search videos from kickasstorrents, watch them directly thanks to peerflix.',
        '',
        'Usage: katflix [OPTIONS] [QUERY]',
        '',
        'QUERY is your search terms to find the torrents you want.',
        'If you don\'t put it here, katflix will ask you about it when starting.',
        '',
        'Options:',
        '  --help: this message',
        '  --version: katflix\'s version',
        '  --peerflix: options to pass to the peerflix executable',
        '',
        'Examples:',
        '  `katflix --peerflix="--vlc"`',
        '  `katflix --peerflix="--omx" Drive`'
    ].join('\n');
}

function start(searchTerms) {
    var torrent = null;
    var promise = searchTerms ? Q(searchTerms) : view.inputVideoSearchTerms();
    promise
        .then(searchTorrents)
        .then(listTorrents)
        .then(view.selectVideo)
        .then(function(torrent) {
            if (args.subtitles) {
                return getSubtitles(torrent);
            }
            return { torrent: torrent };
        })
        .then(playVideo)
        .catch(view.renderError);
}

function listTorrents(torrents) {
    if (!torrents.length) {
        view.renderWarning('No videos found.');
        return start();
    }

    view.renderTorrents(torrents);
    return torrents;
}

function playVideo(data) {
    var options = args.peerflix;
    if (data.subtitles) {
        options.subtitles = data.subtitles;
    }

    player.play(data.torrent.torrentLink, options);
}