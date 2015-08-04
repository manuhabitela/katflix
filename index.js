var search = require('./src/search.js');
var view = require('./src/view.js');
var player = require('./src/peerflix.js');
var getSubtitles = require('./src/subtitles.js');
var parseArgs = require('./src/parse-args.js');

var args = require('minimist')(process.argv.slice(2));
args.peerflix = parseArgs.makeObject(args.peerflix || '');
args.subliminal = parseArgs.makeObject(args.subliminal || '');

if (args.help) {
    return help();
}

return start();

function help() {
    console.log([
        'Search videos from kickasstorrents, watch them directly thanks to peerflix,',
        'with subtitles downloaded through subliminal.',
        '',
        'Usage: katflix [options]',
        '',
        'Options:',
        '  --peerflix: options to pass to the peerflix executable',
        '  --subliminal: options to pass to the subliminal executable',
        '',
        'Example:',
        '  `katflix --peerflix="--vlc" --subliminal="--language fr"`',
        '',
        'The subliminal/language option is required if you want subtitles.'
    ].join('\n'));
}

function start() {
    view.inputSearchTerms()
        .then(search)
        .then(listTorrents, view.renderError);
}

function listTorrents(torrents) {
    if (!torrents.length) {
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
        options.subtitles = "\"" + subtitles + "\"";
    }

    if (args.player) {
        options[args.player] = true;
    }

    player.play(torrent.torrentLink, options);
}

