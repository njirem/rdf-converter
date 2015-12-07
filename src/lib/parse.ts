import { promises as jsonld } from 'jsonld';
import { Parser, Writer, Util } from 'n3';

import { Type, DocumentData, n3ToJsonldTriple } from './shared';

function n3Parser(input: string, format: string) {
    return new Promise<DocumentData>((resolve, reject) => {
        let out: DocumentData = {
            document: {},
            context: {}
        }

        Parser({ format: format }).parse(input, (err, triple, context) => {
            if (err) reject(err);
            else if (triple) {
                let graphName = !Util.isBlank(triple.graph) && triple.graph || '@default';
                if (!out.document[graphName]) out.document[graphName] = [];
                out.document[graphName].push(n3ToJsonldTriple(triple));
            } else {
                out.context = context || out.context;
                resolve(out);
            }
        })
    })
}

export function fromTriG(trig: string) {
    return n3Parser(trig, 'application/trig');
}

export function fromNQuads(nquads: string) {
    return n3Parser(nquads, 'N-Quads');
}

export function fromJson(json: string) {
    let parsedJson = JSON.parse(json);
    let context = parsedJson["@context"] || {};

    return jsonld.normalize(parsedJson)
        .then(document => {
            for (let name in document) {
                if (Util.isBlank(name)) {
                    if (!document['@default']) document['@default'] = [];
                    document['@default'].push(...document[name])
                    delete document[name];
                }
                return document
            }
        })
        .then(document => <DocumentData>{ document, context })
}


export function fromType(file: string, type: Type) {
    switch (type) {
        case Type.Json:
            return fromJson(file);

        case Type.NQuads:
            return fromNQuads(file);

        case Type.TriG:
            return fromTriG(file)
    }
}
