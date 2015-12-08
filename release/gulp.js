/**
 * Note: Should rewrite to make use of Streams
 * Currently N3 supports streaming, JsonLD doesn't
 * The full JsonLD format may not be compatible with streaming, there is a gulp plugin to support this, but it doesn't support all JsonLD files.
 */
var through = require('through2');
var gulp_util_1 = require('gulp-util');
var path = require('path');
var PLUGIN_NAME = 'gulp-rdf-converter';
var parse_1 = require('./lib/parse');
var convert_1 = require('./lib/convert');
var shared_1 = require('./lib/shared');
var shared_2 = require('./lib/shared');
exports.Type = shared_2.Type;
/**
 * This function will convert from a supported RDF format to another (or directly to JS array)
 *
 * destType is the destination file type
 * It has to be of the Type enum and not Unknown.
 */
function convert(outType, options) {
    if (options === void 0) { options = {}; }
    if (!outType)
        throw new gulp_util_1.PluginError(PLUGIN_NAME, 'Missing destination type in function call!');
    return through.obj(function (file, enc, cb) {
        var srcType;
        if (options.overrideSrcType)
            srcType = options.srcType || shared_1.typeFromFile(file.path);
        else
            srcType = shared_1.typeFromFile(file.path) || options.srcType;
        // File is a folder
        if (!file.contents)
            return cb();
        if (!srcType)
            return cb(new gulp_util_1.PluginError(PLUGIN_NAME, "Unrecognised file extension \"" + path.extname(file.path) + "\" in \"" + file.path + "\", please use srcType attribute"));
        if (file.isStream())
            return cb(new gulp_util_1.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        var name = '';
        var defaultGraphName = options.defaultGraphName; // TypeScript won't typecast inside an object
        if (typeof defaultGraphName === 'string')
            name = defaultGraphName;
        else if (typeof defaultGraphName === 'function')
            name = defaultGraphName(file.path);
        parse_1.fromType(file.contents.toString(), srcType)
            .then(function (doc) { return convert_1.setDefaultGraphName(doc, name); })
            .then(function (doc) { return convert_1.toType(doc, outType, options.jsTemplate); })
            .then(function (str) {
            file.contents = new Buffer(str);
            var p = path.parse(file.path);
            var ext = "." + shared_1.Type[outType].toLowerCase();
            p.base = p.base.substr(0, p.base.length - (p.ext.length)) + ext;
            p.ext = ext;
            file.path = path.format(p);
            cb(null, file);
        })
            .catch(function (err) { return cb(err); });
    });
}
exports.convert = convert;
