var spawn = require('child_process').spawn;
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
        bin: "peerflix"
    });
}

function parsePeerflixArgs(options) {
    return parseArgs.makeString(options).split(' ');
}
}
