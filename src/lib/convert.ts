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
        .then(nquads => {
            let quadArrays = nquads
                .split(/\s*\.\s*[\r|\n]/)
                .filter(nquads => !!nquads)
                .map(quad => `[\n        ${quadToJS(quad, compact)}\n    ]`);
            let array = `[\n    ${quadArrays.join(',')}\n]`;
            return jsTemplate.replace(/\$\{\s*quadArray\s*\}/, array)
        });
}

function quadToJS(quad: string, compact = false) {
    // Get the array of quad parts, regexp is to catch spaces in quotes
    let parts = quad.match(/(?:[^\s"]|"(?:[^"\\]|\\.)*")+/g);
    while (parts.length < 4) parts.push(null);
    return parts
        .map((part, index) => {
            if (part == null || index === 3 && (part === '@default' || Util.isBlank(part))) {
                return 'null';
            }

            if (compact && Util.isLiteral(part)) {
                let type = Util.getLiteralType(part);
                if (/^<?http:\/\/www.w3.org\/2001\/XMLSchema#string>?$/.test(type)) {
                    return `'"${escape(Util.getLiteralValue(part))}"'`;
                } else {
                    return `'${escape(Util.getLiteralValue(part))}'`;
                }
            }

            return `'${escape(part)}'`;
        })
        .join(',\n        ');
}

function escape(s: string) {
    return s.replace(/\\/, '\\\\').replace(/'/g, '\\\'');
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
