
import { expect } from 'chai';
import { promises as jsonld } from 'jsonld';
import { join } from 'path';
import { readFile, DocumentData } from './shared';
import * as parse from './parse';

import * as convert from './convert';

describe('Convert', () => {
    describe('from json input file with triples', testForJson('../../example/data/foaf.json'))
    describe('from json input file with quads', testForJson('../../example/data/named-foaf.json'))
});

// FIXME: Something is wrong with this test, normalized JsonLD to nquads don't produce the right code
function testForJson(jsonDocument: string) {
    return () => {
        let document: DocumentData;
        let normalized: JsonLD.Document;

        before('load the exampleJson', () => {
            return readFile(relPath(jsonDocument))
                .then(file => parse.fromJson(file))
                .then(doc => document = doc)
                .then(file => jsonld.normalize(file.document))
                .then(nquad => normalized = nquad)
        })

        it('should convert to NQuads and back', () => {
            return convert.toNQuads(document)
                .then(parse.fromNQuads)
                .then(file => jsonld.normalize(file.document))
                .then(norm => expect(norm).to.be.eql(normalized))
        });

        it('should convert to TriG and back', () => {
            return convert.toTriG(document)
                .then(parse.fromTriG)
                .then(file => jsonld.normalize(file.document))
                .then(norm => expect(norm).to.be.eql(normalized))
        });
    }
}


function relPath(path: string) {
    return join(__dirname, path)
}