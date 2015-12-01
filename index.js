var view = require('./src/view.js');
var playTorrent = require('./src/peerflix.js');
var getTorrent = require('./src/torrent.js');
var getSubtitles = require('./src/subtitles.js');
var parseArgs = require('./src/parse-args.js');

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
    getTorrent(searchTerms || null)
        .then(getSubtitles)
        .then(playVideo)
        .catch(view.renderError);
}

function playVideo(data) {
    var options = args.peerflix;
    if (data.subtitles) {
        options.subtitles = data.subtitles;
    }

    playTorrent(data.torrent.torrentLink, options);
}
