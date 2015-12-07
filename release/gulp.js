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
 * destType is the destination file type
 * It has to be of the Type enum and not Unknown.
 *
 * srcType is the optional source file type
 * if not given it has to be read from the file extension it will throw if it's not recognised
 *
 * nameGraph is the graphName for triples that don't have a graphName yet. (TODO: not implemented yet!!)
 */
function convert(destType, overrideSrcType, nameGraph) {
    if (!destType)
        throw new gulp_util_1.PluginError(PLUGIN_NAME, 'Missing destination type in function call!');
    return through.obj(function (file, enc, cb) {
        var srcType = overrideSrcType || shared_1.typeFromFile(file.path);
        // File is a folder
        if (!file.contents)
            return cb();
        if (!srcType)
            return cb(new gulp_util_1.PluginError(PLUGIN_NAME, "Unrecognised file extension \"" + path.extname(file.path) + "\" in \"" + file.path + "\", please use srcType attribute"));
        if (file.isStream())
            return cb(new gulp_util_1.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
        var name = '';
        if (typeof nameGraph === 'string')
            name = nameGraph;
        else if (typeof nameGraph === 'function')
            name = nameGraph(file.path);
        parse_1.fromType(file.contents.toString(), srcType)
            .then(function (doc) { return convert_1.setDefaultGraphName(doc, name); })
            .then(function (doc) { return convert_1.toType(doc, destType); })
            .then(function (str) {
            file.contents = new Buffer(str);
            var p = path.parse(file.path);
            var ext = "." + shared_1.Type[destType].toLowerCase();
            p.base = p.base.substr(0, p.base.length - (p.ext.length)) + ext;
            p.ext = ext;
            file.path = path.format(p);
            cb(null, file);
        })
            .catch(function (err) { return cb(err); });
    });
}
exports.convert = convert;
