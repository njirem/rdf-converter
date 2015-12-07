import { expect } from 'chai';
import { readFiles, logPromise } from './shared';
import { promises as jsonld } from 'jsonld';
import { join } from 'path';

import * as parse from './parse';

const filePaths = [
    '../../example/data/named-foaf.trig',
    '../../example/data/named-foaf.json',
    '../../example/data/named-foaf.nq',
]

describe('Input', () => {
    const files = { trig: '', json: '', nquads: '' }

    before('Read the source files', () => {
        return readFiles(...filePaths.map(relPath))
            .then(f => [files.trig, files.json, files.nquads] = f)
    })

    it('should be able to parse ttl', () => {
        return parse.fromTriG(files.trig)
    });

    it('should be able to parse jsonLd', () => {
        return parse.fromJson(files.json)
    });

    it('should be able to parse nquad', () => {
        return parse.fromNQuads(files.nquads)
    });

    describe('should produce the same nquads', () => {
        const normalized = { ttl: {}, json: {}, nquads: {} }

        before('parse all the files', () => {
            return Promise.all([
                parse.fromJson(files.json)
                    .then(file => jsonld.normalize(file.document))
                    .then(norm => normalized.json = norm),
                parse.fromNQuads(files.nquads)
                    .then(file => jsonld.normalize(file.document))
                    .then(norm => normalized.nquads = norm),
                parse.fromTriG(files.trig)
                    .then(file => jsonld.normalize(file.document))
                    .then(norm => normalized.ttl = norm),
            ])
        })

        it('from nQuads and json', () => {
            expect(normalized.nquads).to.be.eql(normalized.json);
        });

        it('from nQuads and TriG', () => {
            expect(normalized.nquads).to.be.eql(normalized.ttl);
        });
    });

})

function relPath(path: string) {
    return join(__dirname, path)
}