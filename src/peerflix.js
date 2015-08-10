var spawn = require('child_process').spawn;
var path = require('path');
var execSync = require('child_process').execSync;
var binPath = require('bin-path')(require);
var defaults = require('lodash.defaults');
var parseArgs = require('./parse-args.js');
module.exports = {};

module.exports.play = function play(url, peerflixArguments, options) {
    var opts = parseOptions(options);
    var peerflixArgs = parsePeerflixArgs(peerflixArguments);
    peerflixArgs.unshift(url);

    spawn(opts.bin, peerflixArgs, { stdio: 'inherit' });
};

function parseOptions(options) {
    return defaults(options || {}, {
        bin: getPeerflixBin()
    });
}

function parsePeerflixArgs(options) {
    return parseArgs.makeArray(options);
}

function getPeerflixBin() {
    var peerflix = binPath('peerflix');
    return peerflix.peerflix;
}
