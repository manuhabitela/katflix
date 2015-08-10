var search = require('./src/search.js');
var view = require('./src/view.js');
var player = require('./src/peerflix.js');
var getSubtitles = require('./src/subtitles.js');
var parseArgs = require('./src/parse-args.js');
var Q = require('q');

var args = require('minimist')(process.argv.slice(2));
args.peerflix = parseArgs.makeObject(args.peerflix || '');
args.subliminal = parseArgs.makeObject(args.subliminal || '');

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
        'Search videos from kickasstorrents, watch them directly thanks to peerflix,',
        'with subtitles downloaded through subliminal.',
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
        '  --subliminal: options to pass to the subliminal executable',
        '',
        'Examples:',
        '  `katflix --peerflix="--vlc" --subliminal="--language fr"`',
        '  `katflix --peerflix="--omx" Drive`',
        '',
        'The subliminal/language option is required if you want subtitles.'
    ].join('\n');
}

function start(searchTerms) {
    var waitForQuery = searchTerms ? Q(searchTerms) : view.inputSearchTerms();
    waitForQuery
        .then(search)
        .then(listTorrents, view.renderError);
}

function listTorrents(torrents) {
    if (!torrents.length) {
        view.renderWarning('No videos found.');
        return start();
    }

    view.renderTorrents(torrents);
    view.selectVideo(torrents).then(
        playVideo
    );
}

function playVideo(torrent) {
    var subtitles = getSubtitles(torrent.title, args.subliminal);
    var options = args.peerflix;

    if (subtitles) {
        options.subtitles = subtitles;
    }

    player.play(torrent.torrentLink, options);
}