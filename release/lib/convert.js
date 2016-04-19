"use strict";
var jsonld_1 = require('jsonld');
var n3_1 = require('n3');
var shared_1 = require('./shared');
function toJson(file) {
    if (file.context[''])
        delete file.context['']; // JSON-LD doesn't support the empty prefix
    return jsonld_1.promises.fromRDF(file.document)
        .then(function (doc) { return jsonld_1.promises.compact(doc, file.context); })
        .then(function (doc) { return JSON.stringify(doc, null, 4); });
}
exports.toJson = toJson;
function n3Writer(file, format) {
    var doc = shared_1.jsonldToN3Quads(file.document);
    return new Promise(function (resolve, reject) {
        var w = n3_1.Writer({ format: format, prefixes: file.context });
        doc.forEach(function (triple) { return w.addTriple(triple); });
        w.end(function (err, result) {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
}
function toTriG(file) {
    return n3Writer(file, 'application/trig');
}
exports.toTriG = toTriG;
function toNQuads(file) {
    return n3Writer(file, 'N-Quads');
}
exports.toNQuads = toNQuads;
function toJS(file, jsOptions) {
    if (jsOptions === void 0) { jsOptions = {}; }
    var jsTemplate = jsOptions.jsTemplate || 'const quads = ${quadArray};\nexport default quads;';
    var compact = jsOptions.compact || false;
    return toNQuads(file)
        .then(function (nquads) {
        var quadArrays = nquads
            .split(/\s*\.\s*[\r|\n]/)
            .filter(function (nquads) { return !!nquads; })
            .map(function (quad) { return ("[\n        " + quadToJS(quad, compact) + "\n    ]"); });
        var array = "[\n    " + quadArrays.join(',') + "\n]";
        return jsTemplate.replace(/\$\{\s*quadArray\s*\}/, array);
    });
}
exports.toJS = toJS;
function quadToJS(quad, compact) {
    if (compact === void 0) { compact = false; }
    // Get the array of quad parts, regexp is to catch spaces in quotes
    var parts = quad.match(/(?:[^\s"]|"(?:[^"\\]|\\.)*")+/g);
    while (parts.length < 4)
        parts.push(null);
    return parts
        .map(function (part, index) {
        if (part == null || index === 3 && (part === '@default' || n3_1.Util.isBlank(part))) {
            return 'null';
        }
        if (compact && n3_1.Util.isLiteral(part)) {
            var type = n3_1.Util.getLiteralType(part);
            if (/^<?http:\/\/www.w3.org\/2001\/XMLSchema#string>?$/.test(type)) {
                return "'\"" + escape(n3_1.Util.getLiteralValue(part)) + "\"'";
            }
            else {
                return "'" + escape(n3_1.Util.getLiteralValue(part)) + "'";
            }
        }
        return "'" + escape(part) + "'";
    })
        .join(',\n        ');
}
function escape(s) {
    return s.replace(/\\/, '\\\\').replace(/'/g, '\\\'');
}
function toType(file, type, jsOptions) {
    switch (type) {
        case shared_1.Type.Json:
            return toJson(file);
        case shared_1.Type.NQuads:
            return toNQuads(file);
        case shared_1.Type.TriG:
            return toTriG(file);
        case shared_1.Type.JS:
            return toJS(file, jsOptions);
    }
}
exports.toType = toType;
function setDefaultGraphName(file, graphName) {
    if (!graphName)
        return file;
    if (!file.document[graphName])
        file.document[graphName] = [];
    (_a = file.document[graphName]).push.apply(_a, file.document['@default']);
    delete file.document['@default'];
    return file;
    var _a;
}
exports.setDefaultGraphName = setDefaultGraphName;
