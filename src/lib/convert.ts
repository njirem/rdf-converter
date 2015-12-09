import { promises as jsonld } from 'jsonld';
import { Parser, Writer, Util } from 'n3';

import { Type, DocumentData, jsonldToN3Quads } from './shared';

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

export interface JsOptions {
    jsTemplate?: string;
    compact?: boolean;
}
export function toJS(file: DocumentData, jsOptions: JsOptions = {}): Promise<string> {
    let jsTemplate = jsOptions.jsTemplate || 'const quads = ${quadArray};\nexport default quads;';
    let compact = jsOptions.compact || false;

    return toNQuads(file)
        .then(nquads => nquads.split(/\s*\.\s*[\r|\n]/).filter(nquads => !!nquads))
        .then(nquads => nquads.map(quad => `[\n        ${quadToJS(quad, compact) }\n    ]`))
        .then(nquads => `[\n    ${nquads.join(',') }\n]`)
        .then(array => jsTemplate.replace(/\$\{\s*quadArray\s*\}/, array))
}

function quadToJS(quad: string, compact = false) {
    // Get the array of quad parts, regexp is to catch spaces in quotes
    let quadArr = quad.match(/(?:[^\s"]+|"[^"]*")+/g)

    for (let i = 0; i < 4; i++) {
        let qPart = quadArr[i];

        if (!qPart || Util.isBlank(qPart) || qPart === '@default') {
            // Empty === null
            quadArr[i] = 'null';
            continue;
        }

        if (compact && Util.isLiteral(qPart)) {
            // TODO: The probably is a better way to do this..
            if (Util.getLiteralType(qPart).match(/^[<]?http:\/\/www.w3.org\/2001\/XMLSchema#(.*)[>]?$/)[1] === 'string') {
                quadArr[i] = `"${Util.getLiteralValue(qPart) }"`;
            } else {
                quadArr[i] = Util.getLiteralValue(qPart)
            }
        }
        quadArr[i] = `'${quadArr[i]}'`;
    }


    return quadArr.join(',\n        ')
}

export function toType(file: DocumentData, type: Type, jsOptions?: JsOptions) {
    switch (type) {
        case Type.Json:
            return toJson(file);

        case Type.NQuads:
            return toNQuads(file);

        case Type.TriG:
            return toTriG(file)

        case Type.JS:
            return toJS(file, jsOptions);
    }
}

export function setDefaultGraphName(file: DocumentData, graphName: string): DocumentData {
    if (!graphName) return file;

    if (!file.document[graphName]) file.document[graphName] = []
    file.document[graphName].push(...file.document['@default']);
    delete file.document['@default']
    return file;
}


