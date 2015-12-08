import { promises as jsonld } from 'jsonld';
import { Parser, Writer, Util } from 'n3';

import { Type, DocumentData, jsonldToN3Quads, logPromise } from './shared';

export function toJson(file: DocumentData): Promise<string> {
    if (file.context['']) delete file.context['']; // JSON-LD doesn't support the empty prefix
    return jsonld.fromRDF(file.document)
        .then(doc => jsonld.compact(doc, file.context))
        .then(doc => JSON.stringify(doc, null, 4))
}

function n3Writer(file: DocumentData, format: string) {
    let doc = jsonldToN3Quads(file.document)
    return new Promise((resolve, reject) => {
        let w = Writer({ format: format, prefixes: file.context });
        doc.forEach(triple => w.addTriple(triple))
        w.end((err, result) => {
            if (err) reject(err);
            else resolve(result);
        })
    })
}

export function toTriG(file: DocumentData): Promise<string> {
    return n3Writer(file, 'application/trig');
}

export function toNQuads(file: DocumentData): Promise<string> {
    return n3Writer(file, 'N-Quads');
}


export function toJS(file: DocumentData, jsTemplate = 'const quads = ${quadArray};\nexport default quads;'): Promise<string> {
    return toNQuads(file)
        .then(nquads => nquads.split(/\s*\.\s*[\r|\n]/).filter(nquads => !!nquads))
        .then(nquads => nquads.map(quad => `[\n        ${quadToJS(quad) }\n    ]`))
        .then(nquads => `[\n    ${nquads.join(',') }\n]`)
        .then(array => jsTemplate.replace(/\$\{\s*quadArray\s*\}/, array))
}
function quadToJS(quad: string) {
    // Get the array of quad parts, regexp is to catch spaces in quotes
    let quadArr = quad.match(/(?:[^\s"]+|"[^"]*")+/g)
    // Remove the '<>' from resources in NQuads
        .map(resource => (resource[0] === '<' && resource[resource.length - 1] === '>') ? resource.slice(1, -1) : resource)

    for (let i = quadArr.length; i < 4; i++) quadArr.push(null);

    return quadArr.map(quadPart => (!quadPart || Util.isBlank(quadPart) || quadPart === '@default') ? 'null' : `'${quadPart}'`)
        .join(',\n        ')
}

export function toType(file: DocumentData, type: Type, jsTemplate?: string) {
    switch (type) {
        case Type.Json:
            return toJson(file);

        case Type.NQuads:
            return toNQuads(file);

        case Type.TriG:
            return toTriG(file)

        case Type.JS:
            return toJS(file, jsTemplate);
    }
}

export function setDefaultGraphName(file: DocumentData, graphName: string): DocumentData {
    if (!graphName) return file;

    if (!file.document[graphName]) file.document[graphName] = []
    file.document[graphName].push(...file.document['@default']);
    delete file.document['@default']
    return file;
}

