import {readFile as fsRead, writeFile as fsWrite} from 'fs';
import { extname } from 'path';
import {  } from 'jsonld';
import { Util } from 'n3'

export interface DocumentData {
    context?: JsonLD.Context;
    document: JsonLD.Document
}

export function n3ToJsonldTriple(n3: N3.Triple): JsonLD.Triple {
    return {
        object: n3ToJsonldResource(n3.object),
        predicate: n3ToJsonldResource(n3.predicate),
        subject: n3ToJsonldResource(n3.subject),
    }
}
function n3ToJsonldResource(n3String: string): JsonLD.Resource {
    if (Util.isLiteral(n3String)) {
        return { type: 'literal', value: Util.getLiteralValue(n3String), datatype: Util.getLiteralType(n3String) }
    } else {
        return { type: 'IRI', value: n3String }
    }
}

export function jsonldToN3Quads(json: JsonLD.Document) {
    let out: N3.Triple[] = []
    for (var name in json) {
        json[name].forEach(jsTriple => {
            let n3Triple: N3.Triple = {
                object: jsonldToN3Resource(jsTriple.object),
                predicate: jsonldToN3Resource(jsTriple.predicate),
                subject: jsonldToN3Resource(jsTriple.subject),
            }
            if (name !== '@default') n3Triple.graph = name;
            out.push(n3Triple);
        })
    }
    return out;
}
function jsonldToN3Resource(json: JsonLD.Resource): string {
    if (json.type === 'IRI') {
        return json.value;
    } else {
        return Util.createLiteral(json.value)
    }
}

export function writeFile(filename: string, data: any) {
    return new Promise<string>((resolve, reject) => {
        fsWrite(filename, data, { encoding: 'utf8' }, err => {
            if (err) reject(err)
            else resolve();
        })
    })
}

export function readFile(path: string) {
    return new Promise<string>((resolve, reject) => {
        fsRead(path, 'utf8', (err, data) => {
            if (err) reject(err);
            else resolve(data);
        })
    })
}

export function readFiles(...paths: string[]) {
    return Promise.all(paths.map(readFile))
}

// For runtime (gulp) this enum can't be a const
export enum Type {
    Unknown,
    TriG,
    NQuads,
    Json,
    // This type is output only!!
    JS
}

export function typeFromFile(filename: string) {
    return typeFromString(extname(filename.toLowerCase()).substr(1))
}

export function typeFromString(str: string): Type {
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
            return Type.NQuads

        case 'json':
        case 'jsonld':
            return Type.Json;

        default:
            return Type.Unknown;
    }
}

export function logPromise(annotation: string) {
    return (val: any) => {
        console.log(`\n${annotation}:`)
        if (typeof val === 'object') {
            console.log(JSON.stringify(val, null, 2));
        } else {
            console.log(val);
        }
        return val;
    }
}