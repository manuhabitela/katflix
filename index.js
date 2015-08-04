#!/usr/bin/env node
var args = require('minimist')(process.argv.slice(2));
var defaults = require('lodash.defaults');
var search = require('./src/search.js');
var view = require('./src/view.js');
var player = require('./src/peerflix.js');
var getSubtitles = require('./src/subtitles.js');

defaults(args, {
    player: 'omx',
    verbose: true
});



start();

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
    var subtitles = getSubtitles(torrent.title, { 'language': 'fr' }, { verbose: args.verbose });
    var options = {};

    if (subtitles) {
        options.subtitles = "\"" + subtitles + "\"";
    }

    if (args.player) {
        options[args.player] = true;
    }

    player.play(torrent.torrentLink, options);
}

