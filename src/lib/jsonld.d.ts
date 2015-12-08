// Very Quick and dirty!! Do not reuse!!

declare module JsonLD {

    type JsonObject = {};

    interface Document {
        [name: string]: Triple[]
    }
    interface Triple {
        subject: Resource;
        predicate: Resource;
        object: Resource;
    }

    // TODO: Check this
    interface Resource {
        type: string;
        datatype?: string;
        value: string;
    }

    interface Context {
        [index: string]: string;
    }

    export interface Options {
        format: string;
    }

    interface JsonLDStatic {
        // compact a document according to a particular context
        // see: http://json-ld.org/spec/latest/json-ld/#compacted-document-form
        compact(docUrl: string, contextUrl: string, callback: (err: any, compacted: JsonObject) => void): void;
        compact(doc: JsonObject, context: Context, callback: (err: any, compacted: JsonObject) => void): void;

        // expand a document, removing its context
        // see: http://json-ld.org/spec/latest/json-ld/#expanded-document-form
        expand(compactedUrl: string, callback: (err: any, expanded: JsonObject) => void): void;
        expand(compacted: JsonObject, callback: (err: any, expanded: JsonObject) => void): void;

        // flatten a document
        // see: http://json-ld.org/spec/latest/json-ld/#flattened-document-form
        flatten(docUrl: string, callback: (err: any, flattened: JsonObject) => void): void;
        flatten(doc: JsonObject, callback: (err: any, flattened: JsonObject) => void): void;


        // frame a document
        // see: http://json-ld.org/spec/latest/json-ld-framing/#introduction
        // frame()
        normalize(docUrl: string, options: Options, callback: (err: any, normalized: JsonObject | string) => void): void;
        normalize(doc: JsonObject, options: Options, callback: (err: any, normalized: JsonObject | string) => void): void;

        // serialize a document to N-Quads (RDF)
        toRDF(doc: Document, options: Options, callback: (err: any, nquads: string) => void): void;

        // deserialize N-Quads (RDF) to JSON-LD
        fromRDF(nquads: string, options: Options, callback: (err: any, doc: Document) => void): void;

        // register a custom synchronous RDF parser
        registerRDFParser(contentType: string, func: (input: string) => Document): void;
        // register a custom async-callback-based RDF parser
        registerRDFParser(contentType: string, func: (input: string, callback: (err: any, dataset: Document) => void) => void): void;

        // Api based on ES6 Promises
        promises: {
            // compact a document according to a particular context
            // see: http://json-ld.org/spec/latest/json-ld/#compacted-document-form
            compact(docUrl: string, contextUrl: string): Promise<JsonObject>;
            compact(doc: JsonObject, context: Context): Promise<JsonObject>;

            // expand a document, removing its context
            // see: http://json-ld.org/spec/latest/json-ld/#expanded-document-form
            expand(compactedUrl: string): Promise<JsonObject>;
            expand(compacted: JsonObject): Promise<JsonObject>;

            // flatten a document
            // see: http://json-ld.org/spec/latest/json-ld/#flattened-document-form
            flatten(docUrl: string): Promise<JsonObject>;
            flatten(doc: JsonObject): Promise<JsonObject>;

            // frame a document
            // see: http://json-ld.org/spec/latest/json-ld-framing/#introduction
            // frame()
            normalize(docUrl: string): Promise<JsonObject>;
            normalize(doc: JsonObject): Promise<JsonObject>;
            normalize(docUrl: string, options: Options): Promise<string>;
            normalize(doc: JsonObject, options: Options): Promise<string>;
            normalize(doc: JsonObject | string, options?: Options): Promise<JsonObject | string>;

            // serialize a document to N-Quads (RDF)
            toRDF(doc: Document, options: Options): Promise<string>;

            // deserialize N-Quads (RDF) to JSON-LD
            fromRDF(nquads: string, options?: Options): Promise<Document>;
            fromRDF(nquads: Document, options?: Options): Promise<JsonObject>;
            fromRDF(nquads: Document | string, options?: Options): Promise<Document | string>;

            // register a custom synchronous RDF parser
            registerRDFParser(contentType: string, func: (input: string) => Document): void;
            // register a custom async-callback-based RDF parser
            registerRDFParser(contentType: string, func: (input: string) => Promise<Document>): void;
        }
    }
}


declare var jsonld: JsonLD.JsonLDStatic;

declare module 'jsonld' {
    export = jsonld;
}