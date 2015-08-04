var spawn = require('child_process').spawn;
var path = require('path');
var execSync = require('child_process').execSync;
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
    return parseArgs.makeString(options).split(' ');
}

function getPeerflixBin() {
    var binPath;
    try {
        binPath = execSync('npm bin', { encoding: 'utf8' }).trim();
    } catch (e) {
        console.log("Error when getting peerflix executable: " + e.message);
        return false;
    }
    return path.join(binPath, 'peerflix');
}
