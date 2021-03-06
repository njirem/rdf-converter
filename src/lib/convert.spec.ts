
import { expect } from 'chai';
import { promises as jsonld } from 'jsonld';
import { join } from 'path';
import { readFile, DocumentData, normalize } from './shared';
import * as parse from './parse';

import * as convert from './convert';

describe('Convert', () => {
    describe('from json input file with triples', testForJson('../../example/data/foaf.json'))
    describe('from json input file with quads', testForJson('../../example/data/named-foaf.json'))

});

function testForJson(jsonDocument: string) {
    return () => {
        let document: DocumentData;
        let normalized: string;

        before('load the exampleJson', () => {
            return readFile(relPath(jsonDocument))
                .then(file => parse.fromJson(file))
                .then(doc => document = doc)
                .then(file => normalize(file.document))
                .then(nquad => normalized = nquad)
        })

        it('should convert to NQuads and back', () => {
            return convert.toNQuads(document)
                .then(parse.fromNQuads)
                .then(file => normalize(file.document))
                .then(norm => expect(norm).to.be.eql(normalized))
        });

        it('should convert to TriG and back', () => {
            return convert.toTriG(document)
                .then(parse.fromTriG)
                .then(file => normalize(file.document))
                .then(norm => expect(norm).to.be.eql(normalized))
        });

        it('should convert to valid JS', () => {
            return convert.toJS(document, { jsTemplate: '${quadArray}' })
                .then(eval)
                .then(value => expect(value).to.be.an('array'));
        });
    }
}

function relPath(path: string) {
    return join(__dirname, path)
}