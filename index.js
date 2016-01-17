var view = require('./src/view.js');
var playTorrent = require('./src/peerflix.js');
var getTorrent = require('./src/torrent.js');
var getSubtitles = require('./src/subtitles.js');
var parseArgs = require('./src/parse-args.js');
var minimist = require('minimist');

var args = normalizeArgs();

if (args.version) {
    return view.renderMessage(version());
}

if (args.help) {
    return view.renderMessage(help());
}

return start(args);

function version() {
    return "katflix version " + require('./package.json').version;
}

function help() {
    return [
        'Search videos from kickasstorrents, watch them directly thanks to peerflix.',
        '',
        'Usage: katflix [QUERY] [OPTIONS] [-- PEERFLIX OPTIONS]',
        '',
        'QUERY is your search terms to find the torrents you want.',
        'If no query is given, katflix will ask when starting.',
        '',
        'Options:',
        '  -h, --help: show this message',
        '  -v, --version: show katflix\'s version',
        '  -l, --language: set desired subtitles language to search (defaults to \'eng\')',
        '                  you can pass this option multiple times',
        '',
        'You can pass options to the peerflix binary internally used after --.',
        'Check out the peerflix github page for more details on possible options.',
        '',
        'Examples:',
        '  `katflix -- --vlc` # autoplay the video in vlc',
        '  `katflix Drive` # directly list \'Drive\' results',
        '  `katflix --language spa # search spanish subtitles only',
        '  `katflix -l fre -l eng # search english and french subtitles only',
        '  `katflix -- --omx -- -o local # autoplay in omx with local audio'
    ].join('\n');
}

function start(options) {
    var torrent;
    getTorrent(options.query)
        .then(function(selectedTorrent) {
            torrent = selectedTorrent;
            return getSubtitles(torrent.title, options.language);
        })
        .then(function(subtitles) {
            return playVideo({
                torrent: torrent,
                subtitles: subtitles
            }, options.peerflix);
        })
        .catch(view.renderError);
}

function playVideo(data, options) {
    if (data.subtitles) {
        options.subtitles = data.subtitles;
    }
    playTorrent(data.torrent.torrentLink, options);
}

function normalizeArgs() {
    var args = minimist(process.argv.slice(2), {
        alias: { p: 'peerflix', l: 'language', v: 'version', h: 'help' },
        default: { language: ['eng'] },
        '--': true
    });
    args.peerflix = parseArgs.makeObject(args['--'] || '');
    if (args.language && typeof args.language === "string") {
        args.language = [args.language];
    }
    args.query = args._[0] || null;
    return args;
}