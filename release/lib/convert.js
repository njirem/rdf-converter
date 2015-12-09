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
function toJS(file, jsTemplate) {
    if (jsTemplate === void 0) { jsTemplate = 'const quads = ${quadArray};\nexport default quads;'; }
    return toNQuads(file)
        .then(function (nquads) { return nquads.split(/\s*\.\s*[\r|\n]/).filter(function (nquads) { return !!nquads; }); })
        .then(function (nquads) { return nquads.map(function (quad) { return ("[\n        " + quadToJS(quad) + "\n    ]"); }); })
        .then(function (nquads) { return ("[\n    " + nquads.join(',') + "\n]"); })
        .then(function (array) { return jsTemplate.replace(/\$\{\s*quadArray\s*\}/, array); });
}
exports.toJS = toJS;
function quadToJS(quad) {
    // Get the array of quad parts, regexp is to catch spaces in quotes
    var quadArr = quad.match(/(?:[^\s"]+|"[^"]*")+/g);
    for (var i = 0; i < 4; i++) {
        var qPart = quadArr[i];
        if (!qPart || n3_1.Util.isBlank(qPart) || qPart === '@default') {
            // Empty === null
            quadArr[i] = 'null';
        }
        else if (qPart[0] === '<' && qPart[qPart.length - 1] === '>') {
            // Remove the '<>' from resources in NQuads
            quadArr[i] = "'" + qPart.slice(1, -1) + "'";
        }
        else {
            var m = qPart.match(/^"(.*)"(?:\^\^<http:\/\/www.w3.org\/2001\/XMLSchema#(.*)>)?$/);
            // If it's a string, it should get quotes
            if (!m[2] || m[2] === 'string')
                quadArr[i] = "'" + qPart + "'";
            else if (m[1])
                quadArr[i] = m[1];
        }
    }
    return quadArr.join(',\n        ');
}
function toType(file, type, jsTemplate) {
    switch (type) {
        case shared_1.Type.Json:
            return toJson(file);
        case shared_1.Type.NQuads:
            return toNQuads(file);
        case shared_1.Type.TriG:
            return toTriG(file);
        case shared_1.Type.JS:
            return toJS(file, jsTemplate);
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
