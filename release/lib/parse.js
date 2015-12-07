var jsonld_1 = require('jsonld');
var n3_1 = require('n3');
var shared_1 = require('./shared');
function n3Parser(input, format) {
    return new Promise(function (resolve, reject) {
        var out = {
            document: {}
        };
        n3_1.Parser({ format: format }).parse(input, function (err, triple, context) {
            if (err)
                reject(err);
            else if (triple) {
                var graphName = !n3_1.Util.isBlank(triple.graph) && triple.graph || '@default';
                if (!out.document[graphName])
                    out.document[graphName] = [];
                out.document[graphName].push(shared_1.n3ToJsonldTriple(triple));
            }
            else {
                out.context = context || {};
                resolve(out);
            }
        });
    });
}
function fromTriG(trig) {
    return n3Parser(trig, 'application/trig');
}
exports.fromTriG = fromTriG;
function fromNQuads(nquads) {
    return n3Parser(nquads, 'N-Quads');
}
exports.fromNQuads = fromNQuads;
function fromJson(json) {
    var parsedJson = JSON.parse(json);
    var context = parsedJson["@context"] || {};
    return jsonld_1.promises.normalize(parsedJson)
        .then(function (document) {
        for (var name_1 in document) {
            if (n3_1.Util.isBlank(name_1)) {
                if (!document['@default'])
                    document['@default'] = [];
                (_a = document['@default']).push.apply(_a, document[name_1]);
                delete document[name_1];
            }
            return document;
        }
        var _a;
    })
        .then(function (document) { return { document: document, context: context }; });
}
exports.fromJson = fromJson;
function fromType(file, type) {
    switch (type) {
        case shared_1.Type.Json:
            return fromJson(file);
        case shared_1.Type.NQuads:
            return fromNQuads(file);
        case shared_1.Type.TriG:
            return fromTriG(file);
    }
}
exports.fromType = fromType;
