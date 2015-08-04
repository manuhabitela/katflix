var os = require('os');
var path = require('path');
var spawnSync = require('child_process').spawnSync;
var execSync = require('child_process').execSync;
var defaults = require('lodash.defaults');
var parseArgs = require('./parse-args.js');

module.exports = function getSubtitles(torrentName, subliminalArguments, options) {
    var opts = parseOptions(options);
    var subliminalArgs = parseSubliminalArgs(subliminalArguments);

    console.log("Trying to download subtitles...");

    if (!downloadSubtitlesFile(torrentName, subliminalArgs, opts)) {
        return '';
    }

    var subtitlesFile = retrieveSubtitlesFile(opts.tmpDir);

    console.log(subtitlesFile.length ?
        "Found (hopefully) matching subtitles: " + subtitlesFile :
        "Didn't find any matching subtitles."
    );

    return subtitlesFile;
};

function parseOptions(options) {
    return defaults(options || {}, {
        tmpDir: os.tmpdir(),
        bin: "subliminal"
    });
}

function parseSubliminalArgs(options) {
    var subliminalArguments = parseArgs.makeString(options);
    return ('-s ' + subliminalArguments).split(' ');
}

function downloadSubtitlesFile(torrentName, subliminalArguments, options) {
    var opts = parseOptions(options);
    subliminalArguments.unshift('download');
    subliminalArguments.push(torrentName);
    try {
        spawnSync(opts.bin, subliminalArguments, { cwd: opts.tmpDir, stdio: 'inherit' });
    } catch (e) {
        console.log("Error when executing subliminal: " + e.message);
        return false;
    }
    return true;
}

function retrieveSubtitlesFile(dir) {
    //we assume the file created by subliminal is the last .srt file in the given dir
    //we get all the srt files in the temp dir and keep the last created
    //we might need to do better than this... but I find no sure way of getting the
    //specific file created by subliminal directly
    var files;
    try {
        files = execSync('ls -1At *.srt', { cwd: dir, encoding: 'utf8' }).trim();
    } catch (e) {
        console.log("Error when trying to retrieve subtitle file: " + e.message);
        return '';
    }
    files = files.split('\n'); //each file is on its own line (-1 option of ls) so we split by newline
    var filename = files[0]; //ls is ordered by modification time (-i option) so we get the first file of list
    return path.join(dir, filename);
}
