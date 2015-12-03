// Very Quick and dirty!! Do not reuse!!

declare module N3 {

    export interface Triple {
        subject: string,
        predicate: string,
        object: string,
        graph?: string,
    }

    export interface Options {
        // Options: 'N-triples', 'application/trig'
        format: string;
        prefixes?: Prefixes
    }

    interface Prefixes {
        [prefix: string]: string;
    }

    interface N3Static {
        /**
         * By default, N3.Parser parses a permissive superset of Turtle, TriG, N-Triples and N-Quads.
         * For strict compatibility with any of those languages, pass a format argument upon creation.
         */
        Parser(options?: Options): {
            parse: (ttl: string, callback: (error: any, triple: Triple, prefixes: Prefixes) => void) => void;
        }

        /**
         * By default, N3.Writer writes Turtle (or TriG for triples with a graph property).
         * To write N-Triples (or N-Quads) instead, pass a format argument upon creation:
         */
        Writer(options: Options): Writer;

        Util: Util;
    }

    interface Writer {
        addTriple(subject: string, predicate: string, object: string, graph?: string): void;
        addTriple(triple: Triple): void;

        end(callback: (err: any, result: string) => void): void;
    }

    interface Util {
        isLiteral(value: string): boolean;
        getLiteralLanguage(value: string): string;
        getLiteralValue(value: string): string;
        getLiteralType(value: string): string;

        createLiteral(value: string | number | boolean, type?: string): string

        isBlank(resource: string): boolean // true
        isIRI(resource: string): boolean // false
    }
}


declare var n3: N3.N3Static;

declare module 'n3' {
    export = n3;
}