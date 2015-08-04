module.exports = function parseArgs(options) {
    if (!options) {
        return '';
    }
    var args = [];
    for (var opt in options) {
        if (options[opt] === true) {
            args.push('--' + opt);
        } else if (options[opt] !== false) {
            args.push('--' + opt + ' ' + options[opt]);
        }
    }
    return args.join(' ').trim();
};