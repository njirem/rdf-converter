"use strict";
var fs_1 = require('fs');
var path_1 = require('path');
var jsonld_1 = require('jsonld');
var n3_1 = require('n3');
function n3ToJsonldTriple(n3) {
    return {
        object: n3ToJsonldResource(n3.object),
        predicate: n3ToJsonldResource(n3.predicate),
        subject: n3ToJsonldResource(n3.subject),
    };
}
exports.n3ToJsonldTriple = n3ToJsonldTriple;
function n3ToJsonldResource(n3String) {
    if (n3_1.Util.isLiteral(n3String)) {
        return { type: 'literal', value: n3_1.Util.getLiteralValue(n3String), datatype: n3_1.Util.getLiteralType(n3String) };
    }
    else {
        return { type: 'IRI', value: n3String };
    }
}
function jsonldToN3Quads(json) {
    var out = [];
    for (var name in json) {
        json[name].forEach(function (jsTriple) {
            var n3Triple = {
                object: jsonldToN3Resource(jsTriple.object),
                predicate: jsonldToN3Resource(jsTriple.predicate),
                subject: jsonldToN3Resource(jsTriple.subject),
            };
            if (name !== '@default')
                n3Triple.graph = name;
            out.push(n3Triple);
        });
    }
    return out;
}
exports.jsonldToN3Quads = jsonldToN3Quads;
function jsonldToN3Resource(json) {
    if (json.type === 'IRI') {
        return json.value;
    }
    else if (json.datatype.lastIndexOf('string') === json.datatype.length - 6) {
        // datatype is string
        return n3_1.Util.createLiteral(json.value);
    }
    else {
        // datatype is (probably) boolean or integer
        return n3_1.Util.createLiteral(json.value, json.datatype);
    }
}
function writeFile(filename, data) {
    return new Promise(function (resolve, reject) {
        fs_1.writeFile(filename, data, { encoding: 'utf8' }, function (err) {
            if (err)
                reject(err);
            else
                resolve();
        });
    });
}
exports.writeFile = writeFile;
function readFile(path) {
    return new Promise(function (resolve, reject) {
        fs_1.readFile(path, 'utf8', function (err, data) {
            if (err)
                reject(err);
            else
                resolve(data);
        });
    });
}
exports.readFile = readFile;
function readFiles() {
    var paths = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        paths[_i - 0] = arguments[_i];
    }
    return Promise.all(paths.map(readFile));
}
exports.readFiles = readFiles;
// For runtime (gulp) this enum can't be a const
(function (Type) {
    Type[Type["Unknown"] = 0] = "Unknown";
    Type[Type["TriG"] = 1] = "TriG";
    Type[Type["NQuads"] = 2] = "NQuads";
    Type[Type["Json"] = 3] = "Json";
    // This type is output only!!
    Type[Type["JS"] = 4] = "JS";
})(exports.Type || (exports.Type = {}));
var Type = exports.Type;
function typeFromFile(filename) {
    return typeFromString(path_1.extname(filename.toLowerCase()).substr(1));
}
exports.typeFromFile = typeFromFile;
function typeFromString(str) {
    switch (str) {
        case 'ttl':
        case 'trig':
            return Type.TriG;
        case 'nq':
        case 'nquad':
        case 'nquads':
        case 'nt':
        case 'ntriple':
        case 'ntriples':
            return Type.NQuads;
        case 'json':
        case 'jsonld':
            return Type.Json;
        default:
            return Type.Unknown;
    }
}
exports.typeFromString = typeFromString;
function logPromise(annotation) {
    return function (val) {
        console.log("\n" + annotation + ":");
        if (typeof val === 'object') {
            console.log(JSON.stringify(val, null, 2));
        }
        else {
            console.log(val);
        }
        return val;
    };
}
exports.logPromise = logPromise;
/**
 * Normalize documents so that the same information produces the same unique output
 */
function normalize(doc) {
    return jsonld_1.promises.fromRDF(doc)
        .then(function (doc) { return jsonld_1.promises.normalize(doc, { format: 'application/nquads' }); });
}
exports.normalize = normalize;
