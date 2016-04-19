
import { expect } from 'chai';
import { join } from 'path';
import { DocumentData, logPromise, Type } from './shared';

import * as parse from './parse';
import * as convert from './convert';

const testData = [
    {
        name: 'Boolean Literals',
        files: {
            trig: '<http://animal/cat> <http://type/predator> "true"^^<http://www.w3.org/2001/XMLSchema#boolean>.\n',
            nquads: '<http://animal/cat> <http://type/predator> "true"^^<http://www.w3.org/2001/XMLSchema#boolean>.\n',
            js: `[
    [
        '<http://animal/cat>',
        '<http://type/predator>',
        '"true"^^<http://www.w3.org/2001/XMLSchema#boolean>',
        null
    ]
]`,
            jsCompact: `[
    [
        '<http://animal/cat>',
        '<http://type/predator>',
        'true',
        null
    ]
]`,
            json: `{
    "@id": "http://animal/cat",
    "http://type/predator": {
        "@type": "http://www.w3.org/2001/XMLSchema#boolean",
        "@value": "true"
    }
}`,
        }
    },
    {
        name: 'Integer Literals',
        files: {
            trig: '<http://animal/cat> <http://count> "2"^^<http://www.w3.org/2001/XMLSchema#integer>.\n',
            nquads: '<http://animal/cat> <http://count> "2"^^<http://www.w3.org/2001/XMLSchema#integer>.\n',
            js: `[
    [
        '<http://animal/cat>',
        '<http://count>',
        '"2"^^<http://www.w3.org/2001/XMLSchema#integer>',
        null
    ]
]`,
            jsCompact: `[
    [
        '<http://animal/cat>',
        '<http://count>',
        '2',
        null
    ]
]`,
            json: `{
    "@id": "http://animal/cat",
    "http://count": {
        "@type": "http://www.w3.org/2001/XMLSchema#integer",
        "@value": "2"
    }
}`,
        }
    },
    {
        name: 'String Literals',
        files: {
            trig: '<http://animal/cat> <http://name> "Fluffy"^^<http://www.w3.org/2001/XMLSchema#string>.\n',
            nquads: '<http://animal/cat> <http://name> "Fluffy"^^<http://www.w3.org/2001/XMLSchema#string>.\n',
            js: `[
    [
        '<http://animal/cat>',
        '<http://name>',
        '"Fluffy"^^<http://www.w3.org/2001/XMLSchema#string>',
        null
    ]
]`,
            jsCompact: `[
    [
        '<http://animal/cat>',
        '<http://name>',
        '"Fluffy"',
        null
    ]
]`,
            json: `{
    "@id": "http://animal/cat",
    "http://name": "Fluffy"
}`,
        }
    },
    {
        name: 'Relations',
        files: {
            trig: '<http://animal/cat> <http://rel/pet> <http://animal/human>.\n',
            nquads: '<http://animal/cat> <http://rel/pet> <http://animal/human>.\n',
            js: `[
    [
        '<http://animal/cat>',
        '<http://rel/pet>',
        '<http://animal/human>',
        null
    ]
]`,
            jsCompact: `[
    [
        '<http://animal/cat>',
        '<http://rel/pet>',
        '<http://animal/human>',
        null
    ]
]`,
            json: `{
    "@id": "http://animal/cat",
    "http://rel/pet": {
        "@id": "http://animal/human"
    }
}`,
        }
    },
]

describe('E2E Conversion', () => {
    testData.forEach(test => {
        describe(`should convert ${test.name} correctly`, () => {
            describe('from a trig document', testConversion(test.files, Type.TriG))
            describe('from an nquad document', testConversion(test.files, Type.NQuads))
            describe('from a json document', testConversion(test.files, Type.Json))
        })
    })
});

function testConversion(files: Files, type: Type) {
    return () => {
        let doc: DocumentData;
        before('get DocumentData', () => {
            return parse.fromType(files[Type[type].toLowerCase()], type)
                .then(d => doc = d);
        })

        it('to trig', () => {
            return convert.toTriG(doc)
                .then(output => expect(output).to.be.equal(files.trig))
        });

        it('to nq', () => {
            return convert.toNQuads(doc)
                .then(output => expect(output).to.be.equal(files.nquads))
        });

        it('to json', () => {
            return convert.toJson(doc)
                .then(output => expect(output).to.be.equal(files.json))
        });

        it('to js', () => {
            return convert.toJS(doc, { jsTemplate: '${quadArray}' })
                .then(output => expect(output).to.be.equal(files.js))
        });

        it('to compact js', () => {
            return convert.toJS(doc, { jsTemplate: '${quadArray}', compact: true })
                .then(output => expect(output).to.be.equal(files.jsCompact))
        });
    }
}

interface Files {
    trig: string;
    nquads: string;
    js: string;
    jsCompact: string;
    json: string;
}